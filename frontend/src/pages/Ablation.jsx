import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { API_BASE } from "../config/api";

const CONFIG_NAMES = {
  "v0.9": "Pure Sem.",
  "v1.1": "Max Accept",
  "v1.2": "Balanced",
  "v1.3": "Precision",
  "v1.4": "Hybrid Opt",
};

const METRICS = [
  { key: "selection_objective", label: "🎯 Objective" },
  { key: "acceptance_rate",     label: "✅ Acceptance" },
  { key: "source_coverage",     label: "📊 Coverage" },
  { key: "mean_final_score",    label: "📈 Mean Score" },
  { key: "forced_top1_ratio",   label: "⚠ FORCED_TOP1" },
];

// Normal green scale: higher = better
function greenColor(v) {
  if (v >= 0.58) return "#166534";
  if (v >= 0.54) return "#15803d";
  if (v >= 0.50) return "#16a34a";
  if (v >= 0.47) return "#22c55e";
  if (v >= 0.44) return "#4ade80";
  if (v >= 0.41) return "#86efac";
  if (v >= 0.38) return "#bbf7d0";
  return "#d1fae5";
}

// Inverted red scale: higher = worse (for forced_top1_ratio)
function redColor(v) {
  if (v >= 0.40) return "#7f1d1d";
  if (v >= 0.30) return "#991b1b";
  if (v >= 0.20) return "#b91c1c";
  if (v >= 0.10) return "#dc2626";
  if (v >= 0.05) return "#f87171";
  if (v > 0)     return "#fca5a5";
  return "#fef2f2";
}

function getColor(v, metric) {
  return metric === "forced_top1_ratio" ? redColor(v) : greenColor(v);
}

function getTextColor(v, metric) {
  if (metric === "forced_top1_ratio") {
    return v >= 0.2 ? "#fff1f2" : "#881337";
  }
  return v >= 0.47 ? "#052e16" : "#064e3b";
}

export default function Ablation() {
  const [activeMetric, setActiveMetric] = useState("selection_objective");

  const { data } = useQuery({
    queryKey: ["ablation"],
    queryFn: () => axios.get(`${API_BASE}/ablation/`).then((r) => r.data),
  });

  const isInverted = activeMetric === "forced_top1_ratio";

  const renderHeatmap = (tasks) => {
    if (!data) return null;
    return tasks.map((task) => {
      const row = data.heatmap[task] || {};
      const values = Object.values(row)
        .map((c) => c[activeMetric])
        .filter((v) => typeof v === "number");
      const bestVal = values.length
        ? isInverted ? Math.min(...values) : Math.max(...values)
        : null;

      return (
        <tr key={task}>
          <td className="font-mono text-xs font-bold text-white py-2 pr-4">{task}</td>
          {data.configs.map((cfg) => {
            const v = row[cfg]?.[activeMetric] ?? 0;
            const isBest = bestVal !== null && v === bestVal;
            const bg = getColor(v, activeMetric);
            const textColor = getTextColor(v, activeMetric);

            return (
              <td key={cfg} className="p-1">
                <div
                  className={`h-10 rounded-md flex flex-col items-center justify-center text-xs border transition-all ${
                    isBest ? "border-gold border-2" : "border-transparent"
                  }`}
                  style={{ background: bg }}
                >
                  <span className="font-mono font-bold" style={{ color: textColor }}>
                    {v.toFixed(4)}
                  </span>
                  {isBest && (
                    <span className="text-[8px]" style={{ color: textColor }}>
                      {isInverted ? "best↓" : "best"}
                    </span>
                  )}
                </div>
              </td>
            );
          })}
        </tr>
      );
    });
  };

  const activeLabel = METRICS.find((m) => m.key === activeMetric)?.label || activeMetric;

  return (
    <div className="page pt-[52px] min-h-screen px-10 py-7">
      <h1 className="font-display text-2xl font-extrabold mb-1">Ablation Study</h1>
      <p className="text-sm text-gray-400 mb-6">
        8 tasks x 5 konfigurasi x 5 metrik. Best config:
        <span className="text-gold font-semibold"> v1.2 Balanced</span>.
      </p>

      {/* Metric Toggle */}
      <div className="flex gap-2 flex-wrap mb-7">
        {METRICS.map((m) => {
          const isActive = activeMetric === m.key;
          const isRed = m.key === "forced_top1_ratio";
          return (
            <button
              key={m.key}
              onClick={() => setActiveMetric(m.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all ${
                isActive
                  ? isRed
                    ? "bg-red-500/20 text-red-300 border-red-500/40"
                    : "bg-usu text-white border-usu2"
                  : "bg-transparent text-gray-400 border-border hover:border-border2 hover:bg-bg3"
              }`}
            >
              {m.label}
            </button>
          );
        })}
        {isInverted && (
          <span className="ml-2 px-2 py-1.5 rounded text-[10px] text-red-300 border border-red-500/30 bg-red-500/10">
            ↓ lower is better
          </span>
        )}
      </div>

      <div className="mb-8">
        <h3 className="font-display text-xs font-bold text-gray-400 tracking-wider uppercase mb-4">
          ESCO-Target Tasks (T1a, T1b, T4) — {activeLabel}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-xs text-gray-400 py-2 pr-4">Task</th>
                {data?.configs.map((cfg) => (
                  <th key={cfg} className="text-center text-xs text-gray-400 py-2">
                    {cfg}
                    <br />
                    <span className="font-normal opacity-70">{CONFIG_NAMES[cfg] || "-"}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>{renderHeatmap(data?.tasks_esco || [])}</tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="font-display text-xs font-bold text-gray-400 tracking-wider uppercase mb-4">
          NonESCO-Target Tasks (T2a, T2b, T3a, T3b, T5) — {activeLabel}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-xs text-gray-400 py-2 pr-4">Task</th>
                {data?.configs.map((cfg) => (
                  <th key={cfg} className="text-center text-xs text-gray-400 py-2">
                    {cfg}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>{renderHeatmap(data?.tasks_nonesco || [])}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
