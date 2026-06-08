import { AgencyWebhooksClient } from "./agency-webhooks-client";
import { AgencyFeaturesClient } from "./agency-features-client";

export const metadata = {
  title: "Agency Settings | AscendOS Admin",
};

export default async function AgencySettingsPage({
  params,
}: {
  params: Promise<{ agencyId: string }>;
}) {
  const { agencyId } = await params;
  return (
    <div className="space-y-12">
      <AgencyFeaturesClient agencyId={agencyId} />
      <AgencyWebhooksClient agencyId={agencyId} />
    </div>
  );
}
