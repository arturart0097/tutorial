import React, { useEffect } from "react";
import "../sass/Lander.scss";
import Home from "./Home";
import JoinDiscord from "./JoinDiscord";
import StartBuilding from "./StartBuiliding";
import { Route, Routes, useLocation, useNavigate } from "react-router";
import CreateGame from "./CreateGame";
import { usePrivy } from "@privy-io/react-auth";

function BreadcrumbBullet({ x, y, matchPath }) {
  const location = useLocation();
  const navigate = useNavigate();
  return location.pathname == matchPath ? (
    <rect
      x={x}
      y={y}
      width="12"
      height="12"
      rx="6"
      fill="#FF4056"
      onClick={() => navigate(matchPath)}
    />
  ) : (
    <rect
      x={x}
      y={y}
      width="9.6"
      height="9.6"
      rx="4.8"
      fill="#CDCDCD"
      onClick={() => navigate(matchPath)}
    />
  );
}

function Lander() {
  const { ready, authenticated } = usePrivy();
  const navigate = useNavigate();
  useEffect(() => {
    if (!ready) return;

    if (!authenticated) return;

    navigate("/dashboard");
  }, [authenticated]);

  return (
    <div className="lander-wrapper">
      <svg
        width="61"
        height="13"
        viewBox="0 0 61 13"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <BreadcrumbBullet x="49" y="1" matchPath="/build" />
        <BreadcrumbBullet x="26" y="2" matchPath="/discord" />
        <BreadcrumbBullet x="2" y="2" matchPath="/" />

        {/* <rect x="49" y="1" width="12" height="12" rx="6" fill="#FF4056" /> */}
        {/* <rect x="26" y="2" width="9.6" height="9.6" rx="4.8" fill="#CDCDCD" />
        <rect x="2" y="2" width="9.6" height="9.6" rx="4.8" fill="#CDCDCD" /> */}
      </svg>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/discord" element={<JoinDiscord />} />
        <Route path="/build" element={<StartBuilding />} />
        <Route path="/create/*" element={<CreateGame />} />
      </Routes>
    </div>
  );
}

export default Lander;
