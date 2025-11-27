import { useGameBuilder } from "../../contexts/GameBuilderContext";
import { useEffect, useState } from "react";
import type { StepProps } from "./StepOne";
import { useTutorial } from "../../hooks/useTutorial";
import { useNavigate } from "react-router";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

const defaultPrompt = `Of course. Here is the enhanced game prompt for "Tic Tac Toe," transforming the user's simple request into a comprehensive and structured format suitable for the Vibe platform's game generation model.

***

### **Enhanced Game Prompt: Tic Tac Toe**

#### **1. Game Overview**

**Game Title:** Tic Tac Toe

**Concept:** A modern, visually slick, single-player version of the classic Tic-Tac-Toe. The game features a vibrant "neon glow" aesthetic, smooth animations, and satisfying sound effects. The player competes against a simple but competent AI opponent. The goal is to create a quick, replayable, and engaging experience perfect for short breaks on any device.

#### **2. Core Gameplay Mechanics**

*   **Game Board:** A standard 3x3 grid.
*   **Player & AI:** The human player always controls the 'X' mark and always goes first. The AI controls the 'O' mark.
*   **Turns:** Gameplay is turn-based. After the player clicks an empty cell, their 'X' is drawn. The game then pauses briefly (e.g., 500ms) to simulate the AI "thinking" before it places its 'O'.
*   **AI Logic:** The AI should follow a simple, prioritized logic:
    1.  **Winning Move:** If the AI has two marks in a row with an empty third cell, it will place its mark there to win.
    2.  **Blocking Move:** If the player has two marks in a row with an empty third cell, the AI will place its mark there to block the player.
    3.  **Random Move:** If neither of the above conditions is met, the AI will choose a random available cell.
*   **Game Flow:** The game starts immediately with an empty board. It ends when a player wins or the board is full (a draw). A "Play Again" button appears, allowing for instant replay.

#### **3. Visual Style and Theme**

*   **Theme:** "Neon Noir" / "Arcade Glow".
*   **Background:** A solid, very dark navy blue (\`#0a0f1e\`) or black background to make the neon elements pop.
*   **Grid:** The 3x3 grid lines are rendered as bright, glowing cyan lines with a subtle blur effect to simulate a neon light tube.
*   **Player Mark (X):** A vibrant, glowing electric blue 'X'. When placed, it should animate by "drawing" itself onto the board over about 200ms.
*   **AI Mark (O):** A glowing hot pink 'O'. It should also have a 200ms drawing animation when placed.
*   **Winning Line:** When a player wins, a thick, glowing white or yellow line animates, striking through the three winning marks.
*   **UI Elements:** Text (e.g., "You Win!", "Play Again") should use a clean, modern, sans-serif font with a soft glow effect matching the theme.

#### **4. Controls**

*   **Desktop (Mouse):** The player clicks on an empty cell in the grid to place their mark. Clicks on occupied cells or outside the grid are ignored.
*   **Mobile (Touch):** The player taps on an empty cell to place their mark.
*   **Input Handling:** Input should be disabled while the AI is making its move and after the game has ended, until the "Play Again" button is pressed.

#### **5. Game States & UI**

*   **Game Active:** The board is interactive. A subtle text element at the top can indicate "Your Turn."
*   **Game Over (Win/Loss/Draw):**
    *   The board becomes non-interactive.
    *   A prominent message appears over the center of the board: "You Win!", "You Lose!", or "It's a Draw!".
    *   A "Play Again" button appears below the message. Clicking it resets the board and starts a new game.

#### **6. Audio**

*   **Background Music:** A low-volume, looping, ambient synth track to set a relaxed, modern mood.
*   **Sound Effects:**
    *   **Place Mark:** A soft, futuristic "click" or "zap" sound plays when either the player or AI places a mark.
    *   **Win:** An upbeat, shimmering, positive sound effect.
    *   **Lose/Draw:** A more subdued, neutral sound effect.

#### **7. Asset Management (\`window.ASSETS\`)

The game must use the global \`window.ASSETS\` object for all external assets. The object will be initialized with the following keys, all set to \`null\`. The game must be programmed to handle \`null\` values by using procedurally generated fallback assets.

\`\`\`javascript
window.ASSETS = {
  // Audio files
  "backgroundMusic": null,
  "placeMarkSound": null,
  "winSound": null,
  "loseSound": null,

  // Image files (though fallbacks will be canvas-drawn)
  "playerMarkImage": null,
  "aiMarkImage": null
};
\`\`\`

**Fallback Behavior:**

*   **If \`window.ASSETS.backgroundMusic\` is \`null\`:** Use the Web Audio API to generate a simple, looping, low-frequency sine wave sequence.
*   **If \`window.ASSETS.placeMarkSound\` is \`null\`:** Use the Web Audio API to generate a short, sharp click (e.g., a high-frequency wave with rapid decay).
*   **If \`window.ASSETS.winSound\` is \`null\`:** Use the Web Audio API to play a simple rising arpeggio (e.g., C-E-G).
*   **If \`window.ASSETS.loseSound\` is \`null\`:** Use the Web Audio API to play a simple falling arpeggio (e.g., G-E-C).
*   **If \`window.ASSETS.playerMarkImage\` is \`null\`:** The game must procedurally draw the glowing 'X' on the canvas using lines with a shadow/blur effect to create the glow.
*   **If \`window.ASSETS.aiMarkImage\` is \`null\`:** The game must procedurally draw the glowing 'O' on the canvas using an arc with a shadow/blur effect.

#### **8. Technical Implementation Details**

*   **Rendering:** Use the HTML \`<canvas>\` element for all game rendering.
*   **Responsiveness:** The canvas should be dynamically sized to fit the browser window while maintaining a 1:1 aspect ratio. It should be centered both horizontally and vertically. This is critical for a good mobile experience.
*   **Self-Contained:** The entire game (HTML, CSS, and JavaScript) should be contained within a single HTML file. No external dependencies are allowed.`;

