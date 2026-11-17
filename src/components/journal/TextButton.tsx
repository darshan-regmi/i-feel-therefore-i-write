"use client";

import type { ButtonHTMLAttributes } from "react";

type Variant = "underline" | "plain" | "error" | "filled";

export default function TextButton({
  variant = "underline",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={`text-button text-button--${variant} ${className}`.trim()}
    >
      {children}
    </button>
  );
}
