import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { API_BASE } from "../config/api";

export default function UploadCPL() {
  const [prodiName, setProdiName] = useState("");
  const [prodiCode, setProdiCode] = useState("");
  const [items, setItems] = useState([{ ranah: "Keterampilan Khusus", deskripsi: "" }]);
  const [loading, setLoading] = useState(false);
  const [jobInfo, setJobInfo] = useState(null);
  const [submitInfo, setSubmitInfo] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [storedInfo, setStoredInfo] = useState(null);
  const [runStatus, setRunStatus] = useState(null);
  const navigate = useNavigate();

  const { data: modeInfo } = useQuery({
    queryKey: ["upload-pipeline-mode"],
    queryFn: () => axios.get(`${API_BASE}/pipeline/mode`).then((r) => r.data),
    refetchInterval: 15000,
  });

  const statusCode = prodiCode || "SI";
  const { data: uploadStatus } = useQuery({
    queryKey: ["upload-status", statusCode],
    queryFn: () => axios.get(`${API_BASE}/upload/status/${statusCode}`).then((r) => r.data),
    enabled: statusCode.length === 2,
    refetchInterval: jobInfo ? 4000 : 15000,
  });

  useEffect(() => {
    setRunStatus(uploadStatus || null);
  }, [uploadStatus]);

  useEffect(() => {
    if (!jobInfo?.job_id) return;
    const timer = window.setInterval(async () => {
      try {
        const data = await axios.get(`${API_BASE}/pipeline/status/${jobInfo.job_id}`).then((r) => r.data);
        setRunStatus(data);
        if (data.status && data.status !== "queued" && data.status !== "running") {
          window.clearInterval(timer);
        }
      } catch {
        window.clearInterval(timer);
      }
    }, 3000);
    return () => window.clearInterval(timer);
  }, [jobInfo]);

  const addItem = () => {
    setItems([...items, { ranah: "Keterampilan Khusus", deskripsi: "" }]);
  };

  const updateItem = (i, field, val) => {
    const newItems = [...items];
    newItems[i][field] = val;
    setItems(newItems);
  };

  const handleSubmit = async () => {
    if (!prodiName || !prodiCode || items.some(i => !i.deskripsi)) {
      setSubmitError("Lengkapi semua field sebelum menyimpan.");
      return;
    }

    setLoading(true);
    setSubmitError("");
    setSubmitInfo("");
    setJobInfo(null);
    try {
      const stored = await axios.post(`${API_BASE}/upload/cpl`, {
        items,
        prodi_name: prodiName,
        prodi_code: prodiCode,
      }).then((r) => r.data);
      setStoredInfo(stored);

      if (modeInfo?.readonly) {
        setSubmitInfo(
          `CPL tersimpan untuk ${prodiCode}, tetapi pipeline tidak dijalankan karena mode saat ini Research Locked.`
        );
        return;
      }

      const run = await axios.post(`${API_BASE}/upload/run`, {
        prodi_code: prodiCode,
        config: "v1.2",
      }).then(r => r.data);
      setJobInfo(run);
      setSubmitInfo(`CPL tersimpan dan pipeline berjalan dengan job_id ${run.job_id}.`);
    } catch (e) {
      const detail = e?.response?.data?.detail || e?.message || "Terjadi kesalahan saat upload.";
      setSubmitError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page pt-[52px] min-h-screen px-10 py-7 max-w-3xl">
      <h1 className="font-display text-2xl font-extrabold mb-1">Upload CPL Baru</h1>
      <p className="text-sm text-gray-400 mb-6">Input CPL dari prodi lain dan jalankan pipeline IR-KG untuk menghasilkan CRI.</p>

      <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${modeInfo?.readonly ? "border-amber-500/30 bg-amber-600/10 text-amber-200" : "border-green-500/30 bg-green-600/10 text-green-200"}`}>
        Mode saat ini: <span className="font-semibold">{modeInfo?.readonly ? "Research Locked" : "Experimental"}</span>.
        {modeInfo?.readonly
          ? " Upload tetap bisa menyimpan CPL, tetapi run pipeline akan ditahan."
          : " Upload akan menyimpan CPL dan langsung memicu pipeline baru."}
      </div>

      {submitInfo && <div className="mb-4 rounded-xl border border-green-500/30 bg-green-600/10 px-4 py-3 text-sm text-green-200">{submitInfo}</div>}
      {submitError && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-600/10 px-4 py-3 text-sm text-red-200">{submitError}</div>}

      <div className="bg-card border border-border rounded-xl p-6 mb-4">
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-2">Nama Program Studi</label>
          <input type="text" value={prodiName} onChange={e => setProdiName(e.target.value)}
            placeholder="contoh: Sistem Komputer"
            className="w-full bg-bg3 border border-border2 text-white text-sm rounded-lg px-4 py-2.5 outline-none focus:border-usu2" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-2">Kode Prodi (2 huruf)</label>
          <input type="text" value={prodiCode} onChange={e => setProdiCode(e.target.value.toUpperCase())}
            placeholder="contoh: SK" maxLength={2}
            className="w-32 bg-bg3 border border-border2 text-white text-sm rounded-lg px-4 py-2.5 outline-none focus:border-usu2" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 mb-4">
        <div className="font-display text-sm font-bold mb-4">Butir CPL</div>

        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex gap-3 bg-bg3 border border-border rounded-lg p-3">
              <span className="font-mono text-xs text-gold pt-2 w-12">PLO-{i + 1}</span>
              <div className="flex-1 space-y-2">
                <select value={item.ranah} onChange={e => updateItem(i, "ranah", e.target.value)}
                  className="w-full bg-card border border-border2 text-white text-xs rounded px-3 py-2">
                  <option>Sikap</option>
                  <option>Pengetahuan</option>
                  <option>Keterampilan Khusus</option>
                  <option>Keterampilan Umum</option>
                </select>
                <textarea value={item.deskripsi} onChange={e => updateItem(i, "deskripsi", e.target.value)}
                  placeholder="Deskripsi CPL..."
                  className="w-full bg-card border border-border2 text-white text-xs rounded px-3 py-2 min-h-[60px] resize-y outline-none focus:border-usu2" />
              </div>
            </div>
          ))}
        </div>

        <button onClick={addItem}
          className="w-full mt-3 py-2 border border-dashed border-border2 text-gray-400 hover:text-gold hover:border-gold rounded-lg text-xs transition-colors">
          + Tambah Butir CPL
        </button>
      </div>

      <button onClick={handleSubmit} disabled={loading}
        className="w-full py-3 bg-usu hover:bg-usu2 text-white text-sm font-bold font-display rounded-xl transition-colors disabled:opacity-50">
        {loading ? "Menyimpan..." : (modeInfo?.readonly ? "Simpan CPL" : "Simpan dan Jalankan Pipeline IR-KG")}
      </button>

      {storedInfo && (
        <div className="mt-4 bg-bg3 border border-border rounded-xl p-4 text-xs">
          <div className="text-gray-300 mb-1">CPL tersimpan:</div>
          <div className="font-mono text-gold">{storedInfo.prodi_code} · {storedInfo.n_items} item</div>
          <div className="mt-2 text-gray-400 break-all">{(storedInfo.item_ids || []).join(", ")}</div>
        </div>
      )}

      {jobInfo && (
        <div className="mt-4 bg-bg3 border border-border rounded-xl p-4 text-xs">
          <div className="text-gray-300 mb-1">Pipeline job dibuat:</div>
          <div className="font-mono text-gold break-all">{jobInfo.job_id}</div>
          {runStatus && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded bg-bg2 px-3 py-2">
                <div className="text-gray-500">Status</div>
                <div className="font-semibold text-white">{runStatus.status || "queued"}</div>
              </div>
              <div className="rounded bg-bg2 px-3 py-2">
                <div className="text-gray-500">Progress</div>
                <div className="font-semibold text-white">{runStatus.progress ?? 0}%</div>
              </div>
            </div>
          )}
          <div className="mt-3 flex gap-2">
            <button onClick={() => navigate("/pipeline")} className="px-3 py-2 bg-usu text-white rounded text-xs">
              Buka Pipeline Observatory
            </button>
            <button onClick={() => navigate("/cri")} className="px-3 py-2 bg-bg2 text-gray-200 rounded text-xs">
              Buka CRI Dashboard
            </button>
          </div>
        </div>
      )}

      {!jobInfo && runStatus && (
        <div className="mt-4 bg-bg3 border border-border rounded-xl p-4 text-xs">
          <div className="text-gray-300 mb-1">Status prodi saat ini:</div>
          <div className="font-mono text-white">{runStatus.status || "pending"}</div>
          {runStatus.n_results !== undefined && (
            <div className="mt-1 text-gray-500">Hasil CRI tersedia: {runStatus.n_results}</div>
          )}
        </div>
      )}
    </div>
  );
}
