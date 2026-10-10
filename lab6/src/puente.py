# Puente entre el puerto serial de la placa y el broker Mosquitto.
# Lee cada linea que escribe el ESP32 y la publica en /Grupo1/distancia.
# Los topicos de temperatura y humedad llevan un valor fijo porque el
# unico sensor disponible fue el de ultrasonido.
import serial
import paho.mqtt.client as mqtt

GRUPO = "Grupo1"
ser = serial.Serial('/dev/ttyUSB0', 115200)
client = mqtt.Client()
client.connect('127.0.0.1', 1883, 60)

print("Escuchando a la placa por USB y enviando a Mosquitto...")

while True:
    if ser.in_waiting > 0:
        linea = ser.readline().decode('utf-8', errors='ignore').strip()
        try:
            d = float(linea)
            client.publish(f"/{GRUPO}/distancia", str(d))
            client.publish(f"/{GRUPO}/temperatura", "25.0")
            client.publish(f"/{GRUPO}/humedad", "60.0")
            print(f"MQTT Publicado -> Distancia: {d} cm")
        except ValueError:
            pass
