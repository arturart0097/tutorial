import React from "react";
import stars from "../assets/stars-icon.png";
import rewards from "../assets/trophy-cup.png";
import graph from "../assets/graph.png";
import rocket from "../assets/rocket.png";

import telegram from "../assets/telegram.png";
import gpt_logo from "../assets/logo-icon.png";
import blue_circle from "../assets/blue-circle.png";

import "../sass/StartBuilding.scss";
import { useNavigate } from "react-router";
function Card({ icon, title, description, icons = [] }) {
  return (
    <>
      <div className="card">
        <div className="card-icon-wrapper">
          <img src={icon} />
        </div>
        <div className="card-body">
          <h2 className="card-title">{title}</h2>
          <div className="card-description">{description}</div>
          <div className="card-socials">
            {icons
              ? icons.map((v) => <img src={v} className="card-social-icon" />)
              : null}
          </div>
        </div>
      </div>
    </>
  );
}

function StartBuilding() {
  const navigate = useNavigate();

  return (
    <>
      <h1>BUILD GREAT GAMES, EARN REWARDS</h1>
      <h3>Build great games and earn rewards along the way</h3>
      <div className="card-grid">
        <Card
          icon={stars}
          title="AI POWERED CREATION"
          description="With AI tools, GameGPT turns anyone into a game developer"
        />
        <Card
          icon={rewards}
          title="REWARDS"
          description="The more people play your game, the more rewards you earn"
        />
        <Card
          icon={graph}
          title="ANALYTICS & SUPPORT"
          description="Track player engagement & performance metrics with 24/7 developer support"
        />
        <Card
          icon={rocket}
          title="ONE-CLICK DEPLOY"
          description="Deploy instantly to Telegram, GameGPT Library, and more! "
          icons={[telegram, gpt_logo, blue_circle]}
        />
      </div>
      <a href="#" className="rainbow-btn" onClick={() => navigate("/create")}>
        Start Building
      </a>
    </>
  );
}

export default StartBuilding;
