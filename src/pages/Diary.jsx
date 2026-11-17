import { useEffect, useState } from "react";
import { Lock, Unlock, Image as ImageIcon, Pencil, Trash2, X } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { diaryPhotoPresets } from "../data/memoriesData";
import ArchivalPhotoPlate from "../components/ArchivalPhotoPlate";

export default function Diary() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Daftar data
  const [entries, setEntries] = useState([]);
  const [museumItems, setMuseumItems] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("diary"); // "diary" | "public"

  // State Mode Edit
  const [editingItem, setEditingItem] = useState(null); // { id, source: 'diary' | 'museum' }

  // Pilihan tujuan: "diary" | "museum" | "home"
  const [destination, setDestination] = useState("diary");

  // Field umum
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoCaption, setPhotoCaption] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Field khusus Diary
  const [mood, setMood] = useState("Tenang");

  // Field khusus Museum / Beranda
  const [category, setCategory] = useState("Perjalanan");
  const [location, setLocation] = useState("");
  const [filmStock, setFilmStock] = useState("35mm Color");
  const [artifactNote, setArtifactNote] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchAllPosts();
    } else {
      setEntries([]);
      setMuseumItems([]);
    }
  }, [session]);

  async function fetchAllPosts() {
    setListLoading(true);
    const [diaryRes, museumRes] = await Promise.all([
      supabase
        .from("diary_entries")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("museum_memories")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    if (!diaryRes.error && diaryRes.data) setEntries(diaryRes.data);
    if (!museumRes.error && museumRes.data) setMuseumItems(museumRes.data);
    setListLoading(false);
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setAuthError("Email atau kata sandi tidak sesuai.");
    } else {
      setEmail("");
      setPassword("");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setSelectedPhotoUrl(URL.createObjectURL(file));
  };

  // Mulai Edit Postingan Diary
  const startEditDiary = (entry) => {
    setEditingItem({ id: entry.id, source: "diary" });
    setDestination("diary");
    setTitle(entry.title || "");
    setMood(entry.mood || "Tenang");
    setContent(entry.content || "");
    setSelectedPhotoUrl(entry.image_url || "");
    setPhotoFile(null);
    setPhotoCaption(entry.photo_caption || "");
    setStatusMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Mulai Edit Postingan Museum / Beranda
  const startEditMuseum = (item) => {
    setEditingItem({ id: item.id, source: "museum" });
    setDestination(item.is_featured ? "home" : "museum");
    setTitle(item.title || "");
    setCategory(item.category || "Perjalanan");
    setLocation(item.location || "");
    setFilmStock(item.film_stock || "35mm Color");
    setArtifactNote(item.artifact_note || "");
    setContent(
      Array.isArray(item.full_story)
        ? item.full_story.join("\n\n")
        : item.excerpt || ""
    );
    setSelectedPhotoUrl(item.image_url || "");
    setPhotoFile(null);
    setPhotoCaption(item.photo_caption || "");
    setStatusMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Hapus Postingan Diary
  const handleDeleteDiary = async (id) => {
    if (!window.confirm("Hapus catatan diary ini secara permanen?")) return;

    const { error } = await supabase
      .from("diary_entries")
      .delete()
      .eq("id", id);

    if (!error) {
      setEntries(entries.filter((item) => item.id !== id));
      if (editingItem?.id === id) resetForm();
    } else {
      alert(`Gagal menghapus: ${error.message}`);
    }
  };

  // Hapus Postingan Museum / Beranda
  const handleDeleteMuseum = async (id) => {
    if (!window.confirm("Hapus koleksi ini dari The Museum & Beranda?")) return;

    const { error } = await supabase
      .from("museum_memories")
      .delete()
      .eq("id", id);

    if (!error) {
      setMuseumItems(museumItems.filter((item) => item.id !== id));
      if (editingItem?.id === id) resetForm();
    } else {
      alert(`Gagal menghapus: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !session) return;

    setSaving(true);
    setStatusMessage("");
    let finalImageUrl = selectedPhotoUrl;

    if (photoFile) {
      const fileExt = photoFile.name.split(".").pop();
      const folder = destination === "diary" ? session.user.id : "museum";
      const fileName = `${folder}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("memories-photos")
        .upload(fileName, photoFile);

      if (uploadError) {
        setStatusMessage(`Gagal unggah foto: ${uploadError.message}`);
        setSaving(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("memories-photos")
        .getPublicUrl(fileName);
      finalImageUrl = publicUrlData.publicUrl;
    }

    const dateLabel = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    if (destination === "diary") {
      const payload = {
        mood,
        title: title.trim(),
        content: content.trim(),
        image_url: finalImageUrl || null,
        photo_caption: photoCaption.trim() || null,
      };

      if (editingItem?.source === "diary") {
        const { data, error } = await supabase
          .from("diary_entries")
          .update(payload)
          .eq("id", editingItem.id)
          .select()
          .single();

        if (error) {
          setStatusMessage(`Gagal memperbarui: ${error.message}`);
        } else if (data) {
          setEntries(entries.map((item) => (item.id === data.id ? data : item)));
          setStatusMessage("Catatan diary berhasil diperbarui.");
          resetForm();
        }
      } else {
        const { data, error } = await supabase
          .from("diary_entries")
          .insert([{ ...payload, user_id: session.user.id, date_label: dateLabel }])
          .select()
          .single();

        if (error) {
          setStatusMessage(`Gagal menyimpan: ${error.message}`);
        } else if (data) {
          setEntries([data, ...entries]);
          setStatusMessage("Tersimpan di The Diary (Privat).");
          resetForm();
        }
      }
    } else {
      const paragraphs = content
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean);

      const excerptText =
        paragraphs[0]?.length > 160
          ? paragraphs[0].slice(0, 157) + "..."
          : paragraphs[0] || content.trim();

      const payload = {
        category: category.trim() || "Arsip",
        title: title.trim(),
        excerpt: excerptText,
        full_story: paragraphs,
        artifact_note: artifactNote.trim() || null,
        location: location.trim() || "Arsip Pribadi",
        image_url: finalImageUrl || null,
        photo_caption: photoCaption.trim() || null,
        film_stock: filmStock.trim() || null,
        is_featured: destination === "home",
      };

      if (editingItem?.source === "museum") {
        const { data, error } = await supabase
          .from("museum_memories")
          .update(payload)
          .eq("id", editingItem.id)
          .select()
          .single();

        if (error) {
          setStatusMessage(`Gagal memperbarui: ${error.message}`);
        } else if (data) {
          setMuseumItems(
            museumItems.map((item) => (item.id === data.id ? data : item))
          );
          setStatusMessage("Koleksi publik berhasil diperbarui.");
          resetForm();
        }
      } else {
        const archiveCode = `ARC-${String(Math.floor(100 + Math.random() * 900))}`;
        const { data, error } = await supabase
          .from("museum_memories")
          .insert([{ ...payload, archive_code: archiveCode, date_label: dateLabel }])
          .select()
          .single();

        if (error) {
          setStatusMessage(`Gagal mempublikasikan: ${error.message}`);
        } else if (data) {
          setMuseumItems([data, ...museumItems]);
          setStatusMessage(
            destination === "home"
              ? "Berhasil dipublikasikan ke Beranda & The Museum."
              : "Berhasil dipublikasikan ke The Museum (Publik)."
          );
          resetForm();
        }
      }
    }

    setSaving(false);
  };

  function resetForm() {
    setEditingItem(null);
    setTitle("");
    setContent("");
    setSelectedPhotoUrl("");
    setPhotoFile(null);
    setPhotoCaption("");
    setLocation("");
    setArtifactNote("");
  }

  if (authLoading) {
    return (
      <div className="py-20 font-body italic text-walnut">
        Memeriksa kunci ruang jurnal...
      </div>
    );
  }

  return (
    <div className="py-16 sm:py-20 animate-fadeIn">
      <header className="max-w-2xl pb-12 border-b border-linen/80 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="font-ui text-[11px] uppercase tracking-[0.25em] text-walnut mb-3">
            Ruang Privat — Meja Kurator &amp; Jurnal
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl text-ink mb-3">
            The Diary
          </h1>
          <p className="font-body text-base leading-relaxed text-walnut">
            Catatan sunyi pribadi sekaligus meja kurasi untuk menerbitkan, mengubah, dan merapikan arsip publik.
          </p>
        </div>

        {session && (
          <button
            type="button"
            onClick={handleLogout}
            className="self-start sm:self-auto inline-flex items-center gap-2 font-ui text-[11px] uppercase tracking-[0.18em] text-walnut hover:text-ink border border-linen px-4 py-2 transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Keluar &amp; Kunci</span>
          </button>
        )}
      </header>

      {!session ? (
        <section className="pt-12 max-w-md">
          <form
            onSubmit={handleLogin}
            className="border border-linen p-8 sm:p-10 bg-linen/15 space-y-6"
          >
            <div>
              <div className="inline-flex items-center gap-2 font-ui text-[11px] uppercase tracking-[0.2em] text-walnut mb-2">
                <Lock className="w-3.5 h-3.5" />
                <span>Autentikasi Pemilik</span>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl text-ink">
                Buka Meja Jurnal &amp; Arsip
              </h2>
              <p className="font-body text-sm text-walnut mt-2 leading-relaxed">
                Masuk menggunakan akun pemilik untuk menulis, mengedit, atau menghapus postingan.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block font-ui text-[11px] uppercase tracking-[0.18em] text-walnut">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full bg-ivory border border-linen px-4 py-2.5 font-body text-sm text-ink focus:outline-none focus:border-walnut"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-ui text-[11px] uppercase tracking-[0.18em] text-walnut">
                  Kata Sandi
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-ivory border border-linen px-4 py-2.5 font-body text-sm text-ink focus:outline-none focus:border-walnut"
                />
              </div>

              {authError && (
                <p className="font-body italic text-xs text-walnut pt-1">
                  {authError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 font-ui text-xs uppercase tracking-[0.2em] bg-ink text-ivory py-3 hover:bg-walnut transition-colors duration-300"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Masuk ke Ruang Kerja</span>
            </button>
          </form>
        </section>
      ) : (
        <section className="pt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Kolom Kiri: Form Tambah / Edit */}
          <div className="lg:col-span-5">
            <form
              onSubmit={handleSubmit}
              className="border border-linen p-6 sm:p-8 bg-linen/10 space-y-5"
            >
              <div className="flex items-center justify-between">
                <p className="font-ui text-[11px] uppercase tracking-[0.2em] text-walnut">
                  {editingItem ? "Edit Postingan" : "Buat Unggahan Baru"}
                </p>
                {editingItem && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center gap-1 font-ui text-[10px] uppercase tracking-[0.15em] text-walnut hover:text-ink"
                  >
                    <X className="w-3 h-3" />
                    <span>Batal Edit</span>
                  </button>
                )}
              </div>

              {/* Pilihan Tujuan Upload (Terkunci ke grupnya saat mode edit) */}
              <div className="space-y-1.5">
                <label className="block font-ui text-[11px] uppercase tracking-[0.15em] text-walnut">
                  Tujuan Penyimpanan
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    {
                      value: "diary",
                      label: "1. Upload di Diary (Private)",
                      desc: "Hanya terlihat olehmu saat login",
                      disabled: editingItem?.source === "museum",
                    },
                    {
                      value: "museum",
                      label: "2. Upload Museum (Public)",
                      desc: "Tampil di halaman publik The Museum",
                      disabled: editingItem?.source === "diary",
                    },
                    {
                      value: "home",
                      label: "3. Upload Beranda (Public)",
                      desc: "Sorotan utama Beranda & masuk ke Museum",
                      disabled: editingItem?.source === "diary",
                    },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={opt.disabled}
                      onClick={() => setDestination(opt.value)}
                      className={`text-left p-3 border transition-colors disabled:opacity-40 ${
                        destination === opt.value
                          ? "border-ink bg-ink text-ivory"
                          : "border-linen bg-ivory text-ink hover:border-walnut"
                      }`}
                    >
                      <div className="font-ui text-[11px] uppercase tracking-[0.14em]">
                        {opt.label}
                      </div>
                      <div
                        className={`font-body text-xs mt-0.5 ${
                          destination === opt.value
                            ? "text-ivory/80"
                            : "text-walnut"
                        }`}
                      >
                        {opt.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-ui text-[11px] uppercase tracking-[0.15em] text-walnut">
                  Judul *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-ivory border border-linen px-3.5 py-2 font-body text-sm text-ink focus:outline-none focus:border-walnut"
                />
              </div>

              {destination === "diary" ? (
                <div className="space-y-1.5">
                  <label className="block font-ui text-[11px] uppercase tracking-[0.15em] text-walnut">
                    Suasana Hati
                  </label>
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="w-full bg-ivory border border-linen px-3.5 py-2 font-body text-sm text-ink focus:outline-none focus:border-walnut"
                  >
                    <option value="Tenang">Tenang</option>
                    <option value="Melankolis">Melankolis</option>
                    <option value="Hangat">Hangat</option>
                    <option value="Nostalgia">Nostalgia</option>
                  </select>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-ui text-[11px] uppercase tracking-[0.15em] text-walnut mb-1">
                        Kategori
                      </label>
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-ivory border border-linen px-3 py-2 font-body text-sm text-ink focus:outline-none focus:border-walnut"
                      />
                    </div>
                    <div>
                      <label className="block font-ui text-[11px] uppercase tracking-[0.15em] text-walnut mb-1">
                        Lokasi
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full bg-ivory border border-linen px-3 py-2 font-body text-sm text-ink focus:outline-none focus:border-walnut"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-ui text-[11px] uppercase tracking-[0.15em] text-walnut mb-1">
                        Lensa / Kamera
                      </label>
                      <input
                        type="text"
                        value={filmStock}
                        onChange={(e) => setFilmStock(e.target.value)}
                        className="w-full bg-ivory border border-linen px-3 py-2 font-body text-sm text-ink focus:outline-none focus:border-walnut"
                      />
                    </div>
                    <div>
                      <label className="block font-ui text-[11px] uppercase tracking-[0.15em] text-walnut mb-1">
                        Catatan Artefak
                      </label>
                      <input
                        type="text"
                        value={artifactNote}
                        onChange={(e) => setArtifactNote(e.target.value)}
                        className="w-full bg-ivory border border-linen px-3 py-2 font-body text-sm text-ink focus:outline-none focus:border-walnut"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Lampiran Foto */}
              <div className="space-y-2">
                <label className="block font-ui text-[11px] uppercase tracking-[0.15em] text-walnut">
                  Lampirkan Foto
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {diaryPhotoPresets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setPhotoFile(null);
                        setSelectedPhotoUrl(preset.url);
                      }}
                      className={`font-ui text-[10px] uppercase tracking-[0.14em] px-2.5 py-1.5 border transition-colors ${
                        selectedPhotoUrl === preset.url
                          ? "border-ink bg-ink text-ivory"
                          : "border-linen bg-ivory text-walnut hover:border-walnut"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                  <label className="cursor-pointer inline-flex items-center gap-1 font-ui text-[10px] uppercase tracking-[0.14em] px-2.5 py-1.5 border border-linen bg-ivory text-walnut hover:border-walnut transition-colors">
                    <ImageIcon className="w-3 h-3" />
                    <span>Unggah File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                {selectedPhotoUrl && (
                  <div className="pt-2 space-y-2">
                    <ArchivalPhotoPlate
                      src={selectedPhotoUrl}
                      alt="Pratinjau lampiran"
                      aspectClass="aspect-[16/10]"
                      compact
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={photoCaption}
                        onChange={(e) => setPhotoCaption(e.target.value)}
                        placeholder="Keterangan singkat foto..."
                        className="flex-1 bg-ivory border border-linen px-3 py-1.5 font-body italic text-xs text-ink focus:outline-none focus:border-walnut"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPhotoUrl("");
                          setPhotoFile(null);
                          setPhotoCaption("");
                        }}
                        className="font-ui text-[10px] uppercase tracking-[0.14em] text-walnut hover:text-ink px-2 py-1.5 border border-linen"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block font-ui text-[11px] uppercase tracking-[0.15em] text-walnut">
                  Isi Tulisan / Cerita *
                </label>
                <textarea
                  rows="5"
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-ivory border border-linen px-3.5 py-2.5 font-body text-sm leading-relaxed text-ink focus:outline-none focus:border-walnut"
                />
              </div>

              {statusMessage && (
                <p className="font-body italic text-xs text-ink bg-linen/40 px-3 py-2 border border-linen">
                  {statusMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full font-ui text-xs uppercase tracking-[0.2em] bg-ink text-ivory py-3 hover:bg-walnut disabled:opacity-50 transition-colors duration-300"
              >
                {saving
                  ? "Menyimpan..."
                  : editingItem
                  ? "Simpan Perubahan"
                  : destination === "diary"
                  ? "Simpan ke Diary (Private)"
                  : destination === "museum"
                  ? "Terbitkan ke Museum (Public)"
                  : "Terbitkan ke Beranda (Public)"}
              </button>
            </form>
          </div>

          {/* Kolom Kanan: Daftar Postingan + Tombol Edit & Hapus */}
          <div className="lg:col-span-7">
            <div className="flex flex-wrap gap-2 pb-6 border-b border-linen/80">
              <button
                type="button"
                onClick={() => setActiveTab("diary")}
                className={`font-ui text-[11px] uppercase tracking-[0.16em] px-4 py-2 border transition-colors ${
                  activeTab === "diary"
                    ? "border-ink bg-ink text-ivory"
                    : "border-linen text-walnut hover:border-walnut"
                }`}
              >
                Catatan Diary ({entries.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("public")}
                className={`font-ui text-[11px] uppercase tracking-[0.16em] px-4 py-2 border transition-colors ${
                  activeTab === "public"
                    ? "border-ink bg-ink text-ivory"
                    : "border-linen text-walnut hover:border-walnut"
                }`}
              >
                Koleksi Museum &amp; Beranda ({museumItems.length})
              </button>
            </div>

            {listLoading ? (
              <p className="py-8 font-body italic text-walnut">
                Memuat arsip postingan...
              </p>
            ) : activeTab === "diary" ? (
              <div className="divide-y divide-linen/80">
                {entries.length === 0 ? (
                  <p className="py-8 font-body italic text-walnut">
                    Belum ada catatan pribadi tersimpan.
                  </p>
                ) : (
                  entries.map((entry) => (
                    <article key={entry.id} className="py-8 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 font-ui text-[11px] uppercase tracking-[0.16em] text-walnut">
                        <span>
                          {entry.date_label} · Suasana: {entry.mood}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEditDiary(entry)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 border border-linen text-walnut hover:text-ink hover:border-walnut transition-colors"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteDiary(entry.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 border border-linen text-walnut hover:text-ink hover:border-ink transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>

                      <h2 className="font-heading text-2xl sm:text-3xl text-ink">
                        {entry.title}
                      </h2>

                      {entry.image_url && (
                        <div className="py-1">
                          <ArchivalPhotoPlate
                            src={entry.image_url}
                            alt={entry.title}
                            caption={entry.photo_caption}
                            aspectClass="aspect-[16/10]"
                          />
                        </div>
                      )}

                      <p className="font-body text-base leading-[1.85] text-walnut whitespace-pre-line">
                        {entry.content}
                      </p>
                    </article>
                  ))
                )}
              </div>
            ) : (
              <div className="divide-y divide-linen/80">
                {museumItems.length === 0 ? (
                  <p className="py-8 font-body italic text-walnut">
                    Belum ada koleksi publik di database.
                  </p>
                ) : (
                  museumItems.map((item) => (
                    <article key={item.id} className="py-8 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 font-ui text-[11px] uppercase tracking-[0.16em] text-walnut">
                        <span>
                          {item.archive_code} ·{" "}
                          {item.is_featured ? "Beranda & Museum" : "Museum"}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEditMuseum(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 border border-linen text-walnut hover:text-ink hover:border-walnut transition-colors"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMuseum(item.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 border border-linen text-walnut hover:text-ink hover:border-ink transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>

                      <h2 className="font-heading text-2xl sm:text-3xl text-ink">
                        {item.title}
                      </h2>

                      {item.image_url && (
                        <div className="py-1">
                          <ArchivalPhotoPlate
                            src={item.image_url}
                            alt={item.title}
                            caption={item.photo_caption}
                            aspectClass="aspect-[16/10]"
                          />
                        </div>
                      )}

                      <p className="font-body text-sm leading-relaxed text-walnut">
                        {item.excerpt}
                      </p>
                    </article>
                  ))
                )}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}