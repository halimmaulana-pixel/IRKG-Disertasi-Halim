import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useLocation } from 'react-router-dom';
import { API_BASE } from "../config/api";

const NAV_ITEMS = [
  { path: '/', label: 'Beranda' },
  { path: '/domain-map', label: 'Domain Map' },
  { path: '/prodi-mapping', label: 'CPL Mapping' },
  { path: '/infografis', label: 'Infografis' },
  { path: '/kg', label: 'KG Explorer' },
  { path: '/cri', label: 'CRI Dashboard' },
  { path: '/ablation', label: 'Ablation' },
  { path: '/compare', label: 'Compare' },
  { path: '/pipeline', label: 'Pipeline' },
  { path: '/quality', label: 'Data Quality' },
  { path: '/upload', label: 'Upload CPL' },
];

export default function Navbar() {
  const loc = useLocation();
  const [modeInfo, setModeInfo] = useState({ readonly: true });
  const [modeErr, setModeErr] = useState(false);

  useEffect(() => {
    let active = true;

    const loadMode = async () => {
      try {
        const res = await axios.get(`${API_BASE}/pipeline/mode`);
        if (!active) return;
        setModeInfo(res.data || { readonly: true });
        setModeErr(false);
      } catch {
        if (!active) return;
        setModeErr(true);
      }
    };

    loadMode();
    const timer = window.setInterval(loadMode, 15000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const modeLabel = modeErr ? 'Mode: N/A' : modeInfo.readonly ? 'Research Locked' : 'Experimental';
  const modeClasses = modeErr
    ? 'border border-border2 bg-bg3 text-gray-300'
    : modeInfo.readonly
      ? 'border border-amber-500/40 bg-amber-500/15 text-amber-200'
      : 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-200';

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-[52px] flex items-center px-5 gap-2"
      style={{
        background: 'rgba(5,9,18,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="font-display font-extrabold text-[15px] text-gold mr-4 whitespace-nowrap">
        IR<span className="text-white">-</span>KG <span className="text-gold">v3.0</span>
      </div>

      {NAV_ITEMS.map((item) => {
        const active = loc.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all no-underline ${
              active
                ? 'bg-usu text-white border border-usu2'
                : 'bg-transparent text-gray-300 border border-transparent hover:border-border2 hover:bg-bg3'
            }`}
          >
            {item.label}
          </Link>
        );
      })}

      <div className="ml-auto flex items-center gap-3">
        <span className={`px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap ${modeClasses}`}>
          {modeLabel}
        </span>
        <span className="font-mono text-[10px] text-gray-500 whitespace-nowrap">USU � Doktor Ilmu Komputer � 2026</span>
      </div>
    </nav>
  );
}
