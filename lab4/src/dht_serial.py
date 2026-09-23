"""
Laboratorio IoT - Actividad 6.3
Lectura por puerto serial de los datos que el sketch del DHT publica.

El microcontrolador ya imprime las lecturas formateadas con Serial.println(),
asi que del lado del PC basta con abrir el mismo puerto a la misma velocidad
y leer linea por linea. La libreria pyserial se encarga de la parte del sistema
operativo.

    pip install pyserial
"""

import time

import serial

PUERTO = "/dev/ttyUSB0"   # Linux Mint del laboratorio. En Windows seria "COM3"
BAUDRATE = 9600           # Debe coincidir con el Serial.begin() del sketch
TIMEOUT = 2               # Segundos que readline() espera antes de rendirse


def leer_sensor(puerto=PUERTO, baudrate=BAUDRATE, timeout=TIMEOUT):
    """Abre el puerto serial e imprime cada linea que llegue del sensor."""
    with serial.Serial(puerto, baudrate, timeout=timeout) as enlace:
        # Abrir el puerto reinicia la placa, hay que darle tiempo al setup()
        time.sleep(2)
        enlace.reset_input_buffer()

        print(f"Conectado a {puerto} a {baudrate} baudios")
        print("Leyendo el DHT. Ctrl+C para detener.")
        print("-" * 46)

        while True:
            linea = enlace.readline().decode("utf-8", errors="ignore").strip()
            if not linea:
                continue

            marca = time.strftime("%H:%M:%S")
            if "ERROR" in linea:
                print(f"[{marca}] [FALLA] {linea}")
            else:
                print(f"[{marca}] {linea}")


if __name__ == "__main__":
    try:
        leer_sensor()
    except serial.SerialException as error:
        print(f"No se pudo abrir el puerto: {error}")
        print("Revise que la placa este conectada, que el puerto sea el correcto")
        print("y que el Monitor Serial del IDE de Arduino este cerrado.")
    except KeyboardInterrupt:
        print("\nLectura detenida por el usuario.")
