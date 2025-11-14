import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import "./globals.css";
import { Providers } from "./providers/providers";
import { DATA } from "@/data/resume";
import { Inter as FontSans } from "next/font/google";

// ✅ Font setup
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

// ✅ Fetch profile data (single object)
async function getProfileData() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error("Failed to fetch profile data");

    const data = await res.json();

    return {
      name: data?.name || DATA.name,
      description: data?.description ,
    };
  } catch (error) {
    console.error("Error fetching profile:", error);
    return { name: DATA.name };
  }
}

// ✅ Dynamic Metadata (title + description)
export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfileData();

  return {
    metadataBase: new URL(DATA.url),
    title: {
      default: profile.name,
      template: `%s | ${profile.name}`,
    },
    
    description: profile.description,
    openGraph: {
      title: profile.name,
      description: profile.description,
      url: DATA.url,
      siteName: profile.name,
      locale: "en_US",
      type: "website",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: "",
      yandex: "",
    },
  };
}

// ✅ Root Layout
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased mx-auto",
          fontSans.variable
        )}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
