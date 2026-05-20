// Shared small components + view bodies

function Chip({ children, variant }) {
  return <span className={`chip ${variant || ""}`}>{children}</span>;
}

function MoodEnergy({ t, mood, setMood, energy, setEnergy }) {
  const moods = ["😵‍💫", "😴", "🙂", "🤩", "🔥"];
  return (
    <div className="card">
      <div className="card-title">{t.mood} <span style={{fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--ink-mute)"}}>· {t.energy}</span></div>
      <div className="card-sub">Check-in 30s</div>
      <div className="mood-row">
        {moods.map((m, i) => (
          <button key={i} className={`mood-btn ${mood === i ? "selected" : ""}`} onClick={() => { setMood(i); window.buzz && window.buzz(15); }}>{m}</button>
        ))}
      </div>
      <div style={{ height: 14 }} />
      <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--ink-mute)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>{t.energy}</div>
      <div className="energy-bar" role="radiogroup" aria-label={t.energy}>
        {[0,1,2,3,4].map(i => (
          <span key={i} role="radio" aria-checked={i < energy} tabIndex={0} className={i < energy ? "on" : ""}
                onClick={() => { setEnergy(i+1); window.buzz && window.buzz(15); }}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setEnergy(i+1); window.buzz && window.buzz(15); }}} />
        ))}
      </div>
    </div>
  );
}

function MedsCard({ t, lang, meds, setMeds }) {
  const [editing, setEditing] = React.useState(false);

  const toggleTaken = (id) => setMeds(arr => arr.map(m => m.id === id ? { ...m, taken: !m.taken } : m));
  const addMed = () => {
    setMeds(arr => [...arr, { id: Date.now(), name: lang === "fr" ? "Nouveau médoc" : "New med", dose: "", time: "12:00", taken: false }]);
    setEditing(true);
  };
  const removeMed = (id) => setMeds(arr => arr.filter(m => m.id !== id));
  const updateMed = (id, patch) => setMeds(arr => arr.map(m => m.id === id ? { ...m, ...patch } : m));

  const allTaken = meds.length > 0 && meds.every(m => m.taken);
  const takenCount = meds.filter(m => m.taken).length;

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="card-title">💊 {lang === "fr" ? "Médicaments" : "Medications"}</div>
          <div className="card-sub" style={{ marginBottom: 0 }}>
            {meds.length === 0
              ? (lang === "fr" ? "Aucun médoc · clique + pour ajouter" : "None · tap + to add")
              : allTaken
                ? (lang === "fr" ? `Tous pris ✓` : "All taken ✓")
                : `${takenCount}/${meds.length} ${lang === "fr" ? "pris" : "taken"}`}
          </div>
        </div>
        <button className="ico-btn" onClick={() => setEditing(e => !e)} title={lang === "fr" ? "éditer" : "edit"} style={{ marginTop: -2 }}>
          {editing ? "✓" : "✏️"}
        </button>
      </div>

      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        {meds.map(m => (
          <div key={m.id} className={`med-row ${m.taken ? "taken" : ""}`}>
            {editing ? (
              <>
                <input
                  className="med-input"
                  value={m.name}
                  onChange={e => updateMed(m.id, { name: e.target.value })}
                  placeholder={lang === "fr" ? "Nom" : "Name"}
                  style={{ flex: 1, fontWeight: 600 }}
                />
                <input
                  className="med-input"
                  value={m.dose}
                  onChange={e => updateMed(m.id, { dose: e.target.value })}
                  placeholder="36mg"
                  style={{ width: 56 }}
                />
                <input
                  type="time"
                  className="med-input"
                  value={m.time}
                  onChange={e => updateMed(m.id, { time: e.target.value })}
                  style={{ width: 78 }}
                />
                <button className="ico-btn" onClick={() => removeMed(m.id)} title="supprimer">🗑</button>
              </>
            ) : (
              <>
                <button className={`med-check ${m.taken ? "on" : ""}`} onClick={() => toggleTaken(m.id)} aria-label="toggle">
                  {m.taken ? "✓" : ""}
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="med-name">{m.name}</div>
                  <div className="med-sub">{[m.dose, m.time].filter(Boolean).join(" · ")}</div>
                </div>
                <span className="med-time-pill">{m.time}</span>
              </>
            )}
          </div>
        ))}
        {editing && (
          <button className="btn" style={{ width: "100%", justifyContent: "center", background: "var(--cream-2)", marginTop: 4 }} onClick={addMed}>
            + {lang === "fr" ? "Ajouter un médicament" : "Add a medication"}
          </button>
        )}
      </div>
    </div>
  );
}

