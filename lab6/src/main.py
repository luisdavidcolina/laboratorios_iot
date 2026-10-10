# Firmware MicroPython para el ESP32. Mide con el HC-SR04 y escribe la
# distancia en centimetros por el puerto serial, una lectura por linea.
# Se copia a la placa con: mpremote cp main.py :main.py
import machine, time

trig = machine.Pin(12, machine.Pin.OUT)
echo = machine.Pin(14, machine.Pin.IN)


def medir():
    trig.value(0)
    time.sleep_us(2)
    trig.value(1)
    time.sleep_us(10)
    trig.value(0)
    t = machine.time_pulse_us(echo, 1, 30000)
    return round((t * 0.0343) / 2, 2) if t > 0 else 0


while True:
    print(medir())
    time.sleep(0.5)
