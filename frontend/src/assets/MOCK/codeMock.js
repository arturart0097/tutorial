export const DEFAULT_CODE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Tic Tac Toe with SFX</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
        sans-serif;
    }

    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #000;
      color: #fff;
    }

    .game {
      text-align: center;
    }

    h1 {
      margin-bottom: 10px;
      text-shadow: 0 0 10px #0ff;
    }

    .status {
      margin-bottom: 15px;
      min-height: 1.4em;
    }

    .board {
      display: grid;
      grid-template-columns: repeat(3, 90px);
      grid-template-rows: repeat(3, 90px);
      gap: 8px;
      justify-content: center;
      margin: 0 auto 16px;
    }

    .cell {
      width: 90px;
      height: 90px;
      border-radius: 12px;
      border: 2px solid #0ff;
      background: rgba(5, 10, 25, 0.9);
      color: #fff;
      font-size: 2.8rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 0 12px rgba(0, 255, 255, 0.5);
      transition: transform 0.08s ease, box-shadow 0.08s ease,
        background 0.08s ease;
      user-select: none;
    }

    .cell:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 18px rgba(0, 255, 255, 0.8);
      background: rgba(10, 20, 45, 0.9);
    }

    .cell.X {
      color: #4dd0ff;
      text-shadow: 0 0 10px #4dd0ff;
    }

    .cell.O {
      color: #ff6ac1;
      text-shadow: 0 0 10px #ff6ac1;
    }

    .cell.winning {
      box-shadow: 0 0 20px #ffd700;
      border-color: #ffd700;
    }

    button#resetBtn {
      padding: 8px 18px;
      border-radius: 999px;
      border: 1px solid #0ff;
      background: transparent;
      color: #0ff;
      font-weight: 600;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      box-shadow: 0 0 10px rgba(0, 255, 255, 0.6);
      transition: background 0.15s ease, color 0.15s ease,
        box-shadow 0.15s ease, transform 0.1s ease;
    }

    button#resetBtn:hover {
      background: #0ff;
      color: #000;
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.9);
      transform: translateY(-1px);
    }

    .hint {
      margin-top: 8px;
      font-size: 0.8rem;
      opacity: 0.8;
    }
  </style>
</head>
<body>
  <div class="game">
    <h1>Tic Tac Toe</h1>
    <div class="status" id="status">Your move (X)</div>

    <div class="board" id="board">
      <!-- 9 cells -->
      <div class="cell" data-index="0"></div>
      <div class="cell" data-index="1"></div>
      <div class="cell" data-index="2"></div>
      <div class="cell" data-index="3"></div>
      <div class="cell" data-index="4"></div>
      <div class="cell" data-index="5"></div>
      <div class="cell" data-index="6"></div>
      <div class="cell" data-index="7"></div>
      <div class="cell" data-index="8"></div>
    </div>

    <button id="resetBtn">Play again</button>
    <div class="hint">You are X, computer is O</div>
  </div>

  <script>
    // ============= SFX via Web Audio =============
    let audioCtx = null;

    function getAudioCtx() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      return audioCtx;
    }

    function playTone(freq, duration = 0.12, type = "sine", volume = 0.25) {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = volume;

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.start(now);
      osc.stop(now + duration);
    }

    function playClick() {
      playTone(550, 0.08, "square", 0.3);
    }

    function playWin() {
      // short "arpeggio"
      [440, 660, 880].forEach((f, i) => {
        setTimeout(() => playTone(f, 0.12, "sine", 0.4), i * 130);
      });
    }

    function playLose() {
      [660, 440, 330].forEach((f, i) => {
        setTimeout(() => playTone(f, 0.14, "triangle", 0.35), i * 150);
      });
    }

    function playDraw() {
      playTone(400, 0.18, "sine", 0.25);
      setTimeout(() => playTone(350, 0.18, "sine", 0.2), 160);
    }

    // ============= Game logic =============
    const cells = Array.from(document.querySelectorAll(".cell"));
    const statusEl = document.getElementById("status");
    const resetBtn = document.getElementById("resetBtn");

    let board = Array(9).fill(null);
    let gameOver = false;
    const HUMAN = "X";
    const AI = "O";

    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    function checkWinner(b) {
      for (const [a, bIdx, c] of winPatterns) {
        if (b[a] && b[a] === b[bIdx] && b[a] === b[c]) {
          return { winner: b[a], line: [a, bIdx, c] };
        }
      }
      if (b.every((v) => v !== null)) {
        return { winner: null, line: null }; // draw
      }
      return null; // game continues
    }

    function updateBoardUI() {
      board.forEach((val, idx) => {
        const cell = cells[idx];
        cell.textContent = val ? val : "";
        cell.classList.remove("X", "O", "winning");
        if (val) cell.classList.add(val);
      });
    }

    function handleCellClick(e) {
      const cell = e.currentTarget;
      const idx = Number(cell.dataset.index);

      if (gameOver) return;
      if (board[idx] !== null) return; // already taken

      // Player move
      board[idx] = HUMAN;
      playClick();
      updateBoardUI();

      const result = checkWinner(board);
      if (result) {
        endGame(result);
        return;
      }

      statusEl.textContent = "Computer's move...";
      // Block clicks while "thinking"
      cells.forEach((c) => (c.style.pointerEvents = "none"));

      setTimeout(() => {
        aiMove();
        cells.forEach((c) => (c.style.pointerEvents = ""));
      }, 400);
    }

    function aiMove() {
      if (gameOver) return;

      // 1. try to win
      let move = findBestMove(AI);
      // 2. if not possible – try to block X
      if (move === null) move = findBestMove(HUMAN);
      // 3. if still nothing – random cell
      if (move === null) {
        const free = board
          .map((v, i) => (v === null ? i : null))
          .filter((v) => v !== null);
        if (free.length > 0) {
          move = free[Math.floor(Math.random() * free.length)];
        }
      }

      if (move !== null) {
        board[move] = AI;
        playClick();
        updateBoardUI();
      }

      const result = checkWinner(board);
      if (result) {
        endGame(result);
      } else {
        statusEl.textContent = "Your move (X)";
      }
    }

    function findBestMove(player) {
      for (const [a, bIdx, c] of winPatterns) {
        const line = [board[a], board[bIdx], board[c]];
        const countPlayer = line.filter((v) => v === player).length;
        const countEmpty = line.filter((v) => v === null).length;
        if (countPlayer === 2 && countEmpty === 1) {
          // return the empty index
          if (board[a] === null) return a;
          if (board[bIdx] === null) return bIdx;
          if (board[c] === null) return c;
        }
      }
      return null;
    }

    function endGame(result) {
      gameOver = true;

      if (result.winner === HUMAN) {
        statusEl.textContent = "You win! 🎉";
        playWin();
      } else if (result.winner === AI) {
        statusEl.textContent = "You lose 😈";
        playLose();
      } else {
        statusEl.textContent = "Draw 🤝";
        playDraw();
      }

      if (result.line) {
        result.line.forEach((idx) => {
          cells[idx].classList.add("winning");
        });
      }
    }

    function resetGame() {
      board = Array(9).fill(null);
      gameOver = false;
      updateBoardUI();
      statusEl.textContent = "Your move (X)";
    }

    cells.forEach((cell) =>
      cell.addEventListener("click", handleCellClick)
    );
    resetBtn.addEventListener("click", resetGame);
  </script>
