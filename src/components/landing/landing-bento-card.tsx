import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type LandingBentoCardProps = {
  label: string;
  headline: string;
  imageSrc: string;
  imageAlt: string;
  accentClass: string;
  className?: string;
  imageClassName?: string;
  imageWidth: number;
  imageHeight: number;
};

export function LandingBentoCard({
  label,
  headline,
  imageSrc,
  imageAlt,
  accentClass,
  className,
  imageClassName,
  imageWidth,
  imageHeight,
}: LandingBentoCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm transition-all hover:shadow-md",
        className
      )}
    >
      {/* Header Area */}
      <div className="flex flex-col p-6 pb-0 md:p-8 md:pb-0">
        <div className="mb-2 text-xs font-bold tracking-wider text-[var(--landing-onyx-muted)] uppercase md:text-sm">
          {label}
        </div>
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-bold tracking-tight text-[var(--landing-onyx)] md:text-2xl">
            {headline}
          </h3>
          <Link
            href="/sign-in"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--landing-onyx)] text-[var(--landing-wheat)] transition-transform group-hover:scale-105"
            aria-label={`Get started with ${label}`}
          >
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Visual Area */}
      <div className={cn("mt-6 flex-1 overflow-hidden pl-6 pt-6 pr-0 pb-0 md:mt-8 md:pl-8 md:pt-8", accentClass)}>
        <div className="relative ml-auto h-full w-full origin-bottom-right overflow-hidden rounded-tl-2xl border-l border-t border-black/10 bg-white shadow-[-8px_-8px_24px_rgba(0,0,0,0.04)] transition-transform duration-500 group-hover:scale-[1.02]">
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={imageWidth}
            height={imageHeight}
            className={cn("h-full w-full object-cover object-left-top", imageClassName)}
            quality={90}
          />
        </div>
      </div>
    </div>
  );
}
