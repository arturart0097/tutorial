import { DashboardCard } from "./Dashboard/DashboardCard";
import profile_icon from "../assets/profile.png";
import "../sass/ProfileCard.scss";

export function Tag({ title, color }) {
  return (
    <div className={`tag ${color}`}>
      <div className={`tag-circle ${color}`}></div>
      <div className="tag-title">{title}</div>
    </div>
  );
}

export function ProfileCard() {
  return (
    <DashboardCard>
      <div className="profile-card">
        <h1>Dashboard</h1>
        <div className="profile-user">
          <div>
            <img src={profile_icon} className="profile-card-icon" />
          </div>
          <div>
            <div>User</div>
            <div className="profile-tags">
              <Tag title={"TOP-20"} color="violet" />
              <Tag title={"ROLE"} color="gray" />
              <Tag title={"TAG"} color="gray" />
            </div>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}
