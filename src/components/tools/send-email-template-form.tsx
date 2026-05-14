"use client";

import * as React from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Tag,
  Sparkles,
  Lock,
  Copy,
  AlertTriangle,
  Info,
  Send,
  ChevronDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const MOCK_TEMPLATES = [
  { id: "1", label: "Ask For Referrals" },
  { id: "2", label: "Follow Up - No Show" },
  { id: "3", label: "Welcome - New Client" },
  { id: "4", label: "Annual Review Reminder" },
];

interface SendEmailTemplateFormProps {
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

export function SendEmailTemplateForm({ user, agency }: SendEmailTemplateFormProps) {
  const [firstName, setFirstName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [template, setTemplate] = React.useState("1");
  const [copied, setCopied] = React.useState(false);

  const isProfileComplete = Boolean(
    user.name?.trim() && user.email?.trim() && user.bookingLink?.trim()
  );

  const isFormValid = Boolean(
    firstName.trim() && email.trim() && template && isProfileComplete
  );

  const copyBookingLink = () => {
    if (user.bookingLink) {
      navigator.clipboard.writeText(user.bookingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSend = () => {
    if (!isFormValid) return;
    console.debug("Sending email payload:", {
      contact: { firstName, email, company },
      template,
      agent: { name: user.name, email: user.email, bookingLink: user.bookingLink },
    });
    // Stubbed until backend pass
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleSend();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFormValid, firstName, email, company, template, user]);

  return (
    <div className="flex flex-col">
      {/* Section 1: Contact Info */}
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-6 h-6 rounded-full border border-border text-xs font-semibold shrink-0 mt-0.5 bg-muted/30">
            1
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold leading-none text-foreground">Contact Info</h3>
            <p className="text-sm text-muted-foreground">Who is receiving this email?</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 pl-10">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/90">Contact First Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Tomás"
                className="pl-9 h-10"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/90">Contact Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. tomas.rivera@example.com"
                className="pl-9 h-10"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/90">
              Contact Company <span className="text-muted-foreground font-normal">· optional</span>
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Brightway Insurance"
                className="pl-9 h-10"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/90">Email Template</label>
            <div className="relative">
              <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="flex h-10 w-full min-w-0 rounded-4xl border border-input bg-input/30 px-3 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 appearance-none md:text-sm pl-9 cursor-pointer"
              >
                {MOCK_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
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

        <div className="pt-6">
          <Button 
            className="w-full h-11 text-base font-semibold bg-[#0f62fe] hover:bg-[#0f62fe]/90 text-white border-0"
            disabled={!isFormValid}
            onClick={handleSend}
          >
            Send
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
