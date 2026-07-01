"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { FieldValidCheck } from "@/components/ui/field-valid-check";

interface SelectFieldWithValidCheckProps {
  isValid: boolean;
  children: React.ReactNode;
  className?: string;
}

export function SelectFieldWithValidCheck({
  isValid,
  children,
  className,
}: SelectFieldWithValidCheckProps) {
  return (
    <div
      className={cn(
        "relative",
        isValid && "[&_[data-slot=select-trigger]>svg:last-of-type]:opacity-0",
        className
      )}
    >
      {children}
      <FieldValidCheck
        show={isValid}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none size-5"
      />
    </div>
  );
}
