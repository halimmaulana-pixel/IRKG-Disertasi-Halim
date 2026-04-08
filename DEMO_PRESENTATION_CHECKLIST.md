# IR-KG Webapp Demo Presentation Checklist

Date: 2026-03-06

## Pre-Demo

- Pastikan backend berjalan di `127.0.0.1:8000`
- Pastikan frontend berjalan di `127.0.0.1:5173`
- Pastikan mode navbar menunjukkan `Research Locked`
- Pastikan halaman `Data Quality` menunjukkan `unresolved = 0`
- Pastikan file hasil final sudah tersinkron di `backend/data/outputs`

## Demo Flow

### Segment 1. Opening

- Buka `Beranda`
- Jelaskan bahwa webapp ini memvisualisasikan hasil final IR-KG v2
- Tunjukkan ringkasan nodes, edges, dan komponen framework

### Segment 2. Ablation

- Buka `Ablation`
- Tunjukkan perbandingan `v0.9`, `v1.1`, `v1.2`, `v1.3`, `v1.4`
- Tekankan bahwa `v1.0` sengaja dikeluarkan karena collapse dan menjadi temuan iteratif
- Jelaskan mengapa `v1.2` menjadi konfigurasi utama

### Segment 3. CRI

- Buka `CRI Dashboard`
- Tunjukkan distribusi nilai CRI
- Bandingkan SI dan TI
- Jelaskan coverage per ranah

### Segment 4. KG

- Buka `KG Explorer`
- Gunakan `SI_PLO-4` atau `SI_PLO-11`
- Tunjukkan `Story`, `Ego`, dan `Prodi`
- Klik node ESCO untuk membuktikan label manusia tampil benar
- Klik edge untuk menjelaskan `S_sem`, `S_gr`, dan `S_con`

### Segment 5. Quality

- Buka `Data Quality`
- Tunjukkan `Resolution Matrix`
- Tekankan `100% resolved` pada snapshot final
- Jelaskan bahwa halaman ini dipakai sebagai guardrail sebelum interpretasi hasil

### Segment 6. Pipeline

- Buka `Pipeline Observatory`
- Tunjukkan mode `Research Locked`
- Jelaskan perbedaan `Research Locked` dan `Experimental`
- Tunjukkan trace scoring untuk satu source node

### Segment 7. Upload

- Buka `Upload CPL`
- Tunjukkan bahwa pada mode `Research Locked`, CPL masih bisa disimpan tetapi pipeline tidak dijalankan
- Jelaskan bahwa ini sengaja untuk menjaga baseline final tetap stabil

## Key Talking Points

- Framework ini tidak hanya memetakan CPL, tetapi juga menyediakan explainability per score.
- Hasil graph sekarang sudah konsisten dengan accepted mappings setelah normalisasi ESCO.
- Webapp diposisikan sebagai alat interpretasi ilmiah, bukan sekadar dashboard kosmetik.
- Mode readonly adalah mekanisme penting untuk menjaga validitas snapshot riset final.

## If Asked Tough Questions

- Jika ditanya kenapa `v1.0` hilang: jelaskan bahwa konfigurasi itu collapse dan justru menjadi bukti iterasi metodologis.
- Jika ditanya kenapa task lintas bahasa sparse: jelaskan gap bahasa Indonesia ke O*NET Inggris dan bahwa ini temuan metodologis, bukan bug.
- Jika ditanya apakah graph dapat salah: tunjukkan `Data Quality` dan `resolution-status`.
- Jika ditanya apakah upload akan mengubah hasil final: jawab tidak selama mode `Research Locked` aktif.

## Demo Safety Checks

- Jangan ubah ke `Experimental` saat presentasi final kecuali memang ingin menunjukkan mode eksperimen.
- Jangan gunakan data dummy prodi tanpa kebutuhan.
- Jangan mulai dari halaman `Upload`; mulai dari hasil final dulu.
- Jika API terlambat, refresh `Data Quality` atau `Pipeline` untuk menunjukkan backend tetap aktif.
