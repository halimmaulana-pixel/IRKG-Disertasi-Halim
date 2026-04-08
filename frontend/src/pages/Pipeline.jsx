import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_BASE } from "../config/api";
import StageDataPanel from "../components/StageDataPanel";

function StageBadge({ status }) {
  const styles = {
    pending: "bg-gray-600/20 text-gray-300",
    running: "bg-blue-600/20 text-blue-300",
    completed: "bg-green-600/20 text-green-300",
    failed: "bg-red-600/20 text-red-300",
  };
  return <span className={`px-2 py-1 rounded text-[11px] font-mono ${styles[status] || styles.pending}`}>{status}</span>;
}

export default function Pipeline() {
  const [sourceId, setSourceId] = useState("SI_PLO-4");
  const [task, setTask] = useState("T1a");
  const [config, setConfig] = useState("v1.2");
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState(null);
  const [stages, setStages] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedStage, setSelectedStage] = useState(null);
  const [stageOutput, setStageOutput] = useState(null);
  const [stageData, setStageData] = useState(null);
  const [loadingStageData, setLoadingStageData] = useState(false);
  const [running, setRunning] = useState(false);
  const [metrics, setMetrics] = useState({});
  const [runMessage, setRunMessage] = useState("");
  const [runError, setRunError] = useState("");
  const [modeInfo, setModeInfo] = useState(null);
  const [switchingMode, setSwitchingMode] = useState(false);

  const { data: trace } = useQuery({
    queryKey: ["pipeline-trace", sourceId, task, config],
    queryFn: () => axios.get(`${API_BASE}/pipeline/trace/${sourceId}?task=${task}&config=${config}`).then((r) => r.data),
    enabled: !!sourceId,
  });

  const { data: criSI } = useQuery({
    queryKey: ["cri-si-ids"],
    queryFn: () => axios.get(`${API_BASE}/cri/SI`).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const { data: criTI } = useQuery({
    queryKey: ["cri-ti-ids"],
    queryFn: () => axios.get(`${API_BASE}/cri/TI`).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  // Restore last job on mount
  useEffect(() => {
    axios.get(`${API_BASE}/pipeline/mode`).then((r) => setModeInfo(r.data)).catch(() => {});

    axios.get(`${API_BASE}/pipeline/latest`).then((r) => {
      if (r.data.job_id) {
        setJobId(r.data.job_id);
        if (r.data.status) setStatus(r.data.status);
        if (r.data.stages?.length) setStages(r.data.stages);
      }
    }).catch(() => {
      // fallback: localStorage
      const saved = localStorage.getItem("pipelineJobId");
      if (saved) setJobId(saved);
    });
  }, []);

  useEffect(() => {
    if (!jobId) return;
    const timer = setInterval(async () => {
      try {
        const [s, g] = await Promise.all([
          axios.get(`${API_BASE}/pipeline/status/${jobId}`).then((r) => r.data),
          axios.get(`${API_BASE}/pipeline/stages/${jobId}`).then((r) => r.data),
        ]);
        setStatus(s);
        setStages(g.stages || []);
        if (s.status === "failed" && s.last_error) {
          setRunError(s.last_error);
        }
        if (s.status !== "running" && s.status !== "queued") {
          setRunning(false);
          clearInterval(timer);
        }
      } catch {
        clearInterval(timer);
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [jobId]);

  useEffect(() => {
    if (!jobId) return;
    const es = new EventSource(`${API_BASE}/pipeline/stream/${jobId}`);
    es.addEventListener("log", (e) => {
      const payload = JSON.parse(e.data);
      setLogs((prev) => [...prev.slice(-400), payload.message]);
    });
    es.addEventListener("snapshot", (e) => {
      const payload = JSON.parse(e.data);
      setStatus(payload);
    });
    es.addEventListener("metric", (e) => {
      const payload = JSON.parse(e.data);
      setMetrics(payload);
    });
    es.addEventListener("done", () => es.close());
    es.onerror = () => {
      setRunError("Stream event terputus. Cek backend tetap berjalan.");
      es.close();
    };
    return () => es.close();
  }, [jobId]);

  const handleToggleMode = async () => {
    if (!modeInfo) return;
    setSwitchingMode(true);
    setRunError("");
    try {
      const res = await axios.post(`${API_BASE}/pipeline/mode`, { readonly: !modeInfo.readonly });
      setModeInfo(res.data);
      setRunMessage(res.data.readonly ? "Mode switched: Research Locked." : "Mode switched: Experimental.");
    } catch (err) {
      setRunError(err?.response?.data?.detail || err?.message || "Gagal mengubah mode.");
    } finally {
      setSwitchingMode(false);
    }
  };

  const handleRun = async () => {
    setRunning(true);
    setRunError("");
    setRunMessage("");
    setLogs([]);
    setSelectedStage(null);
    setStageOutput(null);
    try {
      const runMode = modeInfo?.readonly ? "refresh_db" : "all";
      const res = await axios.post(`${API_BASE}/pipeline/run`, { mode: runMode });
      setJobId(res.data.job_id);
      setRunMessage(`Pipeline job dimulai: ${res.data.job_id} (${runMode})`);
      const [s, g] = await Promise.all([
        axios.get(`${API_BASE}/pipeline/status/${res.data.job_id}`).then((r) => r.data),
        axios.get(`${API_BASE}/pipeline/stages/${res.data.job_id}`).then((r) => r.data),
      ]);
      setStatus(s);
      setStages(g.stages || []);
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || "Gagal menjalankan pipeline.";
      setRunError(msg);
      setRunning(false);
    }
  };

  const loadStageOutput = async (stageId) => {
    if (!jobId) return;
    setSelectedStage(stageId);
    const out = await axios.get(`${API_BASE}/pipeline/stage-output/${jobId}/${stageId}`).then((r) => r.data);
    setStageOutput(out);
  };

  const loadStageData = async (stageId) => {
    if (selectedStage === stageId && stageData) {
      // toggle off
      setSelectedStage(null);
      setStageData(null);
      return;
    }
    setSelectedStage(stageId);
    setStageData(null);
    setLoadingStageData(true);
    try {
      const res = await axios.get(`${API_BASE}/pipeline/stage-data/${stageId}`);
      setStageData(res.data);
    } catch (err) {
      setStageData({ type: "error", stage_id: stageId, title: stageId, message: err?.response?.data?.detail || err?.message });
    } finally {
      setLoadingStageData(false);
    }
  };

  const currentStage = useMemo(() => stages.find((s) => s.status === "running")?.name || "-", [stages]);

  return (
    <div className="page pt-[52px] min-h-screen px-10 py-7">
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold mb-1">Pipeline Observatory</h1>
          <p className="text-sm text-gray-400">Visualisasi komputasi pipeline per stage, log real-time, dan output preview.</p>
        </div>
        <button onClick={handleRun} disabled={running} className="px-5 py-2.5 bg-usu hover:bg-usu2 disabled:opacity-50 text-white rounded-lg text-sm font-semibold">
          {running ? "Pipeline Running..." : "Run Pipeline"}
        </button>
      </div>

      <div className="mb-4 bg-card border border-border rounded-xl p-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs text-gray-400">Execution Mode</div>
          <div className={`text-sm font-semibold ${modeInfo?.readonly ? "text-amber-300" : "text-green-300"}`}>
            {modeInfo?.readonly ? "Research Locked" : "Experimental"}
          </div>
        </div>
        <button onClick={handleToggleMode} disabled={switchingMode} className="px-3 py-2 bg-bg2 hover:bg-bg3 disabled:opacity-50 text-white rounded text-xs">
          {switchingMode ? "Switching..." : (modeInfo?.readonly ? "Switch to Experimental" : "Switch to Locked")}
        </button>
      </div>

      {runMessage && <div className="mb-4 bg-green-600/10 border border-green-500/30 text-green-300 text-xs rounded-lg px-3 py-2">{runMessage}</div>}
      {runError && <div className="mb-4 bg-red-600/10 border border-red-500/30 text-red-300 text-xs rounded-lg px-3 py-2">{runError}</div>}

      <div className="grid grid-cols-4 gap-4 mb-5">
        <div className="bg-card border border-border rounded-xl p-4"><div className="text-xs text-gray-400">Job ID</div><div className="font-mono text-xs text-white mt-1 break-all">{jobId || "-"}</div></div>
        <div className="bg-card border border-border rounded-xl p-4"><div className="text-xs text-gray-400">Status / Progress</div><div className="mt-1 text-white font-semibold">{status?.status || "idle"} / {status?.progress ?? 0}%</div></div>
        <div className="bg-card border border-border rounded-xl p-4"><div className="text-xs text-gray-400">Current Stage</div><div className="mt-1 text-white font-semibold">{currentStage}</div></div>
        <div className="bg-card border border-border rounded-xl p-4"><div className="text-xs text-gray-400">Runtime Metrics</div><div className="mt-1 text-xs text-gray-300"><div>CPU: {metrics.cpu_percent ?? "-"}%</div><div>RAM: {metrics.memory_percent ?? "-"}%</div><div>Throughput: {metrics.throughput_logs_per_sec ?? "-"} logs/s</div></div></div>
      </div>

      <div className="mb-7">
        <div className="bg-card border border-border rounded-xl p-4 mb-4">
          <h2 className="font-display text-sm font-bold mb-3">Stage Timeline</h2>
          <div className="space-y-1.5">
            {stages.map((s, i) => {
              const isActive = selectedStage === s.id;
              return (
                <div key={s.id}>
                  <button
                    onClick={() => loadStageData(s.id)}
                    className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 transition-all text-left
                      ${isActive ? "bg-usu/20 ring-1 ring-usu/50" : "bg-bg3 hover:bg-bg2"}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-bg2 text-xs flex items-center justify-center font-mono shrink-0">{i + 1}</span>
                      <div>
                        <div className="text-sm text-white">{s.name}</div>
                        <div className="text-[11px] text-gray-500 font-mono">{s.id}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StageBadge status={s.status} />
                      {loadingStageData && isActive
                        ? <span className="text-[11px] text-gray-400 animate-pulse px-2">loading...</span>
                        : <span className="text-[11px] px-2 py-1 rounded bg-bg2 text-gray-400">{isActive ? "▲ tutup" : "▼ lihat data"}</span>
                      }
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {stageData && (
          <StageDataPanel data={stageData} onClose={() => { setStageData(null); setSelectedStage(null); }} />
        )}
      </div>

      <div className="bg-card border border-border rounded-xl p-4 mb-8">
        <h2 className="font-display text-sm font-bold mb-3">Live Computation Log</h2>
        <div className="bg-bg3 rounded-lg p-3 h-52 overflow-y-auto font-mono text-xs text-gray-300">
          {logs.length === 0 ? <div className="text-gray-500">Belum ada log. Jalankan pipeline untuk melihat komputasi real-time.</div> : logs.slice(-180).map((line, idx) => <div key={`${idx}-${line.slice(0, 12)}`}>{line}</div>)}
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h2 className="font-display text-lg font-bold mb-1">Trace Explorer</h2>
        <p className="text-sm text-gray-400 mb-4">Analisis kandidat dan skor untuk CPL tertentu.</p>
        <div className="flex gap-3 flex-wrap mb-4">
          <select value={sourceId} onChange={(e) => setSourceId(e.target.value)} className="bg-card border border-border2 text-white text-xs rounded px-3 py-2">
            {criSI?.length ? (
              <optgroup label="── SI ──">
                {criSI.map((item) => (
                  <option key={item.source_id} value={item.source_id}>{item.source_id}</option>
                ))}
              </optgroup>
            ) : (
              <optgroup label="── SI ──">
                <option value="SI_PLO-4">SI_PLO-4</option>
                <option value="SI_PLO-11">SI_PLO-11</option>
              </optgroup>
            )}
            {criTI?.length ? (
              <optgroup label="── TI ──">
                {criTI.map((item) => (
                  <option key={item.source_id} value={item.source_id}>{item.source_id}</option>
                ))}
              </optgroup>
            ) : (
              <optgroup label="── TI ──">
                <option value="TI_PLO-8">TI_PLO-8</option>
              </optgroup>
            )}
          </select>
          <select value={task} onChange={(e) => setTask(e.target.value)} className="bg-card border border-border2 text-white text-xs rounded px-3 py-2"><option value="T1a">T1a - CPL-SI to ESCO</option><option value="T2a">T2a - CPL-SI to O*NET</option><option value="T3a">T3a - CPL-SI to SKKNI</option></select>
          <select value={config} onChange={(e) => setConfig(e.target.value)} className="bg-card border border-border2 text-white text-xs rounded px-3 py-2"><option value="v1.2">v1.2 Balanced</option><option value="v0.9">v0.9 Pure Semantic</option><option value="v1.3">v1.3 Precision</option></select>
        </div>
        {trace?.weights && (
          <div className="bg-bg3 border border-border rounded-lg px-3 py-2 mb-3 flex gap-4 text-xs text-gray-400">
            <span className="font-semibold text-gray-300">Weights ({config}):</span>
            <span>α <span className="font-mono text-cyan-300">{trace.weights.alpha?.toFixed(2) ?? "-"}</span></span>
            <span>β <span className="font-mono text-purple-300">{trace.weights.beta?.toFixed(2) ?? "-"}</span></span>
            <span>γ <span className="font-mono text-amber-300">{trace.weights.gamma?.toFixed(2) ?? "-"}</span></span>
          </div>
        )}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {(trace?.candidates || []).slice(0, 8).map((c, i) => (
            <div key={`${c.target_id}-${i}`} className="flex items-center gap-3 px-3 py-2 border-b border-border last:border-0">
              <span className="w-6 h-6 rounded-full bg-usu flex items-center justify-center text-xs font-bold">{c.rank}</span>
              <span className="text-xs font-mono text-gray-400">{c.target_id}</span>
              <span className="text-sm text-white flex-1 truncate">{c.target_label}</span>
              <span className="text-xs text-cyan-300">S_sem {c.s_sem.toFixed(3)}</span>
              <span className="text-xs text-purple-300">S_gr {c.s_gr.toFixed(3)}</span>
              <span className="text-xs text-amber-300">S_con {c.s_con.toFixed(3)}</span>
              <span className="font-mono text-xs font-bold text-gold">S_final {c.s_final.toFixed(3)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
