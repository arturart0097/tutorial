import { useGameBuilder } from "../../contexts/GameBuilderContext";
import IntegrationChecklistItem from "../Dashboard/Integration";
import SectionCard from "../Dashboard/SectionCard";
import { FileUpload } from "../FileUpload";
import type { StepProps } from "./StepOne";
import toast from "react-hot-toast";
import { useState } from "react";

export default function StepFour({ step }: StepProps) {
  const gb = useGameBuilder();
  const [expandedSection, setExpandedSection] = useState(0);
  const collapseToggle = (section: number) => {
    if (section === expandedSection) {
      setExpandedSection(0);
      return;
    }
    setExpandedSection(section);
  };

  const onThumbnailUpload = (files: FileList) => {
    if (files.length > 1) {
      toast.error("Please select only one thumbnail");
      return;
    }

    gb.setGameThumbnail(files[0]);
  };

  const onPreviewUpload = (files: FileList) => {
    if (files.length > 1) {
      toast.error("Please select only one preview video");
      return;
    }

    gb.setGamePreview(files[0]);
  };
  const active = step === 4;

  return active ? (
    <div className="flex flex-col w-full h-9/10! gap-8 overflow-auto! text-sm!  p-3! rounded-xl border-1 border-zinc-700!">
      <SectionCard
        title="Integrate with GameGPT"
        collapsed={expandedSection !== 1}
        onCollapseToggle={() => collapseToggle(1)}
      >
        <div className="text-2xl">
          Click on the Game Preview Tab and play your game. This checklist will
          automatically update as events are triggered.
        </div>
        <IntegrationChecklistItem
          title="Ready Check ('ready' event)"
          subtitle={gb.gameSDKChecklist.ready.message}
          verified={gb.gameSDKChecklist.ready.completed}
          completed={gb.gameSDKChecklist.ready.completed}
        />
        <IntegrationChecklistItem
          title="Score Reported ('game_over' event)"
          subtitle={gb.gameSDKChecklist.score.message}
          verified={gb.gameSDKChecklist.score.completed}
          completed={gb.gameSDKChecklist.score.completed}
        />
        <IntegrationChecklistItem
          title="Play again implemented ('play_again' handler)"
          subtitle={gb.gameSDKChecklist.play_again.message}
          verified={gb.gameSDKChecklist.play_again.completed}
          completed={gb.gameSDKChecklist.play_again.completed}
        />
        <IntegrationChecklistItem
          title="Wagering implemented ('wager' handler)"
          subtitle={gb.gameSDKChecklist.wager.message}
          verified={gb.gameSDKChecklist.wager.completed}
          completed={gb.gameSDKChecklist.wager.completed}
        >
          No contract is called during game development.
        </IntegrationChecklistItem>
        <div className="warning-message">
          Important: Please manually verify that the “Play Again” button appears
          after game over and correctly restarts your game when clicked.
        </div>
      </SectionCard>
      <SectionCard
        title="Game Details"
        collapsed={expandedSection !== 2}
        onCollapseToggle={() => collapseToggle(2)}
      >
        <IntegrationChecklistItem
          title="Capture Gameplay Video"
          subtitle="Click the video icon to capture a gameplay video (preview tab)"
          completed={false}
          verified={false}
        />
        <IntegrationChecklistItem
          title="Create a Game Thumbnail"
          subtitle="Create a game icon for your game (preview tab)"
          completed={false}
          verified={false}
        >
          <form>
            <FileUpload
              name="Upload Thumbnail"
              className="white-black-btn"
              onFilesSelect={onThumbnailUpload}
            />
          </form>
        </IntegrationChecklistItem>
        {/* <IntegrationChecklistItem
          title="Create a Game Preview"
          subtitle="Create a game icon for your game (preview tab)"
          completed={false}
          verified={false}
        >
          <form>
            <FileUpload
              name="Upload Preview"
              className="white-black-btn"
              onFilesSelect={onPreviewUpload}
            />
          </form>
        </IntegrationChecklistItem> */}
      </SectionCard>
    </div>
  ) : null;
}
