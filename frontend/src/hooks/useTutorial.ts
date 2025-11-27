import { useEffect, useState } from "react";
import { listProject } from "../lib/apiClient";

export const useTutorial = () => {
  // `hasProjects` indicates user already created at least one game
  const [tutorial, setTutorial] = useState((false));
  // Whether to show the initial intro modal (center modal with Let's Go / Skip)
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const raw = window.localStorage.getItem("onboardingStep");
    return raw !== "completed" && (!raw || parseInt(raw, 10) === 0);
  });
  const [step, setStep] = useState<number>(() => {
    const raw =
      typeof window !== "undefined"
        ? window.localStorage.getItem("onboardingStep")
        : null;
    if (raw === "completed") return 0;
    const initial = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(initial) && initial >= 0 ? initial : 0;
  });

  const isForceTutorial = () => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("onboardingForce") === "true";
  };

  const fetchTutorial = async () => {
    const projects = await listProject();
    if (!projects) return;
    const hasProjects = projects.length > 0;
    const onboardingStep = typeof window !== "undefined" ? window.localStorage.getItem("onboardingStep") : null;
    const forced = isForceTutorial();

    // Ensure tutorial is not shown if onboardingStep is "completed"
    if (!forced && onboardingStep === "completed") {
      setTutorial(true);
      setStep(0);
      setShowIntro(false);
      return; // Exit early to prevent unnecessary updates
    }

    if (hasProjects && !forced) {
      setTutorial(true);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("onboardingStep", "completed");
      }
      setStep(0);
      setShowIntro(false);
    } else {
      // No projects: if step is 0, show intro; if step > 0, show overlay
      const raw = typeof window !== "undefined" ? window.localStorage.getItem("onboardingStep") : null;
      const current = raw ? parseInt(raw, 10) : 0;
      // In forced mode we behave like a fresh user without projects
      setTutorial(false);
      setShowIntro(!current || current === 0);
      setStep(Number.isFinite(current) ? current : 0);
    }
  };

  useEffect(() => {
    fetchTutorial();
  }, []);

  // Keep step synchronized across multiple hook consumers by listening to
  // custom and storage events. This ensures components that call this hook
  // in different trees stay consistent with localStorage updates.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleCustomChange = (evt: Event) => {
      const custom = evt as CustomEvent<number>;
      const nextValue = custom.detail;
      if (typeof nextValue === "number" && Number.isFinite(nextValue)) {
        setStep(nextValue);
        if (typeof window !== "undefined") {
          const raw = window.localStorage.getItem("onboardingStep");
          if (raw === "completed") {
            setShowIntro(false);
          } else {
            setShowIntro(nextValue === 0 && !tutorial);
          }
        } else {
          setShowIntro(nextValue === 0 && !tutorial);
        }
      }
    };

    const handleStorage = (evt: StorageEvent) => {
      if (evt.key !== "onboardingStep") return;
      const raw = evt.newValue;
      if (raw === "completed") {
        setStep(0);
        setShowIntro(false);
        return;
      }
      const next = raw ? parseInt(raw, 10) : 0;
      if (Number.isFinite(next) && next >= 0) {
        setStep(next);
        setShowIntro(next === 0 && !tutorial);
      }
    };

    window.addEventListener("onboardingStepChange", handleCustomChange as EventListener);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("onboardingStepChange", handleCustomChange as EventListener);
      window.removeEventListener("storage", handleStorage);
    };
  }, [tutorial]);

  const advanceStep = () => {
    if (tutorial && !isForceTutorial()) return; // allow when forced
    setStep((prev) => {
      const next = prev + 1;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("onboardingStep", String(next));
        window.dispatchEvent(new CustomEvent("onboardingStepChange", { detail: next }));
      }
      setShowIntro(false);
      return next;
    });
  };

  const startTutorial = () => {
    if (tutorial && !isForceTutorial()) return;
    if (typeof window !== "undefined") {
      window.localStorage.setItem("onboardingStep", "1");
      window.dispatchEvent(new CustomEvent("onboardingStepChange", { detail: 1 }));
    }
    setStep(1);
    setShowIntro(false);
  };

  const skipTutorial = () => {
    setTutorial(true)
    setShowIntro(false);
    setStep(0);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("onboardingStep", "completed");
      window.localStorage.removeItem("onboardingForce");
      window.dispatchEvent(new CustomEvent("onboardingStepChange", { detail: 0 }));
    }
  };

  const openIntro = () => {
    // Re-open the intro modal and reset step back to 0 for fresh start
    setShowIntro(true);
    setStep(0);
    setTutorial(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("onboardingForce", "true");
      window.localStorage.setItem("onboardingStep", "0");
      window.dispatchEvent(new CustomEvent("onboardingStepChange", { detail: 0 }));
    }
    window.location.reload()
  };

  return {
    tutorial, // has projects
    step,
    advanceStep,
    showIntro,
    showOverlay: !tutorial && step > 0,
    startTutorial,
    skipTutorial,
    openIntro,
  };
};
