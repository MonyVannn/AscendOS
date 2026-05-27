import { Metadata } from "next";
import { SharePageClient } from "./share-page-client";

export const metadata: Metadata = {
  title: "Shared Resource",
  description: "View shared resource",
};

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <SharePageClient token={token} />;
}