function BodyDouble({ t, lang }) {
  return (
    <div className="card">
      <div className="card-title">👥 {t.bodyDouble}</div>
      <div className="card-sub">{window.BODY_DOUBLERS.length} {t.bodyDoubleSub}</div>
      <div className="bd-list">
        {window.BODY_DOUBLERS.slice(0, 4).map((p, i) => (
          <div className="bd-row" key={i}>
            <div className="bd-avatar" style={{ background: p.color }}>{p.emoji}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="bd-name">{p.name}</div>
              <div className="bd-task" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.task}</div>
            </div>
            <div className="bd-pulse" />
          </div>
        ))}
      </div>
      <button className="btn primary" style={{ width: "100%", justifyContent: "center", marginTop: 12 }}>{t.join} →</button>
    </div>
  );
}

function Sounds({ t, current, setCurrent }) {
  return (
    <div className="card">
      <div className="card-title">🔊 {t.sounds}</div>
      <div className="card-sub">{current ? `▶ ${current}` : "—"}</div>
      <div className="sound-row">
        {t.soundOptions.map(s => (
          <button key={s} className={`sound-pill ${current === s ? "on" : ""}`} onClick={() => setCurrent(current === s ? null : s)}>{s}</button>
        ))}
      </div>
    </div>
  );
}

