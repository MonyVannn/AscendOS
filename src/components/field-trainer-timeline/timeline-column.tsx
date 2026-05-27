import { CurriculumBlockCard } from "./curriculum-block-card";
import { EnrollmentCard, TimelineEnrollment } from "./enrollment-card";
import { FieldTrainerWeekColumn } from "@/lib/field-trainer/curriculum";
import type { Id } from "@/convex/_generated/dataModel";

interface TimelineColumnProps {
  column: FieldTrainerWeekColumn;
  enrollments: TimelineEnrollment[];
  onSelect?: (enrollmentId: Id<"fieldTrainerEnrollments">) => void;
}

export function TimelineColumn({ column, enrollments, onSelect }: TimelineColumnProps) {
  return (
    <div className="flex flex-col w-[320px] min-w-[320px] bg-muted/30 rounded-2xl border border-border/50 shrink-0 h-full max-h-full">
      {/* Column Header */}
      <div className="p-4 border-b border-border/50 bg-background/50 rounded-t-2xl sticky top-0 z-10">
        <h3 className="font-bold text-foreground text-base mb-1">{column.title}</h3>
        <p className="text-xs text-muted-foreground mb-3">{column.phaseLabel}</p>
        
        <div className="flex items-center text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          <span>{enrollments.length} {enrollments.length === 1 ? 'agent' : 'agents'}</span>
          <span className="mx-1.5 opacity-50">•</span>
          <span>{column.blocks.length} {column.blocks.length === 1 ? 'block' : 'blocks'}</span>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Curriculum Blocks */}
        {column.blocks.length > 0 && (
          <div className="space-y-3 pb-3 border-b border-border/50 border-dashed">
            {column.blocks.map((block) => (
              <CurriculumBlockCard key={block.id} block={block} />
            ))}
          </div>
        )}

        {/* Enrollments */}
        <div className="space-y-3">
          {enrollments.length > 0 ? (
            enrollments.map((enrollment) => (
              <EnrollmentCard key={enrollment._id} enrollment={enrollment} onSelect={onSelect} />
            ))
          ) : (
            <div className="text-center py-6">
              <p className="text-xs text-muted-foreground italic">No agents in this week</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
