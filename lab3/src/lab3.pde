import controlP5.*;
import processing.serial.*;

import cc.arduino.*;

Arduino arduino;

ControlP5 cp5;
Knob knob1, knob2, knob3;
Slider slider1, slider2, slider3;
Chart myChart1;
Chart myChart2;
Textarea myTextarea1;

int ledRojo = 3;
int ledVerde = 6;
int ledAzul = 5;
int servoPin = 10; // Control pin for servo motor

void setup() {
  size(600, 500);
  cp5 = new ControlP5(this);
  arduino = new Arduino(this, Arduino.list()[2], 57600);  
  // Servo Motor
  arduino.pinMode(ledRojo, Arduino.OUTPUT);
  arduino.pinMode(ledVerde, Arduino.OUTPUT);
  arduino.pinMode(ledAzul, Arduino.OUTPUT);
  arduino.pinMode(servoPin, Arduino.SERVO);

 
  // --- Crear 3 Sliders ---
  cp5.addSlider("slider1").setPosition(50, 50).setRange(0, 255).setSize(150, 20);
  cp5.addSlider("slider2").setPosition(50, 110).setRange(0, 255).setSize(150, 20);
  cp5.addSlider("slider3").setPosition(50, 170).setRange(0, 255).setSize(150, 20);
  
  // --- Crear 3 Knobs (Controles Rotatorios) ---
  cp5.addKnob("Servo").setPosition(500, 60).setRadius(30).setRange(-180, 0);
  cp5.addKnob("knob2").setPosition(500, 150).setRadius(30).setRange(0, 255);
  cp5.addKnob("knob3").setPosition(500, 240).setRadius(30).setRange(0, 255);
  
  // --- Graficar valor del slider3 ---
  myChart1 = cp5.addChart("ledVerde")
               .setPosition(50, 200)
               .setSize(200, 100)
               .setRange(0, 255)
               .setView(Chart.LINE) // use Chart.LINE, Chart.PIE, Chart.AREA, Chart.BAR_CENTERED
               .setStrokeWeight(1.5)
               .setColorCaptionLabel(color(40))
               ;
  myChart1.addDataSet("incoming");
  myChart1.setData("incoming", new float[100]); // Crea un historial de 100 puntos
  myChart1.getCaptionLabel()
         .set("Intesidad LED Verde") // El texto de la etiqueta
         .align(ControlP5.CENTER, ControlP5.BOTTOM_OUTSIDE) // Posición relativa al gráfico
         .setPaddingY(10) // Espacio extra hacia abajo
         .setColor(color(255, 255, 255)); // Color verde para que combine con el LED  

  // --- Graficar valor de la Fotoresistencia ---
  myChart2 = cp5.addChart("fotoresistencia")
               .setPosition(50, 350)
               .setSize(200, 100)
               //.setRange(0, 1023)
               .setRange(0, 200)
               .setView(Chart.LINE) // use Chart.LINE, Chart.PIE, Chart.AREA, Chart.BAR_CENTERED
               .setStrokeWeight(1.5)
               .setColorCaptionLabel(color(40))
               ;
  myChart2.getCaptionLabel()
         .set("Intesidad Fotoresistencia") // El texto de la etiqueta
         .align(ControlP5.CENTER, ControlP5.BOTTOM_OUTSIDE) // Posición relativa al gráfico
         .setPaddingY(10) // Espacio extra hacia abajo
         .setColor(color(255, 255, 255)); // Color verde para que combine con el LED 
  myChart2.addDataSet("incoming2");
  myChart2.setData("incoming2", new float[100]); // Crea un historial de 100 puntos
 
 //// Mostrar valores en la Interfaz
 // myTextarea1 = cp5.addTextarea("valor_foto")
 //                   .setPosition(350, 280)
 //                   .setSize(100, 20)
 //                   .setFont(createFont("arial", 12))
 //                   .setLineHeight(14)
 //                   .setColor(color(128))
 //                   .setColorBackground(color(255, 100))
 //                   .setColorForeground(color(255, 100));
}



void draw() {
  background(30);
  // Dibujar LEDs (colores estáticos, intensidad según slider)
  int valorSlider1 = (int)cp5.getController("slider1").getValue(); // valores LED Rojo
  int valorSlider2 = (int)cp5.getController("slider2").getValue(); // valores LED Verde
  int valorSlider3 = (int)cp5.getController("slider3").getValue(); // valores LED Azul
  
  arduino.analogWrite(ledRojo, valorSlider1);
  arduino.analogWrite(ledVerde, valorSlider2);
  arduino.analogWrite(ledAzul, valorSlider3);
  
  dibujarLED(260, 60, color(255, 0, 0), valorSlider1); // Rojo
  dibujarLED(260, 120, color(0, 255, 0), valorSlider2);   // Verde
  dibujarLED(260, 180, color(0, 0, 255), valorSlider3);   // Azul
 
 // Interfaz a Firmata
  float valorFotoresistencia = arduino.analogRead(0);
  println(valorFotoresistencia);


  // Actualizar Graficos
  if (frameCount % 5 == 0) { // Solo actualiza cada 5 frames
     myChart1.push("incoming", valorSlider3);
  }  
  if (frameCount % 5 == 0) { // Solo actualiza cada 5 frames
     myChart2.push("incoming2", valorFotoresistencia);
  }
  
  dibujarVentanaValores(300, 350, 220, 110);
  
  // control Servo Motor
  int anguloServo = (int)cp5.getController("Servo").getValue();
  arduino.servoWrite(servoPin, -1*anguloServo); 
  dibujarServo(anguloServo);

  delay(100);
}


// Funciones
void dibujarLED(int x, int y, color c, int val) {
  fill(red(c), green(c), blue(c), val); // El brillo depende del valor
  noStroke();
  ellipse(x, y, 40, 40);
  stroke(255, 50);
  noFill();
  ellipse(x, y, 30, 30);
}

void dibujarVentanaValores(int x, int y, int w, int h) {
  // Fondo de la ventana con transparencia
  fill(0, 0, 0, 150); 
  stroke(255, 100);
  rect(x, y, w, h, 10); // El 10 es para bordes redondeados
  
  // Título de la ventana
  fill(0, 255, 0);
  textSize(12);
  text("DATOS EN TIEMPO REAL", x + 10, y + 20);
  
  // Valores de los Sliders/Knobs
  fill(255);
  textSize(14);
  
  // Obtenemos los valores actuales
  float v1 = cp5.getController("slider1").getValue();
  float v2 = cp5.getController("slider2").getValue();
  float v3 = cp5.getController("slider3").getValue();
  float v4 = arduino.analogRead(0);
  
  
  text("Led Rojo: " + nf(v1, 0, 1), x + 10, y + 45);
  text("Led Verde:     " + nf(v2, 0, 1), x + 10, y + 65);
  text("Led Azul:    " + nf(v3, 0, 1), x + 10, y + 85);
  text("Fotoresistencia:    " + nf(v4, 0, 1), x + 10, y + 105);
}

void dibujarServo(int angulo){
  // Dibujar una representación visual del brazo del servo
  pushMatrix();
  translate(450, 90); 
  rotate(radians(angulo)); // Rotar según el valor del knob
  stroke(0, 255, 0);
  strokeWeight(4);
  line(0, 0, 40, 0); // Línea que representa el brazo
  fill(100);
  ellipse(0, 0, 15, 15);
  popMatrix();
} 
