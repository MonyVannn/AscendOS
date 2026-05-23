import Link from "next/link";
import { Calendar } from "@/components/ui/calendar";
import { IconArrowRight } from "@tabler/icons-react";

export function DashboardScheduledDrips() {
  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-border flex items-center justify-between">
        <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Scheduled Drips</h3>
        <Link href="/dashboard/scheduled-drips" className="group flex items-center text-sm font-medium text-accent hover-text-accent/80 hover:underline">
          Calendar 
          <IconArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>
      <div className="flex-1 p-6 flex flex-col items-center justify-center relative">
        <div className="pointer-events-none opacity-40">
          <Calendar
            mode="single"
            selected={new Date()}
            className="rounded-md border-0"
          />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-[1px]">
          <Badge variant="outline" className="bg-background mb-2">Coming soon</Badge>
          <p className="text-sm text-muted-foreground text-center max-w-[200px]">
            View and manage scheduled automations.
          </p>
        </div>
      </div>
    </div>
  );
}

function Badge({ children, className, ...props }: React.ComponentProps<"div"> & { variant?: "outline" }) {
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`} {...props}>
      {children}
    </div>
  );
}