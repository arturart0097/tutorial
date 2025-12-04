import { useState } from "react";
import { useGameBuilder } from "../../contexts/GameBuilderContext";

type AssetType = "image" | "music" | "sfx";

const getAssetType = (key: string, source: File | string): AssetType => {
  // Check file extension from URL or filename
  let extension = "";

  if (source instanceof File) {
    extension = source.name.split(".").pop()?.toLowerCase() || "";
  } else if (typeof source === "string" && source) {
    // Extract extension from URL
    const urlPath = source.split("?")[0]; // Remove query params
    extension = urlPath.split(".").pop()?.toLowerCase() || "";
  }

  // Check key name for hints
  const keyLower = key.toLowerCase();
  if (
    keyLower.includes("sfx") ||
    keyLower.includes("sound") ||
    keyLower.includes("effect")
  ) {
    return "sfx";
  }
  if (
    keyLower.includes("music") ||
    keyLower.includes("bgm") ||
    keyLower.includes("audio")
  ) {
    return "music";
  }

  // Check extension
  const imageExtensions = ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"];
  const audioExtensions = ["mp3", "wav", "ogg", "m4a", "flac", "aac"];

  if (imageExtensions.includes(extension)) {
    return "image";
  }
  if (audioExtensions.includes(extension)) {
    // If it's audio but not explicitly music, assume sfx for small files or check key
    return keyLower.includes("music") || keyLower.includes("bgm")
      ? "music"
      : "sfx";
  }

  // Default to image if unknown
  return "image";
};

interface AssetTabProps {
  label: string;
  type: AssetType;
  activeTab: AssetType;
  setActiveTab: (type: AssetType) => void;
}

const AssetTab = ({ label, type, activeTab, setActiveTab }: AssetTabProps) => {
  const isActive = activeTab === type;
  return (
    <button
      type="button"
      onClick={() => setActiveTab(type)}
      className={`preview-tab ${isActive ? "active" : ""}`}
      aria-pressed={isActive}
    >
      {label}
    </button>
  );
};

