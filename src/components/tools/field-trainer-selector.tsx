"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FIELD_TRAINER_OPTIONS } from "@/lib/ghl/field-trainer-options";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export interface FieldTrainerSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function FieldTrainerSelector({
  value,
  onValueChange,
  placeholder = "Select Trainer",
}: FieldTrainerSelectorProps) {
  const selectedTrainer = FIELD_TRAINER_OPTIONS.find((t) => t.value === value);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full pl-9 h-12 text-left bg-input/30">
        <SelectValue placeholder={placeholder}>
          {selectedTrainer ? (
            <div className="flex items-center gap-2 truncate">
              <span className="font-medium text-foreground">{selectedTrainer.label}</span>
              <span className="text-muted-foreground hidden sm:inline">
                {selectedTrainer.email}
              </span>
            </div>
          ) : (
            placeholder
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent position="popper" className="w-[var(--radix-select-trigger-width)]">
        <SelectGroup>
          {FIELD_TRAINER_OPTIONS.map((t) => {
            const initials = t.label
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase();
            
            return (
              <SelectItem key={t.value} value={t.value} className="py-2.5">
                <div className="w-full flex items-center pr-20 min-w-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="size-9 border border-border shrink-0">
                      <AvatarFallback className="bg-background text-foreground text-xs font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium truncate text-foreground leading-tight">{t.label}</span>
                      <span className="text-xs font-medium text-muted-foreground truncate leading-tight mt-0.5">
                        {t.email}
                      </span>
                    </div>
                  </div>
                  <div className="absolute right-9 top-1/2 -translate-y-1/2 flex flex-col items-end">
                    <span className="font-medium text-foreground leading-tight text-sm">
                      {t.role}
                    </span>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
