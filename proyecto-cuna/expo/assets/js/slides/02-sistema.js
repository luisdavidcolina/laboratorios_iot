/* 02 - Sistema: arquitectura y circuito simulado */
window.DECK.push(

/* ───────────────────────────── 04 Arquitectura ──────────────────────────── */
{
  section: 'Diseño',
  title: 'Arquitectura',
  min: '1:50 a 2:50',
  html: `
  <div class="pad">
    <div class="kicker anim" data-d="1">Diseño</div>
    <h1 class="title anim" data-d="2">Arquitectura</h1>
    <p class="subtitle anim" data-d="3">
      El ESP32 lee los sensores y maneja los actuadores. El estado sube a un broker MQTT y las
      órdenes del panel bajan por un tópico distinto.
    </p>
    <div class="rule"></div>

    <div class="body-area">
      <svg viewBox="0 0 1112 290" style="width:100%;height:auto;display:block" class="anim f" data-d="4">
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
          <rect x="0" y="26" width="230" height="46" rx="9" fill="#FFFFFF" stroke="#D3DDE7"/>
          <text x="16" y="46" class="ttl" fill="#0B1520">DHT22</text>
          <text x="16" y="63" class="sub" fill="#78899A">temperatura y humedad</text>

          <rect x="0" y="82" width="230" height="46" rx="9" fill="#FFFFFF" stroke="#D3DDE7"/>
          <text x="16" y="102" class="ttl" fill="#0B1520">MPU6050</text>
          <text x="16" y="119" class="sub" fill="#78899A">movimiento de la cuna</text>

          <rect x="0" y="138" width="230" height="46" rx="9" fill="#FFFFFF" stroke="#D3DDE7"/>
          <text x="16" y="158" class="ttl" fill="#0B1520">Sonido y peso</text>
          <text x="16" y="175" class="sub" fill="#78899A">llanto y presencia del bebé</text>

          <rect x="0" y="194" width="230" height="46" rx="9" fill="#FFFFFF" stroke="#D3DDE7"/>
          <text x="16" y="214" class="ttl" fill="#0B1520">Gas y pañal</text>
          <text x="16" y="231" class="sub" fill="#78899A">humo y humedad</text>
        </g>

        <g stroke="#0E8F72" stroke-width="1.5" fill="none" opacity="0.8">
          <path d="M230 49 L296 100"/>
          <path d="M230 105 L296 118"/>
          <path d="M230 161 L296 138"/>
          <path d="M230 217 L296 154"/>
        </g>

        <rect x="296" y="66" width="176" height="128" rx="12" fill="#E8F6F1" stroke="#7FC9B4"/>
        <text x="384" y="114" text-anchor="middle" class="ttlc" fill="#0E8F72">ESP32</text>
        <text x="384" y="136" text-anchor="middle" class="sub" fill="#45576A">lógica de control</text>
        <text x="384" y="153" text-anchor="middle" class="sub" fill="#78899A">escalada y límites</text>

        <path d="M384 194 L384 226" stroke="#0E8F72" stroke-width="1.8" fill="none" marker-end="url(#fa)"/>
        <text x="0" y="260" class="lbl" fill="#78899A"> </text>
        <rect x="270" y="228" width="228" height="52" rx="9" fill="#FFFFFF" stroke="#D3DDE7"/>
        <text x="384" y="249" text-anchor="middle" class="ttl" fill="#0B1520">Salidas</text>
        <text x="384" y="267" text-anchor="middle" class="sub" fill="#78899A">servo, ventilador, buzzer, LED, OLED</text>

        <path d="M472 112 L570 112" stroke="#0E8F72" stroke-width="1.8" fill="none" marker-end="url(#fa)"/>
        <text x="521" y="102" text-anchor="middle" class="sub" fill="#45576A">estado</text>
        <path d="M570 148 L472 148" stroke="#0E8F72" stroke-width="1.8" fill="none" marker-end="url(#fa)"/>
        <text x="521" y="168" text-anchor="middle" class="sub" fill="#45576A">órdenes</text>

        <rect x="570" y="66" width="184" height="128" rx="12" fill="#FFFFFF" stroke="#D3DDE7"/>
        <text x="662" y="114" text-anchor="middle" class="ttlc" fill="#0B1520">Broker MQTT</text>
        <text x="662" y="136" text-anchor="middle" class="sub" fill="#45576A">HiveMQ público</text>
        <text x="662" y="153" text-anchor="middle" class="sub" fill="#78899A">ucv6565/cuna/…</text>

        <path d="M754 112 L852 112" stroke="#0E8F72" stroke-width="1.8" fill="none" marker-end="url(#fa)"/>
        <text x="803" y="102" text-anchor="middle" class="sub" fill="#45576A">estado y avisos</text>
        <path d="M852 148 L754 148" stroke="#0E8F72" stroke-width="1.8" fill="none" marker-end="url(#fa)"/>
        <text x="803" y="168" text-anchor="middle" class="sub" fill="#45576A">órdenes</text>

        <rect x="852" y="66" width="198" height="128" rx="12" fill="#E8F6F1" stroke="#7FC9B4"/>
        <text x="951" y="114" text-anchor="middle" class="ttlc" fill="#0E8F72">Panel web</text>
        <text x="951" y="136" text-anchor="middle" class="sub" fill="#45576A">teléfono o computador</text>
        <text x="951" y="153" text-anchor="middle" class="sub" fill="#78899A">WebSocket seguro</text>
      </svg>
    </div>
  </div>`
},

/* ───────────────────────────── 05 Circuito simulado ─────────────────────── */
{
  section: 'Diseño',
  title: 'Circuito simulado',
  min: '2:50 a 3:35',
  html: `
  <div class="pad">
    <div class="kicker anim" data-d="1">Diseño</div>
    <h1 class="title anim" data-d="2">Circuito simulado en Wokwi</h1>
    <p class="subtitle anim" data-d="3">
      El simulador no trae micrófono y su celda de carga solo se maneja con escenarios
      automáticos. Cuatro entradas son controles deslizantes que entregan un voltaje analógico.
    </p>
    <div class="rule"></div>

    <div class="body-area">
      <div class="grid g-7-5 gap-lg">
        <div class="anim f" data-d="4">
          <div class="shot dark" style="--shot-h:250px">
            <div class="bar"><i></i><i></i><i></i><span class="u">pantalla oled de la cuna, simulación</span></div>
            <img src="assets/img/oled_llanto.png" alt="Pantalla OLED simulada con el texto LLORANDO, temperatura, peso y nivel de mecido" style="image-rendering:pixelated;object-fit:contain;background:#000">
          </div>
          <div class="shot-cap">Captura del simulador durante un llanto con el bebé presente. La pantalla indica el
          peso, la temperatura y el nivel de mecido.</div>
        </div>

        <div class="stack">
          <div class="card lit anim" data-d="5">
            <span class="card-ix">PIEZAS DEL SIMULADOR</span>
            <div class="chips" style="margin-top:8px">
              <span class="chip on">ESP32</span>
              <span class="chip on">DHT22</span>
              <span class="chip on">MPU6050</span>
              <span class="chip on">Servo</span>
              <span class="chip on">Relé</span>
              <span class="chip on">OLED</span>
              <span class="chip">Buzzer</span>
              <span class="chip">LED</span>
            </div>
          </div>

          <div class="card gold anim" data-d="6">
            <span class="card-ix">CONTROLES DESLIZANTES</span>
            <div class="chips" style="margin-top:8px">
              <span class="chip gold">Sonido</span>
              <span class="chip gold">Peso</span>
              <span class="chip gold">Gas</span>
              <span class="chip gold">Pañal</span>
            </div>
            <p style="margin-top:10px">En un montaje físico serían un micrófono, una celda de carga, un sensor MQ2 y un
            sensor de humedad.</p>
          </div>
        </div>
      </div>
    </div>
  </div>`
}

);
