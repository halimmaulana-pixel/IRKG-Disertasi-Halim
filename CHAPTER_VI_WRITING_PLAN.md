# Bab VI Writing Plan

Date: 2026-03-06
Purpose: template detail untuk penulisan Bab VI, termasuk daftar subbab, nama tabel/list, dan nama figure yang perlu dibuat.

## Suggested Chapter Title

Bab VI - Implementasi, Evaluasi, dan Visualisasi Hasil Framework IR-KG v2

## Suggested Structure

### 6.1 Pendahuluan Bab

Tujuan bagian:

- menjelaskan bahwa bab ini memaparkan implementasi sistem, validasi hasil, dan antarmuka web untuk interpretasi hasil riset
- menegaskan bahwa evaluasi berbasis snapshot final yang dikunci dalam mode `Research Locked`

List yang disarankan:

- List 6.1. Kontribusi utama implementasi IR-KG v2
- List 6.2. Komponen evaluasi dan visualisasi hasil

Figure yang disarankan:

- Figure 6.1. Posisi Bab VI dalam alur penelitian IR-KG

### 6.2 Arsitektur Implementasi Sistem

Isi utama:

- lapisan pipeline riset
- lapisan database webapp
- lapisan API
- lapisan frontend visual analytics

List yang disarankan:

- List 6.3. Modul backend dan fungsinya
- List 6.4. Modul frontend dan fungsinya

Figure yang disarankan:

- Figure 6.2. Arsitektur implementasi webapp IR-KG v2
- Figure 6.3. Alur sinkronisasi dari output pipeline ke SQLite webapp

### 6.3 Implementasi Pipeline Hasil Penelitian

Isi utama:

- penjelasan source data
- preprocessing dan bridge
- TF-IDF semantic scoring
- graph cohesion
- hybrid scoring
- acceptance gate

List yang disarankan:

- List 6.5. Tahapan pipeline IR-KG v2
- List 6.6. Konfigurasi eksperimen yang digunakan dalam snapshot final

Figure yang disarankan:

- Figure 6.4. Alur komputasi pipeline IR-KG v2
- Figure 6.5. Trace scoring dari source item ke accepted mappings

### 6.4 Hasil Ablation Study

Isi utama:

- alasan skip `v1.0`
- pembandingan `v0.9`, `v1.1`, `v1.2`, `v1.3`, `v1.4`
- interpretasi selection objective

Tabel/list yang disarankan:

- Table 6.1. Rekap selection objective per konfigurasi
- Table 6.2. Delta `v1.2` terhadap `v0.9` per task
- List 6.7. Temuan utama dari ablation study

Figure yang disarankan:

- Figure 6.6. Heatmap selection objective antar task dan konfigurasi
- Figure 6.7. Grafik delta performa `v1.2` terhadap baseline `v0.9`

### 6.5 Hasil CRI dan Coverage Mapping

Isi utama:

- penjelasan CRI per CPL
- distribusi SI vs TI
- ringkasan per ranah

Tabel/list yang disarankan:

- Table 6.3. Ringkasan CRI per prodi
- Table 6.4. Ringkasan coverage mapping per ranah
- List 6.8. Temuan utama CRI dan coverage

Figure yang disarankan:

- Figure 6.8. Distribusi nilai CRI per CPL
- Figure 6.9. Perbandingan CRI antara SI dan TI
- Figure 6.10. Coverage mapping per ranah CPL

### 6.6 Validasi Integritas Knowledge Graph

Isi utama:

- bug awal short UUID ESCO
- proses normalisasi target ESCO
- validasi `resolution-status`
- dampak terhadap representasi graph

Tabel/list yang disarankan:

- Table 6.5. Hasil audit integritas node dan edge graph
- List 6.9. Sumber inkonsistensi data yang ditemukan dan diperbaiki

Figure yang disarankan:

- Figure 6.11. Contoh kasus node ESCO sebelum dan sesudah normalisasi
- Figure 6.12. Resolution matrix per konfigurasi
- Figure 6.13. Contoh visual node resolved vs unresolved pada KG Explorer

