import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../config/api";

const CARDS = [
  { path: "/domain-map", tag: "STAGE 00 · 6 PRODI", title: "Domain Map", desc: "Peta domain 6 prodi APTIKOM dengan ISCED-F hierarchy, core/adjacent skills, dan overlap matrix." },
  { path: "/infografis", tag: "VISUAL", title: "Infografis Dashboard", desc: "Ringkasan visual metrik utama: KPI, donut komposisi framework, coverage ranah, dan performa konfigurasi." },
  { path: "/kg", tag: "INTERACTIVE", title: "KG Explorer", desc: "Eksplorasi knowledge graph interaktif. Klik node, expand ego graph, dan telusuri koneksi lintas framework." },
  { path: "/cri", tag: "30 CPL ITEMS", title: "CRI Dashboard", desc: "Career Readiness Index per butir CPL dengan narasi otomatis dan detail mappings." },
  { path: "/ablation", tag: "200 METRICS", title: "Ablation Study", desc: "Heatmap 8 tasks x 5 konfigurasi untuk evaluasi selection objective." },
  { path: "/compare", tag: "SI VS TI", title: "Perbandingan Prodi", desc: "Perbandingan CRI SI vs TI plus delta chart antar konfigurasi." },
  { path: "/pipeline", tag: "OBSERVATORY", title: "Pipeline", desc: "Pantau proses komputasi tiap stage pipeline, log realtime, progress, dan output preview." },
  { path: "/upload", tag: "INPUT", title: "Upload CPL Baru", desc: "Input CPL prodi baru lalu jalankan pipeline dari UI." },
];

export default function Home() {
  const { data: stats } = useQuery({
    queryKey: ["graph-stats"],
    queryFn: () => axios.get(`${API_BASE}/graph/stats`).then((r) => r.data),
    refetchInterval: 15000,
  });

  return (
    <div className="page pt-[52px]">
      <div
        className="relative px-10 py-16 border-b border-border overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 60% 30%, rgba(0,61,122,0.35) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 80% 70%, rgba(200,151,42,0.12) 0%, transparent 60%)
          `,
        }}
      >
        <div className="text-gold font-mono text-[10px] tracking-[3px] uppercase mb-4">IR-KG Research Dashboard</div>
        <h1 className="font-display text-5xl font-extrabold leading-tight mb-4">
          Knowledge Graph
          <br />
          <span className="text-gold">Career Readiness</span>
          <br />
          Index
        </h1>
        <p className="text-sm text-gray-400 max-w-xl leading-relaxed">
          Pemetaan semantik CPL ke ESCO, O*NET, dan SKKNI menggunakan hybrid scoring berbasis TF-IDF, graph cohesion, dan constraint signal.
        </p>

        {stats && (
          <div className="flex gap-5 flex-wrap mt-10">
            <div className="bg-[rgba(8,145,178,0.08)] border border-cyan-500/30 rounded-xl p-4 min-w-[130px]"><div className="font-mono text-xl font-bold text-cyan-400">{stats.esco_skill_nodes.toLocaleString()}</div><div className="text-[11px] text-gray-400 mt-1">ESCO Skills</div></div>
            <div className="bg-[rgba(5,150,105,0.08)] border border-green-500/30 rounded-xl p-4 min-w-[130px]"><div className="font-mono text-xl font-bold text-green-400">{stats.onet_nodes.toLocaleString()}</div><div className="text-[11px] text-gray-400 mt-1">O*NET Occupations</div></div>
            <div className="bg-[rgba(217,119,6,0.08)] border border-amber-500/30 rounded-xl p-4 min-w-[130px]"><div className="font-mono text-xl font-bold text-amber-400">{stats.skkni_nodes.toLocaleString()}</div><div className="text-[11px] text-gray-400 mt-1">SKKNI Units</div></div>
            <div className="bg-[rgba(124,58,237,0.08)] border border-purple-500/30 rounded-xl p-4 min-w-[130px]"><div className="font-mono text-xl font-bold text-purple-400">{stats.total_edges.toLocaleString()}</div><div className="text-[11px] text-gray-400 mt-1">KG Edges</div></div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 p-10">
        {CARDS.map((card) => (
          <Link
            key={card.path}
            to={card.path}
            className="bg-card border border-border rounded-xl p-6 cursor-pointer transition-all hover:border-border2 hover:-translate-y-0.5 hover:shadow-xl group no-underline"
          >
            <span className="text-[10px] font-mono text-gold tracking-wider block mb-2">{card.tag}</span>
            <h3 className="font-display text-[15px] font-bold text-white mb-2">{card.title}</h3>
            <p className="text-xs text-gray-400 leading-relaxed">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
