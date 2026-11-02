# Guion hablado, cuna inteligente

Exposición del 2 de noviembre de 2026. Luisdavid Colina y Samantha Ramírez.

Duración estimada: 11:55, sin ensayar. Quien expone cada lámina va entre corchetes.

---

## Antes de empezar

1. Dos minutos antes, pulsar ▶ en Wokwi. El primer dato tarda alrededor de un minuto y medio. Con `lcolina` solo debe correr una simulación.
2. Abrir [proyecto-cuna.vercel.app](https://proyecto-cuna.vercel.app) en otra ventana, visible al lado de Wokwi. Debe decir «Cuna: en línea».
3. Abrir la aplicación ntfy en un teléfono, suscrita a `ucv6565-cuna-lcolina`, con el sonido activado.
4. En el panel, pulsar «Restablecer» por si quedó algo de una prueba anterior.

---

## Lámina 1 — Portada (0:00 a 0:20) [Samantha]

Buenas. Somos Samantha Ramírez y Luisdavid Colina, y les presentamos la cuna inteligente,
nuestro proyecto final. Es un sistema con ESP32 y MQTT que detecta el llanto, mece la cuna y
avisa al teléfono. Lo desarrollamos y lo verificamos en simulación, sobre Wokwi.

---

## Lámina 2 — Planteamiento (0:20 a 0:55) [Samantha]

Quien cuida a un bebé no puede quedarse junto a la cuna toda la noche. Hay tres situaciones
que piden atención y una cuna común no avisa de ninguna: el llanto, el pañal mojado y el
cuarto fuera de temperatura. Nuestro objetivo es detectarlas, responder con un movimiento
graduado y avisar al teléfono.

---

## Lámina 3 — Antecedentes (0:55 a 1:25) [Samantha]

Revisamos proyectos parecidos. Uno de Intel usa ESP32 con alertas por Blynk, otro de la
Universidad An-Najah añade el pañal y el ventilador, y un artículo de este año distingue los
ruidos breves del llanto real. De ahí tomamos la duración mínima. Lo nuestro agrega la
respuesta por escalones, la histéresis y el aviso al teléfono con el panel cerrado.

---

## Lámina 4 — Casos de uso (1:25 a 2:15) [Samantha]

Nuestro actor es quien cuida al bebé, quizá en otra habitación. Si el bebé llora con
insistencia, la cuna mece sola y a los tres minutos avisa. Si se moja el pañal o hay gas o
humo, llega una notificación, con prioridad máxima en el caso del gas. Si el cuarto se
calienta, prende el ventilador sin molestar a nadie. Y desde el panel se puede mecer o
ajustar la cuna a distancia, con confirmación de cada orden.

---

## Lámina 5 — Componentes de hardware (2:15 a 3:05) [Luisdavid]

Usamos un ESP32 con WiFi, un DHT22 para temperatura y humedad, y un MPU6050 para el
movimiento. Las salidas son un servo, un relé con un LED que hace de ventilador, un LED de
alerta, un buzzer y una pantalla OLED. Las filas resaltadas son deslizantes, porque Wokwi no
trae micrófono y su balanza y su sensor de gas no se mueven a mano. En un montaje real serían
un micrófono, una celda de carga, un MQ2 y un sensor de humedad.

---

## Lámina 6 — Herramientas de software (3:05 a 3:35) [Luisdavid]

El programa está en Arduino con C++. Wokwi lo compila y simula todo. Usamos HiveMQ como
broker público, MQTT.js en el panel, ntfy para los avisos y Vercel para publicar, que se
actualiza con cada push. Las mediciones las automatizamos con Playwright.

---

## Lámina 7 — Arquitectura (3:35 a 4:25) [Luisdavid]

El ESP32 publica su estado en el broker, y el panel se suscribe. Las órdenes hacen el camino
inverso por otro tópico. Agregamos un tópico de presencia con el último deseo de MQTT: si la
cuna se apaga sin avisar, el broker publica `offline` por ella. Los avisos urgentes van aparte,
por HTTP hacia ntfy, para que lleguen aunque el panel esté cerrado.

---

## Lámina 8 — Diagrama del circuito (4:25 a 5:05) [Luisdavid]

Ordenamos el circuito con dos reglas. Cada pieza va del lado donde está su pin, en el mismo
orden, así ningún cable cruza la placa. Y la alimentación usa símbolos VCC y GND propios de
cada pieza, en lugar de 24 cables hacia dos pines. Comprobamos que los deslizantes recorren
de 0 a 4095 sin saturarse.

---

## Lámina 9 — Diagrama funcional (5:05 a 6:05) [Samantha]

Este es el diagrama de estados del llanto. Con dos segundos de ruido y el bebé presente, se
confirma el llanto y empieza el mecido suave. Al minuto pasa a firme. A los tres minutos suena
la alarma y llega el aviso al teléfono. A los cinco minutos el mecido se detiene siempre y
descansa dos minutos. Desde cualquier estado, veinte segundos de silencio devuelven la cuna a
tranquila. Como eso no cabe en una exposición, agregamos un modo demo que divide los tiempos
entre diez.

---

## Lámina 10 — Ambiente del cuarto (6:05 a 6:45) [Samantha]

El ventilador enciende a 26 grados y apaga a 24 y medio. Esa diferencia es la histéresis: evita
que el relé se active y se desactive sin parar. Cada aviso sale una sola vez y se rearma cuando
la medida vuelve a un margen seguro, para que el panel no se llene de mensajes.

---

## Lámina 11 — Código clave (6:45 a 7:45) [Luisdavid]

A la izquierda está la escalada: según la duración sube el mecido y a los tres minutos avisa
al teléfono. Abajo, el último deseo al conectar. A la derecha, lo que resolvió el tiempo real:
el estado sale al instante si algo cambió, con un latido cada segundo, y una pausa de diez
milisegundos que deja correr más rápido a la simulación. Abajo, el panel: cada orden se repite
hasta tres veces si el estado no la confirma.

---

## Lámina 12 — Demo en vivo (7:45 a 10:05) [Luisdavid maneja, Samantha explica]

Luisdavid pulsa y Samantha narra.

1. **Luisdavid:** pulsa «Bebé en la cuna» y «Modo demo ×10».
   **Samantha:** «Cada botón se marca en verde cuando la cuna confirma la orden».
2. **Luisdavid:** pulsa «Hacer llorar».
   **Samantha:** «Se detecta el llanto y empieza el mecido suave. Miren el servo y la escena». Unos 10 a 20 segundos después: «Sube a mecido firme». Entre 30 y 65 segundos después de empezar: «Sonó la alarma y llegó el aviso al teléfono», y lo muestra.
3. **Luisdavid:** pulsa «Restablecer», y luego «27 °C», «25 °C» y «24 °C», esperando el cambio en cada uno.
   **Samantha:** «A 27 enciende. A 25 sigue encendido, esa es la histéresis. A 24 apaga».
4. **Luisdavid:** pulsa «Lectura real» y «Fuga de gas».
   **Samantha:** «Alarma, LED rojo, panel en alerta y notificación con prioridad máxima». Luisdavid vuelve a pulsar «Fuga de gas» para apagarla.
5. **Luisdavid:** detiene la simulación en Wokwi.
   **Samantha:** «A los 16 segundos el panel marca sin señal y desactiva los controles. Unos 45 segundos después el broker avisa que la cuna se apagó». No hace falta esperar a este último.

El aviso del mismo tipo no se repite antes de 30 segundos de simulación. Si se ensayó justo antes, puede no llegar. Si el tiempo aprieta, omitir el paso 5.

Si Wokwi o el broker fallan, ir a la lámina 14.

---

## Lámina 13 — Resultados (10:05 a 11:05) [Samantha]

Medimos con un programa automático. La causa de la lentitud no era el broker: era la simulación.
Con el programa anterior, cuatro de cinco órdenes no se reflejaban en veinte segundos. Ahora la
mediana es de 1,10 segundos en 12 órdenes, ninguna sin respuesta, con un máximo de 5,90. Es una
corrida por versión y cambia según el equipo. También comprobamos la histéresis, el rearme de gas
y pañal coincidiendo con el panel, los cuatro tipos de aviso y todos los controles.

---

## Lámina 14 — Capturas reales (solo si falla la demo) [quien esté manejando]

Saltar con el número 14 seguido de una pausa. «Estas son capturas reales de la simulación. El
circuito durante un llanto, el panel y los avisos que llegaron a ntfy».

---

## Lámina 15 — Conclusiones (11:05 a 11:45) [Luisdavid]

Cuatro conclusiones. La respuesta por escalones ignora los ruidos breves y reserva el aviso para
lo prolongado. La histéresis mantiene el estado del relé entre los dos umbrales. El tiempo real
hay que medirlo antes de culpar al broker. Y MQTT nos permitió cambiar el panel y el programa por
separado. La limitación es clara: todo es simulación y los umbrales no están calibrados.

---

## Lámina 16 — Referencias (11:45 a 11:55) [Luisdavid]

Estas son nuestras referencias, y de los artículos tomamos solo parámetros de diseño. Gracias.
