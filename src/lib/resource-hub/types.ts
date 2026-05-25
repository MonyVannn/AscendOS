export type ResourceCategory = "audio" | "document" | "video";

export type ResourceItem = {
  id: string;
  category: ResourceCategory;
  title: string;
  description: string;
  tag: string;
  shareCount: number;
  durationSeconds?: number;   // audio, video
  fileType?: string;          // document, machine — "PDF", "DOCX"
  pageCount?: number;
  youtubeUrl?: string;        // video — for future backend
};
