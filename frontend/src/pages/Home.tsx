import React from "react";
import "../sass/Home.scss";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router";
function Home() {
  const navigate = useNavigate();
  return (
    <>
      <img src={logo} className="logo" />
      <h1>
        <span style={{ color: "#2E5AF6" }}>AI</span> Game Studio
      </h1>
      <h3>A new way to create and play games</h3>
      <a href="#" className="rainbow-btn" onClick={() => navigate("/discord")}>
        Start
      </a>
    </>
  );
}

export default Home;
