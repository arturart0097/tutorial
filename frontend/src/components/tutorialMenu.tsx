import step1 from "../assets/step1.gif";
import step3 from "../assets/step3.gif";
import step4 from "../assets/step4.gif";
import step5 from "../assets/step5.gif";
import { useGettingStartedSteps } from "../contexts/GettingStartedStepsContext";

const stepVideos = {
  1: step1,
  2: step3,
  3: step4,
  4: step4,
  5: step5,
  6: step5,
};

export const TutorialMenu = () => {
  const { step } = useGettingStartedSteps();

  return (
    <div className="min-w-[300px] !mt-3 !px-3">
      <p>
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Omnis rem enim
        ratione mollitia rerum? Autem nam est dolores odio dolore.
      </p>

      <video
        key={step} // 🔥 важливо для коректного автоперезапуску
        src={stepVideos[step]}
        autoPlay
        muted
        loop
        style={{ width: "100%", maxWidth: "600px", marginTop: "30px" }}
      />
    </div>
  );
};
