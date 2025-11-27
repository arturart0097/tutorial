import "../sass/CreateGame.scss";
import { useNavigate } from "react-router";
import { useGameBuilder } from "../contexts/GameBuilderContext";
import { useLogin } from "@privy-io/react-auth";
import toast from "react-hot-toast";

function GameNameForm() {
  const gameBuilder = useGameBuilder();

  return (
    <>
      <h2>GAME DETAILS</h2>
      <h3>Game Name</h3>
      <form>
        <input
          type="text"
          placeholder="ENTER YOUR GAME NAME"
          onChange={(e) => gameBuilder.setGameName(e.target.value)}
        />
      </form>
    </>
  );
}

function CreateGame() {
  const navigate = useNavigate();

  const gameBuilder = useGameBuilder();
  const { login } = useLogin({
    onComplete: () => {
      navigate("/dashboard/create");
    },
  });

  const onLogin = () => {
    if (gameBuilder.gameName.trim().length == 0) {
      toast.error("Must enter a game name");
      return;
    }

    login();
  };

  return (
    <>
      <h1>CREATE GAME</h1>
      <h3>LET'S GET YOU STARTED</h3>
      <div className="create-form">
        <GameNameForm />
        <div className="create-form-btns">
          <div>
            <a
              href="#"
              className="black-btn"
              onClick={() => navigate("/build")}
            >
              Back
            </a>
          </div>
          <div>
            <a href="#" className="rainbow-btn" onClick={onLogin}>
              Login with Privy
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateGame;
