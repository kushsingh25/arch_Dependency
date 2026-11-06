import os
import shutil
import tempfile
import traceback
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from git import Repo
from parser import build_dependency_graph
from conformance import check_architecture_conformance
from git_miner import trace_violation_history
from evidence_engine import apply_evidence_guided_gate

app = FastAPI(title="Architecture Conformance Engine (WSL)")

class AnalyzeRequest(BaseModel):
    repo_url: str
    forbidden_rules: list[dict]

@app.get("/")
def root():
    return {"status": "online", "environment": "WSL Linux Clean"}

@app.post("/api/v1/analyze")
def analyze_repository(req: AnalyzeRequest):
    # Create an isolated temporary directory in Linux /tmp (completely outside project root)
    temp_dir = tempfile.mkdtemp(prefix="arch_repo_")
    print(f"\n[+] Created isolated repo sandbox at: {temp_dir}")
    
    try:
        print(f"Cloning {req.repo_url}...")
        Repo.clone_from(req.repo_url, temp_dir)
        print("Clone successful. Building dependency graph...")
        
        graph = build_dependency_graph(temp_dir)
        print(f"Graph nodes: {graph.number_of_nodes()}, edges: {graph.number_of_edges()}")
        
        violations = check_architecture_conformance(graph, req.forbidden_rules)
        print(f"Found {len(violations)} violations. Tracing history & invoking LLM with pacing...")
        
        final_results = []
        for i, v in enumerate(violations):
            file_full_path = os.path.join(temp_dir, v["source_file"])
            history = trace_violation_history(temp_dir, file_full_path, v["imported_dependency"])
            
            # Pass request_index `i` to handle rate-limiting pacing across loop iterations
            processed_v = apply_evidence_guided_gate(v, history, request_index=i)
            processed_v["evolution_history_count"] = len(history)
            processed_v["full_commit_timeline"] = history
            final_results.append(processed_v)
        
        # Clean up the isolated temp directory
        shutil.rmtree(temp_dir, ignore_errors=True)
        print("Cleanup completed.")
        
        return {
            "status": "success",
            "total_nodes": graph.number_of_nodes(),
            "total_edges": graph.number_of_edges(),
            "violations_analyzed": len(final_results),
            "results": final_results
        }
        
    except Exception as e:
        error_trace = traceback.format_exc()
        print(f"ERROR: {error_trace}")
        shutil.rmtree(temp_dir, ignore_errors=True)
        raise HTTPException(status_code=500, detail=str(e))