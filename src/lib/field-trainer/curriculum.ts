export type FieldTrainerCurriculumBlock = { id: string; title: string; subtitle?: string };

export type FieldTrainerWeekColumn = {
  week: number;
  title: string;
  phaseLabel: string;
  blocks: FieldTrainerCurriculumBlock[];
};

export const FIELD_TRAINER_WEEK_COLUMNS: FieldTrainerWeekColumn[] = [
  {
    week: 0,
    title: "Week 0",
    phaseLabel: "Sales Academy → Beast Mode",
    blocks: [
    ],
  },
  {
    week: 1,
    title: "Week 1",
    phaseLabel: "Week 1 of Quick Start",
    blocks: [
    ],
  },
  {
    week: 2,
    title: "Week 2",
    phaseLabel: "Week 2 of Quick Start",
    blocks: [
    ],
  },
  {
    week: 3,
    title: "Week 3",
    phaseLabel: "Week 3 of Quick Start",
    blocks: [
    ],
  },
  {
    week: 4,
    title: "Week 4",
    phaseLabel: "Week 4 of Quick Start",
    blocks: [
    ],
  },
  {
    week: 5,
    title: "Week 5",
    phaseLabel: "Week 5 of Quick Start",
    blocks: [],
  },
];
