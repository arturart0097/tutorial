interface PreviewTabProps {
  label: string;
  index: number;
  activeTab: number;
  setActiveTab: (index: number) => void;
}

const PreviewTab = ({
  label,
  index,
  activeTab,
  setActiveTab,
}: PreviewTabProps) => {
  const isActive = activeTab === index;
  return (
    <button
      type="button"
      onClick={() => setActiveTab(index)}
      className={`preview-tab ${isActive ? "active" : ""}`}
      aria-pressed={isActive}
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
