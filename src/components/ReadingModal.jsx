import { useEffect } from "react";
import ArchivalPhotoPlate from "./ArchivalPhotoPlate";

export default function ReadingModal({ memory, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!memory) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-ink/45 backdrop-blur-[2px] flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-ivory border border-linen max-w-2xl w-full max-h-[88vh] overflow-y-auto p-7 sm:p-12 shadow-sm relative"
      >
        <div className="flex items-center justify-between pb-5 mb-8 border-b border-linen/80">
          <span className="font-ui text-[11px] uppercase tracking-[0.22em] text-walnut">
            Arsip No. {memory.id} · {memory.category}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="font-ui text-xs uppercase tracking-[0.18em] text-walnut hover:text-ink border border-linen px-3 py-1 transition-colors"
          >
            Tutup ✕
          </button>
        </div>

        <header className="mb-8 space-y-2">
          <time className="font-body italic text-sm text-walnut block">
            {memory.date} — {memory.location}
          </time>
          <h2 className="font-heading text-3xl sm:text-4xl text-ink leading-tight">
            {memory.title}
          </h2>
        </header>

        {memory.imageUrl && (
          <div className="mb-8">
            <ArchivalPhotoPlate
              src={memory.imageUrl}
              alt={memory.title}
              caption={memory.photoCaption}
              filmStock={memory.filmStock}
              aspectClass="aspect-[16/10]"
            />
          </div>
        )}

        <div className="space-y-5 font-body text-base leading-[1.85] text-ink/90">
          {(memory.fullStory || [memory.excerpt]).map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <footer className="mt-10 pt-6 border-t border-linen/80">
          <p className="font-ui text-[11px] uppercase tracking-[0.18em] text-walnut">
            Keterangan Arsip
          </p>
          <p className="font-body italic text-sm text-walnut mt-1">
            {memory.artifactNote}
          </p>
        </footer>
      </div>
    </div>
  );
}