# Laboratorios IoT — Escuela de Computación, UCV

Repositorio de informes de laboratorio de la asignatura **6565 — Laboratorio General (Internet de las Cosas)**, Escuela de Computación, Facultad de Ciencias, Universidad Central de Venezuela.

**Semestre:** 1-2026  
**Profesor:** Prof. Antonio Russoniello  
**Autores:** Luisdavid Colina (V-24.766.381) · Samantha Ramírez (V-31.307.714)

---

## Estructura

```
lab1/   — Laboratorio #1: Pines Digitales en el Microcontrolador ATmega2560
```

---

## Laboratorio 1 — Pines Digitales en el Microcontrolador ATmega2560

Introducción práctica a la plataforma Arduino UNO (ATmega328P) y al manejo de pines digitales.

### Actividades realizadas

| Actividad | Descripción |
|-----------|-------------|
| 5.1 | Selección de placa y puerto en el Arduino IDE |
| 5.7 | Control de un LED rojo con resistencia de protección (pin 13) |
| 5.8 | Lectura de un pulsador con lógica de alternancia (INPUT_PULLUP) |

### Archivos

| Archivo | Descripción |
|---------|-------------|
| `Informe_Lab1_IoT.tex` | Fuente LaTeX del informe |
| `Informe_Lab1_IoT.pdf` | PDF compilado |
| `lab1.pdf` | Guía del laboratorio (enunciado) |
| `fig_circuito_led.png` | Figura de referencia: circuito LED |
| `fig_circuito_pulsador.png` | Figura de referencia: circuito pulsador |
| `foto_led_codigo.png` | Captura del código (experimento LED) |
| `foto_led_arduino.png` | Foto del montaje (experimento LED) |
| `foto_boton_codigo.png` | Captura del código (experimento pulsador) |
| `foto_boton_arduino.png` | Foto del montaje (experimento pulsador) |
| `logo_ucv.png` | Logo UCV (extraído del enunciado) |
| `logo_facu.png` | Logo Facultad de Ciencias |

### Compilar el informe

```bash
pdflatex Informe_Lab1_IoT.tex
pdflatex Informe_Lab1_IoT.tex   # segunda pasada para resolver referencias
```

O subir los archivos a [Overleaf](https://overleaf.com) y compilar desde allí.
