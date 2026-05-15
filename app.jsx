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

function TimerCard({ t, lang, current, mode, remaining, total, running, start, pause, stop, skip, openHyper, pomoLength, breakLength, setPomoLength, setBreakLength, onDropTask, draggingId }) {
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
      className={`card timer-card ${dropOver ? "drop-target" : ""}`}
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
        <button className="btn ghost" onClick={openHyper} style={{ marginLeft: "auto" }}>🔒 {t.hyperfocus}</button>
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

  const toggleTask = (id) => setTasks(ts => ts.map(x => x.id === id ? { ...x, done: !x.done } : x));
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
            window.sendNotif && window.sendNotif(L.breakTime + " ✨", lang === "fr" ? "Lève-toi, bois de l'eau." : "Stand up, drink water.");
            setMode("break");
            return breakSec;
          } else {
            playCue(soundCue);
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

  const playCue = (name) => {
    if (soundCue === "none") return;
    const fn = window.SOUNDS && window.SOUNDS[name];
    if (fn) fn();
  };

  const total = mode === "work" ? pomoSec : breakSec;

  const startT = () => { setRunning(true); window.askNotif && window.askNotif(); };
  const pauseT = () => setRunning(false);
  const stopT = () => { setRunning(false); setMode("work"); setRemaining(pomoSec); };
  const skipT = () => {
    if (mode === "work") { setMode("break"); setRemaining(breakSec); }
    else { setMode("work"); setRemaining(pomoSec); }
  };

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
                        start={startT} pause={pauseT} stop={stopT} skip={skipT} openHyper={() => setHyper(true)}
                        pomoLength={t.pomoLength} breakLength={t.breakLength}
                        setPomoLength={(v) => setTweak("pomoLength", v)} setBreakLength={(v) => setTweak("breakLength", v)}
                        onDropTask={handleDropTask} draggingId={draggingId} />
                      <div style={{ marginTop: 20 }}>
                        <BreakTips t={L} lang={lang} />
                      </div>
                      <SimpleTasks t={L} lang={lang} tasks={tasks} activeId={activeId} setActive={setActiveId} toggle={toggleTask} addTask={addTask}
                        onNope={setNopeTask} onDragStart={setDraggingId} onDragEnd={() => setDraggingId(null)} draggingId={draggingId} />
                    </>
                  ) : (
                    <>
                      <TimerCard t={L} lang={lang} current={active} mode={mode} remaining={remaining} total={total} running={running}
                        start={startT} pause={pauseT} stop={stopT} skip={skipT} openHyper={() => setHyper(true)}
                        pomoLength={t.pomoLength} breakLength={t.breakLength}
                        setPomoLength={(v) => setTweak("pomoLength", v)} setBreakLength={(v) => setTweak("breakLength", v)}
                        onDropTask={handleDropTask} draggingId={draggingId} />
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
      {nopeTask && <NotFeelingItModal task={nopeTask} lang={lang} onChoose={handleNopeChoice} onClose={() => setNopeTask(null)} />}
      {running && mode === "work" && !hyper && !panic && <ParkingLotFloater lang={lang} onDrop={addDump} />}

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
