import { type GameEventTypes } from "./sdkEvents";

type EventCallback<T = any> = (data: T) => void;
interface ErrorEventData {
  message: string;
  source?: string;
  lineno?: number;
  colno?: number;
  error?: any;
}

export class GameGPTSDK {
  private target: Window | null = null;
  private eventListeners = new Map<GameEventTypes, Set<EventCallback>>();
  public isClient: boolean;

  constructor() {
    this.isClient = typeof window !== "undefined";
    this.target = this.isClient ? window.parent : null;

    if (this.isClient) {
      window.addEventListener("message", this.handleMessage);
      window.addEventListener("error", this.handleGlobalError);
      window.addEventListener(
        "unhandledrejection",
        this.handleUnhandledRejection,
      );
    }
  }

  public ready(): void {
    this.sendMessage("ready");
  }

  public wager(): void {
    this.sendMessage("wager");
  }

  public gameOver(score: number): void {
    this.sendMessage("game_over", { score });
  }

  public playAgain(): void {
    this.sendMessage("play_again");
  }

  public hapticFeedback(): void {
    this.sendMessage("haptic_feedback");
  }

  public reportError(errorData: any): void {
    this.sendMessage("error", errorData);
  }

  private emit<T = object>(eventType: GameEventTypes, data?: T): void {
    this.eventListeners.get(eventType)?.forEach((cb) => cb(data));
  }

  private handleMessage = (event: MessageEvent): void => {
    if (event.data?.type !== "game_event") return;
    const { type, data } = event.data.event as {
      type: GameEventTypes;
      data?: object;
    };
    this.emit(type, data);
  };

  private handleGlobalError = (event: ErrorEvent): void => {
    const payload: ErrorEventData = {
      message: event.message || "Unknown error",
      source: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: (event as any).error,
    };
    this.sendMessage("error", payload);
  };

  private handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
    const error =
      event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason));
    this.sendMessage("error", { message: error.message, error });
  };

  private sendMessage(type: GameEventTypes, data?: any): void {
    if (!this.isClient || !this.target) return;
    const gameEvent = { type: "game_event", event: { type, data } };
    this.target.postMessage(gameEvent, "*");
  }
}
