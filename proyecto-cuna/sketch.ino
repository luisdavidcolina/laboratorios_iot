/*
 * Proyecto IoT: cuna inteligente
 * Placa: ESP32 DevKit (simulada en Wokwi)
 *
 * Sensores: DHT22 (temperatura y humedad), MPU6050 (movimiento de la cuna),
 *           cuatro controles deslizantes que hacen de sensor de sonido (llanto),
 *           balanza (peso del bebe), MQ2 (gas y humo) y panal mojado.
 *           El simulador no trae sensor de sonido ni balanza manejable a mano.
 * Actuadores: servo (mecer), rele (ventilador), buzzer, LED, pantalla OLED.
 * Red: WiFi simulado de Wokwi, MQTT con un broker publico y avisos al telefono
 *      por ntfy.
 */

#include <WiFi.h>
#include <HTTPClient.h>
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
const int WIFI_CHANNEL = 6;   // indicar el canal evita el escaneo y ahorra unos 4 segundos
const char* MQTT_HOST = "broker.hivemq.com";
const int MQTT_PORT = 1883;

// Avisos al telefono: se publican en ntfy.sh/ucv6565-cuna-<CRADLE_ID>, no usan token
const char* NTFY_BASE = "http://ntfy.sh/ucv6565-cuna-";
const unsigned long NOTICE_GAP_MS = 30000;   // minimo entre dos avisos del mismo tipo

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

// Avisos pendientes de enviar al telefono. Estos tipos van antes de la primera funcion
// porque Arduino declara las funciones justo ahi
enum NoticeType { NOTICE_GAS, NOTICE_CRY, NOTICE_WET, NOTICE_MOVE, NOTICE_COUNT };
struct PhoneNotice {
  char body[48];
  char tags[20];
  int priority;
};

// Situaciones forzadas desde los botones o desde el panel, para la demostracion
bool simCry = false;
bool simWet = false;
bool simGas = false;
bool simHeat = false;
bool simBaby = false;
bool simTempOn = false;
float simTemp = 0;
bool lastBtn[4] = {HIGH, HIGH, HIGH, HIGH};
unsigned long tBtn = 0;

DHT dht(PIN_DHT, DHT22);
Servo rocker;
Adafruit_SSD1306 oled(128, 64, &Wire, -1, 400000UL, 400000UL);
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
float moveAlarmG = 0.5;       // desviacion respecto a 1 g que cuenta como movimiento brusco
float moveRearmG = 0.2;       // el aviso se rearma cuando baja de este valor

// Tiempos. TIME_SCALE vale 1 y solo se cambia al compilar para acelerar las pruebas automaticas
#ifndef TIME_SCALE
#define TIME_SCALE 1
#endif
const unsigned long CRY_CONFIRM_MS = 2000 / TIME_SCALE;     // el ruido debe durar esto para ser llanto
const unsigned long CALM_MS = 20000 / TIME_SCALE;           // silencio necesario para dar por calmado al bebe
const unsigned long LEVEL2_MS = 60000 / TIME_SCALE;         // si sigue llorando sube la intensidad
const unsigned long ALERT_MS = 180000 / TIME_SCALE;         // llanto prolongado, se avisa a los padres
const unsigned long ROCK_MAX_MS = 300000 / TIME_SCALE;      // el balanceo se detiene a los 5 minutos
const unsigned long ROCK_REST_MS = 120000 / TIME_SCALE;     // descanso antes de volver a mecer solo
const unsigned long MANUAL_STOP_MS = 30000 / TIME_SCALE;    // pausa tras detener el mecido desde el panel

// El modo demo divide los tiempos entre 10 sin recompilar, para exponerlos en vivo
int timeFactor = 1;

unsigned long scaled(unsigned long ms) {
  return ms / timeFactor;
}

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
bool moveAlarm = false;
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
unsigned long buzzerUntil = 0;
int servoAngle = 90;
int servoStep = 1;
uint32_t lastStateSig = 0;
uint32_t lastScreenSig = 0;

String baseTopic;
String ntfyUrl;

// La red corre en su propia tarea. mqttReady indica de quien es el cliente MQTT en cada
// momento: con false solo lo usa netTask, con true solo lo usa loop. Asi una reconexion
// lenta nunca detiene los sensores, el mecido ni las alarmas.
volatile bool mqttReady = false;

