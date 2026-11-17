export default function Footer() {
  return (
    <footer className="w-full border-t border-linen/80 mt-24">
      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <p className="font-heading italic text-lg text-ink">
            little things by intan
          </p>
          <p className="font-body text-xs text-walnut mt-1">
            Sebuah ruang arsip kecil untuk ingatan, kata, dan hal-hal sederhana.
          </p>
        </div>

        <p className="font-ui text-[11px] uppercase tracking-[0.18em] text-walnut">
          © {new Date().getFullYear()} — Arsip Digital Personal
        </p>
      </div>
    </footer>
  );
}