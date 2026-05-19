// Main App shell + Dashboard + Timer + Break panel + Hyperfocus

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "pomoLength": 25,
  "breakLength": 5,
  "dark": false,
  "stim": "mid",
  "lang": "fr"
}/*EDITMODE-END*/;

const fmt = (s) => {
  const m = Math.floor(Math.max(0, s) / 60);
  const sec = Math.max(0, s) % 60;
  return [String(m).padStart(2, "0"), String(sec).padStart(2, "0")];
};

/* ───────── Timer card ───────── */

function TimerCard({ t, lang, current, mode, remaining, total, running, start, pause, stop, skip, openHyper, openMini, pomoLength, breakLength, setPomoLength, setBreakLength, onDropTask, draggingId, pulse }) {
  const [mm, ss] = fmt(remaining);
  const pct = total ? ((total - remaining) / total) * 100 : 0;
  const isBreak = mode === "break";
  const [dropOver, setDropOver] = React.useState(false);
  const [editingLen, setEditingLen] = React.useState(false);

  const pomoPresets = [15, 25, 45, 50, 90];
  const breakPresets = [3, 5, 10, 15];
  const currentLen = isBreak ? breakLength : pomoLength;
  const setLen = isBreak ? setBreakLength : setPomoLength;
  const presets = isBreak ? breakPresets : pomoPresets;
  return (
    <div
      className={`card timer-card ${dropOver ? "drop-target" : ""} ${pulse ? "timer-pulse" : ""}`}
      onDragOver={(e) => { if (draggingId) { e.preventDefault(); setDropOver(true); } }}
      onDragLeave={() => setDropOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDropOver(false);
        const id = parseInt(e.dataTransfer.getData("text/task-id"), 10);
        if (id && onDropTask) onDropTask(id);
      }}
    >
      <span className="sticker" style={{ top: -14, right: 24 }}>{isBreak ? "🫧 chill" : "🎯 focus"}</span>
      <div className="timer-head">
        <div>
          <span className={`timer-mode ${isBreak ? "break" : ""}`}>{isBreak ? "● " + t.breakTime : "● " + t.workSession}</span>
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, opacity: 0.7, textAlign: "right" }}>
          POMODORO #4 / 8<br/>
          <span style={{ opacity: 0.6 }}>{pomoLength}min · pause {isBreak ? "✓" : "→"}</span>
        </div>
      </div>

      <div className="current-task">{current ? current.title[lang] : (isBreak ? (lang === "fr" ? "Cerveau au repos. Vraiment." : "Brain on pause. Really.") : t.pickTask)}</div>
      {current && <div className="current-task-note">{current.note[lang]}</div>}
      {!current && !isBreak && <div className="current-task-note">{lang === "fr" ? "Tape sur une tâche en dessous, ou commence sans" : "Tap a task below, or start blank"}</div>}

      <div className="time-display">
        <span>{mm}</span><span className="sep">:</span><span>{ss}</span>
        <span className="tail">/ {Math.floor(total / 60)}:00</span>
      </div>

      <div className="duration-row">
        <span className="duration-lab">{isBreak ? (lang === "fr" ? "Pause :" : "Break:") : (lang === "fr" ? "Durée :" : "Length:")}</span>
        {presets.map(p => (
          <button
            key={p}
            className={`duration-chip ${currentLen === p ? "on" : ""}`}
            onClick={() => { if (!running) setLen(p); }}
            disabled={running}
            title={running ? (lang === "fr" ? "stoppe le timer pour changer" : "stop timer to change") : ""}
          >{p}</button>
        ))}
        <button
          className="duration-chip custom"
          disabled={running}
          onClick={() => {
            const v = prompt(lang === "fr" ? "Durée en minutes :" : "Length in minutes:", String(currentLen));
            const n = parseInt(v, 10);
            if (n >= 1 && n <= 180) setLen(n);
          }}
        >✏️</button>
      </div>

      <div className="progress-wrap">
        <div className={`progress-bar ${isBreak ? "break" : ""}`} style={{ width: pct + "%" }} />
        <div className="progress-ticks">
          {Array.from({length: 5}).map((_, i) => <span key={i} />)}
        </div>
        <div className="progress-label">{Math.round(pct)}%</div>
      </div>

      <div className="controls">
        {!running ? (
          <button className="btn primary big" onClick={start}>▶ {remaining < total ? t.resume : t.start}</button>
        ) : (
          <button className="btn primary big" onClick={pause}>⏸ {t.pause}</button>
        )}
        <button className="btn ghost" onClick={stop}>■ {t.stop}</button>
        <button className="btn ghost" onClick={skip}>⏭ {t.skip}</button>
        <button className="btn ghost timer-mini-btn" onClick={openMini} title={lang === "fr" ? "Mode mini (M)" : "Mini mode (M)"} style={{ marginLeft: "auto" }}>↘ {lang === "fr" ? "Mini" : "Mini"}</button>
        <button className="btn ghost" onClick={openHyper}>🔒 {t.hyperfocus}</button>
      </div>
    </div>
  );
}

/* ───────── Simple Tasks under timer ───────── */

