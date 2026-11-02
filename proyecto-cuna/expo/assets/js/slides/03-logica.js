/* 03 - Lógica de control: diagrama funcional, ambiente del cuarto y código clave */
window.DECK.push(

/* ───────────────────────────── 09 Diagrama funcional ────────────────────── */
{
  section: 'Lógica de control',
  title: 'Diagrama funcional',
  min: '5:05 a 6:05',
  html: `
  <div class="pad">
    <div class="kicker anim" data-d="1">Lógica de control</div>
    <h1 class="title sm anim" data-d="2">Diagrama funcional: respuesta al llanto</h1>
    <p class="subtitle anim" data-d="3">
      La respuesta crece con la duración del llanto. Un ruido aislado no cuenta y el aviso se
      reserva para los casos prolongados.
    </p>
    <div class="rule"></div>

    <div class="body-area">
      <svg viewBox="0 0 1112 236" style="width:100%;height:auto;display:block" class="anim f" data-d="4">
        <defs>
          <style>
            .st  { font-family: "Source Sans 3", sans-serif; font-size: 15px; font-weight: 650; }
            .ss  { font-family: "Source Sans 3", sans-serif; font-size: 12.5px; }
            .tr  { font-family: "Source Sans 3", sans-serif; font-size: 12.5px; font-weight: 600; }
          </style>
          <marker id="fb" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0 0 L6 3.5 L0 7 z" fill="#45576A"/>
          </marker>
        </defs>

        <!-- Vuelta desde Descanso a Mecido firme -->
        <path d="M1026 76 L1026 28 L546 28 L546 72" fill="none" stroke="#78899A" stroke-width="1.5" marker-end="url(#fb)"/>
        <text x="786" y="20" text-anchor="middle" class="tr" fill="#45576A">tras 2 min, si sigue el llanto</text>

        <rect x="0" y="76" width="160" height="66" rx="10" fill="#E8F6F1" stroke="#7FC9B4"/>
        <text x="80" y="104" text-anchor="middle" class="st" fill="#0E8F72">Tranquilo</text>
        <text x="80" y="124" text-anchor="middle" class="ss" fill="#45576A">sin mecer</text>

        <path d="M160 109 L232 109" fill="none" stroke="#45576A" stroke-width="1.6" marker-end="url(#fb)"/>
        <text x="196" y="86" text-anchor="middle" class="tr" fill="#45576A">2 s de ruido</text>
        <text x="196" y="101" text-anchor="middle" class="tr" fill="#45576A">y bebé</text>

        <rect x="234" y="76" width="160" height="66" rx="10" fill="#FFF7E6" stroke="#E7B95C"/>
        <text x="314" y="104" text-anchor="middle" class="st" fill="#0B1520">Llanto confirmado</text>
        <text x="314" y="124" text-anchor="middle" class="ss" fill="#45576A">mecido suave</text>

        <path d="M394 109 L464 109" fill="none" stroke="#45576A" stroke-width="1.6" marker-end="url(#fb)"/>
        <text x="429" y="101" text-anchor="middle" class="tr" fill="#45576A">60 s</text>

        <rect x="466" y="76" width="160" height="66" rx="10" fill="#FFEFD6" stroke="#E7A23A"/>
        <text x="546" y="104" text-anchor="middle" class="st" fill="#0B1520">Sigue el llanto</text>
        <text x="546" y="124" text-anchor="middle" class="ss" fill="#45576A">mecido firme</text>

        <path d="M626 109 L696 109" fill="none" stroke="#45576A" stroke-width="1.6" marker-end="url(#fb)"/>
        <text x="661" y="101" text-anchor="middle" class="tr" fill="#45576A">180 s</text>

        <rect x="698" y="76" width="176" height="66" rx="10" fill="#FBE7E4" stroke="#D9796B"/>
        <text x="786" y="104" text-anchor="middle" class="st" fill="#0B1520">Llanto prolongado</text>
        <text x="786" y="124" text-anchor="middle" class="ss" fill="#45576A">alarma y aviso al teléfono</text>

        <path d="M874 109 L944 109" fill="none" stroke="#45576A" stroke-width="1.6" marker-end="url(#fb)"/>
        <text x="909" y="101" text-anchor="middle" class="tr" fill="#45576A">5 min</text>

        <rect x="946" y="76" width="160" height="66" rx="10" fill="#EEF2F6" stroke="#B4C0CC"/>
        <text x="1026" y="104" text-anchor="middle" class="st" fill="#0B1520">Descanso</text>
        <text x="1026" y="124" text-anchor="middle" class="ss" fill="#45576A">el mecido se detiene</text>

        <!-- Vuelta a Tranquilo desde cualquier estado de llanto -->
        <path d="M314 142 L314 196 M546 142 L546 196 M786 142 L786 196 M1026 142 L1026 196" fill="none" stroke="#78899A" stroke-width="1.5"/>
        <path d="M1026 196 L80 196 L80 146" fill="none" stroke="#78899A" stroke-width="1.5" marker-end="url(#fb)"/>
        <text x="556" y="218" text-anchor="middle" class="tr" fill="#45576A">20 s de silencio, o la cuna queda vacía</text>
      </svg>

      <div class="grid g3 gap-lg" style="margin-top:18px">
        <div class="card anim" data-d="5">
          <span class="card-ix">CONDICIÓN</span>
          <h3>Bebé presente</h3>
          <p>La balanza debe marcar al menos 1 kg. Con la cuna vacía no hay respuesta.</p>
        </div>
        <div class="card anim" data-d="6">
          <span class="card-ix">ACTUADOR</span>
          <h3>Mecido limitado</h3>
          <p>Siempre se detiene a los 5 minutos, también cuando se inició desde el panel.</p>
        </div>
        <div class="card gold anim" data-d="7">
          <span class="card-ix">MODO DEMO</span>
          <h3>Tiempos entre 10</h3>
          <p>Se activa desde el panel, para exponer toda la secuencia sin esperar minutos.</p>
        </div>
      </div>
    </div>
  </div>`
},

/* ───────────────────────────── 10 Ambiente del cuarto ───────────────────── */
{
  section: 'Lógica de control',
  title: 'Ambiente del cuarto',
  min: '6:05 a 6:45',
  html: `
  <div class="pad">
    <div class="kicker anim" data-d="1">Lógica de control</div>
    <h1 class="title anim" data-d="2">Ambiente del cuarto</h1>
    <p class="subtitle anim" data-d="3">
      El ventilador usa dos umbrales distintos. Esa separación evita que el relé se active y se
      desactive sin parar cuando la temperatura oscila.
    </p>
    <div class="rule"></div>

    <div class="body-area">
      <div class="grid g-7-5 gap-lg">
        <div class="anim f" data-d="4">
          <svg viewBox="0 0 600 300" style="width:100%;height:auto;display:block">
            <defs>
              <style>
                .ax  { font-family: "Source Sans 3", sans-serif; font-size: 12.5px; }
                .axb { font-family: "Source Sans 3", sans-serif; font-size: 13px; font-weight: 650; }
              </style>
            </defs>
            <rect x="48" y="14" width="540" height="236" rx="8" fill="#FFFFFF" stroke="#D3DDE7"/>
            <rect x="236" y="214" width="190" height="28" rx="5" fill="#E8F6F1" stroke="#7FC9B4"/>
            <text x="331" y="233" text-anchor="middle" class="ax" fill="#0E8F72">ventilador encendido</text>

            <line x1="48" y1="124" x2="588" y2="124" stroke="#C0392B" stroke-width="1.3" stroke-dasharray="6 5"/>
            <text x="56" y="118" class="axb" fill="#C0392B">26 °C enciende</text>
            <line x1="48" y1="175" x2="588" y2="175" stroke="#0A7CAE" stroke-width="1.3" stroke-dasharray="6 5"/>
            <text x="56" y="192" class="axb" fill="#0A7CAE">24,5 °C apaga</text>

            <path d="M60 209 C120 190 180 160 238 124 C275 100 295 100 330 124 C370 152 400 170 426 175 C450 180 480 168 520 151 L576 128"
                  fill="none" stroke="#0B1520" stroke-width="2.6" stroke-linecap="round"/>
            <circle cx="238" cy="124" r="5" fill="#C0392B"/>
            <circle cx="426" cy="175" r="5" fill="#0A7CAE"/>

            <text x="48" y="276" class="ax" fill="#78899A">tiempo</text>
            <text x="588" y="276" text-anchor="end" class="ax" fill="#78899A">esquema del control, valores ilustrativos</text>
          </svg>
        </div>

        <div class="stack">
          <div class="card anim" data-d="5">
            <span class="card-ix">AVISOS</span>
            <table class="t compact" style="margin-top:6px">
              <tbody>
                <tr><td>Temperatura</td><td>28 °C o más, 20 °C o menos</td></tr>
                <tr><td>Humedad</td><td>Menos de 40 %</td></tr>
                <tr><td>Pañal</td><td>Humedad detectada</td></tr>
                <tr><td>Gas o humo</td><td>Alarma continua</td></tr>
                <tr><td>Movimiento</td><td>Más de 0,5 g de desviación</td></tr>
              </tbody>
            </table>
          </div>
          <div class="card lit anim" data-d="6">
            <span class="card-ix">SIN REPETICIONES</span>
            <p style="color:var(--text)">Cada aviso se emite una vez y se rearma cuando la medida vuelve a un margen seguro.</p>
          </div>
        </div>
      </div>
    </div>
  </div>`
},

/* ───────────────────────────── 11 Código clave ──────────────────────────── */
{
  section: 'Lógica de control',
  title: 'Código clave',
  min: '6:45 a 7:45',
  html: `
  <div class="pad">
    <div class="kicker anim" data-d="1">Implementación</div>
    <h1 class="title sm anim" data-d="2">Código clave</h1>
    <div class="rule"></div>

    <div class="body-area top">
      <div class="grid g2 gap-sm">
        <div class="stack" style="gap:10px">
          <div class="code sm anim f" data-d="3">
            <div class="code-bar"><i class="dot"></i><i class="dot"></i><span class="nm">sketch.ino · escalada del llanto</span></div>
<pre><span class="k">unsigned long</span> duration = now - cryStart;
<span class="k">if</span> (!rockManual &amp;&amp; now &gt;= rockBlockedUntil) {
  <span class="k">if</span> (duration &gt;= scaled(LEVEL2_MS)) setRock(<span class="n">2</span>, <span class="k">false</span>);
  <span class="k">else</span> setRock(<span class="n">1</span>, <span class="k">false</span>);
}
<span class="k">if</span> (duration &gt;= scaled(ALERT_MS) &amp;&amp; !longCryReported) {
  longCryReported = <span class="k">true</span>;
  notifyPhone(NOTICE_CRY, <span class="s">"Llanto prolongado..."</span>, <span class="s">"baby"</span>, <span class="n">4</span>);
}</pre>
          </div>
          <div class="code sm anim f" data-d="4">
            <div class="code-bar"><i class="dot"></i><i class="dot"></i><span class="nm">sketch.ino · si la cuna se apaga, avisa el broker</span></div>
<pre>mqtt.connect(id, statusTopic, <span class="n">1</span>, <span class="k">true</span>, <span class="s">"offline"</span>);
mqtt.publish(statusTopic, <span class="s">"online"</span>, <span class="k">true</span>);</pre>
          </div>
        </div>
        <div class="stack" style="gap:10px">
          <div class="code sm anim f" data-d="5">
            <div class="code-bar"><i class="dot"></i><i class="dot"></i><span class="nm">sketch.ino · tiempo real</span></div>
<pre><span class="c">// Al instante si algo cambio, y un latido cada segundo</span>
<span class="k">uint32_t</span> stateSig = stateSignature();
<span class="k">if</span> ((stateSig != lastStateSig &amp;&amp; now - tPublish &gt;= <span class="n">200</span>)
    || now - tPublish &gt;= <span class="n">1000</span>) {
  lastStateSig = stateSig;
  tPublish = now;
  publishState();
}
delay(<span class="n">10</span>);</pre>
          </div>
          <div class="code sm anim f" data-d="6">
            <div class="code-bar"><i class="dot"></i><i class="dot"></i><span class="nm">panel/index.html · orden con confirmación</span></div>
<pre>client.publish(base + <span class="s">"/cmd"</span>, cmd, { qos: <span class="n">1</span> });
<span class="c">// Se repite hasta 3 veces si el estado no la confirma</span>
<span class="k">if</span> (item.check &amp;&amp; item.check(s)) {
  clearPending(g);
  mark(item.btn, <span class="s">"confirmed"</span>);
}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>`
}

);
