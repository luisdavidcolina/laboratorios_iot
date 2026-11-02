// Banco de pruebas: corre el firmware y el circuito del repo en una copia temporal de Wokwi,
// sin guardar, con un CRADLE_ID propio, y habla con ella por el broker MQTT.
const fs = require("fs");
const path = require("path");

const { chromium } = require("playwright");
const mqtt = require("mqtt");
const R = path.resolve(__dirname, "../..");
const SH = path.join(__dirname, "salida") + path.sep;
fs.mkdirSync(SH, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const med = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[s.length >> 1] : null; };

async function openBench({ viewport = { width: 1800, height: 1100 }, id, transformSketch } = {}) {
  const ID = id || "t" + Math.random().toString(16).slice(2, 8);
  const base = "ucv6565/cuna/" + ID;
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport });
  const p = await ctx.newPage();
  await p.goto("https://wokwi.com/projects/479524283087739905", { waitUntil: "domcontentloaded", timeout: 60000 });
  await p.waitForTimeout(12000);
  for (const tab of ["diagram.json", "libraries.txt", "sketch.ino"]) {
    await p.getByText(tab, { exact: true }).first().click();
    await p.waitForTimeout(1000);
  }
  let sketch = fs.readFileSync(R + "/sketch.ino", "utf8").replace(/\r/g, "");
  if (transformSketch) sketch = transformSketch(sketch);
  sketch = sketch.replace('"lcolina"', '"' + ID + '"');
  const diagram = fs.readFileSync(R + "/diagram.json", "utf8");
  const libs = fs.readFileSync(R + "/libraries.txt", "utf8");
  await p.evaluate(({ d, sk, l }) => {
    const ms = monaco.editor.getModels();
    ms.find(m => m.uri.path.endsWith("diagram.json")).setValue(d);
    ms.find(m => m.uri.path.endsWith("sketch.ino")).setValue(sk);
    ms.find(m => m.uri.path.endsWith("libraries.txt")).setValue(l);
  }, { d: diagram, sk: sketch, l: libs });
  await p.waitForTimeout(2500);

  const c = mqtt.connect("wss://broker.hivemq.com:8884/mqtt", { clientId: "banco-" + ID, reconnectPeriod: 1000 });
  const bench = { ID, base, b, ctx, p, c, states: [], events: [], status: [], last: null, waiters: [] };
  c.on("message", (t, pl, pk) => {
    const now = Date.now(), x = pl.toString();
    if (t.endsWith("/state") && x) {
      const s = JSON.parse(x);
      bench.last = s;
      bench.states.push({ at: now, s, retain: pk.retain });
    } else if (t.endsWith("/event")) {
      bench.events.push({ at: now, x });
      log("evento:", x);
    } else if (t.endsWith("/status") && x) {
      bench.status.push({ at: now, x, retain: pk.retain });
      log("status:", x);
    }
    bench.waiters = bench.waiters.filter(w => {
      if (!w.check()) return true;
      w.resolve(now);
      return false;
    });
  });
  await new Promise(r => c.on("connect", r));
  c.subscribe(base + "/#");

  // Espera hasta que check() sea cierto, o devuelve null al agotar el tiempo
  bench.until = (check, ms = 30000) => new Promise(resolve => {
    if (check()) return resolve(Date.now());
    const w = { check, resolve };
    bench.waiters.push(w);
    setTimeout(() => {
      if (bench.waiters.includes(w)) {
        bench.waiters = bench.waiters.filter(o => o !== w);
        resolve(null);
      }
    }, ms);
  });
  bench.send = cmd => { log("orden:", cmd); c.publish(base + "/cmd", cmd); };
  bench.waitEvent = (text, ms = 30000) => {
    const from = bench.events.length;
    return bench.until(() => bench.events.slice(from).some(e => e.x.startsWith(text)), ms);
  };
  bench.waitState = (f, ms = 30000) => bench.until(() => bench.last && f(bench.last), ms);
  bench.start = async () => {
    const t0 = Date.now();
    await p.locator('[aria-label="Start the simulation"]').first().click();
    const ok = await bench.until(() => bench.states.some(x => !x.retain), 240000);
    if (!ok) {
      await p.screenshot({ path: SH + "banco_fallo.png" });
      throw new Error("sin estado en 240 s: " + (await p.evaluate(() => document.body.innerText)).slice(-500));
    }
    bench.firstState = (Date.now() - t0) / 1000;
    log("primer estado en vivo a los", bench.firstState.toFixed(1), "s");
  };
  bench.speed = () => p.evaluate(() => {
    const m = document.body.innerText.match(/(\d\d:\d\d\.\d{3})\s*(\d{1,3})%/);
    return m ? { reloj: m[1], pct: +m[2] } : null;
  });
  bench.serial = () => p.evaluate(() => document.body.innerText);
  // Las piezas del simulador se ubican en el DOM por su orden en diagram.json
  bench.partIndex = id => {
    const d = JSON.parse(diagram);
    const part = d.parts.find(x => x.id === id);
    const same = d.parts.filter(x => x.type === part.type);
    return { type: part.type, index: same.indexOf(part) };
  };
  bench.setSlider = async (id, value) => {
    const { type, index } = bench.partIndex(id);
    await p.evaluate(({ type, index, value }) => {
      const el = document.querySelectorAll(type)[index];
      el.value = value;
      el.dispatchEvent(new InputEvent("input"));
    }, { type, index, value });
  };
  bench.pressButton = async (id, holdMs = 1200) => {
    const { type, index } = bench.partIndex(id);
    const fire = name => p.evaluate(({ type, index, name }) => {
      document.querySelectorAll(type)[index].dispatchEvent(new Event(name));
    }, { type, index, name });
    await fire("button-press");
    await sleep(holdMs);
    await fire("button-release");
  };
  bench.stop = async () => {
    await p.locator('[aria-label="Stop the simulation"]').first().click().catch(() => {});
  };
  bench.close = async () => {
    c.publish(base + "/state", "", { retain: true });
    c.publish(base + "/status", "", { retain: true });
    await sleep(800);
    c.end(true);
    await b.close();
  };
  return bench;
}
module.exports = { openBench, sleep, log, med, SH, R };
