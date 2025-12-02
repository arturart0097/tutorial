import { ProfileCard } from "../ProfileCard";
import { AnnoucementCard } from "../AnnoucementsCard";
import { DashboardCard } from "./DashboardCard";
import discord_logo from "../../assets/discord-logo.png";
import "../../sass/DiscordCard.scss";
import "../../sass/Dashboard.scss";
import "../../sass/WhitepaperCard.scss";
import { useTutorial } from "../../hooks/useTutorial";
import { Rating } from "../Rating";

function CardRow({ children, className = "" }) {
  return (
    <div
      className={`card-row grid w-full gap-6 grid-cols-1 md:grid-cols-2 items-start ${className}`}
    >
      {children}
    </div>
  );
}

function DiscordCard() {
  return (
    <DashboardCard>
      <div className="discord-card !min-h-[300px]">
        <h1>Discord</h1>
        <div>Talk with other GameGPT users in Discord</div>
        <div className="cta-wrap">
          <button className="btn-full white-btn cta" disabled>
            <img src={discord_logo} className="discord-logo" style={{ width: "22px" }} />
            Join Discord
          </button>
        </div>
      </div>
    </DashboardCard>
  );
}

function WhitepaperCard() {
  return (
    <DashboardCard>
      <div className="whitepaper-card !min-h-[300px]">
        <h1>White Paper</h1>
        <div>
          Read our whitepaper to learn about all the benefits of building your
          game with GameGPT
        </div>
        <div className="cta-wrap">
          <button className="btn-full white-btn cta" disabled>
            <i className="fa-solid fa-book"></i> &nbsp; Read
          </button>
        </div>
      </div>
    </DashboardCard>
  );
}

function IntroVideoCard() {
  const { openIntro } = useTutorial();
  return (
    <DashboardCard>
      <div className="intro-video-card !min-h-[311px]">
        <h1>Tutorial</h1>
        <div>Take a quick game creation tour</div>
        <div>
          Tutorial Video Coming Soon!
          {/* <iframe
            // width="560"
            // height="315"
            src="https://www.youtube.com/embed/20V7F9onwY0?si=prlQv8tddpdIfJN9"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe> */}
        </div>
        <button className="btn-full white-black-btn" disabled>
          Start tutorial
        </button>
      </div>
    </DashboardCard>
  );
}

export default function Preview() {
  return (
    <div>
      <ProfileCard />
      <CardRow>
        <DiscordCard />
        <WhitepaperCard />
        <IntroVideoCard />
        <AnnoucementCard />
      </CardRow>
      <br />
      <hr />

      <div className="w-full !pl-10 flex">
        <h2>Developer Score</h2>
      </div>
      <hr />

      <div
        className="w-full px-10 py-6 !mt-10"
        style={{
          margin: "0 auto",
        }}
      >
        <Rating />
      </div>

      <br />
      <br />

      <div className="w-full !pl-10 flex">
        <h2>Activity / Achievements</h2>
      </div>
      <hr />
    </div>
  );
}
