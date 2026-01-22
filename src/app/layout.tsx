import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import "./globals.css";
import { Providers } from "./providers/providers";
import { DATA } from "@/data/resume";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

// Font setup with display swap for performance
const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const fontDisplay = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["700", "800"],
  display: "swap",
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
    keywords: [
      "Full Stack Developer",
      "Web Developer",
      "Next.js Developer",
      "React Developer",
      "TypeScript",
      "Portfolio",
      "Software Engineer",
      profile.name,
    ],
    authors: [{ name: profile.name }],
    creator: profile.name,
    openGraph: {
      title: profile.name,
      description: profile.description,
      url: DATA.url,
      siteName: profile.name,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${profile.name} - Portfolio`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: profile.name,
      description: profile.description,
      images: ["/og-image.png"],
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
    alternates: {
      canonical: DATA.url,
    },
  };
}

// Root Layout
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="lenis lenis-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-white dark:bg-[#000045] font-sans antialiased mx-auto transition-colors duration-300",
          fontSans.variable,
          fontDisplay.variable
        )}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
