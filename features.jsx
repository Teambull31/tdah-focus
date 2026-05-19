// New feature components: PanicOverlay, ParkingLot, IDontFeelLikeIt, AutoSuggest,
// NowNextLater, AnnualHeatmap, JokerCard, Drag-drop helpers

/* ───────── Panic / sensory overload overlay ───────── */

function PanicOverlay({ lang, onClose }) {
  const [phase, setPhase] = React.useState("in"); // in -> hold -> out
  const [count, setCount] = React.useState(3);
  const [cycle, setCycle] = React.useState(1);
  const noiseStopRef = React.useRef(null);

  React.useEffect(() => {
    if (window.SOUNDS && window.SOUNDS.panic) {
      noiseStopRef.current = window.SOUNDS.panic();
    }
    return () => { if (noiseStopRef.current) noiseStopRef.current(); };
  }, []);

  React.useEffect(() => {
    const dur = phase === "hold" ? 2 : 4;
    if (count === 0) {
      const next = phase === "in" ? "hold" : phase === "hold" ? "out" : "in";
      setPhase(next);
      setCount(next === "hold" ? 2 : 4);
      if (phase === "out") setCycle(c => c + 1);
      return;
    }
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, phase]);

  const label = phase === "in" ? (lang === "fr" ? "Inspire" : "Inhale") : phase === "hold" ? (lang === "fr" ? "Retiens" : "Hold") : (lang === "fr" ? "Expire" : "Exhale");
  const scale = phase === "in" ? 1.6 : phase === "hold" ? 1.6 : 0.7;

  return (
    <div className="panic-overlay">
      <div className="panic-pretitle">● {lang === "fr" ? "tout va bien. on respire." : "all is well. just breathe."}</div>
      <div className="breath-wrap">
        <div className="breath-orb" style={{ transform: `scale(${scale})` }} />
        <div className="breath-label">{label}</div>
      </div>
      <div className="panic-count">{lang === "fr" ? "Cycle" : "Cycle"} {cycle} / 4</div>
      <div className="panic-msg">
        {lang === "fr"
          ? "Tu n'as rien à faire maintenant. Le timer attend. Les tâches attendent. Toi d'abord."
          : "You have nothing to do right now. The timer waits. The tasks wait. You first."}
      </div>
      <button className="btn btn-hyper" onClick={onClose}>← {lang === "fr" ? "Je suis prêt·e à revenir" : "I'm ready to come back"}</button>
    </div>
  );
}

/* ───────── Parking lot floater (during focus) ───────── */

function ParkingLotFloater({ lang, onDrop }) {
  const [open, setOpen] = React.useState(false);
  const [val, setVal] = React.useState("");
  const [flash, setFlash] = React.useState(false);
  const submit = () => {
    if (!val.trim()) return;
    onDrop(val.trim());
    setVal("");
    setFlash(true);
    setTimeout(() => setFlash(false), 900);
    setTimeout(() => setOpen(false), 400);
  };
  return (
    <div className={`parking ${open ? "open" : ""} ${flash ? "flash" : ""}`}>
      {open ? (
        <div className="parking-panel">
          <div className="parking-head">
            <span>📌 {lang === "fr" ? "Note rapide" : "Quick note"}</span>
            <button onClick={() => setOpen(false)} className="parking-x">✕</button>
          </div>
          <div className="parking-sub">{lang === "fr" ? "Jette la pensée. Reviens au focus." : "Drop the thought. Back to focus."}</div>
          <textarea
            autoFocus
            value={val}
            onChange={e => setVal(e.target.value)}
            onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit(); }}
            placeholder={lang === "fr" ? "« il faut que je... »" : "« I need to... »"}
          />
          <button className="btn primary" onClick={submit} style={{ width: "100%", justifyContent: "center" }}>
            ↓ {lang === "fr" ? "Capturer & revenir" : "Capture & return"}
          </button>
        </div>
      ) : (
        <button className="parking-fab" onClick={() => setOpen(true)} title="Parking lot">
          <span>📌</span>
          <span className="parking-fab-label">{lang === "fr" ? "Distraction ?" : "Distracted ?"}</span>
        </button>
      )}
    </div>
  );
}

/* ───────── "I don't feel like it" modal ───────── */

