"use client";

import * as React from "react";
import { format } from "date-fns";
import { User, Phone, Mail, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";

interface BeastModeDripFormProps {
  agency: {
    slug: string;
  };
}

export function BeastModeDripForm({ agency }: BeastModeDripFormProps) {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [startDate, setStartDate] = React.useState<Date | undefined>();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const isFormValid = Boolean(
    firstName.trim() &&
      lastName.trim() &&
      email.trim() &&
      phone.trim() &&
      startDate
  );

  const handleSubmit = React.useCallback(async () => {
    if (!isFormValid || isSubmitting || !startDate) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/ghl/beast-mode-drip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          sales_academy_start_date: format(startDate, "yyyy-MM-dd"),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Hire submitted to Beast Mode + Quick Start drip");
        setFirstName("");
        setLastName("");
        setEmail("");
        setPhone("");
        setStartDate(undefined);
      } else {
        toast.error(data.error || "Failed to submit hire");
      }
    } catch {
      toast.error("Unexpected error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [isFormValid, isSubmitting, firstName, lastName, email, phone, startDate]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSubmit]);

  return (
    <div className="flex flex-col">
      <div className="p-6 md:p-8 space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/90">
              New Agent First Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="New Agent First Name"
                className="pl-9 h-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/90">
              New Agent Last Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="New Agent Last Name"
                className="pl-9 h-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/90">
              New Agent Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="New Agent Email"
                className="pl-9 h-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/90">
              Agent Phone # (Used to text agent)
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Agent Phone #"
                className="pl-9 h-10"
              />
            </div>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-foreground/90">
              Sales Academy Start Date (automation starts Friday)
            </label>
            <div className="max-w-md">
              <DatePicker
                date={startDate}
                onDateChange={setStartDate}
                placeholder="Sales Academy Start Date"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Button
            className="w-full h-11 text-base font-semibold uppercase tracking-wide"
            disabled={!isFormValid || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>

          <div className="flex items-center justify-between mt-4 text-[11px] text-muted-foreground px-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              <span>
                Will fire through GHL ·{" "}
                <strong className="font-medium text-foreground/80">{agency.slug}</strong>{" "}
                workspace
              </span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted/50 font-sans font-medium text-[10px]">
                ⌘
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted/50 font-sans font-medium text-[10px]">
                ↵
              </kbd>
              <span className="ml-1">to send</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
