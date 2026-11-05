import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="text-lg font-extrabold tracking-tight">
          eunhaa<span className="text-strong"> tech</span>
        </Link>
        <nav className="flex items-center gap-6 text-[15px] font-medium">
          <Link href="/" className="hover:text-strong">Blog</Link>
          <Link href="/about" className="hover:text-strong">About</Link>
          <Link href="/guestbook" className="hover:text-strong">방명록</Link>
          <Link href="/admin" className="text-meta hover:text-foreground">Admin</Link>
        </nav>
      </div>
    </header>
  );
}
