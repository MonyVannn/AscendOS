"use client";

import { useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, AlertCircle } from "lucide-react";
import ResourcePreviewDocx from "@/components/resource-hub/resource-preview-docx";

interface SharePageClientProps {
  token: string;
}

export function SharePageClient({ token }: SharePageClientProps) {
  const resourceData = useQuery(api.resourceShares.getSharedResourceByToken, { token });
  const recordOpen = useMutation(api.resourceShares.recordShareOpen);

  useEffect(() => {
    if (resourceData) {
      recordOpen({ token }).catch(console.error);
    }
  }, [resourceData, recordOpen, token]);

  if (resourceData === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (resourceData === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
        <div className="bg-background border rounded-xl p-8 max-w-md w-full text-center shadow-sm">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Link Unavailable</h1>
          <p className="text-muted-foreground">
            This resource link is invalid or has been revoked by the sender.
          </p>
        </div>
      </div>
    );
  }

  const { resource, agency } = resourceData;

  const renderContent = () => {
    if (resource.category === "video" && resource.youtubeUrl) {
      const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
      };
      const videoId = getYoutubeId(resource.youtubeUrl);
      
      if (videoId) {
        return (
          <div className="aspect-video w-full rounded-lg overflow-hidden border bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        );
      }
      return (
        <div className="p-8 text-center border rounded-lg bg-muted/30">
          <a href={resource.youtubeUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
            Watch on YouTube
          </a>
        </div>
      );
    }

    if (!resource.fileUrl) {
      return (
        <div className="p-8 text-center border rounded-lg bg-muted/30">
          <p className="text-muted-foreground">File is not available.</p>
        </div>
      );
    }

    if (resource.category === "image") {
      return (
        <div className="rounded-lg overflow-hidden border bg-muted/30 flex items-center justify-center p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={resource.fileUrl} 
            alt={resource.title} 
            className="max-w-full max-h-[70vh] object-contain rounded"
          />
        </div>
      );
    }

    if (resource.category === "audio") {
      return (
        <div className="p-8 border rounded-lg bg-muted/30 flex flex-col items-center justify-center gap-6">
          <div className="w-full max-w-md">
            <audio controls className="w-full" src={resource.fileUrl}>
              Your browser does not support the audio element.
            </audio>
          </div>
        </div>
      );
    }

    if (resource.category === "document") {
      if (resource.fileType === "PDF") {
        return (
          <div className="w-full h-[80vh] rounded-lg overflow-hidden border bg-muted/30">
            <iframe src={resource.fileUrl} className="w-full h-full" />
          </div>
        );
      }
      if (resource.fileType === "DOCX" || resource.fileType === "DOC") {
        return (
          <div className="w-full h-[80vh] rounded-lg overflow-hidden border bg-white">
            <ResourcePreviewDocx url={resource.fileUrl} />
          </div>
        );
      }
      return (
        <div className="p-8 text-center border rounded-lg bg-muted/30">
          <a href={resource.fileUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
            Download Document
          </a>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <header className="bg-background border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="font-semibold text-lg">{agency.name}</div>
      </header>
      
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {resource.title}
          </h1>
          {resource.description && (
            <p className="text-muted-foreground text-base max-w-3xl">
              {resource.description}
            </p>
          )}
        </div>

        <div className="bg-background rounded-xl shadow-sm border p-4 sm:p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
