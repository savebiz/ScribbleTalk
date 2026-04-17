// --- Globals ---
let drawCtx, traceCtx, isDrawing = false, drawColor = '#E24B4A', drawSize = 6, drawTool = 'draw';
let strokeCount = 0, currentLetterIdx = 0, sessionStartTime = 0;
let letters = [];

// --- Scribble Canvas ---
function initCanvas() {
  const wrap = document.getElementById('canvasWrap');
  const c = document.getElementById('drawCanvas');
  c.width = wrap.clientWidth || window.innerWidth;
  c.height = wrap.clientHeight || (window.innerHeight - 80);
  drawCtx = c.getContext('2d');
  drawCtx.fillStyle = '#FEFCFA';
  drawCtx.fillRect(0, 0, c.width, c.height);
  addCanvasEvents(c);
  
  // Track start time
  sessionStartTime = Date.now();
  strokeCount = 0;
  document.getElementById('strokeCount').textContent = '0 marks made';
}

function addCanvasEvents(c) {
  c.addEventListener('pointerdown', e => { 
    e.preventDefault(); isDrawing = true; 
    c.setPointerCapture(e.pointerId);
    startStroke(c, e.offsetX, e.offsetY);
  });
  c.addEventListener('pointermove', e => { 
    e.preventDefault(); 
    if (isDrawing) drawStroke(e.offsetX, e.offsetY);
  });
  c.addEventListener('pointerup', e => { 
    c.releasePointerCapture(e.pointerId);
    endStroke(); 
  });
  c.addEventListener('pointercancel', e => { endStroke(); });
}

function startStroke(c, x, y) {
  drawCtx.beginPath(); drawCtx.moveTo(x, y);
}

function drawStroke(x, y) {
  if (drawTool === 'erase') {
    drawCtx.globalCompositeOperation = 'destination-out';
    drawCtx.beginPath(); drawCtx.arc(x, y, drawSize * 2, 0, Math.PI * 2); drawCtx.fill();
    drawCtx.globalCompositeOperation = 'source-over';
  } else {
    drawCtx.lineTo(x, y);
    drawCtx.strokeStyle = drawColor;
    drawCtx.lineWidth = drawSize;
    drawCtx.lineCap = 'round'; drawCtx.lineJoin = 'round';
    drawCtx.stroke();
  }
}

function endStroke() {
  if (isDrawing) { 
    isDrawing = false; 
    strokeCount++; 
    document.getElementById('strokeCount').textContent = strokeCount + ' mark' + (strokeCount === 1 ? '' : 's') + ' made'; 
  }
}

function setColor(c, el) {
  drawColor = c; setTool('draw', document.getElementById('drawTool'));
  document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active')); 
  if (el) el.classList.add('active');
}

function setSize(s, el) {
  drawSize = s;
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active')); 
  if (el) el.classList.add('active');
}

function setTool(t, el) {
  drawTool = t;
  document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active')); 
  if(el) el.classList.add('active');
}

function clearCanvas() {
  if (drawCtx) { drawCtx.fillStyle = '#FEFCFA'; drawCtx.fillRect(0, 0, drawCtx.canvas.width, drawCtx.canvas.height); }
  strokeCount = 0; document.getElementById('strokeCount').textContent = '0 marks made';
}

async function celebrateScribble(type) {
  // Show Celebrate Modal for Scribble Only
  if(type === 'scribble') {
    const msg = document.getElementById('celebrateMsg');
    document.getElementById('celebrateStrokes').textContent = strokeCount || 'some';
    msg.style.display = 'block';
  } else {
    alert("Great job tracing " + letters[currentLetterIdx] + "!");
  }

  // Save session to IndexedDB
  const durationMin = Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000));
  if (window.pwaDB) {
    let sessionName = type === 'scribble' ? 'Free Scribble' : `Traced letter ${letters[currentLetterIdx]}`;
    await window.pwaDB.addSession({
      type: type,
      name: sessionName,
      duration: durationMin,
      strokes: strokeCount,
      rating: 'Great session'
    });
  }
}

function closeCelebrate() {
  document.getElementById('celebrateMsg').style.display='none';
}

