import processing.serial.*;
import cc.arduino.*;

Arduino arduino;

// --- Configuración de Pines de Hardware ---
int pinVRX = 0;   // Entrada analógica A0 (Controla 0º a 90º)
int pinVRY = 1;   // Entrada analógica A1 (Controla 90º a 180º)
int pinSW = 2;    // Entrada digital Pin 2 (Pulsador)
int servoPin = 3; // Pin de control del servo motor

// --- Variables de almacenamiento ---
int valorX = 512;
int valorY = 512;
int estadoSW = 1;
int anguloServo = 90;

void setup() {
  size(450, 450);
  
  // Configuración de Arduino mediante protocolo Firmata
  // Ajusta el índice del puerto Arduino.list()[X] según tu PC
  arduino = new Arduino(this, Arduino.list()[2], 57600);  
  
  // Configurar entradas del Joystick
  arduino.pinMode(pinSW, Arduino.INPUT);
  // Activar la resistencia Pullup interna para el pulsador
  arduino.digitalWrite(pinSW, Arduino.HIGH); 
  
  // Configurar salida del Servo
  arduino.pinMode(servoPin, Arduino.SERVO);
  arduino.servoWrite(servoPin, anguloServo); 
  
  println("Sistema Unificado Activo. Leyendo hardware y actualizando UI...");
}

void draw() {
  background(25);
  
  // 1. LECTURA FÍSICA DEL HARDWARE
  valorX = arduino.analogRead(pinVRX);
  valorY = arduino.analogRead(pinVRY);
  estadoSW = arduino.digitalRead(pinSW); 
  
  // 2. LÓGICA DE MAPEO CONDICIONAL (Eje Dominante)
  // Comparamos qué eje se está moviendo más respecto al centro de reposo (512)
  if (abs(valorX - 512) > abs(valorY - 512)) {
    // Si el eje X domina, mapeamos su valor al rango de 0º a 90º
    anguloServo = (int) map(valorX, 0, 1023, 0, 90);
  } else {
    // Si el eje Y domina, mapeamos su valor al rango de 90º a 180º
    anguloServo = (int) map(valorY, 0, 1023, 90, 180);
  }
  
  // 3. CONTROL FÍSICO LOCAL DEL SERVOMOTOR
  arduino.servoWrite(servoPin, anguloServo);
  
  // 4. INTERFAZ GRÁFICA UNIFICADA
  fill(255);
  textSize(16);
  text("INTERFAZ UNIFICADA (HARDWARE + UI)", 30, 35);
  stroke(0, 150, 255); line(30, 45, 410, 45); noStroke();
  
  // Textos de estado del Joystick
  fill(220);
  textSize(13);
  text("Eje X (Mapeo 0º a 90º)   | ADC Actual: " + valorX, 40, 85);
  text("Eje Y (Mapeo 90º a 180º) | ADC Actual: " + valorY, 40, 125);
  text("Botón Selector SW: " + (estadoSW == 0 ? "⚠️ PRESIONADO" : "SUELTO"), 40, 165);
  
  // Panel contenedor para el Servomotor
  fill(35, 45, 60);
  rect(30, 210, 390, 210, 7);
  
  // Texto del ángulo calculado
  fill(0, 255, 100);
  textSize(15);
  text("Ángulo Actual del Servomotor: " + anguloServo + "º", 50, 247);
  
  // Dibujo dinámico del brazo del servo
  dibujarServoGrafico(225, 360, anguloServo);
  
  // Pequeña pausa para estabilidad del procesador
  delay(20); 
}

// --- Función auxiliar para dibujar dinámicamente el brazo del servo ---
void dibujarServoGrafico(int x, int y, int angulo) {
  pushMatrix();
  translate(x, y); 
  // Ajuste matemático visual para que 90º apunte hacia arriba en la pantalla
  rotate(radians(angulo - 90)); 
  
  stroke(0, 255, 100);
  strokeWeight(6);
  line(0, 0, 0, -50); // Línea que representa el brazo mecánico
  
  fill(255);
  noStroke();
  ellipse(0, 0, 15, 15); // Eje central circular
  popMatrix();
}
