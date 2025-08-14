/* Simulador demo (vanilla JS) — arrastrar piezas, timer por item y total, modo guiado.
   Versión de demo: 1 puzzle (Niño) con solución rápida. Listo para ampliar. */

// Config
const TOTAL_ITEMS = 20;
const ITEM_TIME_EXAM = 180; // segundos por ítem en modo examen (3 min)
const TOTAL_TIME = 30 * 60; // 30 min total

// Estado
let mode = 'free'; // free | guided | exam
let currentIndex = 1;
let score = 0;
let totalTimeLeft = TOTAL_TIME;
let itemTimeLeft = ITEM_TIME_EXAM;
let totalTimerInterval = null;
let itemTimerInterval = null;
let lockedItems = new Set(); // si modo examen y se bloquea

// DOM
const itemIndexEl = document.getElementById('itemIndex');
const boardArea = document.getElementById('boardArea');
const startBtn = document.getElementById('startBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const modeSelect = document.getElementById('modeSelect');
const modeBtn = document.getElementById('modeBtn');
const totalTimerEl = document.getElementById('totalTimer');
const itemTimerEl = document.getElementById('itemTimer');
const progressFill = document.getElementById('progressFill');
const scoreEl = document.getElementById('score');

modeSelect.addEventListener('change', (e)=>{ mode = e.target.value; modeBtn.textContent = 'Modo: '+(mode==='free'?'Libre':mode==='guided'?'Guiado':'Examen'); });

// Demo puzzle (Niño) — tamaño estándar 6x6
const DEMO_PUZZLE = {
  rows:6, cols:6,
  child:{r:3,c:1,len:2},
  blockers:[ {r1:2,c1:4,r2:3,c2:4,name:'V1', horiz:false}, {r1:4,c1:3,r2:4,c2:4,name:'H1', horiz:true} ],
  exitRow:3
};

// Build board UI
function buildBoard(puzzle){
  boardArea.innerHTML='';
  const board = document.createElement('div');
  board.className='board';
  board.style.gridTemplateColumns = `repeat(${puzzle.cols}, 56px)`;
  board.style.gridTemplateRows = `repeat(${puzzle.rows}, 56px)`;
  board.style.gap = '4px';

  // create empty cells
  for(let r=1;r<=puzzle.rows;r++){
    for(let c=1;c<=puzzle.cols;c++){
      const cell = document.createElement('div');
      cell.className='cell';
      cell.dataset.r = r; cell.dataset.c = c;
      board.appendChild(cell);
    }
  }

  boardArea.appendChild(board);

  // place pieces using absolute overlay technique
  placePieces(board, puzzle);
}

function placePieces(board, puzzle){
  // put child piece
  const child = document.createElement('div');
  child.className = 'piece C';
  child.textContent = 'C';
  child.style.setProperty('--len', puzzle.child.len);
  child.style.position = 'absolute';
  // compute position
  const cellSize = 56 + 4; // cell + gap
  child.style.left = ((puzzle.child.c-1) * cellSize + 12) + 'px';
  child.style.top = ((puzzle.child.r-1) * cellSize + 12) + 'px';
  child.style.width = (puzzle.child.len * 56 + (puzzle.child.len-1)*4) + 'px';
  child.draggable = true;
  child.dataset.type = 'C';
  child.dataset.r = puzzle.child.r; child.dataset.c = puzzle.child.c; child.dataset.len = puzzle.child.len;
  boardArea.appendChild(child);

  // blockers
  puzzle.blockers.forEach((b,i)=>{
    const el = document.createElement('div');
    el.className = 'piece block';
    el.textContent = b.name;
    el.style.position = 'absolute';
    const cellSize = 56 + 4;
    el.style.left = ((b.c1-1) * cellSize + 12) + 'px';
    el.style.top = ((b.r1-1) * cellSize + 12) + 'px';
    el.draggable = true;
    el.dataset.name = b.name; el.dataset.r = b.r1; el.dataset.c = b.c1;
    boardArea.appendChild(el);
  });

  enableDrag(boardArea);
}

// Simple drag & drop: allow dragging pieces but restrict to grid lines
function enableDrag(container){
  let dragging = null;
  let startX=0, startY=0;

  container.addEventListener('dragstart', (e)=>{
    const t = e.target;
    if(!t.classList.contains('piece')) return;
    dragging = t;
    t.classList.add('dragging');
    startX = e.clientX; startY = e.clientY;
  });
  container.addEventListener('dragend', (e)=>{
    if(!dragging) return;
    dragging.classList.remove('dragging');
    // snap to nearest cell (simple snap)
    const rect = container.querySelector('.board').getBoundingClientRect();
    const cellW = 56+4;
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    const newC = Math.round((offsetX - 12) / cellW) + 1;
    const newR = Math.round((offsetY - 12) / cellW) + 1;
    // keep inside
    const puzzle = DEMO_PUZZLE;
    const c = Math.max(1, Math.min(puzzle.cols, newC));
    const r = Math.max(1, Math.min(puzzle.rows, newR));
    dragging.style.left = ((c-1) * cellW + 12) + 'px';
    dragging.style.top = ((r-1) * cellW + 12) + 'px';
    dragging.dataset.c = c; dragging.dataset.r = r;
    dragging = null;
  });

  // allow drop
  container.addEventListener('dragover',(e)=>{ e.preventDefault(); });
}

// Timers
function formatTime(s){ const m=Math.floor(s/60); const sec = s%60; return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}` }

function startTotalTimer(){
  if(totalTimerInterval) clearInterval(totalTimerInterval);
  totalTimerInterval = setInterval(()=>{
    totalTimeLeft = Math.max(0, totalTimeLeft - 1);
    totalTimerEl.textContent = formatTime(totalTimeLeft);
    // update progress
    const done = (currentIndex-1)/TOTAL_ITEMS;
    progressFill.style.width = `${Math.round(done*100)}%`;
    if(totalTimeLe
