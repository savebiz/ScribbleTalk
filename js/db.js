// Local Database initialized with Dexie.js
const db = new Dexie('ScribbleTalk_PWA');

db.version(1).stores({
  // 'settings' stores global configs like childName, age, etc.
  settings: 'id',
  // 'sessions' stores individual drawing/tracing sessions for the dashboard
  sessions: '++id, date, type, duration, strokes, rating, name'
});

async function loadSettings() {
  const data = await db.settings.get('config');
  if (data) {
    return data;
  }
  return { childName: '', parentName: '', selectedAge: '', goals: [] };
}

async function saveSettings(config) {
  await db.settings.put({ id: 'config', ...config });
}

async function addSession(session) {
  session.date = new Date().toISOString();
  await db.sessions.add(session);
}

async function getRecentSessions() {
  return await db.sessions.orderBy('date').reverse().limit(10).toArray();
}

// Ensure the db functions are accessible globally for the vanilla JS architecture
window.pwaDB = { loadSettings, saveSettings, addSession, getRecentSessions };
