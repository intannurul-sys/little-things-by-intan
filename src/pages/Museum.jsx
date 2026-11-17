import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import ArchivalPhotoPlate from "../components/ArchivalPhotoPlate";

export default function Museum() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [activeMemory, setActiveMemory] = useState(null);

  useEffect(() => {
    async function fetchMuseumMemories() {
      setLoading(true);
      const { data, error } = await supabase
        .from("museum_memories")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const formatted = data.map((item) => ({
          id: item.id,
          archiveCode: item.archive_code,
          date: item.date_label,
          category: item.category,
          title: item.title,
          excerpt: item.excerpt,
          fullStory: Array.isArray(item.full_story)
            ? item.full_story
            : [item.full_story],
          artifactNote: item.artifact_note,
          location: item.location,
          imageUrl: item.image_url,
          photoCaption: item.photo_caption,
          filmStock: item.film_stock,
        }));
        setMemories(formatted);
      }
      setLoading(false);
    }

    fetchMuseumMemories();
  }, []);

  const categories = [
    "Semua",
    ...new Set(memories.map((item) => item.category)),
  ];

  const filteredMemories =
    selectedCategory === "Semua"
      ? memories
      : memories.filter((item) => item.category === selectedCategory);

  return (
    <div className="py-16 sm:py-20 animate-fadeIn">
      <header className="max-w-2xl pb-10 border-b border-linen/80">
        <p className="font-ui text-[11px] uppercase tracking-[0.25em] text-walnut mb-3">
          Arsip Publik — Koleksi Terkurasi
        </p>
        <h1 className="font-heading text-4xl sm:text-5xl text-ink mb-3">
          The Museum
        </h1>
        <p className="font-body text-base leading-relaxed text-walnut">
          Kepingan momen, tempat, dan benda-benda kecil yang dirawat agar tetap bernapas melampaui waktu.
        </p>
      </header>

      {memories.length > 0 && (
        <div className="pt-8 pb-10 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`font-ui text-[11px] uppercase tracking-[0.18em] px-4 py-2 border transition-colors ${
                selectedCategory === cat
                  ? "border-ink bg-ink text-ivory"
                  : "border-linen text-walnut hover:border-walnut hover:text-ink"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="pt-8 font-body italic text-walnut">Memuat ruang pamer...</p>
      ) : filteredMemories.length === 0 ? (
        <p className="pt-8 font-body italic text-walnut">
          Belum ada koleksi publik di ruang pamer ini.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {filteredMemories.map((item) => (
            <article
              key={item.id}
              onClick={() => setActiveMemory(item)}
              className="group cursor-pointer border border-linen/80 p-6 sm:p-8 bg-linen/10 hover:border-walnut transition-colors flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between font-ui text-[10px] uppercase tracking-[0.2em] text-walnut">
                  <span>
                    {item.archiveCode} — {item.category}
                  </span>
                  <span>{item.date}</span>
                </div>

                {item.imageUrl && (
                  <ArchivalPhotoPlate
                    src={item.imageUrl}
                    alt={item.title}
                    aspectClass="aspect-[16/10]"
                    compact
                  />
                )}

                <h2 className="font-heading text-2xl sm:text-3xl text-ink group-hover:text-walnut transition-colors">
                  {item.title}
                </h2>

                <p className="font-body text-sm leading-relaxed text-walnut">
                  {item.excerpt}
                </p>
              </div>

              <div className="pt-2 font-ui text-[10px] uppercase tracking-[0.2em] text-ink group-hover:translate-x-1 transition-transform">
                Baca Arsip Lengkap →
              </div>
            </article>
          ))}
        </div>
      )}

      {activeMemory && (
        <div
          onClick={() => setActiveMemory(null)}
          className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-[2px] flex items-center justify-center p-4 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-ivory border border-linen max-w-2xl w-full max-h-[88vh] overflow-y-auto p-6 sm:p-10 space-y-6"
          >
            <div className="flex items-start justify-between gap-4 border-b border-linen pb-4">
              <div>
                <p className="font-ui text-[10px] uppercase tracking-[0.22em] text-walnut mb-1">
                  {activeMemory.archiveCode} · {activeMemory.category} ·{" "}
                  {activeMemory.date}
                </p>
                <h2 className="font-heading text-3xl sm:text-4xl text-ink">
                  {activeMemory.title}
                </h2>
              </div>
              <button
                onClick={() => setActiveMemory(null)}
                className="p-1.5 text-walnut hover:text-ink border border-linen"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {activeMemory.imageUrl && (
              <ArchivalPhotoPlate
                src={activeMemory.imageUrl}
                alt={activeMemory.title}
                caption={activeMemory.photoCaption}
                aspectClass="aspect-[16/10]"
              />
            )}

            <div className="space-y-4 font-body text-base leading-[1.85] text-walnut">
              {activeMemory.fullStory?.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            {(activeMemory.artifactNote ||
              activeMemory.location ||
              activeMemory.filmStock) && (
              <div className="border-t border-linen pt-4 space-y-1.5 font-ui text-[11px] tracking-[0.12em] text-walnut">
                {activeMemory.location && (
                  <p>Lokasi: {activeMemory.location}</p>
                )}
                {activeMemory.filmStock && (
                  <p>Catatan Lensa: {activeMemory.filmStock}</p>
                )}
                {activeMemory.artifactNote && (
                  <p className="font-body italic text-xs pt-1">
                    “{activeMemory.artifactNote}”
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}