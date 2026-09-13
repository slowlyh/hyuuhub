import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="grad-text text-7xl font-bold tracking-tighter">404</p>
      <h1 className="mt-2 text-xl font-semibold">Judul atau chapter tidak ditemukan</h1>
      <p className="mt-1 max-w-sm text-sm text-dim">
        Manga yang kamu cari mungkin sudah tidak tersedia di source, atau slug-nya salah.
      </p>
      <Link href="/" className="btn-accent mt-6 px-5 py-2.5 text-sm">
        Kembali ke Home
      </Link>
    </div>
  );
}
