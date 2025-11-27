import AppPreview from "../AppPreview/AppPreview";
import { useGameBuilder } from "../../contexts/GameBuilderContext";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Steps from "../GettingStarted/Steps";
import { useTutorial } from "../../hooks/useTutorial";
import { useState } from "react";

export default function CreateGame() {
  const gameBuilder = useGameBuilder();
  const { step: tutorialStep, tutorial } = useTutorial();

  const [generate, setGenerate] = useState(false);

  const items = [
    "Dashboard",
    "Game idea",
    "Generate game",
    "Chat with your code base",
    "Final details",
  ];
  // Map tutorial steps (our onboarding flow) to progress index (0..4)
  const activeIndex = (() => {
    if (tutorialStep >= 9) return 4; // Finalize/save
    if (tutorialStep >= 9) return 3; // Chat / iterate
    if (tutorialStep >= 4) return 2; // Generate
    if (tutorialStep >= 3) return 1; // Fill idea form
    return 0; // Dashboard
  })();

  return (
    <div className="flex flex-col w-full bg-blue-800/10 p-4!">
      <ul className="flex justify-between font-semibold text-xl [font-family:'Tachyon_W00_Light'] text-zinc-300! border-b border-zinc-600 pb-2! mb-2!">
        <li>
          Dashboard &gt;{" "}
          {gameBuilder.gameName ? gameBuilder.gameName : "Untitled Game"}
        </li>

        {!tutorial && (
          <div className="flex flex-col gap-2">
            <ul className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-medium [font-family:'Tachyon_W00_Light']">
              {items.map((label, idx) => {
                const isActive = idx === activeIndex;
                const isCompleted = idx < activeIndex;
                const circleBase =
                  "flex items-center justify-center w-6 h-6 sm:w-6 sm:h-6 rounded-full border";
                const circleColors = isActive
                  ? "bg-indigo-500 border-indigo-400 text-white shadow-[0_0_0_3px_rgba(99,102,241,0.35)]"
                  : isCompleted
                    ? "bg-emerald-500 border-emerald-400 text-white"
                    : "bg-zinc-800 border-zinc-700 text-zinc-300";
                const labelColor = isActive
                  ? "text-white"
                  : isCompleted
                    ? "text-zinc-200"
                    : "text-zinc-400";
                const connectorColor = isCompleted
                  ? "bg-gradient-to-r from-emerald-500/80 to-indigo-500/80"
                  : idx < activeIndex
                    ? "bg-indigo-500/60"
                    : "bg-zinc-700";
                return (
                  <li key={label} className="flex items-center gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div
                        className={`${circleBase} ${circleColors}`}
                        aria-current={isActive ? "step" : undefined}
                      >
                        {isCompleted ? (
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              d="M5 13l4 4L19 7"
                              stroke="currentColor"
                              strokeWidth="2"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          <span className="text-[10px] sm:text-xs">
                            {idx + 1}
                          </span>
                        )}
                      </div>
                      <span className={`${labelColor}`}>{label}</span>
                    </div>
                    {idx < items.length - 1 && (
                      <div
                        className={`h-[4px] sm:h-[3px] w-10 sm:w-10 rounded ${connectorColor}`}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </ul>
      {/* Mobile layout: stack Steps above AppPreview */}
      <div className="flex md:hidden w-full h-full flex-col gap-3">
        <Steps onGenerateGame={() => setGenerate(true)} />
        <AppPreview generate={generate} />
      </div>

      {/* Desktop/tablet layout: horizontal resizable panels */}
      <div className="hidden md:flex w-full h-full">
        <PanelGroup direction="horizontal">
          <Panel minSize={25} className="mr-3!">
            <Steps onGenerateGame={() => setGenerate(true)} />
          </Panel>
          <PanelResizeHandle className="w-1.5 bg-zinc-700/60 hover:bg-pink-300/40 cursor-col-resize rounded transition-colors duration-100" />
          <Panel minSize={40} defaultSize={45}>
            <AppPreview generate={generate} />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
