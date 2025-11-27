import check_icon from "../../assets/checked.png";
import unchecked_icon from "../../assets/unchecked.png";

interface IntegrationChecklistItemProps {
  title: string;
  subtitle: string;
  verified: boolean;
  completed: boolean;
  children?: React.ReactNode;
}

export default function IntegrationChecklistItem({
  title,
  subtitle,
  verified,
  completed,
  children = null,
}: IntegrationChecklistItemProps) {
  return (
    <div className="integration-checklist-item">
      <div className="title-bar">
        {completed ? (
          <img src={check_icon} className="icon" />
        ) : (
          <img src={unchecked_icon} className="icon" />
        )}
        <div className="body">
          <div className="title">{title}</div>
          <div className="subtitle">{subtitle}</div>
        </div>
        {verified ? <div className="verified-icon">VERIFIED</div> : null}
      </div>
      {children}
    </div>
  );
}
