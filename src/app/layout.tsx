import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import "./globals.css";
import { Providers } from "./providers/providers";
import { DATA } from "@/data/resume";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { OrganizationStructuredData, WebSiteStructuredData } from "@/components/seo/structured-data";
import { ProfileService } from "@/services/profile-service";

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

// Fetch profile data directly from DB (no HTTP round-trip)
async function getProfileData() {
  try {
    const profiles = await ProfileService.getAll();
    const profile = profiles[0] as any;
    return {
      name: profile?.name || DATA.name,
      description: profile?.description as string | undefined,
    };
  } catch (error) {
    console.error("Error fetching profile:", error);
    return { name: DATA.name };
  }
}

// Dynamic Metadata (title + description)
export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfileData();

  return {
    metadataBase: new URL(DATA.url),
    title: {
      default: `${profile.name} - Full Stack Web Developer | Portfolio`,
      template: `%s | ${profile.name}`,
    },
    description: profile.description || "Full Stack Web Developer specializing in React, Next.js, TypeScript, and Node.js. Building scalable web applications with great user experience and strong backend performance.",
    keywords: [
      "Muhammad Muzammil Khan",
      "Full Stack Developer",
      "Web Developer",
      "Next.js Developer",
      "React Developer",
      "TypeScript Developer",
      "Node.js Developer",
      "JavaScript Developer",
      "Frontend Developer",
      "Backend Developer",
      "Karachi Developer",
      "Pakistan Developer",
      "Portfolio",
      "Software Engineer",
      "Web Development",
      "React.js",
      "Next.js",
      "Tailwind CSS",
      "MongoDB",
      "PostgreSQL",
      "Docker",
      "Kubernetes",
    ],
    authors: [{ name: profile.name, url: DATA.url }],
    creator: profile.name,
    publisher: profile.name,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      title: `${profile.name} - Full Stack Web Developer`,
      description: profile.description || "Full Stack Web Developer specializing in React, Next.js, TypeScript, and Node.js. Building scalable web applications with great user experience and strong backend performance.",
      url: DATA.url,
      siteName: `${profile.name} Portfolio`,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${profile.name} - Full Stack Web Developer Portfolio`,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${profile.name} - Full Stack Web Developer`,
      description: profile.description || "Full Stack Web Developer specializing in React, Next.js, TypeScript, and Node.js.",
      images: ["/og-image.png"],
      creator: "@muzammilkhan",
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: DATA.url,
    },
    category: "technology",
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
        {/* SEO: Organization & WebSite Structured Data */}
        <OrganizationStructuredData
          name="Muhammad Muzammil"
          url={DATA.url}
          description="Full Stack Developer specializing in modern web technologies and software architecture"
          sameAs={[
            DATA.contact.social.GitHub.url,
            DATA.contact.social.LinkedIn.url,
          ]}
        />
        <WebSiteStructuredData
          name="Muhammad Muzammil - Full Stack Developer"
          url={DATA.url}
          description="Portfolio and blog of Muhammad Muzammil, showcasing software engineering projects and technical insights"
        />

        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