### 6.7 Implementasi Antarmuka Web untuk Interpretasi Hasil

Isi utama:

- fungsi tiap menu
- mode `Research Locked` dan `Experimental`
- peran webapp sebagai alat analitik, bukan hanya visualisasi pasif

List yang disarankan:

- List 6.10. Fitur utama webapp IR-KG v2
- List 6.11. Mekanisme pengamanan snapshot final

Figure yang disarankan:

- Figure 6.14. Halaman Beranda dan ringkasan hasil
- Figure 6.15. Halaman Ablation dan interpretasi konfigurasi
- Figure 6.16. Halaman CRI Dashboard
- Figure 6.17. Halaman KG Explorer
- Figure 6.18. Halaman Data Quality / Graph Health
- Figure 6.19. Halaman Pipeline Observatory
- Figure 6.20. Halaman Upload CPL dengan mode readonly

### 6.8 Evaluasi Aspek Operasional Sistem

Isi utama:

- lazy loading
- chunk splitting
- kestabilan build
- pembatasan mode eksperimen

Tabel/list yang disarankan:

- Table 6.6. Hasil audit performa frontend setelah chunk splitting
- List 6.12. Perbaikan operasional yang meningkatkan kesiapan sistem

Figure yang disarankan:

- Figure 6.21. Perbandingan struktur bundle sebelum dan sesudah optimasi
- Figure 6.22. Alur upload CPL pada mode locked dan experimental

### 6.9 Pembahasan Temuan Penelitian dari Perspektif Sistem

Isi utama:

- arti sparsity pada task lintas bahasa
- peran `s_gr` sebagai penguat struktur
- pentingnya explainability dan data quality
- justifikasi kenapa `v1.2` menjadi konfigurasi utama

List yang disarankan:

- List 6.13. Temuan substantif yang didukung implementasi sistem
- List 6.14. Batasan sistem yang masih tersisa

Figure yang disarankan:

- Figure 6.23. Ringkasan hubungan antara kualitas semantic score, graph score, dan hasil akhir

### 6.10 Penutup Bab

Isi utama:

- simpulan implementasi
- transisi ke bab berikutnya

List yang disarankan:

- List 6.15. Ringkasan capaian Bab VI

Figure yang disarankan:

- Figure 6.24. Ringkasan end-to-end dari pipeline, evaluasi, dan visualisasi

## Priority Figures To Create First

Jika waktu terbatas, buat ini dulu:

1. Figure 6.2. Arsitektur implementasi webapp IR-KG v2
2. Figure 6.4. Alur komputasi pipeline IR-KG v2
3. Figure 6.6. Heatmap selection objective antar task dan konfigurasi
4. Figure 6.8. Distribusi nilai CRI per CPL
5. Figure 6.11. Contoh node ESCO sebelum dan sesudah normalisasi
6. Figure 6.17. Halaman KG Explorer
7. Figure 6.18. Halaman Data Quality / Graph Health
8. Figure 6.22. Alur upload CPL pada mode locked dan experimental

## Priority Tables To Create First

1. Table 6.1. Rekap selection objective per konfigurasi
2. Table 6.2. Delta `v1.2` terhadap `v0.9` per task
3. Table 6.3. Ringkasan CRI per prodi
4. Table 6.5. Hasil audit integritas node dan edge graph
5. Table 6.6. Hasil audit performa frontend setelah chunk splitting

## Writing Strategy

Urutan penulisan yang paling efisien:

1. Tulis 6.2 dan 6.3 untuk menetapkan arsitektur dan pipeline.
2. Tulis 6.4 dan 6.5 menggunakan tabel hasil yang sudah final.
3. Tulis 6.6 untuk menunjukkan kualitas dan validitas graph.
4. Tulis 6.7 dan 6.8 untuk menunjukkan implementasi sistem.
5. Tutup dengan 6.9 dan 6.10 sebagai sintesis.
