// ── BarangListPage (UMS Style) ──────────────────────────────────────────────────
import { useEffect, useState, useCallback } from "react";
import { Search, Filter, X, Package, Layers, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { barangAPI } from "@/services/api";
import { ItemCard, EmptyState, LoadingPage, Pagination } from "@/components/ui";

export function BarangListPage() {
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [kategori, setKategori] = useState([]);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState({ jenis: "", kategori: "", search: "" });
  const [showF, setShowF] = useState(false);

  useEffect(() => {
    barangAPI
      .getKategori()
      .then(({ data }) => setKategori(data.results ?? data));
  }, []);

  const fetchItems = useCallback(() => {
    setLoading(true);
    const p = { page, search: filter.search };
    if (filter.jenis) p.jenis = filter.jenis;
    if (filter.kategori) p.kategori = filter.kategori;
    barangAPI
      .getList(p)
      .then(({ data }) => {
        setItems(data.results ?? []);
        setCount(data.count ?? 0);
      })
      .finally(() => setLoading(false));
  }, [page, filter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const setF = (k, v) => {
    setPage(1);
    setFilter((f) => ({ ...f, [k]: v }));
  };
  const hasFilter = filter.jenis || filter.kategori;

  // --- Animasi ---
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-[#ffcc00] text-[#003366] rounded-2xl shadow-lg shadow-yellow-400/20">
                <Layers size={28} />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#003366] tracking-tight">
                EKSPLOR BARANG
              </h1>
            </div>
            <p className="text-slate-500 text-lg flex items-center gap-2 font-medium">
              Ditemukan{" "}
              <span className="text-[#003366] font-black underline decoration-[#ffcc00] decoration-4">
                {count}
              </span>{" "}
              laporan
            </p>
          </div>
        </motion.div>

        {/* Search + filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-8 sticky top-24 z-30"
        >
          <div className="relative flex-1 group shadow-xl shadow-blue-900/5">
            <Search
              size={22}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#003366] transition-colors"
            />
            <input
              className="w-full pl-14 pr-6 py-5 rounded-[2rem] border border-white bg-white focus:ring-4 focus:ring-[#003366]/5 focus:border-[#003366] outline-none transition-all text-slate-700 font-bold placeholder:font-normal placeholder:text-slate-400"
              placeholder="Cari barang atau lokasi temuan..."
              value={filter.search}
              onChange={(e) => setF("search", e.target.value)}
            />
          </div>

          <button
            onClick={() => setShowF(!showF)}
            className={`flex items-center justify-center gap-3 px-8 py-5 rounded-[2rem] font-black transition-all shadow-lg
              ${
                showF || hasFilter
                  ? "bg-[#003366] text-white shadow-blue-900/20"
                  : "bg-white text-[#003366] border border-slate-100 hover:bg-[#003366] hover:text-white"
              }`}
          >
            <Filter size={20} />
            <span>FILTER</span>
            {hasFilter && (
              <span className="bg-[#ffcc00] text-[#003366] text-[10px] w-5 h-5 rounded-full flex items-center justify-center ml-1">
                !
              </span>
            )}
          </button>
        </motion.div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showF && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-10 origin-top"
            >
              <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-slate-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-end">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">
                    JENIS LAPORAN
                  </label>
                  <div className="flex gap-2">
                    {[
                      ["", "SEMUA"],
                      ["hilang", "HILANG"],
                      ["temuan", "TEMUAN"],
                    ].map(([v, l]) => (
                      <button
                        key={v}
                        onClick={() => setF("jenis", v)}
                        className={`flex-1 px-4 py-3 rounded-xl text-xs font-black border transition-all
                          ${
                            filter.jenis === v
                              ? "bg-[#003366] text-white border-[#003366] shadow-md"
                              : "bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100"
                          }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">
                    KATEGORI BARANG
                  </label>
                  <select
                    className="w-full px-5 py-3 rounded-xl border-none bg-slate-50 focus:ring-2 focus:ring-[#ffcc00] outline-none text-slate-700 font-bold cursor-pointer appearance-none shadow-inner"
                    value={filter.kategori}
                    onChange={(e) => setF("kategori", e.target.value)}
                  >
                    <option value="">Semua Kategori</option>
                    {kategori.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3">
                  {hasFilter && (
                    <button
                      onClick={() => {
                        setFilter({ jenis: "", kategori: "", search: "" });
                        setPage(1);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 text-xs font-black text-rose-500 bg-rose-50 hover:bg-rose-100 py-4 rounded-xl transition-all"
                    >
                      <X size={16} /> RESET
                    </button>
                  )}
                  <button
                    onClick={() => setShowF(false)}
                    className="flex-1 bg-[#ffcc00] text-[#003366] text-xs font-black py-4 rounded-xl shadow-md hover:brightness-105 transition-all"
                  >
                    TERAPKAN
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        {loading ? (
          <div className="py-32 flex justify-center">
            <LoadingPage />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Tidak Menemukan Apapun"
            desc="Coba ubah filter atau kata kunci pencarianmu."
          />
        ) : (
          <div className="space-y-12">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {items.map((item) => (
                <motion.div variants={fadeUp} key={item.id} className="h-full">
                  <ItemCard item={item} />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            <div className="flex justify-center pt-8">
              <div className="bg-white px-8 py-4 rounded-full shadow-xl shadow-blue-900/5 border border-slate-50 flex items-center gap-4">
                <Pagination page={page} count={count} onChange={setPage} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BarangListPage;
