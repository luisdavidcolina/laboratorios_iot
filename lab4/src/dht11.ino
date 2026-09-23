/*
 * Laboratorio IoT - Actividad 1: Sensor DHT-11
 * Placa usada en el laboratorio: Arduino UNO
 */

#include "DHT.h"

// Constantes de configuracion
#define DHT_PIN       4        // Pin de datos del sensor
#define DHT_TYPE      DHT22    // Tipo de sensor disponible en el laboratorio

// Instancia del sensor
DHT sensorDHT(DHT_PIN, DHT_TYPE);

// Variables para almacenar lecturas
float temperatura = 0.0;
float humedad = 0.0;

void setup() {
  Serial.begin(9600);
  while (!Serial);           // Esperar conexion (Mega compatible)

  Serial.println(F("========================================"));
  Serial.println(F("  LABORATORIO IoT - SENSOR DHT-11"));
  Serial.println(F("========================================"));
  Serial.println(F("Inicializando sensor..."));

  sensorDHT.begin();

  // Pequena pausa para estabilizacion
  delay(2000);

  Serial.println(F("Sistema listo. Enviando datos cada 2 segundos...\n"));
}

void loop() {
  // Esperar el intervalo minimo entre lecturas (1 segundo para DHT11)
  delay(2000);

  // Leer datos del sensor
  humedad = sensorDHT.readHumidity();
  temperatura = sensorDHT.readTemperature();      // Celsius por defecto
  float tempF = sensorDHT.readTemperature(true);   // Fahrenheit

  // Verificar si la lectura fallo
  if (isnan(humedad) || isnan(temperatura)) {
    Serial.println(F("ERROR! Fallo en la lectura del sensor DHT-11"));
    Serial.println(F("Verifique conexiones y alimentacion del sensor"));
    return;
  }

  // Calcular indice de calor (heat index) en Celsius
  float indiceCalor = sensorDHT.computeHeatIndex(temperatura, humedad, false);

  // Mostrar resultados formateados
  Serial.println(F("-------------------------------"));
  Serial.print(F("Humedad Relativa:    "));
  Serial.print(humedad);
  Serial.println(F(" %"));

  Serial.print(F("Temperatura:         "));
  Serial.print(temperatura);
  Serial.print(F(" C  ("));
  Serial.print(tempF);
  Serial.println(F(" F)"));

  Serial.print(F("Indice de Calor:     "));
  Serial.print(indiceCalor);
  Serial.println(F(" C"));

  // Evaluacion de condiciones ambientales
  Serial.print(F("Estado: "));
  if (temperatura > 30) {
    Serial.print(F("ALTA TEMPERATURA"));
  } else if (temperatura < 15) {
    Serial.print(F("BAJA TEMPERATURA"));
  } else {
    Serial.print(F("TEMPERATURA NORMAL"));
  }
  Serial.print(F(" | "));

  if (humedad > 70) {
    Serial.println(F("ALTA HUMEDAD"));
  } else if (humedad < 30) {
    Serial.println(F("BAJA HUMEDAD"));
  } else {
    Serial.println(F("HUMEDAD NORMAL"));
  }
  Serial.println(F("-------------------------------\n"));
}

// Funcion adicional para diagnostico del sensor
void diagnosticarSensor() {
  Serial.println(F("--- DIAGNOSTICO DEL SENSOR ---"));
  Serial.print(F("Tipo configurado: DHT-"));
  Serial.println(DHT_TYPE);
  Serial.print(F("Pin de datos: Digital "));
  Serial.println(DHT_PIN);
  Serial.println(F("Rango valido de lecturas:"));
  Serial.println(F("  - Temperatura: 0 a 50 C"));
  Serial.println(F("  - Humedad: 20% a 90% RH"));
}
