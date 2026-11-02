// Verificacion definitiva: firmware y circuito finales contra el panel publicado en Vercel
const fs = require("fs");
const { openBench, sleep, log, med, SH } = require("./banco");
const out = {};
const save = () => fs.writeFileSync(SH + "final.json", JSON.stringify(out, null, 1));
const URL_PANEL = "https://proyecto-cuna.vercel.app/";

(async () => {
  const t = await openBench({ viewport: { width: 2000, height: 1300 } });
  const { p } = t;
  await p.locator('[aria-label="Zoom, grid, and more"]').first().click();
  await sleep(400);
  await p.getByText("Fit", { exact: true }).first().click();
  await sleep(1000);
  await p.keyboard.press("Escape");
  out.id = t.ID;
  log("ID", t.ID);
  const hw = () => p.evaluate(() => {
    const leds = document.querySelectorAll("wokwi-led");
    return { ventilador: !!leds[0].value, alerta: !!leds[1].value, servo: document.querySelector("wokwi-servo").angle };
  });
  const setAnalog = (id, v) => p.evaluate(({ id, v, order }) => {
    const el = document.querySelectorAll("wokwi-slide-potentiometer")[order.indexOf(id)];
    el.value = v;
    el.dispatchEvent(new InputEvent("input", { detail: v }));
  }, { id, v, order: ["sound", "gas", "wet", "weight"] });
  const pct = v => Math.round(v / 100 * 1023);
  const toAdc = adc => Math.round(adc / 4095 * 1023);

  await t.start();
  out.primerEstado_s = t.firstState;
  const panel = await t.ctx.newPage();
  const errores = [];
  panel.on("pageerror", e => errores.push(e.message));
  panel.on("console", m => { if (m.type() === "error") errores.push(m.text()); });
  await panel.setViewportSize({ width: 760, height: 900 });
  await panel.goto(`${URL_PANEL}?id=${t.ID}`, { waitUntil: "load" });
  await p.bringToFront();
  const dom = () => panel.evaluate(() => ({
    broker: document.getElementById("txtBroker").textContent,
    cuna: document.getElementById("txtCuna").textContent,
    fresh: document.getElementById("txtFresh").textContent,
    speed: document.getElementById("txtSpeed").textContent,
    big: document.getElementById("statusBig").textContent,
    wet: document.getElementById("vWet").textContent,
    gasBad: document.getElementById("mGas").classList.contains("bad"),
    stale: document.body.classList.contains("stale"),
    dis: document.getElementById("sCry").disabled,
  }));

  // Velocidad en reposo
  const tRun = Date.now();
  const speeds = [];
  while (Date.now() - tRun < 30000) { await sleep(5000); const s = await t.speed(); if (s) speeds.push(s.pct); }
  out.velocidad_pct = { mediana: med(speeds), muestras: speeds };
  log("velocidad", JSON.stringify(out.velocidad_pct));

  // 1. Tiempo real
  const lat = [];
  let want = 1;
  for (let i = 0; i < 12; i++) {
    const w = want; want = want ? 0 : 1;
    const t0 = Date.now();
    const pe = t.waitEvent("Simulacion de bebe", 20000);
    const ps = t.waitState(s => s.sb === w, 20000);
    t.c.publish(t.base + "/cmd", "sim:baby:" + w);
    const [a, b] = await Promise.all([pe, ps]);
    lat.push({ aviso: a ? a - t0 : null, estado: b ? b - t0 : null });
    await sleep(1500 + Math.random() * 1500);
  }
  const est = lat.filter(l => l.estado !== null).map(l => l.estado);
  out.tiempoReal = { ordenes: lat.length, perdidas: lat.filter(l => l.estado === null).length, estado_ms: { mediana: med(est), min: Math.min(...est), max: Math.max(...est), valores: est }, aviso_mediana_ms: med(lat.filter(l => l.aviso).map(l => l.aviso)) };
  log("tiempo real", JSON.stringify(out.tiempoReal));
  save();

  // 5. Deslizantes
  const lect = { sound: s => s.sound, gas: s => s.gas, wet: s => s.wet, weight: s => s.kg };
  out.deslizantes = {};
  for (const id of Object.keys(lect)) {
    out.deslizantes[id] = [];
    for (const v of [100, 50, 0]) {
      await setAnalog(id, pct(v));
      await sleep(5000);
      out.deslizantes[id].push({ pct: v, lectura: lect[id](t.last) });
    }
    log("deslizante", id, JSON.stringify(out.deslizantes[id]));
  }
  await sleep(3000);

  // 5. Botones del circuito
  const flag = { btn_baby: s => s.sb, btn_cry: s => s.sc, btn_wet: s => s.sw, btn_gas: s => s.sg };
  out.botones = {};
  for (const id of Object.keys(flag)) {
    const antes = flag[id](t.last);
    await t.pressButton(id);
    const on = await t.waitState(s => flag[id](s) !== antes, 15000);
    await sleep(1500);
    await t.pressButton(id);
    const off = await t.waitState(s => flag[id](s) === antes, 15000);
    out.botones[id] = !!on && !!off;
    log("boton", id, out.botones[id] ? "OK" : "FALLO");
    await sleep(2000);
  }
  t.send("sim:off");
  await sleep(3000);
  save();

  // 5. Cada control del panel publicado
  await panel.bringToFront();
  const res = {};
  async function pulsa(sel, check, nombre) {
    await panel.evaluate(() => { window.__marca = null; });
    await panel.evaluate(s => {
      const el = document.querySelector(s);
      const ob = new MutationObserver(() => {
        if (el.classList.contains("confirmed")) window.__marca = "confirmado";
        if (el.classList.contains("failed")) window.__marca = "fallo";
      });
      ob.observe(el, { attributes: true, attributeFilter: ["class"] });
      window.__ob = ob;
    }, sel);
    const t0 = Date.now();
    await panel.click(sel);
    const ok = await t.waitState(check, 20000);
    await panel.waitForFunction(() => window.__marca, null, { timeout: 18000 }).catch(() => null);
    const marca = await panel.evaluate(() => { window.__ob.disconnect(); return window.__marca; });
    const r = { estado: !!ok, marca, s: +((Date.now() - t0) / 1000).toFixed(1) };
    res[nombre] = r;
    log(nombre.padEnd(26), JSON.stringify(r));
  }
  await pulsa("#sBaby", s => s.sb === 1, "Bebe en la cuna");
  await pulsa("#sCry", s => s.sc === 1, "Hacer llorar");
  await pulsa("#sCry", s => s.sc === 0, "Dejar de llorar");
  await pulsa("#sWet", s => s.sw === 1, "Mojar el panal");
  await pulsa("#sWet", s => s.sw === 0, "Secar el panal");
  await pulsa("#sHeat", s => s.sh === 1, "Calentar");
  await pulsa("#sHeat", s => s.sh === 0, "Quitar calor");
  await pulsa("#sGas", s => s.sg === 1, "Fuga de gas");
  await pulsa("#sGas", s => s.sg === 0, "Quitar gas");
  await pulsa("#dDemo", s => s.demo === 1, "Modo demo");
  await pulsa("#dDemo", s => s.demo === 0, "Quitar demo");
  for (const c of [27, 25, 24]) await pulsa(`.tempBtn[data-temp="${c}"]`, s => s.st === c, "Forzar " + c);
  await pulsa("#tReal", s => s.st === null, "Lectura real");
  for (const [sel, n] of [["#r1", 1], ["#r2", 2], ["#r3", 3], ["#r0", 0]]) await pulsa(sel, s => s.rock === n, "Mecer " + n);
  await pulsa("#fOn", s => s.auto === 0 && s.fan === 1, "Ventilador encendido");
  await pulsa("#fOff", s => s.auto === 0 && s.fan === 0, "Ventilador apagado");
  await pulsa("#fAuto", s => s.auto === 1, "Ventilador automatico");
  await panel.fill("#iCry", "2500");
  await pulsa("#aCry", s => s.ct === 2500, "Umbral llanto 2500");
  await panel.fill("#iCry", "2000");
  await pulsa("#aCry", s => s.ct === 2000, "Umbral llanto 2000");
  await panel.fill("#iFan", "27");
  await pulsa("#aFan", s => s.fo === 27 && s.ff === 25.5, "Encendido a 27");
  await panel.fill("#iFan", "26");
  await pulsa("#aFan", s => s.fo === 26, "Encendido a 26");
  await pulsa("#bBeep", () => true, "Probar buzzer");
  await pulsa("#sOff", s => !s.sb && !s.sc && !s.sw && !s.sh && !s.sg && s.st === null, "Restablecer");
  out.controles = res;
  out.controlesFallidos = Object.entries(res).filter(([k, v]) => !v.estado || v.marca !== "confirmado").map(([k]) => k);
  log("controles fallidos:", JSON.stringify(out.controlesFallidos));
  save();
  await p.bringToFront();

  // 3. Histeresis forzada con el LED real
  out.histeresis = {};
  for (const [c, fan] of [[27, 1], [25, 1], [24, 0]]) {
    t.send("sim:temp:" + c);
    await t.waitState(s => s.st === c, 15000);
    await sleep(3500);
    out.histeresis[c] = { fan: t.last.fan, esperado: fan, ledVerde: (await hw()).ventilador };
    log("histeresis", c, JSON.stringify(out.histeresis[c]));
  }
  t.send("sim:temp:off");
  await t.waitState(s => s.st === null, 15000);

  // 4. Gas y panal con rearme, comparando con el panel
  const paso = async (id, v, nombre) => {
    await setAnalog(id, v);
    await sleep(5500);
    const d = await dom(), h = await hw();
    return { nombre, gas: t.last.gas, wet: t.last.wet, ga: t.last.ga, wa: t.last.wa, ledRojo: h.alerta, panelGasBad: d.gasBad, panelWet: d.wet, panelBig: d.big };
  };
  out.gas = [await paso("gas", toAdc(2200), "sobre"), await paso("gas", toAdc(1600), "entre"), await paso("gas", toAdc(1200), "bajo")];
  log("gas", JSON.stringify(out.gas));
  out.panal = [await paso("wet", toAdc(2400), "sobre"), await paso("wet", toAdc(1800), "entre"), await paso("wet", toAdc(1200), "bajo")];
  log("panal", JSON.stringify(out.panal));
  await setAnalog("gas", 0);
  await setAnalog("wet", 0);
  save();

  // Avisos sin bloquear: el servo sigue y el estado no se corta durante el envio
  await sleep(32000);       // deja vencer el limite de frecuencia del aviso de gas
  t.send("rock:1");
  await t.waitState(s => s.rock === 1, 15000);
  await sleep(4000);
  const n0 = t.states.length;
  const angulos = [];
  const samp = setInterval(async () => { try { angulos.push((await hw()).servo); } catch (e) {} }, 500);
  t.send("sim:gas:1");
  await t.waitEvent("Gas o humo detectado", 15000);
  await sleep(12000);
  clearInterval(samp);
  const dur = t.states.slice(n0);
  const g = dur.slice(1).map((x, i) => x.at - dur[i].at);
  out.noBloquea = { estados: dur.length, gapMax_ms: Math.max(...g), gapMediana_ms: med(g), angulosDistintos: new Set(angulos).size };
  log("no bloquea", JSON.stringify(out.noBloquea));
  await p.mouse.move(1950, 1250);
  await sleep(500);
  await p.screenshot({ path: SH + "fin_circuito_gas.png" });
  t.send("sim:gas:0");
  t.send("rock:0");
  await t.waitState(s => s.ga === 0 && s.rock === 0, 15000);
  await sleep(2000);
  save();

  // 2. Modo demo, despues de Detener: no debe quedar bloqueado
  t.send("demo:on");
  await t.waitState(s => s.demo === 1, 15000);
  t.send("sim:baby:1");
  await t.waitState(s => s.sb === 1, 15000);
  await sleep(1500);
  const n1 = t.events.length;
  const tDemo = Date.now();
  const upIni = t.last.up;
  await setAnalog("sound", toAdc(3600));
  const espera = async (texto, ms) => {
    const k = await t.until(() => t.events.slice(n1).some(e => e.x.startsWith(texto)), ms);
    const r = { evento: texto, ok: !!k, real_s: k ? +((k - tDemo) / 1000).toFixed(1) : null, sim_s: t.last.up - upIni };
    log("demo", JSON.stringify(r));
    return r;
  };
  const m = [];
  m.push(await espera("Llanto detectado", 30000));
  m.push(await espera("Mecido suave", 30000));
  await sleep(1500);
  await p.screenshot({ path: SH + "fin_circuito_llanto.png" });
  m.push(await espera("Mecido firme", 90000));
  m.push(await espera("Llanto prolongado", 120000));
  m.push(await espera("Balanceo detenido a los 5 minutos", 180000));
  await setAnalog("sound", 0);
  m.push(await espera("El bebe se calmo", 60000));
  t.send("demo:off");
  await t.waitState(s => s.demo === 0, 15000);
  out.demo = m;
  save();

  // Avisos en ntfy
  await sleep(3000);
  const txt = await (await fetch(`https://ntfy.sh/ucv6565-cuna-${t.ID}/json?poll=1&since=all`)).text();
  out.ntfy = txt.trim().split("\n").filter(Boolean).map(l => JSON.parse(l)).filter(x => x.event === "message").map(x => x.message + " (" + x.priority + ")");
  log("ntfy", JSON.stringify(out.ntfy));
  out.serial = (await t.serial()).split("\n").filter(l => /Aviso al telefono|MQTT desconectado/.test(l));
  out.conexiones = t.events.filter(e => e.x === "Cuna conectada").length;
  out.sesion_s = +((Date.now() - tRun) / 1000).toFixed(0);
  out.up = t.last.up;
  log("conexiones", out.conexiones, "en", out.sesion_s, "s reales; simulados", out.up);
  save();

  // 6. Apagado
  const tStop = Date.now();
  await t.stop();
  log("simulacion detenida");
  await panel.bringToFront();
  let sinSenal = null;
  for (let i = 0; i < 200; i++) {
    await sleep(500);
    const d = await dom();
    if (d.cuna !== "en línea") { sinSenal = (Date.now() - tStop) / 1000; break; }
  }
  const lw = await t.until(() => t.status.some(x => x.x === "offline"), 120000);
  await sleep(1500);
  const recargas = [];
  for (let i = 0; i < 3; i++) {
    const t0 = Date.now();
    await panel.reload({ waitUntil: "load" });
    const vistos = new Set();
    let con = null;
    for (let k = 0; k < 60; k++) {
      const d = await dom();
      vistos.add(d.cuna);
      if (d.broker === "conectado" && con === null) con = (Date.now() - t0) / 1000;
      if (con !== null && Date.now() - t0 > con * 1000 + 2000) break;
      await sleep(250);
    }
    const d = await dom();
    recargas.push({ conectado_s: con, cuna: d.cuna, vistos: [...vistos], stale: d.stale, controlesOff: d.dis });
    await sleep(500);
  }
  out.apagado = { sinSenal_s: sinSenal, lwt_s: lw ? +((lw - tStop) / 1000).toFixed(1) : null, recargas };
  log("apagado", JSON.stringify(out.apagado));
  out.errores = errores;
  log("errores panel", JSON.stringify(errores));
  save();
  await t.close();
  log("FIN");
  process.exit(0);
})().catch(e => { console.error("ERROR", e); save(); process.exit(1); });
