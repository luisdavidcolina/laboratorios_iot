/* 01 - Apertura: portada, planteamiento y antecedentes */
window.DECK.push(

/* ─────────────────────────────── 01 Portada ─────────────────────────────── */
{
  section: 'Portada',
  title: 'Portada',
  min: '0:00 a 0:25',
  bare: true,
  html: `
  <div class="pad">
    <div class="cover">
      <div class="logos anim z" data-d="1">
        <img src="assets/logos/logo_ucv.png" alt="Universidad Central de Venezuela">
        <span class="sep"></span>
        <img src="assets/logos/logo_ciencias.png" alt="Facultad de Ciencias">
        <span class="sep"></span>
        <img src="assets/logos/logo_computacion.png" alt="Escuela de Computación">
      </div>

      <div class="uni anim sr" data-d="2">Laboratorio General de Internet de las Cosas, 6565, sección C1P</div>

      <h1 class="anim" data-d="3">Cuna inteligente</h1>

      <p class="thin anim" data-d="4">Detección de llanto, control del ambiente y aviso remoto</p>

      <p class="lede anim" data-d="5">
        Sistema con ESP32 y MQTT que responde al llanto con un balanceo graduado, regula la
        temperatura del cuarto y avisa a los padres desde un panel web. Se desarrolló y se
        verificó en el simulador Wokwi.
      </p>

      <div class="who anim" data-d="7">
        <div><b>Luisdavid Colina</b>V-24.766.381</div>
        <div><b>Prof. Antonio Russoniello</b>Semestre 01-2026</div>
        <div><b>Escuela de Computación</b>Facultad de Ciencias, UCV</div>
        <div><b>Caracas</b>2 de noviembre de 2026</div>
      </div>
    </div>
  </div>`
},

/* ───────────────────────────── 02 Planteamiento ─────────────────────────── */
{
  section: 'Planteamiento',
  title: 'Planteamiento del problema',
  min: '0:25 a 1:05',
  html: `
  <div class="pad">
    <div class="kicker anim" data-d="1">Planteamiento</div>
    <h1 class="title anim" data-d="2">Planteamiento del problema</h1>
    <p class="subtitle anim" data-d="3">
      Un cuidador no puede permanecer junto a la cuna durante toda la noche. Tres situaciones
      requieren atención inmediata y una cuna común no avisa de ninguna.
    </p>
    <div class="rule"></div>

    <div class="body-area">
      <div class="grid g3 gap-lg">
        <div class="card anim" data-d="4">
          <div class="ico"><svg viewBox="0 0 24 24"><path d="M12 3a4 4 0 0 0-4 4v4a4 4 0 0 0 8 0V7a4 4 0 0 0-4-4z"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/></svg></div>
          <span class="card-ix">PRIMERA</span>
          <h3>Llanto</h3>
          <p>Un llanto que se prolonga debe atenderse. Uno breve puede calmarse con movimiento.</p>
        </div>
        <div class="card anim" data-d="5">
          <div class="ico"><svg viewBox="0 0 24 24"><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/></svg></div>
          <span class="card-ix">SEGUNDA</span>
          <h3>Pañal mojado</h3>
          <p>La humedad prolongada incomoda al bebé y exige un cambio oportuno.</p>
        </div>
        <div class="card anim" data-d="6">
          <div class="ico"><svg viewBox="0 0 24 24"><path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z"/></svg></div>
          <span class="card-ix">TERCERA</span>
          <h3>Cuarto fuera de rango</h3>
          <p>El exceso de calor o de frío afecta el sueño y requiere ventilar o abrigar.</p>
        </div>
      </div>

      <div class="card lit anim" data-d="8" style="margin-top:24px">
        <span class="card-ix">OBJETIVO</span>
        <p style="color:var(--text);font-size:17px">Detectar las tres situaciones, responder con un movimiento graduado y
        avisar a los padres desde el teléfono.</p>
      </div>
    </div>
  </div>`
},

/* ───────────────────────────── 03 Antecedentes ──────────────────────────── */
{
  section: 'Antecedentes',
  title: 'Antecedentes',
  min: '1:05 a 1:50',
  html: `
  <div class="pad">
    <div class="kicker anim" data-d="1">Antecedentes</div>
    <h1 class="title anim" data-d="2">Antecedentes</h1>
    <p class="subtitle anim" data-d="3">
      Las cunas inteligentes son un tema frecuente en proyectos de IoT. Tres ejemplos publicados
      delimitan lo que ya se resolvió.
    </p>
    <div class="rule"></div>

    <div class="body-area">
      <table class="t compact anim f" data-d="4">
        <thead>
          <tr>
            <th style="width:250px">Proyecto</th>
            <th style="width:170px">Controlador</th>
            <th>Funciones reportadas</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Intel DevMesh, Smart Cradle</td>
            <td>ESP32 y Blynk</td>
            <td>Sensor de sonido, DHT11 y motor que inclina la cuna, con alertas en la aplicación.</td>
          </tr>
          <tr>
            <td>Universidad An-Najah, 2024</td>
            <td>Arduino, ESP8266 y ESP32-CAM</td>
            <td>Humedad del pañal, ventilador sobre 30 °C y mecido remoto desde una aplicación.</td>
          </tr>
          <tr>
            <td>IJIRT, mayo de 2026</td>
            <td>ESP32 y Blynk</td>
            <td>Distingue ruidos breves del llanto. Responde en menos de 2,5 segundos.</td>
          </tr>
        </tbody>
      </table>

      <div class="card gold anim" data-d="6" style="margin-top:24px">
        <span class="card-ix">APORTE DE ESTE PROYECTO</span>
        <p style="color:var(--text);font-size:16px">Respuesta que escala según la duración del llanto, ventilador con
        histéresis y un panel que se maneja por MQTT con las mismas órdenes que entiende el programa.</p>
      </div>
    </div>
  </div>`
}

);
