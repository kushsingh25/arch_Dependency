import React, { useState } from 'react';

// Pre-loaded realistic sample data matching your backend output format
const MOCK_DATA = {
  status: "success",
  total_nodes: 164,
  total_edges: 377,
  violations_analyzed: 8,
  results: [
    {
      rule_id: "RULE-TEST-OS",
      source_file: "src/flask/blueprints.py",
      imported_dependency: "os",
      description: "Architectural Violation: 'src/flask/blueprints.py' is importing forbidden module 'os'.",
      llm_analysis_performed: true,
      reasoning: "The blueprint system handles modular route registration. Using system-level 'os' directly bypasses abstract filesystem utilities. Recommended refactoring to use wrapped path helpers.",
      verdict: "LLM_REVIEWED_VIOLATION",
      evolution_history_count: 1,
      full_commit_timeline: [
        {
          commit_sha: "9e831e9",
          author: "bre-17387639",
          date: "2024-10-24 14:46:34-07:00",
          message: "fix pyright type errors"
        }
      ]
    },
    {
      rule_id: "RULE-TEST-OS",
      source_file: "src/flask/app.py",
      imported_dependency: "os",
      description: "Architectural Violation: 'src/flask/app.py' is importing forbidden module 'os'.",
      llm_analysis_performed: false,
      reasoning: "Gemini API error: 503 UNAVAILABLE. High demand spike. Fallback engaged.",
      verdict: "FALLBACK_REVIEW_REQUIRED",
      evolution_history_count: 1,
      full_commit_timeline: [
        {
          commit_sha: "bfc8f98",
          author: "David Lord",
          date: "2026-10-30 08:03:29-07:00",
          message: "add `versionchanged` for ctx signature change"
        }
      ]
    },
    {
      rule_id: "RULE-TEST-OS",
      source_file: "src/flask/cli.py",
      imported_dependency: "os",
      description: "Architectural Violation: 'src/flask/cli.py' is importing forbidden module 'os'.",
      llm_analysis_performed: false,
      reasoning: "Gemini API error: 429 RESOURCE_EXHAUSTED. Daily free tier request limit reached.",
      verdict: "FALLBACK_REVIEW_REQUIRED",
      evolution_history_count: 1,
      full_commit_timeline: [
        {
          commit_sha: "7689f98",
          author: "David Lord",
          date: "2026-10-07 06:47:14-07:00",
          message: "drop support for Python 3.10"
        }
      ]
    }
  ]
};

