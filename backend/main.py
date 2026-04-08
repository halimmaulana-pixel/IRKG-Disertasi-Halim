# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import graph, pipeline, cri, ablation, compare, upload, domain, cpl_mapping
from database import engine
from models import Base

# Buat semua tabel yang belum ada (idempotent — tidak drop tabel existing)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="IR-KG Web API", version="3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(graph.router,    prefix="/api/graph",    tags=["Knowledge Graph"])
app.include_router(pipeline.router, prefix="/api/pipeline", tags=["Pipeline Trace"])
app.include_router(cri.router,      prefix="/api/cri",      tags=["CRI Dashboard"])
app.include_router(ablation.router, prefix="/api/ablation", tags=["Ablation Study"])
app.include_router(compare.router,  prefix="/api/compare",  tags=["Comparison"])
app.include_router(upload.router,   prefix="/api/upload",   tags=["Upload CPL"])
app.include_router(domain.router,       prefix="/api/domain",       tags=["Domain Map"])
app.include_router(cpl_mapping.router,  prefix="/api/cpl-mapping",  tags=["CPL Mapping"])

@app.get("/")
def root():
    return {"status": "IR-KG API v3.0", "docs": "/docs"}
