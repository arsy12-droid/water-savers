import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

// Only load weights actually used (reduced from 6 to 4 for smaller bundle)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  display: "swap",
});

const SITE_URL = "https://watersaversteam.space.z.ai";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Water Savers Team — Be The Change, Save Water",
  description:
    "Sebagai pelajar, kamu bisa mulai dari hal kecil yang berdampak besar. 10 langkah hemat air untuk generasi muda Indonesia.",
  keywords: [
    "hemat air",
    "Indonesia",
    "water savers",
    "krisis air",
    "generasi muda",
    "lingkungan",
    "water conservation",
    "save water",
    "Indonesian youth",
  ],
  authors: [{ name: "Water Savers Team", url: SITE_URL }],
  creator: "Water Savers Team",
  publisher: "Water Savers Team",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    title: "Water Savers Team — Be The Change, Save Water",
    description:
      "Sebagai pelajar, kamu bisa mulai dari hal kecil yang berdampak besar. 10 langkah hemat air untuk generasi muda Indonesia.",
    url: SITE_URL,
    siteName: "Water Savers Team",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Water Savers Team — Be The Change, Save Water",
    description:
      "10 langkah hemat air untuk generasi muda Indonesia. Mulai dari hal kecil yang berdampak besar.",
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Preconnect to external origins for faster resource loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Water Savers Team",
              url: SITE_URL,
              description:
                "Sekelompok pelajar Indonesia yang percaya bahwa perubahan besar dimulai dari kebiasaan kecil — khususnya hemat air.",
              foundingDate: "2025",
              sameAs: [],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Water Savers Team",
              url: SITE_URL,
              description:
                "Website edukasi hemat air untuk generasi muda Indonesia.",
              inLanguage: ["id-ID", "en"],
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
