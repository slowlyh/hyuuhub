// ============================================================
// app/layout.tsx — Root layout (glassmorphism, dark-only)
// ============================================================
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/navbar";
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
    default: "HyuuHub — Baca Manga, Manhwa & Manhua.",
    template: "%s — HyuuHub",
  },
  description:
    "Baca manga, manhwa, dan manhua gratis dengan tampilan bersih. Rilis terbaru, ranking, genre, dan reader vertikal — semua di satu tempat.",
  openGraph: {
    siteName: "HyuuHub",
    title: "HyuuHub — Baca Manga, Manhwa & Manhua.",
    description: "Baca manga, manhwa, dan manhua gratis. Cepat, minimalis, responsif.",
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
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh flex-col bg-background font-sans text-foreground">
        {/* gradient black stage — fixed, di belakang semua konten */}
        <div className="bg-stage" aria-hidden />
        <Navbar />
        <main className="fade-up flex-1">{children}</main>
        <footer className="mt-16 border-t border-stroke py-6">
          <div className="mx-auto max-w-6xl px-4 text-center text-xs text-dim">
            <p>
              HyuuHub — baca manga, manhwa & manhua. Data dari{" "}
              <a
                href="https://g.shinigami.asia"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/80 hover:underline"
              >
                Shinigami
              </a>{" "}
              (scraper adapter oleh ShanMolvyr).
            </p>
            <p className="mt-1">
              © {new Date().getFullYear()} HyuuHub. Semua konten milik penerbit/kreator aslinya.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
