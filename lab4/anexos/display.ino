/*
 * Laboratorio IoT - Actividad 3: Display LCD1602
 * Placa: ATmega2560 (Arduino Mega)
 * Modo: Paralelo 4 bits
 */

#include <LiquidCrystal.h>

// Pines de conexion LCD (RS, E, D4, D5, D6, D7)
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

// Definicion de caracteres personalizados (5x8 pixeles)
byte gradoCelsius[8] = {
  0b00110,
  0b01001,
  0b01000,
  0b01000,
  0b01001,
  0b00110,
  0b00000,
  0b00000
};

byte gotaHumedad[8] = {
  0b00100,
  0b00100,
  0b01110,
  0b01110,
  0b11111,
  0b11111,
  0b01110,
  0b00000
};

byte ventiladorOn[8] = {
  0b00000,
  0b11011,
  0b11011,
  0b00100,
  0b11011,
  0b11011,
  0b00000,
  0b00000
};

// Variables globales
float temperaturaSimulada = 25.0;
float humedadSimulada = 60.0;
bool releEstado = false;

void setup() {
  Serial.begin(9600);

  // Crear caracteres personalizados (posiciones 0, 1, 2)
  lcd.createChar(0, gradoCelsius);
  lcd.createChar(1, gotaHumedad);
  lcd.createChar(2, ventiladorOn);

  // Inicializar LCD: 16 columnas, 2 filas
  lcd.begin(16, 2);

  // Secuencia de bienvenida
  mostrarBienvenida();
}

void loop() {
  // Simulacion de datos (en practica real, leer de DHT-11)
  temperaturaSimulada = simularTemperatura();
  humedadSimulada = simularHumedad();
  releEstado = (millis() / 10000) % 2;  // Alternar cada 10s

  // Actualizar pantalla con datos
  actualizarPantalla(temperaturaSimulada, humedadSimulada, releEstado);

  delay(1000);  // Actualizacion cada segundo
}

// ==================== FUNCIONES DE PANTALLA ====================

void mostrarBienvenida() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("  IoT Lab v1.0  ");

  lcd.setCursor(0, 1);
  lcd.print("Inicializando...");

  // Barra de progreso animada
  for (int i = 0; i < 16; i++) {
    lcd.setCursor(i, 1);
    // Usar caracteres personalizados para animacion
    lcd.write(byte(i % 3));
    delay(150);
  }

  delay(500);
  lcd.clear();
}

void actualizarPantalla(float temp, float hum, bool rele) {
  // Linea 0: Temperatura y Humedad
  lcd.setCursor(0, 0);

  // Temperatura con simbolo de grado personalizado
  lcd.print("T:");
  if (temp < 10) lcd.print(" ");  // Alineacion
  lcd.print(temp, 1);
  lcd.write(byte(0));  // Grado Celsius personalizado

  // Separador
  lcd.print(" ");

  // Humedad con simbolo de gota
  lcd.write(byte(1));  // Gota
  lcd.print(":");
  if (hum < 10) lcd.print(" ");
  lcd.print(hum, 0);
  lcd.print("%");

  // Linea 1: Estado del sistema
  lcd.setCursor(0, 1);

  // Indicador de rele
  lcd.print("Rele:");
  if (rele) {
    lcd.print("ON ");
    lcd.write(byte(2));  // Ventilador
  } else {
    lcd.print("OFF   ");
  }

  // Contador de tiempo de operacion
  lcd.setCursor(10, 1);
  lcd.print("T:");
  unsigned long segundos = millis() / 1000;
  if (segundos < 100) lcd.print(" ");
  if (segundos < 10) lcd.print(" ");
  lcd.print(segundos);
  lcd.print("s");
}

// ==================== SIMULACION ====================

float simularTemperatura() {
  // Simular entre 20 y 35 grados con variacion sinusoidal
  return 27.5 + 7.5 * sin(millis() / 10000.0) + random(-10, 10) / 10.0;
}

float simularHumedad() {
  // Simular entre 40% y 80%
  return 60.0 + 15.0 * cos(millis() / 15000.0) + random(-20, 20) / 10.0;
}
