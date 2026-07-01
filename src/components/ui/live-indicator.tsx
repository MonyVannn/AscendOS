"use client";

import * as React from "react";
import { DotLottieReact, type DotLottie } from "@lottiefiles/dotlottie-react";
import { cn } from "@/lib/utils";

interface LiveIndicatorProps {
  active?: boolean;
  className?: string;
}

export function LiveIndicator({ active = false, className }: LiveIndicatorProps) {
  const dotLottieRef = React.useRef<DotLottie | null>(null);

  React.useEffect(() => {
    const player = dotLottieRef.current;
    if (!player) return;

    if (active) {
      player.play();
    } else {
      player.stop();
    }
  }, [active]);

  const handleRef = React.useCallback(
    (instance: DotLottie | null) => {
      dotLottieRef.current = instance;
      if (!instance) return;

      if (active) {
        instance.play();
      } else {
        instance.stop();
      }
    },
    [active],
  );

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600",
        className,
      )}
    >
      <DotLottieReact
        src="/animations/live.lottie"
        autoplay={false}
        loop
        dotLottieRefCallback={handleRef}
        className="h-6 w-6 shrink-0"
      />
      Live
    </div>
  );
}
