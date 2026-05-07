import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, DM_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { getTenantContext } from "@/lib/tenant";
import { buildAgencyThemeStyle } from "@/lib/agency-theme-css-vars";
import { AgencyThemeHydration } from "@/components/agency-theme-hydration";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AscendOS",
  description: "Agency Hub",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let tenant = null;
  try {
    tenant = await getTenantContext();
  } catch (e) {
    console.error("Failed to fetch tenant context in root layout", e);
  }

  const themeStyle = buildAgencyThemeStyle(tenant?.theme, tenant?.user?.role);

  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        inter.variable,
        dmSans.variable,
        geistSans.variable,
        geistMono.variable,
        "font-sans"
      )}
      style={themeStyle}
    >
      <body className="min-h-full flex flex-col">
        <AgencyThemeHydration tenant={tenant} />
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
