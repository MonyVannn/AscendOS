import { AgencyWebhooksClient } from "./agency-webhooks-client";

export const metadata = {
  title: "Agency Webhooks | AscendOS Admin",
};

export default async function AgencyWebhooksPage({
  params,
}: {
  params: Promise<{ agencyId: string }>;
}) {
  const { agencyId } = await params;
  return <AgencyWebhooksClient agencyId={agencyId} />;
}
