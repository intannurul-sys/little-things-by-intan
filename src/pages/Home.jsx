import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import ArchivalPhotoPlate from "../components/ArchivalPhotoPlate";

export default function Home() {
  const [featuredPlates, setFeaturedPlates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeaturedMemories() {
      setLoading(true);
      const { data, error } = await supabase
        .from("museum_memories")
        .select("*")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(3);

      if (!error && data) {
        const formatted = data.map((item) => ({
          id: item.archive_code || item.id,
          title: item.title,
          date: item.date_label,
          location: item.location || "Arsip Pribadi",
          imageUrl: item.image_url,
        }));
        setFeaturedPlates(formatted);
      }
      setLoading(false);
    }

    loadFeaturedMemories();
  }, []);

  return (
    <div className="py-16 sm:py-24 animate-fadeIn">
      {/* Hero Section */}
      <section className="max-w-2xl mx-auto text-center space-y-6 pb-16 sm:pb-20 border-b border-linen/80">
        <p className="font-ui text-[11px] uppercase tracking-[0.28em] text-walnut">
          Edisi Arsip &amp; Catatan Personal
        </p>

        <h1 className="font-heading text-4xl sm:text-6xl font-normal leading-[1.15] text-ink">
          Menyimpan hal-hal kecil agar tidak hilang ditelan waktu.
        </h1>

        <p className="font-body text-base sm:text-lg leading-relaxed text-walnut pt-2">
          Selamat datang di <span className="italic text-ink">little things by intan</span>—sebuah museum digital dan buku harian bergaya klasik untuk merawat potongan cerita, arsip foto analog, serta renungan sunyi.
        </p>
      </section>

      {/* Sorotan Arsip Foto */}
      <section className="py-16 sm:py-20 border-b border-linen/80">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-10">
          <div>
            <p className="font-ui text-[11px] uppercase tracking-[0.22em] text-walnut mb-1.5">
              Sorotan Koleksi Visual
            </p>
            <h2 className="font-heading text-3xl text-ink">
              Beberapa Lembar dari Arsip Foto
            </h2>
          </div>
          <Link
            to="/museum"
            className="font-ui text-[11px] uppercase tracking-[0.18em] text-walnut hover:text-ink border-b border-linen pb-1 self-start sm:self-auto transition-colors"
          >
            Lihat Seluruh Arsip →
          </Link>
        </div>

        {loading ? (
          <p className="font-body italic text-walnut">Memuat sorotan arsip...</p>
        ) : featuredPlates.length === 0 ? (
          <p className="font-body italic text-walnut">
            Belum ada foto yang disorot ke Beranda. Unggah melalui The Diary dengan opsi &ldquo;Upload Beranda (Public)&rdquo;.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {featuredPlates.map((item) => (
              <Link
                key={item.id}
                to="/museum"
                className="group text-left block focus:outline-none"
              >
                <ArchivalPhotoPlate
                  src={item.imageUrl}
                  alt={item.title}
                  caption={`Arsip No. ${item.id} — ${item.location}`}
                  aspectClass="aspect-[4/3]"
                  compact
                />
                <h3 className="font-heading text-xl text-ink mt-3 group-hover:text-walnut transition-colors">
                  {item.title}
                </h3>
                <p className="font-body italic text-xs text-walnut mt-0.5">
                  {item.date}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Dua Navigasi Utama */}
      <section className="pt-16 sm:pt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
          <Link
            to="/museum"
            className="group block border border-linen p-8 sm:p-10 bg-ivory hover:bg-linen/20 transition-all duration-500"
          >
            <div className="flex items-center justify-between font-ui text-[11px] uppercase tracking-[0.2em] text-walnut mb-6">
              <span>Ruang I — Publik</span>
              <span className="group-hover:translate-x-1 transition-transform duration-300">
                Masuk →
              </span>
            </div>

            <h2 className="font-heading text-3xl sm:text-4xl text-ink mb-4">
              The Museum
            </h2>

            <p className="font-body text-sm sm:text-base leading-relaxed text-walnut">
              Galeri terbuka yang menghimpun arsip foto analog, benda bermakna, serta catatan kuratorial tentang momen-momen sederhana.
            </p>
          </Link>

          <Link
            to="/diary"
            className="group block border border-linen p-8 sm:p-10 bg-ivory hover:bg-linen/20 transition-all duration-500"
          >
            <div className="flex items-center justify-between font-ui text-[11px] uppercase tracking-[0.2em] text-walnut mb-6">
              <span>Ruang II — Privat</span>
              <span className="group-hover:translate-x-1 transition-transform duration-300">
                Buka →
              </span>
            </div>

            <h2 className="font-heading text-3xl sm:text-4xl text-ink mb-4">
              The Diary
            </h2>

            <p className="font-body text-sm sm:text-base leading-relaxed text-walnut">
              Lembaran buku harian pribadi yang dikhususkan untuk tulisan-tulisan paling intim dan dokumentasi foto personal.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}