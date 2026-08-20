import logging
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import GenerateRequest, GenerateResponse
from app.service import PRESETS, KNOWN_SYSTEMS, generate

logging.basicConfig(level=logging.INFO, format="%(levelname)s - %(message)s")
logger = logging.getLogger("causaldynamics_studio")

app = FastAPI(
    title="CausalDynamics Studio API",
    description=(
        "A form-and-visualization layer over kausable's open-source "
        "causaldynamics package, for generating and inspecting synthetic "
        "causal dynamical systems without hand-editing config.yaml."
    ),
    version="0.1.0",
)

# Comma-separated list of allowed origins, e.g. "https://myapp.up.railway.app,http://localhost:5173"
# Whitespace around each entry is stripped so "a, b" and "a,b" behave identically -
# a stray space here is a common, silent cause of CORS rejections.
_raw_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173")
allowed_origins = [origin.strip() for origin in _raw_origins.split(",") if origin.strip()]
logger.info(f"CORS allowed origins: {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/systems")
def systems():
    return {"systems": KNOWN_SYSTEMS}


@app.get("/api/presets")
def presets():
    return {"presets": PRESETS}


@app.post("/api/generate", response_model=GenerateResponse)
def generate_endpoint(req: GenerateRequest):
    try:
        result = generate(req.model_dump())
        return result
    except Exception as exc:  # noqa: BLE001 - surface a clean 400 to the UI
        logger.exception("Generation failed")
        raise HTTPException(status_code=400, detail=str(exc)) from exc
