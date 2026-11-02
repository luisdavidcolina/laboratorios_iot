/* 02 - Sistema: hardware, software, arquitectura y circuito */
window.DECK.push(

/* ───────────────────────────── 05 Componentes de hardware ───────────────── */
{
  section: 'Diseño',
  title: 'Componentes de hardware',
  min: '2:15 a 3:05',
  html: `
  <div class="pad">
    <div class="kicker anim" data-d="1">Diseño</div>
    <h1 class="title sm anim" data-d="2">Componentes de hardware</h1>
    <div class="rule"></div>

    <div class="body-area top">
      <table class="t compact hw anim f" data-d="3">
        <thead>
          <tr>
            <th style="width:220px">Pieza en Wokwi</th>
            <th>Función</th>
            <th style="width:120px">Pin</th>
            <th style="width:320px">En un montaje real</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>ESP32 DevKit C</td><td>Control, WiFi y MQTT</td><td>–</td><td>La misma placa</td></tr>
          <tr><td>DHT22</td><td>Temperatura y humedad</td><td>15</td><td>El mismo sensor</td></tr>
          <tr><td>MPU6050</td><td>Movimiento de la cuna</td><td>21 y 22, I2C</td><td>El mismo sensor</td></tr>
          <tr><td>Pantalla OLED</td><td>Estado junto a la cuna</td><td>21 y 22, I2C</td><td>La misma pantalla</td></tr>
          <tr class="hi"><td>Deslizante de sonido</td><td>Nivel de ruido</td><td>34</td><td>Micrófono con salida analógica</td></tr>
          <tr class="hi"><td>Deslizante de peso</td><td>Presencia del bebé, 0 a 8 kg</td><td>33</td><td>Celda de carga con HX711</td></tr>
          <tr class="hi"><td>Deslizante de gas</td><td>Gas y humo</td><td>35</td><td>Sensor MQ2</td></tr>
          <tr class="hi"><td>Deslizante de pañal</td><td>Humedad del pañal</td><td>32</td><td>Sensor de humedad</td></tr>
          <tr><td>Servo</td><td>Mece la cuna</td><td>18</td><td>Servo con mecanismo de balanceo</td></tr>
          <tr><td>Relé y LED verde</td><td>Ventilador</td><td>26</td><td>Relé con un ventilador real</td></tr>
          <tr><td>LED rojo y buzzer</td><td>Alerta visual y sonora</td><td>27 y 25</td><td>Los mismos</td></tr>
          <tr><td>Cuatro botones</td><td>Provocar situaciones de prueba</td><td>13, 14, 16, 17</td><td>No hacen falta</td></tr>
        </tbody>
      </table>
      <p class="shot-cap anim" data-d="4">Las filas resaltadas son controles deslizantes: Wokwi no trae micrófono, y su
      celda de carga y su sensor de gas no se pueden mover a mano durante la simulación.</p>
    </div>
  </div>`
},

/* ───────────────────────────── 06 Herramientas de software ──────────────── */
{
  section: 'Diseño',
  title: 'Herramientas de software',
  min: '3:05 a 3:35',
  html: `
  <div class="pad">
    <div class="kicker anim" data-d="1">Diseño</div>
    <h1 class="title sm anim" data-d="2">Herramientas de software</h1>
    <div class="rule"></div>

    <div class="body-area">
      <div class="grid g3 gap-sm tools">
        <div class="card anim" data-d="3">
          <span class="card-ix">PROGRAMA</span>
          <h3>Arduino en C++</h3>
          <p>PubSubClient, HTTPClient, DHT, ESP32Servo y Adafruit SSD1306.</p>
        </div>
        <div class="card anim" data-d="3">
          <span class="card-ix">SIMULADOR</span>
          <h3>Wokwi</h3>
          <p>Compila el programa y simula el ESP32, el circuito y el WiFi.</p>
        </div>
        <div class="card anim" data-d="3">
          <span class="card-ix">PROTOCOLO</span>
          <h3>MQTT con HiveMQ</h3>
          <p>Broker público. Último deseo (LWT) para saber si la cuna se apagó.</p>
        </div>
        <div class="card anim" data-d="4">
          <span class="card-ix">PANEL</span>
          <h3>HTML, SVG y MQTT.js</h3>
          <p>Una sola página para el teléfono o el computador, por WebSocket seguro.</p>
        </div>
        <div class="card anim" data-d="4">
          <span class="card-ix">AVISOS</span>
          <h3>ntfy</h3>
          <p>Notificaciones al teléfono por HTTP, sin cuenta ni token.</p>
        </div>
        <div class="card anim" data-d="4">
          <span class="card-ix">PUBLICACIÓN</span>
          <h3>Vercel</h3>
          <p>Cada push a la rama main actualiza el panel y las diapositivas.</p>
        </div>
        <div class="card anim" data-d="5">
          <span class="card-ix">VERSIONES</span>
          <h3>Git y GitHub</h3>
          <p>Repositorio compartido entre los dos integrantes.</p>
        </div>
        <div class="card anim" data-d="5">
          <span class="card-ix">VERIFICACIÓN</span>
          <h3>Playwright</h3>
          <p>Maneja Wokwi y el panel para medir latencia y probar cada control.</p>
        </div>
        <div class="card anim" data-d="5">
          <span class="card-ix">INFORME</span>
          <h3>LaTeX</h3>
          <p>Informe académico con sus figuras y referencias.</p>
        </div>
      </div>
    </div>
  </div>`
},

/* ───────────────────────────── 07 Arquitectura ──────────────────────────── */
{
  section: 'Diseño',
  title: 'Arquitectura',
  min: '3:35 a 4:25',
  html: `
  <div class="pad">
    <div class="kicker anim" data-d="1">Diseño</div>
    <h1 class="title anim" data-d="2">Arquitectura</h1>
    <p class="subtitle anim" data-d="3">
      El ESP32 lee los sensores y maneja los actuadores. El estado sube a un broker MQTT, las
      órdenes del panel bajan por otro tópico y los avisos urgentes salen directo al teléfono.
    </p>
    <div class="rule"></div>

    <div class="body-area">
      <svg viewBox="0 0 1112 330" style="width:100%;height:auto;display:block" class="anim f" data-d="4">
        <defs>
          <style>
            .lbl  { font-family: "Source Sans 3", sans-serif; font-size: 11px; letter-spacing: 1.4px; }
            .ttl  { font-family: "Source Sans 3", sans-serif; font-size: 16px; font-weight: 650; }
            .ttlc { font-family: "Source Sans 3", sans-serif; font-size: 19px; font-weight: 700; }
            .sub  { font-family: "Source Sans 3", sans-serif; font-size: 12px; letter-spacing: 0.2px; }
          </style>
          <marker id="fa" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0 0 L5 3 L0 6 z" fill="#0A7CAE"/>
          </marker>
        </defs>

        <text x="0" y="14" class="lbl" fill="#78899A">ENTRADAS</text>
        <g>
          <rect x="0" y="26" width="220" height="46" rx="9" fill="#FFFFFF" stroke="#D3DDE7"/>
          <text x="16" y="46" class="ttl" fill="#0B1520">DHT22</text>
          <text x="16" y="63" class="sub" fill="#78899A">temperatura y humedad</text>

          <rect x="0" y="82" width="220" height="46" rx="9" fill="#FFFFFF" stroke="#D3DDE7"/>
          <text x="16" y="102" class="ttl" fill="#0B1520">MPU6050</text>
          <text x="16" y="119" class="sub" fill="#78899A">movimiento de la cuna</text>

          <rect x="0" y="138" width="220" height="46" rx="9" fill="#FFFFFF" stroke="#D3DDE7"/>
          <text x="16" y="158" class="ttl" fill="#0B1520">Sonido y peso</text>
          <text x="16" y="175" class="sub" fill="#78899A">llanto y presencia del bebé</text>

          <rect x="0" y="194" width="220" height="46" rx="9" fill="#FFFFFF" stroke="#D3DDE7"/>
          <text x="16" y="214" class="ttl" fill="#0B1520">Gas y pañal</text>
          <text x="16" y="231" class="sub" fill="#78899A">humo y humedad</text>
        </g>

        <g stroke="#0E8F72" stroke-width="1.5" fill="none" opacity="0.8">
          <path d="M220 49 L280 100"/>
          <path d="M220 105 L280 118"/>
          <path d="M220 161 L280 138"/>
          <path d="M220 217 L280 154"/>
        </g>

        <rect x="280" y="66" width="170" height="128" rx="12" fill="#E8F6F1" stroke="#7FC9B4"/>
        <text x="365" y="114" text-anchor="middle" class="ttlc" fill="#0E8F72">ESP32</text>
        <text x="365" y="136" text-anchor="middle" class="sub" fill="#45576A">lógica de control</text>
        <text x="365" y="153" text-anchor="middle" class="sub" fill="#78899A">escalada y límites</text>

        <path d="M365 194 L365 226" stroke="#0E8F72" stroke-width="1.8" fill="none" marker-end="url(#fa)"/>
        <rect x="256" y="228" width="218" height="52" rx="9" fill="#FFFFFF" stroke="#D3DDE7"/>
        <text x="365" y="249" text-anchor="middle" class="ttl" fill="#0B1520">Salidas</text>
        <text x="365" y="267" text-anchor="middle" class="sub" fill="#78899A">servo, ventilador, buzzer, LED, OLED</text>

        <path d="M450 104 L568 104" stroke="#0E8F72" stroke-width="1.8" fill="none" marker-end="url(#fa)"/>
        <text x="509" y="84" text-anchor="middle" class="sub" fill="#45576A">state, event</text>
        <text x="509" y="98" text-anchor="middle" class="sub" fill="#45576A">status con LWT</text>
        <path d="M568 150 L450 150" stroke="#0E8F72" stroke-width="1.8" fill="none" marker-end="url(#fa)"/>
        <text x="509" y="168" text-anchor="middle" class="sub" fill="#45576A">cmd</text>

        <rect x="570" y="66" width="176" height="128" rx="12" fill="#FFFFFF" stroke="#D3DDE7"/>
        <text x="658" y="114" text-anchor="middle" class="ttlc" fill="#0B1520">Broker MQTT</text>
        <text x="658" y="136" text-anchor="middle" class="sub" fill="#45576A">HiveMQ público</text>
        <text x="658" y="153" text-anchor="middle" class="sub" fill="#78899A">ucv6565/cuna/…</text>

        <path d="M746 104 L860 104" stroke="#0E8F72" stroke-width="1.8" fill="none" marker-end="url(#fa)"/>
        <text x="803" y="84" text-anchor="middle" class="sub" fill="#45576A">state, event</text>
        <text x="803" y="98" text-anchor="middle" class="sub" fill="#45576A">status</text>
        <path d="M860 150 L746 150" stroke="#0E8F72" stroke-width="1.8" fill="none" marker-end="url(#fa)"/>
        <text x="803" y="168" text-anchor="middle" class="sub" fill="#45576A">cmd</text>

        <rect x="862" y="66" width="198" height="128" rx="12" fill="#E8F6F1" stroke="#7FC9B4"/>
        <text x="961" y="114" text-anchor="middle" class="ttlc" fill="#0E8F72">Panel web</text>
        <text x="961" y="136" text-anchor="middle" class="sub" fill="#45576A">teléfono o computador</text>
        <text x="961" y="153" text-anchor="middle" class="sub" fill="#78899A">WebSocket seguro</text>

        <path d="M450 180 L520 180 L520 305 L568 305" stroke="#0A7CAE" stroke-width="1.8" fill="none" marker-end="url(#fa)"/>
        <text x="530" y="297" class="sub" fill="#45576A">HTTP</text>
        <rect x="570" y="278" width="176" height="50" rx="9" fill="#FFFFFF" stroke="#D3DDE7"/>
        <text x="658" y="299" text-anchor="middle" class="ttl" fill="#0B1520">ntfy</text>
        <text x="658" y="316" text-anchor="middle" class="sub" fill="#78899A">gas, llanto, pañal, movimiento</text>
        <path d="M746 303 L860 303" stroke="#0A7CAE" stroke-width="1.8" fill="none" marker-end="url(#fa)"/>
        <text x="803" y="295" text-anchor="middle" class="sub" fill="#45576A">notificación</text>
        <rect x="862" y="278" width="198" height="50" rx="9" fill="#E8F6F1" stroke="#7FC9B4"/>
        <text x="961" y="299" text-anchor="middle" class="ttl" fill="#0E8F72">Teléfono</text>
        <text x="961" y="316" text-anchor="middle" class="sub" fill="#45576A">aplicación ntfy, panel cerrado</text>
      </svg>
    </div>
  </div>`
},

/* ───────────────────────────── 08 Diagrama del circuito ─────────────────── */
{
  section: 'Diseño',
  title: 'Diagrama del circuito',
  min: '4:25 a 5:05',
  html: `
  <div class="pad">
    <div class="kicker anim" data-d="1">Diseño</div>
    <h1 class="title sm anim" data-d="2">Diagrama del circuito</h1>
    <div class="rule"></div>

    <div class="body-area top">
      <div class="circuit-row">
        <a class="circuit-img anim f" data-d="3" href="assets/img/circuito.png" target="_blank" rel="noopener">
          <img src="assets/img/circuito.png" alt="Circuito en Wokwi: ESP32 al centro, deslizantes, buzzer, relé, LED de alerta y dos botones a la izquierda; bus I2C, servo, dos botones y DHT22 a la derecha">
        </a>
        <div class="stack">
          <div class="card anim" data-d="4">
            <span class="card-ix">CADA PIEZA DEL LADO DE SU PIN</span>
            <p>Ningún cable cruza la placa. Las piezas siguen el mismo orden que sus pines.</p>
          </div>
          <div class="card anim" data-d="5">
            <span class="card-ix">ALIMENTACIÓN LOCAL</span>
            <p>Cada pieza usa símbolos VCC y GND propios, en vez de 24 cables hacia dos pines.
            Se comprobó que un deslizante recorre de 0 a 4095 sin saturarse.</p>
          </div>
          <div class="card lit anim" data-d="6">
            <span class="card-ix">DOS CLASES DE ENTRADA</span>
            <p>Los deslizantes entregan un voltaje analógico. Los botones fuerzan una situación
            para la demostración.</p>
          </div>
          <p class="shot-cap anim" data-d="7">Haz clic en el diagrama para verlo a tamaño completo.</p>
        </div>
      </div>
    </div>
  </div>`
}

);
