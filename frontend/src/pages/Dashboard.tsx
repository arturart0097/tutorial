import React, { useEffect, useState } from "react";
import "../sass/Dashboard.scss";
// import { Sidebar } from "../components/Sidebar";
import NewSidebar from "../components/NewSidebar";
import Preview from "../components/Dashboard/Preview";
import { Routes, Route, useNavigate, useLocation } from "react-router";
import { usePrivy } from "@privy-io/react-auth";
import "../sass/IntroVideoCard.scss";
import GameListing from "./GameListing";
import CreateGame from "../components/Dashboard/CreateGame";
import { useTutorial } from "../hooks/useTutorial";
import rocket from "../assets/rocket.png";

function Dashboard() {
  const { ready, authenticated } = usePrivy();
  const { tutorial, step, advanceStep, showIntro, showOverlay, startTutorial, skipTutorial } = useTutorial();
  const location = useLocation();

  const navigate = useNavigate();

  useEffect(() => {
    if (!ready) return;
    if (!authenticated) {
      navigate("/");
      return;
    }
  }, [ready, authenticated, navigate]);

  // Ensure step 2 -> 3 progression when user navigates to create page
  useEffect(() => {
    if (!tutorial && step === 2 && location.pathname.startsWith("/dashboard/create")) {
      // Guard against double-increment in React StrictMode by using a one-time flag
      const key = "advancedStep2To3OnCreate";
      const alreadyAdvanced = typeof window !== "undefined" && window.localStorage.getItem(key) === "true";
      if (!alreadyAdvanced) {
        if (typeof window !== "undefined") window.localStorage.setItem(key, "true");
        advanceStep();
      }
    } else {
      // Reset the guard when we are not exactly at step 2 on the create route
      if (typeof window !== "undefined") window.localStorage.removeItem("advancedStep2To3OnCreate");
    }
  }, [tutorial, step, location.pathname, advanceStep]);

  // Ensure step 1 -> 2 progression when user lands on My Games route
  useEffect(() => {
    if (!tutorial && step === 1 && location.pathname.startsWith("/dashboard/games")) {
      const key = "advancedStep1To2OnGames";
      const alreadyAdvanced = typeof window !== "undefined" && window.localStorage.getItem(key) === "true";
      if (!alreadyAdvanced) {
        if (typeof window !== "undefined") window.localStorage.setItem(key, "true");
        advanceStep();
      }
    } else {
      if (typeof window !== "undefined") window.localStorage.removeItem("advancedStep1To2OnGames");
    }
  }, [tutorial, step, location.pathname, advanceStep]);

  const [uiStep, setUiStep] = useState<number>(step);

  // Mirror step locally and listen to cross-tab events so UI updates instantly
  useEffect(() => {
    setUiStep(step);
    const handle = (e: Event) => {
      const ce = e as CustomEvent<number>;
      if (typeof ce.detail === "number") setUiStep(ce.detail);
    };
    window.addEventListener("onboardingStepChange", handle as EventListener);
    const handleStorage = () => {
      const raw = window.localStorage.getItem("onboardingStep");
      const value = raw && raw !== "completed" ? parseInt(raw, 10) : NaN;
      if (Number.isFinite(value)) setUiStep(value as number);
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("onboardingStepChange", handle as EventListener);
      window.removeEventListener("storage", handleStorage);
    };
  }, [step]);

  const renderOverlay = () => {
    if (!showOverlay) return null;
    const onCreate = location.pathname.startsWith("/dashboard/create");

    if (!onCreate && (uiStep === 1)) {
      const target = `"My Games"`;
      return (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 pointer-events-auto" />
          <div className="absolute top-[21%] left-[12%] ml-3 -translate-y-1/2 z-[9999] flex gap-4">
            <div className="h-14 flex flex-col justify-center -top-7 relative !p-6 rounded-xl shadow-2xl max-w-72 text-white bg-black/60 backdrop-blur-md border border-gray-400/50">
              <div className="text-md leading-snug">Click on
                <span className="ml-1 font-semibold text-fuchsia-400"> {target} </span>
                br so we can start
              </div>
              {/* <div className="mt-1 text-[12px] text-white/80">Створіть свою першу гру</div> */}
              <svg className="absolute -left-5.5 top-1/2 -translate-y-1/2 w-7 h-7" viewBox="0 0 12 24" aria-hidden="true">
                <path
                  d="M12 4 Q4 8 0 12 Q4 16 12 20 Z"
                  fill="rgba(0,0,0,0.6)"
                  stroke="rgba(156,163,175,0.6)"
                  strokeWidth="1"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </>
      );
    }

    if (!onCreate && (uiStep === 2 || uiStep === 3)) {
      const onGames = location.pathname.startsWith("/dashboard/games");
      const target = uiStep === 3 || onGames ? "Here" : "Here";
      return (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 pointer-events-auto" />
          <div className="absolute top-[22%] left-[50%] ml-3 z-[9999] flex gap-4" style={{
            transform: `translate(12px, 0px)`
          }}>
            <div className="h-14 flex flex-col justify-center -top-7 relative !p-6 rounded-xl shadow-2xl max-w-72 text-white bg-black/60 backdrop-blur-md border border-gray-400/50">
              <div className="text-md leading-snug">Press New Game to <br /> kick off the magic!
              </div>
              {/* <div className="mt-1 text-[12px] text-white/80">Створіть свою першу гру</div> */}
              <svg className="absolute left-1/2 -translate-x-1/2 -top-5 w-7 h-7" viewBox="0 0 24 12" aria-hidden="true">
                <path
                  d="M12 0 C10 4 6 8 3 10 L21 10 C18 8 14 4 12 0 Z"
                  fill="rgba(0,0,0,0.6)"
                  stroke="rgba(156,163,175,0.6)"
                  strokeWidth="1"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </>
      );
    }

    return null;
  };

  const renderIntroModal = () => {
    if (!showIntro) return null;
    return (
      <>
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" />
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg">
            <div className="absolute -inset-[2px] rounded-3xl bg-gradient-to-r from-fuchsia-500/40 via-purple-500/40 to-indigo-500/40 blur opacity-70" aria-hidden="true" />
            <div className="flex flex-col gap-5 relative !p-8 rounded-3xl border border-white/10 bg-gradient-to-b from-black/70 to-black/60 text-white shadow-2xl backdrop-blur-xl sm:p-8">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-fuchsia-500/30 blur-xl" aria-hidden="true" />
                  <img src={rocket} alt="Rocket" className="relative w-16 h-16 drop-shadow-xl" />
                </div>
              </div>
              <div className="mt-4 text-2xl sm:text-3xl font-semibold text-center tracking-tight">Hey, looks like you are new here!</div>
              <div className="mt-2 text-center text-white/90 text-sm sm:text-base">Let's create your first game together!</div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  className="inline-flex items-center justify-center gap-2 px-5 !py-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 active:opacity-90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black text-white font-medium"
                  type="button"
                  onClick={startTutorial}
                >
                  <span>Let's Go</span>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button
                  className="inline-flex items-center justify-center px-5 !py-2 rounded-xl bg-white/5 hover:bg-white/10 active:opacity-90 transition border border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black text-white font-medium"
                  type="button"
                  onClick={skipTutorial}
                >
                  Skip
                </button>
              </div>
              <div className="mt-4 text-center text-xs text-white/60">You can always start the tutorial later from the dashboard.</div>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="dashboard relative">
      <div className="flex flex-col sticky top-0 h-screen! shrink-0 z-50">
        <NewSidebar />
      </div>
      {renderIntroModal()}
      {renderOverlay()}

      <div className="main">
        <Routes>
          <Route path="/" element={<Preview />} />
          <Route path="/games" element={<GameListing />} />
          <Route path="/create" element={<CreateGame />} />
        </Routes>
      </div>
    </div>
  );
}

export default Dashboard;

