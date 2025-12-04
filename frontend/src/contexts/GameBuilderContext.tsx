import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createProject,
  enhancePrompt,
  generateCodePublish,
  listProject,
  updateProject,
  uploadThumbnail,
  uploadPreview,
  ChatFlow,
  RefreshAssets,
  type MessageBlock,
} from "../lib/apiClient";
import toast from "react-hot-toast";
import { useWallets } from "@privy-io/react-auth";
import { checkDUELTokenBalance, checkGameGPTNFTStakeCount } from "../lib/wager";
import { mainnet } from "viem/chains";
import { addressWhitelist } from "../lib/wager";

export enum GameModel {
  GROK = "GROK",
  GEMINI = "GEMINI",
  CLAUDE = "CLAUDE",
}

type GameSDKChecklist = {
  ready: {
    completed: boolean;
    message: string;
  };

  score: {
    completed: boolean;
    message: string;
  };
  play_again: {
    completed: boolean;
    message: string;
  };
  wager: {
    completed: boolean;
    message: string;
  };
};

type GameBuilderContext = {
  gameName: string;
  gameId: number;
  gameCode: string;
  gameModel: GameModel;
  initialGameAssetMap: Record<string, File | string>;
  gameAssetMap: Record<string, File | string>;
  chatLock: boolean;
  isCodeGenerating: boolean;
  gameSDKChecklist: GameSDKChecklist;
  gameThumbnail: File | string;
  gamePreview: File | string;
  gameEnhancePromptMessages: MessageBlock[];
  currentGamePrompt: string;
  userWallet: string;

  setGameSDKChecklist: React.Dispatch<React.SetStateAction<GameSDKChecklist>>;
  setInitialGameAssetMap: React.Dispatch<
    React.SetStateAction<Record<string, File | string>>
  >;
  setGameAssetMap: React.Dispatch<
    React.SetStateAction<Record<string, File | string>>
  >;

  setGameName: React.Dispatch<React.SetStateAction<string>>;
  setGameId: React.Dispatch<React.SetStateAction<number>>;
  setGameCode: React.Dispatch<React.SetStateAction<string>>;
  setGameModel: React.Dispatch<React.SetStateAction<GameModel>>;
  setGameThumbnail: React.Dispatch<React.SetStateAction<File | string>>;
  setGamePreview: React.Dispatch<React.SetStateAction<File | string>>;
  setGameEnhancePromptMessages: React.Dispatch<
    React.SetStateAction<MessageBlock[]>
  >;

  setGamePrompt: (prompt: string) => void;
  enhanceGamePrompt: (string) => void;
  createGameStream: () => Promise<void>;
  iterateGameStream: (message: string) => Promise<void>;
  saveGame: () => Promise<void>;
  saveAssets: () => Promise<void>;
  saveThumbnail: () => Promise<void>;
  savePreview: () => Promise<void>;
  setUserWallet: (wallet: string) => void;
  initialize: (id?: number) => Promise<void>;
  showCodegenTooltip: () => void;
};

const GameBuilder = createContext<GameBuilderContext>({
  gameName: "",
  gameId: -1,
  gameCode: "",
  gameModel: GameModel.GEMINI,
  gameAssetMap: {},
  initialGameAssetMap: {},
  chatLock: true,
  isCodeGenerating: false,
  gameSDKChecklist: {
    ready: {
      completed: false,
      message: "Waiting for event...",
    },
    score: {
      completed: false,
      message: "Waiting for event...",
    },
    play_again: {
      completed: false,
      message: "Waiting for event...",
    },
    wager: {
      completed: false,
      message: "Waiting for event...",
    },
  },
  gameEnhancePromptMessages: [],
  currentGamePrompt: "",
  gameThumbnail: null,
  gamePreview: null,
  userWallet: "",

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  initialize: (id: number) => Promise.resolve(),
  setGameSDKChecklist: () => {},
  setGameAssetMap: () => {},
  setInitialGameAssetMap: () => {},
  setGameName: () => {},
  setGameId: () => {},
  setGameCode: () => {},
  setGameModel: () => {},
  setGameEnhancePromptMessages: () => {},
  setGamePrompt: () => {},
  enhanceGamePrompt: () => {},
  createGameStream: () => Promise.resolve(),
  iterateGameStream: () => Promise.resolve(),
  setGameThumbnail: () => {},
  setGamePreview: () => {},
  setUserWallet: () => {},

  saveGame: () => Promise.resolve(),
  saveAssets: () => Promise.resolve(),
  saveThumbnail: () => Promise.resolve(),
  savePreview: () => Promise.resolve(),
  showCodegenTooltip: () => {},
});