function SimpleTasks({ t, lang, tasks, activeId, setActive, toggle, addTask, onNope, onDragStart, onDragEnd, draggingId }) {
  const [val, setVal] = React.useState("");
  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
        <div>
          <div className="card-title">📌 {t.tasksSimple}</div>
          <div className="card-sub" style={{ marginBottom: 0 }}>{tasks.filter(x => !x.done).length} à faire · {tasks.filter(x => x.done).length} ✓ · {lang === "fr" ? "glisse une tâche sur le timer ↑" : "drag a task onto the timer ↑"}</div>
        </div>
        <a href="#tasks" onClick={(e) => { e.preventDefault(); window.location.hash = "tasks"; }} style={{ fontSize: 12, color: "var(--ink-mute)", textDecoration: "underline" }}>{lang === "fr" ? "voir détails →" : "see details →"}</a>
      </div>
      <div className="task-list">
        {tasks.map(task => (
          <div
            key={task.id}
            className={`task ${task.done ? "done" : ""} ${activeId === task.id ? "active" : ""} ${draggingId === task.id ? "dragging" : ""}`}
            draggable={!task.done}
            onDragStart={(e) => { e.dataTransfer.setData("text/task-id", String(task.id)); onDragStart && onDragStart(task.id); }}
            onDragEnd={() => onDragEnd && onDragEnd()}
          >
            <button className="check" onClick={() => toggle(task.id)} aria-label="toggle">{task.done ? "✓" : ""}</button>
            <div className="task-body" onClick={() => setActive(task.id)} style={{ cursor: "pointer" }}>
              <div className="task-title">{task.title[lang]}</div>
              <div className="task-note">{task.note[lang]}</div>
            </div>
            <div className="task-meta">
              {(task.pomos || 0) > 0 && (
                <span className="pomos" title={`${task.pomos} pomodoros`}>
                  {Array.from({ length: Math.min(task.pomos, 5) }).map((_, i) => <span key={i} className="p" />)}
                  {task.pomos > 5 && <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", marginLeft: 2 }}>+{task.pomos - 5}</span>}
                </span>
              )}
              {task.subtasks.length > 0 && (
                <span className="task-pill">{task.subtasks.filter(s => s.done).length}/{task.subtasks.length}</span>
              )}
              <span className={`task-pill ${task.priority === "now" ? "now" : task.priority === "quick" ? "quick" : ""}`}>{task.estimate}m</span>
              {!task.done && <button className="nope" onClick={(e) => { e.stopPropagation(); onNope && onNope(task); }} title={lang === "fr" ? "j'ai pas envie" : "I don't feel like it"}>🙃</button>}
            </div>
          </div>
        ))}
      </div>
      <div className="add-task">
        <input
          type="text"
          placeholder={t.addTask}
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && val.trim()) { addTask(val.trim()); setVal(""); }}}
        />
        <button className="btn" onClick={() => { if (val.trim()) { addTask(val.trim()); setVal(""); }}}>+</button>
      </div>
    </div>
  );
}

/* ───────── Break tips panel (scrollable) ───────── */

function BreakTips({ t, lang }) {
  const cats = ["code", "ai", "money"];
  const [cat, setCat] = React.useState("code");
  const [idx, setIdx] = React.useState(0);
  const scrollRef = React.useRef(null);
  const tips = window.TIPS[cat];

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const items = el.querySelectorAll(".tip-card");
      const sl = el.scrollLeft;
      let best = 0;
      let bestDist = Infinity;
      items.forEach((c, i) => {
        const d = Math.abs(c.offsetLeft - el.scrollLeft - 22);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      setIdx(best);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [cat]);

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
    setIdx(0);
  }, [cat]);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const colorByCat = { code: "var(--coral)", ai: "var(--plum)", money: "var(--moss)" };

  return (
    <div className="card break-panel">
      <span className="sticker" style={{ top: -14, left: 24, background: "white" }}>5 min · {lang === "fr" ? "ton cerveau aime" : "brain candy"}</span>
      <div className="card-title">☕ {t.breakTips}</div>
      <div className="card-sub" style={{ marginBottom: 14 }}>{t.breakTipsSub}</div>

      <div className="tip-categories">
        {cats.map(c => (
          <button key={c} className={`tip-cat ${cat === c ? "on" : ""}`} onClick={() => setCat(c)}>
            {c === "code" && "</>"} {c === "ai" && "✨"} {c === "money" && "€"} {t.tipCategories[c]}
          </button>
        ))}
      </div>

      <div className="tip-scroll" ref={scrollRef}>
        {tips.map((tip, i) => (
          <div className="tip-card" key={i}>
            <div className="tip-num" style={{ color: colorByCat[cat] }}>TIP {String(i + 1).padStart(2, "0")} / {String(tips.length).padStart(2, "0")}</div>
            <div className="tip-title">{tip[lang].t}</div>
            <div className="tip-body">{tip[lang].b}</div>
            <span className="tip-tag" style={{ background: colorByCat[cat], color: "white", borderColor: "var(--ink)" }}>#{t.tipCategories[cat]}</span>
          </div>
        ))}
      </div>
      <div className="tip-dots">
        {tips.map((_, i) => <span key={i} className={idx === i ? "on" : ""} />)}
      </div>
    </div>
  );
}

/* ───────── Hyperfocus overlay ───────── */

