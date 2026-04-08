# Export Feature Specification

Date: 2026-03-06
Purpose: spesifikasi fitur export yang layak ditambahkan pada halaman `Data Quality` dan `KG Explorer`.

## 1. Data Quality Export

### Objective

Memungkinkan pengguna mengekspor hasil audit integritas graph sebagai artefak QA dan lampiran dokumentasi riset.

### Recommended Export Formats

- `JSON`
- `CSV`
- `PDF summary`

### Data Quality JSON Export

Nama file:

- `graph_health_{config}_{date}.json`

Isi minimum:

- `config`
- `total_mappings`
- `resolved_count`
- `unresolved_count`
- `resolution_rate`
- `graph_stats`
- `mode_info`
- `samples`

Use case:

- audit otomatis
- lampiran validasi integritas graph
- pembuktian bahwa snapshot final konsisten

### Data Quality CSV Export

Nama file:

- `graph_resolution_matrix_{date}.csv`

Kolom minimum:

- `config`
- `total_mappings`
- `resolved_count`
- `unresolved_count`
- `resolution_rate`

Use case:

- input tabel Bab VI
- quick comparison antar konfigurasi

### Data Quality PDF Summary

Nama file:

- `graph_health_summary_{date}.pdf`

Komponen:

- judul laporan
- ringkasan graph stats
- resolution matrix
- mode runtime
- interpretive notes

Use case:

- lampiran sidang
- arsip snapshot final

## 2. KG Explorer Export

### Objective

Memungkinkan pengguna mengekspor subgraph yang sedang diamati beserta metadata dan explainability score.

### Recommended Export Formats

- `JSON`
- `CSV edge list`
- `PNG screenshot`
- `PDF analytic snapshot`

### KG JSON Export

Nama file:

- `kg_view_{mode}_{source_or_prodi}_{config}.json`

Isi minimum:

- `view_mode`
- `config`
- `source_id` atau `prodi`
- `nodes`
- `edges`
- `narratives`
- `generated_at`

Use case:

- reproducibility
- analisis lanjutan di luar webapp
- arsip subgraph penting

### KG CSV Edge List Export

Nama file:

- `kg_edges_{mode}_{source_or_prodi}_{config}.csv`

Kolom minimum:

- `source`
- `target`
- `edge_type`
- `weight`
- `s_sem`
- `s_gr`
- `s_con`
- `label`

Use case:

- analisis network eksternal
- input Gephi atau tool graph lain

### KG Node Table Export

Nama file:

- `kg_nodes_{mode}_{source_or_prodi}_{config}.csv`

Kolom minimum:

- `id`
- `short_id`
- `label`
- `node_type`
- `description`
- `cri_score`
- `cri_flag`

Use case:

- lampiran node hasil analisis
- cross-check manual oleh reviewer

### KG PNG Screenshot Export

Nama file:

- `kg_canvas_{mode}_{source_or_prodi}_{config}.png`

Use case:

- figure disertasi
- slide presentasi

### KG PDF Analytic Snapshot

Nama file:

- `kg_snapshot_{mode}_{source_or_prodi}_{config}.pdf`

Komponen:

- screenshot graph
- metadata query
- summary nodes/edges
- top narratives
- top edge explainability

Use case:

- dokumentasi analisis per CPL
- lampiran studi kasus

## 3. Recommended UI Placement

### Data Quality

Tambahkan tombol:

- `Export JSON`
- `Export CSV`
- `Export PDF`

Lokasi:

- kanan atas halaman `Data Quality`

### KG Explorer

Tambahkan tombol:

- `Export Graph JSON`
- `Export Nodes CSV`
- `Export Edges CSV`
- `Save PNG`
- `Export PDF Snapshot`

Lokasi:

- panel kiri atas, dekat kontrol mode/view

## 4. Recommended Implementation Order

1. `Data Quality JSON`
2. `KG JSON`
3. `KG CSV edge list`
4. `Data Quality CSV`
5. `KG PNG screenshot`
6. `PDF summary`

## 5. Technical Notes

- `JSON` dan `CSV` paling cepat karena data sudah tersedia dari state frontend/API.
- `PNG` perlu akses ke instance `cytoscape` untuk screenshot canvas.
- `PDF` sebaiknya dibangun dari HTML summary ringan, bukan screenshot penuh saja.
- Export sebaiknya menyertakan `config`, `mode`, dan timestamp agar artefak bisa diaudit.
