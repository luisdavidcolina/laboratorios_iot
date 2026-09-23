/*
 * Laboratorio IoT - Actividad 2: Control de Rele
 * Placa usada en el laboratorio: Arduino UNO
 */

// Definicion de pines
#define PIN_RELE      2       // Control del rele
#define PIN_LED_IND   13      // LED indicador onboard

// Constantes de temporizacion
const unsigned long INTERVALO_PRUEBA = 5000;  // 5 segundos

// Variables de estado
bool estadoRele = false;
unsigned long tiempoAnterior = 0;
int cicloPrueba = 0;

void setup() {
  Serial.begin(9600);

  // Configurar pines como salida
  pinMode(PIN_RELE, OUTPUT);
  pinMode(PIN_LED_IND, OUTPUT);

  // Estado inicial: rele apagado (HIGH si es activo LOW, verificar modulo)
  digitalWrite(PIN_RELE, HIGH);   // Asumiendo modulo activo LOW
  digitalWrite(PIN_LED_IND, LOW);

  Serial.println(F("========================================"));
  Serial.println(F("  LABORATORIO IoT - ACTUADOR RELE"));
  Serial.println(F("========================================"));
  Serial.println(F("Configuracion:"));
  Serial.print(F("  Pin de control: Digital "));
  Serial.println(PIN_RELE);
  Serial.println(F("  Tipo: Activo LOW (HIGH=Apagado, LOW=Encendido)"));
  Serial.println(F("\nIniciando secuencia de prueba...\n"));

  delay(1000);
}

void loop() {
  unsigned long tiempoActual = millis();

  // Secuencia automatica de prueba
  if (tiempoActual - tiempoAnterior >= INTERVALO_PRUEBA) {
    tiempoAnterior = tiempoActual;
  
    // Alternar estado
    estadoRele = !estadoRele;
    cicloPrueba++;
  
    // Activar/desactivar rele
    digitalWrite(PIN_RELE, estadoRele ? LOW : HIGH);  // Activo LOW
    digitalWrite(PIN_LED_IND, estadoRele ? HIGH : LOW);
  
    // Reporte por serial
    Serial.print(F("Ciclo #"));
    Serial.print(cicloPrueba);
    Serial.print(F(" | Estado Rele: "));
    Serial.print(estadoRele ? F("ACTIVADO (ON)") : F("DESACTIVADO (OFF)"));
    Serial.print(F(" | LED: "));
    Serial.println(estadoRele ? F("ENCENDIDO") : F("APAGADO"));
  
    // Indicar accion fisica esperada
    if (estadoRele) {
      Serial.println(F("  -> Carga conectada a COM-NO debe estar ENERGIZADA"));
    } else {
      Serial.println(F("  -> Carga conectada a COM-NO debe estar APAGADA"));
    }
    Serial.println();
  }

  // Verificar comando manual por serial
  if (Serial.available() > 0) {
    char comando = Serial.read();
    procesarComando(comando);
  }
}

void procesarComando(char cmd) {
  switch (cmd) {
    case '1':
    case 'E':
    case 'e':
      estadoRele = true;
      digitalWrite(PIN_RELE, LOW);
      digitalWrite(PIN_LED_IND, HIGH);
      Serial.println(F("[MANUAL] Rele ACTIVADO"));
      break;
    
    case '0':
    case 'A':
    case 'a':
      estadoRele = false;
      digitalWrite(PIN_RELE, HIGH);
      digitalWrite(PIN_LED_IND, LOW);
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