QueueHandle_t noticeQueue;
unsigned long lastNotice[NOTICE_COUNT] = {0, 0, 0, 0};

void publishEvent(const char* text) {
  Serial.print("Evento: ");
  Serial.println(text);
  if (mqttReady) {
    mqtt.publish((baseTopic + "/event").c_str(), text);
  }
}

// Encola el aviso y vuelve de inmediato. El envio lo hace netTask
void notifyPhone(NoticeType type, const char* body, const char* tags, int priority) {
  unsigned long now = millis();
  if (lastNotice[type] != 0 && now - lastNotice[type] < NOTICE_GAP_MS) return;
  lastNotice[type] = now;
  PhoneNotice n;
  strlcpy(n.body, body, sizeof(n.body));
  strlcpy(n.tags, tags, sizeof(n.tags));
  n.priority = priority;
  xQueueSend(noticeQueue, &n, 0);
}

void beep(int freq, int ms) {
  tone(PIN_BUZZER, freq, ms);
  buzzerUntil = millis() + ms;
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
  if (simTempOn) temperature = simTemp;
  if (simHeat && !isnan(temperature)) temperature = max(temperature, 30.0f);
}

void setSim(int which, bool on) {
  const char* names[] = {"llanto", "panal mojado", "gas", "bebe en la cuna"};
  bool* flags[] = {&simCry, &simWet, &simGas, &simBaby};
  if (*flags[which] == on) return;
  *flags[which] = on;
  String msg = String("Simulacion de ") + names[which] + (on ? " activada" : " desactivada");
  publishEvent(msg.c_str());
}

void toggleSim(int which) {
  bool* flags[] = {&simCry, &simWet, &simGas, &simBaby};
  setSim(which, !*flags[which]);
}

void setSimHeat(bool on) {
  if (simHeat == on) return;
  simHeat = on;
  publishEvent(on ? "Simulacion de calor activada" : "Simulacion de calor desactivada");
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
    if (!crying && babyPresent && now - loudSince >= scaled(CRY_CONFIRM_MS)) {
      crying = true;
      cryStart = now;
      longCryReported = false;
      publishEvent("Llanto detectado");
    }
  } else {
    loudSince = 0;
    if (quietSince == 0) quietSince = now;
    if (crying && now - quietSince >= scaled(CALM_MS)) {
      crying = false;
      publishEvent("El bebe se calmo");
      if (!rockManual) setRock(0, false);
    }
  }

  if (!crying) return;

  // Escalada: suave al inicio, firme al minuto, aviso a los padres a los tres minutos
  unsigned long duration = now - cryStart;
  if (!rockManual && now >= rockBlockedUntil) {
    if (duration >= scaled(LEVEL2_MS)) setRock(2, false);
    else setRock(1, false);
  }
  if (duration >= scaled(ALERT_MS) && !longCryReported) {
    longCryReported = true;
    publishEvent("Llanto prolongado, revisar al bebe");
    notifyPhone(NOTICE_CRY, "Llanto prolongado, revisar al bebé", "baby", 4);
    beep(1800, 600);
  }
}

void updateRocking() {
  unsigned long now = millis();
  if (rockLevel == 0) return;

  // Limite de 5 minutos continuos y descanso
  if (now - rockStart >= scaled(ROCK_MAX_MS)) {
    setRock(0, false);
    rockBlockedUntil = now + scaled(ROCK_REST_MS);
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
    notifyPhone(NOTICE_WET, "Pañal mojado", "droplet", 3);
    beep(1200, 300);
  } else if (wet && !nowWet && wetValue < wetLevel - 500) {
    wet = false;
    publishEvent("Panal seco");
  }

  bool nowGas = gasValue >= gasLevel;
  if (nowGas && !gasAlarm) {
    gasAlarm = true;
    publishEvent("Gas o humo detectado");
    notifyPhone(NOTICE_GAS, "Gas o humo detectado en el cuarto", "rotating_light", 5);
  } else if (gasAlarm && !nowGas && gasValue < gasLevel - 400) {
    gasAlarm = false;
    publishEvent("Gas o humo despejado");
  }

  if (moveG >= moveAlarmG && !moveAlarm) {
    moveAlarm = true;
    publishEvent("Movimiento brusco en la cuna");
    notifyPhone(NOTICE_MOVE, "Movimiento brusco en la cuna", "warning", 4);
  } else if (moveAlarm && moveG < moveRearmG) {
    moveAlarm = false;
  }

  if (gasAlarm && millis() - tBeep > 700) {
    tBeep = millis();
    beep(2200, 400);
  }
  digitalWrite(PIN_LED, ledOn() ? HIGH : LOW);
}

