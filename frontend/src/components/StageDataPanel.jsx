import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis,
  LineChart, Line,
  Cell, LabelList,
} from "recharts";

// ─── Palette ───────────────────────────────────────────────────────────────
const C = {
  esco:   "#06b6d4",
  onet:   "#22c55e",
  skkni:  "#f59e0b",
  sem:    "#06b6d4",
  gr:     "#a78bfa",
  con:    "#f59e0b",
  final:  "#eab308",
  usu:    "#6366f1",
  usu2:   "#818cf8",
  red:    "#ef4444",
  green:  "#22c55e",
  amber:  "#f59e0b",
  gray:   "#374151",
};

const BUCKET_COLORS = {
  "1–2 (stopwords)":   "#374151",
  "2–4 (common)":      "#6366f1",
  "4–6 (informative)": "#06b6d4",
  "6–8 (specific)":    "#a78bfa",
  "8–10 (rare)":       "#f59e0b",
};

const RANAH_COLORS = {
  "Sikap":               "#ef4444",
  "Pengetahuan":         "#06b6d4",
  "Keterampilan Umum":   "#f59e0b",
  "Keterampilan Khusus": "#a78bfa",
};

const FLAG_COLORS = { COMPLETE: "#22c55e", PARTIAL: "#f59e0b", INCOMPLETE: "#ef4444" };

