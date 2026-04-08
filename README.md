# IRKG WebApp v2 (Self-Contained)

`irkg-webapp-v2` adalah versi mandiri: dataset, pipeline, output, dan database berada di dalam project ini.

## Struktur

- `backend/data/raw` -> dataset sumber
- `backend/data/outputs` -> output pipeline
- `backend/data/db/irkg.db` -> database aplikasi
- `backend/pipeline` -> modul pipeline
- `frontend` -> React + Vite UI

## Backend

1. Install dependency:
   - `cd backend`
   - `pip install -r requirements.txt`
2. Rebuild database dari output lokal:
   - `python -m services.db_loader`
3. Jalankan API:
   - `uvicorn main:app --port 8000`

## Menjalankan Satu Perintah

Dari root project, jalankan:

- `.\run-webapp.cmd`

Script ini akan:
- memastikan database ada (dibuat schema kosong jika belum ada),
- menjalankan backend di terminal terpisah,
- menjalankan frontend di terminal terpisah,
- membuka browser ke `http://localhost:5173`.

Catatan:
- Kondisi awal aplikasi bisa kosong (belum ada hasil).
- Data akan terisi setelah kamu menjalankan pipeline dari menu `Pipeline`.

## Pipeline

Jalankan pipeline dari data lokal project:

- `cd backend/pipeline`
- `python main.py --all`

Atau dari API:

- `POST /api/pipeline/run` dengan body `{"mode":"all"}`
- Pantau:
  - `GET /api/pipeline/status/{job_id}`
  - `GET /api/pipeline/stages/{job_id}`
  - `GET /api/pipeline/stage-output/{job_id}/{stage_id}`
  - `GET /api/pipeline/stream/{job_id}` (SSE)

## Graph Advanced API

- Story path per CPL:
  - `GET /api/graph/story/{source_id}?config=v1.2`
- Delta compare 2 config untuk satu CPL:
  - `GET /api/graph/delta/{source_id}?config_a=v1.2&config_b=v1.4`
- Delta summary per prodi:
  - `GET /api/graph/delta-summary?prodi=SI&config_a=v1.2&config_b=v1.4`

Frontend update:
- `KG Explorer` sekarang punya mode `Ego`, `Story`, `Prodi`, `Delta`.
- Klik edge menampilkan panel explainability (type, weight, S_sem, S_gr, S_con).
- `Compare` menampilkan delta chart agregat SI/TI antar config.

## Frontend

1. Install dependency:
   - `cd frontend`
   - `npm install`
2. (Opsional) set API base via `.env`:
   - `VITE_API_BASE=/api`
3. Jalankan:
   - `npm run dev`

## Perubahan Utama v2

- Tidak ada path ke folder eksternal (`irkg-pipeline-v1.1` / `cri-kg`).
- Loader DB idempotent (drop/recreate sebelum load).
- Endpoint observability pipeline + SSE streaming.
- Fix mismatch payload upload (`deskripsi` vs `deskripsi_cpl`).
- Fix key graph data (`node_type` / `edge_type`).
- API frontend dipusatkan di `src/config/api.js`.