export default function StepTwo({ step, onGenerateGame }: StepProps) {
  const gb = useGameBuilder();
  const [localPrompt, setLocalPrompt] = useState<string>(gb.currentGamePrompt);
  const [isTypingPrompt, setIsTypingPrompt] = useState(false);
  const active = step === 2;
  const { tutorial, step: tutorialStep, advanceStep } = useTutorial();
  const [advanceRecordedStep5, setAdvanceRecordedStep5] = useState<boolean>(
    () => {
      if (typeof window === "undefined") return false;
      return window.localStorage.getItem("tutorialStep5Advanced") === "true";
    }
  );
  const [advanceRecorded, setAdvanceRecorded] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("tutorialStep4Advanced") === "true";
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!isTypingPrompt && gb.currentGamePrompt !== localPrompt) {
      setLocalPrompt(gb.currentGamePrompt);
    }
  }, [gb.currentGamePrompt, isTypingPrompt, localPrompt]);

  useEffect(() => {
    // Reset local flag if user is not on step 4 anymore
    if (tutorialStep !== 6 && advanceRecorded) {
      setAdvanceRecorded(false);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("tutorialStep4Advanced");
      }
    }
    // Show overlay immediately if StepOne signaled it
    if (!tutorial && tutorialStep === 6 && typeof window !== "undefined") {
      const pending = window.localStorage.getItem("pendingStep4Overlay");
      if (pending === "true") {
        // Clear the flag and trigger a render
        window.localStorage.removeItem("pendingStep4Overlay");
        setAdvanceRecorded((v) => v);
      }
    }
  }, [tutorial, tutorialStep, advanceRecorded]);

  // Fallback: if we arrive at StepTwo with a pending flag but step hasn't advanced yet, advance now
  useEffect(() => {
    if (!tutorial && typeof window !== "undefined") {
      const pending = window.localStorage.getItem("pendingStep4Overlay");
      if (pending === "true" && tutorialStep < 6) {
        advanceStep();
      }
    }
  }, [tutorial, tutorialStep, advanceStep]);

  const ButtonClick = () => {
    // gb.createGameStream().then(() => {});
    onGenerateGame(true);
    if (typeof window !== "undefined") {
      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      if (isMobile) {
        const el = document.getElementById("app-preview");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }
  };
  return active ? (
    <div className="flex flex-col w-full h-9/10 p-2! rounded-xl border-1 border-zinc-700! relative">
      {!tutorial &&
      (tutorialStep === 7 ||
        tutorialStep === 7 ||
        tutorialStep === 8 ||
        (tutorialStep === 9 && gb.chatLock)) ? (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 pointer-events-none" />
      ) : null}

      <PanelGroup direction="vertical">
        <Panel
          minSize={25}
          defaultSize={50}
          maxSize={76}
          className="flex flex-col w-full"
        >
          <form className="flex flex-col gap-4 w-full">
            <p className="mb-1!">
              Feel free to edit as you see fit. Afterwards, click generate for
              code generation.
            </p>

            {!tutorial && tutorialStep === 9 && gb.chatLock && (
              <div
                className="absolute bottom-[35%] z-99 right-[-15%] flex gap-4"
                style={{
                  transform: `translate(-50%, 0px)`,
                }}
              >
                <div className="flex flex-col justify-center -top-12 relative !p-4 rounded-xl shadow-2xl max-w-100 text-white bg-black/60 backdrop-blur-md border border-gray-400/50">
                  <div className="text-md leading-snug">
                    <span
                      className="ml-1"
                      style={{
                        fontFamily: "Bicyclette",
                      }}
                    >
                      The code generation just started , you can see it live
                      coding , it may take a while, in the meantime hit
                      <span className="ml-1 font-semibold text-fuchsia-400">
                        {" "}
                        "Preview"{" "}
                      </span>
                      to check the UI.
                    </span>
                  </div>
                  <svg
                    className="absolute -right-5 top-1/2 -translate-y-1/2 w-7 h-7 rotate-90"
                    viewBox="0 0 24 12"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 0 C10 4 6 8 3 10 L21 10 C18 8 14 4 12 0 Z"
                      fill="rgba(0,0,0,0.6)"
                      stroke="rgba(156,163,175,0.6)"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            )}

            {!tutorial && tutorialStep === 9 && gb.gameCode && !gb.chatLock && (
              <div
                className="absolute bottom-[-4%] z-99 right-[-18%] flex gap-4"
                style={{
                  transform: `translate(-50%, 0px)`,
                }}
              >
                <div className="flex flex-col justify-center -top-12 relative !p-4 rounded-xl shadow-2xl max-w-100 text-white bg-black/60 backdrop-blur-md border border-gray-400/50">
                  <div className="text-md leading-snug">
                    <span
                      className="ml-1"
                      style={{
                        fontFamily: "Bicyclette",
                      }}
                    >
                      Once you code will be ready , press
                      <span className="ml-1 font-semibold text-fuchsia-400">
                        {" "}
                        "Save"{" "}
                      </span>
                      and now you can add anything to the game by simply adding
                      new prompts in the field.
                    </span>
                  </div>
                  <svg
                    className="absolute -right-5 top-1/2 -translate-y-1/2 w-7 h-7 rotate-90"
                    viewBox="0 0 24 12"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 0 C10 4 6 8 3 10 L21 10 C18 8 14 4 12 0 Z"
                      fill="rgba(0,0,0,0.6)"
                      stroke="rgba(156,163,175,0.6)"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            )}

            <textarea
              className="input-field w-full bg-slate-900/90 p-3! rounded-xl focus:ring-2 focus:ring-fuchsia-300/40 focus:border-transparent"
              rows={30}
              placeholder={gb.currentGamePrompt}
              onFocus={() => setIsTypingPrompt(true)}
              onBlur={() => setIsTypingPrompt(false)}
              onChange={(e) => {
                e.preventDefault();
                setLocalPrompt(e.target.value);
                gb.setGamePrompt(e.target.value);
              }}
              value={defaultPrompt}
            ></textarea>

            <div
              className={`${!tutorial && tutorialStep === 7 ? "relative z-20" : ""}`}
            ></div>
          </form>
        </Panel>
        <PanelResizeHandle className="h-1.5 bg-zinc-700/60 hover:bg-pink-300/40 cursor-col-resize rounded transition-colors duration-100" />
        <Panel>
          <div className="flex flex-col items-center justify-center mt-5! gap-5">
            <button
              className={`white-black-btn btn-full ${
                !tutorial && tutorialStep === 7
                  ? "animate-pulse ring-2 !ring-fuchsia-400/70 !shadow-[0_0_28px_rgba(217,70,239,0.55)]"
                  : ""
              }`}
              onClick={() => {
                // if (!advanceRecorded && !tutorial && tutorialStep === 7) {
                //   advanceStep();
                //   setAdvanceRecorded(true);
                //   if (typeof window !== "undefined") {
                //     window.localStorage.setItem(
                //       "tutorialStep4Advanced",
                //       "true"
                //     );
                //   }
                // }
                ButtonClick();
              }}
              type="button"
            >
              Generate Game
            </button>
            <p>Save your game to your library once you're happy with it</p>
            <div
              className={`${!tutorial && tutorialStep === 9 && gb.gameCode && !gb.chatLock ? "relative z-20" : ""}`}
            >
              <button
                type="button"
                className={`rainbow-btn w-full`}
                onClick={async () => navigate("/dashboard/games")}
              >
                Save Game
              </button>
            </div>

            {!tutorial &&
              (tutorialStep === 7 ||
                tutorialStep === 7 ||
                (tutorialStep === 8 && gb.gameCode && !gb.chatLock)) && (
                <>
                  <div
                    className="absolute bottom-[35%] z-99 left-[50%] flex gap-4"
                    style={{
                      transform: `translate(-50%, 0px)`,
                    }}
                  >
                    <div className="flex flex-col justify-center -top-12 relative !p-4 rounded-xl shadow-2xl max-w-100 text-white bg-black/60 backdrop-blur-md border border-gray-400/50">
                      <div className="text-md leading-snug">
                        <span
                          className="ml-1"
                          style={{
                            fontFamily: "Bicyclette",
                          }}
                        >
                          Click here and GameGPT will start making your idea
                          come true!
                        </span>
                      </div>
                      <svg
                        className="absolute left-1/2 -translate-x-1/2 -top-5 w-7 h-7"
                        viewBox="0 0 24 12"
                        aria-hidden="true"
                      >
                        <path
                          d="M12 0 C10 4 6 8 3 10 L21 10 C18 8 14 4 12 0 Z"
                          fill="rgba(0,0,0,0.6)"
                          stroke="rgba(156,163,175,0.6)"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                </>
              )}

            {!tutorial && tutorialStep === 9 && gb.gameCode && !gb.chatLock && (
              <>
                <div
                  className="absolute bottom-[16%] z-99 right-auto flex gap-4"
                  style={{
                    transform: `translate(0%, 0px)`,
                  }}
                >
                  <div className="flex flex-col justify-center -top-12 relative !p-4 rounded-xl shadow-2xl max-w-100 text-white bg-black/60 backdrop-blur-md border border-gray-400/50">
                    <div className="text-md leading-snug">
                      <span
                        className="ml-1"
                        style={{
                          fontFamily: "Bicyclette",
                        }}
                      >
                        Click here button to save the game
                      </span>
                    </div>
                    <svg
                      className="absolute left-1/2 -translate-x-1/2 -top-5 w-7 h-7"
                      viewBox="0 0 24 12"
                      aria-hidden="true"
                    >
                      <path
                        d="M12 0 C10 4 6 8 3 10 L21 10 C18 8 14 4 12 0 Z"
                        fill="rgba(0,0,0,0.6)"
                        stroke="rgba(156,163,175,0.6)"
                        strokeWidth="1"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
              </>
            )}
          </div>
        </Panel>
      </PanelGroup>
    </div>
  ) : null;
}
