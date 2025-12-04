import telegram_icon from "../assets/telegram.svg";
import x_icon from "../assets/X.svg";
import discord_icon from "../assets/discord.svg";
import sidebar_button from "../assets/sidebar_button.svg";
import logo from "../assets/logo.png";
import profile_icon from "../assets/profile.png";
import { useEffect, useState } from "react";
import { usePrivy, useLogout } from "@privy-io/react-auth";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { FeedbackButton } from "./Feedback";
import { ThemeToggle } from "./ThemeToggle";
import { useTutorial } from "../hooks/useTutorial";
import { useMobile } from "../hooks/useMobile";
import { useTheme } from "../contexts/ThemeContext";
import { useGettingStartedSteps } from "../contexts/GettingStartedStepsContext";

interface SidebarLinkProps {
  to: string;
  label: string;
  highlight?: boolean;
  isTutorialText?: string;
  variant?: "default" | "minimal";
  textSize?: number;
}

const SidebarLink = ({
  to,
  label,
  highlight = false,
  isTutorialText = "Натисніть цю кнопку",
  variant = "default",
  textSize,
}: SidebarLinkProps) => {
  const hoverStyling =
    "hover:bg-gradient-to-tr hover:from-blue-800 hover:to-pink-600  hover:border-zinc-500 transition-colors duration-300 hover:cursor-pointer";

  if (variant === "minimal") {
    return (
      <div className={`w-full`}>
        <Link
          to={to}
          className={`block w-full text-center font-semibold text-lg py-2`}
          style={{
            fontSize: textSize,
            color: "var(--text-primary)",
          }}
        >
          {label}
        </Link>
      </div>
    );
  }

  return (
    <Link to={to}>
      <div
        className={`flex rounded-xl! p-2! w-19/20 border-2 border-transparent ${hoverStyling} ${
          highlight
            ? "relative ring-2 ring-fuchsia-400/70 shadow-[0_0_28px_rgba(217,70,239,0.55)] animate-pulse bg-white/5"
            : ""
        }`}
        style={{
          fontSize: textSize,
        }}
      >
        {label}
      </div>
    </Link>
  );
};

interface SocialLinkProps {
  icon: string;
  label: string;
  textSize?: number;
  isLightTheme?: boolean;
}

const SocialLink = ({
  icon,
  label,
  textSize,
  isLightTheme,
}: SocialLinkProps) => {
  const iconFilter = isLightTheme ? "brightness(0) saturate(100%)" : "none";
  return (
    <div
      className="flex px-2! hover:cursor-pointer transition-all duration-300 items-center gap-2! hover justify-center"
      style={{ color: "var(--text-primary)" }}
    >
      <img src={icon} className="w-5 h-5" style={{ filter: iconFilter }} />
      <span
        className={`text-base`}
        style={{
          fontSize: textSize,
        }}
      >
        {label}
      </span>
    </div>
  );
};

