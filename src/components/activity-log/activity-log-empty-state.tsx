"use client"

import * as React from "react"
import { Inbox } from "lucide-react"

export function ActivityLogEmptyState() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <Inbox className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">No submissions yet.</h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        Logs will appear here after your first automation is triggered through the Hub.
      </p>
    </div>
  )
}
