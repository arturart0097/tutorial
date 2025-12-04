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
  const [codeAnimationKey, setCodeAnimationKey] = useState(0);

  const handleGenerateGame = () => {
    gameBuilder.showCodegenTooltip();
    setGenerate(true);
    setCodeAnimationKey((key) => key + 1);
  };

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
    <div className="flex flex-col w-full bg-blue-800/10 p-2!">
      <ul className="flex justify-between font-semibold text-xl [font-family:'Tachyon_W00_Light'] text-zinc-300! border-b border-zinc-600 pb-[15px]! mb-2!">
        <li>
          Dashboard &gt;{" "}
          {gameBuilder.gameName ? gameBuilder.gameName : "Untitled Game"}
        </li>

        {!tutorial && (
          <div className="flex flex-col gap-2">
        
          </div>
        )}
      </ul>
      {/* Mobile layout: stack Steps above AppPreview */}
      <div className="flex md:hidden w-full h-full flex-col gap-3">
        <Steps onGenerateGame={handleGenerateGame} generate={generate} />
        <AppPreview generate={generate} codeAnimationKey={codeAnimationKey} />
      </div>

      {/* Desktop/tablet layout: horizontal resizable panels */}
      <div className="hidden md:flex w-full h-full">
        <PanelGroup direction="horizontal">
          <Panel minSize={25} className="mr-3!">
            <Steps onGenerateGame={handleGenerateGame} generate={generate} />
          </Panel>
          <PanelResizeHandle className="w-1.5 bg-zinc-700/60 hover:bg-pink-300/40 cursor-col-resize rounded transition-colors duration-100" />
          <Panel minSize={40} defaultSize={45}>
            <AppPreview generate={generate} codeAnimationKey={codeAnimationKey} />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
