import telegram_icon from "../assets/telegram.svg";
import x_icon from "../assets/X.svg";
import discord_icon from "../assets/discord.svg";
import sidebar_button from "../assets/sidebar_button.svg";
import logo from "../assets/logo.png";
import profile_icon from "../assets/profile.png";
import "../sass/Sidebar.scss";
import { useEffect, useState } from "react";
import { usePrivy, useLogout } from "@privy-io/react-auth";
import { Link, useLocation, useNavigate } from "react-router";
import { FeedbackButton } from "./Feedback";

function SidebarCommon({ children }) {
  const [sideBarShown, setSideBarShown] = useState(true);
  const { user } = usePrivy();
  const navigate = useNavigate();
  const { logout } = useLogout({
    onSuccess: () => {
      navigate("/");
    },
  });

  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    if (!user) return;

    const address = user.linkedAccounts.find(
      (acct) => acct.type == "wallet"
    ).address;

    setWalletAddress(address.slice(0, 10) + "...");
  }, [user]);

  return (
    <div className="sidebar">
      <div className="flex text-md! w-full items-center! justify-around gap-2">
        {sideBarShown ? <img src={logo} className="logo w-10/12" /> : null}
        <a href="#" onClick={() => setSideBarShown(!sideBarShown)}>
          <img src={sidebar_button} className="w-8 h-8 mr-2!" />
        </a>
      </div>
      {sideBarShown ? (
        <>
          {children}
          <div className="sidebar-profile text-sm!">
            <div>
              <img src={profile_icon} className="profile-icon" />
            </div>
            <div>
              <div>{walletAddress}</div>
              <div>
                <a href="#" className="logout-link" onClick={logout}>
                  Log Out
                </a>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export function Sidebar() {
  const location = useLocation();

  return (
    <SidebarCommon>
      <div className="sidebar-menu">
        <ul>
          <li>
            <Link
              to="/dashboard"
              className={location.pathname == "/dashboard" ? "active" : null}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/games"
              className={
                location.pathname == "/dashboard/games" ? "active" : null
              }
            >
              My Games
            </Link>
          </li>
        </ul>
      </div>
      <hr />
      <div className="sidebar-socials">
        <ul>
          <li>
            <div>
              <img src={telegram_icon} />
            </div>
            <div>Telegram</div>
          </li>
          <li>
            <div>
              <img src={x_icon} />
            </div>
            <div>X</div>
          </li>
          <li>
            <div>
              <img src={discord_icon} />
            </div>
            <div>Discord</div>
          </li>
        </ul>
        <FeedbackButton />
      </div>
    </SidebarCommon>
  );
}
