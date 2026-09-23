# Laboratorios IoT — Escuela de Computación, UCV

Repositorio de informes de laboratorio de la asignatura **6565 — Laboratorio General (Internet de las Cosas)**, Escuela de Computación, Facultad de Ciencias, Universidad Central de Venezuela.

**Semestre:** 1-2026  
**Profesor:** Prof. Antonio Russoniello  
**Autores:** Luisdavid Colina (V-24.766.381) · Samantha Ramírez (V-31.307.714)

---

## Laboratorios

| Carpeta | Tema | Estado |
|---|---|---|
| `lab1` | Pines digitales en el ATmega2560 | Entregado |
| `lab2` | Comunicación serial y pines analógicos | Entregado |
| `lab3` | Interfaz gráfica con Processing y Firmata | Entregado |
| `lab3.5` | Control remoto con sockets y joystick | Entregado |
| `lab4` | Sensores y actuadores (DHT-22 y relé) | En curso, práctica del 18/09/2026 |
| `lab5` | Protocolo MQTT con Mosquitto | En curso, práctica del 11/09/2026 |

### Pendientes del lab4

- Diagramas en Fritzing de las actividades 6.1, 6.5 y 6.10.
- Captura del monitor serial del relé solo (6.6 y 6.7).
- Corrida de los scripts de Python `dht_serial.py` y `rele_serial.py` (6.3, 6.8 y 6.12).
- Forzar la condición de alarma del sistema integrado para evidenciar la rama que enciende el relé.

### Pendientes del lab5

- Intercambio con las etiquetas `cliente1`, `cliente2` y `cliente3` entre las tres máquinas.
- Sección 2.3 de la guía, cliente `paho-mqtt` en Python.
- Actividades 3.1 a 3.4, sensor de ultrasonido sobre Raspberry Pi publicando al broker.

---

## Estructura de cada laboratorio

```
labN/
  Enunciado.pdf     guía del profesor
  Informe.tex       fuente del informe
  Informe.pdf       informe compilado
  img/              evidencias recortadas
  src/              código propio
  anexos/           código de referencia entregado por el profesor
```

La plantilla común está en `templates/plantilla_base.tex` y los logos en `img/`.
Para compilar: `pdflatex Informe.tex` dos veces dentro de la carpeta del laboratorio.
