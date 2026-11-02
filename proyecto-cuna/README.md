# Cuna inteligente, proyecto de Laboratorio General de IoT 6565

Proyecto final de Luisdavid Colina y Samantha Ramírez. Solo simulación, en Wokwi, con panel web, MQTT y avisos al teléfono.

## Enlaces

| Recurso | Enlace |
|---|---|
| Panel web | [proyecto-cuna.vercel.app](https://proyecto-cuna.vercel.app) |
| Diapositivas | [cuna-iot-diapositivas.vercel.app](https://cuna-iot-diapositivas.vercel.app) |
| Simulación | [Proyecto en Wokwi](https://wokwi.com/projects/479524283087739905) |
| Repositorio | [luisdavidcolina/laboratorios_iot](https://github.com/luisdavidcolina/laboratorios_iot) |

El panel y las diapositivas se despliegan automáticamente en Vercel cuando se hace `push` a la rama `main`. Wokwi no se actualiza con el `push`: hay que pegar los archivos a mano.

## Qué hay en la carpeta

| Archivo | Para qué sirve |
|---|---|
| `sketch.ino` | Programa del ESP32 |
| `diagram.json` | Circuito de Wokwi |
| `libraries.txt` | Librerías que Wokwi debe instalar |
| `panel/index.html` | Panel web para el celular o el computador |
| `panel/mqtt.min.js` | Librería MQTT local, para no depender de internet salvo el broker |
| `expo/index.html` | Presentación web del proyecto |
| `expo/assets/` | Estilos, fuentes, imágenes y código de las diapositivas |
| `guion.md` | Texto hablado de cada lámina, repartido entre los dos |
| `pruebas/` | Escenarios de prueba, banco de verificación y resultados |
| `informe/` | Informe académico en PDF y fuente LaTeX |
| `vista_previa/` | Capturas reales del panel y del circuito |

El repositorio contiene dos proyectos de Vercel dentro de la misma carpeta:

| Proyecto Vercel | Carpeta raíz | Salida |
|---|---|---|
| `proyecto-cuna` | `proyecto-cuna/` | Panel web |
| `cuna-iot-diapositivas` | `proyecto-cuna/expo/` | Diapositivas |

## Flujo de trabajo con Git

```bash
git clone https://github.com/luisdavidcolina/laboratorios_iot.git
cd laboratorios_iot/proyecto-cuna
```

Después de realizar cambios:

```bash
git status
git add .
git commit -m "Describe el cambio"
git push origin main
```

No se deben subir `.env.local` ni las carpetas `.vercel/`; están excluidas por `.gitignore`. Los cambios de `diagram.json` deben estar completos y probados en Wokwi antes de hacer `push`.

## Probar localmente

```bash
python -m http.server 8000
```

Luego abrir `http://localhost:8000/panel/` o `http://localhost:8000/expo/`. También abren con doble clic.

## Cómo montarlo en Wokwi

1. Abrir el proyecto en wokwi.com. Quien no sea su dueño debe guardar una copia propia.
2. Pegar el contenido de `sketch.ino` en la pestaña `sketch.ino`.
3. Pegar el contenido de `diagram.json` en la pestaña `diagram.json`.
4. Pegar el contenido de `libraries.txt` en la pestaña `libraries.txt`.
5. Guardar e iniciar la simulación con el botón verde. El primer dato tardó entre 71 y 87 s en las pruebas, sobre todo por la compilación.

**Una sola simulación a la vez con `lcolina`.** Dos simulaciones con el mismo identificador mezclan sus datos en el panel y ambas obedecen las mismas órdenes. Para probar en paralelo, cambiar `CRADLE_ID` en la copia y abrir el panel con `?id=` y ese valor.

Conviene dejar Wokwi visible y el panel en otra ventana, no en una pestaña de fondo.

## Cómo abrir el panel

Abrir [proyecto-cuna.vercel.app](https://proyecto-cuna.vercel.app). El identificador debe coincidir con `CRADLE_ID` del programa, que por defecto es `lcolina`. Se puede cambiar en la parte de abajo del panel o con `?id=` en la dirección.

Arriba a la derecha se ven por separado el broker y la cuna:

| La cuna dice | Significa |
|---|---|
| en línea | Llegan datos en vivo. Los controles funcionan |
| esperando | Aún no llega un dato en vivo. Lo que se ve es el último dato conocido |
| sin señal | Dejó de enviar datos hace más de 15 s |
| apagada | El broker publicó el aviso de desconexión |

## Avisos al teléfono

1. Instalar la aplicación ntfy en el teléfono.
2. Suscribirse al tema `ucv6565-cuna-lcolina`.

El ESP32 envía ahí los avisos de gas, llanto prolongado, pañal mojado y movimiento brusco, con un mínimo de 30 s de simulación entre avisos del mismo tipo. El tema es público: cualquiera que conozca el nombre puede leerlo.

## Qué se maneja a mano en el simulador

| Control | Representa | Pin |
|---|---|---|
| Deslizante Sonido | Micrófono de llanto | 34 |
| Deslizante Peso | Balanza del colchón, de 0 a 8 kg | 33 |
| Deslizante Gas | Sensor MQ2 | 35 |
| Deslizante Pañal | Sensor de humedad del pañal | 32 |
| DHT22 | Temperatura y humedad del cuarto | 15 |
| MPU6050 | Movimiento de la cuna | 21 y 22 |

Los deslizantes están girados para que su señal quede frente al ESP32: su valor sube hacia la izquierda. El simulador no trae sensor de sonido ni una balanza que se pueda mover con el mouse, por eso esas dos entradas y las de gas y pañal son deslizantes. En un montaje real serían un micrófono, una celda de carga con HX711, un MQ2 y un sensor de humedad.

## Botones para provocar cada situación

| Botón | Situación | Pin |
|---|---|---|
| Llanto | Fuerza un ruido alto | 13 |
| Pañal mojado | Fuerza humedad en el pañal | 14 |
| Gas | Fuerza humo o gas | 16 |
| Bebé en la cuna | Fuerza un peso de 4 kg | 17 |

El panel tiene los mismos botones, más calentar el cuarto, forzar una temperatura, modo demo y restablecer. Con la cuna vacía el llanto no produce respuesta, a propósito: hay que poner primero al bebé.

## Salidas

Servo que mece la cuna, relé con un LED que hace de ventilador, LED rojo de alerta, buzzer y pantalla OLED de 128 por 64.

## Comandos MQTT

Se publican en `ucv6565/cuna/<identificador>/cmd`. Los acepta el programa y los envía el panel.

| Comando | Efecto |
|---|---|
| `rock:0` a `rock:3` | Detiene o mece con intensidad 1, 2 o 3 |
| `fan:auto`, `fan:on`, `fan:off` | Modo del ventilador |
| `cry:<valor>` | Cambia el umbral de llanto, de 100 a 4095 |
| `temp:<grados>` | Cambia la temperatura a la que prende el ventilador, de 10 a 40 |
| `beep` | Prueba del buzzer |
| `demo:on`, `demo:off` | Modo demo: divide los tiempos entre 10 |
| `sim:cry`, `sim:wet`, `sim:gas`, `sim:baby`, `sim:heat` | Alterna la situación simulada |
| `sim:cry:1`, `sim:cry:0` y lo mismo para los demás | Fija la situación. Repetir la orden no cambia nada |
| `sim:temp:<grados>`, `sim:temp:off` | Fuerza la temperatura o vuelve a la lectura real |
| `sim:off` | Apaga todas las situaciones simuladas |

## Tópicos MQTT

| Tópico | Contenido |
|---|---|
| `.../state` | Estado en JSON, retenido. Sale al instante si algo cambia y con un latido cada segundo de simulación |
| `.../event` | Texto de cada aviso |
| `.../status` | `online` u `offline`, retenido. El broker publica `offline` por el LWT si la cuna deja de responder |
| `.../cmd` | Órdenes hacia la cuna |
