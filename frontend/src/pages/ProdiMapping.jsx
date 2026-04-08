import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Cell,
} from "recharts";
import { API_BASE } from "../config/api";

// ─── Constants ────────────────────────────────────────────────────────────────

const PRODI_DEFS = [
  { key: "ALL", label: "Semua Prodi",          color: "#94a3b8" },
  { key: "SI",  label: "Sistem Informasi",      color: "#0891b2" },
  { key: "TI",  label: "Teknologi Informasi",   color: "#7c3aed" },
  { key: "IF",  label: "Informatika",           color: "#059669" },
  { key: "TK",  label: "Teknik Komputer",       color: "#d97706" },
];

const PRODI_UNIVS = {
  SI: ["UMSU", "UI"],
  TI: ["UMSU", "UGM"],
  IF: ["ITK"],
  TK: ["PENS"],
};

const FW_COLORS = { ESCO: "#06b6d4", ONET: "#f59e0b", SKKNI: "#22c55e" };

const RANAH_STYLE = {
  "Sikap":               { bg: "bg-violet-500/15", text: "text-violet-400", border: "border-violet-500/30" },
  "Pengetahuan":         { bg: "bg-sky-500/15",    text: "text-sky-400",    border: "border-sky-500/30"    },
  "Keterampilan Umum":   { bg: "bg-amber-500/15",  text: "text-amber-400",  border: "border-amber-500/30"  },
  "Keterampilan Khusus": { bg: "bg-emerald-500/15",text: "text-emerald-400",border: "border-emerald-500/30"},
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(v) {
  if (!v) return "text-gray-600";
  if (v >= 0.35) return "text-emerald-400";
  if (v >= 0.20) return "text-amber-400";
  return "text-red-400";
}

function ScoreBadge({ score, label }) {
  if (!score && !label) return <span className="text-gray-600 text-xs">—</span>;
  return (
    <div className="min-w-0">
      <div className="text-[11px] text-gray-300 leading-snug truncate max-w-[180px]" title={label}>
        {label || "—"}
      </div>
      <div className={`font-mono text-[11px] font-bold mt-0.5 ${scoreColor(score)}`}>
        {score != null ? score.toFixed(4) : "—"}
      </div>
    </div>
  );
}

function RanahBadge({ ranah }) {
  const s = RANAH_STYLE[ranah] || { bg: "bg-gray-500/15", text: "text-gray-400", border: "border-gray-500/30" };
  const short = ranah === "Keterampilan Umum" ? "KU" : ranah === "Keterampilan Khusus" ? "KK" : ranah?.slice(0, 3);
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border whitespace-nowrap ${s.bg} ${s.text} ${s.border}`} title={ranah}>
      {short}
    </span>
  );
}

function UnivBadge({ univShort }) {
  return (
    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-bg3 border border-border text-gray-400">
      {univShort}
    </span>
  );
}

// ─── Charts ───────────────────────────────────────────────────────────────────

function SummaryChart({ data }) {
  const chartData = (data || [])
    .filter(d => d.prodi !== "ALL")
    .map(d => ({
      name:  d.label,
      key:   d.prodi,
      ESCO:  d.esco,
      ONET:  d.onet,
      SKKNI: d.skkni,
    }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} angle={-20} textAnchor="end" interval={0} />
        <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} domain={[0, 0.5]} />
        <Tooltip
          contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "#e2e8f0" }}
          formatter={(v) => v != null ? v.toFixed(4) : "—"}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8", paddingTop: 8 }} />
        <Bar dataKey="ESCO"  fill={FW_COLORS.ESCO}  radius={[3,3,0,0]} maxBarSize={22} />
        <Bar dataKey="ONET"  fill={FW_COLORS.ONET}  radius={[3,3,0,0]} maxBarSize={22} />
        <Bar dataKey="SKKNI" fill={FW_COLORS.SKKNI} radius={[3,3,0,0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function RanahChart({ data }) {
  const chartData = (data || []).map(d => ({
    ranah: d.ranah?.replace("Keterampilan ", "K."),
    ESCO:  d.esco,
    ONET:  d.onet,
    SKKNI: d.skkni,
  }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="ranah" tick={{ fill: "#94a3b8", fontSize: 11 }} angle={-20} textAnchor="end" interval={0} />
        <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} domain={[0, 0.5]} />
        <Tooltip
          contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
          formatter={(v) => v != null ? v.toFixed(4) : "—"}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8", paddingTop: 4 }} />
        <Bar dataKey="ESCO"  fill={FW_COLORS.ESCO}  radius={[3,3,0,0]} maxBarSize={22} />
        <Bar dataKey="ONET"  fill={FW_COLORS.ONET}  radius={[3,3,0,0]} maxBarSize={22} />
        <Bar dataKey="SKKNI" fill={FW_COLORS.SKKNI} radius={[3,3,0,0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── KPI Row ──────────────────────────────────────────────────────────────────

function KpiRow({ summary, activeProdi }) {
  const rows = activeProdi === "ALL"
    ? summary
    : summary?.filter(d => d.prodi === activeProdi);
  if (!rows || rows.length === 0) return null;

  const totalCpl  = rows.reduce((s, d) => s + (d.n_cpl ?? 0), 0);
  const avgEsco   = rows.reduce((s, d) => s + (d.esco  ?? 0) * (d.n_cpl ?? 1), 0) / Math.max(totalCpl, 1);
  const avgOnet   = rows.reduce((s, d) => s + (d.onet  ?? 0) * (d.n_cpl ?? 1), 0) / Math.max(totalCpl, 1);
  const avgSkkni  = rows.reduce((s, d) => s + (d.skkni ?? 0) * (d.n_cpl ?? 1), 0) / Math.max(totalCpl, 1);

  const prodiMeta = PRODI_DEFS.find(p => p.key === activeProdi);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="text-[11px] text-gray-400">Total CPL</div>
        <div className="font-mono text-2xl font-bold mt-1" style={{ color: prodiMeta?.color ?? "#f0b840" }}>
          {totalCpl}
        </div>
        <div className="text-[11px] text-gray-500 mt-1">
          {activeProdi === "ALL"
            ? `${rows.length} prodi`
            : (PRODI_UNIVS[activeProdi] || []).join(" + ")}
        </div>
      </div>
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="text-[11px] text-gray-400">Mean S_sem ESCO</div>
        <div className={`font-mono text-2xl font-bold mt-1 ${scoreColor(avgEsco)}`}>{avgEsco.toFixed(4)}</div>
        <div className="text-[11px] text-gray-500 mt-1">Top-1 match</div>
      </div>
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="text-[11px] text-gray-400">Mean S_sem O*NET</div>
        <div className={`font-mono text-2xl font-bold mt-1 ${scoreColor(avgOnet)}`}>{avgOnet.toFixed(4)}</div>
        <div className="text-[11px] text-gray-500 mt-1">Top-1 match</div>
      </div>
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="text-[11px] text-gray-400">Mean S_sem SKKNI</div>
        <div className={`font-mono text-2xl font-bold mt-1 ${scoreColor(avgSkkni)}`}>{avgSkkni.toFixed(4)}</div>
        <div className="text-[11px] text-gray-500 mt-1">Top-1 match</div>
      </div>
    </div>
  );
}

// ─── CPL Table ────────────────────────────────────────────────────────────────

function CplTable({ rows, activeProdi }) {
  const [search, setSearch] = useState("");
  const [sortFw, setSortFw] = useState(null);
  const [sortDir, setSortDir] = useState("desc");

  const showUnivCol  = activeProdi !== "ALL" && (PRODI_UNIVS[activeProdi] || []).length > 1;
  const showProdiCol = activeProdi === "ALL";

  const filtered = (rows || []).filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.cpl_id?.toLowerCase().includes(q) ||
      r.cpl_text?.toLowerCase().includes(q) ||
      r.ranah?.toLowerCase().includes(q) ||
      r.esco_label?.toLowerCase().includes(q) ||
      r.onet_label?.toLowerCase().includes(q) ||
      r.skkni_label?.toLowerCase().includes(q)
    );
  });

  const sorted = sortFw
    ? [...filtered].sort((a, b) => {
        const va = a[`${sortFw}_score`] ?? -1;
        const vb = b[`${sortFw}_score`] ?? -1;
        return sortDir === "desc" ? vb - va : va - vb;
      })
    : filtered;

  const toggleSort = (fw) => {
    if (sortFw === fw) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortFw(fw); setSortDir("desc"); }
  };

  const SortBtn = ({ fw }) => (
    <button onClick={() => toggleSort(fw)}
      className={`ml-1 text-[9px] opacity-60 hover:opacity-100 ${sortFw === fw ? "opacity-100" : ""}`}>
      {sortFw === fw ? (sortDir === "desc" ? "↓" : "↑") : "↕"}
    </button>
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <input
          type="text"
          placeholder="Cari CPL, ranah, atau label match..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-bg3 border border-border rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-border2"
        />
        <span className="text-xs text-gray-500 whitespace-nowrap">{sorted.length} CPL</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[860px]">
          <thead>
            <tr className="border-b border-border">
              {showProdiCol && <th className="text-left text-gray-400 py-2 pr-3 w-28">Prodi</th>}
              <th className="text-left text-gray-400 py-2 pr-2 w-32">CPL ID</th>
              {showUnivCol  && <th className="text-left text-gray-400 py-2 pr-2 w-14">Univ</th>}
              <th className="text-left text-gray-400 py-2 pr-2 w-10">Ranah</th>
              <th className="text-left text-gray-400 py-2 pr-3">Deskripsi CPL</th>
              <th className="text-left py-2 pr-3" style={{ color: FW_COLORS.ESCO }}>
                ESCO <SortBtn fw="esco" />
              </th>
              <th className="text-left py-2 pr-3" style={{ color: FW_COLORS.ONET }}>
                O*NET <SortBtn fw="onet" />
              </th>
              <th className="text-left py-2" style={{ color: FW_COLORS.SKKNI }}>
                SKKNI <SortBtn fw="skkni" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => (
              <tr key={`${r.prodi}-${r.cpl_id}-${i}`}
                className="border-t border-border/50 hover:bg-bg3/60 transition-colors">
                {showProdiCol && (
                  <td className="py-2.5 pr-3 align-top">
                    <span className="text-[11px] font-semibold" style={{
                      color: PRODI_DEFS.find(p => p.key === r.prodi)?.color ?? "#94a3b8"
                    }}>
                      {r.prodi_label || r.prodi}
                    </span>
                  </td>
                )}
                <td className="py-2.5 pr-2 align-top">
                  <span className="font-mono text-[11px] text-cyan-300">{r.cpl_id}</span>
                </td>
                {showUnivCol && (
                  <td className="py-2.5 pr-2 align-top">
                    <UnivBadge univShort={r.univ_short} />
                  </td>
                )}
                <td className="py-2.5 pr-2 align-top">
                  <RanahBadge ranah={r.ranah} />
                </td>
                <td className="py-2.5 pr-3 align-top max-w-[200px]">
                  <div className="text-gray-300 leading-snug line-clamp-3 text-[11px]" title={r.cpl_text}>
                    {r.cpl_text}
                  </div>
                </td>
                <td className="py-2.5 pr-3 align-top">
                  <ScoreBadge score={r.esco_score}  label={r.esco_label}  />
                </td>
                <td className="py-2.5 pr-3 align-top">
                  <ScoreBadge score={r.onet_score}  label={r.onet_label}  />
                </td>
                <td className="py-2.5 align-top">
                  <ScoreBadge score={r.skkni_score} label={r.skkni_label} />
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  Tidak ada data yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ProdiMapping() {
  const [activeProdi, setActiveProdi] = useState("ALL");

  const { data: summary, isLoading, error } = useQuery({
    queryKey: ["cpl-mapping-summary"],
    queryFn: () => axios.get(`${API_BASE}/cpl-mapping/summary`).then(r => r.data),
    staleTime: 60_000,
  });

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ["cpl-mapping-detail", activeProdi],
    queryFn: () =>
      axios.get(`${API_BASE}/cpl-mapping/detail`, {
        params: activeProdi !== "ALL" ? { prodi: activeProdi } : {},
      }).then(r => r.data),
    staleTime: 60_000,
  });

  const { data: ranahData } = useQuery({
    queryKey: ["cpl-mapping-ranah"],
    queryFn: () => axios.get(`${API_BASE}/cpl-mapping/ranah-summary`).then(r => r.data),
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="page pt-[52px] min-h-screen px-6 md:px-10 py-7 flex items-center justify-center">
        <div className="text-sm text-gray-400">Memuat data mapping CPL...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page pt-[52px] min-h-screen px-6 md:px-10 py-7">
        <div className="bg-card border border-red-500/30 rounded-xl p-6">
          <div className="text-sm font-semibold text-red-400 mb-2">Data belum tersedia</div>
          <p className="text-sm text-gray-400">
            File <code className="text-xs bg-bg3 px-1 rounded">external_cpl_inductive_results.xlsx</code> belum ditemukan.
            Jalankan <code className="text-xs bg-bg3 px-1 rounded">test_external_cpl.py</code> terlebih dahulu.
          </p>
        </div>
      </div>
    );
  }

  // Summary dengan ALL pseudo-row
  const summaryWithAll = summary ? [
    {
      prodi: "ALL", label: "Semua Prodi",
      n_cpl: summary.reduce((s, d) => s + (d.n_cpl ?? 0), 0),
      esco:  summary.reduce((s, d) => s + (d.esco  ?? 0) * (d.n_cpl ?? 0), 0) / Math.max(summary.reduce((s, d) => s + (d.n_cpl ?? 0), 0), 1),
      onet:  summary.reduce((s, d) => s + (d.onet  ?? 0) * (d.n_cpl ?? 0), 0) / Math.max(summary.reduce((s, d) => s + (d.n_cpl ?? 0), 0), 1),
      skkni: summary.reduce((s, d) => s + (d.skkni ?? 0) * (d.n_cpl ?? 0), 0) / Math.max(summary.reduce((s, d) => s + (d.n_cpl ?? 0), 0), 1),
    },
    ...summary,
  ] : [];

  return (
    <div className="page pt-[52px] min-h-screen px-6 md:px-10 py-7">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold mb-1">
          CPL Mapping <span className="text-gold">— Per Prodi</span>
        </h1>
        <p className="text-sm text-gray-400">
          Hasil pemetaan CPL ke framework kompetensi (ESCO, O*NET, SKKNI) per program studi.
          Pendekatan <span className="text-cyan-400">inductive TF-IDF</span> — CPL sebagai query, vectorizer difit dari target corpus.
        </p>
      </div>

      {/* ── KPI ────────────────────────────────────────────────────────────── */}
      <KpiRow summary={summaryWithAll} activeProdi={activeProdi} />

      {/* ── Summary Chart ──────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6">
        <div className="font-display text-xs font-bold text-gray-400 tracking-wider uppercase mb-4">
          Mean S_sem Top-1 per Prodi × Framework
        </div>
        {summary && summary.length > 0
          ? <SummaryChart data={summary} />
          : <div className="text-xs text-gray-500 py-8 text-center">Tidak ada data.</div>
        }
      </div>

      {/* ── Prodi Tab Bar ───────────────────────────────────────────────────── */}
      <div className="flex gap-1 flex-wrap mb-5">
        {PRODI_DEFS.map(p => {
          const meta = summaryWithAll.find(d => d.prodi === p.key);
          const n = meta?.n_cpl ?? 0;
          const univInfo = PRODI_UNIVS[p.key];
          return (
            <button key={p.key} onClick={() => setActiveProdi(p.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all border ${
                activeProdi === p.key
                  ? "text-white border-transparent"
                  : "bg-transparent text-gray-400 border-border hover:border-border2 hover:bg-bg3"
              }`}
              style={activeProdi === p.key ? { background: p.color, borderColor: p.color } : {}}>
              {p.label}
              {p.key !== "ALL" && univInfo && (
                <span className="ml-1 text-[10px] opacity-60">({univInfo.join("+")})</span>
              )}
              <span className="ml-1.5 font-mono text-[10px] opacity-70">{n > 0 ? `${n} CPL` : ""}</span>
            </button>
          );
        })}
      </div>

      {/* ── CPL Table ───────────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6">
        <div className="font-display text-xs font-bold text-gray-400 tracking-wider uppercase mb-4">
          Tabel CPL — Top-1 Match per Framework
          {activeProdi !== "ALL" && (
            <span className="ml-2 text-gold normal-case font-normal">
              | {PRODI_DEFS.find(p => p.key === activeProdi)?.label}
              {PRODI_UNIVS[activeProdi] && (
                <span className="text-gray-500"> ({PRODI_UNIVS[activeProdi].join(", ")})</span>
              )}
            </span>
          )}
        </div>
        {detailLoading
          ? <div className="text-xs text-gray-500 py-6 text-center">Memuat tabel...</div>
          : <CplTable rows={detail} activeProdi={activeProdi} />
        }
      </div>

      {/* ── Ranah Chart ─────────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6">
        <div className="font-display text-xs font-bold text-gray-400 tracking-wider uppercase mb-1">
          Mean S_sem per Ranah × Framework
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Semua prodi. Menunjukkan pola ketercapaian mapping berdasarkan ranah CPL.
        </p>
        {ranahData && ranahData.length > 0
          ? <RanahChart data={ranahData} />
          : <div className="text-xs text-gray-500 py-4 text-center">Tidak ada data ranah.</div>
        }
      </div>

      {/* ── Methodology ─────────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="font-display text-xs font-bold text-gray-400 tracking-wider uppercase mb-3">
          Catatan Metodologi
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs text-gray-400">
          <div className="bg-bg3 border border-border rounded-lg p-3">
            <div className="text-cyan-400 font-semibold mb-1">Pengelompokan Prodi</div>
            <p>CPL dikelompokkan berdasarkan <em>program studi</em>, bukan universitas. SI mencakup UMSU + UI; TI mencakup UMSU + UGM; IF (Informatika) = ITK; TK (Teknik Komputer) = PENS. Universitas ditampilkan sebagai atribut sekunder.</p>
          </div>
          <div className="bg-bg3 border border-border rounded-lg p-3">
            <div className="text-amber-400 font-semibold mb-1">Pendekatan Inductive</div>
            <p>Vectorizer TF-IDF difit <em>hanya</em> dari target corpus (ESCO/O*NET/SKKNI). CPL bertindak sebagai query — tidak masuk training. ESCO & O*NET: CPL ditranslasi via bridge dictionary (ID→EN). SKKNI: teks asli Bahasa Indonesia.</p>
          </div>
          <div className="bg-bg3 border border-border rounded-lg p-3">
            <div className="text-emerald-400 font-semibold mb-1">Interpretasi Skor</div>
            <p>S_sem = cosine similarity TF-IDF antara teks CPL dan target. Nilai ≥0.35 <span className="text-emerald-400">baik</span>, 0.20–0.35 <span className="text-amber-400">sedang</span>, &lt;0.20 <span className="text-red-400">rendah</span>. Ranking berdasarkan skor top-1.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
