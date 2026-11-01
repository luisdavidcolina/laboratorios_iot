# Guion hablado, cuna inteligente

Exposición del 2 de noviembre de 2026. Luisdavid Colina.

---

## Lámina 1 — Portada (0:00 a 0:25)

Buenas. Les presento la cuna inteligente, mi proyecto final del laboratorio de IoT.
La idea es un sistema con ESP32 y MQTT que detecta el llanto del bebé, mece la cuna
con una intensidad que crece según cuánto dura el llanto, controla un ventilador cuando
el cuarto se calienta y avisa a los padres en un panel web desde el teléfono. Todo el
trabajo se hizo en simulación sobre Wokwi.

---

## Lámina 2 — Planteamiento (0:25 a 1:05)

El problema es sencillo: quien cuida a un bebé no puede quedarse junto a la cuna
toda la noche. Hay tres situaciones que piden atención inmediata y una cuna común
no avisa de ninguna: el llanto, el pañal mojado y el cuarto fuera de temperatura.
El objetivo del proyecto es detectar las tres, responder con un movimiento graduado
y avisar al teléfono.

---

## Lámina 3 — Antecedentes (1:05 a 1:50)

Para no reinventar la rueda, busqué proyectos parecidos. El de Intel DevMesh usa un
ESP32 con sensor de sonido y alertas por Blynk, pero solo inclina la cuna. El de la
Universidad An-Najah añade el pañal y el ventilador. El artículo de IJIRT del año
pasado distingue ruidos breves del llanto real y responde en menos de dos segundos
y medio. De ahí saqué la condición de duración mínima.

Lo que agrego yo: la respuesta escala según cuánto dura el llanto, el ventilador
usa histéresis para no oscilar, y el panel se controla por MQTT con las mismas
órdenes que entiende el programa.

---

## Lámina 4 — Arquitectura (1:50 a 2:50)

La arquitectura es la estándar de IoT. El ESP32 lee los sensores y maneja los
actuadores. Cada dos segundos publica su estado en un broker MQTT público de HiveMQ,
y el panel web se suscribe a ese estado. Las órdenes hacen el camino inverso:
el panel publica en el tópico de comandos y el ESP32 las recibe. Los tópicos son
`ucv6565/cuna/` seguido del identificador de la cuna, para no mezclar con otros
proyectos del mismo broker.

---

## Lámina 5 — Circuito simulado (2:50 a 3:35)

El simulador no trae micrófono y su celda de carga solo se maneja con escenarios.
Por eso cuatro entradas son controles deslizantes que entregan un voltaje analógico:
sonido, peso, gas y pañal. En un montaje real serían un micrófono, una celda de
carga con HX711, un sensor MQ2 y un sensor de humedad. El resto sí existe en Wokwi
tal cual: DHT22, MPU6050, servo, relé, OLED y buzzer.

---

## Lámina 6 — Respuesta al llanto (3:35 a 4:40)

La lógica del llanto tiene cuatro etapas. Al detectar ruido alto durante dos segundos
con el bebé en la cuna, empieza el mecido suave. Al minuto, si el llanto continúa,
sube a mecido firme. A los tres minutos dispara la alarma y avisa a los padres. Si
el sonido baja y se mantiene bajo durante veinte segundos, el sistema da al bebé
por calmado y el mecido se detiene. Hay un límite de cinco minutos: el mecido
siempre se detiene ahí, descansa dos minutos, y solo entonces puede reiniciarse.

---

## Lámina 7 — Ambiente del cuarto (4:40 a 5:30)

El ventilador usa histéresis: enciende a 26 grados y apaga a 24,5. Eso evita que
el relé se active y desactive sin parar cuando la temperatura oscila cerca del límite.
El panel puede además forzarlo encendido o apagado.

Hay avisos para temperatura fuera de rango, humedad baja, pañal mojado y gas.
Cada aviso se emite una sola vez y se rearma cuando la medida vuelve al margen
seguro, de modo que el panel no se llena de mensajes repetidos.

---

## Lámina 8 — Resultados (5:30 a 7:00)

Corrí tres escenarios con el simulador. En el primero puse el bebé y subí el sonido:
el mecido suave arrancó a los dos segundos de confirmar el llanto, igual que en el
diseño. El segundo midió la histéresis del ventilador: encendió al llegar a 26
grados y no osciló al bajar. En el tercero subí el deslizante de gas: el aviso
llegó al panel de forma inmediata y la alarma sonó continua hasta que bajé el nivel.

---

## Lámina 9 — Conclusiones (7:00 a 8:00)

Cuatro conclusiones. Primero: escalar la respuesta según la duración reduce las
reacciones a ruidos aislados y reserva la alarma para los casos de verdad. Segundo:
la histéresis mantiene el relé estable. Tercero: MQTT desacopla la cuna del panel,
así que los dos se pueden cambiar de forma independiente. Cuarto: los controles
deslizantes del simulador reemplazan los sensores físicos sin alterar la lógica,
y eso queda declarado en el informe.

---

## Lámina 10 — Referencias (8:00 a 8:30)

Las referencias están en la lámina. Tomo los parámetros de diseño de los artículos
y los adapto, no copio los resultados. En particular, el artículo de PMC de 2025
reporta cifras inconsistentes entre secciones, así que de él solo tomé los rangos
de temperatura.

Gracias.
