/*
 * Proyecto IoT: cuna inteligente
 * Placa: ESP32 DevKit (simulada en Wokwi)
 *
 * Sensores: DHT22 (temperatura y humedad), MPU6050 (movimiento de la cuna),
 *           cuatro controles deslizantes que hacen de sensor de sonido (llanto),
 *           balanza (peso del bebe), MQ2 (gas y humo) y panal mojado.
 *           El simulador no trae sensor de sonido ni balanza manejable a mano.
 * Actuadores: servo (mecer), rele (ventilador), buzzer, LED, pantalla OLED.
 * Red: WiFi simulado de Wokwi y MQTT con un broker publico.
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <DHT.h>
#include <ESP32Servo.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// Identificador propio para que los topicos no se mezclen con otros proyectos
const char* CRADLE_ID = "lcolina";
const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASS = "";
const char* MQTT_HOST = "broker.hivemq.com";
const int MQTT_PORT = 1883;

// Pines
const int PIN_DHT = 15;
const int PIN_SOUND = 34;
const int PIN_GAS = 35;
const int PIN_WET = 32;
const int PIN_WEIGHT = 33;
const int PIN_SERVO = 18;
const int PIN_FAN = 26;
const int PIN_BUZZER = 25;
const int PIN_LED = 27;
// Botones de simulacion, cada uno alterna una situacion
const int PIN_BTN_CRY = 13;
const int PIN_BTN_WET = 14;
const int PIN_BTN_GAS = 16;
const int PIN_BTN_BABY = 17;

const int MPU_ADDR = 0x68;

// Situaciones forzadas desde los botones o desde el panel, para la demostracion
bool simCry = false;
bool simWet = false;
bool simGas = false;
bool simHeat = false;
bool simBaby = false;
bool lastBtn[4] = {HIGH, HIGH, HIGH, HIGH};
unsigned long tBtn = 0;

DHT dht(PIN_DHT, DHT22);
Servo rocker;
Adafruit_SSD1306 oled(128, 64, &Wire, -1);
WiFiClient wifiClient;
PubSubClient mqtt(wifiClient);

// Umbrales ajustables por MQTT
int cryLevel = 2000;          // lectura del sensor de sonido (0 a 4095) que cuenta como llanto
int gasLevel = 1800;
int wetLevel = 2000;
float fanOnTemp = 26.0;       // el ventilador prende a esta temperatura
float fanOffTemp = 24.5;      // y apaga a esta, para que no parpadee
float coldTemp = 20.0;
float hotTemp = 28.0;
float minHumidity = 40.0;
float presenceKg = 1.0;       // por debajo de este peso se considera cuna vacia

// Tiempos. TIME_SCALE vale 1 y solo se cambia para acelerar las pruebas automaticas
#ifndef TIME_SCALE
#define TIME_SCALE 1
#endif
const unsigned long CRY_CONFIRM_MS = 2000 / TIME_SCALE;     // el ruido debe durar esto para ser llanto
const unsigned long CALM_MS = 20000 / TIME_SCALE;           // silencio necesario para dar por calmado al bebe
const unsigned long LEVEL2_MS = 60000 / TIME_SCALE;         // si sigue llorando sube la intensidad
const unsigned long ALERT_MS = 180000 / TIME_SCALE;         // llanto prolongado, se avisa a los padres
const unsigned long ROCK_MAX_MS = 300000 / TIME_SCALE;      // el balanceo se detiene a los 5 minutos
const unsigned long ROCK_REST_MS = 120000 / TIME_SCALE;     // descanso antes de volver a mecer solo

// Estado
float temperature = NAN;
float humidity = NAN;
float weightKg = 0;
float moveG = 0;              // desviacion de la aceleracion respecto a 1 g
int soundLevel = 0;
int gasValue = 0;
int wetValue = 0;
bool babyPresent = false;
bool crying = false;
bool wet = false;
bool gasAlarm = false;
bool fanOn = false;
bool fanAuto = true;
int rockLevel = 0;            // 0 detenido, 1 suave, 2 firme, 3 fuerte
bool rockManual = false;
unsigned long rockStart = 0;
unsigned long rockBlockedUntil = 0;
unsigned long loudSince = 0;
unsigned long quietSince = 0;
unsigned long cryStart = 0;
bool longCryReported = false;
bool tempAlertSent = false;
bool humAlertSent = false;

unsigned long tSensors = 0;
unsigned long tPublish = 0;
unsigned long tScreen = 0;
unsigned long tRock = 0;
unsigned long tBeep = 0;
unsigned long tMqtt = 0;
int servoAngle = 90;
int servoStep = 1;

String baseTopic;

void publishEvent(const char* text) {
  Serial.print("Evento: ");
  Serial.println(text);
  if (mqtt.connected()) {
    mqtt.publish((baseTopic + "/event").c_str(), text);
  }
}

void beep(int freq, int ms) {
  tone(PIN_BUZZER, freq, ms);
}

float readMotion() {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B);
  if (Wire.endTransmission(false) != 0) return moveG;
  Wire.requestFrom(MPU_ADDR, 6);
  if (Wire.available() < 6) return moveG;
  int16_t ax = (Wire.read() << 8) | Wire.read();
  int16_t ay = (Wire.read() << 8) | Wire.read();
  int16_t az = (Wire.read() << 8) | Wire.read();
  float gx = ax / 16384.0;
  float gy = ay / 16384.0;
  float gz = az / 16384.0;
  float magnitude = sqrt(gx * gx + gy * gy + gz * gz);
  return fabs(magnitude - 1.0);
}

void setRock(int level, bool manual) {
  if (level == rockLevel && manual == rockManual) return;
  if (level > 0 && rockLevel == 0) rockStart = millis();
  if (level > 0 && level != rockLevel && !manual) {
    publishEvent(level == 1 ? "Mecido suave" : "Mecido firme");
  }
  rockLevel = level;
  rockManual = manual && level > 0;
  if (level == 0) {
    rocker.write(90);
    servoAngle = 90;
  }
}

void readSensors() {
  // Sonido: se toma el maximo de varias muestras para no perder los picos
  int peak = 0;
  for (int i = 0; i < 20; i++) {
    int v = analogRead(PIN_SOUND);
    if (v > peak) peak = v;
  }
  soundLevel = peak;
  gasValue = analogRead(PIN_GAS);
  wetValue = analogRead(PIN_WET);
  moveG = readMotion();

  // La balanza es un deslizante de 0 a 8 kg
  weightKg = analogRead(PIN_WEIGHT) * 8.0 / 4095.0;
  babyPresent = weightKg >= presenceKg;

  float t = dht.readTemperature();
  float h = dht.readHumidity();
  if (!isnan(t)) temperature = t;
  if (!isnan(h)) humidity = h;

  // Las situaciones forzadas reemplazan la lectura de los deslizantes
  if (simCry) soundLevel = 3600;
  if (simWet) wetValue = 3200;
  if (simGas) gasValue = 3200;
  if (simBaby && weightKg < presenceKg) weightKg = 4.0;
  if (simBaby) babyPresent = true;
  if (simHeat && !isnan(temperature)) temperature = max(temperature, 30.0f);
}

void toggleSim(int which) {
  const char* names[] = {"llanto", "panal mojado", "gas", "bebe en la cuna"};
  bool* flags[] = {&simCry, &simWet, &simGas, &simBaby};
  *flags[which] = !*flags[which];
  String msg = String("Simulacion de ") + names[which] + (*flags[which] ? " activada" : " desactivada");
  publishEvent(msg.c_str());
}

void readButtons() {
  if (millis() - tBtn < 50) return;
  tBtn = millis();
  int pins[] = {PIN_BTN_CRY, PIN_BTN_WET, PIN_BTN_GAS, PIN_BTN_BABY};
  for (int i = 0; i < 4; i++) {
    bool now = digitalRead(pins[i]);
    if (lastBtn[i] == HIGH && now == LOW) toggleSim(i);
    lastBtn[i] = now;
  }
}

void updateCry() {
  unsigned long now = millis();
  bool loud = soundLevel >= cryLevel;

  // Si el bebe sale de la cuna se termina el llanto y se detiene el mecido automatico
  if (!babyPresent && crying) {
    crying = false;
    loudSince = 0;
    if (!rockManual) setRock(0, false);
    publishEvent("Cuna vacia, se detiene el mecido");
  }

  if (loud) {
    quietSince = 0;
    if (loudSince == 0) loudSince = now;
    if (!crying && babyPresent && now - loudSince >= CRY_CONFIRM_MS) {
      crying = true;
      cryStart = now;
      longCryReported = false;
      publishEvent("Llanto detectado");
    }
  } else {
    loudSince = 0;
    if (quietSince == 0) quietSince = now;
    if (crying && now - quietSince >= CALM_MS) {
      crying = false;
      publishEvent("El bebe se calmo");
      if (!rockManual) setRock(0, false);
    }
  }

  if (!crying) return;

  // Escalada: suave al inicio, firme al minuto, aviso a los padres a los tres minutos
  unsigned long duration = now - cryStart;
  if (!rockManual && now >= rockBlockedUntil) {
    if (duration >= LEVEL2_MS) setRock(2, false);
    else setRock(1, false);
  }
  if (duration >= ALERT_MS && !longCryReported) {
    longCryReported = true;
    publishEvent("Llanto prolongado, revisar al bebe");
    beep(1800, 600);
  }
}

void updateRocking() {
  unsigned long now = millis();
  if (rockLevel == 0) return;

  // Limite de 5 minutos continuos y descanso
  if (now - rockStart >= ROCK_MAX_MS) {
    setRock(0, false);
    rockBlockedUntil = now + ROCK_REST_MS;
    publishEvent("Balanceo detenido a los 5 minutos");
    return;
  }

  int amplitude = rockLevel == 1 ? 12 : (rockLevel == 2 ? 22 : 32);
  int periodMs = rockLevel == 1 ? 25 : (rockLevel == 2 ? 15 : 10);
  if (now - tRock < (unsigned long)periodMs) return;
  tRock = now;
  servoAngle += servoStep;
  if (servoAngle >= 90 + amplitude) servoStep = -1;
  if (servoAngle <= 90 - amplitude) servoStep = 1;
  rocker.write(servoAngle);
}

void updateEnvironment() {
  if (!isnan(temperature)) {
    if (fanAuto) {
      if (temperature >= fanOnTemp) fanOn = true;
      else if (temperature <= fanOffTemp) fanOn = false;
    }
    bool tempBad = temperature >= hotTemp || temperature <= coldTemp;
    if (tempBad && !tempAlertSent) {
      tempAlertSent = true;
      publishEvent(temperature >= hotTemp ? "Cuarto demasiado caliente" : "Cuarto demasiado frio");
    }
    if (!tempBad && temperature < hotTemp - 1 && temperature > coldTemp + 1) tempAlertSent = false;
  }
  if (!isnan(humidity)) {
    bool humBad = humidity < minHumidity;
    if (humBad && !humAlertSent) {
      humAlertSent = true;
      publishEvent("Humedad baja en el cuarto");
    }
    if (!humBad && humidity > minHumidity + 3) humAlertSent = false;
  }
  digitalWrite(PIN_FAN, fanOn ? HIGH : LOW);

  bool nowWet = wetValue >= wetLevel;
  if (nowWet && !wet) {
    wet = true;
    publishEvent("Panal mojado");
    beep(1200, 300);
  } else if (!nowWet && wetValue < wetLevel - 500) {
    wet = false;
  }

  bool nowGas = gasValue >= gasLevel;
  if (nowGas && !gasAlarm) {
    gasAlarm = true;
    publishEvent("Gas o humo detectado");
  } else if (!nowGas && gasValue < gasLevel - 400) {
    gasAlarm = false;
  }

  if (gasAlarm && millis() - tBeep > 700) {
    tBeep = millis();
    beep(2200, 400);
  }
  digitalWrite(PIN_LED, (crying || wet || gasAlarm) ? HIGH : LOW);
}

void handleCommand(String cmd) {
  cmd.trim();
  cmd.toLowerCase();
  if (cmd.startsWith("rock:")) {
    int level = cmd.substring(5).toInt();
    if (level < 0) level = 0;
    if (level > 3) level = 3;
    setRock(level, level > 0);
    if (level == 0) rockBlockedUntil = millis() + 30000;
    publishEvent(level == 0 ? "Balanceo detenido desde el celular" : "Balanceo iniciado desde el celular");
  } else if (cmd == "fan:on") {
    fanAuto = false;
    fanOn = true;
  } else if (cmd == "fan:off") {
    fanAuto = false;
    fanOn = false;
  } else if (cmd == "fan:auto") {
    fanAuto = true;
  } else if (cmd.startsWith("cry:")) {
    cryLevel = cmd.substring(4).toInt();
  } else if (cmd.startsWith("temp:")) {
    fanOnTemp = cmd.substring(5).toFloat();
    fanOffTemp = fanOnTemp - 1.5;
  } else if (cmd == "beep") {
    beep(1500, 300);
  } else if (cmd.startsWith("sim:")) {
    // sim:cry, sim:wet, sim:gas, sim:baby alternan la situacion, sim:heat fuerza calor, sim:off limpia todo
    String what = cmd.substring(4);
    if (what == "cry") toggleSim(0);
    else if (what == "wet") toggleSim(1);
    else if (what == "gas") toggleSim(2);
    else if (what == "baby") toggleSim(3);
    else if (what == "heat") {
      simHeat = !simHeat;
      publishEvent(simHeat ? "Simulacion de calor activada" : "Simulacion de calor desactivada");
    } else if (what == "off") {
      simCry = simWet = simGas = simHeat = simBaby = false;
      publishEvent("Simulaciones desactivadas");
    }
  }
}

void onMessage(char* topic, byte* payload, unsigned int length) {
  String text;
  for (unsigned int i = 0; i < length; i++) text += (char)payload[i];
  handleCommand(text);
}

void connectWifi() {
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  unsigned long t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < 15000) {
    delay(250);
  }
}

void keepMqtt() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWifi();
    return;
  }
  if (mqtt.connected()) return;
  if (millis() - tMqtt < 5000) return;
  tMqtt = millis();
  String clientId = String("cuna-") + CRADLE_ID + "-" + String((uint32_t)esp_random(), HEX);
  if (mqtt.connect(clientId.c_str())) {
    mqtt.subscribe((baseTopic + "/cmd").c_str());
    publishEvent("Cuna conectada");
  }
}

void publishState() {
  if (!mqtt.connected()) return;
  char buf[400];
  snprintf(buf, sizeof(buf),
           "{\"t\":%.1f,\"h\":%.0f,\"sound\":%d,\"kg\":%.1f,\"move\":%.2f,\"gas\":%d,\"wet\":%d,"
           "\"cry\":%d,\"rock\":%d,\"fan\":%d,\"auto\":%d,\"baby\":%d,\"up\":%lu,"
           "\"sc\":%d,\"sw\":%d,\"sg\":%d,\"sh\":%d,\"sb\":%d}",
           isnan(temperature) ? 0.0 : temperature, isnan(humidity) ? 0.0 : humidity,
           soundLevel, weightKg, moveG, gasValue, wetValue,
           crying ? 1 : 0, rockLevel, fanOn ? 1 : 0, fanAuto ? 1 : 0, babyPresent ? 1 : 0,
           millis() / 1000,
           simCry ? 1 : 0, simWet ? 1 : 0, simGas ? 1 : 0, simHeat ? 1 : 0, simBaby ? 1 : 0);
  mqtt.publish((baseTopic + "/state").c_str(), buf, true);
}

void drawScreen() {
  oled.clearDisplay();
  oled.setTextSize(1);
  oled.setTextColor(SSD1306_WHITE);
  oled.setCursor(0, 0);
  if (gasAlarm) oled.print("ALERTA GAS/HUMO");
  else if (crying) oled.print("LLORANDO");
  else if (!babyPresent) oled.print("Cuna vacia");
  else oled.print("Bebe tranquilo");

  oled.setCursor(0, 12);
  oled.printf("T %.1fC  H %.0f%%", isnan(temperature) ? 0.0 : temperature, isnan(humidity) ? 0.0 : humidity);
  oled.setCursor(0, 24);
  oled.printf("Peso %.1f kg", weightKg);
  oled.setCursor(0, 36);
  oled.printf("Mecer %d  Vent %s", rockLevel, fanOn ? "ON" : "off");
  oled.setCursor(0, 48);
  oled.print(wet ? "Panal MOJADO" : "Panal seco");
  oled.print(mqtt.connected() ? "  net" : "  --");

  int bar = map(soundLevel, 0, 4095, 0, 127);
  oled.drawRect(0, 58, 128, 6, SSD1306_WHITE);
  oled.fillRect(0, 58, bar, 6, SSD1306_WHITE);
  oled.display();
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_FAN, OUTPUT);
  pinMode(PIN_LED, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_BTN_CRY, INPUT_PULLUP);
  pinMode(PIN_BTN_WET, INPUT_PULLUP);
  pinMode(PIN_BTN_GAS, INPUT_PULLUP);
  pinMode(PIN_BTN_BABY, INPUT_PULLUP);
  analogReadResolution(12);

  Wire.begin(21, 22);
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x6B);
  Wire.write(0);
  Wire.endTransmission();

  dht.begin();

  rocker.setPeriodHertz(50);
  rocker.attach(PIN_SERVO, 500, 2400);
  rocker.write(90);

  oled.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  oled.clearDisplay();
  oled.setTextSize(1);
  oled.setTextColor(SSD1306_WHITE);
  oled.setCursor(0, 20);
  oled.print("Cuna inteligente");
  oled.setCursor(0, 34);
  oled.print("Conectando...");
  oled.display();

  baseTopic = String("ucv6565/cuna/") + CRADLE_ID;
  mqtt.setServer(MQTT_HOST, MQTT_PORT);
  mqtt.setCallback(onMessage);
  connectWifi();
}

void loop() {
  unsigned long now = millis();
  keepMqtt();
  mqtt.loop();

  if (now - tSensors >= 200) {
    tSensors = now;
    readSensors();
    updateCry();
    updateEnvironment();
  }
  updateRocking();
  readButtons();

  if (now - tPublish >= 2000) {
    tPublish = now;
    publishState();
  }
  if (now - tScreen >= 500) {
    tScreen = now;
    drawScreen();
  }
}
