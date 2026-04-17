// --- State ---
window.appState = { childName: 'Temi', parentName: '', selectedAge: '', goals: [] };

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
  // Load settings from IndexedDB
  if (window.pwaDB) {
    const saved = await window.pwaDB.loadSettings();
    if (saved && saved.childName) {
      window.appState = saved;
      // Pre-fill fields if we ever go back to onboarding
      document.getElementById('childName').value = saved.childName;
      document.getElementById('parentName').value = saved.parentName;
    }
  }
  
  // Set default view based on whether we have a childName set (meaning they onboarded)
  if (window.appState.childName && window.appState.childName !== 'Temi') {
    go('child-home');
  } else {
    go('landing');
  }
  
  // Attach resize handler
  window.addEventListener('resize', () => {
    if (document.getElementById('scribble').classList.contains('active') && window.initCanvas) {
      window.initCanvas();
    }
  });
});

// --- Parental Gate Navigation ---
let gateTimeout = null;

function go(id, context = null) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  
  if (id === 'scribble' && window.initCanvas) initCanvas();
  if (id === 'tracing' && window.initTracing) initTracing(context);
  if (id === 'dashboard' && window.refreshDashboard) refreshDashboard();
  
  if (id === 'child-home' && window.appState.childName) {
    document.getElementById('childNameDisplay').textContent = 'Hello, ' + window.appState.childName + ' 👋';
  }
  if (id === 'dashboard' && window.appState.childName) {
    document.getElementById('dashChildName').textContent = window.appState.childName + "'s progress";
  }
  window.scrollTo(0, 0);
}

function startParentGate(e, targetId) {
  e.preventDefault();
  const btn = e.currentTarget;
  btn.classList.add('holding');
  
  gateTimeout = setTimeout(() => {
    btn.classList.remove('holding');
    gateTimeout = null;
    go(targetId);
  }, 2000); // 2 second hold
}

function endParentGate(e) {
  e.preventDefault();
  if (gateTimeout) {
    clearTimeout(gateTimeout);
    gateTimeout = null;
    const btn = e.currentTarget;
    if (btn.classList.contains('holding')) {
      btn.classList.remove('holding');
      
      // Inject and show brief hint
      let hint = btn.querySelector('.gate-hint');
      if (!hint) {
        hint = document.createElement('div');
        hint.className = 'gate-hint';
        btn.appendChild(hint);
      }
      hint.textContent = 'Hold 2s to exit';
      hint.classList.add('visible');
      setTimeout(() => hint.classList.remove('visible'), 1500);
    }
  }
}

// --- Onboarding Logic ---
function selAge(el, age) {
  document.querySelectorAll('.age-chip').forEach(c => c.classList.remove('sel'));
  el.classList.add('sel');
  window.appState.selectedAge = age;
}
function toggleGoal(el) { el.classList.toggle('sel'); }

async function finishOnboard() {
  const n = document.getElementById('childName').value.trim();
  const p = document.getElementById('parentName').value.trim();
  if (n) window.appState.childName = n;
  if (p) window.appState.parentName = p;
  
  if (window.pwaDB) await window.pwaDB.saveSettings(window.appState);
  
  go('child-home');
}
