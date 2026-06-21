import processing.serial.*;
import processing.net.*; // Librería nativa para sockets
import cc.arduino.*;

Arduino arduino;
Server miServidor;

int servoPin = 3; // Pin de control del servo motor asignado en Lab 3
int anguloServo = 90; // Posición inicial por seguridad (valor medio)

void setup() {
  size(300, 200); // Ventana pequeña informativa
  
  // Configuración de Arduino mediante protocolo Firmata
  // Asegúrate de usar el índice de puerto correcto en tu placa [index]
  arduino = new Arduino(this, Arduino.list()[2], 57600);  
  arduino.pinMode(servoPin, Arduino.SERVO);
  arduino.servoWrite(servoPin, anguloServo); // Mover a la posición inicial
  
  // Inicia el servidor Socket en el puerto 12345
  miServidor = new Server(this, 12345);
  println("Servidor Socket TCP iniciado. Esperando control del servo...");
}

void draw() {
  background(50);
  fill(255);
  textSize(14);
  text("SERVIDOR IOT ACTIVO", 20, 40);
  text("Servo Pin: " + servoPin, 20, 80);
  text("Último Ángulo Recibido: " + anguloServo + "º", 20, 120);
  
  // Leer datos provenientes del cliente de internet
  Client clienteEntrante = miServidor.available();
  
  if (clienteEntrante != null) {
    // Lee la cadena hasta encontrar el delimitador '\n' que enviamos
    String cadenaRecibida = clienteEntrante.readStringUntil('\n');
    
    if (cadenaRecibida != null) {
      cadenaRecibida = trim(cadenaRecibida); // Elimina espacios o caracteres extra
      
      try {
        // Convertimos el texto a número entero
        int nuevoAngulo = int(cadenaRecibida);
        
        // Validamos protección de rango antes de enviar a hardware
        if (nuevoAngulo >= 0 && nuevoAngulo <= 180) {
          anguloServo = nuevoAngulo;
          arduino.servoWrite(servoPin, anguloServo); // Escritura física al servo por internet
          println("Comando ejecutado exitosamente: " + anguloServo + " grados.");
        }
      } catch (Exception e) {
        println("Error interpretando la trama de red: " + e.getMessage());
      }
    }
  }
}
