import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `font-ui text-xs uppercase tracking-[0.2em] transition-colors duration-300 ${
      isActive
        ? "text-ink border-b border-ink pb-1"
        : "text-walnut hover:text-ink"
    }`;

  return (
    <header className="w-full border-b border-linen/80 bg-ivory/95 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-6 sm:px-10 h-20 flex items-center justify-between">
        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
          className="font-heading text-2xl sm:text-[26px] italic tracking-wide text-ink hover:opacity-80 transition-opacity duration-300"
        >
          little things by intan
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          <NavLink to="/" end className={navLinkClass}>
            Beranda
          </NavLink>
          <NavLink to="/museum" className={navLinkClass}>
            The Museum
          </NavLink>
          <NavLink to="/diary" className={navLinkClass}>
            The Diary
          </NavLink>
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle Menu"
          className="md:hidden font-ui text-xs uppercase tracking-[0.18em] text-walnut hover:text-ink border border-linen px-3 py-1.5 transition-colors duration-300"
        >
          {menuOpen ? "Tutup" : "Menu"}
        </button>
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t border-linen/80 bg-ivory px-6 py-6 flex flex-col gap-5 animate-fadeIn">
          <NavLink
            to="/"
            end
            onClick={() => setMenuOpen(false)}
            className={navLinkClass}
          >
            Beranda
          </NavLink>
          <NavLink
            to="/museum"
            onClick={() => setMenuOpen(false)}
            className={navLinkClass}
          >
            The Museum
          </NavLink>
          <NavLink
            to="/diary"
            onClick={() => setMenuOpen(false)}
            className={navLinkClass}
          >
            The Diary
          </NavLink>
        </nav>
      )}
    </header>
  );
}