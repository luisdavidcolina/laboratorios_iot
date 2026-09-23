
import serial
import time

# Configuración del puerto serie
PUERTO = 'COM3'        # Windows: 'COM3', Linux/Mac: '/dev/ttyUSB0' o '/dev/ttyACM0'
BAUDRATE = 9600
TIMEOUT = 1

def leer_dht11():
    """Lee datos del DHT-11 por puerto serie"""
    try:
        # Abrir conexión serial
        with serial.Serial(PUERTO, BAUDRATE, timeout=TIMEOUT) as ser:
            time.sleep(2)  # Esperar a que Arduino se inicialice
            
            print(f"Conectado a {PUERTO} a {BAUDRATE} baudios")
            print("Leyendo datos del sensor DHT-11...")
            print("-" * 40)
            
            while True:
                # Leer línea del puerto serie
                linea = ser.readline().decode('utf-8').strip()
                
                if linea:
                    if "ERROR" in linea:
                        print(f"[ERROR] {linea}")
                    else:
                        print(f"[{time.strftime('%H:%M:%S')}] {linea}")
                
    except serial.SerialException as e:
        print(f"Error de conexión: {e}")
        print("Verifica:")
        print(f"  - Puerto correcto: {PUERTO}")
        print("  - Arduino conectado")
        print("  - Ningún otro programa usando el puerto")
    except KeyboardInterrupt:
        print("\nLectura detenida por el usuario")

if __name__ == "__main__":
    leer_dht11()