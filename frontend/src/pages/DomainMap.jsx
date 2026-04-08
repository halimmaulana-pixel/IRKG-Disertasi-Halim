import { useState } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import axios from "axios";
import { API_BASE } from "../config/api";

// ─── Konstanta ────────────────────────────────────────────────────────────────

const PRODI_LIST = ["SI", "TI", "CS", "SE", "CE", "DS"];

const PRODI_META = {
  SI: {
    full_name: "Sistem Informasi",
    isced_codes: [
      { code: "0613", label: "Software and applications development and analysis", source: "UNESCO ISCED-F 2013" },
      { code: "0612", label: "Database and network design and administration", source: "UNESCO ISCED-F 2013" },
    ],
    core_keywords: ["information system", "business process", "database", "enterprise resource planning",
      "management information system", "business intelligence", "information management"],
    adjacent_keywords: ["project management", "system analysis", "requirements engineering",
      "IT governance", "digital transformation", "ERP", "process modeling"],
    references: [
      {
        label: "IS2020 (ACM/AIS)",
        detail: "Information Systems 2020 — joint ACM/AIS curriculum guidelines. Mendefinisikan 10 Knowledge Area: Data & Information Management, Enterprise Architecture, IT Infrastructure, Systems Analysis & Design, Application Development, Security & Risk Management, Project Management, IS Strategy & Governance, IS & Society, Professional Practice.",
      },
      {
        label: "APTIKOM 2019",
        detail: "Kurikulum Inti Prodi Sistem Informasi S1. Kompetensi utama: rekayasa sistem informasi bisnis, manajemen proses bisnis, pemodelan data & arsitektur enterprise, tata kelola TI, dan analisis sistem. Tiga jalur konsentrasi: Sistem Informasi Bisnis, Rekayasa Sistem Informasi, Sistem Informasi Geografis.",
      },
    ],
  },
  TI: {
    full_name: "Teknologi Informasi",
    isced_codes: [
      { code: "0613", label: "Software and applications development and analysis", source: "UNESCO ISCED-F 2013" },
      { code: "0612", label: "Database and network design and administration", source: "UNESCO ISCED-F 2013" },
    ],
    core_keywords: ["information technology", "IT infrastructure", "network administration",
      "system integration", "IT service management", "cloud computing", "cybersecurity"],
    adjacent_keywords: ["software development", "database administration", "ITIL",
      "virtualization", "DevOps", "IT audit", "network security"],
    references: [
      {
        label: "IT2017 (ACM)",
        detail: "Information Technology 2017 — ACM curriculum guidelines. Mendefinisikan 12 area: IT Fundamentals, Human Factors, Systems Administration, IT Infrastructure, Application Development, Data Management, Networking, Cybersecurity, Cloud & Virtualization, IoT, Systems Integration, Social & Professional Issues.",
      },
      {
        label: "APTIKOM 2019",
        detail: "Kurikulum Inti Prodi Teknologi Informasi S1. Kompetensi utama: administrasi infrastruktur TI, keamanan siber, manajemen jaringan, layanan cloud, dan integrasi sistem. Tiga jalur konsentrasi: Infrastruktur & Jaringan, Keamanan Sistem Informasi, Komputasi Berbasis Layanan.",
      },
    ],
  },
  CS: {
    full_name: "Ilmu Komputer",
    isced_codes: [
      { code: "0613", label: "Software and applications development and analysis", source: "UNESCO ISCED-F 2013" },
      { code: "0612", label: "Database and network design and administration", source: "UNESCO ISCED-F 2013" },
    ],
    core_keywords: ["algorithm", "data structure", "programming", "computational theory",
      "operating system", "compiler", "artificial intelligence", "machine learning"],
    adjacent_keywords: ["software engineering", "computer architecture", "parallel computing",
      "computer graphics", "formal methods", "robotics", "distributed systems"],
    references: [
      {
        label: "CS2023 (ACM/IEEE)",
        detail: "Computer Science 2023 — joint ACM/IEEE-CS curriculum guidelines. Mendefinisikan 18 Knowledge Area: Algorithms & Complexity, Architecture, AI, Graphics, HCI, Information Management, Networking, Operating Systems, PL, Parallel Computing, Security, Software Engineering, Systems, dan lainnya.",
      },
      {
        label: "APTIKOM 2019",
        detail: "Kurikulum Inti Prodi Ilmu Komputer S1. Kompetensi utama: pemrograman lanjut, algoritma & struktur data, kecerdasan buatan, sistem operasi, dan komputasi teoritis. Tiga jalur konsentrasi: Kecerdasan Buatan & Komputasi, Rekayasa Komputasi, Komputasi Paralel & Terdistribusi.",
      },
    ],
  },
  SE: {
    full_name: "Rekayasa Perangkat Lunak",
    isced_codes: [
      { code: "0613", label: "Software and applications development and analysis", source: "UNESCO ISCED-F 2013" },
    ],
    core_keywords: ["software engineering", "software development", "agile", "software testing",
      "software architecture", "DevOps", "continuous integration", "software quality"],
    adjacent_keywords: ["requirements engineering", "software maintenance", "design patterns",
      "project management", "code review", "refactoring", "version control"],
    references: [
      {
        label: "SE2014 + SWEBOK v4 (ACM/IEEE)",
        detail: "Software Engineering 2014 (ACM/IEEE) + SWEBOK Guide v4 (2024). Mencakup 15 KA: Requirements, Design, Construction, Testing, Maintenance, Configuration Management, Engineering Management, Process, Models & Methods, Quality, Professional Practice, Economics, Computing Foundations, Mathematical Foundations, Engineering Foundations.",
      },
      {
        label: "APTIKOM 2019",
        detail: "Kurikulum Inti Prodi Rekayasa Perangkat Lunak S1. Kompetensi utama: rekayasa kebutuhan, desain & arsitektur perangkat lunak, pengujian & jaminan kualitas, DevOps & CI/CD, dan manajemen proyek perangkat lunak. Dua jalur konsentrasi: Software Quality & Testing, Software Architecture & DevOps.",
      },
    ],
  },
  CE: {
    full_name: "Teknik Komputer",
    isced_codes: [
      { code: "0714", label: "Electronics and automation", source: "UNESCO ISCED-F 2013" },
      { code: "0613", label: "Software and applications development and analysis", source: "UNESCO ISCED-F 2013" },
    ],
    core_keywords: ["computer architecture", "embedded system", "digital logic", "FPGA",
      "microprocessor", "hardware design", "VLSI", "real-time system"],
    adjacent_keywords: ["IoT", "robotics", "signal processing", "firmware development",
      "circuit design", "hardware-software co-design", "computer organization"],
    references: [
      {
        label: "CE2016 (ACM/IEEE)",
        detail: "Computer Engineering 2016 — joint ACM/IEEE curriculum guidelines. Mendefinisikan 14 KA: Circuits & Electronics, Digital Logic, Computer Organization & Architecture, Embedded Systems, VLSI, Signal Processing, Communication, Operating Systems, Systems Programming, Computer Networks, Security, IoT, Robotics, dan lainnya.",
      },
      {
        label: "APTIKOM 2019",
        detail: "Kurikulum Inti Prodi Teknik Komputer S1. Kompetensi utama: desain sistem digital, sistem tertanam (embedded), antarmuka hardware-software, protokol komunikasi (UART/SPI/I2C), dan pemrograman mikrokontroler. Dua jalur konsentrasi: Sistem Tertanam & IoT, Desain Hardware & VLSI.",
      },
    ],
  },
  DS: {
    full_name: "Sains Data",
    isced_codes: [
      { code: "0613", label: "Software and applications development and analysis", source: "UNESCO ISCED-F 2013" },
      { code: "0461", label: "Mathematics", source: "UNESCO ISCED-F 2013" },
    ],
    core_keywords: ["data science", "machine learning", "data mining", "statistical analysis",
      "data visualization", "big data", "deep learning", "data engineering"],
    adjacent_keywords: ["Python", "R programming", "SQL", "data pipeline", "feature engineering",
      "model deployment", "business analytics", "natural language processing"],
    references: [
      {
        label: "DS2021 (ACM)",
        detail: "Data Science 2021 — ACM curriculum guidelines. Mendefinisikan 8 KA: Data Management, Computing & Algorithms, Statistical Methods, Machine Learning, Analytics & Visualization, Domain Knowledge, Professional Practice, dan Data Privacy & Ethics.",
      },
      {
        label: "APTIKOM 2019",
        detail: "Kurikulum Inti Prodi Sains Data S1. Kompetensi utama: analisis data statistik, pembelajaran mesin & deep learning, rekayasa data (ETL, pipeline), visualisasi data, dan komputasi ilmiah (Python/R). Tiga jalur konsentrasi: Analitik Bisnis, Kecerdasan Data, Rekayasa Data & MLOps.",
      },
    ],
  },
};

