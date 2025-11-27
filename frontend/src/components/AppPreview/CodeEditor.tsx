import Editor, { loader } from "@monaco-editor/react";
import GITHUB_DARK_THEME from "../../misc/MonacoGithubDarkTheme";
import GITHUB_LIGHT_THEME from "../../misc/MonacoGithubLightTheme";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { defaultCode } from "./GamePreview";

function downloadFile(filename: string, text: string) {
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

const buttonStyling =
  "flex justify-center items-center text-black bg-white py-0.5! px-3! rounded-xl hover:cursor-pointer";

export function RefreshButton({
  createGameStream,
  gameCode,
}: {
  createGameStream: () => void;
  gameCode: string;
}) {
  return (
    <button
      type="button"
      className={`${buttonStyling}`}
      onClick={() => {
        if (gameCode.trim().length == 0) {
          toast.error("No code in editor");
        } else {
          createGameStream();
        }
      }}
    >
      <i className="fa-solid fa-rotate"></i>
    </button>
  );
}

export function DownloadButton({ gameCode }: { gameCode: string }) {
  return (
    <button
      type="button"
      className={`${buttonStyling}`}
      onClick={() => {
        if (gameCode.trim().length == 0) {
          toast.error("No code in editor");
        } else {
          downloadFile("index.html", gameCode);
        }
      }}
    >
      <i className="fa-solid fa-cloud-arrow-down"></i>
    </button>
  );
}

export function normalizeCodeBlock(input: string) {
  return input?.replace(/^```html\s*/m, "").replace(/\s*```$/m, "");
}

export function EditorPane({
  gameCode,
  setGameCode,
  generate,
}: {
  gameCode: string;
  setGameCode: (code: string) => void;
  generate?: boolean;
}) {
  const { theme } = useTheme();
  useEffect(() => {
    loader.init().then((monaco) => {
      const palette =
        theme === "light" ? GITHUB_LIGHT_THEME : GITHUB_DARK_THEME;
      monaco.editor.defineTheme(
        "editorTheme",
        palette as Parameters<typeof monaco.editor.defineTheme>[1]
      );
      monaco.editor.setTheme("editorTheme");
    });
  }, [theme]);

  return (
    <div className="flex overflow-auto w-full resize-y rounded-xl h-[60vh]">
      <Editor
        onChange={(value) => setGameCode(value ? value : "")}
        defaultLanguage="html"
        theme="editorTheme"
        options={{
          minimap: { enabled: true },
          padding: { top: 20, bottom: 20 },
          fontSize: 10,
        }}
        value={generate && defaultCode}
      />
    </div>
  );
}
