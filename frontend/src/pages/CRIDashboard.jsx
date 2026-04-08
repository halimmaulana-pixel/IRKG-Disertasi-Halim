import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import CPLDetailPanel from "../components/CPLDetailPanel";
import { API_BASE } from "../config/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Cell,
} from "recharts";

// ─── Constants ────────────────────────────────────────────────────────────────

const PRODI_DEFS = [
  { key: "SI", label: "Sistem Informasi",    short: "SI",  color: "#0891b2" },
  { key: "TI", label: "Teknologi Informasi", short: "TI",  color: "#7c3aed" },
  { key: "IF", label: "Informatika",          short: "IF",  color: "#8b5cf6" },
  { key: "TK", label: "Teknik Komputer",      short: "TK",  color: "#22c55e" },
];

const FLAG_STYLES = {
  COMPLETE:   { bg: "bg-green-500/15", text: "text-green-400",  dot: "bg-green-400"  },
  PARTIAL:    { bg: "bg-amber-500/15", text: "text-amber-400",  dot: "bg-amber-400"  },
  INCOMPLETE: { bg: "bg-red-500/15",   text: "text-red-400",    dot: "bg-red-400"    },
};

const RANAH_STYLES = {
  "Sikap":               { bg: "bg-red-500/15",    text: "text-red-300"    },
  "Pengetahuan":         { bg: "bg-cyan-500/15",   text: "text-cyan-300"   },
  "Keterampilan Umum":   { bg: "bg-amber-500/15",  text: "text-amber-300"  },
  "Keterampilan Khusus": { bg: "bg-purple-500/15", text: "text-purple-300" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreBar({ value, color }) {
  const pct = Math.min(100, Math.round((value ?? 0) * 180));
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-bg3 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-mono w-10 text-right" style={{ color }}>{(value ?? 0).toFixed(4)}</span>
    </div>
  );
}

function SummaryCards({ summary, prodiMeta }) {
  if (!summary) return null;
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <div className="bg-card border border-border rounded-xl px-5 py-4">
        <div className="font-mono text-2xl font-bold" style={{ color: prodiMeta?.color ?? "#f0b840" }}>
          {summary.cri_mean}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">CRI Mean</div>
      </div>
      <div className="bg-card border border-border rounded-xl px-5 py-4">
        <div className="font-mono text-2xl font-bold text-green-400">{summary.n_complete}</div>
        <div className="text-xs text-gray-400 mt-0.5">COMPLETE</div>
      </div>
      <div className="bg-card border border-border rounded-xl px-5 py-4">
        <div className="font-mono text-2xl font-bold text-amber-400">{summary.n_partial}</div>
        <div className="text-xs text-gray-400 mt-0.5">PARTIAL</div>
      </div>
      <div className="bg-card border border-border rounded-xl px-5 py-4">
        <div className="font-mono text-2xl font-bold text-red-400">{summary.n_incomplete}</div>
        <div className="text-xs text-gray-400 mt-0.5">INCOMPLETE</div>
      </div>
    </div>
  );
}

