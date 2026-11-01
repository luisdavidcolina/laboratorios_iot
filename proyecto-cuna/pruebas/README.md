# Pruebas automáticas en el simulador

Dos escenarios de Wokwi CLI que verifican el programa sin abrir el navegador.

| Archivo | Qué comprueba |
|---|---|
| `llanto_y_ambiente.yaml` | Llanto detectado, mecido suave, mecido firme, aviso de llanto prolongado, límite de 5 minutos, calma, cuarto caliente, pañal mojado y gas, en ese orden |
| `botones.yaml` | Que los botones físicos del circuito alternan la simulación del bebé y del llanto |

## Cómo correrlos

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

Para `llanto_y_ambiente.yaml` hay que compilar con `--build-property "compiler.cpp.extra_flags=-DTIME_SCALE=10"`. Esa opción divide los tiempos del programa entre 10. Sin ella la prueba no cabe en los 5 minutos que permite el plan gratuito de Wokwi. El programa final se entrega con `TIME_SCALE` en 1.

## Lo que se sabe de estas pruebas

- El 1 de noviembre de 2026 `llanto_y_ambiente.yaml` pasó completo con la compilación acelerada.
- El simulador por línea de comandos corre aproximadamente a un cuarto de la velocidad real.
- Los escenarios solo verifican los mensajes que el programa escribe. No miden el servo, el buzzer ni el relé.
- El 1 de noviembre de 2026 se comprobó aparte, con una corrida suelta, que el pin del relé sube a 1 cuando la temperatura pasa de 26 °C.