bool ledOn() {
  return crying || wet || gasAlarm || moveAlarm;
}

void handleCommand(String cmd) {
  cmd.trim();
  cmd.toLowerCase();
  if (cmd.startsWith("rock:")) {
    int level = cmd.substring(5).toInt();
    if (level < 0) level = 0;
    if (level > 3) level = 3;
    if (level == rockLevel && (level == 0 || rockManual)) return;
    setRock(level, level > 0);
    if (level == 0) rockBlockedUntil = millis() + scaled(MANUAL_STOP_MS);
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
    cryLevel = constrain(cmd.substring(4).toInt(), 100, 4095);
  } else if (cmd.startsWith("temp:")) {
    fanOnTemp = constrain(cmd.substring(5).toFloat(), 10.0f, 40.0f);
    fanOffTemp = fanOnTemp - 1.5;
  } else if (cmd == "beep") {
    beep(1500, 300);
    publishEvent("Prueba del buzzer");
  } else if (cmd == "demo:on" || cmd == "demo:off") {
    int factor = cmd == "demo:on" ? 10 : 1;
    if (factor == timeFactor) return;
    timeFactor = factor;
    rockBlockedUntil = 0;   // una pausa pendiente no debe arruinar la demostracion
    publishEvent(factor == 10 ? "Modo demo activado, tiempos x10" : "Modo demo desactivado");
  } else if (cmd.startsWith("sim:")) {
    // sim:cry, sim:wet, sim:gas, sim:baby y sim:heat alternan la situacion. Con :1 o :0 al
    // final la fijan, y repetir la orden no cambia nada, asi el panel puede reintentar.
    // sim:temp:<grados> fuerza la temperatura, sim:temp:off la libera y sim:off limpia todo
    String what = cmd.substring(4);
    if (what == "off") {
      setSim(0, false);
      setSim(1, false);
      setSim(2, false);
      setSim(3, false);
      simHeat = false;
      simTempOn = false;
      rockBlockedUntil = 0;
      publishEvent("Simulaciones desactivadas");
    } else if (what.startsWith("temp:")) {
      String value = what.substring(5);
      simTempOn = value != "off";
      if (simTempOn) simTemp = value.toFloat();
    } else {
      const char* names[] = {"cry", "wet", "gas", "baby"};
      bool hasValue = what.endsWith(":1") || what.endsWith(":0");
      bool value = what.endsWith(":1");
      if (hasValue) what = what.substring(0, what.length() - 2);
      if (what == "heat") {
        setSimHeat(hasValue ? value : !simHeat);
      }
      for (int i = 0; i < 4; i++) {
        if (what != names[i]) continue;
        if (hasValue) setSim(i, value);
        else toggleSim(i);
      }
    }
  }
}

void onMessage(char* topic, byte* payload, unsigned int length) {
  String text;
  for (unsigned int i = 0; i < length; i++) text += (char)payload[i];
  handleCommand(text);
}

// Con el LWT, si la cuna se apaga el broker publica offline en .../status por ella
void connectMqtt() {
  String clientId = String("cuna-") + CRADLE_ID + "-" + String((uint32_t)esp_random(), HEX);
  String statusTopic = baseTopic + "/status";
  if (!mqtt.connect(clientId.c_str(), statusTopic.c_str(), 1, true, "offline")) return;
  mqtt.publish(statusTopic.c_str(), "online", true);
  mqtt.subscribe((baseTopic + "/cmd").c_str());
  Serial.println("Evento: Cuna conectada");
  mqtt.publish((baseTopic + "/event").c_str(), "Cuna conectada");
  mqttReady = true;
}

