"use client";

import * as React from "react";
import { renderAsync } from "docx-preview";
import { Loader2 } from "lucide-react";

interface ResourcePreviewDocxProps {
  url: string;
}

export default function ResourcePreviewDocx({ url }: ResourcePreviewDocxProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;

    async function renderDocx() {
      if (!containerRef.current) return;
      try {
        setLoading(true);
        setError(null);
        // Clear previous content
        containerRef.current.innerHTML = "";

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch document");
        }

        const arrayBuffer = await response.arrayBuffer();
        
        if (!active) return;
        
        await renderAsync(arrayBuffer, containerRef.current, undefined, {
          className: "docx",
          inWrapper: false,
          ignoreWidth: false,
          ignoreHeight: false,
          ignoreFonts: false,
          breakPages: true,
          experimental: true,
        });

      } catch (err) {
        if (!active) return;
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to load document");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    const currentContainer = containerRef.current;

    renderDocx();

    return () => {
      active = false;
      if (currentContainer) {
        currentContainer.innerHTML = "";
      }
    };
  }, [url]);

  return (
    <div className="relative flex-1 w-full flex flex-col items-center overflow-y-auto">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <p className="text-sm text-muted-foreground">Loading document...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <p className="text-destructive mb-2">Could not load document</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      )}

      {/* 
        docx-preview will inject its own styles. 
        We use a wrapper to ensure it doesn't overflow our sheet and scroll properly.
      */}
      <div 
        ref={containerRef} 
        className="w-full bg-white [&_.docx]:!shadow-none [&_.docx]:!mx-auto [&_.docx]:!my-0 [&_.docx]:!p-4 sm:[&_.docx]:!p-8" 
      />
    </div>
  );
}
