import React from "react";
import { useTheme } from "../contexts/ThemeContext";

interface RatingProps {
  score?: number;
  percentile?: number;
  description?: string;
}

export function Rating({
  score = 137,
  percentile = 20,
  description = "Developer rating = total score based on how users interact with the platform.",
}: RatingProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference * (1 - percentile / 100);

  const cardBackground = isLight
    ? "radial-gradient(circle at top, rgba(255,255,255,0.95), rgba(243,244,246,0.92))"
    : "radial-gradient(circle at top, rgba(45,47,68,0.8), rgba(10,10,15,0.95))";

  const cardShadow = isLight
    ? "0 25px 60px rgba(15,23,42,0.12)"
    : "0 35px 120px rgba(20,20,45,0.65)";

  const infoGlowColor = isLight
    ? "linear-gradient(90deg, rgba(59,130,246,0.35), rgba(147,51,234,0.45))"
    : "linear-gradient(90deg, rgba(59,130,246,0.45), rgba(147,51,234,0.55))";

  const baseTextClass = isLight ? "text-gray-600" : "text-gray-300";
  const subTextClass = isLight ? "text-gray-500" : "text-gray-400";
  const centerTextClass = isLight ? "text-gray-900" : "text-white";
  const centerBgClass = isLight ? "bg-white/80" : "bg-black/40";
  const circleTrackColor = isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.1)";
  const glowFilter = isLight
    ? "drop-shadow(0 0 8px rgba(92,145,255,0.35))"
    : "drop-shadow(0 0 12px rgba(92,145,255,0.55))";
  const gradientId = isLight ? "ratingGradientLight" : "ratingGradientDark";

  return (
    <div
      className={`rating-card relative flex flex-col items-start gap-12 overflow-hidden rounded-[24px] border ${
        isLight ? "border-black/5" : "border-white/10"
      } !px-8 py-10 md:flex-row md:items-center md:justify-between`}
      style={{
        background: cardBackground,
        boxShadow: cardShadow,
      }}
    >
      <div className={`relative flex flex-col gap-3 ${baseTextClass}`}>
        <div className="flex items-start gap-3 text-lg">
          <span
            className="text-2xl md:text-3xl"
            role="img"
            aria-label="trophy"
          >
            🏆
          </span>
          <p
            className={`max-w-2xl text-base md:text-lg ${
              isLight ? "text-gray-700" : "text-gray-200"
            }`}
          >
            {description}
          </p>
        </div>
        <p className={`text-sm md:text-base ${subTextClass}`}>
          Your score is{" "}
          <span className="font-semibold text-[#2F5CFB]">{score}</span>, you are in
          the top <span className="font-semibold text-[#2F5CFB]">{percentile}%</span>
          !
        </p>
        <div
          className="pointer-events-none absolute left-10 top-full h-6 w-56 -translate-y-1/2 rounded-full blur-2xl md:-ml-10"
          style={{
            background: infoGlowColor,
            opacity: isLight ? 0.55 : 0.68,
          }}
        />
      </div>

      <div className="relative flex items-center justify-center">
        <svg width={200} height={200} viewBox="0 0 200 200">
          <defs>
            <linearGradient
              id="ratingGradientDark"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#7C4DFF" />
              <stop offset="50%" stopColor="#5A8BFF" />
              <stop offset="100%" stopColor="#9CECFB" />
            </linearGradient>
            <linearGradient
              id="ratingGradientLight"
              x1="0%"
              y1="0%"
              x2="100%"
            >
              <stop offset="0%" stopColor="#7C4DFF" />
              <stop offset="45%" stopColor="#4C9EFF" />
              <stop offset="100%" stopColor="#6EE7F9" />
            </linearGradient>
          </defs>
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke={circleTrackColor}
            strokeWidth="14"
          />
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke={`url(#${gradientId})`}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
            transform="rotate(-90 100 100)"
            style={{ filter: glowFilter }}
          />
        </svg>
        <div
          className={`absolute flex h-24 w-24 flex-col items-center justify-center rounded-full ${centerBgClass} ${centerTextClass} backdrop-blur`}
        >
          <span className="text-3xl font-semibold">{percentile}%</span>
          <span
            className={`text-xs uppercase tracking-widest ${
              isLight ? "text-gray-500" : "text-gray-400"
            }`}
          >
            top
          </span>
        </div>
      </div>
    </div>
  );
}

