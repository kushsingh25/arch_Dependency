def check_architecture_conformance(graph, forbidden_rules):
    """
    Compares the dependency graph against defined architectural rules.
    """
    violations = []
    for rule in forbidden_rules:
        rule_id = rule.get("rule_id")
        source_prefix = rule.get("source")
        target_module = rule.get("target")
        
        for node in graph.nodes():
            source_prefix = rule.get("pattern", "") if isinstance(rule, dict) else getattr(rule, "pattern", "")
            if source_prefix and not node.startswith(source_prefix):
                continue
            if node.startswith(source_prefix):
                if graph.has_edge(node, target_module):
                    violations.append({
                        "rule_id": rule_id,
                        "source_file": node,
                        "imported_dependency": target_module,
                        "description": f"Architectural Violation: '{node}' is importing forbidden module '{target_module}'."
                    })
    return violations