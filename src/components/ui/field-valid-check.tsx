"use client";

import * as React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { cn } from "@/lib/utils";

interface FieldValidCheckProps {
  show: boolean;
  className?: string;
}

export function FieldValidCheck({ show, className }: FieldValidCheckProps) {
  if (!show) return null;

  return (
    <DotLottieReact
      src="/animations/Success.lottie"
      autoplay
      speed={2}
      loop={false}
      className={cn("size-6 shrink-0", className)}
    />
  );
}
