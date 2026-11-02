/* 04 - Demo en vivo, resultados, plan B, conclusiones y referencias */
window.DECK.push(

/* ───────────────────────────── 12 Demo en vivo ──────────────────────────── */
{
  section: 'Demostración',
  title: 'Demo en vivo',
  min: '7:45 a 10:05',
  html: `
  <div class="pad">
    <div class="kicker anim" data-d="1">Demostración</div>
    <h1 class="title sm anim" data-d="2">Demo en vivo</h1>
    <div class="rule"></div>

    <div class="body-area">
      <div class="grid g-7-5 gap-lg">
        <div class="steps anim f" data-d="3">
          <div class="step"><span class="num">1</span><div class="tx"><b>Bebé en la cuna y modo demo</b>El panel confirma cada orden y la cuna queda en línea.</div></div>
          <div class="step"><span class="num">2</span><div class="tx"><b>Hacer llorar</b>Mecido suave, luego firme, luego aviso al teléfono. Tiempos divididos entre 10.</div></div>
          <div class="step"><span class="num">3</span><div class="tx"><b>Restablecer y forzar 27, 25 y 24 °C</b>El ventilador enciende, sigue encendido y apaga: histéresis.</div></div>
          <div class="step"><span class="num">4</span><div class="tx"><b>Fuga de gas</b>Alarma, LED rojo, panel en alerta y notificación al teléfono.</div></div>
          <div class="step"><span class="num">5</span><div class="tx"><b>Detener la simulación</b>El panel indica que la cuna dejó de responder y desactiva los controles.</div></div>
        </div>
        <div class="stack">
          <div class="card lit anim" data-d="4">
            <span class="card-ix">SIMULACIÓN</span>
            <p><a href="https://wokwi.com/projects/479524283087739905" target="_blank" rel="noopener">wokwi.com/projects/479524283087739905</a></p>
          </div>
          <div class="card lit anim" data-d="5">
            <span class="card-ix">PANEL</span>
            <p><a href="https://proyecto-cuna.vercel.app" target="_blank" rel="noopener">proyecto-cuna.vercel.app</a></p>
          </div>
          <div class="card lit anim" data-d="6">
            <span class="card-ix">AVISOS EN EL TELÉFONO</span>
            <p>Aplicación ntfy, tema <span class="mono">ucv6565-cuna-lcolina</span></p>
          </div>
          <p class="shot-cap anim" data-d="7">Si algo falla, la lámina siguiente a resultados tiene capturas reales.</p>
        </div>
      </div>
    </div>
  </div>`
},

/* ───────────────────────────── 13 Resultados ────────────────────────────── */
{
  section: 'Resultados',
  title: 'Resultados de la simulación',
  min: '10:05 a 11:05',
  html: `
  <div class="pad">
    <div class="kicker anim" data-d="1">Resultados</div>
    <h1 class="title sm anim" data-d="2">Resultados medidos en la simulación</h1>
    <div class="rule"></div>

    <div class="body-area top">
      <div class="grid g2 gap-lg">
        <div class="anim f" data-d="3">
          <table class="t compact hw">
            <thead><tr><th>Tiempo real</th><th style="width:150px">Antes</th><th style="width:150px">Después</th></tr></thead>
            <tbody>
              <tr><td>Velocidad en Wokwi, mediana</td><td>8 %</td><td class="yes">25 %</td></tr>
              <tr><td>De la orden al estado, mediana</td><td class="no">4 de 5 sin llegar en 20 s</td><td class="yes">1,10 s</td></tr>
              <tr><td>Órdenes sin respuesta</td><td>–</td><td class="yes">0 de 12</td></tr>
              <tr><td>Reconexiones</td><td class="no">1 en 4 min</td><td class="yes">0 en 6 min</td></tr>
              <tr><td>Panel con la cuna detenida</td><td class="no">en línea 40 s</td><td class="yes">sin señal a 16 s, apagada a 45 s</td></tr>
            </tbody>
          </table>
          <p class="shot-cap">Después: 12 órdenes, mínimo 0,83 s, máximo 5,90 s. Antes: 5 órdenes. Una corrida de cada versión en
          navegador sin interfaz, por lo que los valores cambian según el equipo.</p>

          <table class="t compact hw" style="margin-top:14px">
            <thead><tr><th>Modo demo, tiempos entre 10</th><th style="width:150px">Programado</th><th style="width:150px">Reloj real</th></tr></thead>
            <tbody>
              <tr><td>Mecido suave al confirmar el llanto</td><td>0,2 s</td><td>1,2 s</td></tr>
              <tr><td>Mecido firme</td><td>6 s</td><td>11,9 s</td></tr>
              <tr><td>Llanto prolongado y aviso</td><td>18 s</td><td>32,2 s</td></tr>
              <tr><td>Límite de mecido</td><td>30 s</td><td>53,2 s</td></tr>
            </tbody>
          </table>
        </div>

        <div class="anim f" data-d="4">
          <table class="t compact hw">
            <thead><tr><th style="width:150px">Comprobado</th><th>Resultado</th></tr></thead>
            <tbody>
              <tr><td>Histéresis</td><td>Subiendo, a 25 °C sigue apagado y a 27 °C enciende. Bajando, a 25 °C sigue encendido y a 24 °C apaga. Leído en el LED verde.</td></tr>
              <tr><td>Ruido breve</td><td>Tres ruidos de hasta 1 s simulado no dispararon el llanto. Uno sostenido sí.</td></tr>
              <tr><td>Gas</td><td>Lecturas de 2202, 1601 y 1201: alarma, sigue la alarma, se apaga. El panel coincidió en las tres.</td></tr>
              <tr><td>Pañal</td><td>Lecturas de 2402, 1801 y 1201: mojado, sigue mojado, seco. El panel coincidió en las tres.</td></tr>
              <tr><td>Movimiento</td><td>2 g en el MPU6050: aviso y LED rojo. Con 1 g se rearma.</td></tr>
              <tr><td>Avisos al teléfono</td><td>Los cuatro tipos llegaron a ntfy. Durante el envío el servo siguió moviéndose.</td></tr>
              <tr><td>Deslizantes</td><td>Al 0, 50 y 100 %: 0, 2050 y 4095. Peso: 0, 4 y 8 kg.</td></tr>
              <tr><td>Controles</td><td>Cuatro botones del circuito y 28 usos de controles del panel publicado, todos confirmados.</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>`
},

/* ───────────────────────────── 14 Plan B ────────────────────────────────── */
{
  section: 'Resultados',
  title: 'Capturas reales',
  min: 'Solo si falla la demo',
  html: `
  <div class="pad">
    <div class="kicker anim" data-d="1">Plan B</div>
    <h1 class="title sm anim" data-d="2">Capturas reales, por si fallan Wokwi o el broker</h1>
    <div class="rule"></div>

    <div class="body-area top">
      <div class="grid g3 gap-sm">
        <div class="anim f" data-d="3">
          <div class="shot" style="--shot-h:400px">
            <div class="bar"><i></i><i></i><i></i><span class="u">circuito durante un llanto</span></div>
            <img src="assets/img/circuito_corriendo.jpg" alt="Simulación corriendo en Wokwi durante un llanto, con el LED de alerta encendido">
          </div>
        </div>
        <div class="anim f" data-d="4">
          <div class="shot" style="--shot-h:400px">
            <div class="bar"><i></i><i></i><i></i><span class="u">panel durante el llanto</span></div>
            <img src="assets/img/panel_c_llanto.jpg" alt="Panel web con el bebé llorando, mecido nivel 1 y la cuna en línea">
          </div>
        </div>
        <div class="stack anim f" data-d="5">
          <div class="shot" style="--shot-h:190px">
            <div class="bar"><i></i><i></i><i></i><span class="u">avisos recibidos en ntfy</span></div>
            <img src="assets/img/ntfy_avisos.jpg" alt="Avisos de gas, pañal mojado y llanto prolongado recibidos en ntfy">
          </div>
          <div class="shot" style="--shot-h:190px">
            <div class="bar"><i></i><i></i><i></i><span class="u">panel con alerta de gas</span></div>
            <img src="assets/img/panel_e_gas.jpg" alt="Panel web en alerta de gas o humo">
          </div>
        </div>
      </div>
    </div>
  </div>`
},

/* ───────────────────────────── 15 Conclusiones ──────────────────────────── */
{
  section: 'Conclusiones',
  title: 'Conclusiones',
  min: '11:05 a 11:45',
  html: `
  <div class="pad">
    <div class="kicker anim" data-d="1">Conclusiones</div>
    <h1 class="title anim" data-d="2">Conclusiones</h1>
    <div class="rule"></div>

    <div class="body-area">
      <div class="grid g2 gap-lg" style="margin-top:8px">

        <div class="card anim" data-d="3">
          <span class="card-ix">01</span>
          <h3>Respuesta graduada</h3>
          <p>
            El mecido escala según la duración del llanto y el aviso al teléfono queda para
            los casos prolongados. Un ruido de menos de 2 s no dispara nada.
          </p>
        </div>

        <div class="card anim" data-d="4">
          <span class="card-ix">02</span>
          <h3>Histéresis en el ventilador</h3>
          <p>
            Con dos umbrales, 26 °C y 24,5 °C, a 25 °C el relé mantiene su estado anterior. Lo
            comprobamos subiendo y bajando la temperatura.
          </p>
        </div>

        <div class="card anim" data-d="5">
          <span class="card-ix">03</span>
          <h3>El tiempo real había que medirlo</h3>
          <p>
            El problema no era el broker, sino la simulación. Con pausas en el programa y envío
            al cambiar, la mediana bajó a 1,10 s. La presencia real se resolvió con LWT.
          </p>
        </div>

        <div class="card anim" data-d="6">
          <span class="card-ix">04</span>
          <h3>Desacoplamiento por MQTT</h3>
          <p>
            El ESP32 y el panel solo comparten el broker y el formato de los mensajes. Eso
            permite cambiar uno sin tocar el otro y añadir nuevos clientes.
          </p>
        </div>

      </div>
      <div class="card gold anim" data-d="7" style="margin-top:18px">
        <span class="card-ix">LIMITACIÓN</span>
        <p>Todo se verificó en simulación. Los umbrales no están calibrados con sensores reales, y el
        broker y el tema de ntfy públicos solo sirven para una demostración académica.</p>
      </div>
    </div>
  </div>`
},

/* ───────────────────────────── 16 Referencias ───────────────────────────── */
{
  section: 'Referencias',
  title: 'Referencias',
  min: '11:45 a 11:55',
  html: `
  <div class="pad">
    <div class="kicker anim" data-d="1">Referencias</div>
    <h1 class="title anim" data-d="2">Referencias</h1>
    <div class="rule"></div>

    <div class="body-area">
      <table class="t compact anim f" data-d="3">
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
            <td>ESP32 WiFi Networking, wokwi-hx711, wokwi-gas-sensor y formato de diagram.json.</td>
          </tr>
          <tr>
            <td>ntfy</td>
            <td>Documentación del servicio de notificaciones por HTTP.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>`
}

);
