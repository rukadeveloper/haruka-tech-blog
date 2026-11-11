import Link from "next/link";
import HeaderNav from "./HeaderNav";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/85 backdrop-blur-md">
      <div className="container-page relative flex h-14 items-center sm:justify-between">
        <Link href="/" className="text-lg font-extrabold tracking-tight sm:mr-auto">
          eunhaa<span className="text-strong"> tech</span>
        </Link>
        <HeaderNav
          adminLink={
            <Link href="/admin" className="nav-link">
              Admin
            </Link>
          }
        />
      </div>
    </header>
  );
}