function HyperOverlay({ t, lang, current, remaining, running, pause, start, close }) {
  const [mm, ss] = fmt(remaining);
  const quotes = lang === "fr" ? [
    "Le monde extérieur peut attendre 25 minutes.",
    "Une tâche. Un timer. Zéro onglet.",
    "Ta dopamine va arriver. Tiens bon.",
  ] : [
    "The outside world can wait 25 minutes.",
    "One task. One timer. Zero tabs.",
    "Dopamine is coming. Hang in there.",
  ];
  const [q] = React.useState(() => quotes[Math.floor(Math.random() * quotes.length)]);
  return (
    <div className="hyper-overlay">
      <div className="hyper-pretitle">● {t.hyperfocusOn}</div>
      <div className="hyper-task">{current ? current.title[lang] : (lang === "fr" ? "Cette tâche, là, maintenant." : "This one task, right now.")}</div>
      <div className="hyper-time">{mm}:{ss}</div>
      <div className="hyper-foot">
        {running ? (
          <button className="btn btn-hyper" onClick={pause}>⏸ {t.pause}</button>
        ) : (
          <button className="btn btn-hyper" onClick={start}>▶ {t.resume}</button>
        )}
        <button className="btn ghost" onClick={close}>← {lang === "fr" ? "sortir" : "exit"}</button>
      </div>
      <div className="hyper-quote">« {q} »</div>
    </div>
  );
}

/* ───────── Overlay d'aide raccourcis clavier ───────── */

function ShortcutsOverlay({ lang, onClose }) {
  const rows = lang === "fr" ? [
    ["Espace", "Démarrer / Pause"],
    ["Esc", "Fermer un overlay"],
    ["← / →", "Naviguer entre onglets"],
    ["M", "Basculer le mode Mini"],
    ["H", "Mode Hyperfocus"],
    ["?", "Afficher cette aide"],
  ] : [
    ["Space", "Start / Pause"],
    ["Esc", "Close overlay"],
    ["← / →", "Navigate tabs"],
    ["M", "Toggle Mini mode"],
    ["H", "Hyperfocus mode"],
    ["?", "Show this help"],
  ];
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal shortcuts-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-pretitle">⌨ {lang === "fr" ? "Raccourcis" : "Shortcuts"}</div>
        <div className="modal-title">{lang === "fr" ? "Plus vite, moins de clics." : "Faster, fewer clicks."}</div>
        <div className="shortcuts-list">
          {rows.map(([k, v]) => (
            <div className="shortcut-row" key={k}>
              <kbd>{k}</kbd>
              <span>{v}</span>
            </div>
          ))}
        </div>
        <button className="btn" style={{ width: "100%", justifyContent: "center", marginTop: 12 }} onClick={onClose}>
          {lang === "fr" ? "Fermer (Esc)" : "Close (Esc)"}
        </button>
      </div>
    </div>
  );
}

/* ───────── Mini timer — vue compacte type Picture-in-Picture ───────── */

function MiniTimer({ remaining, total, mode, current, running, lang, start, pause, skip, onRestore }) {
  const [mm, ss] = fmt(remaining);
  const pct = total ? ((total - remaining) / total) * 100 : 0;
  const isBreak = mode === "break";
  const ref = React.useRef(null);
  const [pos, setPos] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem("cerveau:v1:miniPos")) || null; } catch (e) { return null; }
  });

  React.useEffect(() => {
    if (pos) try { localStorage.setItem("cerveau:v1:miniPos", JSON.stringify(pos)); } catch (e) {}
  }, [pos]);

  const onPointerDown = (e) => {
    if (e.target.closest("button")) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const offX = e.clientX - rect.left;
    const offY = e.clientY - rect.top;
    el.setPointerCapture && el.setPointerCapture(e.pointerId);
    const onMove = (ev) => {
      const x = Math.max(8, Math.min(window.innerWidth - rect.width - 8, ev.clientX - offX));
      const y = Math.max(8, Math.min(window.innerHeight - rect.height - 8, ev.clientY - offY));
      setPos({ x, y });
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const style = pos ? { left: pos.x, top: pos.y, right: "auto", bottom: "auto" } : {};

  return (
    <div
      ref={ref}
      className={`mini-timer ${isBreak ? "mini-break" : ""} ${running ? "mini-on" : "mini-off"}`}
      style={style}
      onPointerDown={onPointerDown}
      role="dialog"
      aria-label={lang === "fr" ? "Mini-timer" : "Mini timer"}
    >
      <div className="mini-head">
        <span className="mini-mode-lab">{isBreak ? "🫧" : "🎯"} {isBreak ? (lang === "fr" ? "pause" : "break") : "focus"}</span>
        <button className="mini-x" onClick={onRestore} title={lang === "fr" ? "Restaurer (M)" : "Restore (M)"} aria-label="restore">↗</button>
      </div>
      <div className="mini-time" aria-live="polite">
        <span>{mm}</span><span className="mini-sep">:</span><span>{ss}</span>
      </div>
      {current && <div className="mini-task" title={current.title[lang]}>{current.title[lang]}</div>}
      <div className="mini-bar"><div className={`mini-fill ${isBreak ? "break" : ""}`} style={{ width: pct + "%" }} /></div>
      <div className="mini-ctrls">
        {!running ? (
          <button className="mini-btn primary" onClick={start} aria-label={lang === "fr" ? "Démarrer" : "Start"}>▶</button>
        ) : (
          <button className="mini-btn primary" onClick={pause} aria-label={lang === "fr" ? "Pause" : "Pause"}>⏸</button>
        )}
        <button className="mini-btn" onClick={skip} aria-label={lang === "fr" ? "Passer" : "Skip"}>⏭</button>
      </div>
      <div className="mini-drag-hint">{lang === "fr" ? "déplaçable" : "drag me"}</div>
    </div>
  );
}

/* ───────── Toast (notif fugitive bas-centre) ───────── */

function Toast({ message, onDismiss }) {
  React.useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDismiss, 2600);
    return () => clearTimeout(t);
  }, [message, onDismiss]);
  if (!message) return null;
  return (
    <div className="toast" role="status" aria-live="polite">
      <span className="toast-ic">{message.icon}</span>
      <span>{message.text}</span>
    </div>
  );
}

