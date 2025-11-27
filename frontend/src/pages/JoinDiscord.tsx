import React from "react";
import "../sass/JoinDiscord.scss";
import logo from "../assets/discord-logo.png";
import { useNavigate } from "react-router";
function JoinDiscord() {
  const navigate = useNavigate();

  return (
    <>
      <h1>JOIN THE COMMUNITY</h1>
      <ul className="subtitle">
        <li>Report bugs and help improve the platform</li>
        <li>Share feedback directly with our team</li>
        <li>Chat with fellow developers</li>
      </ul>
      <a className="white-btn discord-btn">
        <img src={logo} className="discord-logo" />
        <div>JOIN THE SERVER</div>
      </a>
      <a className="black-btn discord-btn" onClick={() => navigate("/build")}>
        CONTINUE WITHOUT JOINING
      </a>
    </>
  );
}

export default JoinDiscord;
