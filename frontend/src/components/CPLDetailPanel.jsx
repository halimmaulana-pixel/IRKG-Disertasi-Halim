import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { API_BASE } from "../config/api";

const FRAMEWORKS = [
  { key: "esco", name: "ESCO Skills", color: "#0891b2", keyField: "target_id" },
  { key: "onet", name: "O*NET Occupations", color: "#059669", keyField: "target_id" },
  { key: "skkni", name: "SKKNI Units", color: "#d97706", keyField: "target_id" },
];

function scoreColor(v) {
  if (v >= 0.50) return "text-green-400";
  if (v >= 0.30) return "text-amber-400";
  return "text-red-400";
}

export default function CPLDetailPanel({ sourceId, config, onClose }) {
  const [activeTab, setActiveTab] = useState("esco");
  const navigate = useNavigate();
  
  const { data } = useQuery({
    queryKey: ['cpl-detail', sourceId, config],
    queryFn: () => axios.get(`${API_BASE}/cri/${sourceId}/mappings?config=${config}`).then(r => r.data)
  });

  const summary = data?.summary;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-card border border-border2 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-border">
          <div>
            <div className="font-mono text-xs text-gold mb-1">{sourceId}</div>
            <h2 className="font-display text-lg font-bold text-white">Detail Mappings</h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(`/kg?node=${encodeURIComponent(sourceId)}`)}
              className="text-xs px-4 py-2 bg-usu hover:bg-usu2 text-white rounded-lg font-medium transition-colors">
              🕸 Lihat di KG Explorer
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-bg3 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors flex items-center justify-center">
              ✕
            </button>
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div className="px-6 py-3 border-b border-border bg-bg3/50 flex gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">ESCO:</span>
              <span className="font-mono text-sm font-bold text-cyan-400">{summary.n_esco}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">O*NET:</span>
              <span className="font-mono text-sm font-bold text-green-400">{summary.n_onet}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">SKKNI:</span>
              <span className="font-mono text-sm font-bold text-amber-400">{summary.n_skkni}</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-border px-6">
          {FRAMEWORKS.map(fw => (
            <button key={fw.key} onClick={() => setActiveTab(fw.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === fw.key 
                  ? "text-white border-white" 
                  : "text-gray-400 border-transparent hover:text-gray-200"
              }`}>
              {fw.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {data && data[activeTab]?.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-3">📭</div>
              <p>Tidak ada mapping untuk framework ini</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data && data[activeTab]?.map((m, i) => {
                const fw = FRAMEWORKS.find(f => f.key === activeTab);
                return (
                  <div key={m.target_id} 
                    className="bg-bg3 border border-border hover:border-border2 rounded-xl p-4 transition-all cursor-pointer"
                    onClick={() => navigate(`/kg?node=${encodeURIComponent(m.target_id)}`)}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold text-white"
                          style={{ background: fw?.color }}>
                          {i + 1}
                        </span>
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-bg2 text-gray-300">{m.target_id}</span>
                      </div>
                      <span className={`font-mono text-sm font-bold ${scoreColor(m.s_final)}`}>
                        {m.s_final?.toFixed(4)}
                      </span>
                    </div>
                    <div className="text-sm text-white mb-3 font-medium">{m.target_label}</div>
                    
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="bg-card rounded-lg p-2">
                        <div className="text-gray-500 mb-0.5">S_sem</div>
                        <div className="font-mono text-cyan-400">{m.s_sem?.toFixed(4)}</div>
                      </div>
                      <div className="bg-card rounded-lg p-2">
                        <div className="text-gray-500 mb-0.5">S_gr</div>
                        <div className="font-mono text-purple-400">{m.s_gr?.toFixed(4)}</div>
                      </div>
                      <div className="bg-card rounded-lg p-2">
                        <div className="text-gray-500 mb-0.5">S_con</div>
                        <div className="font-mono text-amber-400">{m.s_con?.toFixed(4)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
