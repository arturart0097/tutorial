/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import qr_icon from "../../assets/qr_code.svg";
import reload_icon from "../../assets/reload.svg";
import { useEffect, useRef, useState } from "react";
import { useGameBuilder } from "../../contexts/GameBuilderContext";
import "../../sass/AppPreview.scss";
import toast from "react-hot-toast";
import { createGameGPTHost } from "../../lib/sdkHost";
import { GameGPTSDK } from "../../lib/sdkClient";
import { useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";
import { sendWager } from "../../lib/wager";
import "../../sass/AppPreview.scss";
import { normalizeCodeBlock } from "./CodeEditor";

interface GameFrameWindow extends Window {
  GameGPTSDK: InstanceType<typeof GameGPTSDK>;
  ASSETS: Record<string, HTMLImageElement>;
  ASSET_KEYS: string[];
  ASSETS_LOADED: boolean;
}

export const defaultCode = `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8" />
  <title>Tic Tac Toe з SFX</title>
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
      background: radial-gradient(circle at top, #1a2a6c, #000);
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
    <div class="status" id="status">Твій хід (X)</div>

    <div class="board" id="board">
      <!-- 9 клітинок -->
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

    <button id="resetBtn">Зіграти ще раз</button>
    <div class="hint">Ти – X, компʼютер – O</div>
  </div>

  <script>
    // ============= SFX через Web Audio =============
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
      // коротке "арпеджіо"
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

    // ============= Логіка гри =============
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
        return { winner: null, line: null }; // нічия
      }
      return null; // гра триває
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
      if (board[idx] !== null) return; // вже зайнято

      // Хід гравця
      board[idx] = HUMAN;
      playClick();
      updateBoardUI();

      const result = checkWinner(board);
      if (result) {
        endGame(result);
        return;
      }

      statusEl.textContent = "Хід компʼютера...";
      // Блокуємо кліки під час "думання"
      cells.forEach((c) => (c.style.pointerEvents = "none"));

      setTimeout(() => {
        aiMove();
        cells.forEach((c) => (c.style.pointerEvents = ""));
      }, 400);
    }

    function aiMove() {
      if (gameOver) return;

      // 1. спроба виграти
      let move = findBestMove(AI);
      // 2. якщо нема – спроба заблокувати X
      if (move === null) move = findBestMove(HUMAN);
      // 3. якщо і тут нічого – рандом
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
        statusEl.textContent = "Твій хід (X)";
      }
    }

    function findBestMove(player) {
      for (const [a, bIdx, c] of winPatterns) {
        const line = [board[a], board[bIdx], board[c]];
        const countPlayer = line.filter((v) => v === player).length;
        const countEmpty = line.filter((v) => v === null).length;
        if (countPlayer === 2 && countEmpty === 1) {
          // повертаємо порожній індекс
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
        statusEl.textContent = "Ти переміг! 🎉";
        playWin();
      } else if (result.winner === AI) {
        statusEl.textContent = "Ти програв 😈";
        playLose();
      } else {
        statusEl.textContent = "Нічия 🤝";
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
      statusEl.textContent = "Твій хід (X)";
    }

    cells.forEach((cell) =>
      cell.addEventListener("click", handleCellClick)
    );
    resetBtn.addEventListener("click", resetGame);
  </script>
</body>
</html>
`;

export default function GamePreview({ generate }) {
  const {
    gameCode,
    gameAssetMap,
    setGameAssetMap,
    setGameSDKChecklist,
    gameName,
  } = useGameBuilder();
  const [iframeKey, setIFrameKey] = useState(0);
  const gameIFrameRef = useRef<HTMLIFrameElement>(null);
  const sdkHost = createGameGPTHost();
  const sdkLoaded = useRef(false);
  const { wallets } = useWallets();

  const onGameWindowReload = () => {
    sdkLoaded.current = false;
    setIFrameKey((prev) => prev + 1);
  };

  const onWagerEvent = async () => {
    if (!wallets.length) {
      toast.error("No wallets");
      return;
    }

    const wallet = wallets[0];
    const provider = await wallet.getEthereumProvider();
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    return await sendWager(signer, gameName);
  };

  const processAssetFiles = async (
    files: Record<string, File | string>
  ): Promise<void> => {
    const iframeWindow = gameIFrameRef.current
      ?.contentWindow as GameFrameWindow | null;
    if (!iframeWindow) return;

    console.log("Processing asset files (with onload)");

    const entries = await Promise.all(
      Object.entries(files).map(
        ([key, image]) =>
          new Promise<[string, HTMLImageElement | null]>((resolve) => {
            if (!image) {
              console.log(`Skipping ${key} - no image`);
              resolve([key, null]);
              return;
            }

            const img = new (iframeWindow as any).Image();

            img.onload = () => {
              console.log(`Loaded image: ${key}`);
              resolve([key, img]);
            };

            img.onerror = (err) => {
              console.warn(`Failed to load image: ${key}`, err);
              resolve([key, null]); // don't blow up everything for one bad asset
            };

            if (typeof image === "string") {
              img.src = image;
            } else {
              img.src = URL.createObjectURL(image);
            }
          })
      )
    );

    iframeWindow.ASSETS = {};
    for (const [key, img] of entries) {
      if (img) {
        iframeWindow.ASSETS[key] = img;
      }
    }

    iframeWindow.ASSETS_LOADED = true;
    iframeWindow.dispatchEvent(new Event("assets-ready"));
    console.log("🎨 All assets loaded & assets-ready dispatched");
  };

  useEffect(() => {
    if (gameIFrameRef.current && !sdkLoaded.current) {
      const IFrameWindow = gameIFrameRef.current
        .contentWindow as GameFrameWindow;

      IFrameWindow.GameGPTSDK = new GameGPTSDK();
      IFrameWindow.ASSETS = {};
      IFrameWindow.ASSETS_LOADED = false;
      sdkHost.connectTo(IFrameWindow);

      sdkHost.onEvent("ready", () => {
        setGameSDKChecklist((prev) => ({
          ...prev,
          ready: {
            ...prev.ready,
            completed: true,
            message: "Received Ready Event",
          },
        }));
      });

      sdkHost.onEvent("game_over", (data) => {
        setGameSDKChecklist((prev) => ({
          ...prev,
          score: {
            ...prev.score,
            completed: true,
            message: `Received Score: ${(data as any).score}`,
          },
        }));
      });

      sdkHost.onEvent("wager", () => {
        setGameSDKChecklist((prev) => ({
          ...prev,
          wager: {
            ...prev.wager,
            completed: true,
            message: `Received Wager Event`,
          },
        }));
      });

      sdkHost.onEvent("play_again", () => {
        setGameSDKChecklist((prev) => ({
          ...prev,
          play_again: {
            ...prev.play_again,
            completed: true,
            message: `Received Play Again Event`,
          },
        }));
      });

      sdkLoaded.current = true;
    }

    const handleIframeLoad = async () => {
      const IFrameWindow = gameIFrameRef.current!
        .contentWindow as GameFrameWindow;
      const IFrameDocument = gameIFrameRef.current!.contentDocument!;
      if (IFrameDocument.readyState !== "complete") return;

      console.log("Iframe loaded, processing assets...");
      await processAssetFiles(gameAssetMap);

      if (IFrameWindow.ASSET_KEYS) {
        const contextKeys = Object.keys(gameAssetMap);
        if (
          JSON.stringify(IFrameWindow.ASSET_KEYS) !==
          JSON.stringify(contextKeys)
        ) {
          console.log("Updating asset keys");
          const newAssetMap: Record<string, File | string> = {};
          IFrameWindow.ASSET_KEYS.forEach((key) => {
            if (gameAssetMap[key]) {
              newAssetMap[key] = gameAssetMap[key];
            } else {
              newAssetMap[key] = null;
            }
          });
          setGameAssetMap(newAssetMap);
        }
      }
    };

    gameIFrameRef.current?.addEventListener("load", handleIframeLoad);

    return () => {
      sdkHost.resetHost();
      sdkLoaded.current = false;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameIFrameRef, iframeKey]);

  return (
    <div className="flex flex-col w-full items-center max-h-144 mt-3!">
      <div className="flex status-bar w-full justify-between h-12!">
        <div className="action-btn h-8! justify-center! items-center">
          <img src={qr_icon} />
          Mobile
        </div>
        <div className="title">
          <div>GameGPT</div>
          <div>Mini App</div>
        </div>
        <a
          href="#"
          className="action-btn  h-8! justify-center! items-center"
          onClick={onGameWindowReload}
        >
          <img src={reload_icon} />
          Reload
        </a>
      </div>

      <div className={`flex w-full h-screen`}>
        <iframe
          key={iframeKey}
          id="gameCanvas"
          ref={gameIFrameRef}
          srcDoc={generate && defaultCode}
          className="flex w-full! h-140"
          sandbox="allow-scripts allow-same-origin"
          title="Game Preview"
        />
      </div>
    </div>
  );
}
