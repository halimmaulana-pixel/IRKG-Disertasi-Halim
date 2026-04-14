# api/app.py - Vercel Serverless Function entry point
import os
import sys
from pathlib import Path

# Backend is at parent/backend relative to api/ folder
_CURRENT = Path(__file__).resolve().parent
_BACKEND = _CURRENT.parent / "backend"
sys.path.insert(0, str(_BACKEND))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine, get_db
from backend.models import Base

from backend.routers import (
    graph,
    pipeline,
    cri,
    ablation,
    compare,
    upload,
    domain,
    cpl_mapping,
)

# Create tables if using SQLite
try:
    Base.metadata.create_all(bind=engine)
except Exception:
    pass

app = FastAPI(title="IR-KG Web API", version="3.0")

_origins = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:5173,https://irkg-disertasi-halim.vercel.app"
)
allowed_origins = [o.strip() for o in _origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(graph.router, prefix="/api/graph", tags=["Knowledge Graph"])
app.include_router(pipeline.router, prefix="/api/pipeline", tags=["Pipeline Trace"])
app.include_router(cri.router, prefix="/api/cri", tags=["CRI Dashboard"])
app.include_router(ablation.router, prefix="/api/ablation", tags=["Ablation Study"])
app.include_router(compare.router, prefix="/api/compare", tags=["Comparison"])
app.include_router(upload.router, prefix="/api/upload", tags=["Upload CPL"])
app.include_router(domain.router, prefix="/api/domain", tags=["Domain Map"])
app.include_router(cpl_mapping.router, prefix="/api/cpl-mapping", tags=["CPL Mapping"])


@app.get("/")
def root():
    return {"status": "IR-KG API v3.0", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "healthy"}
