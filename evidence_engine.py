import time
from llm_analyzer import evaluate_violation_with_llm

def apply_evidence_guided_gate(violation: dict, history: list, request_index: int = 0) -> dict:
    latest_msg = history[0]["message"] if history else "Initial import"
    
    # Optimized pacing for local demonstration/testing (1 second instead of 12)
    if request_index > 0:
        time.sleep(1)
        
    llm_res = evaluate_violation_with_llm(
        violation["source_file"],
        violation["imported_dependency"],
        latest_msg
    )
    violation.update(llm_res)
    return violation