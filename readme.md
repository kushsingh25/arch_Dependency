# Architecture Conformance Analysis Engine

A production-ready, high-performance Software Architecture Conformance Analysis engine built with FastAPI, NetworkX, GitPython, and Google Gemini.

---

## Quick Start Setup Guide

Follow these steps to set up and run the project locally. 

> **Important Note for Windows Users:** It is strongly recommended to run this project inside **WSL (Ubuntu/Linux)** to prevent file-locking and path delimiter issues.

### 1. Open your Terminal (WSL Linux)
Ensure you are operating inside your Linux environment.

### 2. Install Dependencies
Create and activate a virtual environment, then install the required packages:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

### 3. Configure Environment Variables

Create a `.env` file in the root project directory and add your Gemini API key:

```bash
echo "GEMINI_API_KEY=your_actual_api_key_here" > .env


4. Run the Application
Start the FastAPI server using Uvicorn:
uvicorn main:app --reload


The server will be live at http://127.0.0.1:8000. You can access the interactive Swagger documentation at http://127.0.0.1:8000/docs.
About the Project
1. The Problem
As codebases grow, development teams often establish strict architectural rules (e.g., preventing presentation layers from directly importing data-access or system modules). Manually auditing these rules is tedious, and traditional static analysis tools lack the semantic context to understand why or when an architectural violation was introduced.
2. How We Are Solving It (The Hybrid Design)
We built a hybrid conformance engine that combines:
- Deterministic Static Analysis (NetworkX): Parses abstract syntax trees (AST) to build a dependency graph of target repositories, catching 100% of structural violations with absolute precision.
- Semantic Context Auditing (Gemini AI & Git History): Mines Git commit timelines to audit the history of each violation, using LLM reasoning to evaluate whether a violation is harmful drift or justified code evolution.
What We Have Built & Iteratively Optimized
- WSL Linux & /tmp Sandbox Isolation: Repositories are cloned dynamically into isolated system /tmp directories (tempfile.mkdtemp()) instead of the local workspace. This completely eliminates Windows file-locking crashes (PermissionError) and stops Uvicorn infinite server-reload loops.
- High-Speed Git History Mining: Optimized git log tracing down to single-commit tracking (max_count=1), drastically dropping analysis latency from minutes down to seconds.
- Fault-Tolerant API Resilience: Built-in exception handlers and graceful degradation for cloud-hosted LLM constraints (429 Rate Limits and 503 Service Unavailable errors). If quotas are hit, the engine assigns a clean fallback verdict (FALLBACK_REVIEW_REQUIRED) rather than crashing the backend.
Key Engineering Decisions & Why
- Why a Hybrid Approach instead of Pure LLM? Checking structural package imports is a deterministic problem that requires 100% precision. Graph parsers handle structural detection flawlessly, while language models are reserved purely for high-level semantic auditing and context interpretation.
- Why We Avoided Fine-Tuning a Custom Model:
  - Determinism & Precision: Fine-tuning introduces probabilistic drift and hallucinations into structural tasks better handled by exact AST parsers.
  - Dynamic Ruleset Flexibility: Our API accepts arbitrary, user-defined rules (forbidden_rules). A zero-shot prompt-engineered approach adapts instantly to new rules without requiring costly dataset collection or retraining.
  - Compute & Time Efficiency: Pre-trained frontier models (gemini-3.8-flash) deliver state-of-the-art code reasoning out-of-the-box without requiring heavy GPU infrastructure.
- Why Isolated Sandboxing (/tmp)? Cloning external repositories inside local project subdirectories causes file watchers to trigger continuous reload loops. Moving sandboxes to the Linux /tmp partition ensures a clean workspace and rock-solid server stability.