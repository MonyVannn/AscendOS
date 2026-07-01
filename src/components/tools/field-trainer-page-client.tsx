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
  enabledIntegrations: string[];
}

export function FieldTrainerPageClient({ user, agency, enabledIntegrations }: FieldTrainerPageClientProps) {
  const hasDrip = enabledIntegrations.includes("field-trainer-drip");
  const hasReposition = enabledIntegrations.includes("field-trainer-reposition");

  const defaultTab = hasDrip ? "start" : hasReposition ? "reposition" : "start";

  if (!hasDrip && !hasReposition) {
    return (
      <div className="p-8 text-center border border-border rounded-xl bg-card">
        <h3 className="font-semibold text-foreground mb-2">Integrations Not Enabled</h3>
        <p className="text-sm text-muted-foreground">Field Trainer integrations have not been enabled for this agency.</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue={defaultTab} className="w-full space-y-6">
      <TabsList className="w-full sm:w-auto inline-flex items-center justify-start overflow-x-auto">
        {hasDrip && (
          <>
            <TabsTrigger value="start">
              Start Production Drip
            </TabsTrigger>
            <TabsTrigger value="reassign">
              Reassign Trainer
            </TabsTrigger>
          </>
        )}
        {hasReposition && (
          <TabsTrigger value="reposition">
            Reposition Agent
          </TabsTrigger>
        )}
      </TabsList>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {hasDrip && (
          <>
            <TabsContent value="start" className="m-0 border-0 p-0 focus-visible:outline-none focus-visible:ring-0">
              <FieldTrainerDripForm user={user} agency={agency} />
            </TabsContent>

            <TabsContent value="reassign" className="m-0 border-0 p-0 focus-visible:outline-none focus-visible:ring-0">
              <FieldTrainerReassignForm user={user} agency={agency} />
            </TabsContent>
          </>
        )}

        {hasReposition && (
          <TabsContent value="reposition" className="m-0 border-0 p-0 focus-visible:outline-none focus-visible:ring-0">
            <FieldTrainerRepositionForm user={user} agency={agency} />
          </TabsContent>
        )}
      </div>
    </Tabs>
  );
}
