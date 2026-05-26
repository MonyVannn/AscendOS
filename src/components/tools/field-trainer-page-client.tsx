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
          <FieldTrainerRepositionForm user={user} agency={agency} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
