/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import qr_icon from "../../assets/qr_code.svg";
import reload_icon from "../../assets/reload.svg";
import { useEffect, useRef, useState } from "react";
import { useGameBuilder } from "../../contexts/GameBuilderContext";
import "../../sass/AppPreview.scss";
import toast from "react-hot-toast";
import { createGameGPTHost } from "../../lib/sdkHost";
import { GameGPTSDK } from "../../lib/sdkClient";
import { useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";
import { sendWager } from "../../lib/wager";
import "../../sass/AppPreview.scss";
import { DEFAULT_CODE } from "../../assets/MOCK/codeMock";
import { REGENERATE_CODE } from "../../assets/MOCK/codeMock";
import { useGettingStartedSteps } from "../../contexts/GettingStartedStepsContext";

interface GameFrameWindow extends Window {
  GameGPTSDK: InstanceType<typeof GameGPTSDK>;
  ASSETS: Record<string, HTMLImageElement>;
  ASSET_KEYS: string[];
  ASSETS_LOADED: boolean;
}

export default function GamePreview({ generate }) {
  const {
    gameCode,
    gameAssetMap,
    setGameAssetMap,
    setGameSDKChecklist,
    gameName,
  } = useGameBuilder();
  const [iframeKey, setIFrameKey] = useState(0);
  const gameIFrameRef = useRef<HTMLIFrameElement>(null);
  const sdkHost = createGameGPTHost();
  const sdkLoaded = useRef(false);
  const { wallets } = useWallets();
  const { regenerate } = useGettingStartedSteps();

  const onGameWindowReload = () => {
    sdkLoaded.current = false;
    setIFrameKey((prev) => prev + 1);
  };

  const onWagerEvent = async () => {
    if (!wallets.length) {
      toast.error("No wallets");
      return;
    }

    const wallet = wallets[0];
    const provider = await wallet.getEthereumProvider();
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    return await sendWager(signer, gameName);
  };

  const processAssetFiles = async (
    files: Record<string, File | string>
  ): Promise<void> => {
    const iframeWindow = gameIFrameRef.current
      ?.contentWindow as GameFrameWindow | null;
    if (!iframeWindow) return;

    console.log("Processing asset files (with onload)");

    const entries = await Promise.all(
      Object.entries(files).map(
        ([key, image]) =>
          new Promise<[string, HTMLImageElement | null]>((resolve) => {
            if (!image) {
              console.log(`Skipping ${key} - no image`);
              resolve([key, null]);
              return;
            }

            const img = new (iframeWindow as any).Image();

            img.onload = () => {
              console.log(`Loaded image: ${key}`);
              resolve([key, img]);
            };

            img.onerror = (err) => {
              console.warn(`Failed to load image: ${key}`, err);
              resolve([key, null]); // don't blow up everything for one bad asset
            };

            if (typeof image === "string") {
              img.src = image;
            } else {
              img.src = URL.createObjectURL(image);
            }
          })
      )
    );

    iframeWindow.ASSETS = {};
    for (const [key, img] of entries) {
      if (img) {
        iframeWindow.ASSETS[key] = img;
      }
    }

    iframeWindow.ASSETS_LOADED = true;
    iframeWindow.dispatchEvent(new Event("assets-ready"));
    console.log("🎨 All assets loaded & assets-ready dispatched");
  };

  useEffect(() => {
    if (gameIFrameRef.current && !sdkLoaded.current) {
      const IFrameWindow = gameIFrameRef.current
        .contentWindow as GameFrameWindow;

      IFrameWindow.GameGPTSDK = new GameGPTSDK();
      IFrameWindow.ASSETS = {};
      IFrameWindow.ASSETS_LOADED = false;
      sdkHost.connectTo(IFrameWindow);

      sdkHost.onEvent("ready", () => {
        setGameSDKChecklist((prev) => ({
          ...prev,
          ready: {
            ...prev.ready,
            completed: true,
            message: "Received Ready Event",
          },
        }));
      });

      sdkHost.onEvent("game_over", (data) => {
        setGameSDKChecklist((prev) => ({
          ...prev,
          score: {
            ...prev.score,
            completed: true,
            message: `Received Score: ${(data as any).score}`,
          },
        }));
      });

      sdkHost.onEvent("wager", () => {
        setGameSDKChecklist((prev) => ({
          ...prev,
          wager: {
            ...prev.wager,
            completed: true,
            message: `Received Wager Event`,
          },
        }));
      });

      sdkHost.onEvent("play_again", () => {
        setGameSDKChecklist((prev) => ({
          ...prev,
          play_again: {
            ...prev.play_again,
            completed: true,
            message: `Received Play Again Event`,
          },
        }));
      });

      sdkLoaded.current = true;
    }

    const handleIframeLoad = async () => {
      const IFrameWindow = gameIFrameRef.current!
        .contentWindow as GameFrameWindow;
      const IFrameDocument = gameIFrameRef.current!.contentDocument!;
      if (IFrameDocument.readyState !== "complete") return;

      console.log("Iframe loaded, processing assets...");
      await processAssetFiles(gameAssetMap);

      if (IFrameWindow.ASSET_KEYS) {
        const contextKeys = Object.keys(gameAssetMap);
        if (
          JSON.stringify(IFrameWindow.ASSET_KEYS) !==
          JSON.stringify(contextKeys)
        ) {
          console.log("Updating asset keys");
          const newAssetMap: Record<string, File | string> = {};
          IFrameWindow.ASSET_KEYS.forEach((key) => {
            if (gameAssetMap[key]) {
              newAssetMap[key] = gameAssetMap[key];
            } else {
              newAssetMap[key] = null;
            }
          });
          setGameAssetMap(newAssetMap);
        }
      }
    };

    gameIFrameRef.current?.addEventListener("load", handleIframeLoad);

    return () => {
      sdkHost.resetHost();
      sdkLoaded.current = false;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameIFrameRef, iframeKey]);

  return (
    <div className="flex flex-col w-full items-center max-h-144 mt-3!">
      <div className="flex status-bar w-full justify-between h-12!">
        <div className="action-btn h-8! justify-center! items-center">
          <img src={qr_icon} />
          Mobile
        </div>
        <div className="title">
          <div>GameGPT</div>
          <div>Mini App</div>
        </div>
        <a
          href="#"
          className="action-btn  h-8! justify-center! items-center"
          onClick={onGameWindowReload}
        >
          <img src={reload_icon} />
          Reload
        </a>
      </div>

      <div className={`flex w-full h-screen`}>
        <iframe
          key={iframeKey}
          id="gameCanvas"
          ref={gameIFrameRef}
          srcDoc={regenerate ? REGENERATE_CODE : DEFAULT_CODE}
          className="flex w-full! h-140"
          sandbox="allow-scripts allow-same-origin"
          title="Game Preview"
        />
      </div>
    </div>
  );
}
