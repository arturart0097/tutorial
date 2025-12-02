import { useState } from "react";
import { GameModel } from "../../contexts/GameBuilderContext";
import { useGameBuilder } from "../../contexts/GameBuilderContext";
import { useTutorial } from "../../hooks/useTutorial";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { useGettingStartedSteps } from "../../contexts/GettingStartedStepsContext";

export interface StepProps {
  step: number;
  setStep?: (step: number) => void;
  onGenerateGame?: () => void;
  generate?: boolean;
}

export default function StepOne({ step, setStep }: StepProps) {
  const gb = useGameBuilder();
  const [titleInteracted, setTitleInteracted] = useState(false);
  const [modelInteracted, setModelInteracted] = useState(false);
  const [promptInteracted, setPromptInteracted] = useState(false);
  const targetText = "Tic tac toe";
  const [userInput, setUserInput] = useState(gb.gameName || "");
  const targetPromptText = "Create a Tic tac toe game";
  const [userPromptInput, setUserPromptInput] = useState(
    gb.currentGamePrompt ?? ""
  );
  const { step: gettingStartedStep, setStep: setGettingStartedStep } =
    useGettingStartedSteps();

  const active = step === 1;

  const { step: currentStep, advanceStep, tutorial } = useTutorial();

  // Кнопка Enhance активується тільки коли користувач повністю ввів цільові рядки (без урахування регістру)
  const isNameComplete =
    userInput.trim().toLowerCase() === targetText.toLowerCase();
  const isPromptComplete =
    userPromptInput.trim().toLowerCase() === targetPromptText.toLowerCase();
  const canEnhance = isNameComplete && isPromptComplete;

  const UpgradePrompt = async () => {
    console.log("UpgradePrompt");
    setStep?.(2);
    if (gettingStartedStep < 3) {
      setGettingStartedStep(3);
    }
  };

  return active ? (
    <div className="flex flex-col w-full h-9/10 gap-6 p-2! rounded-xl border-1 border-zinc-700! ">
      <div className="flex flex-col gap-3">
        <div>Name Your Game!</div>
        <div className="flex w-full justify-between">
          <div className="relative w-9/12">
            <input
              className={`theme-field w-full relative z-10 ${
                !tutorial && currentStep === 3 && !titleInteracted
                  ? "ring-2 !ring-fuchsia-400/70 !shadow-[0_0_28px_rgba(217,70,239,0.55)] animate-pulse"
                  : ""
              }`}
              type="text"
              placeholder=""
              value={userInput}
              onFocus={(e) => {
                setTitleInteracted(true);
                if (userInput === "") {
                  e.target.setSelectionRange(0, 0);
                }
              }}
              onKeyDown={(e) => {
                const currentIndex = userInput.length;
                const nextChar = targetText[currentIndex];

                // Allow backspace
                if (e.key === "Backspace") {
                  setUserInput((prev) => {
                    const newInput = prev.slice(0, -1);
                    gb.setGameName(newInput);
                    return newInput;
                  });
                  return;
                }

                // Allow delete
                if (e.key === "Delete") {
                  return;
                }

                // Allow arrow keys and other navigation
                if (
                  e.key.startsWith("Arrow") ||
                  e.key === "Home" ||
                  e.key === "End"
                ) {
                  return;
                }

                // Prevent default for other keys if we've reached the end
                if (currentIndex >= targetText.length) {
                  e.preventDefault();
                  return;
                }

                // Check if the pressed key matches the next character
                if (e.key.length === 1) {
                  const isCorrect =
                    e.key.toLowerCase() === nextChar.toLowerCase();

                  if (isCorrect) {
                    const newInput = userInput + e.key;
                    setUserInput(newInput);
                    gb.setGameName(newInput);
                  } else {
                    // Prevent incorrect character from being entered
                    e.preventDefault();
                  }
                }
              }}
              onChange={(e) => {
                // This is handled in onKeyDown, but keeping for safety
                setTitleInteracted(true);
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none flex items-center z-0 px-4"
              style={{
                paddingTop: "0.75rem",
                paddingBottom: "0.75rem",
                paddingLeft: "1rem",
                paddingRight: "1rem",
                fontFamily: '"Tachyon W00 Regular"',
                fontSize: "14pt",
                lineHeight: "inherit",
              }}
            >
              <span>
                {targetText.split("").map((char, index) => {
                  const isTyped = index < userInput.length;
                  const isCorrect =
                    isTyped &&
                    userInput[index].toLowerCase() === char.toLowerCase();
                  return (
                    <span
                      key={index}
                      className={
                        isTyped
                          ? isCorrect
                            ? "text-transparent"
                            : "text-red-400/60"
                          : "text-gray-400/50"
                      }
                    >
                      {char}
                    </span>
                  );
                })}
              </span>
            </div>
          </div>
          <select
            onChange={(e) => {
              setModelInteracted(true);
              gb.setGameModel(e.target.value as unknown as GameModel);
            }}
            className={`theme-select ${
              !tutorial && currentStep === 3 && !modelInteracted
                ? "ring-2 !ring-fuchsia-400/70 !shadow-[0_0_28px_rgba(217,70,239,0.55)] animate-pulse"
                : ""
            }`}
          >
            <option value={GameModel.GEMINI}>GEMINI</option>
            <option value={GameModel.CLAUDE}>CLAUDE</option>
            <option value={GameModel.GROK}>GROK</option>
          </select>
        </div>
      </div>

      <PanelGroup direction="vertical">
        <Panel
          minSize={25}
          defaultSize={50}
          maxSize={90}
          className="flex flex-col w-full"
        >
          <form className="form-container flex flex-col w-full items-center gap-4">
            <p>
              Describe your game and enhance for an LLM prompt better suited for
              code generation
            </p>

            <div className="relative w-full h-full">
              <textarea
                className={`theme-textarea flex w-full h-full relative z-10 ${
                  !tutorial && currentStep === 3 && !promptInteracted
                    ? "ring-2 !ring-fuchsia-400/70 !shadow-[0_0_28px_rgba(217,70,239,0.55)] animate-pulse"
                    : ""
                }`}
                placeholder=""
                rows={40}
                value={userPromptInput}
                onFocus={() => {
                  setPromptInteracted(true);
                }}
                onKeyDown={(e) => {
                  const currentIndex = userPromptInput.length;
                  const nextChar = targetPromptText[currentIndex];

                  // Allow backspace
                  if (e.key === "Backspace") {
                    setUserPromptInput((prev) => {
                      const newInput = prev.slice(0, -1);
                      gb.setGamePrompt(newInput);
                      return newInput;
                    });
                    return;
                  }

                  // Allow delete
                  if (e.key === "Delete") {
                    return;
                  }

                  // Allow arrow keys and other navigation
                  if (
                    e.key.startsWith("Arrow") ||
                    e.key === "Home" ||
                    e.key === "End"
                  ) {
                    return;
                  }

                  // Prevent default for other keys if we've reached the end
                  if (currentIndex >= targetPromptText.length) {
                    e.preventDefault();
                    return;
                  }

                  // Check if the pressed key matches the next character
                  if (e.key.length === 1) {
                    const isCorrect =
                      e.key.toLowerCase() === nextChar.toLowerCase();

                    if (isCorrect) {
                      const newInput = userPromptInput + e.key;
                      setUserPromptInput(newInput);
                      gb.setGamePrompt(newInput);
                    } else {
                      // Prevent incorrect character from being entered
                      e.preventDefault();
                    }
                  }
                }}
                onChange={(e) => {
                  // This is handled in onKeyDown, but keeping for safety
                  setPromptInteracted(true);
                }}
              ></textarea>
              <div
                className="absolute inset-0 pointer-events-none z-0 whitespace-pre-wrap break-words overflow-hidden"
                style={{
                  paddingTop: "0.75rem",
                  paddingBottom: "0.75rem",
                  paddingLeft: "1rem",
                  paddingRight: "1rem",
                  fontFamily: '"Tachyon W00 Regular"',
                  fontSize: "14pt",
                  lineHeight: "1.4",
                }}
              >
                <span>
                  {targetPromptText.split("").map((char, index) => {
                    const isTyped = index < userPromptInput.length;
                    const isCorrect =
                      isTyped &&
                      userPromptInput[index].toLowerCase() ===
                        char.toLowerCase();
                    return (
                      <span
                        key={index}
                        className={
                          isTyped
                            ? isCorrect
                              ? "text-transparent"
                              : "text-red-400/60"
                            : "text-gray-400/50"
                        }
                      >
                        {char}
                      </span>
                    );
                  })}
                </span>
              </div>
            </div>
          </form>
        </Panel>
        <PanelResizeHandle className="h-1.5 bg-zinc-700/60 hover:bg-pink-300/40 cursor-col-resize rounded transition-colors duration-100" />
        <Panel className="flex justify-center items-start h-10 mt-4!">
          <button
            className={`rainbow-btn ${
              currentStep === 3 ? "animate-pulse" : ""
            } ${!canEnhance ? "opacity-60 cursor-not-allowed" : ""}`}
            type="button"
            onClick={async () => {
              if (!canEnhance) return;
              await UpgradePrompt();
            }}
            disabled={!canEnhance}
          >
            Enhance
          </button>
        </Panel>
      </PanelGroup>

      {!tutorial && currentStep === 3 && (
        <>
          <div
            className="absolute bottom-[5%] left-[50%] flex gap-4"
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
                  Once you ready with your idea, click
                  <span className="ml-1 font-semibold text-fuchsia-400">
                    {" "}
                    "Enhance"{" "}
                  </span>
                  so the prompt can be enhanced and structured for the future
                  code generation. You can always go through it and make your
                  amendments!{" "}
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

      {currentStep === 4 ||
        (currentStep === 5 && (
          <>
            <div
              className="absolute bottom-[5%] z-99 right-[0%] flex gap-4"
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
                    Once you are done, hit the arrow below and let's jump to the
                    most exciting part!
                  </span>
                </div>
                <svg
                  className="absolute right-2 -bottom-5 w-7 h-7 rotate-180"
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
        ))}
    </div>
  ) : null;
}
