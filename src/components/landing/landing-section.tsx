import { cn } from "@/lib/utils";

type LandingSectionVariant = "wheat" | "tint" | "oceanic" | "nectarine";

const VARIANT_CLASSES: Record<LandingSectionVariant, string> = {
  wheat: "bg-[var(--landing-wheat)] text-[var(--landing-onyx)]",
  tint: "bg-[var(--landing-oceanic-tint)] text-[var(--landing-onyx)]",
  oceanic: "bg-[var(--landing-oceanic)] text-[var(--landing-wheat)]",
  nectarine: "bg-[var(--landing-nectarine)] text-[var(--landing-onyx)]",
};

interface LandingSectionProps {
  id?: string;
  variant?: LandingSectionVariant;
  className?: string;
  children: React.ReactNode;
}

export function LandingSection({
  id,
  variant = "wheat",
  className,
  children,
}: LandingSectionProps) {
  return (
    <section
      id={id}
      className={cn("relative scroll-mt-16", VARIANT_CLASSES[variant], className)}
    >
      {children}
    </section>
  );
}
