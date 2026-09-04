import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { themeInitScript } from "@/components/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://hyuuhub.vercel.app"
  ),
  title: {
    default: "HyuuHub — Your Donghua Hub.",
    template: "%s — HyuuHub",
  },
  description:
    "Discover, track, and watch donghua (Chinese animation) for free. Latest releases, schedules, and streaming — all in one clean place.",
  openGraph: {
    siteName: "HyuuHub",
    title: "HyuuHub — Your Donghua Hub.",
    description: "Discover, track, and watch donghua for free.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border py-6">
          <div className="mx-auto max-w-6xl px-4 text-center text-xs text-muted-foreground">
            <p>HyuuHub — Your Donghua Hub.</p>
            <p className="mt-1">
              © {new Date().getFullYear()} HyuuHub. Data dari anichin.cafe.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
