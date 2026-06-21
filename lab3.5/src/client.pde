import controlP5.*;
import processing.net.*; // Librería nativa para sockets

Client miCliente;
ControlP5 cp5;
Knob knob1, knob2, knob3;
Slider slider1, slider2, slider3;
Chart myChart1;
Chart myChart2;

int anguloActual = 0;

void setup() {
  size(600, 500);
  cp5 = new ControlP5(this);
  
  // REPLAZA "127.0.0.1" por la IP del equipo donde está el Arduino. Puerto: 12345
  miCliente = new Client(this, "190.169.74.67", 8080); 

  // --- Crear Sliders ---
  cp5.addSlider("slider1").setPosition(50, 50).setRange(0, 255).setSize(150, 20);
  cp5.addSlider("slider2").setPosition(50, 110).setRange(0, 255).setSize(150, 20);
  cp5.addSlider("slider3").setPosition(50, 170).setRange(0, 255).setSize(150, 20);
  
  // --- Crear Knobs ---
  // Rango modificado a (0, 180) para facilitar la conversión directa a grados del servo
  cp5.addKnob("Servo").setPosition(500, 60).setRadius(30).setRange(0, 180).setValue(90);
  cp5.addKnob("knob2").setPosition(500, 150).setRadius(30).setRange(0, 255);
  cp5.addKnob("knob3").setPosition(500, 240).setRadius(30).setRange(0, 255);
  
  // --- Gráfico estático en Cliente ---
  myChart1 = cp5.addChart("ledVerde").setPosition(50, 200).setSize(200, 100).setRange(0, 255).setView(Chart.LINE);
  myChart1.addDataSet("incoming");
  myChart1.setData("incoming", new float[100]);
}

void draw() {
  background(30);
  
  int valorSlider1 = (int)cp5.getController("slider1").getValue();
  int valorSlider2 = (int)cp5.getController("slider2").getValue();
  int valorSlider3 = (int)cp5.getController("slider3").getValue();
  
  dibujarLED(260, 60, color(255, 0, 0), valorSlider1);
  dibujarLED(260, 120, color(0, 255, 0), valorSlider2);
  dibujarLED(260, 180, color(0, 0, 255), valorSlider3);
  
  // Dibujar la posición del servo localmente
  dibujarServo(anguloActual);
}

// Función que detecta los movimientos de la interfaz de forma eficiente
void controlEvent(ControlEvent elEvento) {
  if (elEvento.isController()) {
    if (elEvento.getController().getName().equals("Servo")) {
      anguloActual = (int)elEvento.getController().getValue();
      
      // Enviamos el valor por internet añadiendo un salto de línea '\n' como delimitador de fin de comando
      if (miCliente.active()) {
        miCliente.write(anguloActual + "\n");
      }
    }
  }
}

void dibujarLED(int x, int y, color c, int val) {
  fill(red(c), green(c), blue(c), val);
  noStroke();
  ellipse(x, y, 40, 40);
}

void dibujarServo(int angulo) {
  pushMatrix();
  translate(450, 90); 
  rotate(radians(angulo)); 
  stroke(0, 255, 0);
  strokeWeight(4);
  line(0, 0, 40, 0);
  fill(100);
  ellipse(0, 0, 15, 15);
  popMatrix();
}