const DOMAIN_STATUS_STYLE = {
  core:     { bg: "bg-cyan-500/15",  text: "text-cyan-400",  border: "border-cyan-500/30"  },
  adjacent: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30" },
  outside:  { bg: "bg-gray-500/15",  text: "text-gray-400",  border: "border-gray-500/30"  },
};

// ─── Helper: warna heatmap overlap ────────────────────────────────────────────

function overlapBg(pct) {
  if (pct >= 0.9) return "#0284c7";
  if (pct >= 0.7) return "#0369a1";
  if (pct >= 0.5) return "#075985";
  if (pct >= 0.3) return "#0c4a6e";
  if (pct >= 0.1) return "#082f49";
  if (pct > 0)    return "#0d1f35";
  return "#0a1120";
}

function overlapText(pct) {
  return pct >= 0.5 ? "#e0f2fe" : "#7dd3fc";
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({ title, value, sub, color = "text-white" }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="text-[11px] text-gray-400">{title}</div>
      <div className={`font-mono text-2xl font-bold mt-1 ${color}`}>{value}</div>
      {sub && <div className="text-[11px] text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div className="font-display text-xs font-bold text-gray-400 tracking-wider uppercase mb-4">
      {children}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 text-sm text-gray-400 text-center">
      {message}
    </div>
  );
}

// ─── Section 3 helper: Sub-tab content ────────────────────────────────────────

function TabReferensi({ prodi }) {
  const meta = PRODI_META[prodi] || {};
  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs font-semibold text-gray-300 mb-2">ISCED-F Codes</div>
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left text-gray-400 py-1.5 pr-4 w-20">Kode</th>
              <th className="text-left text-gray-400 py-1.5 pr-4">Deskripsi</th>
              <th className="text-left text-gray-400 py-1.5">Sumber</th>
            </tr>
          </thead>
          <tbody>
            {(meta.isced_codes || []).map((row) => (
              <tr key={row.code} className="border-t border-border">
                <td className="font-mono text-cyan-400 py-2 pr-4">{row.code}</td>
                <td className="text-gray-200 py-2 pr-4">{row.label}</td>
                <td className="text-gray-400 py-2">{row.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <div className="text-xs font-semibold text-gray-300 mb-2">Standar Acuan</div>
        <div className="space-y-2">
          {(meta.references || []).map((ref) => (
            <div key={ref.label} className="bg-bg3 border border-border rounded-lg p-3">
              <div className="text-xs font-semibold text-gold">{ref.label}</div>
              <div className="text-xs text-gray-400 mt-1">{ref.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TabKeywords({ prodi }) {
  const meta = PRODI_META[prodi] || {};
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-gray-300">Core Keywords</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">S_con = 1.0</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(meta.core_keywords || []).map((kw) => (
            <span key={kw} className="px-2 py-1 rounded-md text-[11px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              {kw}
            </span>
          ))}
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-gray-300">Adjacent Keywords</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30">S_con = 0.5</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(meta.adjacent_keywords || []).map((kw) => (
            <span key={kw} className="px-2 py-1 rounded-md text-[11px] bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {kw}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function TabSkills({ skills, status, isLoading }) {
  const style = DOMAIN_STATUS_STYLE[status] || DOMAIN_STATUS_STYLE.outside;
  const badge = status === "core" ? "S_con = 1.0" : "S_con = 0.5";

  if (isLoading) {
    return <div className="text-xs text-gray-500 py-4">Memuat data...</div>;
  }

  if (!skills || skills.length === 0) {
    return (
      <div className="text-xs text-gray-500 py-4 text-center">
        Belum ada data. Jalankan pipeline dengan stage00 terlebih dahulu.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-left text-gray-400 py-2 pr-3 w-8">#</th>
            <th className="text-left text-gray-400 py-2 pr-3">ESCO Skill / URI</th>
            <th className="text-left text-gray-400 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {skills.map((s, i) => (
            <tr key={s.node_id} className="border-t border-border hover:bg-bg3 transition-colors">
              <td className="font-mono text-gray-500 py-2 pr-3">{i + 1}</td>
              <td className="py-2 pr-3">
                <div className="text-gray-200">{s.label || s.node_id}</div>
                {s.label && <div className="text-gray-500 truncate max-w-xs">{s.node_id}</div>}
              </td>
              <td className="py-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${style.bg} ${style.text} ${style.border}`}>
                  {badge}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Section 4: Stacked Bar Chart ─────────────────────────────────────────────

function StackedBarChart({ allProdiData }) {
  const maxTotal = Math.max(
    1,
    ...allProdiData.map((d) => (d?.n_core || 0) + (d?.n_adjacent || 0))
  );

  return (
    <div className="space-y-3">
      {PRODI_LIST.map((prodi, i) => {
        const d = allProdiData[i];
        const nCore = d?.n_core || 0;
        const nAdj = d?.n_adjacent || 0;
        const total = nCore + nAdj;
        const corePct = maxTotal > 0 ? (nCore / maxTotal) * 100 : 0;
        const adjPct = maxTotal > 0 ? (nAdj / maxTotal) * 100 : 0;

        return (
          <div key={prodi} className="flex items-center gap-3">
            <div className="w-8 text-xs font-mono text-gray-300 text-right flex-shrink-0">{prodi}</div>
            <div className="flex-1 h-7 bg-bg3 rounded overflow-hidden flex">
              {corePct > 0 && (
                <div
                  className="h-full flex items-center justify-end pr-1 transition-all"
                  style={{ width: `${corePct}%`, background: "#0284c7" }}
                >
                  {corePct > 8 && (
                    <span className="text-[10px] font-mono text-white/90">{nCore}</span>
                  )}
                </div>
              )}
              {adjPct > 0 && (
                <div
                  className="h-full flex items-center justify-end pr-1 transition-all"
                  style={{ width: `${adjPct}%`, background: "#0891b2" }}
                >
                  {adjPct > 8 && (
                    <span className="text-[10px] font-mono text-white/90">{nAdj}</span>
                  )}
                </div>
              )}
            </div>
            <div className="w-24 text-[11px] font-mono text-gray-400 flex-shrink-0">
              {total > 0 ? (
                <span><span className="text-sky-400">{nCore}</span> + <span className="text-cyan-400">{nAdj}</span></span>
              ) : (
                <span className="text-gray-600">—</span>
              )}
            </div>
          </div>
        );
      })}
      <div className="flex items-center gap-4 mt-3 text-[11px]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "#0284c7" }} />
          <span className="text-gray-400">Core (S_con=1.0)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "#0891b2" }} />
          <span className="text-gray-400">Adjacent (S_con=0.5)</span>
        </span>
      </div>
    </div>
  );
}

// ─── Section 5: Overlap Heatmap ───────────────────────────────────────────────

function OverlapHeatmap({ overlapData }) {
  // Build lookup map: "SI-TI" → { overlap_count, overlap_pct }
  const lookup = {};
  (overlapData || []).forEach((row) => {
    lookup[`${row.prodi_a}-${row.prodi_b}`] = row;
  });

  return (
    <div className="overflow-x-auto">
      <table className="text-xs border-collapse">
        <thead>
          <tr>
            <th className="w-12 h-10" />
            {PRODI_LIST.map((p) => (
              <th key={p} className="w-16 h-10 text-center text-gray-400 font-mono font-semibold px-1">
                {p}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PRODI_LIST.map((pa) => (
            <tr key={pa}>
              <td className="font-mono font-semibold text-gray-400 pr-2 text-right w-12">{pa}</td>
              {PRODI_LIST.map((pb) => {
                const cell = lookup[`${pa}-${pb}`];
                const pct = cell?.overlap_pct ?? (pa === pb ? 1.0 : 0);
                const count = cell?.overlap_count ?? 0;
                const isDiag = pa === pb;
                const bg = overlapBg(pct);
                const tc = overlapText(pct);

                return (
                  <td key={pb} className="p-0.5">
                    <div
                      className="w-14 h-10 rounded flex flex-col items-center justify-center border border-border/30"
                      style={{ background: bg }}
                      title={`${pa} ∩ ${pb}: ${count} skills (${(pct * 100).toFixed(1)}%)`}
                    >
                      {isDiag ? (
                        <span className="font-mono text-[11px] font-bold" style={{ color: tc }}>100%</span>
                      ) : pct > 0 ? (
                        <>
                          <span className="font-mono text-[10px] font-bold leading-tight" style={{ color: tc }}>
                            {(pct * 100).toFixed(0)}%
                          </span>
                          <span className="font-mono text-[9px] leading-tight" style={{ color: tc, opacity: 0.8 }}>
                            {count}
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-600 text-[10px]">—</span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 text-[11px] text-gray-500">
        Nilai = persentase overlap relatif terhadap total skills prodi baris. Diagonal = 100% (self-overlap).
      </div>
    </div>
  );
}

// ─── Section 6: Justifikasi Referensi ─────────────────────────────────────────

function ReferencePanel({ title, subtitle, points, accentColor }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex-1">
      <div className={`text-sm font-bold mb-1 ${accentColor}`}>{title}</div>
      <div className="text-[11px] text-gray-500 mb-3">{subtitle}</div>
      <ul className="space-y-1.5">
        {points.map((p, i) => (
          <li key={i} className="text-xs text-gray-300 flex gap-2">
            <span className={`mt-0.5 flex-shrink-0 ${accentColor}`}>▸</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function DomainMap() {
  const [activeProdi, setActiveProdi] = useState("SI");
  const [activeSubTab, setActiveSubTab] = useState("referensi");

  // Query: statistik global
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["domain-stats"],
    queryFn: () => axios.get(`${API_BASE}/domain/stats`).then((r) => r.data),
    refetchInterval: 30000,
  });

  // Query: detail prodi aktif (lazy per tab)
  const { data: prodiData, isLoading: prodiLoading } = useQuery({
    queryKey: ["domain-prodi", activeProdi],
    queryFn: () => axios.get(`${API_BASE}/domain/${activeProdi}`).then((r) => r.data),
    enabled: activeSubTab === "core" || activeSubTab === "adjacent",
    staleTime: 60 * 1000,
  });

  // Query: overlap matrix
  const { data: overlapData, isLoading: overlapLoading } = useQuery({
    queryKey: ["domain-overlap"],
    queryFn: () => axios.get(`${API_BASE}/domain/overlap`).then((r) => r.data),
    staleTime: 60 * 1000,
  });

  // Queries: semua prodi untuk bar chart
  const allProdiQueries = useQueries({
    queries: PRODI_LIST.map((prodi) => ({
      queryKey: ["domain-prodi", prodi],
      queryFn: () => axios.get(`${API_BASE}/domain/${prodi}`).then((r) => r.data),
      staleTime: 60 * 1000,
    })),
  });

  const allProdiData = allProdiQueries.map((q) => q.data);
  const hasAnyData = (stats?.total_core_uris || 0) + (stats?.total_adjacent_uris || 0) > 0;
  const coverageRate = stats?.coverage_rate ?? 0;

  const SUB_TABS = [
    { id: "referensi", label: "Referensi" },
    { id: "keywords", label: "Keywords" },
    { id: "core", label: "Core Skills" },
    { id: "adjacent", label: "Adjacent Skills" },
  ];

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (!statsLoading && !hasAnyData) {
    return (
      <div className="page pt-[52px] min-h-screen px-6 md:px-10 py-7">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-extrabold mb-1">
            Domain Map <span className="text-gold">— Stage 00: Pre-Filter</span>
          </h1>
          <p className="text-sm text-gray-400">
            Pemetaan domain 6 prodi APTIKOM ke ESCO corpus sebelum scoring dimulai.
          </p>
        </div>
        <div className="bg-card border border-amber-500/30 rounded-xl p-6">
          <div className="text-sm font-semibold text-amber-400 mb-2">Stage 00 belum dijalankan</div>
          <p className="text-sm text-gray-400">
            Data Domain Filter belum tersedia. Jalankan pipeline dari menu{" "}
            <span className="text-gold font-semibold">Pipeline</span> untuk menghasilkan
            hasil domain filter (stage00_domain_filter.py).
          </p>
          <p className="text-xs text-gray-500 mt-3">
            Tab <span className="text-gray-300 font-semibold">Referensi</span> dan{" "}
            <span className="text-gray-300 font-semibold">Keywords</span> sudah tersedia
            berdasarkan definisi statis ACM CC2020 + APTIKOM 2019.
          </p>
        </div>
      </div>
    );
  }

  // ── Full render ──────────────────────────────────────────────────────────────
  return (
    <div className="page pt-[52px] min-h-screen px-6 md:px-10 py-7">

      {/* ── SECTION 1: Header ─────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-2xl font-extrabold mb-1">
              Domain Map <span className="text-gold">— Stage 00: Pre-Filter</span>
            </h1>
            <p className="text-sm text-gray-400">
              Referensi: ACM CC2020 + APTIKOM 2019 + UNESCO ISCED-F + ESCO ISCED codes
            </p>
          </div>
          <div className="flex items-center gap-2">
            {statsLoading ? (
              <span className="px-2 py-1 rounded text-[10px] border border-border2 bg-bg3 text-gray-400">
                Memuat...
              </span>
            ) : hasAnyData ? (
              <span className="px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wide border border-emerald-500/40 bg-emerald-500/15 text-emerald-300">
                Stage 00 Ready
              </span>
            ) : (
              <span className="px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wide border border-amber-500/40 bg-amber-500/15 text-amber-300">
                Belum dijalankan
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── SECTION 2: KPI Row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7">
        <KpiCard
          title="Total Prodi"
          value={stats?.total_prodi ?? 6}
          sub="APTIKOM 2019"
          color="text-gold"
        />
        <KpiCard
          title="Total Core URIs"
          value={(stats?.total_core_uris ?? 0).toLocaleString()}
          sub="S_con = 1.0"
          color="text-cyan-400"
        />
        <KpiCard
          title="Total Adjacent URIs"
          value={(stats?.total_adjacent_uris ?? 0).toLocaleString()}
          sub="S_con = 0.5"
          color="text-amber-400"
        />
        <KpiCard
          title="Coverage Rate"
          value={`${(coverageRate * 100).toFixed(1)}%`}
          sub="(core + adjacent) / total ESCO"
          color="text-emerald-400"
        />
      </div>

      {/* ── SECTION 3: Tab 6 Prodi ───────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-5 mb-7">
        <SectionTitle>Detail Per Prodi</SectionTitle>

        {/* Prodi tab bar */}
        <div className="flex gap-1 flex-wrap mb-5">
          {PRODI_LIST.map((prodi) => (
            <button
              key={prodi}
              onClick={() => { setActiveProdi(prodi); setActiveSubTab("referensi"); }}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all border ${
                activeProdi === prodi
                  ? "bg-usu text-white border-usu2"
                  : "bg-transparent text-gray-400 border-border hover:border-border2 hover:bg-bg3"
              }`}
            >
              {prodi}
              <span className="ml-1 text-[10px] font-normal opacity-70">
                — {PRODI_META[prodi]?.full_name}
              </span>
            </button>
          ))}
        </div>

        {/* Sub-tab bar */}
        <div className="flex gap-1 mb-5 border-b border-border pb-3">
          {SUB_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs transition-all border ${
                activeSubTab === tab.id
                  ? "bg-bg3 text-white border-border2"
                  : "bg-transparent text-gray-500 border-transparent hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sub-tab content */}
        <div>
          {activeSubTab === "referensi" && <TabReferensi prodi={activeProdi} />}
          {activeSubTab === "keywords" && <TabKeywords prodi={activeProdi} />}
          {activeSubTab === "core" && (
            <TabSkills
              skills={prodiData?.top_core}
              status="core"
              isLoading={prodiLoading}
            />
          )}
          {activeSubTab === "adjacent" && (
            <TabSkills
              skills={prodiData?.top_adjacent}
              status="adjacent"
              isLoading={prodiLoading}
            />
          )}
        </div>
      </div>

      {/* ── SECTION 4: Stacked Bar Chart ─────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-5 mb-7">
        <SectionTitle>Core vs Adjacent per Prodi</SectionTitle>
        {allProdiQueries.every((q) => q.isLoading) ? (
          <div className="text-xs text-gray-500">Memuat data...</div>
        ) : allProdiData.every((d) => !d || (d.n_core === 0 && d.n_adjacent === 0)) ? (
          <EmptyState message="Data distribusi belum tersedia. Jalankan pipeline dengan stage00 terlebih dahulu." />
        ) : (
          <StackedBarChart allProdiData={allProdiData} />
        )}
      </div>

      {/* ── SECTION 5: Overlap Heatmap 6×6 ──────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-5 mb-7">
        <SectionTitle>Overlap Matrix 6×6 Prodi</SectionTitle>
        <p className="text-xs text-gray-400 mb-4">
          Berapa persen ESCO skills yang sama antara dua prodi. Nilai tinggi menunjukkan
          irisan domain yang besar — relevan untuk validasi skalabilitas metodologi.
        </p>
        {overlapLoading ? (
          <div className="text-xs text-gray-500">Memuat matrix...</div>
        ) : !overlapData || overlapData.length === 0 ? (
          <EmptyState message="Data overlap belum tersedia. Jalankan pipeline dengan stage00 terlebih dahulu." />
        ) : (
          <OverlapHeatmap overlapData={overlapData} />
        )}
      </div>

      {/* ── SECTION 6: Justifikasi Referensi ─────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-5">
        <SectionTitle>Justifikasi Referensi Domain</SectionTitle>
        <p className="text-xs text-gray-400 mb-4">
          Domain filter Stage 00 dibangun berdasarkan tiga standar internasional yang
          saling melengkapi untuk memastikan validitas pemetaan domain prodi ke ESCO corpus.
        </p>
        <div className="flex flex-col lg:flex-row gap-4">
          <ReferencePanel
            title="ACM CC2020"
            subtitle="Computing Curricula 2020"
            accentColor="text-cyan-400"
            points={[
              "Mendefinisikan body of knowledge untuk 5 disiplin computing: CS, CE, SE, IS, IT",
              "Setiap disiplin memiliki ISCED-F codes yang dipetakan ke klasifikasi UNESCO",
              "Digunakan sebagai sumber utama core_keywords per prodi",
              "Kurikulum computing berbasis ACM diakui oleh 180+ negara anggota UNESCO",
            ]}
          />
          <ReferencePanel
            title="APTIKOM 2019"
            subtitle="Asosiasi Pendidikan Tinggi Informatika dan Komputer"
            accentColor="text-amber-400"
            points={[
              "Standar nasional kurikulum inti informatika dan komputer Indonesia",
              "Mendefinisikan capaian pembelajaran (CPL) minimum per jenjang S1",
              "Validasi domain prodi terhadap konteks pendidikan tinggi Indonesia",
              "Digunakan sebagai dasar adjacent_keywords yang bersifat kontekstual lokal",
            ]}
          />
          <ReferencePanel
            title="UNESCO ISCED-F + ESCO"
            subtitle="International Standard Classification of Education — Fields"
            accentColor="text-emerald-400"
            points={[
              "ISCED-F 06xx = ICT: 0612 Database/network, 0613 Software development & analysis",
              "ISCED-F 0714 = Electronics & automation (untuk CE/Teknik Komputer)",
              "ISCED-F 0461 = Mathematics (untuk DS/Sains Data — komponen statistik)",
              "0611 (Computer use) TIDAK digunakan — kode tersebut adalah literasi komputer dasar, bukan program studi computing",
              "Coverage rate = proporsi ESCO skills yang masuk domain 06xx + 07xx + 0461",
            ]}
          />
        </div>
      </div>

    </div>
  );
}
