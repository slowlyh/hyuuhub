import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-bold tracking-tighter text-muted-foreground/30">404</p>
      <h1 className="mt-2 text-xl font-semibold">Halaman tidak ditemukan</h1>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Donghua atau episode yang kamu cari mungkin sudah dihapus atau salah alamat.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
      >
        Kembali ke Home
      </Link>
    </div>
  );
}
