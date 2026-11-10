import type { Metadata } from "next";
import '@fontsource-variable/google-sans-code';
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ThemeListener from "@/components/ThemeListener";

// Absolute base for link previews (og:image etc. must be absolute URLs).
// Override with NEXT_PUBLIC_SITE_URL if the site moves to a custom domain.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://gdgnmit.vercel.app");

const description =
  "Google Developer Groups on Campus at Nitte Meenakshi Institute of Technology, Bengaluru. Empowering developers through collaboration, learning and innovation.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GDG NMIT | Google Developer Groups on Campus",
    template: "%s | GDG NMIT",
  },
  description,
  applicationName: "GDG NMIT",
  keywords: ["GDG", "GDG NMIT", "Google Developer Groups", "NMIT", "Nitte Meenakshi Institute of Technology", "Bengaluru", "tech community"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "GDG NMIT",
    title: "GDG NMIT | Google Developer Groups on Campus",
    description,
    url: "/",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "GDG NMIT | Google Developer Groups on Campus",
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/gdg.svg" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&d)){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className="font-sans antialiased bg-white dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-100 min-h-screen transition-colors duration-200"
      >
        <ThemeListener />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
