/*
 * ============================================================
 *  LABORATORIO IoT - SISTEMA INTEGRADO FINAL
 *  Sensores y Actuadores con ATmega2560
 *  Version: 1.0
 * ============================================================
 */

#include "DHT.h"
#include <LiquidCrystal.h>

// ============================================================
// CONFIGURACION DE HARDWARE
// ============================================================

// Sensor DHT-11 (usar pin 8 para evitar conflicto con LCD)
#define DHT_PIN         8
#define DHT_TYPE        DHT11

// Rele (activo LOW - verificar modulo)
#define PIN_RELE        7

// LED indicadores de estado (opcional, con resistencias 220ohm)
#define LED_VERDE       22   // Estado normal
#define LED_AMARILLO    24   // Estado atencion
#define LED_ROJO        26   // Estado alarma

// Pulsador para cambio de modo
#define PIN_PULSADOR    28

// LCD 16x2 (RS, E, D4, D5, D6, D7)
// Nota: DHT en pin 8, LCD usa pines 2,3,4,5,11,12
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

// ============================================================
// CONSTANTES DE CONTROL
// ============================================================

const float TEMP_ALTA     = 28.0;   // Umbral activar ventilacion
const float TEMP_BAJA     = 24.0;   // Umbral desactivar ventilacion
const float HUM_MAXIMA    = 80.0;   // Umbral humedad critica

const unsigned long INTERVALO_LECTURA = 2000;   // ms entre lecturas
const unsigned long INTERVALO_PANTALLA = 500;     // ms actualizacion LCD

// ============================================================
// VARIABLES GLOBALES
// ============================================================

DHT sensorDHT(DHT_PIN, DHT_TYPE);

float temperatura = 0.0;
float humedad = 0.0;
float indiceCalor = 0.0;

bool modoAutomatico = true;
bool estadoVentilador = false;
bool estadoAlarma = false;

unsigned long ultimaLectura = 0;
unsigned long ultimaPantalla = 0;
unsigned long tiempoPulsador = 0;

// Estados del sistema
enum EstadoSistema {
  ESTADO_NORMAL,
  ESTADO_ATENCION,
  ESTADO_ALARMA
};
EstadoSistema estadoActual = ESTADO_NORMAL;

// ============================================================
// SETUP
// ============================================================

void setup() {
  Serial.begin(9600);
  while (!Serial && millis() < 3000);  // Esperar serial con timeout

  // Inicializar pines
  pinMode(PIN_RELE, OUTPUT);
  pinMode(LED_VERDE, OUTPUT);
  pinMode(LED_AMARILLO, OUTPUT);
  pinMode(LED_ROJO, OUTPUT);
  pinMode(PIN_PULSADOR, INPUT_PULLUP);  // Resistencia pull-up interna

  // Estado inicial seguro
  digitalWrite(PIN_RELE, HIGH);  // Rele apagado (activo LOW)
  apagarLEDs();

  // Inicializar LCD y sensor
  lcd.begin(16, 2);
  sensorDHT.begin();

  // Pantalla de bienvenida
  mostrarBienvenida();

  // Mensaje de inicio serial
  Serial.println(F("========================================"));
  Serial.println(F("   SISTEMA DE CONTROL AMBIENTAL IoT   "));
  Serial.println(F("========================================"));
  mostrarConfiguracion();

  delay(1000);
}

// ============================================================
// LOOP PRINCIPAL
// ============================================================

void loop() {
  unsigned long ahora = millis();

  // -- Lectura periodica del sensor --
  if (ahora - ultimaLectura >= INTERVALO_LECTURA) {
    ultimaLectura = ahora;
    procesarLecturaSensor();
  }

  // -- Actualizacion de pantalla --
  if (ahora - ultimaPantalla >= INTERVALO_PANTALLA) {
    ultimaPantalla = ahora;
    actualizarInterfaz();
  }

  // -- Verificar pulsador (con anti-rebote) --
  verificarPulsador();

  // -- Procesar comandos seriales --
  procesarComandosSeriales();

  // -- Control automatico si esta activo --
  if (modoAutomatico) {
    ejecutarControlAutomatico();
  }
}

// ============================================================
// FUNCIONES DEL SENSOR
// ============================================================