// ─── Tooltip custom gelap ──────────────────────────────────────────────────
function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a2e] border border-[#2d2d4e] rounded-lg px-3 py-2 text-[11px] shadow-xl">
      {label && <div className="text-gray-400 mb-1">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color || p.fill }} />
          <span className="text-gray-300">{p.name}:</span>
          <span className="font-mono text-white">{typeof p.value === "number" ? p.value.toFixed(4) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

function SectionTitle({ children }) {
  return <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4">{children}</div>;
}

function ChartWrap({ h = 260, children }) {
  return <div style={{ height: h }}><ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer></div>;
}

// ─── Stage 00 — Domain Filter ──────────────────────────────────────────────
function DomainFilterView({ data }) {
  // Bar chart: counts per prodi × domain_status
  const statusKeys = [...new Set(data.counts_by_status.map(r => r.domain_status))];
  const prodiList  = [...new Set(data.counts_by_status.map(r => r.prodi))];
  const grouped = prodiList.map(prodi => {
    const row = { prodi };
    data.counts_by_status.filter(r => r.prodi === prodi).forEach(r => { row[r.domain_status] = r.n; });
    return row;
  });
  const statusPalette = { core: C.esco, adjacent: C.gr, peripheral: C.amber };

  // Pie-like: stats per prodi
  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        {data.stats_by_prodi.map(s => (
          <div key={s.prodi} className="bg-bg3 rounded-xl p-4">
            <div className="text-sm font-bold text-white mb-3">Prodi {s.prodi}</div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div><div className="text-gray-500">Total nodes</div><div className="font-mono text-white text-lg font-bold">{s.total.toLocaleString()}</div></div>
              <div><div className="text-gray-500">Whitelist</div><div className="font-mono text-cyan-300 text-lg font-bold">{s.n_whitelist}</div></div>
              <div><div className="text-gray-500">mean S_con</div><div className="font-mono text-purple-300">{s.mean_scon}</div></div>
              <div><div className="text-gray-500">mean sim</div><div className="font-mono text-amber-300">{s.mean_sim}</div></div>
            </div>
          </div>
        ))}
      </div>

      <SectionTitle>Distribusi Domain Status per Prodi</SectionTitle>
      <ChartWrap h={220}>
        <BarChart data={grouped} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4e" />
          <XAxis dataKey="prodi" tick={{ fill: "#9ca3af", fontSize: 11 }} />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
          <Tooltip content={<DarkTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
          {statusKeys.map(sk => (
            <Bar key={sk} dataKey={sk} fill={statusPalette[sk] || "#6b7280"} radius={[3, 3, 0, 0]}>
              <LabelList dataKey={sk} position="top" style={{ fill: "#9ca3af", fontSize: 10 }} />
            </Bar>
          ))}
        </BarChart>
      </ChartWrap>

      <SectionTitle>Sample Nodes (top S_con)</SectionTitle>
      <div className="overflow-x-auto max-h-52 overflow-y-auto">
        <table className="w-full text-[11px]">
          <thead className="sticky top-0 bg-card">
            <tr className="text-gray-500 border-b border-border">
              <th className="py-1 text-left pr-2">Prodi</th>
              <th className="py-1 text-left pr-2">Node (short)</th>
              <th className="py-1 text-left pr-2">Status</th>
              <th className="py-1 text-right pr-2">S_con</th>
              <th className="py-1 text-right">sim</th>
            </tr>
          </thead>
          <tbody>
            {data.samples.slice(0, 20).map((s, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-bg3/50">
                <td className="py-1 pr-2 text-gray-400">{s.prodi}</td>
                <td className="py-1 pr-2 font-mono text-gray-300 max-w-[200px] truncate">{s.node_id.split("/").pop()}</td>
                <td className="py-1 pr-2 font-mono" style={{ color: statusPalette[s.domain_status] || "#9ca3af" }}>{s.domain_status}</td>
                <td className="py-1 pr-2 text-right font-mono text-cyan-300">{s.s_con}</td>
                <td className="py-1 text-right font-mono text-amber-300">{s.sim_score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Stage 01 — TF-IDF Vectorizers ────────────────────────────────────────
function TermCloud({ terms, maxIdf }) {
  return (
    <div className="flex flex-wrap gap-1.5 p-3">
      {terms.map(t => {
        const pct = maxIdf > 0 ? t.idf / maxIdf : 0;
        const fs  = Math.round(9 + pct * 8);
        return (
          <span key={t.term} title={`IDF: ${t.idf}`}
            className="font-mono rounded px-1.5 py-0.5 bg-bg2 text-cyan-300 cursor-default hover:bg-bg3 transition-colors"
            style={{ fontSize: `${fs}px`, opacity: 0.5 + pct * 0.5 }}>
            {t.term}
          </span>
        );
      })}
    </div>
  );
}

function VectorizerView({ data }) {
  const valid = data.vectorizers.filter(v => v.vocab_size);
  const maxVocab = Math.max(...valid.map(v => v.vocab_size), 1);
  const [activeTask, setActiveTask] = useState(valid[0]?.task ?? "");
  const [termTab, setTermTab]       = useState("mid");
  const vec = valid.find(v => v.task === activeTask);

  // Vocab size bar chart data
  const vocabChartData = valid.map(v => ({ task: v.task, vocab: v.vocab_size, size_kb: v.size_kb }));

  // IDF distribution for selected task
  const idfDistData = vec?.idf_distribution
    ? Object.entries(vec.idf_distribution).map(([bucket, n]) => ({ bucket: bucket.split(" ")[0], label: bucket, n }))
    : [];

  const termMap = {
    mid:    { label: "Domain-Informative (IDF 4–6)",   terms: vec?.top_mid_terms    ?? [], color: C.esco },
    rare:   { label: "Paling Spesifik (IDF tinggi)",   terms: vec?.top_rare_terms   ?? [], color: C.amber },
    common: { label: "Paling Umum (IDF rendah)",       terms: vec?.top_common_terms ?? [], color: C.usu },
  };
  const activeTerm = termMap[termTab];
  const maxIdf = Math.max(...activeTerm.terms.map(t => t.idf), 1);

  return (
    <div className="space-y-5">
      {/* Process steps */}
      {data.process_steps && (
        <div>
          <SectionTitle>Alur Proses TF-IDF Build</SectionTitle>
          <div className="flex flex-wrap gap-1">
            {data.process_steps.map((s, i) => (
              <div key={s.step} className="flex items-center gap-1">
                <div className="bg-bg3 rounded-lg px-3 py-2 text-[11px] max-w-[150px]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-4 h-4 rounded-full bg-usu flex items-center justify-center font-mono text-white text-[9px]">{s.step}</span>
                    <span className="text-white font-semibold">{s.name}</span>
                  </div>
                  <div className="text-gray-500 text-[10px]">{s.desc}</div>
                </div>
                {i < data.process_steps.length - 1 && <span className="text-gray-600">→</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vocab size chart */}
      <SectionTitle>Ukuran Vocabulary per Task</SectionTitle>
      <ChartWrap h={200}>
        <BarChart data={vocabChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4e" />
          <XAxis dataKey="task" tick={{ fill: "#9ca3af", fontSize: 11 }} />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
          <Tooltip content={<DarkTooltip />} />
          <Bar dataKey="vocab" name="Vocab Size" radius={[4, 4, 0, 0]}>
            {vocabChartData.map((_, i) => <Cell key={i} fill={i % 2 === 0 ? C.usu : C.usu2} />)}
            <LabelList dataKey="vocab" position="top" style={{ fill: "#9ca3af", fontSize: 10 }} formatter={v => v.toLocaleString()} />
          </Bar>
        </BarChart>
      </ChartWrap>

      {/* Task selector + detail */}
      <div className="flex gap-1.5 flex-wrap">
        {valid.map(v => (
          <button key={v.task} onClick={() => setActiveTask(v.task)}
            className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-colors ${activeTask === v.task ? "bg-usu text-white" : "bg-bg3 text-gray-400 hover:text-white"}`}>
            {v.task}
          </button>
        ))}
      </div>

      {vec && (
        <div className="space-y-4 border-t border-border pt-4">
          <div className="flex flex-wrap gap-4 text-[11px]">
            <span className="bg-bg3 rounded px-2 py-1">vocab <span className="font-mono text-indigo-300 ml-1">{vec.vocab_size?.toLocaleString()}</span></span>
            <span className="bg-bg3 rounded px-2 py-1">max_features <span className="font-mono text-indigo-300 ml-1">{vec.max_features}</span></span>
            <span className="bg-bg3 rounded px-2 py-1">ngram <span className="font-mono text-amber-300 ml-1">({vec.ngram_range?.join(",")})</span></span>
            <span className="bg-bg3 rounded px-2 py-1">IDF min <span className="font-mono text-green-300 ml-1">{vec.idf_min}</span></span>
            <span className="bg-bg3 rounded px-2 py-1">IDF mean <span className="font-mono text-cyan-300 ml-1">{vec.idf_mean}</span></span>
            <span className="bg-bg3 rounded px-2 py-1">IDF max <span className="font-mono text-amber-300 ml-1">{vec.idf_max}</span></span>
          </div>

          <SectionTitle>Distribusi IDF Score — {vec.task}</SectionTitle>
          <ChartWrap h={220}>
            <BarChart data={idfDistData} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4e" />
              <XAxis dataKey="bucket" tick={{ fill: "#9ca3af", fontSize: 10 }} angle={-20} textAnchor="end" interval={0} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-[#1a1a2e] border border-[#2d2d4e] rounded px-3 py-2 text-[11px]">
                    <div className="text-gray-300 mb-1">{d.label}</div>
                    <div className="font-mono text-white">{d.n.toLocaleString()} terms</div>
                    <div className="text-gray-500">{vec.vocab_size ? `${((d.n/vec.vocab_size)*100).toFixed(1)}%` : ""}</div>
                  </div>
                );
              }} />
              <Bar dataKey="n" name="Jumlah Term" radius={[4, 4, 0, 0]}>
                {idfDistData.map((d, i) => <Cell key={i} fill={BUCKET_COLORS[d.label] || "#6b7280"} />)}
                <LabelList dataKey="n" position="top" style={{ fill: "#9ca3af", fontSize: 10 }} formatter={v => v.toLocaleString()} />
              </Bar>
            </BarChart>
          </ChartWrap>

          {/* Term cloud */}
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Visualisasi Term</span>
              {[
                { id: "mid",    label: "Domain-Informative" },
                { id: "rare",   label: "Paling Spesifik" },
                { id: "common", label: "Paling Umum" },
              ].map(tab => (
                <button key={tab.id} onClick={() => setTermTab(tab.id)}
                  className={`px-2.5 py-1 rounded text-[10px] font-semibold ${termTab === tab.id ? "bg-usu text-white" : "bg-bg3 text-gray-400 hover:text-white"}`}>
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="text-[10px] text-gray-500 mb-2">{activeTerm.label} — ukuran font ∝ IDF</div>
            <div className="bg-bg3 rounded-xl min-h-[70px]">
              <TermCloud terms={activeTerm.terms.slice(0, 40)} maxIdf={maxIdf} />
            </div>
            <div className="mt-3 max-h-36 overflow-y-auto">
              <table className="w-full text-[10px]">
                <thead className="sticky top-0 bg-card">
                  <tr className="text-gray-500 border-b border-border">
                    <th className="py-1 text-left pr-3">#</th>
                    <th className="py-1 text-left pr-3">Term</th>
                    <th className="py-1 text-right">IDF</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTerm.terms.map((t, i) => (
                    <tr key={t.term} className="border-b border-border/30 hover:bg-bg3/50">
                      <td className="py-0.5 pr-3 text-gray-600">{i + 1}</td>
                      <td className="py-0.5 pr-3 font-mono" style={{ color: activeTerm.color }}>{t.term}</td>
                      <td className="py-0.5 text-right font-mono text-gray-400">{t.idf}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Stage 02 — Candidates ─────────────────────────────────────────────────
function CandidatesView({ data }) {
  const [activeTask, setActiveTask] = useState(data.tasks[0]?.task ?? "");
  const task = data.tasks.find(t => t.task === activeTask);

  const summaryData = data.tasks.map(t => ({
    task: t.task,
    accepted: t.n_total,
    sources:  t.n_sources,
    mean_sem: t.mean_s_sem,
  }));

  return (
    <div className="space-y-4">
      <SectionTitle>Total Accepted Mappings per Task (v1.2)</SectionTitle>
      <ChartWrap h={200}>
        <BarChart data={summaryData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4e" />
          <XAxis dataKey="task" tick={{ fill: "#9ca3af", fontSize: 11 }} />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
          <Tooltip content={<DarkTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
          <Bar dataKey="accepted" name="Accepted" fill={C.usu} radius={[4, 4, 0, 0]}>
            <LabelList dataKey="accepted" position="top" style={{ fill: "#9ca3af", fontSize: 10 }} />
          </Bar>
          <Bar dataKey="sources" name="Unique Sources" fill={C.esco} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartWrap>

      <div className="flex gap-1.5 flex-wrap">
        {data.tasks.map(t => (
          <button key={t.task} onClick={() => setActiveTask(t.task)}
            className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-colors ${activeTask === t.task ? "bg-usu text-white" : "bg-bg3 text-gray-400 hover:text-white"}`}>
            {t.task}
          </button>
        ))}
      </div>

      {task && (
        <div className="space-y-3">
          <div className="flex gap-4 text-[11px]">
            <span className="bg-bg3 rounded px-2 py-1">Accepted <span className="font-mono text-white ml-1">{task.n_total}</span></span>
            <span className="bg-bg3 rounded px-2 py-1">Sources <span className="font-mono text-white ml-1">{task.n_sources}</span></span>
            <span className="bg-bg3 rounded px-2 py-1">mean S_sem <span className="font-mono text-cyan-300 ml-1">{task.mean_s_sem}</span></span>
          </div>

          <SectionTitle>Top Candidates by S_sem — {task.task}</SectionTitle>
          <ChartWrap h={220}>
            <BarChart data={task.top.slice(0, 8).map(c => ({ ...c, label: c.target_label?.slice(0, 18) + "…" }))}
              layout="vertical" margin={{ top: 5, right: 60, left: 120, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4e" />
              <XAxis type="number" domain={[0, 1]} tick={{ fill: "#9ca3af", fontSize: 10 }} />
              <YAxis type="category" dataKey="label" tick={{ fill: "#9ca3af", fontSize: 10 }} width={115} />
              <Tooltip content={<DarkTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
              <Bar dataKey="s_sem" name="S_sem" fill={C.sem} radius={[0, 3, 3, 0]} />
              <Bar dataKey="s_gr"  name="S_gr"  fill={C.gr}  radius={[0, 3, 3, 0]} />
              <Bar dataKey="s_con" name="S_con" fill={C.con} radius={[0, 3, 3, 0]} />
              <Bar dataKey="s_final" name="S_final" fill={C.final} radius={[0, 3, 3, 0]}>
                <LabelList dataKey="s_final" position="right" style={{ fill: "#eab308", fontSize: 10 }} formatter={v => v?.toFixed(3)} />
              </Bar>
            </BarChart>
          </ChartWrap>
        </div>
      )}
    </div>
  );
}

// ─── Stage 03 — Graph Cohesion ─────────────────────────────────────────────
function GraphCohesionView({ data }) {
  const bColors = { "zero": C.gray, "low (0–0.1)": C.usu, "mid (0.1–0.3)": C.gr, "high (>0.3)": C.esco };

  // Grouped bar: distribution per task
  const buckets = ["zero", "low (0–0.1)", "mid (0.1–0.3)", "high (>0.3)"];
  const chartData = buckets.map(b => {
    const row = { bucket: b };
    data.tasks.forEach(t => { row[t.task] = t.distribution[b] ?? 0; });
    return row;
  });

  // Line chart: mean S_gr per task
  const lineData = data.tasks.map(t => ({ task: t.task, mean: t.mean_s_gr, max: t.max_s_gr, pct: t.pct_nonzero }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-3">
        {data.tasks.map(t => (
          <div key={t.task} className="bg-bg3 rounded-xl p-3 text-center">
            <div className="font-mono font-bold text-usu2 mb-1">{t.task}</div>
            <div className="font-mono text-xl font-bold text-purple-300">{t.mean_s_gr}</div>
            <div className="text-[10px] text-gray-500">mean S_gr</div>
            <div className="text-[10px] text-green-300 mt-1">{t.pct_nonzero}% non-zero</div>
          </div>
        ))}
      </div>

      <SectionTitle>Distribusi S_gr per Task</SectionTitle>
      <ChartWrap h={230}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4e" />
          <XAxis dataKey="bucket" tick={{ fill: "#9ca3af", fontSize: 10 }} angle={-15} textAnchor="end" interval={0} />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
          <Tooltip content={<DarkTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
          {data.tasks.map((t, i) => (
            <Bar key={t.task} dataKey={t.task} fill={[C.usu, C.esco, C.gr, C.amber][i % 4]} radius={[3, 3, 0, 0]} />
          ))}
        </BarChart>
      </ChartWrap>

      <SectionTitle>Statistik S_gr per Task</SectionTitle>
      <ChartWrap h={200}>
        <BarChart data={lineData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4e" />
          <XAxis dataKey="task" tick={{ fill: "#9ca3af", fontSize: 11 }} />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} domain={[0, "auto"]} />
          <Tooltip content={<DarkTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
          <Bar dataKey="mean" name="mean S_gr" fill={C.gr} radius={[4, 4, 0, 0]}>
            <LabelList dataKey="mean" position="top" style={{ fill: "#a78bfa", fontSize: 10 }} />
          </Bar>
          <Bar dataKey="max" name="max S_gr" fill={C.esco} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartWrap>
    </div>
  );
}

// ─── Stage 04 — Hybrid Scoring ─────────────────────────────────────────────
function HybridScoringView({ data }) {
  const [activeTask, setActiveTask] = useState(data.tasks[0]?.task ?? "");
  const task = data.tasks.find(t => t.task === activeTask);

  const summaryData = data.tasks.map(t => ({
    task: t.task,
    mean_s_final: t.mean_s_final,
    max_s_final:  t.max_s_final,
    accepted:     t.n_accepted,
  }));

  return (
    <div className="space-y-4">
      <SectionTitle>Mean S_final per Task (v1.2)</SectionTitle>
      <ChartWrap h={210}>
        <BarChart data={summaryData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4e" />
          <XAxis dataKey="task" tick={{ fill: "#9ca3af", fontSize: 11 }} />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} domain={[0, 1]} />
          <Tooltip content={<DarkTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
          <Bar dataKey="mean_s_final" name="mean S_final" fill={C.final} radius={[4, 4, 0, 0]}>
            <LabelList dataKey="mean_s_final" position="top" style={{ fill: "#eab308", fontSize: 10 }} formatter={v => v?.toFixed(3)} />
          </Bar>
          <Bar dataKey="max_s_final" name="max S_final" fill={C.esco} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartWrap>

      <div className="flex gap-1.5 flex-wrap">
        {data.tasks.map(t => (
          <button key={t.task} onClick={() => setActiveTask(t.task)}
            className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-colors ${activeTask === t.task ? "bg-usu text-white" : "bg-bg3 text-gray-400 hover:text-white"}`}>
            {t.task}
          </button>
        ))}
      </div>

      {task && (
        <div className="space-y-3">
          <div className="flex gap-3 text-[11px] flex-wrap">
            <span className="bg-bg3 rounded px-2 py-1">Accepted <span className="font-mono text-white ml-1">{task.n_accepted}</span></span>
            <span className="bg-bg3 rounded px-2 py-1">Forced <span className="font-mono text-amber-300 ml-1">{task.n_forced}</span></span>
            <span className="bg-bg3 rounded px-2 py-1">mean <span className="font-mono text-gold ml-1">{task.mean_s_final}</span></span>
            <span className="bg-bg3 rounded px-2 py-1">max <span className="font-mono text-gold ml-1">{task.max_s_final}</span></span>
          </div>

          <SectionTitle>Top 10 Mappings — Score Breakdown</SectionTitle>
          <ChartWrap h={280}>
            <BarChart
              data={task.top10.map(c => ({ ...c, label: (c.target_label || "").slice(0, 20) + "…" }))}
              layout="vertical" margin={{ top: 5, right: 70, left: 130, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4e" />
              <XAxis type="number" domain={[0, 1]} tick={{ fill: "#9ca3af", fontSize: 10 }} />
              <YAxis type="category" dataKey="label" tick={{ fill: "#9ca3af", fontSize: 10 }} width={125} />
              <Tooltip content={<DarkTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
              <Bar dataKey="s_sem"   name="S_sem"   stackId="a" fill={C.sem}   />
              <Bar dataKey="s_gr"    name="S_gr"    stackId="a" fill={C.gr}    />
              <Bar dataKey="s_con"   name="S_con"   stackId="a" fill={C.con}   />
              <Bar dataKey="s_final" name="S_final" fill={C.final} radius={[0, 3, 3, 0]}>
                <LabelList dataKey="s_final" position="right" style={{ fill: "#eab308", fontSize: 10 }} formatter={v => v?.toFixed(3)} />
              </Bar>
            </BarChart>
          </ChartWrap>
        </div>
      )}
    </div>
  );
}

// ─── Stage 05 — Ablation ───────────────────────────────────────────────────
function AblationView({ data }) {
  const configs = [...new Set(data.rows.map(r => r.config))];
  const tasks   = [...new Set(data.rows.map(r => r.task))];

  // Grouped bar: selection_objective per task (grouped by config)
  const chartData = tasks.map(t => {
    const row = { task: t };
    configs.forEach(c => {
      const match = data.rows.find(r => r.task === t && r.config === c);
      row[c] = match?.selection_objective ?? null;
    });
    return row;
  });

  const confColors = ["#6366f1", "#06b6d4", "#22c55e", "#f59e0b", "#a78bfa", "#ef4444"];

  return (
    <div className="space-y-5">
      <SectionTitle>Selection Objective per Task × Config</SectionTitle>
      <ChartWrap h={280}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4e" />
          <XAxis dataKey="task" tick={{ fill: "#9ca3af", fontSize: 11 }} />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} domain={[0, 1]} />
          <Tooltip content={<DarkTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
          {configs.map((c, i) => (
            <Bar key={c} dataKey={c} fill={confColors[i % confColors.length]} radius={[3, 3, 0, 0]} />
          ))}
        </BarChart>
      </ChartWrap>

      <SectionTitle>Mean Final Score per Task × Config</SectionTitle>
      <ChartWrap h={270}>
        <BarChart
          data={tasks.map(t => {
            const row = { task: t };
            configs.forEach(c => {
              const m = data.rows.find(r => r.task === t && r.config === c);
              row[`${c}_mfs`] = m?.mean_final_score ?? null;
            });
            return row;
          })}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4e" />
          <XAxis dataKey="task" tick={{ fill: "#9ca3af", fontSize: 11 }} />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} domain={[0, 1]} />
          <Tooltip content={<DarkTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
          {configs.map((c, i) => (
            <Bar key={c} dataKey={`${c}_mfs`} name={c} fill={confColors[i % confColors.length]} radius={[3, 3, 0, 0]} />
          ))}
        </BarChart>
      </ChartWrap>

      <SectionTitle>Best Config per Task</SectionTitle>
      <div className="flex flex-wrap gap-2">
        {data.best_per_task.map(b => (
          <div key={b.task} className="bg-bg3 rounded-lg px-3 py-2 text-[11px]">
            <span className="font-mono font-bold text-usu2 mr-1.5">{b.task}</span>
            <span className="font-mono text-green-300">{b.config}</span>
            <span className="text-gray-500 ml-2">Obj={b.selection_objective?.toFixed(4)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stage 05b — Coverage by Ranah ────────────────────────────────────────
function CoverageRanahView({ data }) {
  const chartData = data.summary.map(r => ({
    ranah:    r.ranah.replace("Keterampilan ", "KT. "),
    ESCO:     Math.round(r.has_mapping_esco * 100),
    ONET:     Math.round(r.has_mapping_onet * 100),
    SKKNI:    Math.round(r.has_mapping_skkni * 100),
    sfin_e:   r.mean_sfinal_esco,
    sfin_o:   r.mean_sfinal_onet,
    sfin_s:   r.mean_sfinal_skkni,
    n:        r.n_items,
    full:     r.ranah,
  }));

  const scoreData = data.summary.map(r => ({
    ranah:  r.ranah.replace("Keterampilan ", "KT. "),
    ESCO:   r.mean_sfinal_esco,
    ONET:   r.mean_sfinal_onet,
    SKKNI:  r.mean_sfinal_skkni,
  }));

  return (
    <div className="space-y-5">
      <SectionTitle>Coverage (%) per Ranah</SectionTitle>
      <ChartWrap h={230}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4e" />
          <XAxis dataKey="ranah" tick={{ fill: "#9ca3af", fontSize: 10 }} angle={-15} textAnchor="end" interval={0} />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} unit="%" domain={[0, 100]} />
          <Tooltip content={<DarkTooltip />} formatter={(v) => [`${v}%`]} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
          <Bar dataKey="ESCO"  fill={C.esco}  radius={[3, 3, 0, 0]}>
            <LabelList dataKey="ESCO"  position="top" style={{ fill: C.esco, fontSize: 10 }} formatter={v => `${v}%`} />
          </Bar>
          <Bar dataKey="ONET"  fill={C.onet}  radius={[3, 3, 0, 0]} />
          <Bar dataKey="SKKNI" fill={C.skkni} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ChartWrap>

      <SectionTitle>Mean S_final per Ranah × Framework</SectionTitle>
      <ChartWrap h={230}>
        <RadarChart data={scoreData} cx="50%" cy="50%">
          <PolarGrid stroke="#2d2d4e" />
          <PolarAngleAxis dataKey="ranah" tick={{ fill: "#9ca3af", fontSize: 10 }} />
          <PolarRadiusAxis angle={30} domain={[0, 0.6]} tick={{ fill: "#6b7280", fontSize: 9 }} />
          <Radar name="ESCO"  dataKey="ESCO"  stroke={C.esco}  fill={C.esco}  fillOpacity={0.2} />
          <Radar name="O*NET" dataKey="ONET"  stroke={C.onet}  fill={C.onet}  fillOpacity={0.2} />
          <Radar name="SKKNI" dataKey="SKKNI" stroke={C.skkni} fill={C.skkni} fillOpacity={0.2} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
          <Tooltip content={<DarkTooltip />} />
        </RadarChart>
      </ChartWrap>
    </div>
  );
}

// ─── T10 — CRI ─────────────────────────────────────────────────────────────
function CRIView({ data }) {
  // Build univ tab list from summary_univ or fallback to prodi
  const univTabs = (data.summary_univ && data.summary_univ.length > 0)
    ? data.summary_univ
    : Object.entries(data.summary || {}).map(([p, s]) => ({ key: p, label: p, prodi: p, univ: null, ...s, cri_mean: s.mean_cri }));

  const [activeKey, setActiveKey] = useState(univTabs[0]?.key ?? "SI");

  const activeMeta = univTabs.find(t => t.key === activeKey) || univTabs[0];

  // Filter rows by univ+prodi
  const rows = data.rows.filter(r => {
    if (!activeMeta) return false;
    if (activeMeta.univ) {
      const parts = r.source_id?.split("_") || [];
      const rowUniv = parts.length >= 3 ? parts[1] : "UMSU";
      return rowUniv === activeMeta.univ && r.prodi === activeMeta.prodi;
    }
    return r.prodi === activeMeta.prodi;
  });

  const chartData = rows.map(r => ({
    id:    r.source_id?.split("_").slice(2).join("_") || r.source_id,
    cri:   r.cri_score,
    esco:  r.r_esco,
    onet:  r.r_onet,
    skkni: r.r_skkni,
    flag:  r.cri_flag,
    ranah: r.ranah,
  }));

  const ranahData = Object.entries(
    rows.reduce((acc, r) => {
      if (!acc[r.ranah]) acc[r.ranah] = { ranah: r.ranah, cri: 0, count: 0 };
      acc[r.ranah].cri += r.cri_score;
      acc[r.ranah].count++;
      return acc;
    }, {})
  ).map(([, v]) => ({ ranah: v.ranah.replace("Keterampilan ", "KT. "), mean_cri: +(v.cri / v.count).toFixed(4) }));

  // Per-univ comparison chart
  const univChartData = univTabs.map(t => ({
    name: t.label || t.key,
    cri:  t.cri_mean ?? t.mean_cri ?? 0,
    esco: t.cri_esco ?? 0,
    onet: t.cri_onet ?? 0,
    skkni: t.cri_skkni ?? 0,
  }));

  return (
    <div className="space-y-5">
      {/* Comparison chart all univs */}
      {univTabs.length > 1 && (
        <>
          <SectionTitle>CRI per Universitas (semua)</SectionTitle>
          <ChartWrap h={200}>
            <BarChart data={univChartData} margin={{ top: 5, right: 20, left: 0, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4e" />
              <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} domain={[0, 0.6]} />
              <Tooltip content={<DarkTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
              <Bar dataKey="esco"  name="R_ESCO"  fill={C.esco}  maxBarSize={14} radius={[2,2,0,0]} />
              <Bar dataKey="onet"  name="R_ONET"  fill={C.onet}  maxBarSize={14} radius={[2,2,0,0]} />
              <Bar dataKey="skkni" name="R_SKKNI" fill={C.skkni} maxBarSize={14} radius={[2,2,0,0]} />
              <Bar dataKey="cri"   name="CRI"     fill={C.final} maxBarSize={14} radius={[2,2,0,0]} />
            </BarChart>
          </ChartWrap>
        </>
      )}

      {/* Per-univ tabs */}
      <div className="flex gap-1 flex-wrap">
        {univTabs.map(t => (
          <button key={t.key} onClick={() => setActiveKey(t.key)}
            className={`px-3 py-1.5 rounded text-xs font-semibold border transition-all ${activeKey === t.key ? "bg-usu text-white border-usu2" : "bg-bg3 text-gray-400 border-border hover:text-white"}`}>
            {t.label || t.key}
            <span className="ml-1 font-mono opacity-60 text-[10px]">({t.n_items})</span>
          </button>
        ))}
      </div>

      {activeMeta && (
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-bg3 rounded-xl p-3 text-center">
            <div className="font-mono text-xl font-bold text-gold">{(activeMeta.cri_mean ?? activeMeta.mean_cri)?.toFixed(4)}</div>
            <div className="text-[10px] text-gray-500">CRI Mean</div>
          </div>
          <div className="bg-bg3 rounded-xl p-3 text-center">
            <div className="font-mono text-xl font-bold text-green-300">{activeMeta.n_complete}</div>
            <div className="text-[10px] text-gray-500">COMPLETE</div>
          </div>
          <div className="bg-bg3 rounded-xl p-3 text-center">
            <div className="font-mono text-xl font-bold text-amber-300">{activeMeta.n_partial}</div>
            <div className="text-[10px] text-gray-500">PARTIAL</div>
          </div>
          <div className="bg-bg3 rounded-xl p-3 text-center">
            <div className="font-mono text-xl font-bold text-red-400">{activeMeta.n_incomplete}</div>
            <div className="text-[10px] text-gray-500">INCOMPLETE</div>
          </div>
        </div>
      )}

      <SectionTitle>CRI Score per CPL — {activeMeta?.label || activeKey}</SectionTitle>
      <ChartWrap h={280}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4e" />
          <XAxis dataKey="id" tick={{ fill: "#9ca3af", fontSize: 9 }} angle={-45} textAnchor="end" interval={0} />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} domain={[0, 1]} />
          <Tooltip content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0]?.payload;
            return (
              <div className="bg-[#1a1a2e] border border-[#2d2d4e] rounded px-3 py-2 text-[11px] space-y-1">
                <div className="font-mono text-white">{d?.id} — {d?.ranah}</div>
                <div style={{ color: FLAG_COLORS[d?.flag] }}>{d?.flag}</div>
                {payload.map((p, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-gray-400">{p.name}</span>
                    <span className="font-mono text-white">{p.value?.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            );
          }} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
          <Bar dataKey="esco"  name="R_ESCO"  fill={C.esco}  stackId="a" />
          <Bar dataKey="onet"  name="R_ONET"  fill={C.onet}  stackId="a" />
          <Bar dataKey="skkni" name="R_SKKNI" fill={C.skkni} stackId="a" />
          <Bar dataKey="cri"   name="CRI"     fill={C.final} radius={[3, 3, 0, 0]}>
            {chartData.map((d, i) => <Cell key={i} fill={FLAG_COLORS[d.flag] || C.gray} />)}
          </Bar>
        </BarChart>
      </ChartWrap>

      <SectionTitle>Mean CRI per Ranah — {activeMeta?.label || activeKey}</SectionTitle>
      <ChartWrap h={200}>
        <BarChart data={ranahData} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4e" />
          <XAxis dataKey="ranah" tick={{ fill: "#9ca3af", fontSize: 10 }} angle={-15} textAnchor="end" interval={0} />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} domain={[0, 0.6]} />
          <Tooltip content={<DarkTooltip />} />
          <Bar dataKey="mean_cri" name="Mean CRI" radius={[4, 4, 0, 0]}>
            {ranahData.map((d, i) => <Cell key={i} fill={Object.values(RANAH_COLORS)[i % 4]} />)}
            <LabelList dataKey="mean_cri" position="top" style={{ fill: "#9ca3af", fontSize: 10 }} formatter={v => v?.toFixed(4)} />
          </Bar>
        </BarChart>
      </ChartWrap>
    </div>
  );
}

// ─── Stage 06 — ECV ────────────────────────────────────────────────────────
function ECVView({ data }) {
  const tasks = [...new Set(data.rows.map(r => r.task))];
  const [activeTask, setActiveTask] = useState(tasks[0] ?? "");
  const rows = data.rows.filter(r => r.task === activeTask);

  const chartData = rows.map(r => ({
    config:    r.config,
    all_pct:   +(r.row_match_all_rate * 100).toFixed(2),
    rel_pct:   +(r.row_match_reliable_rate * 100).toFixed(2),
    uniq_pct:  +(r.unique_match_all_rate * 100).toFixed(2),
    sfinal:    r.mean_s_final,
  }));

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5 flex-wrap">
        {tasks.map(t => (
          <button key={t} onClick={() => setActiveTask(t)}
            className={`px-3 py-1 rounded text-xs font-mono font-semibold ${activeTask === t ? "bg-usu text-white" : "bg-bg3 text-gray-400 hover:text-white"}`}>
            {t}
          </button>
        ))}
      </div>

      <SectionTitle>Match Rate (%) per Config — {activeTask}</SectionTitle>
      <ChartWrap h={240}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4e" />
          <XAxis dataKey="config" tick={{ fill: "#9ca3af", fontSize: 11 }} />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} unit="%" domain={[0, 100]} />
          <Tooltip content={<DarkTooltip />} formatter={v => `${v}%`} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
          <Bar dataKey="all_pct"  name="Row Match All"      fill={C.esco}  radius={[3, 3, 0, 0]}>
            <LabelList dataKey="all_pct" position="top" style={{ fill: C.esco, fontSize: 10 }} formatter={v => `${v}%`} />
          </Bar>
          <Bar dataKey="rel_pct"  name="Row Match Reliable" fill={C.usu}   radius={[3, 3, 0, 0]} />
          <Bar dataKey="uniq_pct" name="Unique Match"       fill={C.skkni} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ChartWrap>

      <SectionTitle>Mean S_final per Config</SectionTitle>
      <ChartWrap h={180}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4e" />
          <XAxis dataKey="config" tick={{ fill: "#9ca3af", fontSize: 11 }} />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} domain={[0, "auto"]} />
          <Tooltip content={<DarkTooltip />} />
          <Line type="monotone" dataKey="sfinal" name="mean S_final" stroke={C.final} strokeWidth={2} dot={{ fill: C.final, r: 4 }}>
            <LabelList dataKey="sfinal" position="top" style={{ fill: "#eab308", fontSize: 10 }} formatter={v => v?.toFixed(3)} />
          </Line>
        </LineChart>
      </ChartWrap>
    </div>
  );
}

// ─── DB Stats ──────────────────────────────────────────────────────────────
function DBStatsView({ data }) {
  const tasks = data.summary?.tasks_run ?? [];
  const configs = data.summary?.configs_run ?? [];

  return (
    <div className="space-y-4">
      {data.summary && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Pipeline Version",  val: data.summary.version,             color: "text-white" },
            { label: "DB Size",           val: `${data.db_size_mb} MB`,          color: "text-cyan-300" },
            { label: "Total Accepted",    val: data.summary.n_accepted_total?.toLocaleString(), color: "text-gold" },
            { label: "Runtime",           val: `${data.summary.elapsed_seconds}s`, color: "text-purple-300" },
          ].map(item => (
            <div key={item.label} className="bg-bg3 rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-1">{item.label}</div>
              <div className={`font-mono text-xl font-bold ${item.color}`}>{item.val}</div>
            </div>
          ))}
        </div>
      )}

      {tasks.length > 0 && (
        <>
          <SectionTitle>Tasks & Configs yang Dijalankan</SectionTitle>
          <div className="flex gap-2 flex-wrap">
            {tasks.map(t => <span key={t} className="px-2 py-1 rounded bg-usu/20 text-usu2 font-mono text-xs">{t}</span>)}
          </div>
          <div className="flex gap-2 flex-wrap">
            {configs.map(c => <span key={c} className="px-2 py-1 rounded bg-amber-500/15 text-amber-300 font-mono text-xs">{c}</span>)}
          </div>
        </>
      )}

      {data.output_files?.length > 0 && (
        <div>
          <SectionTitle>Output Files</SectionTitle>
          <div className="space-y-1">
            {data.output_files.map(f => (
              <div key={f.name} className="flex items-center justify-between bg-bg3 rounded px-3 py-2 text-[11px]">
                <span className="font-mono text-gray-300">{f.name}</span>
                <span className="text-gray-500">{f.type === "dir" ? `${f.n_files} files` : `${f.size_kb} KB`}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Panel ────────────────────────────────────────────────────────────
export default function StageDataPanel({ data, onClose }) {
  if (!data) return null;

  const renderContent = () => {
    switch (data.type) {
      case "domain_filter":     return <DomainFilterView data={data} />;
      case "vectorizers":       return <VectorizerView data={data} />;
      case "candidates":        return <CandidatesView data={data} />;
      case "graph_cohesion":    return <GraphCohesionView data={data} />;
      case "hybrid_scoring":    return <HybridScoringView data={data} />;
      case "ablation":          return <AblationView data={data} />;
      case "coverage_by_ranah": return <CoverageRanahView data={data} />;
      case "cri":               return <CRIView data={data} />;
      case "ecv":               return <ECVView data={data} />;
      case "db_stats":          return <DBStatsView data={data} />;
      case "error":
        return <div className="text-red-400 text-sm">{data.message}</div>;
      default:
        return <div className="text-gray-400 text-sm">{data.message || "Tidak ada data."}</div>;
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div>
          <span className="font-mono text-xs text-gray-500 mr-2">{data.stage_id}</span>
          <span className="text-sm font-semibold text-white">{data.title}</span>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white text-xs px-2 py-1 rounded bg-bg3">✕ Tutup</button>
      </div>
      <div className="p-4 max-h-[700px] overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
}
