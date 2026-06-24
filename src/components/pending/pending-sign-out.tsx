"use client";

import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function PendingSignOut() {
  return (
    <SignOutButton redirectUrl="/sign-in">
      <Button variant="outline" className="mt-6">
        Sign out
      </Button>
    </SignOutButton>
  );
}