function NotFeelingItModal({ task, lang, onChoose, onClose }) {
  if (!task) return null;
  const t = task;
  const modalRef = React.useRef(null);

  // Focus trap + autofocus + Esc handler
  React.useEffect(() => {
    const root = modalRef.current;
    if (!root) return;
    const focusables = root.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])');
    const first = focusables[0], last = focusables[focusables.length - 1];
    const onKey = (e) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab") return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last && last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first && first.focus(); }
    };
    root.addEventListener("keydown", onKey);
    first && first.focus();
    return () => root.removeEventListener("keydown", onKey);
  }, [onClose]);

  const opts = [
    { id: "two", icon: "⏱", label: lang === "fr" ? "Juste 2 minutes" : "Just 2 minutes", sub: lang === "fr" ? "Tu fais 2 min, tu peux arrêter après. Promis." : "Do 2 min, then stop. Promise." },
    { id: "split", icon: "🔪", label: lang === "fr" ? "Découper en plus petit" : "Break it smaller", sub: lang === "fr" ? "Trop gros pour ton cerveau là. On émince." : "Too big right now. Slice it up." },
    { id: "tomorrow", icon: "📅", label: lang === "fr" ? "Reporter à demain" : "Push to tomorrow", sub: lang === "fr" ? "Pas de drame. Demain est un autre cerveau." : "No drama. Tomorrow is another brain." },
    { id: "delete", icon: "🗑", label: lang === "fr" ? "Supprimer sans culpabilité" : "Delete, no guilt", sub: lang === "fr" ? "Si c'était vraiment important, ça reviendrait." : "If it really mattered, it'd come back." },
  ];
  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal" ref={modalRef} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="nope-title">
        <div className="modal-pretitle">{lang === "fr" ? "Tâche évitée" : "Avoided task"}</div>
        <div className="modal-title" id="nope-title">« {t.title[lang]} »</div>
        <div className="modal-sub">{lang === "fr" ? "Pas de jugement. Choisis ta sortie :" : "No judgement. Pick your exit:"}</div>
        <div className="modal-opts">
          {opts.map(o => (
            <button key={o.id} className="modal-opt" onClick={() => { onChoose(o.id); onClose(); }}>
              <span className="modal-opt-ic">{o.icon}</span>
              <div>
                <div className="modal-opt-lab">{o.label}</div>
                <div className="modal-opt-sub">{o.sub}</div>
              </div>
              <span style={{ marginLeft: "auto", fontSize: 18 }}>→</span>
            </button>
          ))}
        </div>
        <button className="btn ghost" onClick={onClose} style={{ marginTop: 10, color: "var(--ink-mute)", borderColor: "var(--ink-mute)" }}>
          {lang === "fr" ? "Annuler, je vais essayer" : "Cancel, I'll try"}
        </button>
      </div>
    </div>
  );
}

/* ───────── Auto-suggest banner ───────── */

function AutoSuggest({ tasks, lang, mood, energy, onPick }) {
  const hour = new Date().getHours();
  const isMorning = hour >= 6 && hour < 12;
  const isAfternoon = hour >= 12 && hour < 18;

  const candidate = React.useMemo(() => {
    const open = tasks.filter(x => !x.done);
    if (!open.length) return null;
    // morning + high energy → big "now" task
    if (isMorning && energy >= 3) {
      return open.find(x => x.priority === "now") || open[0];
    }
    // low energy → quick tasks
    if (energy <= 2) {
      return open.find(x => x.priority === "quick") || open.find(x => x.estimate <= 15) || open[0];
    }
    // afternoon → medium
    if (isAfternoon) {
      return open.find(x => x.energy === "medium" || x.estimate <= 30) || open[0];
    }
    return open[0];
  }, [tasks, mood, energy, hour]);

  if (!candidate) return null;
  const reason = isMorning && energy >= 3
    ? (lang === "fr" ? "matin + énergie haute = on attaque le gros" : "morning + high energy = tackle the big one")
    : energy <= 2
      ? (lang === "fr" ? "énergie basse → on prend un quick win" : "low energy → grab a quick win")
      : (lang === "fr" ? "calibré sur ton humeur + énergie" : "tuned to your mood + energy");

  return (
    <div className="suggest">
      <div className="suggest-mark">✨</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="suggest-pre">{lang === "fr" ? "L'IA TDAH suggère" : "ADHD AI suggests"}</div>
        <div className="suggest-title">{candidate.title[lang]}</div>
        <div className="suggest-sub">{reason} · {candidate.estimate}min</div>
      </div>
      <button className="btn primary" onClick={() => onPick(candidate.id)}>{lang === "fr" ? "On y va" : "Let's go"} →</button>
    </div>
  );
}

/* ───────── Now / Next / Later layout ───────── */