</body>
</html>
`;

export const REGENERATE_CODE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Tic Tac Toe with SFX</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
        sans-serif;
    }

    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
      color: #fff;
    }

    .game {
      text-align: center;
    }

    h1 {
      margin-bottom: 10px;
      text-shadow: 0 0 10px #0ff;
    }

    .status {
      margin-bottom: 15px;
      min-height: 1.4em;
    }

    .board {
      display: grid;
      grid-template-columns: repeat(3, 90px);
      grid-template-rows: repeat(3, 90px);
      gap: 8px;
      justify-content: center;
      margin: 0 auto 16px;
    }

    .cell {
      width: 90px;
      height: 90px;
      border-radius: 12px;
      border: 2px solid #0ff;
      background: rgba(5, 10, 25, 0.9);
      color: #fff;
      font-size: 2.8rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 0 12px rgba(0, 255, 255, 0.5);
      transition: transform 0.08s ease, box-shadow 0.08s ease,
        background 0.08s ease;
      user-select: none;
    }

    .cell:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 18px rgba(0, 255, 255, 0.8);
      background: rgba(10, 20, 45, 0.9);
    }

    .cell.X {
      color: #4dd0ff;
      text-shadow: 0 0 10px #4dd0ff;
    }

    .cell.O {
      color: #ff6ac1;
      text-shadow: 0 0 10px #ff6ac1;
    }

    .cell.winning {
      box-shadow: 0 0 20px #ffd700;
      border-color: #ffd700;
    }

    button#resetBtn {
      padding: 8px 18px;
      border-radius: 999px;
      border: 1px solid #0ff;
      background: transparent;
      color: #0ff;
      font-weight: 600;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      box-shadow: 0 0 10px rgba(0, 255, 255, 0.6);
      transition: background 0.15s ease, color 0.15s ease,
        box-shadow 0.15s ease, transform 0.1s ease;
    }

    button#resetBtn:hover {
      background: #0ff;
      color: #000;
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.9);
      transform: translateY(-1px);
    }

    .hint {
      margin-top: 8px;
      font-size: 0.8rem;
      opacity: 0.8;
    }
  </style>
</head>
<body>
  <div class="game">
    <h1>Tic Tac Toe</h1>
    <div class="status" id="status">Your move (X)</div>

    <div class="board" id="board">
      <!-- 9 cells -->
      <div class="cell" data-index="0"></div>
      <div class="cell" data-index="1"></div>
      <div class="cell" data-index="2"></div>
      <div class="cell" data-index="3"></div>
      <div class="cell" data-index="4"></div>
      <div class="cell" data-index="5"></div>
      <div class="cell" data-index="6"></div>
      <div class="cell" data-index="7"></div>
      <div class="cell" data-index="8"></div>
    </div>

    <button id="resetBtn">Play again</button>
    <div class="hint">You are X, computer is O</div>
  </div>

  <script>
    // ============= SFX via Web Audio =============
    let audioCtx = null;

    function getAudioCtx() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      return audioCtx;
    }

    function playTone(freq, duration = 0.12, type = "sine", volume = 0.25) {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = volume;

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.start(now);
      osc.stop(now + duration);
    }

    function playClick() {
      playTone(550, 0.08, "square", 0.3);
    }

    function playWin() {
      // short "arpeggio"
      [440, 660, 880].forEach((f, i) => {
        setTimeout(() => playTone(f, 0.12, "sine", 0.4), i * 130);
      });
    }

    function playLose() {
      [660, 440, 330].forEach((f, i) => {
        setTimeout(() => playTone(f, 0.14, "triangle", 0.35), i * 150);
      });
    }

    function playDraw() {
      playTone(400, 0.18, "sine", 0.25);
      setTimeout(() => playTone(350, 0.18, "sine", 0.2), 160);
    }

    // ============= Game logic =============
    const cells = Array.from(document.querySelectorAll(".cell"));
    const statusEl = document.getElementById("status");
    const resetBtn = document.getElementById("resetBtn");

    let board = Array(9).fill(null);
    let gameOver = false;
    const HUMAN = "X";
    const AI = "O";

    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    function checkWinner(b) {
      for (const [a, bIdx, c] of winPatterns) {
        if (b[a] && b[a] === b[bIdx] && b[a] === b[c]) {
          return { winner: b[a], line: [a, bIdx, c] };
        }
      }
      if (b.every((v) => v !== null)) {
        return { winner: null, line: null }; // draw
      }
      return null; // game continues
    }

    function updateBoardUI() {
      board.forEach((val, idx) => {
        const cell = cells[idx];
        cell.textContent = val ? val : "";
        cell.classList.remove("X", "O", "winning");
        if (val) cell.classList.add(val);
      });
    }

    function handleCellClick(e) {
      const cell = e.currentTarget;
      const idx = Number(cell.dataset.index);

      if (gameOver) return;
      if (board[idx] !== null) return; // already taken

      // Player move
      board[idx] = HUMAN;
      playClick();
      updateBoardUI();

      const result = checkWinner(board);
      if (result) {
        endGame(result);
        return;
      }

      statusEl.textContent = "Computer's move...";
      // Block clicks while "thinking"
      cells.forEach((c) => (c.style.pointerEvents = "none"));

      setTimeout(() => {
        aiMove();
        cells.forEach((c) => (c.style.pointerEvents = ""));
      }, 400);
    }

    function aiMove() {
      if (gameOver) return;

      // 1. try to win
      let move = findBestMove(AI);
      // 2. if not possible – try to block X
      if (move === null) move = findBestMove(HUMAN);
      // 3. if still nothing – random cell
      if (move === null) {
        const free = board
          .map((v, i) => (v === null ? i : null))
          .filter((v) => v !== null);
        if (free.length > 0) {
          move = free[Math.floor(Math.random() * free.length)];
        }
      }

      if (move !== null) {
        board[move] = AI;
        playClick();
        updateBoardUI();
      }

      const result = checkWinner(board);
      if (result) {
        endGame(result);
      } else {
        statusEl.textContent = "Your move (X)";
      }
    }

    function findBestMove(player) {
      for (const [a, bIdx, c] of winPatterns) {
        const line = [board[a], board[bIdx], board[c]];
        const countPlayer = line.filter((v) => v === player).length;
        const countEmpty = line.filter((v) => v === null).length;
        if (countPlayer === 2 && countEmpty === 1) {
          // return the empty index
          if (board[a] === null) return a;
          if (board[bIdx] === null) return bIdx;
          if (board[c] === null) return c;
        }
      }
      return null;
    }

    function endGame(result) {
      gameOver = true;

      if (result.winner === HUMAN) {
        statusEl.textContent = "You win! 🎉";
        playWin();
      } else if (result.winner === AI) {
        statusEl.textContent = "You lose 😈";
        playLose();
      } else {
        statusEl.textContent = "Draw 🤝";
        playDraw();
      }

      if (result.line) {
        result.line.forEach((idx) => {
          cells[idx].classList.add("winning");
        });
      }
    }

    function resetGame() {
      board = Array(9).fill(null);
      gameOver = false;
      updateBoardUI();
      statusEl.textContent = "Your move (X)";
    }

    cells.forEach((cell) =>
      cell.addEventListener("click", handleCellClick)
    );
    resetBtn.addEventListener("click", resetGame);
  </script>
</body>
</html>
`;