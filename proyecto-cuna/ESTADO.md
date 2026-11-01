# Estado del proyecto final, cuna inteligente

Corte del 1 de noviembre de 2026. La exposición es el 2 de noviembre.

## Qué es y por qué se eligió

Cuna con ESP32 que detecta el llanto, mece con una intensidad que crece según la duración, controla un ventilador con histéresis y avisa a un panel web por MQTT. Todo el trabajo es en simulación sobre Wokwi.

Se partió de que fuera un producto práctico y útil para la casa, de nivel de estudiante, que se controlara desde el celular y que no se pareciera al comedero de gato con Telegram que hicieron otros compañeros. La cuna salió de la lista de 25 proyectos de Robocraze, donde figura como el número 19. Se descartaron la mascota virtual, el arcade, el invernadero, el parqueadero, la puerta con teclado, el radar, la papelera, el semáforo, el sismógrafo, el pastillero, el acuario, el brazo, la expendedora, la casa con cerebro y los monitores de energía, caídas, aire y clima.

## Hecho y verificado

| Qué | Cómo se verificó |
|---|---|
| El programa compila para ESP32 | `arduino-cli`, 974 KB de 1.280 KB disponibles |
| El circuito carga en Wokwi sin errores de pines | `wokwi-cli`, que solo reporta una advertencia por el tipo de placa, que no está documentado |
| El ESP32 se conecta al WiFi `Wokwi-GUEST` y al broker de HiveMQ | Mensaje "Cuna conectada" en el simulador y mensajes recibidos desde un cliente externo |
| Detección de llanto, mecido suave, firme, aviso prolongado, límite de 5 minutos, calma, calor, pañal y gas | Escenario `pruebas/llanto_y_ambiente.yaml`, con los tiempos acelerados diez veces |
| El relé del ventilador sube con 27,5 °C | `expect-pin` en una corrida del simulador |
| Los botones físicos del circuito activan la simulación | Escenario `pruebas/botones.yaml`, hasta el aviso de mecido suave |
| El panel recibe el estado, muestra la escena y envía órdenes que el ESP32 ejecuta | Navegador automatizado pulsando los botones del panel con el ESP32 corriendo en Wokwi. Capturas en `vista_previa/` |

## Hecho, sin verificar

- El circuito visto en el editor de Wokwi. Se confirmó que carga, pero nadie ha visto el dibujo con el nuevo `diagram.json` ordenado.
- La velocidad de la simulación en el navegador de Wokwi. En la línea de comandos corre a un cuarto de la velocidad real.
- Los tiempos reales sin acelerar de principio a fin. El plan gratuito corta la sesión a los 5 minutos.
- La lectura del MPU6050, que el programa calcula pero ninguna regla usa todavía.
- La calibración de los umbrales con valores de un sensor real.

## Pendiente

### Depende de Luisdavid

1. Probar el proyecto en wokwi.com y aprobar la simulación o decir qué cambiar. Los pasos están en `README.md`.
2. Revocar el token de Wokwi CI en wokwi.com/dashboard/ci cuando pase la exposición.

### Listo el 1 de noviembre

- `expo/index.html` creado. La presentación abre con doble clic.
- 3 láminas faltantes escritas: resultados, conclusiones y referencias (`04-resultados.js`).
- Capturas del panel copiadas a `expo/assets/img/`.
- `guion.md` escrito con el texto hablado de cada lámina.
- Informe: sección de resultados completada con capturas y descripción de los tres escenarios. Marca `\pendiente` eliminada.
- `diagram.json` reordenado: piezas en zonas separadas, cables sin pisarse.

## Límites conocidos

- Sonido, peso, gas y pañal son controles deslizantes porque Wokwi no incluye micrófono y su celda de carga solo se maneja con escenarios.
- El broker público de HiveMQ no tiene autenticación. Cualquiera que conozca el identificador `lcolina` puede leer el estado o enviar órdenes.
- El panel marca "sin señal" si pasan 40 segundos sin estado.
- Con la cuna vacía el llanto no produce respuesta, a propósito. En la demostración hay que poner primero al bebé.

## Archivos

| Ruta | Contenido |
|---|---|
| `sketch.ino` | Programa del ESP32 |
| `diagram.json` | Circuito de Wokwi (reordenado el 1-nov) |
| `libraries.txt` | Librerías para Wokwi |
| `panel/` | Panel web con la escena animada y los botones de simulación |
| `pruebas/` | Escenarios automáticos y cómo correrlos |
| `informe/` | Informe en LaTeX y su PDF |
| `expo/` | Presentación completa, abre con doble clic en `expo/index.html` |
| `guion.md` | Texto hablado de cada lámina |
| `vista_previa/` | Capturas del panel con el ESP32 corriendo en el simulador |
| `README.md` | Cómo montarlo en Wokwi y los comandos MQTT |
