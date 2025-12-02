"use client";
import { ThemeButton } from "../Buttons";
import { useState } from "react";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import StepThree from "./StepThree";
import StepFour from "./StepIntegration";
import { hoverGradient } from "../Buttons";
import { useTutorial } from "../../hooks/useTutorial";

interface StepProps {
  step: number;
  activeStep: number;
}

const StepPill = ({ step, activeStep }: StepProps) => {
  const active = step === activeStep;
  const bgStyle = active ? "bg-pink-500" : "bg-slate-600";
  return <div className={`flex rounded-full h-2 w-10 ${bgStyle}`}></div>;
};

interface NavProps {
  step: number;
  setStep?: (step: number) => void;
}

const StepNav = ({ step, setStep }: NavProps) => {
  const Navigate = (stepCount: number) => {
    const newStep = (step += stepCount);
    if (newStep > 4 || newStep < 1) return;
    setStep(newStep);
  };
  const { step: currentStep, advanceStep } = useTutorial();

  const active = `text-center bg-slate-400/20! rounded-full ${hoverGradient} hover:cursor-pointer transition-colors duration-300`;
  const inactive = "hover:cursor-not-allowed! bg-slate-900 rounded-full";
  const leftStyle = step > 1 ? active : inactive;
  const rightStyle = step < 4 ? active : inactive;

  const shouldGuideNext = currentStep === 4 || currentStep === 5;
  const animatePulse = shouldGuideNext
    ? "animate-pulse ring-2 ring-pink-400/70 shadow-[0_0_28px_rgba(217,70,239,0.55)] "
    : "";

  return (
    <div className="flex absolute bottom-0 inset-x-0 z-50 justify-between items-center">
      <div className={`${leftStyle}`}>
        <ThemeButton
          hover="hover:cursor-default"
          padding="py-2! px-4!"
        >
          &lt;
        </ThemeButton>
      </div>

      <div className="flex items-center justify-center gap-1">
        <StepPill step={step} activeStep={1} />
        <StepPill step={step} activeStep={2} />
        <StepPill step={step} activeStep={3} />
        <StepPill step={step} activeStep={4} />
      </div>

      <div className={`relative ${rightStyle} ${animatePulse}`}>
        <ThemeButton
          hover="null"
          padding="py-2! px-4!"
        >
          &gt;
        </ThemeButton>
      </div>
    </div>
  );
};

export default function Steps({ onGenerateGame, generate }: { onGenerateGame: () => void, generate: boolean }) {
  const [step, setStep] = useState<number>(1);
  return (
    <div className="flex relative flex-col w-full h-[90vh] justify-between [font-family:'Tachyon_W00_Light'] overflow-y-auto!">
      <StepOne step={step} setStep={setStep} />
      <StepTwo step={step} onGenerateGame={onGenerateGame} generate={generate} />
      <StepThree step={step} />
      <StepFour step={step} />
      <StepNav step={step} setStep={setStep} />
    </div>
  );
}
