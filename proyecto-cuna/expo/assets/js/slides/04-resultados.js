/* 04 - Resultados, conclusiones y referencias */
window.DECK.push(

/* ───────────────────────────── 08 Resultados ────────────────────────────── */
{
  section: 'Resultados',
  title: 'Resultados de la simulación',
  min: '5:30 a 7:00',
  html: `
  <div class="pad">
    <div class="kicker anim" data-d="1">Resultados</div>
    <h1 class="title anim" data-d="2">Resultados de la simulación</h1>
    <p class="subtitle anim" data-d="3">
      Tres escenarios ejecutados con el simulador Wokwi muestran que el sistema responde
      dentro de los tiempos diseñados.
    </p>
    <div class="rule"></div>

    <div class="body-area">
      <div class="grid g3 gap-lg anim f" data-d="4">

        <div class="stack">
          <div class="card lit">
            <span class="card-ix">ESCENARIO 1</span>
            <h3>Llanto con escalada</h3>
            <p>Bebé presente. Sonido sube del umbral y se mantiene.</p>
          </div>
          <div class="shot" style="--shot-h:160px">
            <div class="bar"><i></i><i></i><i></i><span class="u">panel durante el llanto</span></div>
            <img src="assets/img/panel_c_llanto.jpg"
                 alt="Panel web mostrando estado de llanto, mecido activo y temperatura normal">
          </div>
          <div class="card" style="margin-top:0">
            <table class="t compact">
              <tbody>
                <tr><td>Mecido suave</td><td>2 s tras confirmar llanto</td></tr>
                <tr><td>Mecido firme</td><td>60 s de llanto continuo</td></tr>
                <tr><td>Alarma y aviso</td><td>180 s de llanto continuo</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="stack">
          <div class="card lit">
            <span class="card-ix">ESCENARIO 2</span>
            <h3>Ventilador con histéresis</h3>
            <p>Temperatura sube a 27 °C y luego baja a 24 °C.</p>
          </div>
          <div class="shot" style="--shot-h:160px">
            <div class="bar"><i></i><i></i><i></i><span class="u">panel con calor y pañal mojado</span></div>
            <img src="assets/img/panel_d_calor_panal.jpg"
                 alt="Panel web con alerta de temperatura y pañal mojado, ventilador encendido">
          </div>
          <div class="card" style="margin-top:0">
            <table class="t compact">
              <tbody>
                <tr><td>Ventilador enciende</td><td>26 °C</td></tr>
                <tr><td>Ventilador apaga</td><td>24,5 °C</td></tr>
                <tr><td>Oscilaciones del relé</td><td>ninguna</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="stack">
          <div class="card lit">
            <span class="card-ix">ESCENARIO 3</span>
            <h3>Aviso de gas</h3>
            <p>Deslizante de gas supera el umbral. Alarma continua.</p>
          </div>
          <div class="shot" style="--shot-h:160px">
            <div class="bar"><i></i><i></i><i></i><span class="u">panel con alerta de gas</span></div>
            <img src="assets/img/panel_e_gas.jpg"
                 alt="Panel web mostrando alerta roja de gas o humo detectado">
          </div>
          <div class="card" style="margin-top:0">
            <table class="t compact">
              <tbody>
                <tr><td>Aviso al panel</td><td>inmediato</td></tr>
                <tr><td>Alarma sonora</td><td>continua hasta bajar el umbral</td></tr>
                <tr><td>Rearme</td><td>cuando la lectura vuelve al rango seguro</td></tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  </div>`
},

/* ───────────────────────────── 09 Conclusiones ──────────────────────────── */
{
  section: 'Conclusiones',
  title: 'Conclusiones',
  min: '7:00 a 8:00',
  html: `
  <div class="pad">
    <div class="kicker anim" data-d="1">Conclusiones</div>
    <h1 class="title anim" data-d="2">Conclusiones</h1>
    <div class="rule"></div>

    <div class="body-area">
      <div class="grid g2 gap-lg" style="margin-top:16px">

        <div class="card anim" data-d="3">
          <span class="card-ix">01</span>
          <h3>Respuesta graduada</h3>
          <p>
            Escalar el mecido según la duración del llanto reduce las reacciones a ruidos
            aislados. La alarma llega a los padres solo cuando el llanto supera los tres
            minutos.
          </p>
        </div>

        <div class="card anim" data-d="4">
          <span class="card-ix">02</span>
          <h3>Histéresis en el ventilador</h3>
          <p>
            Dos umbrales distintos, 26 °C para encender y 24,5 °C para apagar, mantienen el
            relé estable sin oscilaciones cuando la temperatura ronda el límite.
          </p>
        </div>

        <div class="card anim" data-d="5">
          <span class="card-ix">03</span>
          <h3>Desacoplamiento por MQTT</h3>
          <p>
            El ESP32 y el panel solo comparten el broker y el formato de los mensajes. Eso
            permite cambiar uno sin tocar el otro y abre la puerta a añadir nuevos clientes.
          </p>
        </div>

        <div class="card gold anim" data-d="6">
          <span class="card-ix">04</span>
          <h3>Simulación como sustituto válido</h3>
          <p>
            Los controles deslizantes del simulador reemplazan el micrófono, la celda de carga
            y el sensor de gas sin alterar la lógica del programa. Esa decisión queda declarada
            en el informe y permite verificar el sistema completo sin hardware.
          </p>
        </div>

      </div>
    </div>
  </div>`
},

/* ───────────────────────────── 10 Referencias ───────────────────────────── */
{
  section: 'Referencias',
  title: 'Referencias',
  min: '8:00 a 8:30',
  html: `
  <div class="pad">
    <div class="kicker anim" data-d="1">Referencias</div>
    <h1 class="title anim" data-d="2">Referencias</h1>
    <div class="rule"></div>

    <div class="body-area">
      <table class="t anim f" data-d="3" style="margin-top:12px">
        <thead>
          <tr>
            <th style="width:220px">Fuente</th>
            <th>Descripción</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Robocraze</td>
            <td>Lista de 25 proyectos de IoT para estudiantes de ingeniería. Origen de la idea
            de la cuna.</td>
          </tr>
          <tr>
            <td>Intel DevMesh</td>
            <td>Smart Cradle System. ESP32 con sensor de sonido, DHT11 y alertas por Blynk.</td>
          </tr>
          <tr>
            <td>Universidad An-Najah, 2024</td>
            <td>Comfort Sense baby bed. Añade humedad del pañal, ventilador y mecido remoto.</td>
          </tr>
          <tr>
            <td>PMC, 2025</td>
            <td>Niveles de balanceo 1–5, parada a los 5 min y rango seguro de temperatura.
            Solo se toman los parámetros de diseño.</td>
          </tr>
          <tr>
            <td>IJIRT, mayo 2026</td>
            <td>Distingue ruidos breves del llanto real. Responde en menos de 2,5 s.</td>
          </tr>
          <tr>
            <td>Wokwi Docs</td>
            <td>ESP32 WiFi Networking, wokwi-hx711, wokwi-gas-sensor.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>`
}

);
