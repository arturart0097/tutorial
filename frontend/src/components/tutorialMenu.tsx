import step1 from "../assets/step1.gif";
import step3 from "../assets/step3.gif";
import step4 from "../assets/step4.gif";
import step5 from "../assets/step5.gif";
import { useGettingStartedSteps } from "../contexts/GettingStartedStepsContext";

const stepVideos = {
  1: step1,
  2: step3,
  3: step4,
  4: step4,
  5: step5,
  6: step5,
};

const stepDescriptions: Record<number, { title: string; body: string }> = {
  1: {
    title: "Step 1 · Name & Describe",
    body: "Give your game a clear title and draft a short description of the experience you want to build. This helps the LLM understand your creative direction from the very beginning.",
  },
  2: {
    title: "Step 2 · Enhance Your Prompt",
    body: "Use the Enhance action to expand your idea into a structured prompt that’s ready for code generation. Review the output and adjust any details you want refined.",
  },
  3: {
    title: "Step 3 · Generate Code",
    body: "Kick off code generation and watch the editor animate as the project scaffold is created. Stay on this step until the base version of your game is ready.",
  },
  4: {
    title: "Step 4 · Preview & Test",
    body: "Open the Preview tab and interact with the game. Make sure the core mechanics, visuals, and overall vibe feel right before moving on.",
  },
  5: {
    title: "Step 5 · Chat & Iterate",
    body: "Use the chat panel to request tweaks, new features, or polish. Each message updates the code so you can iterate quickly without leaving the builder.",
  },
  6: {
    title: "Step 6 · Review & Save",
    body: "Once you’re happy, save the project to your library. You can always return later to iterate further or integrate assets before publishing.",
  },
};

export const TutorialMenu = () => {
  const { step } = useGettingStartedSteps();
  const { title, body } =
    stepDescriptions[step] ?? {
      title: "Keep Going!",
      body: "Follow the guided steps to bring your idea to life. Each milestone unlocks new tooling in the builder.",
    };

  return (
    <div className="min-w-[300px] !mt-3 !px-3">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-white/80 text-sm leading-relaxed">{body}</p>

      <video
        key={step}
        src={stepVideos[step]}
        autoPlay
        muted
        loop
        style={{ width: "100%", maxWidth: "600px", marginTop: "30px" }}
      />
    </div>
  );
};
