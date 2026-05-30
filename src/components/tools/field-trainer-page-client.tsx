"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FieldTrainerDripForm } from "./field-trainer-drip-form";
import { FieldTrainerReassignForm } from "./field-trainer-reassign-form";
import { FieldTrainerRepositionForm } from "./field-trainer-reposition-form";

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

const tabTriggerClassName =
  "h-full px-4 text-sm font-medium rounded-md text-foreground/70 data-active:bg-zinc-800 data-active:text-white dark:data-active:bg-zinc-200 dark:data-active:text-zinc-900 dark:data-active:shadow-none";

export function FieldTrainerPageClient({ user, agency }: FieldTrainerPageClientProps) {
  return (
    <Tabs defaultValue="start" className="w-full space-y-6">
      <TabsList className="h-10 w-full sm:w-auto inline-flex items-center justify-start gap-1 rounded-lg border border-border bg-white p-1 shadow-sm dark:bg-zinc-950 overflow-x-auto">
        <TabsTrigger value="start" className={tabTriggerClassName}>
          Start Production Drip
        </TabsTrigger>
        <TabsTrigger value="reassign" className={tabTriggerClassName}>
          Reassign Trainer
        </TabsTrigger>
        <TabsTrigger value="reposition" className={tabTriggerClassName}>
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
          <FieldTrainerRepositionForm user={user} agency={agency} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