export default function App() {
  const [repoUrl, setRepoUrl] = useState("https://github.com/pallets/flask");
  const [rules, setRules] = useState([
    { id: "RULE-TEST-OS", pattern: "src/flask/.*", forbidden_import: "os" }
  ]);
  const [useMockMode, setUseMockMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(MOCK_DATA);
  const [error, setError] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(0);

  const handleAddRule = () => {
    setRules([
      ...rules,
      { id: `RULE-${rules.length + 1}`, pattern: "src/.*", forbidden_import: "" }
    ]);
  };

  const handleRemoveRule = (index) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleRuleChange = (index, field, value) => {
    const updated = [...rules];
    updated[index][field] = value;
    setRules(updated);
  };

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);

    if (useMockMode) {
      setTimeout(() => {
        setAnalysisData(MOCK_DATA);
        setLoading(false);
      }, 1000);
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo_url: repoUrl,
          forbidden_rules: rules
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      setAnalysisData(data);
    } catch (err) {
      setError(`Analysis Failed: ${err.message}. Make sure your FastAPI server is running on http://127.0.0.1:8000.`);
    } finally {
      setLoading(false);
    }
  };

  const copyMarkdownReport = () => {
    if (!analysisData) return;
    let md = `# Architecture Conformance Audit Report\n\n`;
    md += `- **Target Repo:** ${repoUrl}\n`;
    md += `- **AST Graph Nodes:** ${analysisData.total_nodes}\n`;
    md += `- **Dependency Edges:** ${analysisData.total_edges}\n`;
    md += `- **Violations Analyzed:** ${analysisData.violations_analyzed}\n\n`;
    md += `## Detected Violations\n\n`;

    analysisData.results.forEach((v, idx) => {
      md += `### ${idx + 1}. File: \`${v.source_file}\`\n`;
      md += `- **Forbidden Dependency:** \`${v.imported_dependency}\`\n`;
      md += `- **Verdict:** \`${v.verdict}\`\n`;
      md += `- **LLM Reasoning:** ${v.reasoning}\n`;
      if (v.full_commit_timeline && v.full_commit_timeline.length > 0) {
        md += `- **Latest Commit:** ${v.full_commit_timeline[0].commit_sha} - "${v.full_commit_timeline[0].message}" by ${v.full_commit_timeline[0].author}\n`;
      }
      md += `\n---\n\n`;
    });

    navigator.clipboard.writeText(md);
    alert("Markdown Report copied to clipboard!");
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', padding: '2rem' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#38bdf8' }}>
            ⚡ Architecture Conformance Engine
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
            Hybrid AST Dependency Graph (NetworkX) + AI Semantic Audit (Gemini)
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#1e293b', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #334155' }}>
          <label style={{ cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input 
              type="checkbox" 
              checked={useMockMode} 
              onChange={(e) => setUseMockMode(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            Demo / Mock Mode
          </label>
        </div>
      </header>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Left Column: Form & Configuration */}
        <div>
          <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155', marginBottom: '1.5rem' }}>
            <h3 style={{ marginTop: 0, color: '#f1f5f9', fontSize: '1.1rem' }}>Target Repository</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Git Repository URL</label>
              <input 
                type="text" 
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#f8fafc', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Rules Builder */}
          <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#f1f5f9', fontSize: '1.1rem' }}>Forbidden Rules</h3>
              <button 
                onClick={handleAddRule}
                style={{ backgroundColor: '#0369a1', color: '#fff', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                + Add Rule
              </button>
            </div>

            {rules.map((rule, idx) => (
              <div key={idx} style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid #334155', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 'bold' }}>Rule #{idx + 1}</span>
                  {rules.length > 1 && (
                    <button onClick={() => handleRemoveRule(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem' }}>Remove</button>
                  )}
                </div>
                <input 
                  type="text"
                  placeholder="Rule ID (e.g. RULE-TEST-OS)"
                  value={rule.id}
                  onChange={(e) => handleRuleChange(idx, 'id', e.target.value)}
                  style={{ width: '100%', padding: '0.4rem', marginBottom: '0.5rem', borderRadius: '4px', backgroundColor: '#1e293b', border: '1px solid #475569', color: '#f8fafc', boxSizing: 'border-box', fontSize: '0.8rem' }}
                />
                <input 
                  type="text"
                  placeholder="Forbidden Module (e.g. os, sys)"
                  value={rule.forbidden_import}
                  onChange={(e) => handleRuleChange(idx, 'forbidden_import', e.target.value)}
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', backgroundColor: '#1e293b', border: '1px solid #475569', color: '#f8fafc', boxSizing: 'border-box', fontSize: '0.8rem' }}
                />
              </div>
            ))}

            <button 
              onClick={runAnalysis}
              disabled={loading}
              style={{ width: '100%', backgroundColor: loading ? '#475569' : '#0284c7', color: '#fff', border: 'none', padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '0.5rem' }}
            >
              {loading ? "Analyzing Repository & Telemetry..." : "Execute Conformance Audit"}
            </button>
          </div>
        </div>

        {/* Right Column: Output & Analytics */}
        <div>
          {error && (
            <div style={{ backgroundColor: '#450a0a', border: '1px solid #991b1b', color: '#fca5a5', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              {error}
            </div>
          )}

          {analysisData && (
            <>
              {/* Telemetry Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '8px', border: '1px solid #334155', textAlign: 'center' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>AST NODES</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#38bdf8' }}>{analysisData.total_nodes}</div>
                </div>
                <div style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '8px', border: '1px solid #334155', textAlign: 'center' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>DEPENDENCY EDGES</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#818cf8' }}>{analysisData.total_edges}</div>
                </div>
                <div style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '8px', border: '1px solid #334155', textAlign: 'center' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>VIOLATIONS</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f43f5e' }}>{analysisData.violations_analyzed}</div>
                </div>
                <div style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '8px', border: '1px solid #334155', textAlign: 'center' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>FALLBACK RATE</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fbbf24' }}>
                    {Math.round((analysisData.results.filter(r => !r.llm_analysis_performed).length / analysisData.results.length) * 100)}%
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f1f5f9' }}>Violations & Semantic Audit Log</h3>
                <button 
                  onClick={copyMarkdownReport}
                  style={{ backgroundColor: '#334155', color: '#f8fafc', border: '1px solid #475569', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  📋 Copy Markdown Report
                </button>
              </div>

              {/* Violation Items */}
              {analysisData.results.map((item, i) => {
                const isExpanded = expandedIndex === i;
                const isFallback = item.verdict.includes("FALLBACK");

                return (
                  <div 
                    key={i} 
                    style={{ backgroundColor: '#1e293b', borderRadius: '8px', border: `1px solid ${isFallback ? '#b45309' : '#334155'}`, marginBottom: '1rem', overflow: 'hidden' }}
                  >
                    <div 
                      onClick={() => setExpandedIndex(isExpanded ? null : i)}
                      style={{ padding: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: isExpanded ? '#0f172a' : 'transparent' }}
                    >
                      <div>
                        <span style={{ fontFamily: 'monospace', color: '#f43f5e', fontWeight: 'bold', marginRight: '0.8rem' }}>
                          {item.source_file}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                          imports <code style={{ color: '#fbbf24', backgroundColor: '#334155', padding: '2px 6px', borderRadius: '4px' }}>{item.imported_dependency}</code>
                        </span>
                      </div>

                      <span style={{
                        fontSize: '0.7rem',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        backgroundColor: isFallback ? '#78350f' : '#065f46',
                        color: isFallback ? '#fef3c7' : '#d1fae5'
                      }}>
                        {item.verdict}
                      </span>
                    </div>

                    {isExpanded && (
                      <div style={{ padding: '1rem', borderTop: '1px solid #334155', fontSize: '0.85rem' }}>
                        <div style={{ marginBottom: '1rem' }}>
                          <strong style={{ color: '#38bdf8', display: 'block', marginBottom: '0.3rem' }}>AI Semantic Analysis & Reasoning:</strong>
                          <p style={{ margin: 0, color: '#cbd5e1', lineHeight: '1.5', backgroundColor: '#0f172a', padding: '0.8rem', borderRadius: '6px', border: '1px solid #334155' }}>
                            {item.reasoning}
                          </p>
                        </div>

                        {item.full_commit_timeline && item.full_commit_timeline.length > 0 && (
                          <div>
                            <strong style={{ color: '#818cf8', display: 'block', marginBottom: '0.3rem' }}>Git Evolution History (Latest Commit):</strong>
                            <div style={{ backgroundColor: '#0f172a', padding: '0.8rem', borderRadius: '6px', border: '1px solid #334155', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                              <div><span style={{ color: '#94a3b8' }}>Commit:</span> <span style={{ color: '#fbbf24' }}>{item.full_commit_timeline[0].commit_sha}</span></div>
                              <div><span style={{ color: '#94a3b8' }}>Author:</span> {item.full_commit_timeline[0].author}</div>
                              <div><span style={{ color: '#94a3b8' }}>Message:</span> "{item.full_commit_timeline[0].message}"</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}