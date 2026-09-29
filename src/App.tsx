import React, { useState, useEffect, useRef } from "react";
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Terminal, 
  AlertTriangle, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  FileText, 
  AlertCircle, 
  ExternalLink, 
  Trash2, 
  Play, 
  CheckSquare, 
  Square, 
  FileDown, 
  Layers, 
  Search, 
  FileCheck2,
  Lock,
  Compass,
  Cpu,
  Bookmark,
  Info
} from "lucide-react";
import { PRESET_LOGS } from "./presetLogs";
import { ScanResult, IndicatorOfCompromise, ThreatSeverity, ThreatType } from "./types";

export default function App() {
  const [textInput, setTextInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"highlights" | "table" | "playbook">("highlights");
  const [selectedIocId, setSelectedIocId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [completedPlaybookSteps, setCompletedPlaybookSteps] = useState<Record<string, boolean>>({});
  const [searchFilter, setSearchFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [copiedIocId, setCopiedIocId] = useState<string | null>(null);

  // Load the first preset by default to make it look great instantly
  useEffect(() => {
    if (PRESET_LOGS.length > 0) {
      loadPreset(PRESET_LOGS[0].id);
    }
  }, []);

  const loadPreset = (presetId: string) => {
    const preset = PRESET_LOGS.find(p => p.id === presetId);
    if (preset) {
      setTextInput(preset.text);
      // Reset states
      setSelectedIocId(null);
      setCompletedPlaybookSteps({});
    }
  };

  const handleClear = () => {
    setTextInput("");
    setScanResult(null);
    setErrorMsg(null);
    setSelectedIocId(null);
  };

  const executeScan = async () => {
    if (!textInput.trim()) {
      setErrorMsg("Please paste some text, logs, or reports to analyze.");
      return;
    }
    setIsScanning(true);
    setErrorMsg(null);
    setSelectedIocId(null);
    setCompletedPlaybookSteps({});

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: textInput }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to analyze input logs.");
      }

      setScanResult(data);
      // Auto switch tab to highlights for immersive visualization
      setActiveTab("highlights");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred during threat scanning.");
    } finally {
      setIsScanning(false);
    }
  };

  const copyToClipboard = (text: string, id: string | null = null) => {
    navigator.clipboard.writeText(text);
    if (id) {
      setCopiedIocId(id);
      setTimeout(() => setCopiedIocId(null), 1500);
    } else {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 1500);
    }
  };

  const toggleStep = (stepText: string) => {
    setCompletedPlaybookSteps(prev => ({
      ...prev,
      [stepText]: !prev[stepText]
    }));
  };

  const downloadJsonReport = () => {
    if (!scanResult) return;
    const blob = new Blob([JSON.stringify(scanResult, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ioc_analysis_${scanResult.threatLevel.toLowerCase()}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadCsvReport = () => {
    if (!scanResult || !scanResult.indicators.length) return;
    const headers = "Indicator Type,Threat Value,Severity,Confidence,Context Description\n";
    const rows = scanResult.indicators.map(ioc => 
      `"${ioc.type}","${ioc.value.replace(/"/g, '""')}","${ioc.severity}","${ioc.confidence}","${ioc.description.replace(/"/g, '""')}"`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ioc_indicators_list_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Threat score background color generator
  const getScoreColorClass = (score: number) => {
    if (score >= 80) return { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", ring: "ring-red-500/10", barBg: "bg-red-500" };
    if (score >= 50) return { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400", ring: "ring-orange-500/10", barBg: "bg-orange-500" };
    if (score >= 25) return { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", ring: "ring-amber-500/10", barBg: "bg-amber-500" };
    if (score > 0) return { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", ring: "ring-blue-500/10", barBg: "bg-blue-500" };
    return { bg: "bg-slate-500/10", border: "border-slate-500/30", text: "text-slate-400", ring: "ring-slate-500/10", barBg: "bg-slate-500" };
  };

  const getSeverityBadgeClass = (severity: ThreatSeverity) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-950/40 text-red-400 border border-red-500/30";
      case "HIGH":
        return "bg-orange-950/40 text-orange-400 border border-orange-500/30";
      case "MEDIUM":
        return "bg-amber-950/40 text-amber-400 border border-amber-500/30";
      case "LOW":
        return "bg-blue-950/40 text-blue-400 border border-blue-500/30";
      case "INFORMATIONAL":
        return "bg-slate-800 text-slate-300 border border-slate-700";
      case "SAFE":
        return "bg-emerald-950/40 text-emerald-400 border border-emerald-500/30";
      default:
        return "bg-slate-800 text-slate-400 border border-slate-700";
    }
  };

  const getSeverityHighlightClass = (severity: ThreatSeverity) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-950/40 text-red-300 border-red-500/50 hover:bg-red-900/40";
      case "HIGH":
        return "bg-orange-950/40 text-orange-300 border-orange-500/50 hover:bg-orange-900/40";
      case "MEDIUM":
        return "bg-amber-950/40 text-amber-300 border-amber-500/50 hover:bg-amber-900/40";
      case "LOW":
        return "bg-blue-950/40 text-blue-300 border-blue-500/50 hover:bg-blue-900/45";
      case "INFORMATIONAL":
        return "bg-slate-800/80 text-slate-200 border-slate-650 hover:bg-slate-705";
      case "SAFE":
        return "bg-emerald-950/40 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900/40";
      default:
        return "bg-slate-800 text-slate-200 border-slate-700";
    }
  };

  // Text Highlighting Algorithm - non-overlapping matches
  const renderHighlightedText = () => {
    if (!scanResult) return <span className="whitespace-pre-wrap">{textInput}</span>;
    const { rawText, indicators } = scanResult;

    interface Segment {
      start: number;
      end: number;
      text: string;
      indicator: IndicatorOfCompromise;
    }

    const segments: Segment[] = [];
    
    // Scan raw text for match substrings returned by the API
    indicators.forEach(ioc => {
      const matchQuery = ioc.matchedText || ioc.value;
      if (!matchQuery) return;

      let index = rawText.indexOf(matchQuery);
      let count = 0; // limit potential infinite loops
      while (index !== -1 && count < 100) {
        segments.push({
          start: index,
          end: index + matchQuery.length,
          text: matchQuery,
          indicator: ioc
        });
        index = rawText.indexOf(matchQuery, index + matchQuery.length || index + 1);
        count++;
      }
    });

    // If no segments were identified, try exact value match fallback
    if (segments.length === 0) {
      indicators.forEach(ioc => {
        const valueQuery = ioc.value;
        if (!valueQuery) return;
        let index = rawText.indexOf(valueQuery);
        let count = 0;
        while (index !== -1 && count < 100) {
          segments.push({
            start: index,
            end: index + valueQuery.length,
            text: valueQuery,
            indicator: ioc
          });
          index = rawText.indexOf(valueQuery, index + valueQuery.length || index + 1);
          count++;
        }
      });
    }

    // Sort segments by starting position
    segments.sort((a, b) => a.start - b.start);

    // Filter out overlapping items
    const nonOverlapping: Segment[] = [];
    let lastEnd = 0;
    for (const seg of segments) {
      if (seg.start >= lastEnd) {
        nonOverlapping.push(seg);
        lastEnd = seg.end;
      }
    }

    // Reconstruction to React nodes
    const elements: React.ReactNode[] = [];
    let currentIndex = 0;

    nonOverlapping.forEach((seg, idx) => {
      if (seg.start > currentIndex) {
        elements.push(
          <span key={`plain-${currentIndex}`} className="text-slate-300">
            {rawText.substring(currentIndex, seg.start)}
          </span>
        );
      }

      const isTokenSelected = selectedIocId === seg.indicator.id;
      elements.push(
        <button
          key={`match-${idx}-${seg.indicator.id}`}
          id={`highlight-token-${seg.indicator.id}`}
          onClick={() => setSelectedIocId(seg.indicator.id)}
          className={`px-1.5 py-0.5 rounded text-xs font-mono font-semibold transition-all duration-150 inline-block text-left border ${
            isTokenSelected 
              ? "bg-indigo-900 border-indigo-400 text-indigo-150 scale-[1.03] ring-1 ring-indigo-400/50 shadow-md shadow-indigo-950/40" 
              : getSeverityHighlightClass(seg.indicator.severity)
          }`}
          title={`[${seg.indicator.type}] Value: ${seg.indicator.value}\nSeverity: ${seg.indicator.severity}\nDescription: ${seg.indicator.description}`}
        >
          {seg.text}
        </button>
      );
      currentIndex = seg.end;
    });

    if (currentIndex < rawText.length) {
      elements.push(
        <span key={`plain-${currentIndex}`} className="text-slate-300">
          {rawText.substring(currentIndex)}
        </span>
      );
    }

    return <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed tracking-normal">{elements}</div>;
  };

  const selectedIocDetails = scanResult?.indicators.find(i => i.id === selectedIocId);

  // Filter implementation for indicator list
  const filteredIndicators = scanResult?.indicators.filter(ioc => {
    const query = searchFilter.toLowerCase();
    const matchesSearch = 
      ioc.value.toLowerCase().includes(query) || 
      ioc.description.toLowerCase().includes(query) || 
      ioc.type.toLowerCase().includes(query);
    
    const matchesSeverity = severityFilter === "ALL" || ioc.severity === severityFilter;
    const matchesType = typeFilter === "ALL" || ioc.type === typeFilter;

    return matchesSearch && matchesSeverity && matchesType;
  }) || [];

  const scoreStats = scanResult ? getScoreColorClass(scanResult.riskScore) : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Decorative cyber grid accent backgrounds */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(30,41,59,0.3),transparent_60%)] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-[1450px] mx-auto p-4 md:p-6 space-y-6 relative">
        
        {/* Header Dashboard Bar */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-500/30 rounded-xl text-indigo-400 shadow-md">
              <Shield className="w-6 h-6 animate-pulse-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-bold tracking-tight text-white font-mono">
                  IOC_ANALYZER_v1.0
                </h1>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono font-medium tracking-wider uppercase border border-slate-700/60">
                  SecOps Pipeline
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Instant forensics parser extracting malware hashes, bad IPs, domains, and phishing URLs.
              </p>
            </div>
          </div>

          {/* Quick Stats Banner */}
          <div className="flex gap-4 flex-wrap text-xs">
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2 flex items-center gap-3 font-mono">
              <Compass className="w-4 h-4 text-slate-400" />
              <div>
                <div className="text-slate-500 text-[10px] uppercase">Engine Status</div>
                <div className="text-emerald-400 flex items-center gap-1.5 font-bold">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active / AI-Guided
                </div>
              </div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2 flex items-center gap-3 font-mono">
              <Lock className="w-4 h-4 text-slate-400" />
              <div>
                <div className="text-slate-500 text-[10px] uppercase">Compliance Mode</div>
                <div className="text-slate-300 font-bold">Zero-Trust HIPAA</div>
              </div>
            </div>
          </div>
        </header>

        {/* Outer Grid Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column = Input console (span 5) */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="bg-slate-900/70 border border-slate-800/85 rounded-xl shadow-xl p-4 md:p-5 space-y-4 relative overflow-hidden backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-slate-800/65 pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-semibold uppercase text-slate-300 tracking-wider font-mono">
                    Text / Log Input Console
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 bg-slate-950 px-2 py-0.5 rounded font-mono">
                  UTF-8 Plaintext
                </span>
              </div>

              {/* Presets dropdown selector */}
              <div>
                <label className="block text-[11px] text-slate-500 uppercase tracking-wider font-mono mb-1.5">
                  Load Pre-loaded Forensic Scenarios:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRESET_LOGS.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => loadPreset(preset.id)}
                      className="text-left p-2 rounded-lg bg-slate-955 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition text-xs flex flex-col justify-between h-[64px]"
                    >
                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-300 font-mono truncate">
                        <span className="text-indigo-400">#</span> {preset.title}
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                        {preset.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Main input wrapper */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-mono text-[11px] text-slate-400 uppercase tracking-wider">
                    Paste Security Raw Data
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {textInput.length} chars
                  </span>
                </div>
                
                <textarea
                  id="ioc-text-input"
                  className="w-full h-[280px] bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none leading-relaxed"
                  placeholder="Paste email headers, firewall syslogs, WHOIS, incident reports, CVE lists, file process strings, malicious IPs, or server events..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                />
              </div>

              {/* Actions bars */}
              <div className="flex items-center gap-2">
                <button
                  id="btn-clear-console"
                  onClick={handleClear}
                  className="flex-1 px-3 py-2 text-xs bg-slate-950 hover:bg-slate-850 text-slate-400 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Input
                </button>
                <button
                  id="btn-scan-ioc"
                  onClick={executeScan}
                  disabled={isScanning}
                  className="flex-2 px-4 py-2 text-xs bg-indigo-650 hover:bg-indigo-600 text-white rounded-lg transition-colors flex items-center justify-center gap-1.5 font-bold shadow-md shadow-indigo-950/40 relative disabled:opacity-50"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Analyzing Threats...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Deconstruct & Scan
                    </>
                  )}
                </button>
              </div>

              {errorMsg && (
                <div className="bg-red-950/30 border border-red-500/20 text-red-400 rounded-lg p-3 text-xs flex items-start gap-2 font-mono">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-red-300">Scanner Error:</span>
                    <span className="text-[11px] block text-red-400/90 leading-relaxed">{errorMsg}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Explanatory SecOps Panel */}
            <div className="bg-slate-900/40 border border-slate-900/90 rounded-xl p-4 text-[11.5px] text-slate-400 leading-relaxed space-y-2 font-mono">
              <span className="text-slate-300 font-bold block uppercase tracking-wider text-[10px] mb-1 text-indigo-400">
                Core Indicator Taxonomy Reference
              </span>
              <p>
                Our AI-guided extraction engine identifies indicators using dual-layer heuristic evaluation and regularized entity classification. Specifically, it parses:
              </p>
              <div className="grid grid-cols-2 gap-1.5 text-[10.5px] text-slate-300 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400"></span>
                  IPv4 / IPv6 Nodes
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  Active Domains
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                  File Hashes (SHA/MD5)
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                  CVE Vulnerabilities
                </div>
              </div>
            </div>

          </div>

          {/* Right Column = Results panel (span 7) */}
          <div className="lg:col-span-7 space-y-4">
            
            {isScanning ? (
              /* Forensics analytical analyzer loader screen */
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-12 text-center flex flex-col items-center justify-center gap-4 h-[590px]">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                  <Shield className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h3 className="text-sm font-semibold tracking-wide text-white uppercase font-mono">
                    Compiling Forensic Metadata
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-mono">
                    Tokenizing logs, running vulnerability correlation algorithms, resolving target indicators of compromise...
                  </p>
                </div>
                <div className="text-[10px] text-slate-500 bg-slate-950/80 px-3 py-1 rounded border border-slate-900 font-mono mt-2">
                  Invoking: AI Agent Model / gemini-3.5-flash
                </div>
              </div>
            ) : scanResult ? (
              /* Forensics Result Dashboard View */
              <div className="space-y-4 h-[590px] flex flex-col select-all-container">
                
                {/* Score & Summary Grid banner */}
                <div className={`p-4 md:p-5 rounded-xl border ${scoreStats?.bg} ${scoreStats?.border} flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shrink-0`}>
                  <div className="flex items-center gap-4.5">
                    {/* Ring score dial marker view */}
                    <div className="relative flex items-center justify-center h-16 w-16 shrink-0 bg-slate-950 rounded-full border border-slate-800/60 shadow-inner">
                      {/* SVG Gauge view */}
                      <svg className="absolute w-full h-full transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="26"
                          stroke="rgba(148, 163, 184, 0.08)"
                          strokeWidth="4"
                          fill="transparent"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="26"
                          stroke={scanResult.riskScore >= 75 ? "#f87171" : scanResult.riskScore >= 50 ? "#fb923c" : scanResult.riskScore >= 25 ? "#fbbf24" : "#60a5fa"}
                          strokeWidth="4.5"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 26}
                          strokeDashoffset={2 * Math.PI * 26 * (1 - scanResult.riskScore / 100)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="text-sm font-bold font-mono tracking-tighter text-white">
                        {scanResult.riskScore}
                        <span className="text-[10px] text-slate-500 font-normal">%</span>
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full tracking-wider uppercase border ${getSeverityBadgeClass(scanResult.threatLevel)}`}>
                          {scanResult.threatLevel} THREAT RISK
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Parsed {scanResult.indicators.length} indicator(s)
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 font-semibold mt-1 font-mono leading-relaxed">
                        {scanResult.summary}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
                    <button
                      onClick={downloadJsonReport}
                      className="flex-1 md:flex-none px-2.5 py-1.5 text-[11px] bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white rounded transition flex items-center justify-center gap-1 font-mono hover:bg-slate-850"
                    >
                      <Download className="w-3 h-3 text-indigo-400" />
                      JSON
                    </button>
                    {scanResult.indicators.length > 0 && (
                      <button
                        onClick={downloadCsvReport}
                        className="flex-1 md:flex-none px-2.5 py-1.5 text-[11px] bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white rounded transition flex items-center justify-center gap-1 font-mono hover:bg-slate-850"
                      >
                        <FileDown className="w-3 h-3 text-indigo-400" />
                        CSV LIST
                      </button>
                    )}
                  </div>
                </div>

                {/* Main dynamic interaction block */}
                <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl flex flex-col flex-1 overflow-hidden backdrop-blur-sm shadow-xl">
                  
                  {/* Result Tab Headers */}
                  <div className="flex items-center justify-between border-b border-slate-800/85 bg-slate-950/50 px-4 py-2 shrink-0">
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <button
                        onClick={() => setActiveTab("highlights")}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-mono font-bold transition-all flex items-center gap-1.5 ${
                          activeTab === "highlights"
                            ? "bg-indigo-950 border-indigo-500/40 text-indigo-300"
                            : "bg-transparent border-transparent text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <Terminal className="w-3.5 h-3.5" />
                        Source Highlights
                      </button>
                      <button
                        onClick={() => setActiveTab("table")}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-mono font-bold transition-all flex items-center gap-1.5 relative ${
                          activeTab === "table"
                            ? "bg-indigo-950 border-indigo-500/40 text-indigo-300"
                            : "bg-transparent border-transparent text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        Indicators Registry
                        {scanResult.indicators.length > 0 && (
                          <span className="text-[9px] bg-indigo-500 text-white rounded-full h-4 min-w-4 px-1 flex items-center justify-center font-bold">
                            {scanResult.indicators.length}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => setActiveTab("playbook")}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-mono font-bold transition-all flex items-center gap-1.5 ${
                          activeTab === "playbook"
                            ? "bg-indigo-950 border-indigo-500/40 text-indigo-300"
                            : "bg-transparent border-transparent text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Response Playbook
                      </button>
                    </div>

                    <div className="hidden sm:block text-[10px] text-slate-400 font-mono bg-slate-900 border border-slate-800/60 px-2 py-0.5 rounded">
                      UTC: {new Date(scanResult.classificationTime).toLocaleTimeString()}
                    </div>
                  </div>

                  {/* Tab Body views */}
                  <div className="flex-1 overflow-y-auto p-4 min-h-0 bg-slate-950/20">
                    
                    {/* View Highlights */}
                    {activeTab === "highlights" && (
                      <div className="space-y-4">
                        <div className="bg-slate-900/40 border border-slate-800/60 rounded-lg p-3 text-xs leading-relaxed text-slate-400 flex items-start gap-2 max-w-none">
                          <Info className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
                          <p className="font-mono">
                            Interactive Highlight Map: Click elements below to inspect threat context. Matching text substrings have been identified based on incident response databases.
                          </p>
                        </div>
                        <div className="bg-slate-950/80 border border-slate-900 rounded-lg p-4 max-h-[360px] overflow-y-auto shadow-inner relative hover:border-slate-800 transition">
                          <button
                            onClick={() => copyToClipboard(scanResult.rawText)}
                            className="absolute right-3 top-3 p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                            title="Copy complete raw log text"
                          >
                            {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          {renderHighlightedText()}
                        </div>

                        {/* Interactive IOC inspector */}
                        {selectedIocDetails ? (
                          <div className={`border-l-2 p-3 rounded-r-lg bg-slate-900/80 border-slate-800 shadow-md transition-all ${
                            selectedIocDetails.severity === "CRITICAL" || selectedIocDetails.severity === "HIGH" 
                              ? "border-l-red-500 bg-red-955/20" 
                              : "border-l-indigo-500 bg-indigo-955/20"
                          }`}>
                            <div className="flex justify-between items-start gap-2">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-white text-xs font-mono font-bold">
                                    [{selectedIocDetails.type}] {selectedIocDetails.value}
                                  </span>
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${getSeverityBadgeClass(selectedIocDetails.severity)}`}>
                                    {selectedIocDetails.severity}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 border border-slate-800 rounded">
                                    Conf: {selectedIocDetails.confidence}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-300 font-mono mt-1 leading-relaxed">
                                  {selectedIocDetails.description}
                                </p>
                              </div>
                              <button
                                onClick={() => copyToClipboard(selectedIocDetails.value, selectedIocDetails.id)}
                                className="px-2 py-1 bg-slate-950 hover:bg-slate-850 text-[10px] rounded border border-slate-800 text-slate-400 hover:text-white font-mono flex items-center gap-1 shrink-0"
                              >
                                {copiedIocId === selectedIocId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                Copy
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4 border border-dashed border-slate-800/85 rounded-lg text-[11px] text-indigo-400/80 bg-slate-950/20 font-mono">
                            💡 ProTip: Click highlighted threat variables in the text to view deep forensic context here.
                          </div>
                        )}
                      </div>
                    )}

                    {/* View Indicators Registry Table */}
                    {activeTab === "table" && (
                      <div className="space-y-3.5">
                        {/* Filters list for registry database */}
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-850/80 flex flex-col sm:flex-row gap-3">
                          <div className="relative flex-1">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-550" />
                            <input
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 pl-8 text-xs font-mono placeholder-slate-650 text-white focus:outline-none focus:border-indigo-500"
                              placeholder="Fuzzy search matching registry (e.g. Cobalt, IPv4)..."
                              value={searchFilter}
                              onChange={(e) => setSearchFilter(e.target.value)}
                            />
                          </div>

                          <div className="flex gap-2">
                            <select
                              value={severityFilter}
                              onChange={(e) => setSeverityFilter(e.target.value)}
                              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-300 focus:outline-none"
                            >
                              <option value="ALL">All Severities</option>
                              <option value="CRITICAL">Critical</option>
                              <option value="HIGH">High</option>
                              <option value="MEDIUM">Medium</option>
                              <option value="LOW">Low</option>
                              <option value="INFORMATIONAL">Informational</option>
                              <option value="SAFE">Safe</option>
                            </select>

                            <select
                              value={typeFilter}
                              onChange={(e) => setTypeFilter(e.target.value)}
                              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-300 focus:outline-none"
                            >
                              <option value="ALL">All Types</option>
                              <option value="IP">IP Address</option>
                              <option value="HASH_MD5">MD5 Hash</option>
                              <option value="HASH_SHA1">SHA1 Hash</option>
                              <option value="HASH_SHA256">SHA256 Hash</option>
                              <option value="DOMAIN">Domains</option>
                              <option value="URL">URLs</option>
                              <option value="EMAIL">Emails</option>
                              <option value="FILENAME">Filename</option>
                              <option value="CVE">CVEs</option>
                              <option value="OTHER">Other</option>
                            </select>
                          </div>
                        </div>

                        {/* actual table container registry */}
                        {filteredIndicators.length === 0 ? (
                          <div className="text-center py-12 text-xs text-slate-500 font-mono border border-dashed border-slate-850/80 rounded-lg">
                            No indicators in registry match your query filters.
                          </div>
                        ) : (
                          <div className="border border-slate-850 rounded-lg overflow-x-auto bg-slate-950/80">
                            <table className="w-full text-left border-collapse font-mono text-xs">
                              <thead>
                                <tr className="border-b border-slate-850 bg-slate-900 text-slate-400 font-semibold">
                                  <th className="p-2.5">Indicator / Value</th>
                                  <th className="p-2.5">Type</th>
                                  <th className="p-2.5">Level</th>
                                  <th className="p-2.5">Context & Details</th>
                                  <th className="p-2.5 text-center">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-850">
                                {filteredIndicators.map((ioc) => (
                                  <tr 
                                    key={ioc.id} 
                                    className={`hover:bg-slate-900/60 transition ${selectedIocId === ioc.id ? "bg-indigo-950/30 font-semibold" : ""}`}
                                    onClick={() => setSelectedIocId(ioc.id)}
                                  >
                                    <td className="p-2.5 align-top max-w-[180px] break-all text-white font-semibold">
                                      {ioc.value}
                                    </td>
                                    <td className="p-2.5 align-top uppercase text-slate-400 text-[10.5px]">
                                      {ioc.type.replace("HASH_", "")}
                                    </td>
                                    <td className="p-2.5 align-top">
                                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${getSeverityBadgeClass(ioc.severity)}`}>
                                        {ioc.severity}
                                      </span>
                                    </td>
                                    <td className="p-2.5 align-top text-slate-300 text-[11px] leading-relaxed max-w-[280px]">
                                      {ioc.description}
                                      <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold">
                                        Confidence: {ioc.confidence}
                                      </div>
                                    </td>
                                    <td className="p-2.5 align-top text-center">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          copyToClipboard(ioc.value, ioc.id);
                                        }}
                                        className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded border border-slate-800 text-slate-400 hover:text-white transition inline-flex"
                                        title="Copy to clipboard"
                                      >
                                        {copiedIocId === ioc.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

                    {/* View Playbook steps checklist */}
                    {activeTab === "playbook" && (
                      <div className="space-y-4">
                        <div className="bg-slate-900/40 border border-slate-800/60 rounded-lg p-3 text-xs leading-relaxed text-slate-400 flex items-start gap-2">
                          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                          <p className="font-mono text-slate-300">
                            <strong>Custom SOP Mitigation Checklist:</strong> Execute these remediation playbooks dynamically constructed by security intelligence specifically matching extracted indicators.
                          </p>
                        </div>

                        {scanResult.playbook.length === 0 ? (
                          <div className="text-center py-12 text-xs text-slate-500 font-mono border border-dashed border-slate-850 rounded-lg bg-slate-950/20">
                            No response playbook steps required for this clean scenario.
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {scanResult.playbook.map((phaseGroup, phaseIdx) => (
                              <div key={`phase-${phaseIdx}`} className="bg-slate-950/70 border border-slate-850 rounded-lg overflow-hidden">
                                <div className="bg-slate-900 px-3 py-2 text-[11px] font-bold text-indigo-300 uppercase font-mono border-b border-slate-850 flex items-center justify-between">
                                  <span>Phase: {phaseGroup.phase}</span>
                                  <span className="text-[10px] text-slate-500">
                                    {phaseGroup.steps.filter(s => completedPlaybookSteps[s]).length} / {phaseGroup.steps.length} Completed
                                  </span>
                                </div>
                                <div className="divide-y divide-slate-850 bg-slate-955/40">
                                  {phaseGroup.steps.map((step, stepIdx) => {
                                    const isCompleted = !!completedPlaybookSteps[step];
                                    return (
                                      <div
                                        key={`step-${stepIdx}`}
                                        onClick={() => toggleStep(step)}
                                        className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-slate-900/40 transition select-none ${
                                          isCompleted ? "bg-slate-900/10" : ""
                                        }`}
                                      >
                                        <button className="text-slate-400 mt-0.5 shrink-0">
                                          {isCompleted ? (
                                            <CheckSquare className="w-4 h-4 text-emerald-400" />
                                          ) : (
                                            <Square className="w-4 h-4 text-slate-600 hover:text-slate-500" />
                                          )}
                                        </button>
                                        <div className="space-y-1">
                                          <p className={`text-xs font-mono font-medium ${isCompleted ? "text-slate-500 line-through" : "text-slate-200"}`}>
                                            {step}
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                  {/* Registry footer summary actions */}
                  <div className="bg-slate-950/75 border-t border-slate-800/95 p-3 px-4 flex justify-between items-center text-[10.5px] font-mono text-slate-500 shrink-0">
                    <div>
                      Engine: Security Core | Risk Severity: {scanResult.threatLevel}
                    </div>
                    <div>
                      Total threat objects: {scanResult.indicators.length}
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              /* Idle scenario - Dashboard Quick Start Tutorial Cards */
              <div className="bg-slate-900/50 border border-slate-850 rounded-xl p-6 md:p-8 flex flex-col justify-between h-[590px] text-center select-all-container backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 transform translate-x-12 -translate-y-12 bg-indigo-500/5 blur-3xl w-72 h-72 rounded-full pointer-events-none" />

                <div className="my-auto space-y-6 max-w-md mx-auto">
                  <div className="mx-auto w-14 h-14 bg-indigo-950/80 rounded-full border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-lg">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-base font-bold font-mono text-white tracking-wide uppercase">
                      Indicators of Compromise Analyzer
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed font-mono">
                      No logs or texts have been scanned yet during this workflow session. Choose one of our predefined security logs on the left sidebar, or paste your customized reports to begin extraction analysis.
                    </p>
                  </div>

                  {/* Grid taxonomy widgets */}
                  <div className="grid grid-cols-2 gap-3 text-left font-mono">
                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-900/80">
                      <div className="text-indigo-400 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Terminal className="w-3.5 h-3.5" /> IP & Host Extraction
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Identify DNS domains, C2 IPs, or malicious email addresses automatically.
                      </p>
                    </div>
                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-900/80">
                      <div className="text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5" /> Hashes & Binary IDs
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Extract and tag MD5, SHA-1, SHA-256 for checking in threat intel registers.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-[10.5px] text-slate-550 border-t border-slate-850 pt-4 font-mono">
                  💡 Tips: After running a scan, you will get a high-fidelity mitigation playbook and are able to download complete results as JSON for Splunk, Sentinel, or elastic correlation ingestion.
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Persistent global small footer status display bar */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 text-slate-500 font-mono text-[10px] py-4 mt-12 relative z-10 select-none">
        <div className="max-w-[1450px] mx-auto px-4 md:px-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>
            &copy; 2026 Indicators of Compromise System. SecOps Forensics Pipeline.
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              Core: Gemini-3.5-Flash
            </span>
            <span className="text-slate-800">|</span>
            <span>Version 1.2.0 (Build 59281)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
