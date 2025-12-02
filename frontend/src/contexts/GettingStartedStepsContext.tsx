import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from "react";

interface GettingStartedStepsContextValue {
  step: number;
  setStep: (step: number) => void;
  regenerate: boolean;
  setRegenerate: (bool: boolean) => void;
}

const GettingStartedStepsContext = createContext<
  GettingStartedStepsContextValue | undefined
>(undefined);

export const GettingStartedStepsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [step, setStep] = useState<number>(1);
  const [regenerate, setRegenerate] = useState<boolean>(false);

  const value = useMemo(
    () => ({
      step,
      setStep,
      regenerate,
      setRegenerate,
    }),
    [step]
  );

  return (
    <GettingStartedStepsContext.Provider value={value}>
      {children}
    </GettingStartedStepsContext.Provider>
  );
};

export const useGettingStartedSteps = () => {
  const ctx = useContext(GettingStartedStepsContext);
  if (!ctx) {
    throw new Error(
      "useGettingStartedSteps must be used within a GettingStartedStepsProvider"
    );
  }
  return ctx;
};
