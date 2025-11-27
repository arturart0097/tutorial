import { useState } from "react";
import { useGameBuilder } from "../../contexts/GameBuilderContext";
import { EditorPane, DownloadButton, RefreshButton } from "./CodeEditor";
import GamePreview from "./GamePreview";
import AssetsTab from "./AssetsTab";
import TabRow from "./PreviewTabs";
import { ChatBoxFloat } from "../Chat";
import { useTutorial } from "../../hooks/useTutorial";

function AppPreview({ generate }) {
  const [activeTab, setActiveTab] = useState<number>(1);
  const { gameCode, setGameCode, createGameStream, gameId } = useGameBuilder();

  const { tutorial, step } = useTutorial();

  console.log(generate)

  const reactiveStyle =
    "w-full! md:w-full! max-w-full! md:max-w-180! pl-3! py-1!";

  return (
    <>
      <div
        id="app-preview"
        className={`flex flex-col overflow-auto h-auto md:h-95/100 ${reactiveStyle} items-center md:border-l border-slate-900 relative`}
      >
        {!tutorial &&
          (step === 3 ||
            step === 4 ||
            step === 5 ||
            step === 6 ||
            step === 7) && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 pointer-events-auto" />
          )}

        {!tutorial && step === 3 && (
          <div
            className="absolute top-[50%] left-[50%] z-90 flex gap-4 w-100"
            style={{
              transform: `translate( -75%, -50%)`,
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
                  Let's give the cool name to your future game! It can be
                  something simple like
                  <span className="ml-1 font-semibold text-fuchsia-400">
                    {" "}
                    "Car game"{" "}
                  </span>
                  or something more intriguing like
                  <span className="ml-1 font-semibold text-fuchsia-400">
                    {" "}
                    "Super Kombat 3000"
                  </span>
                  . One you name it , select the model that will enhance your
                  prompt and finally let the creative minds flow! Describe what
                  game idea you have in mind and follow to the Step 2.
                </span>
              </div>
              <svg
                className="absolute -left-5.5 top-1/2 -translate-y-1/2 w-7 h-7"
                viewBox="0 0 12 24"
                aria-hidden="true"
              >
                <path
                  d="M12 4 Q4 8 0 12 Q4 16 12 20 Z"
                  fill="rgba(0,0,0,0.6)"
                  stroke="rgba(156,163,175,0.6)"
                  strokeWidth="1"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        )}

        <TabRow activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === 2 ? (
          <GamePreview generate={generate} />
        ) : activeTab == 1 ? (
          <div className="flex flex-col items-center w-full gap-3 mt-3!">
            <EditorPane generate={generate} gameCode={gameCode} setGameCode={setGameCode} />

            <div className="flex w-full justify-start gap-2">
              <DownloadButton gameCode={gameCode} />
              <RefreshButton
                createGameStream={createGameStream}
                gameCode={gameCode}
              />
            </div>

            <ChatBoxFloat gameId={gameId} setGameCode={setGameCode} />
          </div>
        ) : activeTab == 3 ? (
          <AssetsTab />
        ) : null}
      </div>
    </>
  );
}

export default AppPreview;
