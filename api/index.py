# api/index.py - Vercel Serverless Function
# Automatically detected by Vercel as Python serverless function

import sys
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine
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

# Create tables
try:
    Base.metadata.create_all(bind=engine)
except Exception:
    pass

app = FastAPI(title="IR-KG Web API", version="3.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://irkg-disertasi-halim.vercel.app", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(graph.router, prefix="/api/graph", tags=["Knowledge Graph"])
app.include_router(pipeline.router, prefix="/api/pipeline", tags=["Pipeline"])
app.include_router(cri.router, prefix="/api/cri", tags=["CRI"])
app.include_router(ablation.router, prefix="/api/ablation", tags=["Ablation"])
app.include_router(compare.router, prefix="/api/compare", tags=["Compare"])
app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])
app.include_router(domain.router, prefix="/api/domain", tags=["Domain"])
app.include_router(cpl_mapping.router, prefix="/api/cpl-mapping", tags=["CPL"])


@app.get("/api")
@app.get("/api/")
def root():
    return {"status": "IR-KG API", "version": "3.0"}


@app.get("/api/health")
def health():
    return {"status": "healthy"}
