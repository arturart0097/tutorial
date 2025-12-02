import Editor, { loader } from "@monaco-editor/react";
import GITHUB_DARK_THEME from "../../misc/MonacoGithubDarkTheme";
import GITHUB_LIGHT_THEME from "../../misc/MonacoGithubLightTheme";
import toast from "react-hot-toast";
import { useEffect, useRef } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { DEFAULT_CODE } from "../../assets/MOCK/codeMock";
import { REGENERATE_CODE } from "../../assets/MOCK/codeMock";
import { useGettingStartedSteps } from "../../contexts/GettingStartedStepsContext";

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
  animationKey,
}: {
  gameCode: string;
  setGameCode: (code: string) => void;
  animationKey: number;
}) {
  const { theme } = useTheme();
  const typingFrame = useRef<number | null>(null);
  const typingLength = useRef<number>(0);
  const isTyping = useRef<boolean>(false);
  const { regenerate } = useGettingStartedSteps();

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

  useEffect(() => {
    if (!animationKey) {
      return;
    }

    if (typingFrame.current) {
      cancelAnimationFrame(typingFrame.current);
    }

    const codeToType = regenerate ? REGENERATE_CODE : DEFAULT_CODE;
    const duration = 15000; // 5 seconds animation
    const start = performance.now();
    typingLength.current = 0;
    isTyping.current = true;
    setGameCode("");

    const animate = (timestamp: number) => {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const nextLength = Math.floor(progress * codeToType.length);

      if (nextLength !== typingLength.current) {
        typingLength.current = nextLength;
        setGameCode(codeToType.slice(0, nextLength));
      }

      if (progress < 1 && isTyping.current) {
        typingFrame.current = requestAnimationFrame(animate);
      } else {
        setGameCode(codeToType);
        isTyping.current = false;
      }
    };

    typingFrame.current = requestAnimationFrame(animate);

    return () => {
      if (typingFrame.current) {
        cancelAnimationFrame(typingFrame.current);
      }
      isTyping.current = false;
    };
  }, [animationKey, setGameCode, regenerate]);

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
        value={gameCode}
      />
    </div>
  );
}
