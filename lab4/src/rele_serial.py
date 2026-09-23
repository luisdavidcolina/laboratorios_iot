"""
Laboratorio IoT - Actividades 6.8 y 6.12
Consulta del estado del rele y envio de comandos a la placa por puerto serial.

El sketch rele.ino ya expone una interfaz de comandos de un caracter sobre el
puerto serial: '1' enciende, '0' apaga, 'S' devuelve el estado actual y 'H'
muestra la ayuda. Desde Python el puerto serial es bidireccional, de modo que
el mismo enlace sirve para escribir comandos y para leer las respuestas.

    pip install pyserial
"""

import time

import serial

PUERTO = "/dev/ttyUSB0"
BAUDRATE = 9600
TIMEOUT = 2

COMANDOS = {
    "1": "Encender el rele",
    "0": "Apagar el rele",
    "S": "Consultar el estado actual",
    "H": "Pedir la ayuda del sketch",
}


def enviar(enlace, comando, espera=0.4):
    """Envia un comando y devuelve las lineas que responda la placa."""
    enlace.reset_input_buffer()
    enlace.write(comando.encode("ascii"))
    enlace.flush()
    time.sleep(espera)

    respuesta = []
    while enlace.in_waiting:
        linea = enlace.readline().decode("utf-8", errors="ignore").strip()
        if linea:
            respuesta.append(linea)
    return respuesta


def consultar_estado(enlace):
    """Devuelve True si el rele esta activado, False si no, None si no responde."""
    for linea in enviar(enlace, "S"):
        if "[ESTADO]" in linea:
            return "DESACTIVADO" not in linea
    return None


def menu(puerto=PUERTO, baudrate=BAUDRATE, timeout=TIMEOUT):
    with serial.Serial(puerto, baudrate, timeout=timeout) as enlace:
        time.sleep(2)          # Esperar el reinicio de la placa
        enlace.reset_input_buffer()

        print(f"Conectado a {puerto} a {baudrate} baudios")
        estado = consultar_estado(enlace)
        print(f"Estado inicial del rele: {'ACTIVADO' if estado else 'DESACTIVADO'}")

        while True:
            print()
            for tecla, descripcion in COMANDOS.items():
                print(f"  {tecla} -> {descripcion}")
            print("  Q -> Salir")

            opcion = input("Comando: ").strip().upper()
            if opcion == "Q":
                break
            if opcion not in COMANDOS:
                print("Comando no reconocido.")
                continue

            for linea in enviar(enlace, opcion):
                print(f"  {linea}")


if __name__ == "__main__":
    try:
        menu()
    except serial.SerialException as error:
        print(f"No se pudo abrir el puerto: {error}")
    except KeyboardInterrupt:
        print("\nSesion terminada por el usuario.")
