from typing import TypedDict
from langgraph.graph import StateGraph, END
from langchain_community.chat_models import ChatOllama
from langchain_core.messages import HumanMessage, SystemMessage

# 1. Define the State (The Graph's Memory)
# This dictates exactly what data is passed between your nodes.
class MarketState(TypedDict):
    business_idea: str
    market_research: str
    final_strategy: str

# 2. Initialize the Local LLM
local_llm = ChatOllama(
    model="qwen2.5:7b", 
    base_url="http://localhost:11434", # Use your ngrok URL here if tunneling!
    temperature=0.4
)

# 3. Define the Nodes (The Agents/Actions)
def researcher_node(state: MarketState):
    """Simulates researching the idea."""
    print(f"--- RESEARCHING: {state['business_idea']} ---")
    
    # In reality, you would inject your ChromaDB RAG tool here
    messages = [
        SystemMessage(content="You are a market researcher. Briefly identify 2 target demographics for the provided idea."),
        HumanMessage(content=state["business_idea"])
    ]
    
    response = local_llm.invoke(messages)
    
    # Return the updated state
    return {"market_research": response.content}

def strategist_node(state: MarketState):
    """Drafts the final strategy based on the research."""
    print("--- DRAFTING STRATEGY ---")
    
    messages = [
        SystemMessage(content="You are a business strategist. Create a 1-sentence pricing strategy based on the research provided."),
        HumanMessage(content=f"Idea: {state['business_idea']}\nResearch: {state['market_research']}")
    ]
    
    response = local_llm.invoke(messages)
    
    return {"final_strategy": response.content}

# 4. Build and Compile the Graph
workflow = StateGraph(MarketState)

# Add nodes
workflow.add_node("researcher", researcher_node)
workflow.add_node("strategist", strategist_node)

# Define the flow (Edges)
workflow.set_entry_point("researcher")
workflow.add_edge("researcher", "strategist")
workflow.add_edge("strategist", END)

# Compile into an executable application
app = workflow.compile()

# 5. Execute the Graph
def run_graph_analysis(idea: str) -> dict:
    """
    Executes the LangGraph pipeline for a given business idea 
    and returns the final state dictionary.
    """
    initial_state = {
        "business_idea": idea,
        "market_research": "",
        "final_strategy": ""
    }
    
    final_state = app.invoke(initial_state)

    return final_state