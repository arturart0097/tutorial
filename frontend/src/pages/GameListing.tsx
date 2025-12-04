import { useEffect, useState } from "react";
import { listProject, type Project } from "../lib/apiClient";
import { useGameBuilder } from "../contexts/GameBuilderContext";
import { useNavigate } from "react-router";
import { deleteProject } from "../lib/apiClient";
import { useTutorial } from "../hooks/useTutorial";
import { useGettingStartedSteps } from "../contexts/GettingStartedStepsContext";

function GameCard({ title, description, thumbnailUrl, id }) {
  const navigate = useNavigate();
  const { initialize } = useGameBuilder();
  const PLACEHOLDER = "/VibeThumbnail.png";
  let thumbnail = thumbnailUrl;
  if (
    !thumbnail ||
    thumbnail === "" ||
    thumbnail === "https://placehold.co/960x540"
  ) {
    thumbnail = PLACEHOLDER;
  }
  return (
    <div className="group relative w-full overflow-hidden rounded-2xl border border-zinc-600">
      <img
        src={thumbnail}
        alt={title}
        className="w-full h-[190px] lg:h-[200px] object-cover transition-opacity duration-500 group-hover:opacity-50"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      <div className="absolute bottom-3 left-3 opacity-0 transition-opacity duration-500 group-hover:opacity-100 text-white drop-shadow text-xs sm:text-sm">
        <h3>{title}</h3>
        <div>{description}</div>
        <div>Last updated a day ago</div>
      </div>
      <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <button className="rounded-lg px-3! py-1.5! shadow-md bg-gradient-to-br from-lime-200 to-lime-500 text-black text-xs font-semibold hover:cursor-pointer">
          <i className="fa-solid fa-upload" />
          &nbsp;Publish
        </button>
        <button
          className="rounded-xl px-3! py-2! shadow-lg bg-gradient-to-br from-pink-400 via-fuchsia-500 to-indigo-500 text-white hover:cursor-pointer"
          onClick={async () => {
            await initialize(id);
            navigate(`/dashboard/create`);
          }}
        >
          <i className="fa-solid fa-pen-to-square"></i>
        </button>
        <button
          className="rounded-xl px-3! py-2! shadow-lg bg-rose-500 text-white hover:cursor-pointer"
          onClick={async () => {
            if (!window.confirm("Are you sure you want to delete this game?"))
              return;
            try {
              await deleteProject(id);
              alert("Game deleted successfully");
              window.location.reload();
            } catch (err) {
              console.error(err);
              alert("Failed to delete game");
            }
          }}
        >
          <i className="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  );
}

function GameListing() {
  const [projects, setProjects] = useState<Project[]>([]);
  const { tutorial, step, advanceStep, skipTutorial } = useTutorial();
  const { setStep } = useGettingStartedSteps();
  const [showCongrats, setShowCongrats] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("onboardingCongrats") === "1";
  });
  const { step: gettingStartedStep, setStep: setGettingStartedStep } =
    useGettingStartedSteps();
  const navigate = useNavigate();
  const IMAGE_ENDPOINT = import.meta.env.VITE_IMAGE_ENDPOINT;

  const highlight = (!tutorial && step === 2) || step === 3;

  useEffect(() => {
    const fetchGames = async () => {
      setProjects(await listProject());
    };

    fetchGames();
    if (typeof window === "undefined") return;
    const flag = window.localStorage.getItem("onboardingCongrats") === "1";
    if (flag) setShowCongrats(true);
  }, []);

  useEffect(() => {
    const logging = async () => {
      for (const project of projects) {
        if (project.thumbnail) {
          console.log(IMAGE_ENDPOINT + "/" + project.thumbnail);
        }
      }
    };
    logging();
  }, [projects, IMAGE_ENDPOINT]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const onboardingStep = window.localStorage.getItem("onboardingStep");
      if (onboardingStep === "completed") {
        skipTutorial();
      }
    }
  }, [skipTutorial]);

  console.log(gettingStartedStep);
  return (
    <div className="flex w-full p-3! h-full min-h-screen flex-col bg-blue-800/10 [font-family:'Tachyon_W00_Light'] ">
      {showCongrats && (
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" />
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="relative w-full max-w-lg">
              <div
                className="absolute -inset-[2px] rounded-3xl bg-gradient-to-r from-fuchsia-500/40 via-purple-500/40 to-indigo-500/40 blur opacity-70"
                aria-hidden="true"
              />
              <div className="flex flex-col gap-5 relative !p-8 rounded-3xl border border-white/10 bg-gradient-to-b from-black/70 to-black/60 text-white shadow-2xl backdrop-blur-xl sm:p-8">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div
                      className="absolute inset-0 rounded-full bg-fuchsia-500/30 blur-xl"
                      aria-hidden="true"
                    />
                    <span className="relative w-16 h-16 flex items-center justify-center text-4xl">
                      🎉
                    </span>
                  </div>
                </div>
                <div className="mt-4 text-2xl sm:text-3xl font-semibold text-center tracking-tight">
                  Congratulations!
                </div>
                <div className="mt-2 text-center text-white/90 text-sm sm:text-base">
                  You have just created your first game, you can access it by
                  clicking on it, or you can create another game.
                </div>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-1 gap-3">
                  <button
                    className="inline-flex items-center justify-center gap-2 px-5 !py-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 active:opacity-90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black text-white font-medium"
                    onClick={() => {
                      setShowCongrats(false);
                      if (typeof window !== "undefined") {
                        window.localStorage.removeItem("onboardingCongrats");
                        window.localStorage.setItem(
                          "onboardingStep",
                          "completed"
                        );
                        window.dispatchEvent(
                          new CustomEvent("onboardingStepChange", { detail: 0 })
                        );
                      }
                      skipTutorial();
                      window.location.reload();
                    }}
                  >
                    <span> Finish Tutorial </span>
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M5 12h14M13 5l7 7-7 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
                <div className="mt-4 text-center text-xs text-white/60">
                  You can always start the tutorial later from the dashboard.
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      <div className="flex flex-col gap-4!">
        <div>
          <h1>Your Game Library</h1>
          <p>Games you create will appear here</p>
        </div>
        <div className="relative">
          <div
            className={`${(!tutorial && step === 3) || step === 2 ? "relative z-[60]" : ""}`}
          >
            <button
              type="button"
              className={`white-black-btn btn-full ${
                true
                  ? "ring-2 !ring-fuchsia-400/70 !shadow-[0_0_28px_rgba(217,70,239,0.55)] animate-pulse"
                  : ""
              }`}
              onClick={() => {
                // Перемикаємо локальний майстер GettingStarted на крок 2
                setGettingStartedStep(2);
                navigate("/dashboard/create");
              }}
            >
              <i className="fa-solid fa-plus"></i> &nbsp; New Game
            </button>
          </div>
        </div>
      </div>

      {/* <div className="mt-4! grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((p) => (
          <GameCard
            key={p.id}
            title={p.title}
            description={"Game Description"}
            thumbnailUrl={
              p.thumbnail
                ? IMAGE_ENDPOINT + "/" + p.thumbnail
                : "https://placehold.co/960x540"
            }
            id={p.id}
          />
        ))}
      </div> */}
    </div>
  );
}

export default GameListing;
