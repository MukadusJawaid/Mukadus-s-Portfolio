import type { Metadata, Viewport } from "next";
import { Azeret_Mono, Bricolage_Grotesque } from "next/font/google";
import { site } from "@/features/seo/site";
import { TransitionOverlay } from "@/features/transition/TransitionOverlay";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const azeret = Azeret_Mono({
  variable: "--font-azeret",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  keywords: [...site.keywords],
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  category: "technology",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    title: site.title,
    description: site.description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  // Paste the code from Google Search Console into NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION to verify ownership.
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } : undefined,
};

export const viewport: Viewport = {
  themeColor: site.themeColor,
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  // the on-screen keyboard shrinks the page instead of pushing it up, so the terminal sheet stays above the keyboard
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: browser extensions add attributes to <html> before React loads (this is not a bug in the app)
    <html
      lang="en"
      className={`${bricolage.variable} ${azeret.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        {children}
        <TransitionOverlay />
      </body>
    </html>
  );
}
