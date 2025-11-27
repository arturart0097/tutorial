import { useState } from "react";
import { GameModel } from "../../contexts/GameBuilderContext";
import { useGameBuilder } from "../../contexts/GameBuilderContext";
import { useTutorial } from "../../hooks/useTutorial";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

export interface StepProps {
  step: number;
  setStep?: (step: number) => void;
  onGenerateGame?: (bool: boolean) => void;
}

export default function StepOne({ step, setStep }: StepProps) {
  const gb = useGameBuilder();
  const [promptDraft, setPromptDraft] = useState(gb.currentGamePrompt ?? "");
  const [titleInteracted, setTitleInteracted] = useState(false);
  const [modelInteracted, setModelInteracted] = useState(false);
  const [promptInteracted, setPromptInteracted] = useState(false);

  const active = step === 1;

  const { step: currentStep, advanceStep, tutorial } = useTutorial();

  const UpgradePrompt = async () => {
    console.log("UpgradePrompt");
    setStep?.(2);
  };

  return active ? (
    <div className="flex flex-col w-full h-9/10 gap-6 p-2! rounded-xl border-1 border-zinc-700! ">
      <div className="flex flex-col gap-3">
        <div>Name Your Game!</div>
        <div className="flex w-full justify-between">
          <input
            className={`theme-field w-9/12 ${
              !tutorial && currentStep === 3 && !titleInteracted
                ? "ring-2 !ring-fuchsia-400/70 !shadow-[0_0_28px_rgba(217,70,239,0.55)] animate-pulse"
                : ""
            }`}
            type="text"
            placeholder="Game Title"
            value={"Tic tac toe"}
            onChange={(e) => {
              setTitleInteracted(true);
              gb.setGameName(e.target.value);
            }}
          />
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

            <textarea
              className={`theme-textarea flex w-full h-full ${
                !tutorial && currentStep === 3 && !promptInteracted
                  ? "ring-2 !ring-fuchsia-400/70 !shadow-[0_0_28px_rgba(217,70,239,0.55)] animate-pulse"
                  : ""
              }`}
              placeholder="Describe your game…"
              rows={40}
              onChange={(e) => {
                e.preventDefault();
                setPromptInteracted(true);
                setPromptDraft(e.target.value);
              }}
              value={"Create a Tic tac toe game"}
            ></textarea>
          </form>
        </Panel>
        <PanelResizeHandle className="h-1.5 bg-zinc-700/60 hover:bg-pink-300/40 cursor-col-resize rounded transition-colors duration-100" />
        <Panel className="flex justify-center items-start h-10 mt-4!">
          <button
            className={`rainbow-btn ${currentStep === 3 ? "animate-pulse" : ""}`}
            type="button"
            onClick={async () => {
              await UpgradePrompt();
            }}
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
