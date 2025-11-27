import { useState } from "react";
// import { Rating } from "react-simple-star-rating";
import ReactDOM from "react-dom";
import Rating from "@mui/material/Rating";
import emailjs from "@emailjs/browser";

const sendEmail = (
  rating: number,
  feedback: string,
  closeModal: () => void
) => {
  const templateParams = {
    email: "luke@rmg.io, devin@rmg.io",
    rating: rating.toString(),
    feedback: feedback,
  };
  closeModal();
  emailjs
    .send(
      import.meta.env.VITE_EMAIL_SERVICE_ID,
      "template_jbol0zw",
      templateParams,
      {
        publicKey: import.meta.env.VITE_EMAIL_PUBLIC_KEY,
      }
    )
    .then(
      () => {
        console.log("SUCCESS!");
      },
      (error) => {
        console.log("FAILED...", error.text);
      }
    );
};

export const FeedbackButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <button
        className="flex !mt-5 text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm !px-5 !py-2.5 text-center bg-blue-600 hover:bg-blue-800 focus:ring-blue-800 hover:cursor-pointer duration-300 transition-colors"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
      >
        Feedback
      </button>
      <FeedbackForm isOpen={isOpen} closeModal={() => setIsOpen(false)} />
    </div>
  );
};

interface FeedbackFormProps {
  isOpen: boolean;
  closeModal: () => void;
  onSubmit?: (data: { rating: number; feedback: string }) => void;
}

const FeedbackForm = ({ isOpen, closeModal }: FeedbackFormProps) => {
  const [feedback, setFeedback] = useState<string>("");
  const [rating, setRating] = useState<number>(3);
  const modal =
    "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4";

  let root: HTMLElement | null = null;
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    root = document.getElementById("root");
  }

  if (!isOpen) return null;

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return ReactDOM.createPortal(
    <div onClick={closeModal} className={`${modal}`}>
      <div
        onClick={handleModalClick}
        className="flex flex-col justify-center items-center w-8/12 !p-4 rounded-2xl border border-white/10 bg-neutral-900/90 text-slate-200 shadow-xl backdrop-blur"
      >
        <h3 className="mb-3 text-center text-lg font-semibold">
          Submit Feedback
        </h3>

        <div className="flex w-40">
          <img className="filter brightness-0 invert" src="/smile2.png"></img>
        </div>

        <div className="flex !py-1 !px-8 !justify-center w-40 rounded-full mb-4  bg-white/10">
          <Rating
            value={rating}
            onChange={(_, v) => setRating(v)}
            precision={0.5} // half-stars
            size="large"
          />
        </div>

        <div className="!flex !justify-center !my-6 !items-center w-10/12">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your feedback.."
            className="mb-4 min-h-28 w-full resize-none rounded-lg border border-white/10 bg-black/30 !p-3 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-amber-400/60"
          />
        </div>

        <div className="flex w-full justify-around gap-3 text-sm text-center">
          <div className="flex !p-2 w-3/12 text-center justify-center items-center rounded-lg border border-white/15 bg-transparent text-slate-200 hover:bg-white/5 hover:cursor-pointer duration-300 transition-colors">
            <button
              type="button"
              onClick={closeModal}
              className="hover:cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="flex !p-2 w-3/12 text-center justify-center items-center rounded-lg bg-amber-500 px-4 py-2 font-medium text-black hover:bg-amber-400 hover:cursor-pointer">
            <button
              type="button"
              onClick={() => sendEmail(rating, feedback, closeModal)}
              className="hover:cursor-pointer"
            >
              Send Feedback
            </button>
          </div>
        </div>
      </div>
    </div>,
    root
  );
};

export default FeedbackForm;
