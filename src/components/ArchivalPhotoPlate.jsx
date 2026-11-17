export default function ArchivalPhotoPlate({
  src,
  alt,
  caption,
  filmStock,
  aspectClass = "aspect-[4/3]",
  compact = false,
}) {
  if (!src) return null;

  return (
    <figure
      className={`border border-linen bg-[#EFE8DC] ${
        compact ? "p-2.5" : "p-3 sm:p-4"
      } shadow-[0_1px_2px_rgba(53,42,35,0.04)] transition-all duration-500`}
    >
      <div className={`overflow-hidden bg-linen/30 relative ${aspectClass}`}>
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="w-full h-full object-cover sepia-[0.18] contrast-[0.96] brightness-[0.98] group-hover:scale-[1.03] group-hover:sepia-[0.08] transition-all duration-700 ease-out"
        />
        <div
          aria-hidden="true"
          className="inset-0 absolute pointer-events-none border border-ink/10"
        />
      </div>

      {(caption || filmStock) && (
        <figcaption className="pt-2.5 flex items-baseline justify-between gap-2 text-walnut">
          {caption && (
            <span className="font-body italic text-xs leading-snug line-clamp-1">
              {caption}
            </span>
          )}
          {filmStock && (
            <span className="font-ui text-[10px] uppercase tracking-[0.14em] text-walnut/75 shrink-0">
              {filmStock}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}