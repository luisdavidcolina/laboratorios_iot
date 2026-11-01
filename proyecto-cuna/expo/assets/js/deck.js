/* ==========================================================================
   deck.js : motor de la presentacion
   Sin modulos ES y sin dependencias, para que index.html abra con doble clic
   incluso sin internet en el salon.
   ========================================================================== */
/* Relleno minimo para navegadores viejos. padStart llego en 2017 y algunos
   equipos de sala o telefonos con Android antiguo no lo traen. */
if (!String.prototype.padStart) {
  String.prototype.padStart = function (largo, relleno) {
    var s = String(this);
    relleno = relleno === undefined ? ' ' : String(relleno);
    while (s.length < largo) s = relleno + s;
    return s;
  };
}

(function () {
  'use strict';

  var DECK = window.DECK || [];
  var TARGET_MIN = 10;              // objetivo real de la exposicion
  var HARD_MIN   = 15;              // tope que puso el profesor
  var root = document.getElementById('deck');
  if (!root || !DECK.length) return;

  /* ── Render ─────────────────────────────────────────────────────────────── */
  var total = DECK.length;

  var html = DECK.map(function (s, i) {
    var videoLayer = '';
    if (s.video) {
      videoLayer =
        '<div class="slide-video">' +
          '<div class="video-missing"></div>' +
          '<video muted loop playsinline preload="none" data-src="assets/video/' + s.video + '"></video>' +
        '</div>';
    }

    var foot = s.bare ? '' :
      '<div class="slide-foot">' +
        '<span class="sec">' + (s.section || '') + '</span>' +
        '<span class="spacer"></span>' +
        '<span>' + String(i + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0') + '</span>' +
      '</div>';

    var cls = 'slide';
    if (s.cinema) cls += ' cinema';          // lamina oscura a sangre completa
    else if (s.video) cls += ' has-video';   // panel de video a la derecha

    return '<section class="' + cls + '" data-i="' + i + '" id="s' + i + '">' +
      videoLayer + s.html + foot +
    '</section>';
  }).join('');

  root.innerHTML = html +
    '<div class="progress-track"><div class="progress-fill" id="pfill"></div></div>';

  var slides = Array.prototype.slice.call(root.querySelectorAll('.slide'));
  var pfill = document.getElementById('pfill');

  /* ── Escalado al viewport ───────────────────────────────────────────────── */
  function scaleToFit() {
    var an = window.innerWidth, al = window.innerHeight;
    // En pantallas verticales, como un telefono, conviene escalar por ancho.
    // Si se escalara por alto la lamina quedaria ilegible.
    var s = (al > an) ? (an / 1280) * 0.98 : Math.min(an / 1280, al / 720);
    root.style.transform = 'scale(' + s + ')';
  }
  // La barra de direcciones de los telefonos aparece y desaparece al
  // desplazar, y eso cambia el alto disponible sin que llegue un resize
  // normal. Se vuelve a medir tambien al girar el aparato.
  window.addEventListener('resize', scaleToFit);
  window.addEventListener('orientationchange', function () {
    scaleToFit();
    setTimeout(scaleToFit, 300);     // tras girar, las medidas tardan un poco
  });
  if (window.visualViewport && window.visualViewport.addEventListener) {
    window.visualViewport.addEventListener('resize', scaleToFit);
  }
  scaleToFit();

  /* ── Navegacion ─────────────────────────────────────────────────────────── */
  var cur = -1;

  var salidaTO = null;

  function show(n) {
    if (n < 0) n = 0;
    if (n > total - 1) n = total - 1;
    if (n === cur) return;

    // La direccion decide hacia donde empuja la transicion
    root.setAttribute('data-dir', (cur === -1 || n > cur) ? 'fwd' : 'back');

    if (cur > -1) {
      var saliendo = slides[cur];
      saliendo.classList.remove('is-active');
      saliendo.classList.add('leaving');
      stopVideo(saliendo);
      stopWidgets(saliendo);

      clearTimeout(salidaTO);
      salidaTO = setTimeout(function () {
        slides.forEach(function (sl, i) { if (i !== cur) sl.classList.remove('leaving'); });
      }, 420);
    }

    cur = n;
    slides[cur].classList.remove('leaving');
    slides[cur].classList.add('is-active');
    playVideo(slides[cur]);
    startWidgets(slides[cur]);

    pfill.style.width = ((cur + 1) / total * 100) + '%';
    paintHud();

    // Precarga del video siguiente para que no parpadee al llegar
    if (slides[cur + 1]) prime(slides[cur + 1]);

    try { history.replaceState(null, '', '#' + (cur + 1)); } catch (e) {}
  }

  function next() { show(cur + 1); }
  function prev() { show(cur - 1); }

  /* ── Video: carga perezosa y respaldo silencioso ────────────────────────── */
  function prime(slide) {
    var v = slide.querySelector('video');
    if (!v || v.dataset.primed) return;
    v.dataset.primed = '1';
    v.src = v.dataset.src;
    v.load();
    v.addEventListener('loadeddata', function () { v.classList.add('ready'); });
    // Si el archivo no existe, el error se traga aqui y queda el fondo de respaldo
    v.addEventListener('error', function () { v.style.display = 'none'; });
  }

  function playVideo(slide) {
    var v = slide.querySelector('video');
    if (!v) return;
    prime(slide);
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }

  function stopVideo(slide) {
    var v = slide.querySelector('video');
    if (v) { try { v.pause(); v.currentTime = 0; } catch (e) {} }
  }

  /* ── Widgets vivos de cada lamina ───────────────────────────────────────── */
  var timers = [];

  function stopWidgets() {
    timers.forEach(function (t) { clearInterval(t); clearTimeout(t); });
    timers = [];
  }

  function startWidgets(slide) {
    // 1. Marquesina de estados: simula el state machine de Home Assistant
    var tick = slide.querySelector('[data-widget="ticker"]');
    if (tick) {
      var rows = Array.prototype.slice.call(tick.querySelectorAll('.tr'));
      var k = 0;
      timers.push(setInterval(function () {
        var r = rows[k % rows.length];
        k++;
        if (!r) return;
        var val = r.querySelector('.val');
        var pool = (val.getAttribute('data-pool') || '').split('|');
        if (pool.length < 2) return;
        var i = (parseInt(val.getAttribute('data-i') || '0', 10) + 1) % pool.length;
        val.setAttribute('data-i', String(i));
        val.textContent = pool[i];
        val.classList.remove('chg');
        void val.offsetWidth;
        val.classList.add('chg');
      }, 1500));
    }

    // 2. Numeros que cuentan hacia arriba al entrar la lamina
    var cifras = Array.prototype.slice.call(slide.querySelectorAll('[data-count]'));
    cifras.forEach(function (el, idx) {
      var fin = parseFloat(el.getAttribute('data-count'));
      if (isNaN(fin)) return;
      var dec = (el.getAttribute('data-dec') || '0') | 0;
      var sep = el.getAttribute('data-sep') === '1';
      var dur = 1100, t0 = null;

      var pinta = function (v) {
        var txt = v.toFixed(dec);
        if (sep) txt = txt.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        el.textContent = txt;
      };

      pinta(0);
      var arranca = function (ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        pinta(fin * (1 - Math.pow(1 - p, 3)));      // desaceleracion cubica
        if (p < 1) requestAnimationFrame(arranca);
      };
      timers.push(setTimeout(function () { requestAnimationFrame(arranca); }, 260 + idx * 90));
    });

    // 3. Secuencia que avanza sola (disparador, condicion, accion)
    var seq = slide.querySelector('[data-widget="seq"]');
    if (seq) {
      var cells = Array.prototype.slice.call(seq.querySelectorAll('.sq'));
      var arrs = Array.prototype.slice.call(seq.querySelectorAll('.arr'));
      var j = 0;
      var step = function () {
        cells.forEach(function (c, ci) { c.classList.toggle('on', ci === j); });
        arrs.forEach(function (a, ai) { a.classList.toggle('on', ai === j); });
        j = (j + 1) % (cells.length + 1);
      };
      step();
      timers.push(setInterval(step, 1600));
    }
  }

  /* ── Barra de presentador ───────────────────────────────────────────────── */
  var hud = document.getElementById('hud');
  var counterEl = hud.querySelector('.counter');

  function paintHud() {
    counterEl.innerHTML = '<b>' + String(cur + 1).padStart(2, '0') + '</b> / ' + total;
  }

  var hudTO;
  function flashHud() {
    hud.classList.add('show');
    clearTimeout(hudTO);
    hudTO = setTimeout(function () { hud.classList.remove('show'); }, 2200);
  }

  /* ── Cronometro con presupuesto de 15 minutos ───────────────────────────── */
  var tEl = document.getElementById('timer');
  var t0 = null, tInt = null;

  function fmt(ms) {
    var s = Math.floor(ms / 1000);
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }

  function paintTimer() {
    if (!t0) { tEl.textContent = '00:00'; return; }
    var el = Date.now() - t0;
    tEl.textContent = fmt(el);
    var min = el / 60000;
    // Verde hasta el minuto 9, ambar entre el objetivo y el tope, rojo pasado el 12
    var alerta = TARGET_MIN + (HARD_MIN - TARGET_MIN) * 0.4;   // 12 min
    tEl.classList.toggle('run',  min < TARGET_MIN - 1);
    tEl.classList.toggle('warn', min >= TARGET_MIN - 1 && min < alerta);
    tEl.classList.toggle('over', min >= alerta);
  }

  function toggleTimer() {
    if (tInt) {                      // corriendo, se detiene y reinicia
      clearInterval(tInt); tInt = null; t0 = null;
      tEl.className = ''; tEl.textContent = '00:00';
    } else {
      t0 = Date.now();
      tInt = setInterval(paintTimer, 500);
      paintTimer();
    }
  }

  tEl.addEventListener('click', toggleTimer);

  /* ── Teclado ────────────────────────────────────────────────────────────── */
  var blackout = document.getElementById('blackout');
  var helpEl = document.getElementById('help');
  var jumpEl = document.getElementById('jump');
  var jumpBuf = '';
  var jumpTO;

  document.addEventListener('keydown', function (e) {
    var tag = e.target && e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    // Salto por numero: se teclea 07 y se salta a la lamina 7
    if (/^[0-9]$/.test(e.key)) {
      jumpBuf += e.key;
      jumpEl.textContent = jumpBuf;
      jumpEl.classList.add('on');
      clearTimeout(jumpTO);
      jumpTO = setTimeout(function () {
        var n = parseInt(jumpBuf, 10);
        jumpBuf = '';
        jumpEl.classList.remove('on');
        if (!isNaN(n)) show(n - 1);
      }, 850);
      return;
    }

    switch (e.key) {
      case 'ArrowRight': case ' ': case 'PageDown': case 'Enter':
        e.preventDefault(); next(); flashHud(); break;
      case 'ArrowLeft': case 'Backspace': case 'PageUp':
        e.preventDefault(); prev(); flashHud(); break;
      case 'Home': e.preventDefault(); show(0); break;
      case 'End':  e.preventDefault(); show(total - 1); break;
      case 'i': case 'I': show(1); break;
      case 'b': case 'B': blackout.classList.toggle('on'); break;
      case 't': case 'T': toggleTheme(); break;
      case 'r': case 'R': toggleTimer(); break;
      case 'f': case 'F': toggleFull(); break;
      case '?': case 'h': case 'H': helpEl.classList.toggle('on'); break;
      case 'Escape':
        helpEl.classList.remove('on');
        blackout.classList.remove('on');
        break;
    }
  });

  helpEl.addEventListener('click', function () { helpEl.classList.remove('on'); });
  blackout.addEventListener('click', function () { blackout.classList.remove('on'); });

  /* ── Tema ───────────────────────────────────────────────────────────────── */
  function toggleTheme() {
    var isLight = document.documentElement.getAttribute('data-theme') === 'light';
    var nextT = isLight ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', nextT);
    try { localStorage.setItem('ha-deck-theme', nextT); } catch (e) {}
  }

  // El tema se puede forzar por URL (?tema=claro o ?tema=oscuro), util para
  // probar en el proyector del salon sin depender de lo que quedo guardado.
  var temaURL = (location.search.match(/tema=(claro|oscuro)/) || [])[1];
  if (temaURL) {
    document.documentElement.setAttribute('data-theme', temaURL === 'claro' ? 'light' : 'dark');
  } else {
    try {
      var saved = localStorage.getItem('ha-deck-theme');
      if (saved) document.documentElement.setAttribute('data-theme', saved);
    } catch (e) {}
  }

  /* ── Pantalla completa ──────────────────────────────────────────────────── */
  function toggleFull() {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  /* ── Botones de la barra ────────────────────────────────────────────────── */
  hud.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    var a = b.getAttribute('data-act');
    if (a === 'prev') prev();
    if (a === 'next') next();
    if (a === 'index') show(1);
    if (a === 'theme') toggleTheme();
    if (a === 'full') toggleFull();
    if (a === 'help') helpEl.classList.toggle('on');
    if (a === 'print') printAll();
  });

  /* ── Exportacion a PDF ──────────────────────────────────────────────────── */
  function printAll() {
    slides.forEach(function (s) { s.classList.add('is-active'); });
    setTimeout(function () {
      window.print();
      setTimeout(function () {
        slides.forEach(function (s, i) { s.classList.toggle('is-active', i === cur); });
      }, 400);
    }, 260);
  }

  /* ── Indice clicable ────────────────────────────────────────────────────── */
  root.addEventListener('click', function (e) {
    var it = e.target.closest('[data-go]');
    if (it) { show(parseInt(it.getAttribute('data-go'), 10) - 1); return; }
    // Clic en la mitad derecha avanza, en la izquierda retrocede
    if (e.target.closest('a, button, .toc-item')) return;
    var x = e.clientX / window.innerWidth;
    if (x > 0.62) next();
    else if (x < 0.22) prev();
  });

  /* ── Deslizar en pantalla tactil ────────────────────────────────────────── */
  var tx = 0;
  document.addEventListener('touchstart', function (e) { tx = e.changedTouches[0].screenX; }, { passive: true });
  document.addEventListener('touchend', function (e) {
    var d = e.changedTouches[0].screenX - tx;
    if (Math.abs(d) > 55) { if (d < 0) next(); else prev(); }
  }, { passive: true });

  /* ── Arranque ───────────────────────────────────────────────────────────── */
  var fromHash = parseInt((location.hash || '').replace('#', ''), 10);
  show(!isNaN(fromHash) && fromHash > 0 ? fromHash - 1 : 0);
  flashHud();
})();