void procesarLecturaSensor() {
  float nuevaTemp = sensorDHT.readTemperature();
  float nuevaHum = sensorDHT.readHumidity();

  // Validar lectura
  if (isnan(nuevaTemp) || isnan(nuevaHum)) {
    Serial.println(F("[ERROR] Fallo en lectura del DHT-11"));
    estadoAlarma = true;
    return;
  }

  temperatura = nuevaTemp;
  humedad = nuevaHum;
  indiceCalor = sensorDHT.computeHeatIndex(temperatura, humedad, false);
  estadoAlarma = false;

  // Formato CSV para monitoreo y graficacion
  Serial.print(F("DATA,"));
  Serial.print(temperatura, 2);
  Serial.print(F(","));
  Serial.print(humedad, 2);
  Serial.print(F(","));
  Serial.print(estadoVentilador ? 1 : 0);
  Serial.print(F(","));
  Serial.println(modoAutomatico ? 1 : 0);
}

// ============================================================
// FUNCIONES DE CONTROL
// ============================================================

void ejecutarControlAutomatico() {
  EstadoSistema nuevoEstado;

  // Determinar estado del sistema con histeresis
  if (temperatura >= TEMP_ALTA || humedad >= HUM_MAXIMA) {
    nuevoEstado = ESTADO_ALARMA;
  }
  else if (temperatura >= TEMP_BAJA + 1.0) {  // Histeresis de 1 grado
    nuevoEstado = ESTADO_ATENCION;
  }
  else {
    nuevoEstado = ESTADO_NORMAL;
  }

  // Aplicar control segun estado
  switch (nuevoEstado) {
    case ESTADO_ALARMA:
      activarVentilador(true);
      break;
    case ESTADO_ATENCION:
      // Mantener estado anterior o activar segun tendencia
      break;
    case ESTADO_NORMAL:
      activarVentilador(false);
      break;
  }

  estadoActual = nuevoEstado;
  actualizarLEDs();
}

void activarVentilador(bool activar) {
  if (estadoVentilador == activar) return;  // Sin cambio

  estadoVentilador = activar;
  digitalWrite(PIN_RELE, activar ? LOW : HIGH);  // Activo LOW

  Serial.print(F("[CONTROL] Ventilador "));
  Serial.println(activar ? F("ACTIVADO") : F("DESACTIVADO"));
}

void cambiarModo() {
  modoAutomatico = !modoAutomatico;
  Serial.print(F("[MODO] Cambiado a: "));
  Serial.println(modoAutomatico ? F("AUTOMATICO") : F("MANUAL"));

  // Mostrar en LCD temporalmente
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("MODO CAMBIADO:");
  lcd.setCursor(0, 1);
  lcd.print(modoAutomatico ? "AUTOMATICO" : "MANUAL    ");
  delay(1500);
}

// ============================================================
// FUNCIONES DE INTERFAZ (LCD)
// ============================================================

void actualizarInterfaz() {
  lcd.clear();

  // Linea 0: Datos del sensor
  lcd.setCursor(0, 0);

  // Temperatura
  if (temperatura < 10) lcd.print(" ");
  lcd.print(temperatura, 1);
  lcd.print((char)223);  // Simbolo de grado
  lcd.print("C ");

  // Humedad
  lcd.print("| ");
  if (humedad < 10) lcd.print(" ");
  lcd.print(humedad, 0);
  lcd.print("%RH");

  // Linea 1: Estado del sistema
  lcd.setCursor(0, 1);

  // Indicador de modo
  lcd.print(modoAutomatico ? "[A]" : "[M]");

  // Estado del ventilador
  lcd.print(" Vnt:");
  lcd.print(estadoVentilador ? "ON " : "OFF");

  // Indicador visual de estado
  switch (estadoActual) {
    case ESTADO_NORMAL:   lcd.print(" OK ");  break;
    case ESTADO_ATENCION: lcd.print(" !  ");  break;
    case ESTADO_ALARMA:   lcd.print("ALR!");  break;
  }
}

void mostrarBienvenida() {
  lcd.setCursor(0, 0);
  lcd.print("  Control IoT   ");
  lcd.setCursor(0, 1);
  lcd.print("  Iniciando...  ");
  delay(1000);
}

// ============================================================
// FUNCIONES DE LED INDICADORES
// ============================================================

void apagarLEDs() {
  digitalWrite(LED_VERDE, LOW);
  digitalWrite(LED_AMARILLO, LOW);
  digitalWrite(LED_ROJO, LOW);
}

