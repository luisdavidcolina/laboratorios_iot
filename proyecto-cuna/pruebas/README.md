# Pruebas de la cuna

Hay dos formas de probar: el banco de verificación, que maneja Wokwi y el panel en un navegador, y los escenarios de Wokwi CLI.

## Banco de verificación

`banco/verificar.js` abre una copia temporal del proyecto de Wokwi, sin guardar, con un identificador aleatorio para no interferir con `lcolina`. Pega el programa y el circuito de este repositorio, mide los tiempos con un cliente MQTT y pulsa cada control del panel publicado.

```bash
# En una carpeta fuera del repositorio
npm init -y
npm i playwright mqtt
npx playwright install chromium

# Desde esa carpeta
NODE_PATH=./node_modules node <repositorio>/proyecto-cuna/pruebas/banco/verificar.js
```

No necesita cuenta de Wokwi. Deja los resultados y las capturas en `banco/salida/`, que no se sube a Git, y al terminar borra los mensajes retenidos de su identificador.

### Resultados del 1 de noviembre de 2026

Una corrida en un navegador sin interfaz. Los valores de tiempo cambian según el equipo.

| Medida | Antes | Después |
|---|---|---|
| Velocidad en Wokwi, mediana | 8 % | 25 % |
| Orden hasta el estado, mediana | 4 de 5 sin llegar en 20 s | 1,10 s, de 12 órdenes |
| Mínimo y máximo | – | 0,83 s y 5,90 s |
| Órdenes sin respuesta | – | 0 |
| Reconexiones | 1 en unos 4 min | 0 en 6 min |
| Panel con la simulación detenida | En línea hasta 40 s | Sin señal a los 16 s, apagada a los 45 s |

El broker respondió en una mediana de 234 ms ida y vuelta, así que no era el cuello de botella.

| Modo demo | Programado | Reloj real |
|---|---|---|
| Mecido suave | 0,2 s | 1,2 s |
| Mecido firme | 6 s | 11,9 s |
| Llanto prolongado y aviso | 18 s | 32,2 s |
| Límite del mecido | 30 s | 53,2 s |
| Calma, 2 s tras bajar el sonido | – | 57,6 s |

En una corrida más lenta, con el programa final, el aviso llegó a los 64,8 s y el límite a los 119,8 s.

Tres comprobaciones se hicieron en corridas aparte con el mismo programa, y `verificar.js` no las incluye:

- Histéresis y movimiento brusco con los controles reales del DHT22 y del MPU6050.
- Histéresis al subir, forzando 24, 25, 27, 25 y 24 °C: apagado, apagado, encendido, encendido, apagado.
- Ruido breve: tres ruidos de hasta 1 s simulado no dispararon el llanto, y uno sostenido sí.

## Escenarios de Wokwi CLI

| Archivo | Qué comprueba |
|---|---|
| `llanto_y_ambiente.yaml` | Llanto detectado, mecido suave, mecido firme, aviso de llanto prolongado, límite de 5 minutos, calma, cuarto caliente, pañal mojado y gas, en ese orden |
| `botones.yaml` | Que los botones físicos del circuito alternan la simulación del bebé y del llanto |

**No se han repetido con el programa final**, porque requieren un token. Pasaron con la versión anterior el 1 de noviembre de 2026. Conservan los ID de piezas y los textos de eventos, así que deberían seguir siendo válidos.

### Cómo correrlos

1. Crear un token en wokwi.com/dashboard/ci y guardarlo en la variable de entorno `WOKWI_CLI_TOKEN`. No se escribe en ningún archivo del repositorio.
2. Instalar `wokwi-cli` desde github.com/wokwi/wokwi-cli/releases.
3. Compilar el programa con `arduino-cli` para la placa `esp32:esp32:esp32`, con las librerías de `libraries.txt`.
4. Crear una carpeta con `diagram.json`, la salida de la compilación en `out/` y un `wokwi.toml` con este contenido:

```
[wokwi]
version = 1
firmware = 'out/cuna.ino.merged.bin'
```

5. Ejecutar `wokwi-cli <carpeta> --scenario <escenario>`.

Para `llanto_y_ambiente.yaml` hay que compilar con `--build-property "compiler.cpp.extra_flags=-DTIME_SCALE=10"`. Esa opción divide los tiempos del programa entre 10 al compilar. Es distinta del modo demo, que hace lo mismo en ejecución desde el panel. El programa final se entrega con `TIME_SCALE` en 1.
