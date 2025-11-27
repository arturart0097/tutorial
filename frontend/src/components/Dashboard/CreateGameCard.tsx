import { DashboardCard } from "./DashboardCard";
import "../sass/CreateGameCard.scss";

function CreateGameCard() {
  return (
    <DashboardCard>
      <div className="create-game-card">
        <h2>Create New Game</h2>
        <a href="/create" className="rainbow-btn">
          Start a new Project
        </a>
      </div>
    </DashboardCard>
  );
}
export default CreateGameCard;