export default function NewSidebar() {
  const [sideBarShown, setSideBarShown] = useState(true);
  const [contentVisible, setContentVisible] = useState(true);
  const { user } = usePrivy();
  const [walletAddress, setWalletAddress] = useState("");
  const navigate = useNavigate();
  //   const location = useLocation(); for active link styling

  const { tutorial, step, advanceStep, showIntro } = useTutorial();
  const isMobile = useMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme } = useTheme();
  const isLightTheme = theme === "light";
  const { pathname } = useLocation();

  const isCreate = pathname.includes("/dashboard/create");
  const isGames = pathname.includes("/dashboard/games");

  const disableDashboardLink = isCreate || isGames;

  console.log(disableDashboardLink, "---1");

  useEffect(() => {
    if (!user) return;
    const address = user.linkedAccounts.find(
      (acct) => acct.type == "wallet"
    ).address;

    setWalletAddress(address.slice(0, 10) + "...");
  }, [user]);

  const sidebarToggle = () => {
    setSideBarShown(!sideBarShown);
    if (sideBarShown) setContentVisible(false);
  };

  const stateStyle = sideBarShown ? "w-20 md:w-50 min-w-30" : "w-14";
  const stateHiding = sideBarShown ? "block" : "hidden";
  const stateMargin = sideBarShown ? "mr-2! my-3!" : "my-3!";
  const fadeIn = "transition-all duration-300";
  const pop = contentVisible
    ? "opacity-100 translate-y-0"
    : "opacity-0 translate-y-1 pointer-events-none";

  useEffect(() => {
    if (!isMobile) return;
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen, isMobile]);

  if (isMobile) {
    return (
      <>
        {/* Mobile Header */}
        <div
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between backdrop-blur border-b px-3 py-2"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border-primary)",
          }}
        >
          <div className="flex items-center gap-2">
            <img
              src={logo}
              className="h-16 w-auto"
              style={{
                filter: isLightTheme ? "brightness(0) saturate(100%)" : "none",
              }}
            />
          </div>
          <button
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
            className="w-11 h-11 flex flex-col items-center justify-center gap-1.5 rounded-xl hover:bg-white/10 active:scale-95 transition"
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            <span
              className={`block w-6 h-0.5 bg-white transition-transform duration-200 ${
                mobileMenuOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-white transition-opacity duration-200 ${
                mobileMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-white transition-transform duration-200 ${
                mobileMenuOpen ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </button>
        </div>

        {/* Overlay + Right Panel */}
        <aside role="dialog" aria-modal="true" aria-hidden={!mobileMenuOpen}>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 backdrop-blur-sm z-40 transition-opacity duration-300 ${
              mobileMenuOpen
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
            style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Off-canvas panel */}
          <div
            className={`fixed top-0 right-0 h-full w-full z-50 border-l backdrop-blur transform transition-transform duration-300 ${
              mobileMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
            style={{
              borderColor: "var(--border-primary)",
              backgroundColor: "var(--bg-secondary)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <img
                  src={logo}
                  className="h-16 w-auto"
                  style={{
                    filter: isLightTheme
                      ? "brightness(0) saturate(100%)"
                      : "none",
                  }}
                />
              </div>
              <button
                aria-label="Close menu"
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 active:scale-95 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-white text-lg">✕</span>
              </button>
            </div>

            {/* Panel Body */}
            <div className="px-4 py-5">
              <nav className="flex flex-col items-center text-center gap-4">
                <div
                  className="w-[90%] border-b !pb-4"
                  style={{ borderColor: "var(--border-primary)" }}
                >
                  <div
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-1"
                  >
                    <SidebarLink
                      to={disableDashboardLink ? "" : "/dashboard"}
                      label="Dashboard"
                      variant="minimal"
                      textSize={28}
                    />
                  </div>
                  <div
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-1"
                  >
                    <SidebarLink
                      to="/dashboard/games"
                      label="My Games"
                      highlight={!tutorial && step === 1}
                      isTutorialText={"Натисніть "}
                      variant="minimal"
                      textSize={28}
                    />
                  </div>
                </div>

                <div className="w-full pb-3">
                  <div className="flex flex-col gap-3 mt-2">
                    <SocialLink
                      icon={telegram_icon}
                      label="Telegram"
                      textSize={22}
                      isLightTheme={isLightTheme}
                    />
                    <SocialLink
                      icon={x_icon}
                      label="Twitter"
                      textSize={22}
                      isLightTheme={isLightTheme}
                    />
                    <SocialLink
                      icon={discord_icon}
                      label="Discord"
                      textSize={22}
                      isLightTheme={isLightTheme}
                    />
                  </div>
                </div>

                <div className="w-full mt-1">
                  <div className="w-full flex items-center justify-center gap-3">
                    {/* <FeedbackButton /> */}
                    <ThemeToggle />
                  </div>
                </div>
              </nav>
            </div>

            {/* Panel Footer */}
            <div
              className="!px-4 py-3 w-full h-17 absolute bottom-0 flex gap-3"
              style={{ backgroundColor: "var(--bg-secondary)" }}
            >
              <img src={profile_icon} className="w-12 h-12 rounded-full" />
              <div className="flex flex-col">
                <span
                  className="text-2xl leading-tight truncate w-full"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {walletAddress}
                </span>
                <button
                  disabled
                  className="logout-link hover:underline text-xl"
                  style={{ color: "var(--text-primary)" }}
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Spacer removed; page container applies margin-top on mobile */}
        <div className="h-0" />
      </>
    );
  }

  const [highlight, setHighlight] = useState(false);

  return (
    <div
      id="sidebar"
      className={`flex flex-col h-full border-r ${stateStyle} transition-all duration-600 z-50`}
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border-primary)",
      }}
      onTransitionEnd={(e) => {
        if (e.propertyName === "width" && sideBarShown) setContentVisible(true);
      }}
    >
      {!tutorial && step > 1 && step < 10 && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 pointer-events-auto w-50" />
        </>
      )}

      <div
        id="topbar"
        className="flex items-center! justify-around mb-6! mx-1.5! px-1 border-b-2 hover:cursor-pointer"
        style={{ borderColor: "var(--border-primary)" }}
        onClick={() => sidebarToggle()}
      >
        <div className={`${stateHiding}`}>
          <img
            src={logo}
            className={`w-99/100 hidden ${stateHiding} ${pop}`}
            style={{
              filter: isLightTheme ? "brightness(0) saturate(100%)" : "none",
            }}
          />
        </div>

        <img
          src={sidebar_button}
          className={`w-7 h-7 ${stateMargin} hover:cursor-pointer`}
          style={{
            filter: isLightTheme ? "brightness(0) saturate(100%)" : "none",
          }}
        />
      </div>
      {!sideBarShown ? null : (
        <div className="flex flex-col justify-between h-full md:text-xl">
          <div className="flex flex-col gap-5">
            <div
              id="siteLinks"
              className={`flex flex-col gap-1 mx-2! border-b-2 pb-8! ${fadeIn} delay-50 ${pop}`}
              style={{ borderColor: "var(--border-primary)" }}
            >
              <SidebarLink
                to={disableDashboardLink ? "" : "/dashboard"}
                label="Dashboard"
              />
              <div onClick={() => setHighlight(true)}>
                <SidebarLink
                  to="/dashboard/games"
                  label="My Games"
                  highlight={!highlight}
                  isTutorialText={"Натисніть "}
                />
              </div>
            </div>
            <div
              id="socials"
              className={`flex flex-col items-start gap-3 mx-2! border-b-2 pb-8! ${fadeIn} delay-200 ${pop}`}
              style={{ borderColor: "var(--border-primary)" }}
            >
              <SocialLink
                icon={telegram_icon}
                label="Telegram"
                isLightTheme={isLightTheme}
              />
              <SocialLink icon={x_icon} label="X" isLightTheme={isLightTheme} />
              <SocialLink
                icon={discord_icon}
                label="Discord"
                isLightTheme={isLightTheme}
              />
            </div>
            <div
              className={`flex justify-start ml-4! ${fadeIn} delay-]400 ${pop}`}
            >
              {/* <FeedbackButton /> */}
            </div>
            <div
              className={`flex justify-start ml-4! ${fadeIn} delay-500 ${pop}`}
            >
              <ThemeToggle />
            </div>
          </div>

          <div
            id="profile"
            className="flex border-t p-2! mt-4! items-center !gap-2 text-sm sticky bottom-0 backdrop-blur"
            style={{
              borderColor: "var(--border-primary)",
              backgroundColor: "var(--bg-profile)",
              color: "var(--text-primary)",
            }}
          >
            <img src={profile_icon} className="w-8 h-8 rounded-full" />
            <div>
              <div>{walletAddress}</div>
              <button disabled className="logout-link hover:underline">
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
