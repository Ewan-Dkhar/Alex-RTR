from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_health_status():
    """Returns the status of the backend engine."""
    return {
        "status": "online", 
        "engine": "Market-Mover API",
        "message": "Ready to accelerate."
    }