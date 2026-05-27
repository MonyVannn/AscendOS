"use client";

import * as React from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { RESOURCE_TAGS } from "@/lib/resource-hub/mock-data";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, PlaySquare, FileText, Headphones, Image as ImageIcon } from "lucide-react";
import { ResourceCategory } from "@/lib/resource-hub/types";

interface AddResourceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCategory?: ResourceCategory;
}

export function AddResourceSheet({ open, onOpenChange, defaultCategory }: AddResourceSheetProps) {
  const [category, setCategory] = React.useState<ResourceCategory>(defaultCategory || "document");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [tag, setTag] = React.useState(RESOURCE_TAGS[0].label);
  const [youtubeUrl, setYoutubeUrl] = React.useState("");
  const [durationSeconds, setDurationSeconds] = React.useState("");
  const [pageCount, setPageCount] = React.useState("");
  
  // Upload state
  const [file, setFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const generateUploadUrl = useMutation(api.resourceHub.generateResourceUploadUrl);
  const finalizeUpload = useMutation(api.resourceHub.finalizeResourceUpload);
  const createResource = useMutation(api.resourceHub.createResource);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setCategory(defaultCategory || "document");
      setTitle("");
      setDescription("");
      setTag(RESOURCE_TAGS[0].label);
      setYoutubeUrl("");
      setDurationSeconds("");
      setPageCount("");
      setFile(null);
      setIsUploading(false);
    }
    onOpenChange(newOpen);
  };

  React.useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCategory(defaultCategory || "document");
    }
  }, [open, defaultCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !tag) return alert("Please fill in required fields.");

    setIsUploading(true);
    try {
      let storageId: Id<"_storage"> | undefined;
      let fileType: string | undefined;
      let contentType: string | undefined;

      if (category === "audio" || category === "document" || category === "image") {
        if (!file) return alert("Please select a file to upload.");
        
        // 1. Generate Upload URL
        const uploadUrl = await generateUploadUrl();
        
        // 2. Post file
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!result.ok) throw new Error("Failed to upload file");
        
        const json = await result.json() as { storageId: Id<"_storage"> };
        
        // 3. Finalize
        const finalized = await finalizeUpload({
          category,
          storageId: json.storageId,
        });
        
        storageId = finalized.storageId;
        fileType = finalized.fileType;
        contentType = finalized.contentType;
      }

      await createResource({
        category,
        title,
        description,
        tag,
        storageId,
        fileType,
        contentType,
        youtubeUrl: category === "video" ? youtubeUrl : undefined,
        durationSeconds: durationSeconds ? parseInt(durationSeconds, 10) : undefined,
        pageCount: pageCount ? parseInt(pageCount, 10) : undefined,
      });

      onOpenChange(false);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to create resource");
    } finally {
      setIsUploading(false);
    }
  };

  const isVideo = category === "video";
  const isDocument = category === "document";
  const isAudio = category === "audio";
  const isImage = category === "image";

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full p-6 sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Add Resource</SheetTitle>
          <SheetDescription>Upload a new document, image, audio, or video resource.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Button
                  type="button"
                  variant={isDocument ? "default" : "outline"}
                  className="w-full text-xs"
                  onClick={() => { setCategory("document"); setFile(null); }}
                >
                  <FileText className="w-4 h-4 mr-1" /> Document
                </Button>
                <Button
                  type="button"
                  variant={isImage ? "default" : "outline"}
                  className="w-full text-xs"
                  onClick={() => { setCategory("image"); setFile(null); }}
                >
                  <ImageIcon className="w-4 h-4 mr-1" /> Image
                </Button>
                <Button
                  type="button"
                  variant={isAudio ? "default" : "outline"}
                  className="w-full text-xs"
                  onClick={() => { setCategory("audio"); setFile(null); }}
                >
                  <Headphones className="w-4 h-4 mr-1" /> Audio
                </Button>
                <Button
                  type="button"
                  variant={isVideo ? "default" : "outline"}
                  className="w-full text-xs"
                  onClick={() => { setCategory("video"); setFile(null); }}
                >
                  <PlaySquare className="w-4 h-4 mr-1" /> Video
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Title *</label>
              <Input 
                required 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="e.g. Sales Script v2" 
                disabled={isUploading}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Description *</label>
              <textarea 
                required
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Brief summary..."
                disabled={isUploading}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Tag *</label>
              <Select 
                value={tag} 
                onValueChange={setTag} 
                disabled={isUploading}
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Select a tag" />
                </SelectTrigger>
                <SelectContent>
                  {RESOURCE_TAGS.map(t => (
                    <SelectItem key={t.label} value={t.label}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isVideo && (
              <div>
                <label className="text-sm font-medium mb-1 block">YouTube URL *</label>
                <Input 
                  required 
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={e => setYoutubeUrl(e.target.value)}
                  disabled={isUploading}
                />
              </div>
            )}

            {(isAudio || isDocument || isImage) && (
              <div>
                <label className="text-sm font-medium mb-1 block">File *</label>
                <div className="flex gap-2 items-center">
                  <Input 
                    type="file" 
                    ref={fileInputRef}
                    required={!file}
                    accept={
                      isDocument ? "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" :
                      isImage ? "image/png,image/jpeg,image/webp,image/gif,image/svg+xml" :
                      "audio/mpeg,audio/mp3,audio/mp4,audio/wav,audio/ogg,audio/x-m4a"
                    }
                    onChange={(e) => {
                      if (e.target.files?.[0]) setFile(e.target.files[0]);
                    }}
                    disabled={isUploading}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isDocument ? "PDF or DOCX up to 25MB." : 
                   isImage ? "PNG, JPG, WEBP, GIF, SVG up to 25MB." :
                   "MP3, WAV, M4A up to 25MB."}
                </p>
              </div>
            )}

            {(isAudio || isVideo) && (
              <div>
                <label className="text-sm font-medium mb-1 block">Duration (seconds)</label>
                <Input 
                  type="number" 
                  min="1"
                  placeholder="e.g. 120"
                  value={durationSeconds}
                  onChange={e => setDurationSeconds(e.target.value)}
                  disabled={isUploading}
                />
              </div>
            )}

            {isDocument && (
              <div>
                <label className="text-sm font-medium mb-1 block">Page Count</label>
                <Input 
                  type="number" 
                  min="1"
                  placeholder="e.g. 5"
                  value={pageCount}
                  onChange={e => setPageCount(e.target.value)}
                  disabled={isUploading}
                />
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Add Resource"
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
