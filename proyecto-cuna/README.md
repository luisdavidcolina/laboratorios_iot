# Cuna inteligente, proyecto de Laboratorio General de IoT 6565

Proyecto final de Luisdavid Colina. Solo simulación, en Wokwi, con panel web y MQTT.

## Qué hay en la carpeta

| Archivo | Para qué sirve |
|---|---|
| `sketch.ino` | Programa del ESP32 |
| `diagram.json` | Circuito de Wokwi |
| `libraries.txt` | Librerías que Wokwi debe instalar |
| `panel/index.html` | Panel web para el celular o el computador |
| `panel/mqtt.min.js` | Librería MQTT local, para no depender de internet salvo el broker |

## Cómo montarlo en Wokwi

1. Entrar a wokwi.com, crear un proyecto nuevo con la placa ESP32.
2. Pegar el contenido de `sketch.ino` en la pestaña del programa.
3. Pegar el contenido de `diagram.json` en la pestaña `diagram.json`.
4. Pegar el contenido de `libraries.txt` en la pestaña `libraries.txt`.
5. Iniciar la simulación con el botón verde de reproducir. El ESP32 se conecta a la red `Wokwi-GUEST` y al broker público de HiveMQ.

El circuito completo se ve en el editor de Wokwi: el ESP32, los cuatro deslizantes, los cuatro botones, el servo, el relé con su LED, la pantalla OLED y el buzzer. Ahí se pulsan los botones y se mueven los deslizantes. El panel se abre aparte, en otra ventana del navegador, y muestra la cuna con el bebé reaccionando a lo mismo.

El `diagram.json` se copia y pega entre proyectos desde su pestaña, así que sirve para importar y exportar el circuito.

## Cómo abrir el panel

Abrir `panel/index.html` con doble clic. El identificador de la cuna debe coincidir con `CRADLE_ID` del programa, que por defecto es `lcolina`. Se puede cambiar en la parte de abajo del panel o con `?id=` en la dirección.

## Qué se maneja a mano en el simulador

| Control | Representa | Pin |
|---|---|---|
| Deslizante Sonido | Micrófono de llanto | 34 |
| Deslizante Peso | Balanza del colchón, de 0 a 8 kg | 33 |
| Deslizante Gas | Sensor MQ2 | 35 |
| Deslizante Panal | Sensor de humedad del pañal | 32 |
| DHT22 | Temperatura y humedad del cuarto | 15 |
| MPU6050 | Movimiento de la cuna | 21 y 22 |

El simulador no trae sensor de sonido ni una balanza que se pueda mover con el mouse, por eso esas dos entradas y las de gas y pañal son deslizantes. En un montaje real serían un micrófono, una celda de carga con HX711, un MQ2 y un sensor de humedad.

## Botones para provocar cada situación

El circuito tiene cuatro botones. Cada pulsación alterna la situación y el panel muestra el cambio.

| Botón | Situación | Pin |
|---|---|---|
| Llanto | Fuerza un ruido alto | 13 |
| Panal mojado | Fuerza humedad en el pañal | 14 |
| Gas | Fuerza humo o gas | 16 |
| Bebe en la cuna | Fuerza un peso de 4 kg | 17 |

El panel tiene los mismos botones, más uno para calentar el cuarto y otro para restablecer todo. Pulsar uno en el panel tiene el mismo efecto que pulsarlo en el circuito.

## Salidas

Servo que mece la cuna, relé con un LED que hace de ventilador, LED rojo de alerta, buzzer y pantalla OLED de 128 por 64.

## Comandos MQTT

Se publican en `ucv6565/cuna/<identificador>/cmd`. Los acepta el programa y los envía el panel.

| Comando | Efecto |
|---|---|
| `rock:0` a `rock:3` | Detiene o mece con intensidad 1, 2 o 3 |
| `fan:auto`, `fan:on`, `fan:off` | Modo del ventilador |
| `cry:<valor>` | Cambia el umbral de llanto |
| `temp:<grados>` | Cambia la temperatura a la que prende el ventilador |
| `beep` | Prueba del buzzer |
| `sim:cry`, `sim:wet`, `sim:gas`, `sim:baby` | Alterna la situación simulada |
| `sim:heat` | Alterna el calor forzado a 30 °C |
| `sim:off` | Apaga todas las situaciones simuladas |

El estado sale cada 2 segundos en `.../state` y los avisos en `.../event`.