void sendPhoneNotice(const PhoneNotice& n) {
  WiFiClient client;
  HTTPClient http;
  http.setConnectTimeout(3000);
  http.setTimeout(3000);
  if (!http.begin(client, ntfyUrl)) return;
  http.addHeader("Title", "Cuna inteligente");
  http.addHeader("Priority", String(n.priority));
  http.addHeader("Tags", n.tags);
  int code = http.POST((uint8_t*)n.body, strlen(n.body));
  http.end();
  Serial.printf("Aviso al telefono (%d): %s\n", code, n.body);
}

void netTask(void* arg) {
  unsigned long tMqttTry = 0;
  unsigned long tWifiTry = millis();
  PhoneNotice notice;
  for (;;) {
    bool online = WiFi.status() == WL_CONNECTED;
    // Sin WiFi los avisos se quedan en la cola hasta que vuelva la conexion
    if (online && xQueueReceive(noticeQueue, &notice, pdMS_TO_TICKS(250)) == pdTRUE) {
      sendPhoneNotice(notice);
    } else if (!online) {
      vTaskDelay(pdMS_TO_TICKS(250));
    }
    if (mqttReady) continue;
    if (!online) {
      if (millis() - tWifiTry >= 10000) {
        tWifiTry = millis();
        WiFi.disconnect();
        WiFi.begin(WIFI_SSID, WIFI_PASS, WIFI_CHANNEL);
      }
    } else if (millis() - tMqttTry >= 3000) {
      tMqttTry = millis();
      connectMqtt();
    }
  }
}

void publishState() {
  if (!mqttReady) return;
  char tempText[8] = "null";
  char humText[8] = "null";
  char simTempText[8] = "null";
  if (!isnan(temperature)) snprintf(tempText, sizeof(tempText), "%.1f", temperature);
  if (!isnan(humidity)) snprintf(humText, sizeof(humText), "%.0f", humidity);
  if (simTempOn) snprintf(simTempText, sizeof(simTempText), "%.1f", simTemp);
  char buf[420];
  snprintf(buf, sizeof(buf),
           "{\"t\":%s,\"h\":%s,\"sound\":%d,\"kg\":%.1f,\"move\":%.2f,\"gas\":%d,\"wet\":%d,"
           "\"cry\":%d,\"rock\":%d,\"fan\":%d,\"auto\":%d,\"baby\":%d,\"up\":%lu,"
           "\"sc\":%d,\"sw\":%d,\"sg\":%d,\"sh\":%d,\"sb\":%d,\"st\":%s,"
           "\"wa\":%d,\"ga\":%d,\"ma\":%d,\"led\":%d,\"bz\":%d,\"ang\":%d,\"demo\":%d,"
           "\"ct\":%d,\"fo\":%.1f,\"ff\":%.1f,\"gt\":%d,\"wt\":%d}",
           tempText, humText, soundLevel, weightKg, moveG, gasValue, wetValue,
           crying ? 1 : 0, rockLevel, fanOn ? 1 : 0, fanAuto ? 1 : 0, babyPresent ? 1 : 0,
           millis() / 1000,
           simCry ? 1 : 0, simWet ? 1 : 0, simGas ? 1 : 0, simHeat ? 1 : 0, simBaby ? 1 : 0, simTempText,
           wet ? 1 : 0, gasAlarm ? 1 : 0, moveAlarm ? 1 : 0, ledOn() ? 1 : 0,
           millis() < buzzerUntil ? 1 : 0, servoAngle, timeFactor > 1 ? 1 : 0,
           cryLevel, fanOnTemp, fanOffTemp, gasLevel, wetLevel);
  mqtt.publish((baseTopic + "/state").c_str(), buf, true);
}

uint32_t mix(uint32_t sig, int value) {
  return sig * 31 + value;
}

