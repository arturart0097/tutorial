import { useGettingStartedSteps } from "../../contexts/GettingStartedStepsContext";

interface PreviewTabProps {
  label: string;
  index: number;
  activeTab: number;
  setActiveTab: (index: number) => void;
  step?: boolean;
}

const PreviewTab = ({
  label,
  index,
  activeTab,
  setActiveTab,
  step,
}: PreviewTabProps) => {
  const isActive = activeTab === index;
  const { step: stepTutorial, setStep } = useGettingStartedSteps();

  return (
    <button
      type="button"
      onClick={() => {
        setActiveTab(index);
        stepTutorial === 6 ? "" : step && setStep(5);
      }}
      className={`preview-tab ${isActive ? "active" : ""}`}
      aria-pressed={isActive}
      disabled={stepTutorial < 4}
    >
      {label}
    </button>
  );
};

interface TabRowProps {
  activeTab: number;
  setActiveTab: (index: number) => void;
}

export default function TabRow({ activeTab, setActiveTab }: TabRowProps) {
  return (
    <div id="tabs" className="preview-tabs">
      <PreviewTab
        label="Code"
        index={1}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <PreviewTab
        label="Preview"
        index={2}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        step
      />
      <PreviewTab
        label="Assets"
        index={3}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}
