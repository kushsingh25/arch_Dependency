import os
import networkx as nx

def build_dependency_graph(repo_path: str) -> nx.DiGraph:
    """
    Scans the repository and builds a NetworkX directed dependency graph.
    """
    G = nx.DiGraph()
    for root, _, files in os.walk(repo_path):
        if ".git" in root:
            continue
        for file in files:
            if file.endswith(".py"):
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, repo_path)
                G.add_node(rel_path, type="file")
                
                try:
                    with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                        for line in f:
                            stripped = line.strip()
                            if stripped.startswith("import ") or stripped.startswith("from "):
                                parts = stripped.split()
                                if len(parts) > 1:
                                    imported_mod = parts[1].split(".")[0]
                                    G.add_edge(rel_path, imported_mod, type="import")
                except Exception:
                    pass
    return G