// Resume el estado. Si cambia, se publica sin esperar al latido. Las medidas van
// redondeadas para que el ruido de un sensor no dispare publicaciones
uint32_t stateSignature() {
  uint32_t sig = 17;
  sig = mix(sig, crying);
  sig = mix(sig, rockLevel);
  sig = mix(sig, fanOn);
  sig = mix(sig, fanAuto);
  sig = mix(sig, babyPresent);
  sig = mix(sig, wet);
  sig = mix(sig, gasAlarm);
  sig = mix(sig, moveAlarm);
  sig = mix(sig, simCry);
  sig = mix(sig, simWet);
  sig = mix(sig, simGas);
  sig = mix(sig, simHeat);
  sig = mix(sig, simBaby);
  sig = mix(sig, simTempOn);
  sig = mix(sig, timeFactor);
  sig = mix(sig, cryLevel);
  sig = mix(sig, (int)(fanOnTemp * 10));
  sig = mix(sig, soundLevel / 200);
  sig = mix(sig, gasValue / 200);
  sig = mix(sig, wetValue / 200);
  sig = mix(sig, (int)(weightKg * 2));
  sig = mix(sig, isnan(temperature) ? -1 : (int)(temperature * 2));
  sig = mix(sig, isnan(humidity) ? -1 : (int)(humidity / 2));
  sig = mix(sig, (int)(moveG * 5));
  return sig;
}

// El dibujo por I2C es lo que mas tiempo consume, solo se repite si cambia algo visible
uint32_t screenSignature() {
  uint32_t sig = 23;
  sig = mix(sig, crying);
  sig = mix(sig, gasAlarm);
  sig = mix(sig, babyPresent);
  sig = mix(sig, wet);
  sig = mix(sig, rockLevel);
  sig = mix(sig, fanOn);
  sig = mix(sig, mqttReady);
  sig = mix(sig, timeFactor);
  sig = mix(sig, isnan(temperature) ? -1 : (int)(temperature * 10));
  sig = mix(sig, isnan(humidity) ? -1 : (int)humidity);
  sig = mix(sig, (int)(weightKg * 10));
  sig = mix(sig, soundLevel / 32);
  return sig;
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
  if (timeFactor > 1) {
    oled.setCursor(110, 0);
    oled.print("x10");
  }

  oled.setCursor(0, 12);
  oled.printf("T %.1fC  H %.0f%%", isnan(temperature) ? 0.0 : temperature, isnan(humidity) ? 0.0 : humidity);
  oled.setCursor(0, 24);
  oled.printf("Peso %.1f kg", weightKg);
  oled.setCursor(0, 36);
  oled.printf("Mecer %d  Vent %s", rockLevel, fanOn ? "ON" : "off");
  oled.setCursor(0, 48);
  oled.print(wet ? "Panal MOJADO" : "Panal seco");
  oled.print(mqttReady ? "  net" : "  --");

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
  Wire.setClock(400000);
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
  ntfyUrl = String(NTFY_BASE) + CRADLE_ID;
  mqtt.setServer(MQTT_HOST, MQTT_PORT);
  mqtt.setCallback(onMessage);
  mqtt.setBufferSize(512);
  mqtt.setKeepAlive(30);
  mqtt.setSocketTimeout(5);

  noticeQueue = xQueueCreate(6, sizeof(PhoneNotice));
  WiFi.setAutoReconnect(true);
  WiFi.begin(WIFI_SSID, WIFI_PASS, WIFI_CHANNEL);
  xTaskCreatePinnedToCore(netTask, "red", 8192, NULL, 1, NULL, 0);
}

void loop() {
  unsigned long now = millis();
  if (mqttReady && !mqtt.loop()) {
    mqttReady = false;
    Serial.println("MQTT desconectado, reconectando");
  }

  if (now - tSensors >= 200) {
    tSensors = now;
    readSensors();
    updateCry();
    updateEnvironment();
  }
  updateRocking();
  readButtons();

  // El estado sale al instante si algo cambio, y ademas hay un latido cada segundo
  uint32_t stateSig = stateSignature();
  if ((stateSig != lastStateSig && now - tPublish >= 200) || now - tPublish >= 1000) {
    lastStateSig = stateSig;
    tPublish = now;
    publishState();
  }
  if (now - tScreen >= 500) {
    tScreen = now;
    uint32_t screenSig = screenSignature();
    if (screenSig != lastScreenSig) {
      lastScreenSig = screenSig;
      drawScreen();
    }
  }

  delay(10);  // sin esta pausa la simulacion de Wokwi corre mucho mas lenta
}
