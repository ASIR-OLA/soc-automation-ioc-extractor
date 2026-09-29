export type ThreatType = 
  | "IP" 
  | "HASH_MD5" 
  | "HASH_SHA1" 
  | "HASH_SHA256" 
  | "DOMAIN" 
  | "URL" 
  | "EMAIL" 
  | "FILENAME" 
  | "CVE" 
  | "OTHER";

export type ThreatSeverity = 
  | "CRITICAL" 
  | "HIGH" 
  | "MEDIUM" 
  | "LOW" 
  | "INFORMATIONAL" 
  | "SAFE";

export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";

export interface IndicatorOfCompromise {
  id: string;
  type: ThreatType;
  value: string;
  confidence: ConfidenceLevel;
  severity: ThreatSeverity;
  description: string;
  matchedText: string; // The exact text within the raw input to highlight
}

export interface PlaybookStep {
  phase: string;
  steps: string[];
}

export interface ScanResult {
  rawText: string;
  riskScore: number; // 0 to 100
  threatLevel: ThreatSeverity;
  summary: string;
  indicators: IndicatorOfCompromise[];
  playbook: PlaybookStep[];
  classificationTime: string;
}

export interface PresetLog {
  id: string;
  title: string;
  description: string;
  icon: string;
  text: string;
}