/* ───────── Confetti (canvas, célébration tâche/session) ───────── */

function Confetti({ trigger, reducedMotion }) {
  const canvasRef = React.useRef(null);
  React.useEffect(() => {
    if (!trigger || reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const W = window.innerWidth, H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.scale(dpr, dpr);
    const colors = ["#e87560", "#f5c46a", "#7a9b7e", "#a684c7", "#7ba8c4"];
    const pieces = [];
    const count = 70;
    for (let i = 0; i < count; i++) {
      pieces.push({
        x: W / 2 + (Math.random() - 0.5) * 240,
        y: H * 0.55,
        vx: (Math.random() - 0.5) * 14,
        vy: -Math.random() * 18 - 8,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.35,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 9 + 5,
      });
    }
    let raf;
    const startT = performance.now();
    const tick = (now) => {
      const elapsed = (now - startT) / 1000;
      ctx.clearRect(0, 0, W, H);
      pieces.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.55;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.55);
        ctx.restore();
      });
      if (elapsed < 1.9) raf = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, W, H);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); ctx.clearRect(0, 0, W, H); };
  }, [trigger, reducedMotion]);
  return <canvas ref={canvasRef} className="confetti-canvas" aria-hidden="true" />;
}

/* ───────── Dim overlay — anti-stim + OLED battery saver ───────── */

function DimOverlay({ remaining, lang, current, onWake }) {
  const [mm, ss] = fmt(remaining);
  return (
    <div className="dim-overlay" onClick={onWake}>
      <div className="dim-time">{mm}<span className="dim-sep">:</span>{ss}</div>
      {current && <div className="dim-task">{current.title[lang]}</div>}
      <div className="dim-hint">{lang === "fr" ? "Appuie pour revenir" : "Tap to wake"}</div>
    </div>
  );
}

/* ───────── Sidebar ───────── */

function Sidebar({ t, lang, route, setRoute, streak, sessions }) {
  const items = [
    { id: "dashboard", icon: "🏠", label: t.nav.dashboard },
    { id: "tasks", icon: "✅", label: t.nav.tasks },
    { id: "braindump", icon: "🧠", label: t.nav.braindump },
    { id: "routines", icon: "🌅", label: t.nav.routines },
    { id: "stats", icon: "📊", label: t.nav.stats },
  ];
  return (
    <aside className="sidebar">
      <div>
        <div className="brand">
          <div className="brand-mark">🧠</div>
          <div>
            <div>{t.appName}</div>
            <div className="brand-sub">{t.tagline}</div>
          </div>
        </div>
      </div>
      <div className="nav">
        {items.map(it => (
          <button key={it.id} className={`nav-item ${route === it.id ? "active" : ""}`} onClick={() => setRoute(it.id)}>
            <span className="ic">{it.icon}</span>
            <span>{it.label}</span>
          </button>
        ))}
      </div>
      <div className="side-card">
        <h4>{t.streak}</h4>
        <div className="streak-row">
          <span className="streak-num">12</span>
          <span className="streak-flame">🔥</span>
        </div>
        <div className="streak-label">{t.days} · {lang === "fr" ? "record 18" : "best 18"}</div>
      </div>
      <div className="side-card" style={{ background: "var(--coral)", color: "white", borderColor: "var(--ink)" }}>
        <h4 style={{ color: "rgba(255,255,255,0.85)" }}>{lang === "fr" ? "Aujourd'hui" : "Today"}</h4>
        <div className="streak-row">
          <span className="streak-num">{sessions * 25}</span>
          <span style={{ fontSize: 13, opacity: 0.85, marginLeft: 4 }}>{t.minToday}</span>
        </div>
        <div className="streak-label" style={{ color: "rgba(255,255,255,0.85)" }}>{sessions} {t.sessions}</div>
      </div>
      <div style={{ marginTop: "auto", fontSize: 10, color: "var(--ink-mute)", fontFamily: "var(--font-mono)" }}>
        v0.4.2 · made with ✺ adhd
      </div>
    </aside>
  );
}