void actualizarLEDs() {
  apagarLEDs();

  switch (estadoActual) {
    case ESTADO_NORMAL:
      digitalWrite(LED_VERDE, HIGH);
      break;
    case ESTADO_ATENCION:
      digitalWrite(LED_AMARILLO, HIGH);
      break;
    case ESTADO_ALARMA:
      // Parpadeo del LED rojo (250ms periodo)
      digitalWrite(LED_ROJO, (millis() / 250) % 2);
      break;
  }
}

// ============================================================
// FUNCIONES DE ENTRADA
// ============================================================

void verificarPulsador() {
  static bool estadoAnterior = HIGH;
  bool estadoActualPin = digitalRead(PIN_PULSADOR);

  // Deteccion de flanco descendente (pulsador presionado)
  if (estadoAnterior == HIGH && estadoActualPin == LOW) {
    if (millis() - tiempoPulsador > 200) {  // Anti-rebote 200ms
      tiempoPulsador = millis();
      cambiarModo();
    }
  }
  estadoAnterior = estadoActualPin;
}

// ============================================================
// COMUNICACION SERIAL
// ============================================================

void procesarComandosSeriales() {
  if (!Serial.available()) return;

  String comando = Serial.readStringUntil('\n');
  comando.trim();
  comando.toUpperCase();

  Serial.print(F("[RX] Comando recibido: "));
  Serial.println(comando);

  if (comando == "ON" || comando == "1") {
    modoAutomatico = false;
    activarVentilador(true);
  }
  else if (comando == "OFF" || comando == "0") {
    modoAutomatico = false;
    activarVentilador(false);
  }
  else if (comando == "AUTO" || comando == "A") {
    modoAutomatico = true;
  }
  else if (comando == "STATUS" || comando == "S") {
    enviarEstadoCompleto();
  }
  else if (comando == "HELP" || comando == "H" || comando == "?") {
    mostrarAyudaSerial();
  }
  else {
    Serial.println(F("Comando no reconocido. Use HELP para ayuda."));
  }
}

void enviarEstadoCompleto() {
  Serial.println(F("========== ESTADO DEL SISTEMA =========="));
  Serial.print(F("Temperatura:  ")); 
  Serial.print(temperatura, 2); Serial.println(F(" C"));
  Serial.print(F("Humedad:      ")); 
  Serial.print(humedad, 2); Serial.println(F(" %RH"));
  Serial.print(F("Indice calor: ")); 
  Serial.print(indiceCalor, 2); Serial.println(F(" C"));
  Serial.print(F("Modo:         ")); 
  Serial.println(modoAutomatico ? F("AUTOMATICO") : F("MANUAL"));
  Serial.print(F("Ventilador:   ")); 
  Serial.println(estadoVentilador ? F("ENCENDIDO") : F("APAGADO"));
  Serial.print(F("Estado:       "));
  switch (estadoActual) {
    case ESTADO_NORMAL:   Serial.println(F("NORMAL")); break;
    case ESTADO_ATENCION: Serial.println(F("ATENCION")); break;
    case ESTADO_ALARMA:   Serial.println(F("ALARMA")); break;
  }
  Serial.println(F("======================================="));
}

void mostrarAyudaSerial() {
  Serial.println(F("\n========================================"));
  Serial.println(F("     COMANDOS DISPONIBLES               "));
  Serial.println(F("========================================"));
  Serial.println(F("  ON, 1      -> Encender ventilador     "));
  Serial.println(F("  OFF, 0     -> Apagar ventilador       "));
  Serial.println(F("  AUTO, A    -> Modo automatico         "));
  Serial.println(F("  STATUS, S  -> Estado completo         "));
  Serial.println(F("  HELP, H, ? -> Esta ayuda              "));
  Serial.println(F("========================================"));
  Serial.println(F("Formato de datos continuos: DATA,temp,hum,vent,modo\n"));
}

void mostrarConfiguracion() {
  Serial.print(F("Umbrales configurados:"));
  Serial.print(F("  Alta temp: ")); 
  Serial.print(TEMP_ALTA); Serial.println(F("C"));
  Serial.print(F("  Baja temp: ")); 
  Serial.print(TEMP_BAJA); Serial.println(F("C"));
  Serial.print(F("  Alta hum:  ")); 
  Serial.print(HUM_MAXIMA); Serial.println(F("%"));
  Serial.println();
}

// ============================================================
// FIN DEL PROGRAMA
// ============================================================
