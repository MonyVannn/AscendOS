export type ResourceCategory = "audio" | "document" | "video" | "image";

export type ResourceItem = {
  id: string;
  category: ResourceCategory;
  title: string;
  description: string;
  tag: string;
  shareCount: number;
  durationSeconds?: number;   // audio, video
  fileType?: string;          // document, image — "PDF", "DOCX", "PNG", "JPG"
  pageCount?: number;
  youtubeUrl?: string;        // video
};
