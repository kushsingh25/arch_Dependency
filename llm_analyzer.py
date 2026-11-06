import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

def evaluate_violation_with_llm(file_path: str, target_import: str, commit_message: str) -> dict:
    api_key = os.environ.get("GEMINI_API_KEY")
    
    if not api_key:
        return {
            "llm_analysis_performed": False,
            "reasoning": "Skipped because GEMINI_API_KEY is missing.",
            "verdict": "AMBIGUOUS_VIOLATION_REQUIRES_REVIEW"
        }
    
    try:
        client = genai.Client(api_key=api_key)
        prompt = f"""
        You are an expert Software Architecture Conformance Auditor.
        Analyze this architectural rule violation:
        - Affected File: {file_path}
        - Unwanted Dependency: {target_import}
        - Latest Commit Message: {commit_message}
        Determine if this represents harmful drift or justified evolution. Keep it concise.
        """
        
        response = client.models.generate_content(
            model='gemini-3.8-flash',
            contents=prompt,
        )
        
        return {
            "llm_analysis_performed": True,
            "reasoning": response.text,
            "verdict": "LLM_REVIEWED_VIOLATION"
        }
        
    except Exception as e:
        error_str = str(e)
        # If we hit rate limits or daily quotas, degrade gracefully rather than crashing the pipeline
        if "429" in error_str or "503" in error_str:
            return {
                "llm_analysis_performed": False,
                "reasoning": f"API Quota/Rate limit reached. Graceful fallback engaged. Error: {error_str}",
                "verdict": "FALLBACK_REVIEW_REQUIRED_QUOTA_EXCEEDED"
            }
        return {
            "llm_analysis_performed": False,
            "reasoning": f"Gemini API error: {error_str}",
            "verdict": "FALLBACK_REVIEW_REQUIRED"
        }