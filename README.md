# Laboratorios IoT, Escuela de Computación, UCV

Repositorio de informes de laboratorio de la asignatura **6565 Laboratorio General (Internet de las Cosas)**, Escuela de Computación, Facultad de Ciencias, Universidad Central de Venezuela.

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
| `lab4` | Sensores y actuadores (DHT-22 y relé) | Entregado |
| `lab5` | Protocolo MQTT con Mosquitto | Entregado |
| `lab6` | Visualización de datos con Grafana | Práctica del 09/10/2026 |

### Notas del lab6

- El montaje se hizo con una placa ESP32 y un HC-SR04, no con Raspberry Pi ni Fritzing.
- Los tópicos de temperatura y humedad van con valor fijo porque el único sensor
  disponible fue el de ultrasonido.
- Las actividades 5.3 y 5.4 de la guía quedaron fuera del informe por decisión del equipo.

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
