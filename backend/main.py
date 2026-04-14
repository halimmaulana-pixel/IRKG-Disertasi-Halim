# backend/main.py - Vercel deployment
import sys
import os
from pathlib import Path

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
try:
    from routers import (
        graph,
        pipeline,
        cri,
        ablation,
        compare,
        upload,
        domain,
        cpl_mapping,
    )
except ImportError:
    import routers

    graph = routers.graph
    pipeline = routers.pipeline
    cri = routers.cri
    ablation = routers.ablation
    compare = routers.compare
    upload = routers.upload
    domain = routers.domain
    cpl_mapping = routers.cpl_mapping

# Database
try:
    from database import engine
    from models import Base

    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"DB init warning: {e}")

app = FastAPI(title="IR-KG Web API", version="3.0")

# CORS
_raw_origins = os.getenv(
    "ALLOWED_ORIGINS", "https://irkg-disertasi-halim.vercel.app,http://localhost:5173"
)
allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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
app.include_router(cpl_mapping.router, prefix="/api/cpl-mapping", tags=["CPL Mapping"])


@app.get("/")
def root():
    return {"status": "IR-KG API v3.0"}


@app.get("/health")
def health():
    return {"status": "healthy"}
