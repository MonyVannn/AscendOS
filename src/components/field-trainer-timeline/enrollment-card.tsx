import { Id } from "@/convex/_generated/dataModel";
import { User, Phone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { normalizePhone } from "@/lib/phone/normalize";

export interface TimelineEnrollment {
  _id: Id<"fieldTrainerEnrollments">;
  firstName: string;
  phone: string;
  currentWeek: number;
  fieldTrainer: string;
  programStatus: "active" | "completed" | "withdrawn";
  programStartedAt: number;
  weekEffectiveAt?: number;
  assignedRdName: string;
}

interface EnrollmentCardProps {
  enrollment: TimelineEnrollment;
  onSelect?: (enrollmentId: Id<"fieldTrainerEnrollments">) => void;
}

export function EnrollmentCard({ enrollment, onSelect }: EnrollmentCardProps) {
  // Extract initials
  const initials = enrollment.firstName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const isClickable = !!onSelect;

  return (
    <div 
      className={`bg-card border border-border rounded-xl shadow-sm p-4 flex flex-col gap-3 ${
        isClickable 
          ? "hover:shadow-md hover:ring-1 hover:ring-border transition-all cursor-pointer" 
          : "hover:shadow-md transition-shadow cursor-default"
      }`}
      onClick={() => onSelect?.(enrollment._id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.(enrollment._id);
        }
      }}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          {/* Avatar placeholder */}
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
            {initials || <User className="w-4 h-4" />}
          </div>
          <div>
            <div className="font-bold text-foreground text-sm line-clamp-1">
              {enrollment.firstName || "Unknown"}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <span className="font-medium text-foreground/70">{enrollment.fieldTrainer}</span>
              <span className="opacity-50">•</span>
              <span className="line-clamp-1">{enrollment.assignedRdName}</span>
            </div>
          </div>
        </div>
        
        {/* Status pill */}
        <div
          className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
            enrollment.programStatus === "completed"
              ? "bg-green-500/10 text-green-600 dark:text-green-400"
              : enrollment.programStatus === "active"
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                : "bg-muted text-muted-foreground"
          }`}
        >
          {enrollment.programStatus}
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
        {enrollment.phone && (
          <div className="flex items-center gap-1">
            <Phone className="w-3 h-3" />
            <span className="font-mono">{normalizePhone(enrollment.phone)}</span>
          </div>
        )}
        {enrollment.weekEffectiveAt && (
          <div title="Time in current week">
            ⏳ {formatDistanceToNow(enrollment.weekEffectiveAt)} in week
          </div>
        )}
      </div>
    </div>
  );
}
