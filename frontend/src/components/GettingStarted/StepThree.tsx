import { useGameBuilder } from "../../contexts/GameBuilderContext";
import Chat from "../Chat";
import type { StepProps } from "./StepOne";

export default function StepThree({ step }: StepProps) {
  const gb = useGameBuilder();
  const active = step === 3;

  return active ? (
    <div className="flex flex-col w-full h-9/10 gap-25  p-2! rounded-xl">
      <Chat chatLock={gb.chatLock} gameId={gb.gameId} />
    </div>
  ) : null;
}
