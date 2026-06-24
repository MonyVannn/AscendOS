import { AgencyToolsClient } from "./agency-tools-client";

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
      <AgencyToolsClient agencyId={agencyId} />
    </div>
  );
}
