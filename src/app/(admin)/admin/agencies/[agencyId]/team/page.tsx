import { AgencyTeamClient } from "./agency-team-client";

export const metadata = {
  title: "Agency Team | AscendOS Admin",
};

export default async function AgencyTeamPage({
  params,
}: {
  params: Promise<{ agencyId: string }>;
}) {
  const { agencyId } = await params;
  return <AgencyTeamClient agencyId={agencyId} />;
}
