# IR-KG Webapp v2 Technical Audit Report

Date: 2026-03-06
Project: `D:\codex\Disertasi\irkg-webapp-v2`

## Scope

Audit ini mencakup:

- sinkronisasi hasil pipeline final ke webapp
- integritas node-edge knowledge graph
- konsistensi label ESCO pada accepted mappings
- kesiapan menu utama untuk demonstrasi hasil riset
- penguatan UX mode `Research Locked` vs `Experimental`
- optimasi delivery frontend melalui lazy loading dan chunk splitting

## Key Fixes Applied

### 1. ESCO ID normalization

Masalah awal:

- `accepted_mappings.target_id` untuk ESCO masih berupa short UUID
- `kg_nodes.id` memakai full URI ESCO
- akibatnya beberapa node di KG Explorer muncul sebagai UUID mentah, bukan label manusia

Perbaikan:

- `backend/services/db_loader.py`
  - normalisasi target ESCO menjadi full URI
  - lookup `target_label` dari `esco_skills.csv`
  - deduplikasi row saat import ke SQLite
- `backend/routers/graph.py`
  - fallback resolver untuk target ESCO short UUID
  - edge `MAPS_TO` dipaksa memakai target ID yang sudah dinormalisasi

Hasil:

- node ESCO sekarang resolve ke label yang benar
- `resolution-status` pada `v1.2` menghasilkan `unresolved_count = 0`

### 2. KG Explorer hardening

Perbaikan:

- tampilkan `short_id` pada node panel
- tampilkan label manusia sebagai prioritas utama
- edge panel menampilkan short ID agar mudah dibaca
- node unresolved diberi style border dashed
- ditambah panel `Node Resolution` untuk memonitor kualitas graph langsung dari UI

Hasil:

- KG Explorer lebih representatif terhadap hasil riset final
- gejala node bayangan atau UUID mentah bisa dideteksi lebih cepat

### 3. Data Quality page

Halaman baru:

- route frontend: `/quality`
- menu navbar: `Data Quality`

Isi utama:

- graph node/edge count
- tracked mappings
- pipeline mode
- resolution matrix per config
- interpretasi operasional untuk demo dan validasi

Tujuan:

- menjadi guardrail sebelum demo, penulisan, atau review hasil

### 4. Upload CPL workflow refinement

Perbaikan:

- halaman upload sekarang membaca mode runtime dari backend
- jika mode `Research Locked`, UI menjelaskan bahwa CPL akan disimpan tetapi pipeline tidak dijalankan
- status submit dan status job ditampilkan inline, bukan melalui `alert`
- status prodi ditampilkan melalui endpoint `/api/upload/status/{prodi_code}`

Validasi:

- write test nyata berhasil untuk `upload/cpl`
- `upload/run` mengembalikan `409` saat mode readonly
- perilaku ini sesuai desain untuk menjaga baseline hasil riset final

### 5. Frontend performance improvement

Perbaikan:

- semua page diubah ke `React.lazy` + `Suspense`
- Vite `manualChunks` ditambahkan untuk:
  - `graph-vendor`
  - `query-vendor`
  - `vendor`

Hasil build:

- `KGExplorer` page chunk turun drastis karena library graph dipisah
- tidak ada lagi bundle tunggal raksasa yang memuat semua halaman

## Functional Validation

Endpoint yang tervalidasi sukses:

- `/`
- `/api/graph/stats`
- `/api/graph/resolution-status?config=v1.2`
- `/api/graph/ego/SI_PLO-4?config=v1.2`
- `/api/graph/story/SI_PLO-4?config=v1.2`
- `/api/graph/cpl-subgraph/SI?config=v1.2`
- `/api/cri/SI`
- `/api/cri/ranah/summary`
- `/api/ablation/`
- `/api/compare/si-ti`
- `/api/pipeline/mode`
- `/api/pipeline/trace/SI_PLO-4?task=T1a&config=v1.2`
- `/api/upload/status/SI`

Observed results:

- graph stats tersedia
- story mode menghasilkan narasi
- prodi subgraph menghasilkan node dan edge
- CRI, ablation, compare, pipeline mode, dan upload status semuanya merespons normal

## Current System Status

Status saat audit:

- pipeline mode: `Research Locked`
- resolution status `v1.2`: `100% resolved`
- dummy upload test data `Q8` sudah dibersihkan kembali
- frontend build berhasil

## Research Interpretation

Secara teknis, webapp sekarang sudah cukup representatif untuk menampilkan hasil penelitian IR-KG final karena:

- data graph dan accepted mappings konsisten
- node ESCO tidak lagi terputus dari label manusianya
- mode readonly menjaga snapshot hasil final tetap stabil
- halaman kualitas data memberi indikator dini jika integritas graph rusak

Implikasinya:

- webapp layak dipakai untuk demo hasil riset
- webapp cukup aman dipakai sebagai alat bantu interpretasi Bab V dan Bab VI
- perubahan eksperimen baru sebaiknya tetap dilakukan hanya saat mode `Experimental`

## Remaining Risks

- `graph-vendor` masih chunk terbesar karena `cytoscape` dan layout plugin memang berat
- validasi visual browser interaktif belum otomatis karena environment CLI tidak menjalankan browser penuh
- upload CPL saat pipeline `Experimental` belum diuji sampai job selesai end-to-end pada audit ini

## Recommended Next Steps

1. Tambahkan visual regression atau screenshot-based smoke test untuk halaman utama.
2. Tambahkan export audit JSON dari `resolution-status` agar bisa dipakai sebagai artefak QA otomatis.
3. Jika ingin demonstrasi upload eksperimen, aktifkan mode `Experimental` hanya sementara lalu uji satu prodi dummy end-to-end.
