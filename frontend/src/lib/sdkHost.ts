import { type GameEventTypes } from "./sdkEvents";
interface GameEvent {
  type: GameEventTypes;
  data: object;
}

interface GameEventMessage {
  type: "game_event";
  event: GameEvent;
}

interface GameGPTHost {
  onEvent(type: GameEventTypes, handler: (data: object) => void): void;
  sendEvent(type: GameEventTypes, data?: object): void;
  connectTo(frameWindow: Window): void;
  clearEventHandlers(type: GameEventTypes): void;
  resetHost(): void;
}

// --- Implementation ---
export function createGameGPTHost(): GameGPTHost {
  const eventHandlers: Map<GameEventTypes, (data: object) => void> = new Map();
  let gameWindow: Window | null = null;

  function handleMessage(event: MessageEvent) {
    const msg = event.data as GameEventMessage;
    if (msg?.type !== "game_event") return;

    const { type, data } = msg.event;
    const handler = eventHandlers.get(type);

    if (handler) handler(data);
  }

  function clearEventHandlers(type: GameEventTypes) {
    eventHandlers.delete(type);
  }

  function resetHost() {
    for (const eventType of eventHandlers.keys()) {
      clearEventHandlers(eventType);
    }
  }

  function onEvent(type: GameEventTypes, handler: (data: object) => void) {
    eventHandlers.set(type, handler);
  }

  function sendEvent(type: GameEventTypes, data?: object) {
    if (!gameWindow) {
      console.warn("Game window not connected");
      return;
    }
    const message: GameEventMessage = {
      type: "game_event",
      event: { type, data },
    };
    gameWindow.postMessage(message, "*");
  }

  function connectTo(frameWindow: Window) {
    gameWindow = frameWindow;
  }

  window.addEventListener("message", handleMessage);

  return { onEvent, sendEvent, connectTo, clearEventHandlers, resetHost };
}