/* ───────── App ───────── */

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const lang = t.lang;
  const L = window.I18N[lang];

  // route
  const [route, setRoute] = React.useState("dashboard");
  React.useEffect(() => {
    const h = window.location.hash.replace("#", "");
    if (h && ["dashboard", "tasks", "braindump", "routines", "stats"].includes(h)) setRoute(h);
    const onH = () => {
      const hh = window.location.hash.replace("#", "");
      if (hh) setRoute(hh);
    };
    window.addEventListener("hashchange", onH);
    return () => window.removeEventListener("hashchange", onH);
  }, []);

  // ── persisted state ──
  const [tasks, setTasks] = usePersistedState("tasks", () => window.INITIAL_TASKS);
  const [activeId, setActiveId] = usePersistedState("activeId", 1);
  const [dumps, setDumps] = usePersistedState("dumps", () => window.RECENT_DUMPS);
  const [morningSteps, setMorningSteps] = usePersistedState("morningSteps", () =>
    window.MORNING_ROUTINE.map((r, i) => ({ id: 1000 + i, label: r.fr, icon: r.icon, done: [true, true, false, true, false][i] || false }))
  );
  const [eveningSteps, setEveningSteps] = usePersistedState("eveningSteps", () =>
    window.EVENING_ROUTINE.map((r, i) => ({ id: 2000 + i, label: r.fr, icon: r.icon, done: false }))
  );
  const [mood, setMood] = usePersistedState("mood", 3);
  const [energy, setEnergy] = usePersistedState("energy", 4);
  const [meds, setMeds] = usePersistedState("medsList", () => [
    { id: 1, name: "Concerta", dose: "36mg", time: "08:30", taken: true },
  ]);
  const [sound, setSound] = usePersistedState("sound", "Café");
  const [sessions, setSessions] = usePersistedState("sessions", 3);
  const [streak] = usePersistedState("streak", 12);
  const [jokerWeek, setJokerWeek] = usePersistedState("jokerWeek", "");
  const [viewMode, setViewMode] = usePersistedState("viewMode", "classic"); // classic | nnl
  const [soundCue, setSoundCue] = usePersistedState("soundCue", "chime"); // chime | arcade | voice | none

  // ── ephemeral state ──
  const active = tasks.find(x => x.id === activeId && !x.done);
  const [draggingId, setDraggingId] = React.useState(null);
  const [nopeTask, setNopeTask] = React.useState(null);
  const [panic, setPanic] = React.useState(false);
  const [hyper, setHyper] = React.useState(false);
  const [mini, setMini] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const [confettiTrigger, setConfettiTrigger] = React.useState(0);
  const [timerPulse, setTimerPulse] = React.useState(false);
  const [showShortcuts, setShowShortcuts] = React.useState(false);

  // Detect prefers-reduced-motion (for confetti/animations)
  const [reducedMotion, setReducedMotion] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener ? mq.addEventListener("change", update) : mq.addListener(update);
    return () => { mq.removeEventListener ? mq.removeEventListener("change", update) : mq.removeListener(update); };
  }, []);

  const showToast = React.useCallback((icon, text) => setToast({ icon, text, id: Date.now() }), []);
  const celebrate = React.useCallback(() => {
    setConfettiTrigger(c => c + 1);
    if (window.buzz) window.buzz([60, 40, 60]);
  }, []);

  const toggleTask = (id) => setTasks(ts => ts.map(x => {
    if (x.id !== id) return x;
    const wasDone = x.done;
    const next = { ...x, done: !x.done };
    if (!wasDone) {
      // Tâche fraîchement cochée → célébration
      setTimeout(() => {
        celebrate();
        showToast("🎉", lang === "fr" ? "Tâche pliée. Tu déchires." : "Task done. You crushed it.");
      }, 0);
    }
    return next;
  }));
  const toggleSubtask = (tid, sid) => setTasks(ts => ts.map(x => x.id !== tid ? x : { ...x, subtasks: x.subtasks.map(s => s.id !== sid ? s : { ...s, done: !s.done }) }));
  const addTask = (title) => {
    const id = Date.now();
    setTasks(ts => [...ts, { id, title: { fr: title, en: title }, note: { fr: "fraîchement ajoutée", en: "fresh add" }, estimate: 15, done: false, priority: "today", energy: "medium", subtasks: [], pomos: 0, actualMin: 0 }]);
  };
  const addDump = (text) => setDumps(d => [{ fr: text, en: text, time: "just now" }, ...d]);

  // Handle "I don't feel like it" choice
  const handleNopeChoice = (choice) => {
    if (!nopeTask) return;
    if (choice === "delete") {
      setTasks(ts => ts.filter(x => x.id !== nopeTask.id));
    } else if (choice === "tomorrow") {
      setTasks(ts => ts.map(x => x.id !== nopeTask.id ? x : { ...x, note: { fr: "reporté à demain", en: "pushed to tomorrow" } }));
    } else if (choice === "split") {
      setTasks(ts => ts.map(x => x.id !== nopeTask.id ? x : { ...x, subtasks: [...x.subtasks, { id: Date.now(), title: { fr: "Étape 1 (micro)", en: "Step 1 (tiny)" }, done: false }, { id: Date.now() + 1, title: { fr: "Étape 2", en: "Step 2" }, done: false }] }));
      window.location.hash = "tasks";
    } else if (choice === "two") {
      // launch 2-minute mini Pomodoro on this task
      setActiveId(nopeTask.id);
      setMode("work");
      setRemaining(120);
      setRunning(true);
    }
  };

  // ── timer ──
  const pomoSec = t.pomoLength * 60;
  const breakSec = t.breakLength * 60;
  const [mode, setMode] = usePersistedState("timerMode", "work");
  const [remaining, setRemaining] = usePersistedState("timerRemaining", pomoSec);
  const [running, setRunning] = React.useState(false);

  // Resync if pomo length changes
  React.useEffect(() => {
    if (!running) {
      setRemaining(mode === "work" ? pomoSec : breakSec);
    }
  }, [t.pomoLength, t.breakLength]);

  React.useEffect(() => {
    if (!running) return;
    const i = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          // end of phase
          if (mode === "work") {
            setSessions(s => s + 1);
            // increment pomo count + actualMin for active task
            if (activeId) {
              setTasks(ts => ts.map(x => x.id !== activeId ? x : { ...x, pomos: (x.pomos || 0) + 1, actualMin: (x.actualMin || 0) + t.pomoLength }));
            }
            playCue("breakStart");
            if (window.buzz) window.buzz([180, 80, 180]);
            setTimerPulse(true);
            setTimeout(() => setTimerPulse(false), 1400);
            setTimeout(() => showToast("🔥", `+1 ${lang === "fr" ? "session" : "session"} · ${streak} ${L.days}`), 300);
            window.sendNotif && window.sendNotif(L.breakTime + " ✨", lang === "fr" ? "Lève-toi, bois de l'eau." : "Stand up, drink water.");
            setMode("break");
            return breakSec;
          } else {
            playCue(soundCue);
            if (window.buzz) window.buzz([120]);
            setTimerPulse(true);
            setTimeout(() => setTimerPulse(false), 1400);
            window.sendNotif && window.sendNotif(L.workSession + " 🎯", lang === "fr" ? "Retour focus." : "Back to focus.");
            setMode("work");
            setRunning(false);
            return pomoSec;
          }
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(i);
  }, [running, mode, pomoSec, breakSec, activeId, soundCue]);

  // ── Wake Lock: keep screen on while timer runs ──
  const wakeLockRef = React.useRef(null);
  React.useEffect(() => {
    if (!running || !('wakeLock' in navigator)) return;
    const acquire = async () => {
      try { wakeLockRef.current = await navigator.wakeLock.request('screen'); } catch(e) {}
    };
    const onVisible = () => { if (document.visibilityState === 'visible') acquire(); };
    acquire();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      if (wakeLockRef.current) { wakeLockRef.current.release().catch(() => {}); wakeLockRef.current = null; }
    };
  }, [running]);

  // ── Auto-dim: réduit la stimulation et économise la batterie OLED ──
  const [dimActive, setDimActive] = React.useState(false);
  const dimTimerRef = React.useRef(null);
  React.useEffect(() => {
    const shouldDim = running && mode === "work" && !hyper && !panic && !mini;
    if (!shouldDim) { setDimActive(false); clearTimeout(dimTimerRef.current); return; }
    const schedule = () => {
      clearTimeout(dimTimerRef.current);
      setDimActive(false);
      dimTimerRef.current = setTimeout(() => setDimActive(true), 60000);
    };
    schedule();
    window.addEventListener('touchstart', schedule, { passive: true });
    window.addEventListener('mousemove', schedule, { passive: true });
    window.addEventListener('click', schedule, { passive: true });
    return () => {
      clearTimeout(dimTimerRef.current);
      window.removeEventListener('touchstart', schedule);
      window.removeEventListener('mousemove', schedule);
      window.removeEventListener('click', schedule);
    };
  }, [running, mode, hyper, panic, mini]);

  const playCue = (name) => {
    if (soundCue === "none") return;
    const fn = window.SOUNDS && window.SOUNDS[name];
    if (fn) fn();
  };

  const total = mode === "work" ? pomoSec : breakSec;

  const startT = () => { setRunning(true); window.askNotif && window.askNotif(); window.warmAudio && window.warmAudio(); };
  const pauseT = () => setRunning(false);
  const stopT = () => { setRunning(false); setMode("work"); setRemaining(pomoSec); };
  const skipT = () => {
    if (mode === "work") { setMode("break"); setRemaining(breakSec); }
    else { setMode("work"); setRemaining(pomoSec); }
  };

  // ── Préchauffage AudioContext au 1er geste (évite le lag du 1er son) ──
  React.useEffect(() => {
    const warm = () => {
      window.warmAudio && window.warmAudio();
      document.removeEventListener("click", warm);
      document.removeEventListener("keydown", warm);
      document.removeEventListener("touchstart", warm);
    };
    document.addEventListener("click", warm, { once: true, passive: true });
    document.addEventListener("keydown", warm, { once: true });
    document.addEventListener("touchstart", warm, { once: true, passive: true });
    return () => {
      document.removeEventListener("click", warm);
      document.removeEventListener("keydown", warm);
      document.removeEventListener("touchstart", warm);
    };
  }, []);

  // ── Body class pour le mode focus profond (cache la sidebar via CSS) ──
  React.useEffect(() => {
    const cls = document.body.classList;
    if (hyper) cls.add("focus-deep"); else cls.remove("focus-deep");
    if (mini) cls.add("mini-active"); else cls.remove("mini-active");
    return () => { cls.remove("focus-deep"); cls.remove("mini-active"); };
  }, [hyper, mini]);

  // ── Titre d'onglet dynamique (visible même quand l'onglet est en arrière-plan) ──
  React.useEffect(() => {
    if (!running) {
      document.title = "Cerveau.exe — TDAH focus";
      return;
    }
    const [mm, ss] = fmt(remaining);
    const icon = mode === "break" ? "🫧" : "🎯";
    document.title = `${icon} ${mm}:${ss} — ${active ? active.title[lang] : (mode === "break" ? "pause" : "focus")}`;
  }, [running, remaining, mode, active, lang]);

  // ── Raccourcis clavier ──
  const ROUTES = ["dashboard", "tasks", "braindump", "routines", "stats"];
  React.useEffect(() => {
    const isTyping = (e) => {
      const tag = (e.target.tagName || "").toLowerCase();
      return tag === "input" || tag === "textarea" || tag === "select" || e.target.isContentEditable;
    };
    const onKey = (e) => {
      // ? ouvre l'aide même hors-champ
      if (e.key === "?" && !isTyping(e)) { e.preventDefault(); setShowShortcuts(s => !s); return; }
      if (e.key === "Escape") {
        if (showShortcuts) { setShowShortcuts(false); return; }
        if (hyper) { setHyper(false); return; }
        if (panic) { setPanic(false); return; }
        if (dimActive) { setDimActive(false); return; }
        if (nopeTask) { setNopeTask(null); return; }
        if (mini) { setMini(false); return; }
      }
      if (isTyping(e)) return;
      if (e.key === " ") {
        e.preventDefault();
        running ? pauseT() : startT();
      } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        if (route !== "dashboard" || hyper || panic) return;
        e.preventDefault();
        const idx = ROUTES.indexOf(route);
        const delta = e.key === "ArrowRight" ? 1 : -1;
        const nextRoute = ROUTES[(idx + delta + ROUTES.length) % ROUTES.length];
        window.location.hash = nextRoute;
        setRoute(nextRoute);
      } else if (e.key.toLowerCase() === "m") {
        setMini(m => !m);
      } else if (e.key.toLowerCase() === "h" && !hyper) {
        setHyper(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, hyper, panic, dimActive, nopeTask, mini, route, showShortcuts]);

  // Drop task on timer → set as active and start
  const handleDropTask = (id) => {
    setActiveId(id);
    if (!running && mode === "work") {
      setRemaining(pomoSec);
      setRunning(true);
    }
  };

  // Joker
  const currentWeek = window.weekKey();
  const jokerUsed = jokerWeek === currentWeek;
  const useJoker = () => setJokerWeek(currentWeek);

  // Heatmap data (deterministic for demo)
  const heatmapData = React.useMemo(() => window.genHeatmap(), []);

  // theme classes
  const themeCls = `app theme-${t.dark ? "dark" : "light"} stim-${t.stim}`;

  // greeting
  const greet = L.greeting[new Date().getDate() % L.greeting.length];
  const funFact = L.funFacts[new Date().getDate() % L.funFacts.length];

  return (
    <div className={themeCls}>
      <div className="lang-toggle">
        <button className={lang === "fr" ? "on" : ""} onClick={() => setTweak("lang", "fr")}>FR</button>
        <button className={lang === "en" ? "on" : ""} onClick={() => setTweak("lang", "en")}>EN</button>
      </div>

      <div className="shell">
        <Sidebar t={L} lang={lang} route={route} setRoute={(r) => { window.location.hash = r; setRoute(r); }} streak={streak} sessions={sessions} jokerUsed={jokerUsed} useJoker={useJoker} />

        <main className="main">
          {route === "dashboard" && (
            <>
              <header className="greet">
                <div>
                  <h1>{greet}.</h1>
                  <div className="greet-sub">« {funFact} »</div>
                </div>
                <div className="greet-meta header-actions">
                  <Chip variant="honey">🔥 {streak} {L.days}</Chip>
                  <Chip variant="coral">💊 {meds.length === 0 ? (lang === "fr" ? "—" : "—") : meds.every(m => m.taken) ? (lang === "fr" ? "Tous pris" : "All taken") : `${meds.filter(m => m.taken).length}/${meds.length}`}</Chip>
                  <Chip variant="sky">{sessions * t.pomoLength} {L.minToday}</Chip>
                  <button className="icon-action panic" onClick={() => setPanic(true)} title={lang === "fr" ? "Mode panique" : "Panic mode"}>🫧</button>
                </div>
              </header>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
                <div className="mode-toggle">
                  <button className={viewMode === "classic" ? "on" : ""} onClick={() => setViewMode("classic")}>{lang === "fr" ? "CLASSIQUE" : "CLASSIC"}</button>
                  <button className={viewMode === "nnl" ? "on" : ""} onClick={() => setViewMode("nnl")}>NOW · NEXT · LATER</button>
                </div>
                <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--ink-mute)" }}>
                  {lang === "fr" ? "AUTO-SAVE • " : "AUTO-SAVE • "}<span style={{ color: "var(--moss)" }}>●</span> sync
                </div>
              </div>

              {viewMode === "nnl" && (
                <NowNextLater tasks={tasks} lang={lang} activeId={activeId} setActive={setActiveId} toggle={toggleTask} />
              )}

              <AutoSuggest tasks={tasks} lang={lang} mood={mood} energy={energy} onPick={(id) => { setActiveId(id); }} />

              <div className="grid">
                <div>
                  {mode === "break" ? (
                    <>
                      <TimerCard t={L} lang={lang} current={active} mode={mode} remaining={remaining} total={total} running={running}
                        start={startT} pause={pauseT} stop={stopT} skip={skipT} openHyper={() => setHyper(true)} openMini={() => setMini(true)}
                        pomoLength={t.pomoLength} breakLength={t.breakLength}
                        setPomoLength={(v) => setTweak("pomoLength", v)} setBreakLength={(v) => setTweak("breakLength", v)}
                        onDropTask={handleDropTask} draggingId={draggingId} pulse={timerPulse} />
                      <div style={{ marginTop: 20 }}>
                        <BreakTips t={L} lang={lang} />
                      </div>
                      <SimpleTasks t={L} lang={lang} tasks={tasks} activeId={activeId} setActive={setActiveId} toggle={toggleTask} addTask={addTask}
                        onNope={setNopeTask} onDragStart={setDraggingId} onDragEnd={() => setDraggingId(null)} draggingId={draggingId} />
                    </>
                  ) : (
                    <>
                      <TimerCard t={L} lang={lang} current={active} mode={mode} remaining={remaining} total={total} running={running}
                        start={startT} pause={pauseT} stop={stopT} skip={skipT} openHyper={() => setHyper(true)} openMini={() => setMini(true)}
                        pomoLength={t.pomoLength} breakLength={t.breakLength}
                        setPomoLength={(v) => setTweak("pomoLength", v)} setBreakLength={(v) => setTweak("breakLength", v)}
                        onDropTask={handleDropTask} draggingId={draggingId} pulse={timerPulse} />
                      <SimpleTasks t={L} lang={lang} tasks={tasks} activeId={activeId} setActive={setActiveId} toggle={toggleTask} addTask={addTask}
                        onNope={setNopeTask} onDragStart={setDraggingId} onDragEnd={() => setDraggingId(null)} draggingId={draggingId} />
                      <div style={{ marginTop: 20 }}>
                        <BreakTips t={L} lang={lang} />
                      </div>
                    </>
                  )}
                </div>
                <div className="rail">
                  <MoodEnergy t={L} mood={mood} setMood={setMood} energy={energy} setEnergy={setEnergy} />
                  <JokerCard lang={lang} used={jokerUsed} useJoker={useJoker} week={currentWeek} />
                  <MedsCard t={L} lang={lang} meds={meds} setMeds={setMeds} />
                  <BodyDouble t={L} lang={lang} />
                  <Sounds t={L} current={sound} setCurrent={setSound} />
                  <QuickCapture t={L} onAdd={addDump} items={dumps} />
                  <StatsCard t={L} />
                </div>
              </div>
              <div className="foot-mini">¯\\_(ツ)_/¯ · {lang === "fr" ? "fait avec amour, café et dopamine" : "built with love, coffee & dopamine"} · localStorage ok</div>
            </>
          )}

          {route === "tasks" && <TasksDetailed t={L} lang={lang} tasks={tasks} toggle={toggleTask} toggleSubtask={toggleSubtask} />}
          {route === "braindump" && <BrainDumpView t={L} lang={lang} items={dumps} onAdd={addDump} />}
          {route === "routines" && <RoutinesView t={L} lang={lang}
            morningSteps={morningSteps} setMorningSteps={setMorningSteps}
            eveningSteps={eveningSteps} setEveningSteps={setEveningSteps} />}
          {route === "stats" && <StatsView t={L} lang={lang} heatmapData={heatmapData} />}
        </main>
      </div>

      {hyper && <HyperOverlay t={L} lang={lang} current={active} remaining={remaining} running={running} start={startT} pause={pauseT} close={() => setHyper(false)} />}
      {panic && <PanicOverlay lang={lang} onClose={() => setPanic(false)} />}
      {dimActive && <DimOverlay remaining={remaining} lang={lang} current={active} onWake={() => setDimActive(false)} />}
      {nopeTask && <NotFeelingItModal task={nopeTask} lang={lang} onChoose={handleNopeChoice} onClose={() => setNopeTask(null)} />}
      {running && mode === "work" && !hyper && !panic && !mini && <ParkingLotFloater lang={lang} onDrop={addDump} />}
      {mini && <MiniTimer remaining={remaining} total={total} mode={mode} current={active} running={running} lang={lang}
                          start={startT} pause={pauseT} skip={skipT} onRestore={() => setMini(false)} />}
      <Confetti trigger={confettiTrigger} reducedMotion={reducedMotion} />
      <Toast message={toast} onDismiss={() => setToast(null)} />
      {showShortcuts && <ShortcutsOverlay lang={lang} onClose={() => setShowShortcuts(false)} />}
      <button className="shortcut-hint-fab" onClick={() => setShowShortcuts(true)} title={lang === "fr" ? "Raccourcis (?)" : "Shortcuts (?)"} aria-label="shortcuts">?</button>

      <TweaksPanel title={L.tweaksTitle} defaultOpen={false}>
        <TweakSection label={lang === "fr" ? "Timer" : "Timer"} />
        <TweakSlider label={L.pomoLen} value={t.pomoLength} min={5} max={90} step={5} unit="min" onChange={(v) => setTweak("pomoLength", v)} />
        <TweakSlider label={L.breakLen} value={t.breakLength} min={3} max={20} step={1} unit="min" onChange={(v) => setTweak("breakLength", v)} />
        <TweakSelect label={lang === "fr" ? "Son de fin" : "End sound"} value={soundCue} options={["chime", "arcade", "voice", "none"]} onChange={(v) => { setSoundCue(v); if (v !== "none" && window.SOUNDS[v]) window.SOUNDS[v](); }} />
        <TweakSection label={lang === "fr" ? "Apparence" : "Appearance"} />
        <TweakToggle label={L.darkMode} value={t.dark} onChange={(v) => setTweak("dark", v)} />
        <TweakRadio label={L.stimLevel}
          value={t.stim === "low" ? L.stimLow : t.stim === "high" ? L.stimHigh : L.stimMid}
          options={[L.stimLow, L.stimMid, L.stimHigh]}
          onChange={(v) => setTweak("stim", v === L.stimLow ? "low" : v === L.stimHigh ? "high" : "mid")} />
        <TweakSection label={L.language} />
        <TweakRadio label="FR / EN" value={t.lang} options={["fr", "en"]} onChange={(v) => setTweak("lang", v)} />
        <TweakSection label="Reset" />
        <TweakButton label={lang === "fr" ? "Effacer toutes les données" : "Erase all data"} onClick={() => {
          if (confirm(lang === "fr" ? "Tout effacer et recharger ?" : "Erase all and reload?")) {
            Object.keys(localStorage).filter(k => k.startsWith("cerveau:")).forEach(k => localStorage.removeItem(k));
            location.reload();
          }
        }} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
