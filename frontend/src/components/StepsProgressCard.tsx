import React from "react";
import { useTutorial } from "../hooks/useTutorial";
import { useGettingStartedSteps } from "../contexts/GettingStartedStepsContext";
import { useGameBuilder } from "../contexts/GameBuilderContext";
import { useLocation } from "react-router";

type GettingStartedActionType = "name" | "description" | "enhance";

interface StepInfo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  active: boolean;
  unlocked: boolean;
  actionType?: GettingStartedActionType;
}

export const StepsProgressCard = () => {
  const { step: tutorialStep, tutorial } = useTutorial();
  const { step: gettingStartedStep } = useGettingStartedSteps();
  const gameBuilder = useGameBuilder();
  const location = useLocation();
  const isOnCreatePage = location.pathname.startsWith("/dashboard/create");
  const hasNamedGame = (gameBuilder.gameName ?? "").trim().length > 0;
  const promptDraft = (gameBuilder.currentGamePrompt ?? "").trim();
  const hasPromptDraft = promptDraft.length > 0;
  const enhanceTriggered = gettingStartedStep > 2;
  const firstActionComplete =
    hasNamedGame && hasPromptDraft && enhanceTriggered;

  console.log(gettingStartedStep, "----2");

  // Define all steps based on tutorial progress
  const getAllSteps = (): StepInfo[] => {
    const steps: StepInfo[] = [];

    // Onboarding steps (only show if tutorial is active)
    if (!tutorial && tutorialStep > 0) {
      steps.push({
        id: 1,
        title: "Navigate to My Games",
        description: "Click on 'My Games' in the sidebar",
        completed: tutorialStep > 1,
        active: tutorialStep === 1,
        unlocked: true,
      });

      steps.push({
        id: 2,
        title: "Start New Game",
        description: "Press 'New Game' button to begin",
        completed: tutorialStep > 1,
        active: tutorialStep === 2,
        unlocked: tutorialStep >= 2,
      });

      steps.push({
        id: 3,
        title: "Fill Game Details",
        description:
          "Enter game name, select model, and describe your game idea",
        completed: tutorialStep > 3,
        active: tutorialStep === 3,
        unlocked: tutorialStep >= 3,
      });

      // Check if enhance was clicked (step 4-5 means enhance was clicked)
      const enhanceClicked = tutorialStep >= 4;
      steps.push({
        id: 4,
        title: "Enhance Prompt",
        description:
          "Click 'Enhance' to optimize your prompt for code generation",
        completed: enhanceClicked,
        active: tutorialStep === 3 || tutorialStep === 4,
        unlocked: tutorialStep >= 3,
      });

      steps.push({
        id: 5,
        title: "Review Enhanced Prompt",
        description: "Edit the enhanced prompt if needed",
        completed: tutorialStep > 6,
        active: tutorialStep === 6,
        unlocked: enhanceClicked || tutorialStep >= 6,
      });

      steps.push({
        id: 6,
        title: "Generate Game",
        description: "Click 'Generate Game' to start code generation",
        completed: tutorialStep > 7,
        active: tutorialStep === 7,
        unlocked:
          tutorialStep >= 7 ||
          (enhanceClicked && gameBuilder.currentGamePrompt !== ""),
      });

      steps.push({
        id: 7,
        title: "Code Generation",
        description: "Watch your game code being generated in real-time",
        completed: tutorialStep > 8 || gameBuilder.gameCode !== "",
        active:
          tutorialStep === 8 || (tutorialStep >= 7 && gameBuilder.chatLock),
        unlocked: tutorialStep >= 7 || gameBuilder.gameCode !== "",
      });

      steps.push({
        id: 8,
        title: "Save Game",
        description: "Click 'Save Game' to add it to your library",
        completed: tutorialStep > 9,
        active: tutorialStep === 9,
        unlocked:
          tutorialStep >= 9 ||
          (gameBuilder.gameCode !== "" && !gameBuilder.chatLock),
      });
    }

    // Getting Started Steps (only show on create page)
    if (isOnCreatePage) {
      const hasEnhancedPrompt =
        gameBuilder.currentGamePrompt !== "" &&
        gameBuilder.currentGamePrompt.length > 100;
      const hasGameCode = gameBuilder.gameCode !== "";
      const formatSubtask = (label: string, done: boolean) =>
        `[${done ? "x" : " "}] ${label}`;

      const gsSteps: StepInfo[] = [
        {
          id: 10,
          title: "Name, Describe & Enhance",
          description: `${formatSubtask("Name", hasNamedGame)} • ${formatSubtask(
            "Description",
            hasPromptDraft
          )} • ${formatSubtask("Enhance", enhanceTriggered)}`,
          completed: firstActionComplete,
          active: !firstActionComplete,
          unlocked: true,
          actionType: "name",
        },
        {
          id: 11,
          title: "Generate Game",
          description: "Click 'Generate Game' to start code generation",
          completed: gettingStartedStep > 3,
          active: firstActionComplete && !hasGameCode,
          unlocked: firstActionComplete,
          actionType: "enhance",
        },
        {
          id: 12,
          title: "Preview Your Game",
          description:
            "Use the Preview tab to play-test and visually inspect your game",
          completed: gettingStartedStep > 4,
          active: gettingStartedStep === 4,
          unlocked: gettingStartedStep >= 4 || hasGameCode,
        },
        {
          id: 13,
          title: "Chat & Iterate",
          description: "Chat with your codebase to make improvements",
          completed: gettingStartedStep > 5,
          active: gettingStartedStep === 5,
          unlocked: gettingStartedStep > 5 || hasGameCode,
        },
        {
          id: 14,
          title: "Review & Save",
          description: "Review your game and save the final changes",
          completed: gettingStartedStep > 6,
          active: gettingStartedStep === 6,
          unlocked: gettingStartedStep >= 6 || hasGameCode,
        },
      ];

      // If we're in tutorial mode, merge with onboarding steps
      if (!tutorial && tutorialStep > 0) {
        // Show onboarding steps first, then getting started steps that are unlocked
        return [...steps, ...gsSteps.filter((s) => s.unlocked)];
      } else {
        return gsSteps;
      }
    }

    return steps;
  };

  const steps = getAllSteps();
  const completedCount = steps.filter((s) => s.completed).length;
  const totalCount = steps.length;
  const progressPercentage =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (steps.length === 0) return null;

  return (
    <div className="relative flex flex-col rounded-2xl border border-white/10 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <h3 className="text-xl font-semibold text-white mb-1">
            Progress Tracker
          </h3>
          <p className="text-sm text-white/60">
            {completedCount} of {totalCount} steps completed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-400">
            {Math.round(progressPercentage)}%
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-white/5 rounded-full overflow-hidden mb-6">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progressPercentage}%` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      </div>

      {/* Steps List */}
      <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 ${
              step.active
                ? "border-fuchsia-400/50 bg-fuchsia-500/10 shadow-lg shadow-fuchsia-500/20"
                : step.completed
                  ? "border-green-500/30 bg-green-500/5"
                  : step.unlocked
                    ? "border-white/10 bg-white/5"
                    : "border-white/5 bg-white/2 opacity-50"
            }`}
          >
            {/* Step Number/Icon */}
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                step.active
                  ? "bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white shadow-lg shadow-fuchsia-500/50"
                  : step.completed
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                    : step.unlocked
                      ? "bg-white/10 text-white/60"
                      : "bg-white/5 text-white/30"
              }`}
            >
              {step.completed ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                index + 1
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1 min-w-0">
              <h4
                className={`font-semibold mb-1 ${
                  step.active
                    ? "text-fuchsia-300"
                    : step.completed
                      ? "text-green-400"
                      : step.unlocked
                        ? "text-white"
                        : "text-white/40"
                }`}
              >
                {step.title}
              </h4>
              <p
                className={`text-sm ${
                  step.active
                    ? "text-white/80"
                    : step.completed
                      ? "text-white/60"
                      : step.unlocked
                        ? "text-white/50"
                        : "text-white/30"
                }`}
              >
                {step.description}
              </p>
            </div>

            {/* Active Indicator */}
            {step.active && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-fuchsia-400 rounded-full animate-pulse shadow-lg shadow-fuchsia-400/50" />
            )}
          </div>
        ))}
      </div>

      {/* Gradient Overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/60 to-transparent pointer-events-none rounded-b-2xl" />
    </div>
  );
};
