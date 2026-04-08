import { useMemo } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import axios from "axios";
import { API_BASE } from "../config/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend,
} from "recharts";

// ─── Constants ────────────────────────────────────────────────────────────────

const PRODI_COLORS = {
  SI: "#0891b2",
  TI: "#7c3aed",
  IF: "#8b5cf6",
  TK: "#22c55e",
};

const PRODI_LABELS = {
  SI: "Sistem Informasi",
  TI: "Teknologi Informasi",
  IF: "Informatika",
  TK: "Teknik Komputer",
};

// ─── Small components ─────────────────────────────────────────────────────────

function Card({ title, value, sub, color = "text-white" }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="text-[11px] text-gray-400">{title}</div>
      <div className={`font-mono text-2xl font-bold mt-1 ${color}`}>{value}</div>
      {sub && <div className="text-[11px] text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

function MiniBar({ label, value, color }) {
  const pct = Math.max(0, Math.min(100, (value ?? 0) * 100));
  return (
    <div className="mb-2">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-gray-300 truncate max-w-[160px]">{label}</span>
        <span className="font-mono text-gray-200 ml-2">{(value ?? 0).toFixed(3)}</span>
      </div>
      <div className="h-2 bg-bg3 rounded overflow-hidden">
        <div className="h-full rounded" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

// ─── CRI per-prodi chart ──────────────────────────────────────────────────────

function CRIProdiChart({ prodiSummary }) {
  const data = (prodiSummary || [])
    .filter(p => p.n_items > 0)
    .map(p => ({
      name: p.key,
      CRI:  p.cri_mean ?? 0,
      ESCO: p.r_esco_mean ?? 0,
      ONET: p.r_onet_mean ?? 0,
      SKKNI:p.r_skkni_mean ?? 0,
      color: PRODI_COLORS[p.key] ?? "#666",
    }));

  if (!data.length) return <div className="text-xs text-gray-500 py-4 text-center">Data belum tersedia.</div>;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 36 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} angle={-20} textAnchor="end" interval={0} />
        <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} domain={[0, 0.5]} />
        <Tooltip
          contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 11 }}
          formatter={(v) => v?.toFixed(4)}
        />
        <Legend wrapperStyle={{ fontSize: 10, color: "#94a3b8" }} />
        <Bar dataKey="ESCO"  fill="#06b6d4" maxBarSize={10} radius={[2,2,0,0]} />
        <Bar dataKey="ONET"  fill="#f59e0b" maxBarSize={10} radius={[2,2,0,0]} />
        <Bar dataKey="SKKNI" fill="#22c55e" maxBarSize={10} radius={[2,2,0,0]} />
        <Bar dataKey="CRI" maxBarSize={10} radius={[2,2,0,0]}>
          {data.map((d, i) => <Cell key={i} fill={d.color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Infographics() {
  const { data: stats } = useQuery({
    queryKey: ["graph-stats"],
    queryFn: () => axios.get(`${API_BASE}/graph/stats`).then(r => r.data),
    refetchInterval: 15000,
  });

  const { data: prodiSummary } = useQuery({
    queryKey: ["cri-by-prodi-summary"],
    queryFn: () => axios.get(`${API_BASE}/cri/by-prodi/summary`).then(r => r.data),
    staleTime: 30_000,
  });

  const { data: ranah } = useQuery({
    queryKey: ["ranah-summary"],
    queryFn: () => axios.get(`${API_BASE}/cri/ranah/summary`).then(r => r.data),
    refetchInterval: 15000,
  });

  const { data: ablation } = useQuery({
    queryKey: ["ablation-overview"],
    queryFn: () => axios.get(`${API_BASE}/ablation/`).then(r => r.data),
    refetchInterval: 15000,
  });

  const domainProdiQueries = useQueries({
    queries: ["SI", "TI", "CS", "SE", "CE", "DS"].map((prodi) => ({
      queryKey: ["domain-prodi", prodi],
      queryFn: () => axios.get(`${API_BASE}/domain/${prodi}`).then(r => r.data),
      staleTime: 60 * 1000,
    })),
  });

  const empty = useMemo(() => !stats || (stats.total_nodes || 0) === 0, [stats]);

  const frameworkTotal = (stats?.esco_skill_nodes || 0) + (stats?.onet_nodes || 0) + (stats?.skkni_nodes || 0);
  const escoPct  = frameworkTotal ? ((stats?.esco_skill_nodes || 0) / frameworkTotal) * 100 : 0;
  const onetPct  = frameworkTotal ? ((stats?.onet_nodes    || 0) / frameworkTotal) * 100 : 0;
  const skkniPct = frameworkTotal ? ((stats?.skkni_nodes   || 0) / frameworkTotal) * 100 : 0;

  const donutStyle = {
    background: `conic-gradient(
      #0891b2 0 ${escoPct}%,
      #059669 ${escoPct}% ${escoPct + onetPct}%,
      #d97706 ${escoPct + onetPct}% 100%
    )`,
  };

  const configAverages = useMemo(() => {
    if (!ablation?.heatmap || !ablation?.configs) return [];
    const rows = Object.values(ablation.heatmap);
    return ablation.configs.map((cfg) => {
      const vals = rows.map((r) => r?.[cfg]?.selection_objective).filter((v) => typeof v === "number");
      const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      return { cfg, avg };
    }).sort((a, b) => b.avg - a.avg);
  }, [ablation]);

  // Overall CRI weighted by n_items
  const hasProdiData = (prodiSummary || []).some(p => p.n_items > 0);
  const overallCRI = hasProdiData
    ? (() => {
        const filled = (prodiSummary || []).filter(p => p.cri_mean != null && p.n_items > 0);
        const totalItems = filled.reduce((s, p) => s + p.n_items, 0);
        const weighted = filled.reduce((s, p) => s + (p.cri_mean ?? 0) * p.n_items, 0);
        return totalItems > 0 ? (weighted / totalItems).toFixed(4) : "—";
      })()
    : "—";

  if (empty) {
    return (
      <div className="page pt-[52px] min-h-screen px-6 md:px-10 py-7">
        <h1 className="font-display text-2xl font-extrabold mb-2">Infografis Dashboard</h1>
        <div className="bg-card border border-border rounded-xl p-6 text-sm text-gray-300">
          Data masih kosong. Jalankan pipeline dulu dari menu{" "}
          <span className="text-gold font-semibold">Pipeline</span> untuk menghasilkan infografis.
        </div>
      </div>
    );
  }

  return (
    <div className="page pt-[52px] min-h-screen px-6 md:px-10 py-7">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold mb-1">Infografis Dashboard</h1>
        <p className="text-sm text-gray-400">
          Ringkasan visual kondisi knowledge graph, CRI per program studi, dan performa konfigurasi.
        </p>
      </div>

      {/* ── KPI ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Card title="Total Nodes" value={(stats?.total_nodes || 0).toLocaleString()} color="text-cyan-300" />
        <Card title="Total Edges" value={(stats?.total_edges || 0).toLocaleString()} color="text-purple-300" />
        <Card title="Total CPL" value={(prodiSummary || []).reduce((s, p) => s + (p.n_items ?? 0), 0)} color="text-gold" sub="4 program studi" />
        <Card title="CRI Overall" value={overallCRI} color="text-emerald-300" sub="rata-rata tertimbang" />
      </div>

      {/* ── Row 2 ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        {/* Donut */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="text-sm font-semibold mb-4">Komposisi Framework Nodes</div>
          <div className="flex items-center gap-5">
            <div className="w-32 h-32 rounded-full relative flex-shrink-0" style={donutStyle}>
              <div className="absolute inset-5 bg-bg rounded-full flex items-center justify-center">
                <span className="font-mono text-xs text-gray-300">{frameworkTotal.toLocaleString()}</span>
              </div>
            </div>
            <div className="text-xs space-y-2">
              <div><span className="inline-block w-2 h-2 rounded-full bg-cyan-500 mr-2" />ESCO {escoPct.toFixed(1)}%</div>
              <div><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2" />O*NET {onetPct.toFixed(1)}%</div>
              <div><span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-2" />SKKNI {skkniPct.toFixed(1)}%</div>
            </div>
          </div>
        </div>

        {/* CRI per Prodi bars */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="text-sm font-semibold mb-4">CRI per Program Studi</div>
          {(prodiSummary || []).filter(p => p.n_items > 0).map(p => (
            <MiniBar
              key={p.key}
              label={PRODI_LABELS[p.key] ?? p.key}
              value={p.cri_mean ?? 0}
              color={PRODI_COLORS[p.key] ?? "#666"}
            />
          ))}
          {!(prodiSummary || []).some(p => p.n_items > 0) && (
            <div className="text-xs text-gray-500">Belum ada data — jalankan pipeline.</div>
          )}
        </div>

        {/* Config ranking */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="text-sm font-semibold mb-4">Rata-rata Selection Objective per Config</div>
          {configAverages.length > 0 ? configAverages.slice(0, 6).map((c, i) => (
            <MiniBar key={c.cfg} label={`${i + 1}. ${c.cfg}`} value={c.avg} color={i === 0 ? "#f0b840" : "#334155"} />
          )) : (
            <div className="text-xs text-gray-500">Belum ada data ablation.</div>
          )}
        </div>
      </div>

      {/* ── CRI Chart full-width ────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-5 mb-5">
        <div className="text-sm font-semibold mb-1">CRI × Framework per Program Studi</div>
        <div className="text-xs text-gray-500 mb-4">
          R_ESCO, R_ONET, R_SKKNI dan CRI mean — 4 prodi (setelah pipeline dijalankan)
        </div>
        <CRIProdiChart prodiSummary={prodiSummary} />
      </div>

      {/* ── Coverage per Ranah ───────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-5 mb-5">
        <div className="text-sm font-semibold mb-4">Coverage per Ranah</div>
        {ranah && ranah.length > 0 ? (
          <div className="space-y-3">
            {ranah.map((r) => (
              <div key={r.ranah} className="border border-border rounded-lg p-3">
                <div className="text-xs text-gray-200 mb-2">{r.ranah}</div>
                <MiniBar label="ESCO"  value={r.has_mapping_esco  || 0} color="#0891b2" />
                <MiniBar label="O*NET" value={r.has_mapping_onet  || 0} color="#059669" />
                <MiniBar label="SKKNI" value={r.has_mapping_skkni || 0} color="#d97706" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-gray-500">Data ranah belum tersedia.</div>
        )}
      </div>

      {/* ── Domain Coverage Stage 00 ─────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="text-sm font-semibold mb-1">Domain Coverage per Prodi (Stage 00)</div>
        <div className="text-xs text-gray-500 mb-4">Rasio core URIs terhadap total (core + adjacent) per prodi APTIKOM</div>
        <div className="space-y-1">
          {["SI", "TI", "CS", "SE", "CE", "DS"].map((prodi, i) => {
            const d = domainProdiQueries[i]?.data;
            const nCore = d?.n_core ?? 0;
            const nAdj  = d?.n_adjacent ?? 0;
            const total = nCore + nAdj;
            const ratio = total > 0 ? nCore / total : 0;
            return (
              <div key={prodi}>
                <MiniBar label={prodi} value={ratio} color="#0284c7" />
                <div className="text-[10px] text-gray-500 -mt-1 mb-1">
                  {total > 0
                    ? `${nCore} core + ${nAdj} adjacent skills`
                    : "Belum ada data — jalankan pipeline stage00"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
