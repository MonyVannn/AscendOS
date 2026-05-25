"use client";

import * as React from "react";
import Link from "next/link";
import {
  User,
  Phone,
  Sparkles,
  Lock,
  Copy,
  AlertTriangle,
  Info,
  Mail,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FIELD_TRAINER_OPTIONS } from "@/lib/ghl/field-trainer-options";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface FieldTrainerDripFormProps {
  user: {
    name?: string;
    email?: string;
    bookingLink?: string;
  };
  agency: {
    name: string;
    slug: string;
  };
}

export function FieldTrainerDripForm({ user, agency }: FieldTrainerDripFormProps) {
  const [firstName, setFirstName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [trainer, setTrainer] = React.useState<string>("");
  const [copied, setCopied] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const isProfileComplete = Boolean(
    user.name?.trim() && user.email?.trim() && user.bookingLink?.trim()
  );

  const isFormValid = Boolean(
    firstName.trim() && phone.trim() && trainer && isProfileComplete
  );

  const copyBookingLink = () => {
    if (user.bookingLink) {
      navigator.clipboard.writeText(user.bookingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSend = React.useCallback(async () => {
    if (!isFormValid || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Phase 1 stub: no actual API call
      console.log("Stub submission payload:", {
        first_name: firstName,
        phone,
        trainer,
      });
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.success("Submission UI ready — backend connection coming soon");
      
      setFirstName("");
      setPhone("");
      setTrainer("");
    } catch {
      toast.error("Unexpected error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [isFormValid, isSubmitting, firstName, phone, trainer]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleSend();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSend]);

  return (
    <div className="flex flex-col">
      {/* Section 1: Agent Info */}
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-6 h-6 rounded-full border border-border text-xs font-semibold shrink-0 mt-0.5 bg-muted/30">
            1
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold leading-none text-foreground">Agent Info</h3>
            <p className="text-sm text-muted-foreground">Who are you submitting to the Field Trainer drip?</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 pl-10">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/90">Agent First Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Alex"
                className="pl-9 h-10"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/90">Agent Phone #</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. (555) 123-4567"
                className="pl-9 h-10"
              />
            </div>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-foreground/90">Select Trainer</label>
            <div className="relative">
              <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
              <Select value={trainer} onValueChange={setTrainer}>
                <SelectTrigger className="w-full pl-9 h-10">
                  <SelectValue placeholder="Select Trainer" />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TRAINER_OPTIONS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Section 2: Agent Info */}
      <div className="p-6 md:p-8 space-y-6 bg-muted">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-6 h-6 rounded-full border border-border text-xs font-semibold shrink-0 mt-0.5 bg-muted/50">
              2
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold leading-none text-foreground">Your Agent Info</h3>
              <p className="text-sm text-muted-foreground">Pulled from your profile · read-only</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-background shadow-sm shrink-0">
            <Lock className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Locked</span>
          </div>
        </div>

        <div className="space-y-5 pl-10">
          {!isProfileComplete && (
            <div className="flex gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-500 mt-0.5" />
              <div className="text-sm space-y-1">
                <div className="font-semibold text-amber-800 dark:text-amber-300">Your profile is incomplete.</div>
                <div className="text-amber-700 dark:text-amber-400/80">
                  Some fields are missing. Please <Link href="/dashboard/settings/profile" className="font-semibold underline decoration-amber-400 dark:decoration-amber-600 underline-offset-4 hover:text-amber-900 dark:hover:text-amber-200">update your Settings</Link> before sending.
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/80">
                Your Name
              </label>
              {user.name?.trim() ? (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <div className="flex items-center h-10 px-3 pl-9 border border-dashed border-border rounded-4xl bg-background/50 text-sm text-foreground">
                    {user.name}
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-600 dark:text-amber-500" />
                  <div className="flex items-center h-10 px-3 pl-9 border border-dashed border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/10 text-sm text-amber-700 dark:text-amber-500 rounded-4xl">
                    <span className="italic">Not set in profile</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/80">
                Your Email
              </label>
              {user.email?.trim() ? (
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <div className="flex items-center h-10 px-3 pl-9 border border-dashed border-border rounded-4xl bg-background/50 text-sm text-foreground">
                    {user.email}
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-600 dark:text-amber-500" />
                  <div className="flex items-center h-10 px-3 pl-9 border border-dashed border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/10 text-sm text-amber-700 dark:text-amber-500 rounded-4xl">
                    <span className="italic">Not set in profile</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/80">
              Your Booking Link
            </label>
            {user.bookingLink?.trim() ? (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <div className="flex items-center justify-between h-10 pl-9 pr-1 border border-dashed border-border rounded-4xl bg-background/50 text-sm group">
                  <span className="text-muted-foreground truncate font-mono text-xs">{user.bookingLink}</span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 rounded-full px-3 text-muted-foreground hover:text-foreground shrink-0 bg-background border border-border shadow-sm opacity-90 group-hover:opacity-100 transition-opacity"
                    onClick={copyBookingLink}
                  >
                    {copied ? <span className="text-emerald-600 dark:text-emerald-500 text-xs font-medium">Copied!</span> : <><Copy className="w-3.5 h-3.5 mr-1" /> Copy</>}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-600 dark:text-amber-500" />
                <div className="flex items-center h-10 px-3 pl-9 border border-dashed border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/10 text-sm text-amber-700 dark:text-amber-500 rounded-4xl">
                  <span className="italic">Not set in profile</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl border border-border bg-background shadow-sm text-sm text-muted-foreground">
            <Info className="w-4 h-4 shrink-0" />
            <span>This information is pulled from your profile. To update it, go to <Link href="/dashboard/settings/profile" className="font-semibold text-foreground hover:underline underline-offset-4 decoration-border">Settings → Agent Profile</Link>.</span>
          </div>
        </div>

        <div className="pt-6 pl-10">
          <Button 
            className="w-full h-11 text-base font-semibold bg-[#0f62fe] hover:bg-[#0f62fe]/90 text-white border-0"
            disabled={!isFormValid || isSubmitting}
            onClick={handleSend}
          >
            {isSubmitting ? "Sending..." : "Submit"}
          </Button>
          
          <div className="flex items-center justify-between mt-4 text-[11px] text-muted-foreground px-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              <span>Will fire through GHL · <strong className="font-medium text-foreground/80">{agency.slug}</strong> workspace</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted/50 font-sans font-medium text-[10px]">⌘</kbd>
              <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted/50 font-sans font-medium text-[10px]">↵</kbd>
              <span className="ml-1">to send</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
