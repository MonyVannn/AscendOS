import { FieldTrainerCurriculumBlock } from "@/lib/field-trainer/curriculum";

export function CurriculumBlockCard({ block }: { block: FieldTrainerCurriculumBlock }) {
  return (
    <div className="bg-muted/50 border border-border rounded-xl shadow-sm p-3 flex flex-col gap-1.5">
      <div className="text-sm font-semibold text-foreground/90">{block.title}</div>
      {block.subtitle && (
        <div className="text-xs text-muted-foreground">{block.subtitle}</div>
      )}
    </div>
  );
}