function ComparisonChart({ prodiSummary }) {
  const chartData = (prodiSummary || [])
    .filter(p => p.n_items > 0)
    .map(p => ({
      name: p.short ?? p.key,
      CRI:  p.cri_mean ?? 0,
      ESCO: p.r_esco_mean ?? 0,
      ONET: p.r_onet_mean ?? 0,
      SKKNI:p.r_skkni_mean ?? 0,
      color: p.color,
    }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} angle={-20} textAnchor="end" interval={0} />
        <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} domain={[0, 0.6]} />
        <Tooltip
          contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "#e2e8f0" }}
          formatter={(v) => v != null ? v.toFixed(4) : "—"}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8", paddingTop: 4 }} />
        <Bar dataKey="ESCO"  fill="#06b6d4" maxBarSize={12} radius={[2,2,0,0]} />
        <Bar dataKey="ONET"  fill="#f59e0b" maxBarSize={12} radius={[2,2,0,0]} />
        <Bar dataKey="SKKNI" fill="#22c55e" maxBarSize={12} radius={[2,2,0,0]} />
        <Bar dataKey="CRI"   maxBarSize={12} radius={[2,2,0,0]}>
          {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CRIDashboard() {
  const [activeKey, setActiveKey] = useState("SI");
  const [selectedCPL, setSelectedCPL] = useState(null);

  const activeMeta = PRODI_DEFS.find(p => p.key === activeKey) ?? PRODI_DEFS[0];

  // All-prodi summary (for comparison chart + tab counts)
  const { data: prodiSummaryRaw } = useQuery({
    queryKey: ["cri-by-prodi-summary"],
    queryFn: () => axios.get(`${API_BASE}/cri/by-prodi/summary`).then(r => r.data),
    staleTime: 30_000,
  });

  // Per-prodi CPL items
  const { data: items, isLoading } = useQuery({
    queryKey: ["cri-by-prodi", activeKey],
    queryFn: () => axios.get(`${API_BASE}/cri/by-prodi/${activeKey}`).then(r => r.data),
    staleTime: 30_000,
  });

  const summary = items && items.length > 0 ? {
    cri_mean: (items.reduce((a, b) => a + b.cri_score, 0) / items.length).toFixed(4),
    n_complete:   items.filter(i => i.cri_flag === "COMPLETE").length,
    n_partial:    items.filter(i => i.cri_flag === "PARTIAL").length,
    n_incomplete: items.filter(i => i.cri_flag === "INCOMPLETE").length,
    top_gaps: [...items].sort((a, b) => a.cri_score - b.cri_score).slice(0, 3),
  } : null;

  // Merge color into prodiSummary for chart
  const prodiSummary = (prodiSummaryRaw || []).map(p => ({
    ...p,
    short: PRODI_DEFS.find(d => d.key === p.key)?.short ?? p.key,
    color: PRODI_DEFS.find(d => d.key === p.key)?.color ?? "#666",
  }));

  return (
    <div className="page pt-[52px] min-h-screen">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="px-10 py-6 border-b border-border">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
          <div>
            <h1 className="font-display text-2xl font-extrabold mb-1">CRI Dashboard</h1>
            <p className="text-sm text-gray-400">
              Career Readiness Index per butir CPL — 4 program studi, config basis v1.2
            </p>
          </div>
        </div>

        {/* Comparison chart */}
        {prodiSummary.some(p => p.n_items > 0) && (
          <div className="mb-4">
            <div className="text-xs font-semibold text-gray-400 mb-2">Perbandingan CRI Semua Prodi</div>
            <ComparisonChart prodiSummary={prodiSummary} />
          </div>
        )}

        {/* Tab bar — 4 prodi */}
        <div className="flex gap-1 flex-wrap">
          {PRODI_DEFS.map(p => {
            const meta = prodiSummary.find(s => s.key === p.key);
            const n = meta?.n_items ?? 0;
            const isActive = activeKey === p.key;
            return (
              <button
                key={p.key}
                onClick={() => setActiveKey(p.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all border ${
                  isActive
                    ? "text-white border-transparent"
                    : "bg-transparent text-gray-400 border-border hover:border-border2 hover:bg-bg3"
                }`}
                style={isActive ? { background: p.color, borderColor: p.color } : {}}
              >
                {p.label}
                <span className="ml-1.5 font-mono text-[10px] opacity-70">({n})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Summary cards ────────────────────────────────────────────────────── */}
      {summary && (
        <div className="px-10 py-5 border-b border-border">
          <SummaryCards summary={summary} prodiMeta={activeMeta} />

          <div className="bg-bg3 border border-border rounded-xl p-4 text-sm">
            <div className="font-semibold text-white mb-2">Ringkasan — {activeMeta.label}</div>
            <p className="text-gray-300 text-sm">
              CRI rata-rata{" "}
              <span className="font-mono" style={{ color: activeMeta.color }}>{summary.cri_mean}</span>.
              {" "}CPL dengan skor terendah:
            </p>
            <div className="mt-2 flex gap-2 flex-wrap">
              {summary.top_gaps.map((g) => (
                <span key={g.source_id}
                  className="px-2 py-1 rounded bg-red-500/15 text-red-300 text-xs font-mono">
                  {g.source_id} ({g.cri_score.toFixed(3)})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── CPL Grid ─────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="px-10 py-10 text-sm text-gray-400">Memuat data CPL...</div>
      ) : !items || items.length === 0 ? (
        <div className="px-10 py-10">
          <div className="bg-card border border-amber-500/30 rounded-xl p-6">
            <div className="text-sm font-semibold text-amber-400 mb-1">Data belum tersedia</div>
            <p className="text-sm text-gray-400">
              Jalankan pipeline dari menu <span className="text-gold font-semibold">Pipeline</span> untuk
              menghasilkan CRI data prodi ini.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4 px-10 py-5">
          {[...items].sort((a, b) => {
            const n = s => parseInt((s.source_id || "").split("-").pop(), 10) || 0;
            return n(a) - n(b);
          }).map(item => {
            const flag  = FLAG_STYLES[item.cri_flag] ?? FLAG_STYLES.INCOMPLETE;
            const ranah = RANAH_STYLES[item.ranah] ?? { bg: "bg-gray-500/15", text: "text-gray-300" };

            return (
              <div key={item.source_id}
                className="bg-card border border-border rounded-xl p-4 cursor-pointer transition-all hover:border-border2 hover:-translate-y-0.5">

                {/* Header */}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold" style={{ color: activeMeta.color }}>
                      {item.source_id}
                    </span>
                    {item.univ_label && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg3 text-gray-400 font-mono">
                        {item.univ_label}
                      </span>
                    )}
                    <span className="font-mono text-base font-extrabold text-gold">
                      {item.cri_score.toFixed(4)}
                    </span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${ranah.bg} ${ranah.text}`}>
                    {item.ranah}
                  </span>
                </div>

                {/* Flag */}
                <div className={`inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-full font-semibold font-mono mb-3 ${flag.bg} ${flag.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${flag.dot}`} />
                  {item.cri_flag}
                </div>

                {/* Score bars */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                    <span className="w-12 text-cyan-500">ESCO</span>
                    <ScoreBar value={item.r_esco} color="#0891b2" />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                    <span className="w-12 text-green-500">O*NET</span>
                    <ScoreBar value={item.r_onet} color="#059669" />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                    <span className="w-12 text-amber-500">SKKNI</span>
                    <ScoreBar value={item.r_skkni} color="#d97706" />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex gap-3 text-xs">
                    <span className="text-cyan-400">ESCO: {item.n_ok_esco}</span>
                    <span className="text-green-400">O*NET: {item.n_ok_onet}</span>
                    <span className="text-amber-400">SKKNI: {item.n_ok_skkni}</span>
                  </div>
                  {(item.n_ok_esco + item.n_ok_onet + item.n_ok_skkni) > 0 ? (
                    <button
                      onClick={() => setSelectedCPL(item.source_id)}
                      className="text-xs px-3 py-1.5 bg-bg3 hover:bg-gray-700 text-gray-300 hover:text-white rounded transition-colors"
                    >
                      Detail →
                    </button>
                  ) : (
                    <span className="text-xs text-gray-500 italic">Tidak ada mapping</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {selectedCPL && (
        <CPLDetailPanel
          sourceId={selectedCPL}
          config="v1.2"
          onClose={() => setSelectedCPL(null)}
        />
      )}
    </div>
  );
}
