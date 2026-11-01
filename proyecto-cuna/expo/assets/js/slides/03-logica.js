/* 03 - Lógica de control: respuesta al llanto y ambiente del cuarto */
window.DECK.push(

/* ───────────────────────────── 06 Respuesta al llanto ───────────────────── */
{
  section: 'Lógica de control',
  title: 'Respuesta al llanto',
  min: '3:35 a 4:40',
  html: `
  <div class="pad">
    <div class="kicker anim" data-d="1">Lógica de control</div>
    <h1 class="title anim" data-d="2">Respuesta al llanto</h1>
    <p class="subtitle anim" data-d="3">
      La respuesta crece con la duración del llanto. Un ruido aislado no cuenta y la alarma se
      reserva para los casos prolongados.
    </p>
    <div class="rule"></div>

    <div class="body-area">
      <div class="anim f" data-d="4">
        <div class="tl">
          <div class="tl-seg" style="flex:1"><span class="n">0 S</span><span class="l">Ruido sobre el umbral</span><span class="m">sensor de sonido</span></div>
          <div class="tl-seg hot" style="flex:1"><span class="n">2 S</span><span class="l">Llanto confirmado</span><span class="m">mecido suave</span></div>
          <div class="tl-seg" style="flex:1"><span class="n">60 S</span><span class="l">Sigue el llanto</span><span class="m">mecido firme</span></div>
          <div class="tl-seg hot" style="flex:1"><span class="n">180 S</span><span class="l">Llanto prolongado</span><span class="m">alarma y aviso</span></div>
          <div class="tl-seg" style="flex:1"><span class="n">5 MIN</span><span class="l">Límite de seguridad</span><span class="m">el mecido se detiene</span></div>
        </div>
      </div>

      <div class="grid g3 gap-lg" style="margin-top:28px">
        <div class="card anim" data-d="5">
          <span class="card-ix">CONDICIÓN</span>
          <h3>Bebé presente</h3>
          <p>La balanza debe marcar al menos 1 kg. Con la cuna vacía no hay respuesta.</p>
        </div>
        <div class="card anim" data-d="6">
          <span class="card-ix">CALMA</span>
          <h3>20 segundos de silencio</h3>
          <p>El mecido se detiene y el sistema vuelve al estado tranquilo.</p>
        </div>
        <div class="card anim" data-d="7">
          <span class="card-ix">DESCANSO</span>
          <h3>2 minutos sin mecer</h3>
          <p>Tras el límite de 5 minutos, el mecido automático no se reinicia antes.</p>
        </div>
      </div>
    </div>
  </div>`
},

/* ───────────────────────────── 07 Ambiente del cuarto ───────────────────── */
{
  section: 'Lógica de control',
  title: 'Ambiente del cuarto',
  min: '4:40 a 5:30',
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
            <span class="card-ix">AVISOS AL PANEL</span>
            <table class="t compact" style="margin-top:6px">
              <tbody>
                <tr><td>Temperatura</td><td>Más de 28 °C o menos de 20 °C</td></tr>
                <tr><td>Humedad</td><td>Menos de 40 %</td></tr>
                <tr><td>Pañal</td><td>Humedad detectada</td></tr>
                <tr><td>Gas o humo</td><td>Alarma continua</td></tr>
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
}

);
