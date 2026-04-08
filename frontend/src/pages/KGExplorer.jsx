import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import CytoscapeGraph from "../components/CytoscapeGraph";
import { API_BASE } from "../config/api";

const NODE_COLORS = {
  CPL: { bg: "#003d7a", border: "#c8972a" },
  ESCO_SKILL: { bg: "#0891b2", border: "#0e7490" },
  ONET: { bg: "#059669", border: "#047857" },
  SKKNI: { bg: "#d97706", border: "#b45309" },
  ESCO_OCC: { bg: "#7c3aed", border: "#6d28d9" },
};

function DeltaRow({ item }) {
  const color = item.delta > 0 ? "text-green-400" : item.delta < 0 ? "text-red-400" : "text-gray-300";
  const shortId = item.target_id?.split("/").pop() || item.target_id;
  return (
    <div className="flex items-center gap-2 text-xs border-b border-border py-1.5">
      <span className="font-mono text-gray-400 w-24 truncate">{shortId}</span>
      <span className="flex-1 truncate">{item.target_label}</span>
      <span className="font-mono text-cyan-300 w-14 text-right">{item.score_a.toFixed(3)}</span>
      <span className="font-mono text-purple-300 w-14 text-right">{item.score_b.toFixed(3)}</span>
      <span className={`font-mono w-14 text-right ${color}`}>{item.delta.toFixed(3)}</span>
    </div>
  );
}

function formatNodeId(nodeId) {
  const raw = String(nodeId || "").trim();
  if (!raw) return "-";
  return raw.includes("/") ? raw.split("/").pop() : raw;
}