function NowNextLater({ tasks, lang, activeId, setActive, toggle, lang_t }) {
  const open = tasks.filter(t => !t.done);
  const now = open.filter(t => t.id === activeId).concat(open.filter(t => t.id !== activeId && t.priority === "now")).slice(0, 1);
  const usedIds = new Set(now.map(t => t.id));
  const next = open.filter(t => !usedIds.has(t.id)).slice(0, 3);
  next.forEach(t => usedIds.add(t.id));
  const later = open.filter(t => !usedIds.has(t.id));

  const Col = ({ title, sub, items, accent, dim }) => (
    <div className={`nnl-col ${dim ? "dim" : ""}`}>
      <div className="nnl-head" style={{ background: accent }}>{title}</div>
      <div className="nnl-sub">{sub}</div>
      {items.length === 0 ? (
        <div className="nnl-empty">{lang === "fr" ? "Rien ici. ✨" : "Empty. ✨"}</div>
      ) : (
        items.map(t => (
          <div key={t.id} className={`nnl-card ${activeId === t.id ? "active" : ""}`} onClick={() => setActive(t.id)}>
            <button className="check" onClick={(e) => { e.stopPropagation(); toggle(t.id); }}>{t.done ? "✓" : ""}</button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="nnl-title">{t.title[lang]}</div>
              <div className="nnl-note">{t.note[lang]}</div>
            </div>
            <span className="task-pill">{t.estimate}m</span>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="nnl">
      <Col title={lang === "fr" ? "MAINTENANT" : "NOW"} sub={lang === "fr" ? "1 chose. Une seule." : "1 thing. Just one."} items={now} accent="var(--coral)" />
      <Col title={lang === "fr" ? "ENSUITE" : "NEXT"} sub={lang === "fr" ? "Max 3. Après on déborde." : "Max 3. Else overwhelm."} items={next} accent="var(--honey)" />
      <Col title={lang === "fr" ? "PLUS TARD" : "LATER"} sub={lang === "fr" ? "Ça existe, c'est noté. Respire." : "It exists, noted. Breathe."} items={later} accent="var(--sky)" dim />
    </div>
  );
}

/* ───────── Annual heatmap ───────── */

function AnnualHeatmap({ data, lang }) {
  const heatmapRef = React.useRef(null);

  React.useEffect(() => {
    const el = heatmapRef.current;
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

  // 53 weeks x 7 days grid
  const weeks = [];
  // pad start so first day of week is monday
  const first = new Date(data[0].date);
  const firstDow = (first.getDay() + 6) % 7; // mon=0
  const padded = Array(firstDow).fill(null).concat(data);
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }
  const total = data.reduce((a, b) => a + b.min, 0);
  const activeDays = data.filter(d => d.level > 0).length;
  const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  return (
    <div className="card">
      <div className="card-title">🗓 {lang === "fr" ? "365 derniers jours" : "Last 365 days"}</div>
      <div className="card-sub">{Math.round(total / 60)}h focus · {activeDays} {lang === "fr" ? "jours actifs" : "active days"}</div>
      <div className="heatmap-wrap" ref={heatmapRef}>
        <div className="heatmap">
          {weeks.map((w, wi) => (
            <div key={wi} className="hm-week">
              {Array.from({length: 7}).map((_, di) => {
                const d = w[di];
                if (!d) return <div key={di} className="hm-cell empty" />;
                return <div key={di} className={`hm-cell l${d.level}`} title={`${d.date} · ${d.min} min`} />;
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="hm-legend">
        <span style={{ color: "var(--ink-mute)", fontSize: 11, fontFamily: "var(--font-mono)" }}>{lang === "fr" ? "moins" : "less"}</span>
        <div className="hm-cell l0" />
        <div className="hm-cell l1" />
        <div className="hm-cell l2" />
        <div className="hm-cell l3" />
        <div className="hm-cell l4" />
        <span style={{ color: "var(--ink-mute)", fontSize: 11, fontFamily: "var(--font-mono)" }}>{lang === "fr" ? "plus" : "more"}</span>
      </div>
    </div>
  );
}

/* ───────── Joker card ───────── */

function JokerCard({ lang, used, useJoker, week }) {
  return (
    <div className="card" style={{ background: used ? "var(--cream-2)" : "var(--honey)", borderColor: "var(--ink)" }}>
      <div className="card-title">🎫 {lang === "fr" ? "Joker streak" : "Streak joker"}</div>
      <div className="card-sub" style={{ marginBottom: 12 }}>
        {used
          ? (lang === "fr" ? "Utilisé cette semaine. Reset lundi." : "Used this week. Resets Monday.")
          : (lang === "fr" ? "1 jour raté offert / semaine. Pas de honte." : "1 missed day free / week. No shame.")}
      </div>
      <button className="btn" style={{ width: "100%", justifyContent: "center", opacity: used ? 0.5 : 1 }} disabled={used} onClick={useJoker}>
        {used ? "✓ " + (lang === "fr" ? "Joker utilisé" : "Joker used") : (lang === "fr" ? "Sauver ma série" : "Save my streak")}
      </button>
    </div>
  );
}

Object.assign(window, {
  PanicOverlay, ParkingLotFloater, NotFeelingItModal,
  AutoSuggest, NowNextLater, AnnualHeatmap, JokerCard,
});
