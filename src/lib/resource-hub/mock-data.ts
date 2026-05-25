import { ResourceItem } from "./types";

export const RESOURCE_TAGS = [
  { label: "Mindset", color: "bg-orange-500" },
  { label: "Sales", color: "bg-blue-500" },
  { label: "Licensing", color: "bg-emerald-500" },
  { label: "Onboarding", color: "bg-purple-500" },
  { label: "Reference", color: "bg-zinc-500" },
  { label: "Compliance", color: "bg-red-500" },
];

export const MOCK_RESOURCES: ResourceItem[] = [
  // OU
  {
    id: "ou-1",
    category: "audio",
    title: "Mindset of a Closer",
    description: "Daily mental reps for staying in the chair when leads go cold.",
    tag: "Mindset",
    shareCount: 18,
    durationSeconds: 1934, // 32:14
  },
  {
    id: "ou-2",
    category: "audio",
    title: "Licensing Walkthrough — Pt. 1",
    description: "Step-by-step state exam prep — covers ethics and contracts.",
    tag: "Licensing",
    shareCount: 31,
    durationSeconds: 2822, // 47:02
  },
  {
    id: "ou-3",
    category: "audio",
    title: "Objection Handling Drills",
    description: "Live role-plays for the five objections you hear every week.",
    tag: "Sales",
    shareCount: 24,
    durationSeconds: 1308, // 21:48
  },
  {
    id: "ou-4",
    category: "audio",
    title: "Morning Huddle Recording",
    description: "Last Monday's huddle — weekly priorities and quota recap.",
    tag: "Mindset",
    shareCount: 9,
    durationSeconds: 750, // 12:30
  },
  {
    id: "ou-5",
    category: "audio",
    title: "Phone Tonality Coaching",
    description: "How pace, pitch and pauses move a prospect off the fence.",
    tag: "Sales",
    shareCount: 15,
    durationSeconds: 1735, // 28:55
  },
  {
    id: "ou-6",
    category: "audio",
    title: "Belief Stacking Exercise",
    description: "Guided 18-minute drill to lock in conviction before dials.",
    tag: "Mindset",
    shareCount: 6,
    durationSeconds: 1102, // 18:22
  },

  // Documents
  {
    id: "doc-1",
    category: "document",
    title: "Recruit Onboarding Checklist",
    description: "Day-1 through day-30 milestones every new agent must hit.",
    tag: "Onboarding",
    shareCount: 42,
    fileType: "PDF",
    pageCount: 4,
  },
  {
    id: "doc-2",
    category: "document",
    title: "Pre-Licensing Study Guide",
    description: "Full study companion with practice questions and key terms.",
    tag: "Licensing",
    shareCount: 33,
    fileType: "PDF",
    pageCount: 28,
  },
  {
    id: "doc-3",
    category: "document",
    title: "Carrier Quick Reference Sheet",
    description: "At-a-glance carrier appetites, commissions and turnaround.",
    tag: "Reference",
    shareCount: 51,
    fileType: "PDF",
    pageCount: 2,
  },
  {
    id: "doc-4",
    category: "document",
    title: "Compensation Plan Overview",
    description: "Comp tiers, overrides and bonuses explained in plain English.",
    tag: "Reference",
    shareCount: 19,
    fileType: "PDF",
    pageCount: 6,
  },
  {
    id: "doc-5",
    category: "document",
    title: "Field Trainer Handbook",
    description: "Coaching playbook for trainers running their first cohort.",
    tag: "Onboarding",
    shareCount: 12,
    fileType: "PDF",
    pageCount: 14,
  },
  {
    id: "doc-6",
    category: "document",
    title: "Compliance Reminders — Q2",
    description: "Updated DNC rules, disclosures and recording requirements.",
    tag: "Compliance",
    shareCount: 0,
    fileType: "PDF",
    pageCount: 3,
  },

  // Videos
  {
    id: "vid-1",
    category: "video",
    title: "Objection Handling Masterclass",
    description: "Deep dive into the psychology of overcoming objections.",
    tag: "Sales",
    shareCount: 56,
    durationSeconds: 3600, // 60:00
    youtubeUrl: "https://youtube.com/watch?v=123",
  },
  {
    id: "vid-2",
    category: "video",
    title: "Agency Vision & Mission",
    description: "Our core values and where we are heading this year.",
    tag: "Mindset",
    shareCount: 112,
    durationSeconds: 1245, // 20:45
    youtubeUrl: "https://youtube.com/watch?v=124",
  },
  {
    id: "vid-3",
    category: "video",
    title: "Navigating the CRM",
    description: "How to use our CRM to track leads and commissions.",
    tag: "Onboarding",
    shareCount: 89,
    durationSeconds: 950, // 15:50
    youtubeUrl: "https://youtube.com/watch?v=125",
  },
  {
    id: "vid-4",
    category: "video",
    title: "Advanced Product Training",
    description: "Understanding complex products for high-net-worth clients.",
    tag: "Licensing",
    shareCount: 41,
    durationSeconds: 2700, // 45:00
    youtubeUrl: "https://youtube.com/watch?v=126",
  },
  {
    id: "vid-5",
    category: "video",
    title: "Compliance Do's and Don'ts",
    description: "Essential compliance rules for all agents.",
    tag: "Compliance",
    shareCount: 77,
    durationSeconds: 1800, // 30:00
    youtubeUrl: "https://youtube.com/watch?v=127",
  },
  {
    id: "vid-6",
    category: "video",
    title: "Building Referral Networks",
    description: "How to generate consistent referrals from existing clients.",
    tag: "Sales",
    shareCount: 63,
    durationSeconds: 2100, // 35:00
    youtubeUrl: "https://youtube.com/watch?v=128",
  }
];
