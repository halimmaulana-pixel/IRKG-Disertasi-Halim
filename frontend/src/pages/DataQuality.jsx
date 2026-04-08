import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_BASE } from "../config/api";

const CONFIGS = ["v0.9", "v1.1", "v1.2", "v1.3", "v1.4"];

function HealthCard({ title, value, note, tone = "text-white" }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs text-gray-400">{title}</div>
      <div className={`mt-2 text-2xl font-bold ${tone}`}>{value}</div>
      {note && <div className="mt-2 text-xs text-gray-500">{note}</div>}
    </div>
  );
}

export default function DataQuality() {
  const { data: stats } = useQuery({
    queryKey: ["quality-graph-stats"],
    queryFn: () => axios.get(`${API_BASE}/graph/stats`).then((r) => r.data),
    refetchInterval: 15000,
  });

  const { data: modeInfo } = useQuery({
    queryKey: ["quality-mode"],
    queryFn: () => axios.get(`${API_BASE}/pipeline/mode`).then((r) => r.data),
    refetchInterval: 15000,
  });

  const { data: qualityRows } = useQuery({
    queryKey: ["quality-resolution-rows"],
    queryFn: async () => {
      const rows = await Promise.all(
        CONFIGS.map(async (config) => {
          const data = await axios
            .get(`${API_BASE}/graph/resolution-status?config=${config}`)
            .then((r) => r.data);
          return { config, ...data };
        })
      );
      return rows;
    },
    refetchInterval: 15000,
  });

  const allClean = (qualityRows || []).every((row) => row.unresolved_count === 0);
  const totalMappings = (qualityRows || []).reduce((sum, row) => sum + (row.total_mappings || 0), 0);

  return (
    <div className="page pt-[52px] min-h-screen px-10 py-7">
      <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-extrabold mb-1">Data Quality / Graph Health</h1>
          <p className="text-sm text-gray-400">
            Audit integritas graph, konsistensi node resolution, dan kesiapan dataset final untuk antarmuka riset.
          </p>
        </div>
        <div className={`rounded-lg border px-3 py-2 text-xs font-semibold ${allClean ? "border-green-500/30 bg-green-600/10 text-green-300" : "border-amber-500/30 bg-amber-600/10 text-amber-300"}`}>
          {allClean ? "Healthy Snapshot" : "Needs Review"}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <HealthCard
          title="Graph Nodes"
          value={(stats?.total_nodes || 0).toLocaleString()}
          note="Node tersimpan di SQLite webapp"
          tone="text-cyan-300"
        />
        <HealthCard
          title="Graph Edges"
          value={(stats?.total_edges || 0).toLocaleString()}
          note="MAPS_TO + struktur ESCO"
          tone="text-purple-300"
        />
        <HealthCard
          title="Tracked Mappings"
          value={totalMappings.toLocaleString()}
          note="Akumulasi mapping pada config aktif"
          tone="text-amber-300"
        />
        <HealthCard
          title="Pipeline Mode"
          value={modeInfo?.readonly ? "Locked" : "Experimental"}
          note="Mode eksekusi webapp saat ini"
          tone={modeInfo?.readonly ? "text-amber-300" : "text-green-300"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div>
              <div className="font-display text-sm font-bold text-white">Resolution Matrix</div>
              <div className="text-xs text-gray-500 mt-1">Semua target mapping harus bisa di-resolve ke node graph.</div>
            </div>
            <div className="text-xs text-gray-500">Configs: {CONFIGS.join(", ")}</div>
          </div>
          <div className="divide-y divide-border">
            {(qualityRows || []).map((row) => (
              <div key={row.config} className="px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-mono text-sm text-white">{row.config}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Resolved {row.resolved_count}/{row.total_mappings} mappings
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono text-sm ${row.unresolved_count === 0 ? "text-green-400" : "text-amber-300"}`}>
                      {(row.resolution_rate * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      unresolved: {row.unresolved_count}
                    </div>
                  </div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-bg3 overflow-hidden">
                  <div
                    className={`h-full ${row.unresolved_count === 0 ? "bg-green-500" : "bg-amber-500"}`}
                    style={{ width: `${Math.max(2, (row.resolution_rate || 0) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="font-display text-sm font-bold text-white">Interpretation</div>
          <div className="mt-3 space-y-3 text-sm text-gray-300">
            <div className="rounded-lg bg-bg3 p-3">
              <div className="text-xs text-gray-500 mb-1">Graph integrity</div>
              <div>
                {allClean
                  ? "Semua mapping yang aktif di webapp sudah terhubung ke node graph. Ini berarti visualisasi KG sekarang konsisten dengan snapshot hasil riset final."
                  : "Masih ada mapping yang tidak bisa di-resolve ke node graph. Visualisasi perlu ditinjau sebelum dipakai sebagai bukti hasil riset."}
              </div>
            </div>
            <div className="rounded-lg bg-bg3 p-3">
              <div className="text-xs text-gray-500 mb-1">Execution safety</div>
              <div>
                {modeInfo?.readonly
                  ? "Mode readonly aktif. Webapp aman untuk presentasi hasil final karena pipeline eksperimen tidak akan menimpa baseline."
                  : "Mode experimental aktif. Cocok untuk uji coba, tetapi hasil baru bisa mengubah persepsi pengguna terhadap baseline final."}
              </div>
            </div>
            <div className="rounded-lg bg-bg3 p-3">
              <div className="text-xs text-gray-500 mb-1">Recommended use</div>
              <div>
                Gunakan halaman ini sebelum demo atau penulisan hasil. Jika `unresolved` bukan nol, hentikan interpretasi graph sampai masalah data diperbaiki.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
