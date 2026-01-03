import "./globals.css";
import { getServerSession } from "next-auth";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import { ThemeProvider } from "@/components/ThemeProvider/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle/ThemeToggle";
import SessionProvider from "@/components/SessionProvider/SessionProvider";
import SmoothScrollProvider from "@/components/Providers/SmoothScrollProvider";
import ToastProvider from "@/components/Providers/ToastProvider";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import StructuredData, { generateWebSiteSchema, generateOrganizationSchema } from "@/components/SEO/StructuredData";

export const metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://sabrvalues.com"),
  title: {
    default: "Sabrvalues - Brainrot Valuation Platform",
    template: "%s | Sabrvalues",
  },
  description: "Valuation data, statistics, and trading utilities for Steal a Brainrot. Check brainrot values, calculate trades, and browse the complete item database with mutations and traits.",
  keywords: ["Steal a Brainrot", "brainrot values", "roblox trading", "brainrot calculator", "trade values", "mutations", "traits", "LGC"],
  authors: [{ name: "Sabrvalues Team" }],
  creator: "Sabrvalues",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sabrvalues.com",
    siteName: "Sabrvalues",
    title: "Sabrvalues - Brainrot Valuation Platform",
    description: "Valuation data, statistics, and trading utilities for Steal a Brainrot. Check brainrot values, calculate trades, and browse the complete item database.",
    images: [
      {
        url: "/images/og-thumbnail.webp",
        width: 1200,
        height: 630,
        alt: "Sabrvalues - Brainrot Valuation Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sabrvalues - Brainrot Valuation Platform",
    description: "Valuation data, statistics, and trading utilities for Steal a Brainrot.",
    images: ["/images/og-thumbnail.webp"],
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
    // Add Google Search Console verification when available
    // google: "your-verification-code",
  },
};

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);
  const baseUrl = process.env.NEXTAUTH_URL || "https://sabrvalues.com";

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <StructuredData data={generateWebSiteSchema({ baseUrl })} />
        <StructuredData data={generateOrganizationSchema({ baseUrl })} />
      </head>
      <body
        className="antialiased bg-white dark:bg-[#020617] text-[#020617] dark:text-white transition-colors duration-300"
      >
        <SessionProvider session={session}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Navbar />
            <SmoothScrollProvider>
              <ToastProvider>
                {children}
                <Footer />
                <ThemeToggle />
              </ToastProvider>
            </SmoothScrollProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
