"use client";
import { ThemeButton } from "./Buttons";
import profile_icon from "../assets/profile.png";
import { GetMessages, type Message } from "../lib/apiClient";
import { useState, useEffect } from "react";
import { useGameBuilder } from "../contexts/GameBuilderContext";
import { lightGradient, hoverGradient } from "./Buttons";
import { useNavigate } from "react-router";
import { useGettingStartedSteps } from "../contexts/GettingStartedStepsContext";

const EXAMPLE_MESSAGES = [
  {
    id: 1,
    conversation_id: 1,
    author: "ai",
    content: "These are Example Messages",
  },
  {
    id: 1,
    conversation_id: 1,
    author: "user",
    content: "For your AI",
  },
  {
    id: 1,
    conversation_id: 1,
    author: "ai",
    content: "Have Fun",
  },
];

const bus = new EventTarget();

function invalidateMessages(convoId: number) {
  bus.dispatchEvent(
    new CustomEvent("messages:invalidate", { detail: { convoId } })
  );
}

function onMessagesInvalidate(handler: (convoId: number) => void) {
  const listener = (e: Event) => handler((e as CustomEvent).detail.convoId);
  bus.addEventListener("messages:invalidate", listener);
  return () => bus.removeEventListener("messages:invalidate", listener);
}

export interface MessageProps {
  author: string;
  content: string;
}

const Message = ({ author, content }: MessageProps) => {
  const isUser = author === "user";
  const alignment = isUser ? "justify-start" : "justify-end ";
  const styling = isUser
    ? "bg-slate-800/80 text-slate-100 ring-1 ring-white/10"
    : "bg-gradient-to-r from-fuchsia-500/15 to-sky-500/15 text-slate-100 ring-1 ring-white/10 backdrop-blur";
  return (
    <div className="flex flex-col w-full px-4! py-3! bg-transparent border-b border-slate-800/70 last:border-b-0 first:mt-2!">
      <div className={`flex w-full ${alignment}`}>
        <div
          className={`flex items-center gap-2! rounded-2xl px-3! py-2! text-sm leading-relaxed shadow-sm ${styling}`}
        >
          {isUser ? (
            <div className="flex w-8! h-8! rounded-full! hidden md:flex">
              <img src={profile_icon} className="profile-icon rounded-full!" />
            </div>
          ) : null}
          <div>{content}</div>
        </div>
      </div>
    </div>
  );
};

interface ChatBoxProps {
  gameId: number;
  setGameCode: React.Dispatch<React.SetStateAction<string>>;
}

