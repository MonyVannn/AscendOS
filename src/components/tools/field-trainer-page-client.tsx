"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FieldTrainerDripForm } from "./field-trainer-drip-form";
import { FieldTrainerReassignForm } from "./field-trainer-reassign-form";

interface FieldTrainerPageClientProps {
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

export function FieldTrainerPageClient({ user, agency }: FieldTrainerPageClientProps) {
  return (
    <Tabs defaultValue="start" className="w-full space-y-6">
      <TabsList className="w-full sm:w-auto grid grid-cols-3 h-auto p-1 bg-muted/50">
        <TabsTrigger value="start" className="text-sm py-2">
          Start Production Drip
        </TabsTrigger>
        <TabsTrigger value="reassign" className="text-sm py-2">
          Reassign Trainer
        </TabsTrigger>
        <TabsTrigger value="reposition" className="text-sm py-2">
          Reposition Agent
        </TabsTrigger>
      </TabsList>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <TabsContent value="start" className="m-0 border-0 p-0 focus-visible:outline-none focus-visible:ring-0">
          <FieldTrainerDripForm user={user} agency={agency} />
        </TabsContent>

        <TabsContent value="reassign" className="m-0 border-0 p-0 focus-visible:outline-none focus-visible:ring-0">
          <FieldTrainerReassignForm user={user} agency={agency} />
        </TabsContent>

        <TabsContent value="reposition" className="m-0 border-0 p-0 focus-visible:outline-none focus-visible:ring-0">
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center border border-border">
              <svg
                className="w-6 h-6 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-foreground">Reposition Agent</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                This feature is coming soon. You&apos;ll be able to reposition agents within the Field Trainer drip.
              </p>
            </div>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}