// --- Tracing Canvas ---
function initTracing(context = 'letters') {
  if (context === 'letters') {
    letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    document.querySelector('#tracing .header-title').innerHTML = '<span class="header-icon">🖍️</span> Trace Letters';
  } else {
    letters = '0123456789'.split('');
    document.querySelector('#tracing .header-title').innerHTML = '<span class="header-icon">🔢</span> Trace Numbers';
  }

  const picker = document.getElementById('letterPicker');
  picker.innerHTML = '';
  letters.forEach((l, i) => {
    const chip = document.createElement('div');
    chip.className = 'letter-chip' + (i === 0 ? ' active' : '');
    chip.textContent = l;
    chip.onclick = () => { currentLetterIdx = i; selectLetter(i); document.querySelectorAll('.letter-chip').forEach(c => c.classList.remove('active')); chip.classList.add('active') };
    picker.appendChild(chip);
  });
  currentLetterIdx = 0;
  strokeCount = 0;
  sessionStartTime = Date.now();
  drawTraceLetter();
  setupTraceCanvas();
}

function selectLetter(i) { currentLetterIdx = i; drawTraceLetter(); setupTraceCanvas(); }
function nextLetter() {
  currentLetterIdx = (currentLetterIdx + 1) % letters.length;
  document.querySelectorAll('.letter-chip').forEach((c, i) => c.classList.toggle('active', i === currentLetterIdx));
  const picker = document.getElementById('letterPicker');
  const chips = [...picker.children];
  if (chips[currentLetterIdx]) chips[currentLetterIdx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  drawTraceLetter(); setupTraceCanvas();
}

function drawTraceLetter() {
  const c = document.getElementById('traceCanvas');
  const ctx = c.getContext('2d');
  const letter = letters[currentLetterIdx];
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#F8F9FA'; ctx.fillRect(0, 0, c.width, c.height);
  ctx.font = 'bold 180px Fredoka One, cursive';
  
  // Background letter
  ctx.fillStyle = 'rgba(200,195,230,0.4)';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(letter, c.width / 2, c.height / 2);
  
  // Dotted guide
  ctx.setLineDash([8, 8]); ctx.strokeStyle = 'rgba(155,135,240,0.35)'; ctx.lineWidth = 3;
  ctx.strokeText(letter, c.width / 2, c.height / 2);
  ctx.setLineDash([]);
  
  const typeText = /[0-9]/.test(letter) ? 'number' : 'letter';
  document.getElementById('traceInstr').textContent = `Trace the ${typeText} ${letter} — follow the shape ✨`;
}

let gradeTimeout = null;

function setupTraceCanvas() {
  attachEventsOnce();
}

// We only want to set up events ONCE, not every nextLetter().
function attachEventsOnce() {
  const c = document.getElementById('traceCanvas');
  if(c.dataset.eventsReady) return; // Prevent duplicates
  c.dataset.eventsReady = "true";
  
  let drawing = false;
  
  function getPos(e) {
    const r = c.getBoundingClientRect();
    const scaleX = c.width / r.width, scaleY = c.height / r.height;
    return { x: (e.clientX - r.left) * scaleX, y: (e.clientY - r.top) * scaleY };
  }
  
  function resetTimeout() { if(gradeTimeout) clearTimeout(gradeTimeout); }
  function startTimeout() { resetTimeout(); gradeTimeout = setTimeout(() => gradeTracing(), 1500); }
  
  c.addEventListener('pointerdown', e => { 
    resetTimeout();
    e.preventDefault(); drawing = true; 
    c.setPointerCapture(e.pointerId);
    const ctx = c.getContext('2d');
    const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y);
  });
  c.addEventListener('pointermove', e => { 
    e.preventDefault(); if (!drawing) return; 
    const p = getPos(e); 
    const ctx = c.getContext('2d');
    ctx.lineTo(p.x, p.y); ctx.strokeStyle = '#9B87F0'; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
  });
  c.addEventListener('pointerup', e => { 
    c.releasePointerCapture(e.pointerId);
    drawing = false; strokeCount++; 
    startTimeout();
  });
  c.addEventListener('pointercancel', e => { 
    drawing = false; strokeCount++; 
    startTimeout();
  });
}

function setupTraceCanvas() {
  attachEventsOnce();
}

