// Initial app data
window.INITIAL_TASKS = [
  {
    id: 1,
    title: { fr: "Finir le rapport pour Marc", en: "Finish report for Marc" },
    note: { fr: "Évitée depuis mardi 👀", en: "Avoided since Tuesday 👀" },
    estimate: 50,
    done: false,
    priority: "now",
    energy: "high",
    subtasks: [
      { id: 11, title: { fr: "Ouvrir le doc (oui, juste ça)", en: "Open the doc (yes, just that)" }, done: true },
      { id: 12, title: { fr: "Relire la section 2", en: "Re-read section 2" }, done: true },
      { id: 13, title: { fr: "Écrire la conclusion", en: "Write conclusion" }, done: false },
      { id: 14, title: { fr: "Vérifier les sources", en: "Check sources" }, done: false },
      { id: 15, title: { fr: "Envoyer (le plus dur)", en: "Send it (the hardest)" }, done: false },
    ],
  },
  {
    id: 2,
    title: { fr: "Répondre à l'email de la banque", en: "Reply to the bank email" },
    note: { fr: "2 min max, juré", en: "2 min max, promise" },
    estimate: 5,
    done: false,
    priority: "quick",
    energy: "low",
    subtasks: [],
  },
  {
    id: 3,
    title: { fr: "Faire les courses", en: "Grocery run" },
    note: { fr: "Avant que le frigo pleure", en: "Before the fridge cries" },
    estimate: 30,
    done: false,
    priority: "today",
    energy: "medium",
    subtasks: [
      { id: 31, title: { fr: "Liste sur le téléphone", en: "List on phone" }, done: false },
      { id: 32, title: { fr: "Mettre les chaussures (étape critique)", en: "Put on shoes (critical step)" }, done: false },
      { id: 33, title: { fr: "Y aller", en: "Actually go" }, done: false },
    ],
  },
  {
    id: 4,
    title: { fr: "Réserver le RDV dentiste", en: "Book dentist appointment" },
    note: { fr: "Ça fait 6 mois. Allez.", en: "It's been 6 months. Come on." },
    estimate: 5,
    done: false,
    priority: "today",
    energy: "low",
    subtasks: [],
  },
  {
    id: 5,
    title: { fr: "Boire un verre d'eau", en: "Drink water" },
    note: { fr: "Win facile", en: "Easy win" },
    estimate: 1,
    done: true,
    priority: "quick",
    energy: "low",
    subtasks: [],
  },
];

window.MORNING_ROUTINE = [
  { fr: "Médicament", en: "Medication", icon: "💊" },
  { fr: "Verre d'eau", en: "Glass of water", icon: "💧" },
  { fr: "10 min de soleil", en: "10 min sunlight", icon: "☀️" },
  { fr: "Définir 1 priorité", en: "Set 1 priority", icon: "🎯" },
  { fr: "Pas de téléphone (15 min)", en: "No phone (15 min)", icon: "📵" },
];

window.EVENING_ROUTINE = [
  { fr: "Vide-cerveau", en: "Brain dump", icon: "🧠" },
  { fr: "Préparer demain", en: "Prep tomorrow", icon: "📋" },
  { fr: "Étirements", en: "Stretching", icon: "🧘" },
  { fr: "Lecture papier", en: "Paper reading", icon: "📖" },
  { fr: "Écran off à 22h", en: "Screens off 10pm", icon: "🌙" },
];

window.BODY_DOUBLERS = [
  { name: "Léa", task: "Thèse chapitre 3", emoji: "📚", color: "#e87560" },
  { name: "Marcus", task: "Code review", emoji: "💻", color: "#7c9eb2" },
  { name: "Yuki", task: "Admin paperasse", emoji: "📄", color: "#e8b04a" },
  { name: "Sam", task: "Mémoire master", emoji: "✏️", color: "#9b7cb2" },
  { name: "Anaïs", task: "Compta freelance", emoji: "🧾", color: "#7cb290" },
];

window.RECENT_DUMPS = [
  { fr: "Acheter pile pour la pendule", en: "Buy clock battery", time: "il y a 2h" },
  { fr: "Idée vidéo : sketch noodle", en: "Video idea: noodle sketch", time: "il y a 5h" },
  { fr: "Appeler maman dimanche", en: "Call mom Sunday", time: "hier" },
  { fr: "Réserver vacances août ??", en: "Book August holidays ??", time: "hier" },
  { fr: "Pourquoi les pigeons", en: "Why pigeons tho", time: "hier" },
];

// 7-day focus minutes for stats sparkline
window.WEEK_DATA = [
  { day: "L", min: 95 },
  { day: "M", min: 60 },
  { day: "M", min: 0 },
  { day: "J", min: 130 },
  { day: "V", min: 80 },
  { day: "S", min: 25 },
  { day: "D", min: 110 },
];