export const GameBuilderContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [gameId, setGameId] = useState(-1);
  const [gameCode, setGameCode] = useState("");
  const [gameName, setGameName] = useState("");
  const [gameThumbnail, setGameThumbnail] = useState<File | string>(null);
  const [gamePreview, setGamePreview] = useState<File | string>(null);
  const [gameModel, setGameModel] = useState<GameModel>(GameModel.GEMINI);
  const [gameAssetMap, _setGameAssetMap] = useState<
    Record<string, File | string>
  >({});

  const setGameAssetMap: React.Dispatch<
    React.SetStateAction<Record<string, File | string>>
  > = (updater) => {
    _setGameAssetMap((prev) => {
      const next =
        typeof updater === "function"
          ? (updater as (p: typeof prev) => typeof prev)(prev)
          : updater;

      const version = Date.now();
      const withVersion: Record<string, File | string> = {};

      for (const [key, value] of Object.entries(next)) {
        if (typeof value === "string" && value !== "") {
          const [base] = value.split("?v="); // strip old version if any
          withVersion[key] = `${base}?v=${version}`;
        } else {
          withVersion[key] = value; // Files pass through unchanged
        }
      }

      return withVersion;
    });
  };
  const [initialGameAssetMap, setInitialGameAssetMap] = useState<
    Record<string, File | string>
  >({});
  const [chatLock, setChatLock] = useState<boolean>(true);
  const [isCodeGenerating, setIsCodeGenerating] = useState<boolean>(false);
  const [userWallet, setUserWallet] = useState("");
  const [gameSDKChecklist, setGameSDKChecklist] = useState({
    ready: {
      completed: false,
      message: "Waiting for event...",
    },
    score: {
      completed: false,
      message: "Waiting for event...",
    },
    play_again: {
      completed: false,
      message: "Waiting for event...",
    },
    wager: {
      completed: false,
      message: "Waiting for event...",
    },
  });
  const [gameEnhancePromptMessages, setGameEnhancePromptMessages] = useState<
    MessageBlock[]
  >([]);

  const [isEligible, setEligibility] = useState(false);
  const { wallets } = useWallets();

  useEffect(() => {
    if (gameEnhancePromptMessages.length == 0) return;

    setCurrentGamePrompt(gameEnhancePromptMessages.slice(-1)[0].content);
  }, [gameEnhancePromptMessages]);

  const [currentGamePrompt, setCurrentGamePrompt] = useState("");

  const initialize = async (id?: number) => {
    if (id == null) {
      console.log("No game ID provided");
      return;
    }
    const project = await toast.promise(listProject(id), {
      loading: "Loading project...",
      success: "Project loaded",
      error: "Failed to load project",
    });
    setGameId(project[0].id);
    setGameName(project[0].title);
    setGameCode(project[0].code);
    setUserWallet(wallets[0].address);

    const keyToFileURL = (key: string) => {
      const IMAGE_ENDPOINT = import.meta.env.VITE_IMAGE_ENDPOINT;
      return IMAGE_ENDPOINT + "/" + key;
    };

    const assetMap: Record<string, string> = {};
    for (const asset of project[0].assets) {
      const key = asset[0];
      try {
        const url = keyToFileURL(asset[1]);
        assetMap[key] = url;
      } catch (error) {
        console.warn(`Failed to load asset ${key}:`, error);
        assetMap[key] = "";
      }
    }

    setGameAssetMap(assetMap);
    setInitialGameAssetMap(assetMap);
    setGameThumbnail(keyToFileURL(project[0].thumbnail));
  };

  useEffect(() => {
    for (const wallet of wallets) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, id] = wallet.chainId.split(":");

      if (parseInt(id) !== mainnet.id) {
        continue;
      }

      setEligibility(true);
      return;

      if (addressWhitelist.includes(wallet.address)) {
        setEligibility(true);
        return;
      }

      checkGameGPTNFTStakeCount(wallet.address).then((v) => {
        setEligibility((prev) => prev || v > 0);
      });
      checkDUELTokenBalance(wallet.address).then((v) => {
        setEligibility((prev) => prev || v >= 500_000);
      });
    }
  }, [wallets]);

  const verifyEligibility = (): boolean => {
    //removing stake check for now
    return true;
    if (import.meta.env.DEV) return true;

    if (wallets.length === 0) {
      toast.error(
        "You do not seem to have any wallets connected. Please make sure you have one"
      );
    }

    if (!isEligible) {
      toast.error(
        "Sorry, your account does not meet requirements to use the Game Builder. You must have at least 500,000 $DUEL tokens or have staked a GameGPT NFT to use the AI Game Builder",
        {
          duration: 15000,
        }
      );

      return false;
    }

    return true;
  };

  const saveGame = async () => {
    if (!verifyEligibility()) return;

    if (gameId == -1) {
      const id = await toast.promise(
        createProject(gameName, gameCode, userWallet, gameModel),
        {
          loading: "Saving Game",
          success: "Game Saved",
          error: "An error occurred while saving your new game",
        }
      );
      setGameId(id);
    } else {
      await toast.promise(
        updateProject(gameId, gameName, gameCode, gameModel),
        {
          loading: "Saving Game",
          success: "Game Saved",
          error: "An error occurred while saving your game",
        }
      );
    }

    saveThumbnail();
    savePreview();
  };

  const saveAssets = async () => {
    if (!verifyEligibility()) return;
    const initialKeys = Object.keys(initialGameAssetMap);
    const currentKeys = Object.keys(gameAssetMap);
    const shouldDelete =
      initialKeys.length === currentKeys.length &&
      initialKeys.every((key) => currentKeys.includes(key));

    await toast.promise(RefreshAssets(shouldDelete, gameId, gameAssetMap), {
      loading: "Uploading Assets",
      success: "Assets uploaded",
      error: "An error occurred while uploading your assets",
    });
  };

  const saveThumbnail = async () => {
    if (gameThumbnail instanceof File) {
      await toast.promise(uploadThumbnail(gameThumbnail, gameId), {
        loading: "Uploading Game Thumbnail",
        success: "Thumbnail uploaded",
        error: "An error ocurred while uploading the game thumbnail",
      });
    }
  };

  const savePreview = async () => {
    if (gamePreview instanceof File) {
      await toast.promise(uploadPreview(gamePreview, gameId), {
        loading: "Uploading Game Preview",
        success: "Thumbnail uploaded",
        error: "An error ocurred while uploading the game preview",
      });
    }
  };

  const showCodegenTooltip = () => {
    // Block tab switching during code generation animation
    setIsCodeGenerating(true);
    
    // Show a 15s loading toast that automatically turns into success
    toast.loading("Generating Game Code...", {
      id: "codegen-tooltip",
      duration: 15000,
    });

    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        toast.success("Game code generated!", {
          id: "codegen-tooltip",
        });
        // Unblock tab switching after animation completes
        setIsCodeGenerating(false);
      }, 15000);
    }
  };

  const enhanceGamePrompt = async (newPrompt: string) => {
    if (!verifyEligibility()) return;
    if (!newPrompt || newPrompt.trim() === "") return;

    const newMessage: MessageBlock = { role: "user", content: newPrompt };

    const enhanced = await toast.promise(
      enhancePrompt([newMessage], gameModel),
      {
        loading: "Enhancing Prompt...",
        success: "Done",
        error: "An error occurred",
      }
    );
    setGameEnhancePromptMessages(enhanced);
  };

  const createGameStream = async () => {
    if (!verifyEligibility()) return;
    setChatLock(true);
    const eventSource = await generateCodePublish(
      gameId,
      [
        {
          role: "user",
          content: `Generate a game named ${gameName} using the following description:\n ${currentGamePrompt}`,
        } as MessageBlock,
      ],
      gameModel
    );

    return toast.promise(
      new Promise<void>((resolve) => {
        setGameCode("");
        eventSource.addEventListener("codegen", (event) => {
          const data = JSON.parse(event.data);
          const incomingText = data.text;

          // Now apply completed lines to the code
          setGameCode((prevCode) => {
            return prevCode + incomingText;
          });
        });

        eventSource.addEventListener("end", () => {
          eventSource.close();
          setChatLock(false);
          resolve();
        });
      }),
      {
        loading: "Generating Game Code...",
        success: "Done",
        error: "An error occurred",
      }
    );
  };

  const iterateGameStream = async (message: string) => {
    if (!verifyEligibility()) return;

    if (gameId === -1) {
      toast.error("Please save your game first before iterating");
      return;
    }

    setChatLock(true);
    const eventSource = await ChatFlow(gameId, message, gameModel);

    return toast.promise(
      new Promise<void>((resolve) => {
        setGameCode(""); // Clear existing code for new iteration

        eventSource.addEventListener("codegen", (event) => {
          const data = JSON.parse(event.data);
          const incomingText = data.text;

          // Accumulate the incoming code
          setGameCode((prevCode) => {
            return prevCode + incomingText;
          });
        });

        eventSource.addEventListener("end", () => {
          eventSource.close();
          setChatLock(false);
          resolve();
        });

        eventSource.addEventListener("error", () => {
          eventSource.close();
          throw new Error("Stream connection failed");
        });
      }),
      {
        loading: "Iterating game based on your feedback...",
        success: "Game updated!",
        error: "An error occurred while updating your game",
      }
    );
  };

  const setGamePrompt = (prompt: string) => {
    setGameEnhancePromptMessages((oldMessages) => {
      let lastMessage = oldMessages[oldMessages.length - 1];

      if (!lastMessage) {
        lastMessage = {
          role: "user",
          content: prompt,
        } as MessageBlock;
      } else if (lastMessage.role !== "user") {
        lastMessage.content = prompt;
        oldMessages = oldMessages.slice(0, -1);
      } else {
        lastMessage = {
          role: "user",
          content: prompt,
        } as MessageBlock;
      }

      return [...oldMessages, lastMessage];
    });
  };

  return (
    <GameBuilder.Provider
      value={{
        gameId,
        gameCode,
        userWallet,
        gameName,
        gameModel,
        chatLock,
        isCodeGenerating,
        gameAssetMap,
        initialGameAssetMap,
        gameSDKChecklist,
        gameEnhancePromptMessages,
        currentGamePrompt,
        gameThumbnail,
        gamePreview,
        setGameThumbnail,
        setGamePreview,
        initialize,
        setGamePrompt,
        setGameEnhancePromptMessages,
        setGameSDKChecklist,
        setGameAssetMap,
        setInitialGameAssetMap,
        setGameName,
        setGameId,
        setGameCode,
        setGameModel,
        enhanceGamePrompt,
        createGameStream,
        iterateGameStream,
        setUserWallet,
        saveGame,
        saveAssets,
        saveThumbnail,
        savePreview,
        showCodegenTooltip,
      }}
    >
      {children}
    </GameBuilder.Provider>
  );
};

export const useGameBuilder = () => {
  const ctx = useContext(GameBuilder);
  if (!ctx) {
    throw new Error(
      "useGameBuilder must be used within a GameBuilder Provider"
    );
  }

  return ctx;
};