export default function KGExplorer() {
  const [searchParams] = useSearchParams();
  const [elements, setElements] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [viewMode, setViewMode] = useState("ego");
  const [selectedProdi, setSelectedProdi] = useState("SI");
  const [selectedConfig, setSelectedConfig] = useState("v1.2");
  const [compareConfig, setCompareConfig] = useState("v1.4");
  const [depth, setDepth] = useState(1);
  const [minScore, setMinScore] = useState(0);
  const [egoSource, setEgoSource] = useState("SI_UMSU_PLO-1");
  const [storySource, setStorySource] = useState("SI_UMSU_PLO-1");
  const [deltaSource, setDeltaSource] = useState("SI_UMSU_PLO-1");
  const [edgeFilters, setEdgeFilters] = useState({ MAPS_TO: true, BROADER: false, RELATED: false });
  const [storyNarratives, setStoryNarratives] = useState([]);
  const [deltaItems, setDeltaItems] = useState([]);
  const [deltaSummary, setDeltaSummary] = useState(null);
  const [showControls, setShowControls] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionInfo, setActionInfo] = useState("");
  const [resolutionStatus, setResolutionStatus] = useState(null);
  const [autoLoadFailed, setAutoLoadFailed] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ["graph-stats"],
    queryFn: () => axios.get(`${API_BASE}/graph/stats`).then(r => r.data),
    refetchInterval: 15000,
  });

  const { data: resolutionData } = useQuery({
    queryKey: ["graph-resolution-status", selectedConfig],
    queryFn: () => axios.get(`${API_BASE}/graph/resolution-status?config=${selectedConfig}`).then(r => r.data),
    refetchInterval: 15000,
  });

  const { data: domainStatus } = useQuery({
    queryKey: ["node-domain", selectedNode?.id, selectedProdi],
    queryFn: () =>
      axios.get(`${API_BASE}/domain/node-status?node_id=${encodeURIComponent(selectedNode.id)}&prodi=${selectedProdi}`)
        .then(r => r.data),
    enabled: !!selectedNode && selectedNode.node_type === "ESCO_SKILL",
    staleTime: 30000,
  });

  useEffect(() => {
    setResolutionStatus(resolutionData || null);
  }, [resolutionData]);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      axios.get(`${API_BASE}/graph/search?q=${searchQuery}&limit=8`).then(r => setSearchResults(r.data));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadEgoGraph = useCallback(async (nodeId) => {
    try {
      setActionError("");
      const source = (nodeId || "").trim();
      if (!source) {
        setActionError("Source node kosong. Isi node ID dulu (contoh: SI_PLO-4).");
        return;
      }
      const types = Object.entries(edgeFilters).filter(([, v]) => v).map(([k]) => k).join(",");
      const r = await axios.get(
        `${API_BASE}/graph/ego/${encodeURIComponent(source)}?depth=${depth}&config=${selectedConfig}&edge_types=${types}&min_weight=${minScore}&max_nodes=60`
      );
      const nodes = r.data?.nodes || [];
      const edges = r.data?.edges || [];
      setElements([...nodes, ...edges]);
      setSelectedNode(null);
      setSelectedEdge(null);
      setStoryNarratives([]);
      setActionInfo(`Ego graph loaded: ${nodes.length} nodes, ${edges.length} edges.`);
      if (nodes.length === 0) {
        setAutoLoadFailed(true);
        setActionError(`Node ${source} tidak ditemukan atau tidak punya relasi pada filter saat ini.`);
      } else {
        setAutoLoadFailed(false);
        if (edges.length === 0) {
          setActionError(`Node ${source} ditemukan, tetapi tidak ada edge pada filter/config saat ini.`);
        }
      }
    } catch (e) {
      setAutoLoadFailed(true);
      setActionError(e?.response?.data?.detail || e?.message || "Gagal memuat ego graph.");
    }
  }, [depth, selectedConfig, edgeFilters, minScore]);

  const loadProdiSubgraph = useCallback(async () => {
    try {
      setActionError("");
      const r = await axios.get(`${API_BASE}/graph/cpl-subgraph/${selectedProdi}?config=${selectedConfig}`);
      const nodes = r.data?.nodes || [];
      const edges = r.data?.edges || [];
      setElements([...nodes, ...edges]);
      setSelectedEdge(null);
      setStoryNarratives([]);
      setActionInfo(`Prodi graph loaded: ${nodes.length} nodes, ${edges.length} edges.`);
    } catch (e) {
      setActionError(e?.response?.data?.detail || e?.message || "Gagal memuat prodi graph.");
    }
  }, [selectedProdi, selectedConfig]);

  const loadStoryMode = useCallback(async () => {
    try {
      setActionError("");
      const source = (storySource || "").trim();
      if (!source) {
        setActionError("Story source kosong.");
        return;
      }
      const r = await axios.get(`${API_BASE}/graph/story/${encodeURIComponent(source)}?config=${selectedConfig}`);
      const nodes = r.data?.nodes || [];
      const edges = r.data?.edges || [];
      setElements([...nodes, ...edges]);
      setStoryNarratives(r.data.narratives || []);
      setSelectedEdge(null);
      setActionInfo(`Story graph loaded: ${nodes.length} nodes, ${edges.length} edges.`);
    } catch (e) {
      setActionError(e?.response?.data?.detail || e?.message || "Gagal memuat story graph.");
    }
  }, [storySource, selectedConfig]);

  const loadDeltaMode = useCallback(async () => {
    try {
      setActionError("");
      const source = (deltaSource || "").trim();
      if (!source) {
        setActionError("Delta source kosong.");
        return;
      }
      const [detail, summary] = await Promise.all([
        axios.get(`${API_BASE}/graph/delta/${encodeURIComponent(source)}?config_a=${selectedConfig}&config_b=${compareConfig}`).then(r => r.data),
        axios.get(`${API_BASE}/graph/delta-summary?prodi=${selectedProdi}&config_a=${selectedConfig}&config_b=${compareConfig}`).then(r => r.data),
      ]);
      setDeltaItems(detail.items || []);
      setDeltaSummary(summary.summary || null);

      const center = { data: { id: source, label: source, full_label: source, node_type: "CPL", type: "CPL", is_center: true } };
      const edges = (detail.items || []).slice(0, 15).map((d, idx) => ({
        data: {
          id: `delta_${idx}_${d.target_id}`,
          source,
          target: d.target_id,
          edge_type: "MAPS_TO",
          type: "MAPS_TO",
          weight: Math.max(d.score_a, d.score_b),
          s_sem: d.score_a,
          s_gr: d.score_b,
          s_con: 1,
          label: `${d.delta > 0 ? "+" : ""}${d.delta.toFixed(3)}`,
          color: d.delta > 0 ? "#22c55e" : d.delta < 0 ? "#ef4444" : "#94a3b8",
        },
      }));
      const targetNodes = (detail.items || []).slice(0, 15).map((d) => ({
        data: {
          id: d.target_id,
          label: d.target_label,
          full_label: d.target_label,
          node_type: d.target_type || "UNKNOWN",
          type: d.target_type || "UNKNOWN",
        },
      }));
      setElements([center, ...targetNodes, ...edges]);
      setStoryNarratives([]);
      setSelectedEdge(null);
      setActionInfo(`Delta compare loaded: ${targetNodes.length} target nodes.`);
    } catch (e) {
      setActionError(e?.response?.data?.detail || e?.message || "Gagal memuat delta compare.");
    }
  }, [deltaSource, selectedConfig, compareConfig, selectedProdi]);

  useEffect(() => {
    const nodeFromUrl = searchParams.get("node");
    if (nodeFromUrl) {
      setSearchQuery(nodeFromUrl);
      setEgoSource(nodeFromUrl);
      setStorySource(nodeFromUrl);
      setDeltaSource(nodeFromUrl);
      loadEgoGraph(nodeFromUrl).catch(() => {});
      return;
    }
    // Try to find first available CPL node dynamically
    axios.get(`${API_BASE}/graph/search?q=PLO&limit=1`)
      .then(r => {
        const first = r.data?.[0];
        if (first?.id) {
          setEgoSource(first.id);
          setStorySource(first.id);
          setDeltaSource(first.id);
          loadEgoGraph(first.id).catch(() => {});
        } else {
          loadEgoGraph(egoSource).catch(() => {});
        }
      })
      .catch(() => loadEgoGraph(egoSource).catch(() => {}));
  }, []); // eslint-disable-line

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  };

  const handleEdgeClick = (edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  };

  const sidebarClasses = showControls ? "block" : "hidden";

  return (
    <div className="bg-bg text-white pt-[52px] min-h-screen">
      <div className="md:hidden px-3 py-2 border-b border-border bg-bg2 flex items-center justify-between">
        <div className="font-display text-sm font-bold">KG Explorer v2</div>
        <button onClick={() => setShowControls(v => !v)} className="px-3 py-1.5 text-xs rounded bg-usu text-white">
          {showControls ? "Hide Controls" : "Show Controls"}
        </button>
      </div>

      <div className="flex flex-col md:flex-row h-[calc(100vh-52px)]">
        <div className={`${sidebarClasses} md:block md:w-80 md:flex-shrink-0 bg-bg2 border-r border-border overflow-y-auto`}>
          <div className="hidden md:block p-4 bg-usu border-b border-border">
            <h2 className="text-sm font-bold text-white">KG Explorer v2</h2>
            <p className="text-[11px] text-blue-300 mt-1">Ego, Story, Prodi, Delta Compare</p>
          </div>

          {stats && (
            <div className="grid grid-cols-2 gap-1.5 p-3 border-b border-border">
              <div className="bg-card rounded p-2"><div className="font-mono text-sm font-bold text-cyan-400">{stats.esco_skill_nodes.toLocaleString()}</div><div className="text-[9px] text-gray-400">ESCO</div></div>
              <div className="bg-card rounded p-2"><div className="font-mono text-sm font-bold text-green-400">{stats.onet_nodes.toLocaleString()}</div><div className="text-[9px] text-gray-400">O*NET</div></div>
              <div className="bg-card rounded p-2"><div className="font-mono text-sm font-bold text-amber-400">{stats.skkni_nodes.toLocaleString()}</div><div className="text-[9px] text-gray-400">SKKNI</div></div>
              <div className="bg-card rounded p-2"><div className="font-mono text-sm font-bold text-purple-400">{stats.total_edges.toLocaleString()}</div><div className="text-[9px] text-gray-400">Edges</div></div>
            </div>
          )}

          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">View Mode</label>
              <div className="grid grid-cols-2 gap-1">
                {[["ego", "Ego"], ["story", "Story"], ["prodi", "Prodi"], ["delta", "Delta"]].map(([id, label]) => (
                  <button key={id} onClick={() => setViewMode(id)} className={`py-1.5 text-xs rounded ${viewMode === id ? "bg-usu2 text-white" : "bg-card text-gray-400"}`}>{label}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Config A</label>
              <select value={selectedConfig} onChange={e => setSelectedConfig(e.target.value)} className="w-full bg-card text-white text-xs rounded px-3 py-2 border border-border2">
                {["v0.9", "v1.1", "v1.2", "v1.3", "v1.4"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {viewMode === "delta" && (
              <div>
                <label className="block text-xs text-gray-400 mb-1">Config B</label>
                <select value={compareConfig} onChange={e => setCompareConfig(e.target.value)} className="w-full bg-card text-white text-xs rounded px-3 py-2 border border-border2">
                  {["v0.9", "v1.1", "v1.2", "v1.3", "v1.4"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}

            {viewMode === "ego" && (
              <>
                <div className="relative">
                  <label className="block text-xs text-gray-400 mb-1">Cari Node</label>
                  <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-card text-white text-xs rounded px-3 py-2 border border-border2" />
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 bg-card border border-border rounded-b shadow-xl max-h-48 overflow-y-auto">
                      {searchResults.map((n) => (
                        <button key={n.id} onClick={() => { loadEgoGraph(n.id); setEgoSource(n.id); setSearchQuery(n.label); setSearchResults([]); }} className="w-full text-left px-3 py-2 text-xs hover:bg-bg3 border-b border-border last:border-0">
                          <span className="font-medium text-white">{n.label}</span>
                          <span className="ml-2 font-mono text-[10px] text-gray-500">{formatNodeId(n.id)}</span>
                          <span className="ml-2 px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: `${NODE_COLORS[n.type]?.bg}40`, color: NODE_COLORS[n.type]?.bg }}>{n.type}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div><label className="block text-xs text-gray-400 mb-1">Source Node</label><input value={egoSource} onChange={e => setEgoSource(e.target.value)} className="w-full bg-card text-white text-xs rounded px-3 py-2 border border-border2" /></div>
                <div><label className="block text-xs text-gray-400 mb-1">Depth: {depth}</label><input type="range" min="1" max="2" value={depth} onChange={e => setDepth(Number(e.target.value))} className="w-full accent-usu2" /></div>
                <div>
                  <label className="block text-xs text-gray-400 mb-2">Edge Types</label>
                  {Object.entries(edgeFilters).map(([type, active]) => (
                    <label key={type} className="flex items-center gap-2 mb-1 cursor-pointer">
                      <input type="checkbox" checked={active} onChange={() => setEdgeFilters(p => ({ ...p, [type]: !p[type] }))} className="accent-usu2" />
                      <span className="text-xs text-gray-300">{type}</span>
                    </label>
                  ))}
                </div>
                <div><label className="block text-xs text-gray-400 mb-1">Min Edge Score: {minScore.toFixed(2)}</label><input type="range" min="0" max="0.8" step="0.05" value={minScore} onChange={e => setMinScore(Number(e.target.value))} className="w-full accent-amber-500" /></div>
                <button onClick={() => loadEgoGraph(egoSource)} className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm rounded">Load Ego Graph</button>
              </>
            )}

            {viewMode === "story" && (
              <>
                <div><label className="block text-xs text-gray-400 mb-1">Source CPL</label><input value={storySource} onChange={e => setStorySource(e.target.value)} className="w-full bg-card text-white text-xs rounded px-3 py-2 border border-border2" /></div>
                <button onClick={loadStoryMode} className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm rounded">Load Story Path</button>
                {storyNarratives.length > 0 && <div className="bg-bg3 rounded-lg p-3 text-xs text-gray-300 space-y-1">{storyNarratives.map((x, i) => <p key={i}>{x}</p>)}</div>}
              </>
            )}

            {viewMode === "prodi" && (
              <>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Prodi</label>
                  <div className="grid grid-cols-2 gap-1">{["SI", "TI", "IF", "TK"].map(p => <button key={p} onClick={() => setSelectedProdi(p)} className={`py-2 rounded text-sm ${selectedProdi === p ? "bg-usu2 text-white" : "bg-card text-gray-400"}`}>{p}</button>)}</div>
                </div>
                <button onClick={loadProdiSubgraph} className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm rounded">Load Prodi Graph</button>
              </>
            )}

            {viewMode === "delta" && (
              <>
                <div><label className="block text-xs text-gray-400 mb-1">Source CPL</label><input value={deltaSource} onChange={e => setDeltaSource(e.target.value)} className="w-full bg-card text-white text-xs rounded px-3 py-2 border border-border2" /></div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Prodi Summary</label>
                  <div className="grid grid-cols-2 gap-1">{["SI", "TI", "IF", "TK"].map(p => <button key={p} onClick={() => setSelectedProdi(p)} className={`py-2 rounded text-sm ${selectedProdi === p ? "bg-usu2 text-white" : "bg-card text-gray-400"}`}>{p}</button>)}</div>
                </div>
                <button onClick={loadDeltaMode} className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm rounded">Run Delta Compare</button>
                {deltaSummary && <div className="bg-bg3 rounded-lg p-3 text-xs"><div>Gain: <span className="text-green-400 font-mono">{deltaSummary.n_gain}</span></div><div>Drop: <span className="text-red-400 font-mono">{deltaSummary.n_drop}</span></div><div>Same: <span className="text-gray-300 font-mono">{deltaSummary.n_same}</span></div></div>}
                {deltaItems.length > 0 && (
                  <div className="bg-bg3 rounded-lg p-2 max-h-52 overflow-y-auto">
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 pb-1"><span className="w-24">target</span><span className="flex-1">label</span><span className="w-14 text-right">A</span><span className="w-14 text-right">B</span><span className="w-14 text-right">delta</span></div>
                    {deltaItems.slice(0, 25).map((d) => <DeltaRow key={d.target_id} item={d} />)}
                  </div>
                )}
              </>
            )}
          </div>
          {actionInfo && (
            <div className="mx-4 mb-4 bg-green-600/10 border border-green-500/30 text-green-300 text-xs rounded-lg px-3 py-2">
              {actionInfo}
            </div>
          )}
          {actionError && (
            <div className="mx-4 mb-4 bg-red-600/10 border border-red-500/30 text-red-300 text-xs rounded-lg px-3 py-2">
              {actionError}
            </div>
          )}
          {resolutionStatus && (
            <div className="mx-4 mb-4 rounded-lg border border-border2 bg-bg3 px-3 py-3 text-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="text-gray-300 font-semibold">Node Resolution</div>
                <div className={`font-mono ${resolutionStatus.unresolved_count === 0 ? "text-green-400" : "text-amber-300"}`}>
                  {(resolutionStatus.resolution_rate * 100).toFixed(1)}%
                </div>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span>Resolved</span>
                <span className="font-mono text-white">{resolutionStatus.resolved_count}/{resolutionStatus.total_mappings}</span>
              </div>
              <div className="flex items-center justify-between text-gray-400 mt-1">
                <span>Unresolved</span>
                <span className={`font-mono ${resolutionStatus.unresolved_count === 0 ? "text-green-400" : "text-amber-300"}`}>{resolutionStatus.unresolved_count}</span>
              </div>
              {resolutionStatus.samples?.length > 0 && (
                <div className="mt-3 border-t border-border pt-2">
                  <div className="text-gray-500 mb-1">Sample unresolved</div>
                  {resolutionStatus.samples.slice(0, 3).map((item) => (
                    <div key={`${item.source_id}-${item.target_id}`} className="mb-1 rounded bg-bg px-2 py-1">
                      <div className="font-mono text-[10px] text-gray-400">{item.source_id} {"->"} {formatNodeId(item.target_id)}</div>
                      <div className="truncate text-gray-300">{item.target_label || "-"}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 relative min-h-[50vh] md:min-h-0">
          {elements.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <p className="text-lg font-medium text-gray-400">Knowledge Graph Explorer</p>
                {autoLoadFailed ? (
                  <>
                    <p className="text-sm mt-2 text-amber-400">Data belum tersedia. Pastikan pipeline sudah selesai dijalankan.</p>
                    <button onClick={() => loadEgoGraph(egoSource)} className="mt-3 px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs rounded">
                      Coba Lagi
                    </button>
                  </>
                ) : (
                  <p className="text-sm mt-2">Pilih mode dan jalankan query.</p>
                )}
              </div>
            </div>
          ) : (
            <>
              <CytoscapeGraph elements={elements} onNodeClick={handleNodeClick} onEdgeClick={handleEdgeClick} />
              <div className="absolute left-4 top-4 bg-bg2/90 border border-border rounded px-3 py-2 text-[11px]">
                <div className="text-gray-400">Elements</div>
                <div className="font-mono text-white">Nodes {elements.filter((e) => e?.data?.source == null).length} / Edges {elements.filter((e) => e?.data?.source != null).length}</div>
              </div>
            </>
          )}

          {selectedNode && (
            <div className="absolute top-4 right-4 w-72 bg-bg2/95 backdrop-blur border border-border2 rounded-xl p-4 shadow-2xl">
              <div className="flex justify-between items-start mb-3"><div><span className="text-xs px-2 py-0.5 rounded text-white font-medium" style={{ backgroundColor: NODE_COLORS[selectedNode.type]?.bg || "#64748b" }}>{selectedNode.type || selectedNode.node_type}</span><h3 className="text-sm font-bold text-white mt-2 leading-tight">{selectedNode.full_label || selectedNode.label}</h3><div className="mt-1 font-mono text-[10px] text-gray-500">{selectedNode.short_id || formatNodeId(selectedNode.id)}</div></div><button onClick={() => setSelectedNode(null)} className="text-gray-500 hover:text-white">x</button></div>
              {selectedNode.description && <p className="text-xs text-gray-400 mb-3 leading-relaxed">{selectedNode.description}</p>}
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="bg-bg3 rounded p-2"><div className="text-gray-500">Node ID</div><div className="font-mono text-white break-all">{selectedNode.short_id || formatNodeId(selectedNode.id)}</div></div>
                <div className="bg-bg3 rounded p-2"><div className="text-gray-500">Resolved</div><div className={`font-mono ${(selectedNode.full_label || selectedNode.label) === (selectedNode.id || "") ? "text-amber-300" : "text-green-400"}`}>{(selectedNode.full_label || selectedNode.label) === (selectedNode.id || "") ? "needs review" : "ok"}</div></div>
              </div>
              {selectedNode.node_type === "ESCO_SKILL" && (
                <div className="bg-bg3 rounded p-2 text-xs mb-3">
                  <div className="text-gray-500 mb-1">Domain Status ({selectedProdi})</div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded font-semibold border ${
                      domainStatus?.status === "core"
                        ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
                        : domainStatus?.status === "adjacent"
                        ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                        : "bg-gray-500/15 text-gray-400 border-gray-500/30"
                    }`}>
                      {domainStatus?.status ?? "outside"}
                    </span>
                    <span className="font-mono text-gray-300">
                      S_con: {domainStatus?.s_con != null ? domainStatus.s_con.toFixed(1) : "0.0"}
                    </span>
                  </div>
                </div>
              )}
              {selectedNode.cri_score !== undefined && <div className="bg-usu/30 rounded p-2 mb-3"><div className="flex justify-between text-xs"><span className="text-gray-400">CRI</span><span className="font-bold">{(selectedNode.cri_score * 100).toFixed(1)}% - {selectedNode.cri_flag}</span></div></div>}
              <button onClick={() => loadEgoGraph(selectedNode.id)} className="w-full py-1.5 bg-usu hover:bg-usu2 text-white text-xs rounded">Expand Ego</button>
            </div>
          )}

          {selectedEdge && (
            <div className="absolute bottom-4 right-4 w-80 bg-bg2/95 backdrop-blur border border-border2 rounded-xl p-4 shadow-2xl">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-xs px-2 py-0.5 rounded text-white font-medium bg-amber-700">Edge Explainability</span>
                  <h3 className="text-sm font-bold text-white mt-2 leading-tight">{formatNodeId(selectedEdge.source)} {"->"} {formatNodeId(selectedEdge.target)}</h3>
                </div>
                <button onClick={() => setSelectedEdge(null)} className="text-gray-500 hover:text-white">x</button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="bg-bg3 rounded p-2"><div className="text-gray-500">Type</div><div className="font-mono text-white">{selectedEdge.edge_type || selectedEdge.type || "-"}</div></div>
                <div className="bg-bg3 rounded p-2"><div className="text-gray-500">Weight</div><div className="font-mono text-gold">{(selectedEdge.weight ?? 0).toFixed(4)}</div></div>
                <div className="bg-bg3 rounded p-2"><div className="text-gray-500">S_sem</div><div className="font-mono text-cyan-300">{selectedEdge.s_sem != null ? Number(selectedEdge.s_sem).toFixed(4) : "n/a"}</div></div>
                <div className="bg-bg3 rounded p-2"><div className="text-gray-500">S_gr</div><div className="font-mono text-purple-300">{selectedEdge.s_gr != null ? Number(selectedEdge.s_gr).toFixed(4) : "n/a"}</div></div>
                <div className="bg-bg3 rounded p-2 col-span-2"><div className="text-gray-500">S_con</div><div className="font-mono text-amber-300">{selectedEdge.s_con != null ? Number(selectedEdge.s_con).toFixed(4) : "n/a"}</div></div>
              </div>
              <p className="text-[11px] text-gray-400">Interpretasi: edge dengan bobot tinggi menunjukkan keterkaitan lebih kuat pada konfigurasi yang dipilih.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


