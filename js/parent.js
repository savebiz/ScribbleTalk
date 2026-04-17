// --- Dashboard & Analytics ---
function switchDashTab(btn, tabId) {
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  ['tab-overview', 'tab-progress', 'tab-activity', 'tab-settings', 'tab-tips'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = (id === tabId) ? 'block' : 'none';
  });
}

function timeAgo(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMins = Math.round(diffMs / 60000);
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.round(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;
  return `${Math.round(diffHours / 24)} days ago`;
}

async function refreshDashboard() {
  if (!window.pwaDB) return;
  const sessions = await window.pwaDB.getRecentSessions();
  
  let totalTime = 0;
  let listHtml = '';
  let traceSessionsCount = 0;
  let scribbleCount = 0;
  
  if (sessions.length === 0) {
    listHtml = '<div style="font-size:0.9rem; color:var(--ink2)">No activities yet. Play to see results!</div>';
  } else {
    sessions.forEach(sess => {
      totalTime += sess.duration || 1;
      const icon = sess.type === 'scribble' ? '🎨' : '✏️';
      
      if(sess.type === 'scribble') scribbleCount++;
      if(sess.type === 'trace') traceSessionsCount++;
      
      listHtml += `
        <div class="act-log">
          <div class="act-log-icon">${icon}</div>
          <div class="act-log-text">
            <div class="act-log-name">${sess.name}</div>
            <div class="act-log-time">${timeAgo(sess.date)} · ${sess.duration || 1} min</div>
          </div>
          <span class="act-log-badge badge-great">${sess.rating}</span>
        </div>
      `;
    });
  }
  
  // Update Overview metrics
  document.getElementById('metricSessions').textContent = sessions.length;
  document.getElementById('metricTime').textContent = `${totalTime}m`;
  document.getElementById('metricStars').textContent = `🌟 ${sessions.length}`; // 1 star per session!
  
  // Update Activity List
  document.getElementById('activityList').innerHTML = listHtml;
  
  // Update Progress bars (Mocked calculation based on sessions)
  let scribblePct = Math.min(100, Math.round((scribbleCount / 5) * 100)); // ~5 sessions to "master" scribble
  let tracePct = Math.min(100, Math.round((traceSessionsCount / 10) * 100)); // ~10 sessions to master trace
  
  document.getElementById('progScribblePct').textContent = scribblePct + '%';
  document.getElementById('progScribbleBar').style.width = scribblePct + '%';
  
  document.getElementById('progTracePct').textContent = tracePct + '%';
  document.getElementById('progTraceBar').style.width = tracePct + '%';
}
