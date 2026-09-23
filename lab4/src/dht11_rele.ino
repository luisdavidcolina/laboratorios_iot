#include "DHT.h"

// Definición de pines según tu configuración
#define DHT_PIN       4     // Pin de datos del sensor DHT22
#define DHT_TYPE      DHT22 // Tipo de sensor
#define PIN_RELE      2     // Pin de control del relé

// Instancia del sensor DHT
DHT sensorDHT(DHT_PIN, DHT_TYPE);

float temperatura = 0.0;
float humedad = 0.0;

// Límites ambientales para encender el relé (puedes ajustarlos a tu gusto)
float limiteTemperatura = 30.0;
float limiteHumedad = 60.0;     // Nuevo límite de humedad

void setup() {
  Serial.begin(9600);

  // Configurar el pin del relé como salida
  pinMode(PIN_RELE, OUTPUT);

  // Estado inicial: relé apagado (HIGH asumiendo que el módulo es activo LOW)
  digitalWrite(PIN_RELE, HIGH);

  Serial.println(F("========================================"));
  Serial.println(F("  SISTEMA AUTÓNOMO: DHT22 + RELÉ"));
  Serial.println(F("  Monitoreo de Temperatura y Humedad"));
  Serial.println(F("========================================"));

  sensorDHT.begin();
  delay(2000); // Pausa para estabilización
}

void loop() {
  // Esperar 2 segundos entre lecturas
  delay(2000);

  // Leer datos del sensor
  humedad = sensorDHT.readHumidity();
  temperatura = sensorDHT.readTemperature();

  // Verificar si la lectura falló para evitar comportamientos erráticos
  if (isnan(humedad) || isnan(temperatura)) {
    Serial.println(F("ERROR! Fallo en la lectura del sensor DHT"));
    return;
  }

  // Enviar telemetría por el puerto serial
  Serial.print(F("Temperatura: "));
  Serial.print(temperatura);
  Serial.print(F(" C | Humedad: "));
  Serial.print(humedad);
  Serial.println(F(" %"));

  // Lógica de control automático (Temperatura O Humedad)
  // El operador || significa "O" (OR). Entra al if si alguna de las dos se cumple.
  if (temperatura >= limiteTemperatura || humedad >= limiteHumedad) {
    digitalWrite(PIN_RELE, LOW); // Activa el relé (enciende el ventilador/extractor)
    Serial.println(F("-> ALERTA: Límite superado (Temp o Hum). Relé ENCENDIDO."));
  } else {
    digitalWrite(PIN_RELE, HIGH); // Apaga el relé
    Serial.println(F("-> Condiciones normales. Relé APAGADO."));
  }

  Serial.println(F("-------------------------------"));
}