function QuickCapture({ t, onAdd, items }) {
  const [val, setVal] = React.useState("");
  const submit = () => {
    if (!val.trim()) return;
    onAdd(val.trim());
    setVal("");
  };
  return (
    <div className="card">
      <div className="card-title">🧠 {t.quickCapture}</div>
      <div className="card-sub">{t.quickCaptureSub}</div>
      <textarea
        className="dump-area"
        placeholder={t.quickPlaceholder}
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit(); }}
      />
      <button className="btn honey" style={{ marginTop: 10 }} onClick={submit}>↓ {t.capture}</button>
      <div className="dump-list">
        {items.slice(0, 4).map((d, i) => (
          <div key={i} className="dump-item">
            <span>•</span>
            <span style={{ flex: 1 }}>{typeof d === "string" ? d : d.text}</span>
            <span className="time">{d.time || "just now"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsCard({ t }) {
  const max = Math.max(...window.WEEK_DATA.map(d => d.min));
  const todayIdx = window.WEEK_DATA.length - 1;
  const total = window.WEEK_DATA.reduce((a, b) => a + b.min, 0);
  return (
    <div className="card">
      <div className="card-title">📊 Cette semaine</div>
      <div className="card-sub">{total} min · {window.WEEK_DATA.filter(d => d.min > 0).length}/7 jours actifs</div>
      <div className="spark">
        {window.WEEK_DATA.map((d, i) => (
          <div key={i} className={`spark-bar ${i === todayIdx ? "today" : ""}`}>
            <div className="b" style={{ height: `${(d.min / max) * 100}%` }} title={`${d.min} min`} />
            <div className="lab">{d.day}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────── Tasks detailed view ─────────────────── */

/* ── Ligne de sous-tâche éditable ── */
function SubtaskRow({ s, lang, onToggle, onDelete }) {
  return (
    <div className={`subtask ${s.done ? "done" : ""}`} style={{ justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
        <button className="mini-check" onClick={onToggle}>{s.done ? "✓" : ""}</button>
        <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title[lang]}</span>
      </div>
      <button onClick={onDelete} style={{ fontSize: 14, color: "var(--ink-mute)", padding: "0 4px", flexShrink: 0 }} title="Supprimer">×</button>
    </div>
  );
}

/* ── Carte tâche éditable ── */
function TaskDetailCard({ task, lang, toggle, deleteTask, updateTask, toggleSubtask, addSubtask, deleteSubtask }) {
  const [editingTitle, setEditingTitle] = React.useState(false);
  const [editingNote, setEditingNote]   = React.useState(false);
  const [titleVal, setTitleVal]         = React.useState(task.title[lang]);
  const [noteVal, setNoteVal]           = React.useState(task.note[lang] || "");
  const [addingSub, setAddingSub]       = React.useState(false);
  const [subVal, setSubVal]             = React.useState("");
  const titleRef = React.useRef(null);
  const noteRef  = React.useRef(null);

  React.useEffect(() => { if (editingTitle && titleRef.current) titleRef.current.select(); }, [editingTitle]);
  React.useEffect(() => { if (editingNote  && noteRef.current)  noteRef.current.focus();  }, [editingNote]);

  const saveTitle = () => {
    if (titleVal.trim()) updateTask({ title: { fr: titleVal.trim(), en: titleVal.trim() } });
    else setTitleVal(task.title[lang]);
    setEditingTitle(false);
  };
  const saveNote = () => {
    updateTask({ note: { fr: noteVal, en: noteVal } });
    setEditingNote(false);
  };
  const commitSub = () => {
    if (subVal.trim()) addSubtask(subVal.trim());
    setSubVal(""); setAddingSub(false);
  };

  const PRIORITIES = ["now", "today", "later"];
  const PRIORITY_LABELS = { now: "🔴 Maintenant", today: "🟡 Aujourd'hui", later: "⚪ Plus tard" };

  const done  = task.subtasks.filter(s => s.done).length;
  const total = task.subtasks.length;
  const pct   = total ? (done / total * 100) : (task.done ? 100 : 0);

  return (
    <div className={`task-detailed ${task.done ? "done" : ""}`} style={{ opacity: task.done ? 0.6 : 1 }}>
      {/* En-tête : checkbox + titre + bouton supprimer */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
        <button className="check" onClick={toggle} style={{ flexShrink: 0, marginTop: 2 }}>{task.done ? "✓" : ""}</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          {editingTitle ? (
            <input
              ref={titleRef}
              className="task-detailed-title"
              style={{ width: "100%", background: "transparent", borderBottom: "2px solid var(--coral)", paddingBottom: 2, textDecoration: "none" }}
              value={titleVal}
              onChange={e => setTitleVal(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={e => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") { setTitleVal(task.title[lang]); setEditingTitle(false); } }}
            />
          ) : (
            <div
              className="task-detailed-title"
              style={{ cursor: "text", textDecoration: task.done ? "line-through" : "none" }}
              onClick={() => { if (!task.done) { setTitleVal(task.title[lang]); setEditingTitle(true); } }}
              title={lang === "fr" ? "Cliquer pour modifier" : "Click to edit"}
            >{task.title[lang]}</div>
          )}
        </div>
        <button onClick={deleteTask} title={lang === "fr" ? "Supprimer" : "Delete"}
          style={{ flexShrink: 0, fontSize: 16, color: "var(--ink-mute)", padding: "0 4px", lineHeight: 1 }}>×</button>
      </div>

      {/* Note / description */}
      <div style={{ paddingLeft: 36, marginBottom: 10 }}>
        {editingNote ? (
          <textarea
            ref={noteRef}
            style={{ width: "100%", background: "var(--cream-2)", border: "1.5px solid var(--ink)", borderRadius: 8, padding: "6px 8px", fontSize: 12, resize: "vertical", minHeight: 56 }}
            value={noteVal}
            onChange={e => setNoteVal(e.target.value)}
            onBlur={saveNote}
            onKeyDown={e => { if (e.key === "Escape") { setNoteVal(task.note[lang] || ""); setEditingNote(false); } }}
            placeholder={lang === "fr" ? "Note…" : "Note…"}
          />
        ) : (
          <div
            onClick={() => { setNoteVal(task.note[lang] || ""); setEditingNote(true); }}
            style={{ fontSize: 12, color: task.note[lang] ? "var(--ink-mute)" : "var(--ink-mute)", fontStyle: "italic", cursor: "text", minHeight: 18 }}
          >{task.note[lang] || (lang === "fr" ? "+ ajouter une note…" : "+ add a note…")}</div>
        )}
      </div>

      {/* Pills : priorité + stats */}
      <div style={{ paddingLeft: 36, display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {/* Sélecteur de priorité */}
        <select
          value={task.priority}
          onChange={e => updateTask({ priority: e.target.value })}
          style={{ fontSize: 11, fontFamily: "var(--font-mono)", padding: "3px 7px", borderRadius: 999, border: "1.5px solid var(--ink)", background: task.priority === "now" ? "var(--coral)" : task.priority === "quick" ? "var(--moss)" : "var(--paper)", color: (task.priority === "now" || task.priority === "quick") ? "white" : "var(--ink)", cursor: "pointer", fontWeight: 700 }}
        >
          {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
        </select>
        {(task.actualMin || 0) > 0 && (
          <span className="task-pill" style={{ background: "var(--plum)", color: "white", borderColor: "var(--plum)" }}>
            {task.actualMin}min {lang === "fr" ? "réel" : "real"}
          </span>
        )}
        {(task.pomos || 0) > 0 && (
          <span className="task-pill" style={{ background: "var(--coral)", color: "white", borderColor: "var(--coral)" }}>
            🍅 × {task.pomos}
          </span>
        )}
      </div>

      {/* Progression sous-tâches */}
      {total > 0 && (
        <div className="subtask-progress" style={{ paddingLeft: 36 }}>
          <span className="lab">{done}/{total}</span>
          <div className="bar"><div className="fill" style={{ width: pct + "%" }} /></div>
          <span className="lab">{Math.round(pct)}%</span>
        </div>
      )}

      {/* Liste sous-tâches */}
      <div style={{ paddingLeft: 36 }}>
        {task.subtasks.map(s => (
          <SubtaskRow key={s.id} s={s} lang={lang}
            onToggle={() => toggleSubtask(s.id)}
            onDelete={() => deleteSubtask(s.id)}
          />
        ))}

        {/* Formulaire ajout sous-tâche */}
        {addingSub ? (
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <input
              autoFocus
              style={{ flex: 1, background: "var(--cream-2)", border: "1.5px solid var(--ink)", borderRadius: 8, padding: "5px 8px", fontSize: 13 }}
              placeholder={lang === "fr" ? "Nom de l'étape…" : "Step name…"}
              value={subVal}
              onChange={e => setSubVal(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") commitSub(); if (e.key === "Escape") { setSubVal(""); setAddingSub(false); } }}
            />
            <button className="btn primary" style={{ padding: "5px 12px", fontSize: 12 }} onClick={commitSub}>+</button>
            <button className="btn" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => { setSubVal(""); setAddingSub(false); }}>✕</button>
          </div>
        ) : (
          <button
            onClick={() => setAddingSub(true)}
            style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 6, padding: "2px 0", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}
          >+ {lang === "fr" ? "ajouter une étape" : "add a step"}</button>
        )}
      </div>
    </div>
  );
}

/* ── Vue Tâches détaillées ── */
function TasksDetailed({ t, lang, tasks, toggle, toggleSubtask, addTask, deleteTask, updateTask, addSubtask, deleteSubtask }) {
  const [filter, setFilter]   = React.useState("active");
  const [newTitle, setNewTitle] = React.useState("");
  const [adding, setAdding]   = React.useState(false);
  const inputRef = React.useRef(null);

  React.useEffect(() => { if (adding && inputRef.current) inputRef.current.focus(); }, [adding]);

  const commit = () => {
    if (newTitle.trim()) { addTask(newTitle.trim()); setNewTitle(""); }
    setAdding(false);
  };

  const filters = [
    { key: "active", label: lang === "fr" ? "En cours" : "Active" },
    { key: "all",    label: lang === "fr" ? "Toutes"   : "All" },
    { key: "done",   label: lang === "fr" ? "Terminées" : "Done" },
  ];
  const visible = tasks.filter(x =>
    filter === "active" ? !x.done :
    filter === "done"   ?  x.done : true
  );

  return (
    <div style={{ maxWidth: 760 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: "-0.02em", marginBottom: 4 }}>{t.tasksDetailed}</h2>
          <div style={{ color: "var(--ink-mute)", fontSize: 13 }}>
            {tasks.filter(x => !x.done).length} {lang === "fr" ? "en cours" : "active"} · {tasks.filter(x => x.done).length} ✓
          </div>
        </div>
        <button className="btn primary" onClick={() => setAdding(true)} style={{ flexShrink: 0 }}>
          + {lang === "fr" ? "Nouvelle tâche" : "New task"}
        </button>
      </div>

      {/* Formulaire nouvelle tâche */}
      {adding && (
        <div className="card" style={{ marginBottom: 16, padding: "14px 16px" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              ref={inputRef}
              style={{ flex: 1, background: "var(--cream-2)", border: "1.5px solid var(--ink)", borderRadius: 10, padding: "9px 12px", fontSize: 15, fontFamily: "var(--font-display)", fontWeight: 600 }}
              placeholder={lang === "fr" ? "Nom de la tâche…" : "Task name…"}
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setNewTitle(""); setAdding(false); } }}
            />
            <button className="btn primary" onClick={commit} style={{ flexShrink: 0 }}>
              {lang === "fr" ? "Ajouter" : "Add"}
            </button>
            <button className="btn" onClick={() => { setNewTitle(""); setAdding(false); }} style={{ flexShrink: 0 }}>✕</button>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {filters.map(f => (
          <button key={f.key} className={`chip ${filter === f.key ? "coral" : ""}`}
            onClick={() => setFilter(f.key)} style={{ cursor: "pointer" }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      {visible.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 32, color: "var(--ink-mute)", fontSize: 14 }}>
          {filter === "done" ? (lang === "fr" ? "Aucune tâche terminée" : "No completed tasks") :
           filter === "active" ? (lang === "fr" ? "Aucune tâche en cours — bien joué !" : "No active tasks — well done!") :
           (lang === "fr" ? "Aucune tâche" : "No tasks")}
        </div>
      ) : visible.map(task => (
        <TaskDetailCard
          key={task.id}
          task={task}
          lang={lang}
          toggle={() => toggle(task.id)}
          deleteTask={() => deleteTask(task.id)}
          updateTask={(patch) => updateTask(task.id, patch)}
          toggleSubtask={(sid) => toggleSubtask(task.id, sid)}
          addSubtask={(title) => addSubtask(task.id, title)}
          deleteSubtask={(sid) => deleteSubtask(task.id, sid)}
        />
      ))}
    </div>
  );
}

/* ─────────────────── Brain dump view ─────────────────── */

function BrainDumpView({ t, lang, items, onAdd }) {
  const [val, setVal] = React.useState("");
  return (
    <div style={{ maxWidth: 760 }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: "-0.02em", marginBottom: 4 }}>🧠 {t.quickCapture}</h2>
      <div style={{ color: "var(--ink-mute)", fontSize: 13, marginBottom: 20 }}>{t.quickCaptureSub}</div>
      <div className="card">
        <textarea
          className="dump-area"
          style={{ minHeight: 140, fontSize: 16 }}
          placeholder={t.quickPlaceholder}
          value={val}
          onChange={e => setVal(e.target.value)}
        />
        <button className="btn honey" style={{ marginTop: 12 }} onClick={() => { if (val.trim()) { onAdd(val.trim()); setVal(""); }}}>↓ {t.capture}</button>
      </div>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, marginTop: 28, marginBottom: 12 }}>Inbox</h3>
      <div className="dump-list" style={{ marginTop: 0 }}>
        {items.map((d, i) => (
          <div key={i} className="dump-item">
            <span>•</span>
            <span style={{ flex: 1 }}>{typeof d === "string" ? d : (d[lang] || d.text)}</span>
            <span className="time">{d.time || "just now"}</span>
            <button style={{ fontSize: 12, color: "var(--ink-mute)" }}>→ tâche</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────── Routines view (editable) ─────────────────── */

const ICON_BANK = ["💊", "💧", "☀️", "🎯", "📵", "🧠", "📋", "🧘", "📖", "🌙", "🍳", "🚿", "🦷", "👟", "📓", "📱", "☕", "🥗", "💪", "🛏️", "🎧", "💌", "🪴", "🧹", "📞", "🎵", "✍️", "🐕", "🚴", "🧴"];

function StepRow({ step, lang, onToggle, onEdit, onDelete, onUp, onDown, canUp, canDown }) {
  const [editing, setEditing] = React.useState(false);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [val, setVal] = React.useState(step.label);
  const inputRef = React.useRef(null);

  React.useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);

  const commit = () => {
    const v = val.trim();
    if (v) onEdit({ label: v });
    else setVal(step.label);
    setEditing(false);
  };

  return (
    <div className={`routine-step ${step.done ? "done" : ""}`} style={{ position: "relative" }}>
      <button onClick={() => setPickerOpen(p => !p)} title="changer l'icône" style={{ fontSize: 18, padding: 0, lineHeight: 1, cursor: "pointer", filter: step.done ? "none" : "none" }}>{step.icon}</button>
      {editing ? (
        <input
          ref={inputRef}
          value={val}
          onChange={e => setVal(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setVal(step.label); setEditing(false); }}}
          style={{ flex: 1, padding: "4px 6px", border: "1.5px solid var(--ink)", borderRadius: 6, background: "var(--paper)", color: "var(--ink)", fontSize: 14 }}
        />
      ) : (
        <span style={{ flex: 1, cursor: "text", padding: "2px 0" }} onClick={() => setEditing(true)}>{step.label}</span>
      )}
      <div className="step-actions">
        <button className="ico-btn" title="monter" onClick={onUp} disabled={!canUp} style={{ opacity: canUp ? 1 : 0.25 }}>↑</button>
        <button className="ico-btn" title="descendre" onClick={onDown} disabled={!canDown} style={{ opacity: canDown ? 1 : 0.25 }}>↓</button>
        <button className="ico-btn" title="supprimer" onClick={onDelete}>🗑</button>
        <button className="ico-btn" onClick={onToggle} style={{ minWidth: 22 }}>{step.done ? "✓" : "○"}</button>
      </div>
      {pickerOpen && (
        <div className="icon-picker" onClick={e => e.stopPropagation()}>
          {ICON_BANK.map(ic => (
            <button key={ic} className={`ico-pick ${ic === step.icon ? "on" : ""}`} onClick={() => { onEdit({ icon: ic }); setPickerOpen(false); }}>{ic}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function RoutineEditor({ title, sub, steps, setSteps, lang }) {
  const [adding, setAdding] = React.useState(false);
  const [newLabel, setNewLabel] = React.useState("");
  const [newIcon, setNewIcon] = React.useState("✨");
  const [iconOpen, setIconOpen] = React.useState(false);

  const move = (i, dir) => {
    setSteps(s => {
      const j = i + dir;
      if (j < 0 || j >= s.length) return s;
      const next = [...s];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const addStep = () => {
    const v = newLabel.trim();
    if (!v) return;
    setSteps(s => [...s, { id: Date.now(), label: v, icon: newIcon, done: false }]);
    setNewLabel(""); setNewIcon("✨"); setAdding(false);
  };

  const doneCount = steps.filter(s => s.done).length;

  return (
    <div className="card">
      <div className="card-title">{title}</div>
      <div className="card-sub">{doneCount}/{steps.length} • {lang === "fr" ? "clique sur le texte ou l'icône pour éditer" : "click text or icon to edit"}</div>
      {steps.map((s, i) => (
        <StepRow
          key={s.id}
          step={s}
          lang={lang}
          onToggle={() => setSteps(arr => arr.map(x => x.id === s.id ? { ...x, done: !x.done } : x))}
          onEdit={(patch) => setSteps(arr => arr.map(x => x.id === s.id ? { ...x, ...patch } : x))}
          onDelete={() => setSteps(arr => arr.filter(x => x.id !== s.id))}
          onUp={() => move(i, -1)}
          onDown={() => move(i, 1)}
          canUp={i > 0}
          canDown={i < steps.length - 1}
        />
      ))}
      {adding ? (
        <div className="routine-step" style={{ position: "relative", borderStyle: "dashed", background: "var(--cream)" }}>
          <button onClick={() => setIconOpen(o => !o)} style={{ fontSize: 18, padding: 0, cursor: "pointer" }}>{newIcon}</button>
          <input
            autoFocus
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") addStep(); if (e.key === "Escape") { setAdding(false); setNewLabel(""); }}}
            placeholder={lang === "fr" ? "ex: Boire un café" : "e.g. Drink coffee"}
            style={{ flex: 1, padding: "4px 6px", fontSize: 14 }}
          />
          <div className="step-actions">
            <button className="ico-btn" onClick={addStep}>✓</button>
            <button className="ico-btn" onClick={() => { setAdding(false); setNewLabel(""); }}>✕</button>
          </div>
          {iconOpen && (
            <div className="icon-picker" onClick={e => e.stopPropagation()}>
              {ICON_BANK.map(ic => (
                <button key={ic} className={`ico-pick ${ic === newIcon ? "on" : ""}`} onClick={() => { setNewIcon(ic); setIconOpen(false); }}>{ic}</button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <button className="btn" style={{ width: "100%", justifyContent: "center", marginTop: 10, background: "var(--cream-2)" }} onClick={() => setAdding(true)}>
          + {lang === "fr" ? "Ajouter une étape" : "Add a step"}
        </button>
      )}
    </div>
  );
}

function RoutinesView({ t, lang, morningSteps, setMorningSteps, eveningSteps, setEveningSteps }) {
  const resetMorning = () => setMorningSteps(s => s.map(x => ({ ...x, done: false })));
  const resetEvening = () => setEveningSteps(s => s.map(x => ({ ...x, done: false })));
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: "-0.02em", marginBottom: 4 }}>🌅 Routines</h2>
          <div style={{ color: "var(--ink-mute)", fontSize: 13 }}>{lang === "fr" ? "Pilote automatique, version perso. Clique pour éditer, glisse ↑↓ pour réorganiser." : "Auto-pilot, your version. Click to edit, use ↑↓ to reorder."}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={resetMorning} title="reset matin">↻ {lang === "fr" ? "Reset matin" : "Reset AM"}</button>
          <button className="btn" onClick={resetEvening} title="reset soir">↻ {lang === "fr" ? "Reset soir" : "Reset PM"}</button>
        </div>
      </div>
      <div className="routine-grid">
        <RoutineEditor title={`☀️ ${t.routinesMorning}`} sub="" steps={morningSteps} setSteps={setMorningSteps} lang={lang} />
        <RoutineEditor title={`🌙 ${t.routinesEvening}`} sub="" steps={eveningSteps} setSteps={setEveningSteps} lang={lang} />
      </div>
      <div className="card" style={{ marginTop: 20, background: "var(--cream-2)" }}>
        <div className="card-title">💡 {lang === "fr" ? "Astuce TDAH" : "ADHD tip"}</div>
        <div style={{ fontSize: 14 }}>
          {lang === "fr"
            ? "Démarre tes routines avec UNE seule étape. Quand c'est ancré, ajoute la suivante. La constance > l'ambition."
            : "Start your routine with ONE step only. Once it sticks, add the next. Consistency > ambition."}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── Stats view ─────────────────── */

function StatsView({ t, lang, heatmapData }) {
  const max = Math.max(...window.WEEK_DATA.map(d => d.min));
  const total = window.WEEK_DATA.reduce((a, b) => a + b.min, 0);
  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: "-0.02em", marginBottom: 4 }}>📊 Stats & insights</h2>
      <div style={{ color: "var(--ink-mute)", fontSize: 13, marginBottom: 20 }}>Pas pour te juger. Pour te connaître.</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 20 }}>
        <div className="card">
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--ink-mute)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Cette semaine</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 44, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, marginTop: 6 }}>{total} <span style={{ fontSize: 16, color: "var(--ink-mute)" }}>min</span></div>
          <div style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 4 }}>+22% vs semaine dernière 📈</div>
        </div>
        <div className="card" style={{ background: "var(--coral)", color: "white", borderColor: "var(--ink)" }}>
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.85 }}>Série actuelle</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 44, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, marginTop: 6 }}>12 <span style={{ fontSize: 16, opacity: 0.7 }}>jours 🔥</span></div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>Record perso : 18 jours</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--ink-mute)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Heure de pointe</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 44, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, marginTop: 6 }}>10–12h</div>
          <div style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 4 }}>Ton cerveau préfère la matinée.</div>
        </div>
        <div className="card" style={{ background: "var(--plum)", color: "white", borderColor: "var(--ink)" }}>
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.85 }}>{lang === "fr" ? "Time blindness" : "Time blindness"}</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 44, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, marginTop: 6 }}>×1.6</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>{lang === "fr" ? "Multiplie tes estimations par 1.6" : "Multiply your estimates by 1.6"}</div>
        </div>
      </div>
      <div className="card">
        <div className="card-title">Minutes focus / 7 derniers jours</div>
        <div className="card-sub">{total} min total · moyenne {Math.round(total / 7)} min/jour</div>
        <div className="spark" style={{ height: 180 }}>
          {window.WEEK_DATA.map((d, i) => (
            <div key={i} className={`spark-bar ${i === 6 ? "today" : ""}`}>
              <div className="b" style={{ height: `${(d.min / max) * 100}%`, position: "relative" }}>
                {d.min > 0 && <span style={{ position: "absolute", top: -18, left: 0, right: 0, textAlign: "center", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--ink-mute)" }}>{d.min}</span>}
              </div>
              <div className="lab">{d.day}</div>
            </div>
          ))}
        </div>
      </div>
      {heatmapData && <div style={{ marginTop: 16 }}><AnnualHeatmap data={heatmapData} lang={lang} /></div>}
      <div className="card" style={{ marginTop: 16, background: "var(--cream-2)" }}>
        <div className="card-title">💡 Pattern repéré</div>
        <div style={{ fontSize: 14 }}>Tu termines <b>83% de tes Pomodoros le mardi & jeudi matin</b>. Coïncidence ? On parie que non. Et si on planifiait les grosses tâches là ?</div>
      </div>
    </div>
  );
}

Object.assign(window, {
  Chip, MoodEnergy, MedsCard, BodyDouble, Sounds, QuickCapture, StatsCard,
  TasksDetailed, BrainDumpView, RoutinesView, StatsView,
});
