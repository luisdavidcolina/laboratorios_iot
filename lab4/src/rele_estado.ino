/*
 * Laboratorio IoT - Actividad 6.7
 * Control de rele por puerto serial, sin secuencia automatica.
 * Placa usada en el laboratorio: Arduino UNO
 *
 * Diferencia con rele.ino: se elimina el bloque que alternaba el estado cada
 * 5 segundos. El rele conserva el ultimo estado indefinidamente y solo cambia
 * cuando llega un comando por el puerto serial.
 */

// Definicion de pines
#define PIN_RELE      2       // Control del rele
#define PIN_LED_IND   13      // LED indicador onboard

// Variable de estado, es la unica fuente de verdad del actuador
bool estadoRele = false;

void setup() {
  Serial.begin(9600);

  pinMode(PIN_RELE, OUTPUT);
  pinMode(PIN_LED_IND, OUTPUT);

  // Estado inicial seguro: rele apagado (modulo activo LOW)
  aplicarEstado(false);

  Serial.println(F("========================================"));
  Serial.println(F("  LABORATORIO IoT - RELE CON ESTADO"));
  Serial.println(F("========================================"));
  Serial.print(F("  Pin de control: Digital "));
  Serial.println(PIN_RELE);
  Serial.println(F("  El rele solo cambia por comando serial."));
  mostrarAyuda();
}

void loop() {
  // El lazo no toca el actuador, solo atiende comandos entrantes
  if (Serial.available() > 0) {
    char comando = Serial.read();
    procesarComando(comando);
  }
}

// Centraliza la escritura al hardware para que el estado logico y el
// estado fisico no puedan quedar desincronizados
void aplicarEstado(bool encendido) {
  estadoRele = encendido;
  digitalWrite(PIN_RELE, encendido ? LOW : HIGH);   // Activo LOW
  digitalWrite(PIN_LED_IND, encendido ? HIGH : LOW);
}

void procesarComando(char cmd) {
  switch (cmd) {
    case '1':
    case 'E':
    case 'e':
      aplicarEstado(true);
      Serial.println(F("[MANUAL] Rele ACTIVADO"));
      break;

    case '0':
    case 'A':
    case 'a':
      aplicarEstado(false);
      Serial.println(F("[MANUAL] Rele DESACTIVADO"));
      break;

    case 'S':
    case 's':
      Serial.print(F("[ESTADO] Rele: "));
      Serial.println(estadoRele ? F("ACTIVADO") : F("DESACTIVADO"));
      break;

    case 'H':
    case 'h':
      mostrarAyuda();
      break;

    case '\r':
    case '\n':
      break;   // Ignorar los saltos de linea del monitor serial

    default:
      Serial.println(F("Comando no reconocido. Envie 'H' para ayuda."));
  }
}

void mostrarAyuda() {
  Serial.println(F("\n--- COMANDOS DISPONIBLES ---"));
  Serial.println(F("  1, E, e  -> Encender rele"));
  Serial.println(F("  0, A, a  -> Apagar rele"));
  Serial.println(F("  S, s     -> Estado actual"));
  Serial.println(F("  H, h     -> Esta ayuda\n"));
}
