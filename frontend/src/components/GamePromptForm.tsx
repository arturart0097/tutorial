import { useGameBuilder } from "../contexts/GameBuilderContext";
import Chat from "./Chat";
import { useState } from "react";

import "../sass/GamePromptForm.scss";

function GamePromptForm() {
  const {
    gameId,
    currentGamePrompt,
    setGamePrompt,
    enhanceGamePrompt,
    createGameStream,
    saveGame,
  } = useGameBuilder();

  const [chatOpen, setChatOpen] = useState(false);
  const [chatLock, setChatLock] = useState(false);

  const ButtonClick = () => {
    setChatOpen(true);
    setChatLock(true);
    createGameStream().then(() => {
      setChatLock(false);
    });
  };

  return (
    <div>
      {chatOpen ? (
        <Chat
          stateSwap={() => setChatOpen(false)}
          chatLock={chatLock}
          gameId={gameId}
        />
      ) : (
        <ol className="enhance-prompt-steps">
          <li>
            <form className="form-container">
              Describe your game and will create a enhanced LLM prompt better
              suited for LLM code generation
              <textarea
                className="input-field"
                placeholder="Describe your game…"
                onChange={(e) => {
                  e.preventDefault();
                  setGamePrompt(e.target.value);
                }}
                value={currentGamePrompt}
              ></textarea>
              <button
                className="rainbow-btn"
                type="button"
                onClick={enhanceGamePrompt}
              >
                Enhance
              </button>
            </form>
          </li>

          <li>
            Feel free to edit as you see fit. Once the prompt looks good,
            generate the game code
            <button
              className="white-black-btn btn-full"
              onClick={ButtonClick}
              type="button"
            >
              Generate Game
            </button>
          </li>
          <li>
            To make smaller smaller imporovements, open a chat here
            <button
              className="white-black-btn btn-full"
              onClick={() => setChatOpen(true)}
              type="button"
            >
              Iterative Chat
            </button>
          </li>
          <li>
            To preview your game on GameGPT, click the “preview” button on the
            top-right of the generated code.
          </li>
          <li style={{ marginTop: "10px" }}>
            <p>If you are happy with your game, you can submit for review.</p>
            <button type="button" className="rainbow-btn" onClick={saveGame}>
              Save Game
            </button>
          </li>
        </ol>
      )}
    </div>
  );
}

export default GamePromptForm;