async function gradeTracing() {
  const c = document.getElementById('traceCanvas');
  const w = c.width, h = c.height;
  
  const traceCtx = c.getContext('2d');
  const traceData = traceCtx.getImageData(0, 0, w, h).data;
  
  // Offscreen correct letter
  const offC = document.createElement('canvas');
  offC.width = w; offC.height = h;
  const offCtx = offC.getContext('2d');
  offCtx.fillStyle = 'white'; offCtx.fillRect(0,0,w,h);
  offCtx.fillStyle = 'black'; 
  offCtx.font = 'bold 180px Fredoka One, cursive';
  offCtx.textAlign = 'center'; offCtx.textBaseline = 'middle';
  offCtx.fillText(letters[currentLetterIdx], w / 2, h / 2);
  offCtx.lineWidth = 26; offCtx.strokeStyle = 'black'; offCtx.lineJoin = 'round';
  offCtx.strokeText(letters[currentLetterIdx], w / 2, h / 2);
  
  const idealData = offCtx.getImageData(0,0,w,h).data;
  
  let idealPixels = 0, tracedPixels = 0, overlapPixels = 0, outOfBoundsPixels = 0;
  
  for (let i = 0; i < traceData.length; i += 4) {
    const isIdeal = idealData[i] < 128; 
    if (isIdeal) idealPixels++;
    const isTraced = traceData[i] < 180; 
    if (isTraced) tracedPixels++;
    if (isTraced && isIdeal) overlapPixels++;
    if (isTraced && !isIdeal) outOfBoundsPixels++;
  }
  
  if (tracedPixels < 50) return; // Ignore accidental micro-taps
  
  // Lowered expected coverage to 40% because finger tracing is often thin/wavering
  const expectedCoverage = 0.40; 
  const normalizedCoverage = Math.min(1.0, (overlapPixels / idealPixels) / expectedCoverage);
  
  // Damped penalty so slight wobbles outside the dotted lines don't destroy scores
  const penalty = outOfBoundsPixels / idealPixels; 
  
  const rawScore = normalizedCoverage - penalty; 
  
  let stars = 1;
  if (rawScore >= 0.70) stars = 5;  // Very forgiving threshold
  else if (rawScore >= 0.40) stars = 4;
  else if (rawScore >= 0.15) stars = 3;
  else if (rawScore >= -0.20) stars = 2; // Even messy scribbles get 2 stars if they tried to trace
  
  showStarReward(stars);
}

async function showStarReward(stars) {
  const modal = document.getElementById('starReward');
  const wrap = document.getElementById('starsWrap');
  const msg = document.getElementById('starRewardMsg');
  
  wrap.innerHTML = '';
  for(let i=0; i<5; i++) {
    const starEl = document.createElement('div');
    starEl.className = 'sr-star';
    starEl.textContent = '★'; // Unicode black star responds to CSS colors, unlike the ⭐ emoji!
    if(i < stars) {
      setTimeout(() => starEl.classList.add('earned'), i * 150); 
    }
    wrap.appendChild(starEl);
  }
  
  const msgs = {5: "Perfect!", 4: "Amazing!", 3: "Great Job!", 2: "Getting there!", 1: "Keep practicing!"};
  msg.textContent = msgs[stars] || "Well done!";
  
  modal.style.display = 'flex';
  modal.classList.remove('closing');
  
  const durationMin = Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000));
  if (window.pwaDB) {
    await window.pwaDB.addSession({
      type: 'trace',
      name: `Traced ${/[0-9]/.test(letters[currentLetterIdx]) ? 'number' : 'letter'} ${letters[currentLetterIdx]}`,
      duration: durationMin,
      strokes: strokeCount,
      rating: `${stars} star trace`
    });
  }
  
  setTimeout(() => {
    modal.classList.add('closing');
    setTimeout(() => {
      modal.style.display = 'none';
      if (gradeTimeout) clearTimeout(gradeTimeout); // Prevent double firing
      nextLetter();
    }, 300);
  }, 2200);
}

function clearTrace() {
  if (gradeTimeout) clearTimeout(gradeTimeout);
  drawTraceLetter(); 
  setupTraceCanvas();
}

function playLetterSound() {
  const l = letters[currentLetterIdx];
  if ('speechSynthesis' in window) {
    const isNum = /[0-9]/.test(l);
    const speechText = isNum ? `The number ${l}.` : `${l} says ${l.toLowerCase()}.`;
    const u = new SpeechSynthesisUtterance(speechText);
    u.rate = 0.8; u.pitch = 1.1; window.speechSynthesis.speak(u);
  }
}
