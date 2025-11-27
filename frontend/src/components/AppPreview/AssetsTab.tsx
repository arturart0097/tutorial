import { useGameBuilder } from "../../contexts/GameBuilderContext";

export default function AssetsTab() {
  const {
    gameAssetMap,
    setGameAssetMap,
    saveAssets,
    gameThumbnail,
    setGameThumbnail,
    saveThumbnail,
  } = useGameBuilder();
  const gameAssetKeys = Object.keys(gameAssetMap);

  const getPreviewUrl = (source: File | string): string => {
    if (source instanceof File) {
      return URL.createObjectURL(source);
    }
    return source;
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

      <div className="asset-url-inputs">
        {gameAssetKeys.map((key) => {
          const previewUrl = getPreviewUrl(gameAssetMap[key]);

          return (
            <label key={key} className="flex items-center gap-3 py-2">
              <span className="min-w-28 font-mono text-sm">{key}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setGameAssetMap((prev) => ({ ...prev, [key]: file }));
                }}
              />
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt={key}
                  className="h-10 w-10 rounded object-cover border border-zinc-700"
                />
              )}
            </label>
          );
        })}
      </div>

      <button onClick={saveAssets}>Save Assets</button>
      <div>
        <label className="flex items-center gap-3 py-2">
          <span className="min-w-28 font-mono text-sm">Thumbnail</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setGameThumbnail(file);
            }}
          />
          {gameThumbnail && (
            <img
              src={getPreviewUrl(gameThumbnail)}
              alt="thumbnail"
              className="h-10 w-10 rounded object-cover border border-zinc-700"
            />
          )}
        </label>
        <button onClick={saveThumbnail}>Save Thumbnail</button>
      </div>
    </div>
  );
}
