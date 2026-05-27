"use client";

import * as React from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ResourceItem } from "@/lib/resource-hub/types";
import { Id } from "@/convex/_generated/dataModel";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Link as LinkIcon, Mail, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface ShareResourceSheetProps {
  resource: ResourceItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareResourceSheet({ resource, open, onOpenChange }: ShareResourceSheetProps) {
  const [copied, setCopied] = React.useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = React.useState(false);
  const [isSendingContact, setIsSendingContact] = React.useState(false);

  const [contactName, setContactName] = React.useState("");
  const [contactEmail, setContactEmail] = React.useState("");

  const shares = useQuery(
    api.resourceShares.listSharesForResource,
    resource ? { resourceId: resource.id as Id<"resources"> } : "skip"
  );

  const createLinkShare = useMutation(api.resourceShares.createLinkShare);
  const revokeShare = useMutation(api.resourceShares.revokeShare);

  const handleCopyLink = async () => {
    if (!resource) return;
    setIsGeneratingLink(true);
    try {
      const { token } = await createLinkShare({ resourceId: resource.id as Id<"resources"> });
      const shareUrl = `${window.location.origin}/share/${token}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate link");
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleSendContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resource || !contactEmail) return;
    setIsSendingContact(true);
    try {
      const response = await fetch("/api/ghl/share-resource", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceId: resource.id,
          first_name: contactName,
          email: contactEmail,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send to contact");
      }

      toast.success("Resource sent to contact successfully");
      setContactName("");
      setContactEmail("");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to send resource");
    } finally {
      setIsSendingContact(false);
    }
  };

  const handleRevoke = async (shareId: Id<"resourceShares">) => {
    try {
      await revokeShare({ shareId });
      toast.success("Share revoked");
    } catch (error) {
      console.error(error);
      toast.error("Failed to revoke share");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full p-6 sm:max-w-md flex flex-col h-full">
        <SheetHeader>
          <SheetTitle>Share Resource</SheetTitle>
          <SheetDescription>
            Share "{resource?.title}" via link or send directly to a contact.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 p-6 overflow-y-auto mt-6">
          <Tabs defaultValue="link" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="link">Copy Link</TabsTrigger>
              <TabsTrigger value="contact">Send to Contact</TabsTrigger>
            </TabsList>
            <TabsContent value="link" className="mt-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Generate a public link</label>
                <p className="text-sm text-muted-foreground">
                  Anyone with this link can view the resource until you revoke it.
                </p>
                <Button 
                  onClick={handleCopyLink} 
                  disabled={isGeneratingLink}
                  className="w-full mt-2"
                >
                  {isGeneratingLink ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : copied ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <LinkIcon className="h-4 w-4 mr-2" />
                  )}
                  {copied ? "Copied!" : "Generate & Copy Link"}
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="contact" className="mt-4 space-y-4">
              <form onSubmit={handleSendContact} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Contact Name (Optional)</label>
                  <Input 
                    id="name" 
                    placeholder="John Doe" 
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Contact Email / Phone</label>
                  <Input 
                    id="email" 
                    placeholder="john@example.com" 
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isSendingContact || !contactEmail}
                  className="w-full"
                >
                  {isSendingContact ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4 mr-2" />
                  )}
                  Send via GHL
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-8">
            <h3 className="text-sm font-medium mb-4">Active Shares</h3>
            {shares === undefined ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : shares.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center p-4 border rounded-lg bg-muted/30">
                No active shares for this resource.
              </p>
            ) : (
              <div className="space-y-3">
                {shares.map((share) => (
                  <div key={share._id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {share.shareType === "link" ? "Link Share" : share.contactName || share.contactEmail || "Contact Share"}
                        </span>
                        {share.revokedAt ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">
                            Revoked
                          </span>
                        ) : share.openedAt ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 font-medium">
                            Opened
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                            Not opened
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(share.sharedAt, { addSuffix: true })}
                        {share.openCount > 0 && ` · ${share.openCount} opens`}
                      </div>
                    </div>
                    {!share.revokedAt && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRevoke(share._id)}
                        title="Revoke access"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
