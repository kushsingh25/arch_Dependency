import os
from git import Repo

def trace_violation_history(repo_path: str, file_path: str, target_import: str) -> list:
    """
    Mines the latest relevant commit for speed, avoiding deep historical overhead.
    """
    timeline = []
    try:
        repo = Repo(repo_path)
        rel_path = os.path.relpath(file_path, repo_path)
        # Fetch only the 1 most recent commit touching this file for rapid response
        commits = list(repo.iter_commits(paths=rel_path, max_count=1))
        for commit in commits:
            timeline.append({
                "commit_sha": commit.hexsha[:7],
                "author": str(commit.author),
                "date": str(commit.committed_datetime),
                "message": commit.message.strip()
            })
    except Exception as e:
        print(f"Git history error: {e}")
    return timeline