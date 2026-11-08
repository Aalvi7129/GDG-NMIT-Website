import type { Metadata } from "next";
import '@fontsource-variable/google-sans-code';
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ThemeListener from "@/components/ThemeListener";

export const metadata: Metadata = {
  title: "GDG NMIT",
  description: "Google Developer Groups - Nitte Meenakshi Institute of Technology",
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