export const ChatBoxFloat = ({ gameId }: ChatBoxProps) => {
  const { iterateGameStream, saveGame, chatLock, showCodegenTooltip } =
    useGameBuilder();
  const [chatInteracted, setChatInteracted] = useState(false);
  const targetChatText = "Change background color to gradient blue";
  const [message, setMessage] = useState<string>("");
  const focusStyle =
    "focus:ring-2! focus:ring-fuchsia-300/40! focus:border-transparent!";
  const navigate = useNavigate();
  const { setStep, setRegenerate } = useGettingStartedSteps();
  // Кнопка Send активується тільки коли повністю введено "Change background color" (без урахування регістру)
  const isChatComplete =
    message.trim().toLowerCase() === targetChatText.toLowerCase();

  const handleSend = async () => {
    if (!isChatComplete) return;
    showCodegenTooltip();
    setStep(6);
    setRegenerate(true);
  };

  const { step } = useGettingStartedSteps();

  return (
    <div className="flex items-end gap-3 w-full h-28">
      <textarea
        className={`w-full h-full ${focusStyle} border border-zinc-600 font-mono! bg-slate-800/60 rounded-lg px-3! pt-3! text-sm! leading-6 text-zinc-300! placeholder:text-zinc-500! resize-none overflow-auto!`}
        placeholder=""
        rows={4}
        value={message}
        onFocus={() => {
          setChatInteracted(true);
        }}
        onKeyDown={(e) => {
          const currentIndex = message.length;
          const nextChar = targetChatText[currentIndex];

          // Allow backspace
          if (e.key === "Backspace") {
            setMessage((prev) => prev.slice(0, -1));
            return;
          }

          // Allow delete
          if (e.key === "Delete") {
            return;
          }

          // Allow arrow keys and other navigation
          if (
            e.key.startsWith("Arrow") ||
            e.key === "Home" ||
            e.key === "End"
          ) {
            return;
          }

          // Prevent default for other keys if we've reached the end
          if (currentIndex >= targetChatText.length) {
            e.preventDefault();
            return;
          }

          // Check if the pressed key matches the next character
          if (e.key.length === 1) {
            const isCorrect = e.key.toLowerCase() === nextChar.toLowerCase();

            if (isCorrect) {
              const newInput = message + e.key;
              setMessage(newInput);
            } else {
              // Prevent incorrect character from being entered
              e.preventDefault();
            }
          }
        }}
        onChange={() => {
          // This is handled in onKeyDown, but keeping for safety
          setChatInteracted(true);
        }}
        disabled={step < 5}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-[115px] !px-6">
        <div className="w-full h-full whitespace-pre-wrap break-words overflow-hidden text-sm leading-6 font-mono text-zinc-500/70">
          {targetChatText.split("").map((char, index) => {
            const isTyped = index < message.length;
            const isCorrect =
              isTyped && message[index].toLowerCase() === char.toLowerCase();
            return (
              <span
                key={index}
                className={
                  isTyped
                    ? isCorrect
                      ? "text-transparent"
                      : "text-red-400/60"
                    : "text-gray-400/50"
                }
              >
                {step > 4 && char}
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-2! w-25 h-full mr-1! text-sm rounded-lg">
        <ThemeButton
          bg="bg-zinc-700"
          hover={`hover:cursor-pointer! hover:bg-white/70 `}
          radius="rounded-lg!"
          padding="py-2! px-4!"
          onClick={handleSend}
          disabled={!isChatComplete || step < 5}
        >
          Send
        </ThemeButton>
        <ThemeButton
          bg={`${lightGradient}`}
          hover={`hover:cursor-pointer! ${hoverGradient}`}
          radius="rounded-lg!"
          padding="py-2! px-4!"
          onClick={() => {
            saveGame();
            navigate("/dashboard/games");
          }}
          disabled={step < 6}
        >
          Save
        </ThemeButton>
      </div>
    </div>
  );
};

interface ChatCloseProps {
  stateSwap: () => void;
}

export const ChatClose = ({ stateSwap }: ChatCloseProps) => {
  return (
    <div
      className="flex absolute bottom-0 inset-x-0 z-50 text-sm text-gray-500 hover:text-gray-300 justify-center mb-2! items-end hover:cursor-pointer underline underline-offset-3 "
      onClick={() => stateSwap()}
    >
      Close
    </div>
  );
};

const LoadingBox = () => {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-slate-950/60 backdrop-blur-sm">
      <div className="loader ease-linear rounded-full border-4 border-t-4 border-slate-200 h-8 w-8"></div>
      <span className="ml-3! text-slate-200">Loading...</span>
    </div>
  );
};

const EmptyBox = () => {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-slate-950/60 backdrop-blur-sm">
      <span className="ml-3! w-8/10 text-slate-200">
        Start editing by sending chat messages under the editor !
      </span>
    </div>
  );
};

interface ChatProps {
  gameId: number;
  chatLock?: boolean;
  stateSwap?: () => void;
}

const Chat = ({ gameId, stateSwap, chatLock }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(chatLock);

  useEffect(() => {
    if (gameId === -1) {
      setMessages(EXAMPLE_MESSAGES);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const fetchedMessages = await GetMessages(gameId);
        setMessages(fetchedMessages);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    const unsubscribe = onMessagesInvalidate((convoId) => {
      if (convoId === gameId) {
        fetchMessages();
      }
    });

    return unsubscribe;
  }, [gameId, chatLock]);

  const parentStyle = loading ? "pointer-events-none!" : "";
  return (
    <div className="flex flex-col relative h-full w-full items-center justify-between gap-4">
      <div className="flex flex-col h-full w-full overflow-y-auto! rounded-2xl bg-slate-950/60 backdrop-blur ring-1 ring-white/10 shadow-xl relative">
        <div
          className={`flex flex-col ${parentStyle} overflow-y-auto! max-h-96 md:max-h-128`}
        >
          {messages.map((msg, index) => (
            <Message key={index} author={msg.author} content={msg.content} />
          ))}
        </div>

        {loading && <LoadingBox />}
        {messages.length === 0 && !loading && <EmptyBox />}

        <ChatClose stateSwap={stateSwap} />
      </div>
    </div>
  );
};

export default Chat;
