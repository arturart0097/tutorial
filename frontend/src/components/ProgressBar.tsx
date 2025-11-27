import React from "react";
import "../sass/ProgressBar.scss";

export function ProgressBar({
  completion,
  title,
  color,
}: {
  completion: number;
  title: string;
  color: "rainbow" | "grayscale";
}) {
  return (
    <div className="progress-bar">
      <div className={`bar ${color}`} style={{ width: `${completion}%` }}>
        {title}
      </div>
    </div>
  );
}
