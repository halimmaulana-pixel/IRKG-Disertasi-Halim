import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { API_BASE } from "../config/api";

const CONFIGS = ["v0.9", "v1.1", "v1.2", "v1.3", "v1.4"];

function DeltaBar({ value }) {
  const pct = Math.min(100, Math.abs(value) * 300);
  const positive = value >= 0;
  return (
    <div className="flex items-center gap-2">
      <div className="w-28 h-2 bg-bg3 rounded overflow-hidden">
        <div className={`h-full ${positive ? "bg-green-500" : "bg-red-500"}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`font-mono text-xs ${positive ? "text-green-400" : "text-red-400"}`}>{value >= 0 ? "+" : ""}{value.toFixed(4)}</span>
    </div>
  );
}

export default function Compare() {
  const [configA, setConfigA] = useState("v1.2");
  const [configB, setConfigB] = useState("v1.4");

  const { data } = useQuery({
    queryKey: ["compare"],
    queryFn: () => axios.get(`${API_BASE}/compare/si-ti`).then(r => r.data),
  });

  const { data: deltaSI } = useQuery({
    queryKey: ["delta-summary", "SI", configA, configB],
    queryFn: () => axios.get(`${API_BASE}/graph/delta-summary?prodi=SI&config_a=${configA}&config_b=${configB}`).then(r => r.data),
  });

  const { data: deltaTI } = useQuery({
    queryKey: ["delta-summary", "TI", configA, configB],
    queryFn: () => axios.get(`${API_BASE}/graph/delta-summary?prodi=TI&config_a=${configA}&config_b=${configB}`).then(r => r.data),
  });

  const ProdiPanel = ({ title, code, stats, color }) => (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center font-display text-sm font-extrabold text-white" style={{ background: color }}>
          {code}
        </div>
        <div>
          <div className="font-display text-[15px] font-bold">{title}</div>
          <div className="text-[11px] text-gray-400">15 CPL items</div>
        </div>
      </div>
      <div className="p-6">
        <div className="font-mono text-4xl font-bold mb-1" style={{ color }}>{stats?.cri_mean}</div>
        <div className="text-xs text-gray-400 mb-5">CRI Agregat</div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 w-16">R_ESCO</span>
            <div className="flex-1 h-1.5 bg-bg3 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-cyan-500" style={{ width: `${(stats?.r_esco_mean || 0) * 200}%` }} />
            </div>
            <span className="font-mono text-xs w-12 text-right text-cyan-400">{stats?.r_esco_mean}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 w-16">R_O*NET</span>
            <div className="flex-1 h-1.5 bg-bg3 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-green-500" style={{ width: `${(stats?.r_onet_mean || 0) * 200}%` }} />
            </div>
            <span className="font-mono text-xs w-12 text-right text-green-400">{stats?.r_onet_mean}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 w-16">R_SKKNI</span>
            <div className="flex-1 h-1.5 bg-bg3 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-amber-500" style={{ width: `${(stats?.r_skkni_mean || 0) * 200}%` }} />
            </div>
            <span className="font-mono text-xs w-12 text-right text-amber-400">{stats?.r_skkni_mean}</span>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap mt-5 pt-5 border-t border-border">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold font-mono bg-green-500/15 text-green-400">{stats?.n_complete} COMPLETE</span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold font-mono bg-amber-500/15 text-amber-400">{stats?.n_partial} PARTIAL</span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold font-mono bg-red-500/15 text-red-400">{stats?.n_incomplete} INCOMPLETE</span>
        </div>
      </div>
    </div>
  );

  const DeltaPanel = ({ title, delta }) => (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-sm font-bold">Delta Config {title}</h3>
        <div className="text-[11px] text-gray-400">{configA} {"->"} {configB}</div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
        <div className="bg-bg3 rounded px-2 py-1">Gain: <span className="text-green-400 font-mono">{delta?.summary?.n_gain ?? 0}</span></div>
        <div className="bg-bg3 rounded px-2 py-1">Drop: <span className="text-red-400 font-mono">{delta?.summary?.n_drop ?? 0}</span></div>
        <div className="bg-bg3 rounded px-2 py-1">Same: <span className="text-gray-300 font-mono">{delta?.summary?.n_same ?? 0}</span></div>
      </div>
      <div className="space-y-2 max-h-56 overflow-y-auto">
        {(delta?.items || []).slice(0, 10).map((it) => (
          <div key={it.source_id} className="flex items-center justify-between text-xs border-b border-border pb-1">
            <span className="font-mono text-gray-300">{it.source_id}</span>
            <DeltaBar value={it.delta} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="page pt-[52px] min-h-screen px-4 md:px-10 py-7">
      <h1 className="font-display text-2xl font-extrabold mb-1">Perbandingan SI vs TI</h1>
      <p className="text-sm text-gray-400 mb-6">CRI per prodi + delta perubahan mapping antar konfigurasi.</p>

      <div className="flex gap-3 mb-5 flex-wrap">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Config A</label>
          <select value={configA} onChange={(e) => setConfigA(e.target.value)} className="bg-card border border-border2 text-white text-xs rounded px-3 py-2">
            {CONFIGS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Config B</label>
          <select value={configB} onChange={(e) => setConfigB(e.target.value)} className="bg-card border border-border2 text-white text-xs rounded px-3 py-2">
            {CONFIGS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <ProdiPanel title="Sistem Informasi" code="SI" stats={data?.SI} color="#003d7a" />
        <ProdiPanel title="Teknologi Informasi" code="TI" stats={data?.TI} color="#7c3aed" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DeltaPanel title="SI" delta={deltaSI} />
        <DeltaPanel title="TI" delta={deltaTI} />
      </div>
    </div>
  );
}

