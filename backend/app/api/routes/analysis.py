from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

# Import the new LangGraph service instead of CrewAI
from app.services.graph_service import run_graph_analysis

router = APIRouter()

class IdeaRequest(BaseModel):
    business_idea: str

@router.post("/run")
def analyze_idea(request: IdeaRequest):
    """
    Receives a business idea from the React frontend, 
    triggers the LangGraph pipeline, and returns the strategy.
    """
    try:
        # Execute the LangGraph pipeline
        result_state = run_graph_analysis(request.business_idea)
        
        # Return a clean JSON response for your frontend
        return {
            "status": "success",
            "idea": request.business_idea,
            "research": result_state["market_research"],
            "strategy": result_state["final_strategy"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Graph Execution Failed: {str(e)}")