# Estado del proyecto final, cuna inteligente

Corte del 1 de noviembre de 2026. La exposición es el 2 de noviembre. Integrantes: Luisdavid Colina y Samantha Ramírez.

## Qué es y por qué se eligió

Cuna con ESP32 que detecta el llanto, mece con una intensidad que crece según la duración, controla un ventilador con histéresis y avisa a un panel web por MQTT y al teléfono por ntfy. Todo el trabajo es en simulación sobre Wokwi.

Se partió de que fuera un producto práctico y útil para la casa, de nivel de estudiante, que se controlara desde el celular y que no se pareciera al comedero de gato con Telegram que hicieron otros compañeros. La cuna salió de la lista de 25 proyectos de Robocraze, donde figura como el número 19.

## Verificado el 1 de noviembre

Con el programa y el circuito finales, en copias temporales de Wokwi con identificador propio y contra el panel publicado. El método y los resultados están en `pruebas/README.md`.

| Qué | Resultado |
|---|---|
| Tiempo real, 12 órdenes | Mediana 1,10 s, mínimo 0,83 s, máximo 5,90 s, ninguna perdida |
| Reconexiones | 0 en 6 min y 0 en otra corrida de 9 min |
| Modo demo | Suave 1,2 s, firme 11,9 s, aviso 32,2 s, límite 53,2 s, calma 57,6 s |
| Histéresis | Subiendo, 25 sigue apagado y 27 enciende. Bajando, 25 sigue encendido y 24 apaga |
| Ruido breve | Tres ruidos de hasta 1 s simulado no disparan el llanto, uno sostenido sí |
| Gas y pañal | Rearme correcto, el panel coincide con la alarma real |
| Movimiento | 2 g genera el aviso y el LED, 1 g rearma |
| Avisos a ntfy | Los cuatro tipos, con HTTP 200 desde Wokwi |
| Controles | Cuatro botones y 28 usos del panel publicado, todos confirmados |
| Deslizantes | 0, 2050 y 4095. Peso 0, 4 y 8 kg |
| Apagado | Sin señal a los 16 s, LWT a los 45 s. Al recargar nunca dice en línea |
| Circuito | Todos los cables visibles, ninguno se cruza, sin avisos ERC |
| Diapositivas | 16 láminas revisadas, sin desbordes ni recursos 404 |
| Despliegue | `proyecto-cuna.vercel.app` se actualizó solo tras el push |

## Sin verificar

- Recibir el aviso en un teléfono físico. Se comprobó consultando el tema de ntfy y en su página web.
- Los tiempos sin dividir de 60 s, 180 s y 5 min de principio a fin, en reloj normal.
- La velocidad en un navegador con interfaz. Las medidas son de un navegador sin interfaz, en este equipo.
- Los escenarios `pruebas/*.yaml` con el programa final, porque requieren un token de Wokwi.
- La duración de 11:55 de la exposición, que es una estimación sin ensayar.
- La calibración de los umbrales con valores de un sensor real.

## Pendiente

### Depende de Luisdavid

1. Pegar `sketch.ino`, `diagram.json` y `libraries.txt` en el proyecto de Wokwi y guardar. **Hasta entonces el panel avisa que la cuna corre un programa antiguo.**
2. Revocar el token de Wokwi CI en wokwi.com/dashboard/ci después de la exposición.

### Grafana

No se hizo. Es opcional y requiere abrir Docker Desktop para poder probarlo.

## Límites conocidos

- Sonido, peso, gas y pañal son controles deslizantes porque Wokwi no incluye micrófono y su celda de carga solo se maneja con escenarios.
- El broker público de HiveMQ y el tema de ntfy no tienen autenticación. Cualquiera que conozca el identificador puede leer el estado o enviar órdenes.
- Dos simulaciones con el mismo identificador mezclan sus datos. Debe correr una sola con `lcolina`.
- Tras detener la simulación, Wokwi no cierra la conexión, así que el aviso de apagado tarda 1,5 veces el keepalive de 30 s.
- La notificación del navegador solo funciona con el panel abierto, y en Android solo suena. Para el teléfono está ntfy.
- Con la cuna vacía el llanto no produce respuesta, a propósito. En la demostración hay que poner primero al bebé.

## Archivos

| Ruta | Contenido |
|---|---|
| `sketch.ino` | Programa del ESP32 |
| `diagram.json` | Circuito de Wokwi |
| `libraries.txt` | Librerías para Wokwi |
| `panel/` | Panel web |
| `pruebas/` | Escenarios de Wokwi CLI, banco de verificación y resultados |
| `informe/` | Informe en LaTeX y su PDF |
| `expo/` | Presentación completa, abre con doble clic en `expo/index.html` |
| `guion.md` | Texto hablado de cada lámina, repartido entre los dos, y guion de la demo |
| `vista_previa/` | Capturas reales del panel y del circuito |
| `README.md` | Cómo montarlo, enlaces, comandos y tópicos MQTT |
