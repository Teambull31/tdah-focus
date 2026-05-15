// Helpers: persistence + sound + notifications

(function () {
  const NS = "cerveau:v1:";

  window.usePersistedState = function (key, initial) {
    const fullKey = NS + key;
    const [val, setVal] = React.useState(() => {
      try {
        const raw = localStorage.getItem(fullKey);
        if (raw === null) return typeof initial === "function" ? initial() : initial;
        return JSON.parse(raw);
      } catch (e) {
        return typeof initial === "function" ? initial() : initial;
      }
    });
    React.useEffect(() => {
      try { localStorage.setItem(fullKey, JSON.stringify(val)); } catch (e) {}
    }, [val, fullKey]);
    return [val, setVal];
  };

  // Audio cues — synthesized, no external files
  let actx = null;
  const ensureCtx = () => {
    if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === "suspended") actx.resume();
    return actx;
  };
  const playTone = (freq, dur, when = 0, type = "sine", gain = 0.2) => {
    const ctx = ensureCtx();
    const t = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur);
  };

  window.SOUNDS = {
    chime: () => {           // doux, fin de focus
      playTone(880, 0.45, 0, "sine", 0.18);
      playTone(1318, 0.6, 0.12, "sine", 0.13);
    },
    arcade: () => {          // retro, win
      playTone(523, 0.08, 0, "square", 0.12);
      playTone(659, 0.08, 0.09, "square", 0.12);
      playTone(784, 0.08, 0.18, "square", 0.12);
      playTone(1047, 0.18, 0.27, "square", 0.14);
    },
    voice: () => {           // sympa: 2 notes courtes
      playTone(440, 0.18, 0, "triangle", 0.18);
      playTone(587, 0.22, 0.17, "triangle", 0.16);
    },
    breakStart: () => {      // soft signal pause
      playTone(660, 0.25, 0, "sine", 0.14);
      playTone(440, 0.35, 0.15, "sine", 0.12);
    },
    tick: () => playTone(800, 0.04, 0, "sine", 0.1),
    panic: () => {           // bruit brun très doux
      const ctx = ensureCtx();
      const bs = ctx.sampleRate * 1.5;
      const buf = ctx.createBuffer(1, bs, ctx.sampleRate);
      const d = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < bs; i++) {
        const w = (Math.random() * 2 - 1) * 0.08;
        last = (last + w) / 1.02;
        d[i] = last * 3;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const g = ctx.createGain();
      g.gain.value = 0.18;
      src.connect(g).connect(ctx.destination);
      src.start();
      return () => { try { src.stop(); } catch(e){} };
    },
  };

  window.askNotif = async () => {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;
    const r = await Notification.requestPermission();
    return r === "granted";
  };
  window.sendNotif = (title, body) => {
    try {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body, silent: true });
      }
    } catch (e) {}
  };

  // Week-of-year helper (for joker)
  window.weekKey = (d = new Date()) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
    return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
  };

  // Generate a fake-but-plausible year heatmap, deterministic by seed
  window.genHeatmap = (seed = 7) => {
    const days = 365;
    let s = seed;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    const data = [];
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(end.getDate() - i);
      const dow = d.getDay();
      const weekendDrop = (dow === 0 || dow === 6) ? 0.45 : 1;
      const r = rnd();
      let level = 0;
      const v = r * weekendDrop;
      if (v > 0.85) level = 4;
      else if (v > 0.65) level = 3;
      else if (v > 0.4) level = 2;
      else if (v > 0.18) level = 1;
      data.push({ date: d.toISOString().slice(0,10), level, min: level * 25 + Math.round(rnd() * 20) });
    }
    return data;
  };
})();
