"use client";
import type { ReactNode } from "react";

export const blur =
  "bg-zinc-900 bg-opacity-40 backdrop-blur-xl border border-white border-opacity-10";

export const gradient = "bg-gradient-to-r from-rose-500 to-blue-800";
export const hoverGradient =
  "hover:bg-gradient-to-r hover:from-rose-500 hover:to-blue-800";
export const lightGradient = "bg-gradient-to-tr from-fuchsia-300 to-red-400";

interface ButtonProps {
  onClick?: () => void;
  children?: ReactNode;
  font?: string;
  radius?: string;
  padding?: string;
  bg?: string;
  isActive?: boolean;
  hover?: string;
  loading?: boolean;
  loadingText?: string;
  disabled?: any
}

export const ButtonTemplate = ({
  onClick,
  children,
  font,
  radius,
  padding,
  bg,
  hover,
  loading,
  loadingText,
  disabled
}: ButtonProps) => {
  const loadingStyle = loading
    ? "opacity-50 cursor-not-allowed pointer-events-none"
    : "";
  const disabledStyle = disabled && !loading
    ? "opacity-50 cursor-not-allowed pointer-events-none"
    : "";
  return (
    <div
      className={`Button flex shadow-lg ease-in-out active:scale-95 whitespace-nowrap w-full justify-center items-center
          ${padding} ${radius} ${bg} ${font} ${hover} ${loadingStyle} ${disabledStyle}`}
      onClick={loading || disabled ? undefined : onClick}
      role="button"
      tabIndex={disabled ? -1 : 2}
      aria-disabled={disabled}
    >
      {loading ? (
        <div className={`flex text-center`}>{loadingText}</div>
      ) : (
        <div className={`flex text-center`}>{children}</div>
      )}
    </div>
  );
};

export const ThemeButton = ({
  onClick,
  children,
  font,
  radius,
  padding,
  bg,
  hover,
  loading = false,
  loadingText = "Loading...",
  disabled
}: ButtonProps) => {
  const radiusStyle = radius || "rounded-full border-2 border-transparent";
  const paddingStyle = padding || "py-1 px-1.5 sm:py-2.5 sm:px-5";
  const bgStyle = bg || "bg-primary";
  const fontStyle = font || "text-white text-lg sm:font-medium font-outfit";
  const hoverStyle =
    (hover || hoverGradient) + `transition-all transition-colors duration-300`;

  return (
    <ButtonTemplate
      onClick={onClick}
      font={fontStyle}
      radius={radiusStyle}
      padding={paddingStyle}
      bg={bgStyle}
      hover={hoverStyle}
      loading={loading}
      loadingText={loadingText}
      disabled={disabled}
    >
      {children}
    </ButtonTemplate>
  );
};

export const FusciaButton = ({
  onClick,
  children,
  font,
  radius,
  padding,
  bg,
}: ButtonProps) => {
  const radiusStyle = radius || "rounded-full";
  const paddingStyle = padding || "py-1 px-1.5 sm:py-2.5 sm:px-5";
  const bgStyle = bg || "bg-gradient-to-tr from-fuchsia-300 to-red-400";
  const fontStyle =
    font ||
    "text-white text-xs sm:text-base font-base sm:font-medium font-outfit";

  return (
    <ButtonTemplate
      onClick={onClick}
      font={fontStyle}
      radius={radiusStyle}
      padding={paddingStyle}
      bg={bgStyle}
    >
      {children}
    </ButtonTemplate>
  );
};

export const FusciaText = ({ font, onClick, children }: ButtonProps) => {
  let cursor = "";
  if (onClick) {
    cursor = "cursor-pointer";
  }

  return (
    <div
      onClick={onClick}
      className={`${cursor} ${font} text-center text-transparent bg-gradient-to-tr from-fuchsia-300 to-red-400 bg-clip-text`}
    >
      {children}
    </div>
  );
};