export default function AssetsTab() {
  const {
    gameAssetMap,
    setGameAssetMap,
    saveAssets,
    gameThumbnail,
    setGameThumbnail,
    saveThumbnail,
  } = useGameBuilder();

  const [activeAssetTab, setActiveAssetTab] = useState<AssetType>("image");

  const gameAssetKeys = Object.keys(gameAssetMap);

  console.log(gameAssetMap, "---1");

  // Group assets by type
  const assetsByType = gameAssetKeys.reduce(
    (acc, key) => {
      const assetType = getAssetType(key, gameAssetMap[key]);
      if (!acc[assetType]) {
        acc[assetType] = [];
      }
      acc[assetType].push(key);
      return acc;
    },
    {} as Record<AssetType, string[]>
  );

  const getPreviewUrl = (source: File | string): string => {
    if (source instanceof File) {
      return URL.createObjectURL(source);
    }
    return source;
  };

  const uploadTileClass =
    "flex h-20 w-24 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/70 text-zinc-200 transition-colors hover:border-indigo-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500";
  const actionButtonClass =
    "inline-flex items-center gap-2 rounded-xl border border-zinc-700/70 bg-zinc-900/70 !px-4 !py-2 text-sm font-semibold text-zinc-100 transition-colors hover:border-indigo-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500";
  const actionButtonAccentClass =
    "inline-flex items-center gap-2 rounded-xl border border-indigo-400/70 bg-indigo-600/80 !px-4 !py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400";

  const renderAssetInput = (key: string, assetType: AssetType) => {
    const previewUrl = getPreviewUrl(gameAssetMap[key]);
    const isImage = assetType === "image";
    const inputId = `asset-input-${key}`;

    return (
      <div key={key} className="flex items-center gap-3 py-2">
        <span className="min-w-28 font-mono text-sm">{key}</span>
        <div className="flex items-center gap-3 flex-1">
          {/* <label htmlFor={inputId} className={uploadTileClass}> */}
            <svg
              aria-hidden="true"
              width="21"
              height="21"
              viewBox="0 0 24 24"
              role="img"
              className="text-white/90"
            >
              <path
                d="M5 20h14a1 1 0 0 0 1-1v-5a1 1 0 1 0-2 0v4H6v-4a1 1 0 1 0-2 0v5a1 1 0 0 0 1 1Zm6-16v8.586l-2.293-2.293a1 1 0 0 0-1.414 1.414l4.003 4.003a1 1 0 0 0 1.414 0l4.003-4.003a1 1 0 0 0-1.414-1.414L13 12.586V4a1 1 0 1 0-2 0Z"
                fill="currentColor"
              />
            </svg>
            <span className="sr-only">Upload asset</span>
          {/* </label> */}
          <input
            type="file"
            id={inputId}
            accept={isImage ? "image/*" : "audio/*"}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setGameAssetMap((prev) => ({ ...prev, [key]: file }));
            }}
            className="hidden"
          />
          {previewUrl && isImage && (
            <img
              src={previewUrl}
              alt={key}
              className="h-10 w-10 rounded object-cover border border-zinc-700"
            />
          )}
          {previewUrl && !isImage && (
            <div className="h-10 w-10 rounded border border-zinc-700 flex items-center justify-center bg-zinc-800">
              <span className="text-xs">🎵</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="assets">
      <h2>Assets</h2>
      <p>
        You can customize the game's assets below. Note that not all assets may
        be editable—this depends on the game. Be sure to preview the game first,
        so our system can automatically detect which assets are customizable.
      </p>

      <p>
        To manually add a custom asset, update the{" "}
        <code>window.ASSET_KEYS</code> array in the game code with a new label
        (e.g., <code>my_label</code>). You can then reference the asset as{" "}
        <code>window.ASSETS.my_label</code>.
      </p>

      {/* Asset Type Tabs */}
      <div
        className="preview-tabs"
        style={{ marginTop: "1rem", marginBottom: "1rem", margin: "20px auto" }}
      >
        <AssetTab
          label="Images"
          type="image"
          activeTab={activeAssetTab}
          setActiveTab={setActiveAssetTab}
        />
        <AssetTab
          label="Music"
          type="music"
          activeTab={activeAssetTab}
          setActiveTab={setActiveAssetTab}
        />
        <AssetTab
          label="SFX"
          type="sfx"
          activeTab={activeAssetTab}
          setActiveTab={setActiveAssetTab}
        />
      </div>

      {/* Assets for selected tab */}
      <div className="space-y-6">
        <div className="asset-url-inputs space-y-2 flex flex-col gap-5 items-center justify-center">
          {assetsByType[activeAssetTab]?.length > 0 ? (
            assetsByType[activeAssetTab].map((key) =>
              renderAssetInput(key, activeAssetTab)
            )
          ) : (
            <p className="text-zinc-500 text-sm text-center py-4 rounded-lg border border-dashed border-zinc-700 bg-zinc-900/40">
              No{" "}
              {activeAssetTab === "image"
                ? "images"
                : activeAssetTab === "music"
                  ? "music"
                  : "sound effects"}{" "}
              found.
            </p>
          )}
        </div>

        <div className="!mt-6 !pt-3 border-t border-zinc-800">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2 !mt-2 items-center w-full">
              <h3 className="text-sm font-medium text-zinc-100">
                Game thumbnail
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                This image will be shown as the cover of your game.
              </p>

              <div className="flex items-center gap-3 !mb-5">
                <label
                  htmlFor="thumbnail-input"
                  className={`${uploadTileClass} !h-16 !w-20`}
                >
                  <svg
                    aria-hidden="true"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    role="img"
                    className="text-white/90"
                  >
                    <path
                      d="M5 20h14a1 1 0 0 0 1-1v-5a1 1 0 1 0-2 0v4H6v-4a1 1 0 1 0-2 0v5a1 1 0 0 0 1 1Zm6-16v8.586l-2.293-2.293a1 1 0 0 0-1.414 1.414l4.003 4.003a1 1 0 0 0 1.414 0l4.003-4.003a1 1 0 0 0-1.414-1.414L13 12.586V4a1 1 0 1 0-2 0Z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Upload thumbnail</span>
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setGameThumbnail(file);
                  }}
                  className="hidden"
                  id="thumbnail-input"
                />

                {/* {gameThumbnail && (
                  <span className="text-xs text-zinc-400 truncate max-w-[160px]">
                    {gameThumbnail instanceof File ? gameThumbnail.name : gameThumbnail}
                  </span>
                )} */}
              </div>
            </div>

            {/* {gameThumbnail && (
              <div className="shrink-0">
                <div className="text-xs text-zinc-500 mb-1">Preview</div>
                <img
                  src={getPreviewUrl(gameThumbnail)}
                  alt="thumbnail"
                  className="h-16 w-16 rounded-lg object-cover border border-zinc-700 shadow-md"
                />
              </div>
            )} */}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <button onClick={saveAssets} className={actionButtonClass}>
            <svg
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              role="img"
            >
              <path
                d="M6 3h9.586a2 2 0 0 1 1.414.586l2.414 2.414A2 2 0 0 1 20 7.414V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm0 2v14h12V8h-4a1 1 0 0 1-1-1V3H6Zm8 0.414V6h2.586L14 5.414ZM8 12h8v6H8v-6Z"
                fill="currentColor"
              />
            </svg>
            Save Assets
          </button>
          <button onClick={saveThumbnail} className={actionButtonAccentClass}>
            <svg
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              role="img"  
            >
              <path
                d="M5 4h3l1-1h6l1 1h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 2v12h14V6h-2.586l-.707-.707A1 1 0 0 0 15.586 5h-5.172a1 1 0 0 0-.707.293L9 6H5Zm10 10-2.5-3-1.5 2-1-1-2 3h7Z"
                fill="currentColor"
              />
            </svg>
            Save Thumbnail
          </button>
        </div>
      </div>
    </div>
  );
}
