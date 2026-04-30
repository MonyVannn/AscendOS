import { db } from "../src/lib/db";

async function main() {
  console.log("Seeding database...");

  // 1. Upsert Agency
  const agency = await db.agency.upsert({
    where: { slug: "divinity-group" },
    update: {},
    create: {
      name: "Divinity Group",
      slug: "divinity-group",
      ghlWebhookUrl: "https://example.com/webhook",
      ghlApiKey: "secret_api_key_123",
      featuresArray: ["crm", "automations", "reporting"],
    },
  });

  // 2. Upsert AgencyTheme
  await db.agencyTheme.upsert({
    where: { agencyId: agency.id },
    update: {},
    create: {
      agencyId: agency.id,
      primaryColor: "#c8a96e",
      accentColor: "#e8c98e",
      backgroundColor: "#0f0f1a",
      sidebarColor: "#1a1a2e",
      textColor: "#f0f0f0",
      fontFamily: "Inter",
      borderRadius: "6px",
      dashboardTitle: "Divinity Hub",
    },
  });

  console.log("Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // If you need to explicitly disconnect, but note db is a global singleton
    // You can just exit
    process.exit(0);
  });
