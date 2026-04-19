from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# We will import our routes here shortly
from app.api.routes import health, analysis

app = FastAPI(
    title="Alex RTR API",
    description="Agentic Business Accelerator Backend",
    version="1.0.0"
)

# CRITICAL FOR REACT INTEGRATION
# Allow Vite (5173) and Create React App (3000) defaults
origins = [
    "http://localhost:3000",
    "http://localhost:5173", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Wire up the routers
app.include_router(health.router, prefix="/api/health", tags=["System Health"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])