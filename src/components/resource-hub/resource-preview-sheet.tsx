"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import dynamic from "next/dynamic";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import docx-preview dynamically so it doesn't break SSR (requires JSZip which relies on browser globals)
const ResourcePreviewDocx = dynamic(() => import("./resource-preview-docx"), {
  ssr: false,
  loading: () => <Skeleton className="w-full min-h-[50vh] rounded-md" />,
});

interface ResourcePreviewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceId: Id<"resources"> | null;
}

export function ResourcePreviewSheet({
  open,
  onOpenChange,
  resourceId,
}: ResourcePreviewSheetProps) {
  const resourceData = useQuery(
    api.resourceHub.getResourceFileUrl,
    resourceId ? { resourceId } : "skip"
  );

  const isLoading = resourceId !== null && resourceData === undefined;
  const isError = resourceId !== null && resourceData === null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[min(90vw,56rem)] sm:max-w-none flex flex-col gap-0 p-0"
      >
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="line-clamp-1 pr-6 text-xl">
            {isLoading ? <span className="inline-block h-7 w-64 animate-pulse rounded-md bg-muted" /> : resourceData?.title || "Preview"}
          </SheetTitle>
          <SheetDescription>
            {isLoading ? (
              <span className="inline-block h-4 w-32 mt-1 animate-pulse rounded-md bg-muted" />
            ) : resourceData?.fileType ? (
              `${resourceData.fileType} Document`
            ) : (
              "Resource Preview"
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-auto bg-muted/30 p-4 sm:p-6 flex flex-col">
          {isLoading && (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-[60vh] w-full rounded-xl" />
            </div>
          )}

          {isError && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-background rounded-xl border border-dashed">
              <AlertCircle className="h-10 w-10 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Could not load preview</h3>
              <p className="text-muted-foreground text-sm max-w-sm mb-6">
                The file might have been deleted, or you may not have permission to view it.
              </p>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          )}

          {resourceData && resourceData.url && (
            <div className="flex-1 bg-background rounded-xl shadow-sm border overflow-hidden flex flex-col">
              {/* PDF Preview */}
              {resourceData.contentType === "application/pdf" && (
                <iframe
                  src={resourceData.url}
                  title={resourceData.title}
                  className="w-full h-full min-h-[75vh] border-0"
                />
              )}

              {/* DOCX Preview */}
              {(resourceData.fileType === "DOCX" ||
                resourceData.contentType ===
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document") && (
                <ResourcePreviewDocx url={resourceData.url} />
              )}

              {/* Image Preview */}
              {resourceData.contentType?.startsWith("image/") && (
                <div className="flex-1 flex items-center justify-center p-4 min-h-[50vh]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resourceData.url}
                    alt={resourceData.title}
                    className="max-w-full max-h-[75vh] object-contain rounded-lg"
                  />
                </div>
              )}

              {/* Legacy DOC (application/msword) - Download Fallback */}
              {resourceData.fileType === "DOCX" && resourceData.contentType === "application/msword" && (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center min-h-[50vh]">
                  <div className="h-16 w-16 bg-accent/10 text-accent rounded-2xl flex items-center justify-center mb-6">
                    <FileText className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Legacy Document Format</h3>
                  <p className="text-muted-foreground mb-8 max-w-md">
                    In-browser preview is not supported for older .doc files. Please download the file to view it.
                  </p>
                  <Button asChild className="gap-2">
                    <a href={resourceData.url} download target="_blank" rel="noreferrer">
                      <Download className="h-4 w-4" />
                      Download File
                    </a>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
