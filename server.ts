import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse body as json
  app.use(express.json({ limit: "2mb" }));

  // Lazy initialize Gemini client
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI {
    if (!aiClient) {
      const key = process.env.GEMINI_API_KEY;
      if (!key) {
        throw new Error("GEMINI_API_KEY environment variable is missing in the environment configurations.");
      }
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });
    }
    return aiClient;
  }

  // API endpoint for threat analysis
  app.post("/api/analyze", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string" || text.trim().length === 0) {
        return res.status(400).json({ error: "Input text is required for scanning." });
      }

      // Check if API key is set
      try {
        getGeminiClient();
      } catch (keyErr: any) {
        return res.status(403).json({
          error: "API Key Config Missing",
          details: keyErr.message || "Please configure GEMINI_API_KEY inside Settings > Secrets."
        });
      }

      const client = getGeminiClient();

      const systemPrompt = `You are an expert Incident Response and Threat Intelligence Analyst. Your task is to extract and analyze Indicators of Compromise (IoCs) from the provided text block (raw firewall logs, emails, security alerts, syslog, threat reports, dmarc reports, etc.).
Analyze the text fully to identify:
- Threat types: IP addresses (malicious IPv4 or IPv6), Hashes (MD5, SHA-1, SHA-256), suspicious Domains, phishing/C2 URLs, attacker/compromised Emails, malicious Filenames, CVE vulnerability references, or other suspicious objects.
- Assign a Risk Score (0-100) and an overall Threat Level (SAFE, INFORMATIONAL, LOW, MEDIUM, HIGH, CRITICAL) for the entire text.
- For each identified IoC, extract the exact "matchedText" substring from the source so the client can find it easily. 
- Provide high-fidelity, context-aware descriptions of why the indicator is flagged (e.g. what actor group, ransomware family, or malware toolkit uses it, or whether it's a known public service like Google DNS 8.8.8.8 which is safe but should be annotated as informational/safe). Identify actor references or malware strains if applicable (like Emotet, Cobalt Strike, Lazarus, Cozy Bear, Log4j, etc.).
- Generate customized Playbook Steps grouped by threat response phases (e.g., "Detection & Analysis", "Containment", "Eradication", "Recovery") containing actionable security remediation commands or procedures.

Ensure you ONLY highlight text that EXACTLY matches a substring of the input. Do not make up matching substring characters. If there are no threats, return a riskScore of 0, threatLevel as SAFE/INFORMATIONAL, and zero indicators.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            text: `Please analyze the following security text for Indicators of Compromise (IoCs):\n\n${text}`
          }
        ],
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskScore: {
                type: Type.INTEGER,
                description: "Risk Score from 0 to 100 based on threat severity, type, and quantity of IoCs found."
              },
              threatLevel: {
                type: Type.STRING,
                description: "SAFE, INFORMATIONAL, LOW, MEDIUM, HIGH, or CRITICAL"
              },
              summary: {
                type: Type.STRING,
                description: "A professional and concise summary of the forensics/threat findings, threat landscape, and estimated severity."
              },
              indicators: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: {
                      type: Type.STRING,
                      description: "IP, HASH_MD5, HASH_SHA1, HASH_SHA256, DOMAIN, URL, EMAIL, FILENAME, CVE, or OTHER"
                    },
                    value: {
                      type: Type.STRING,
                      description: "The exact threat value (e.g. '185.220.101.5', file hash, domain, cve number)"
                    },
                    confidence: {
                      type: Type.STRING,
                      description: "HIGH, MEDIUM, or LOW"
                    },
                    severity: {
                      type: Type.STRING,
                      description: "INFORMATIONAL, LOW, MEDIUM, HIGH, or CRITICAL"
                    },
                    description: {
                      type: Type.STRING,
                      description: "A specific context-aware description of the indicator (e.g. 'Tor Exit Node often used in scanning', 'Known Cobalt Strike Beacon server', 'Malicious attachment linked to phishing campaign')."
                    },
                    matchedText: {
                      type: Type.STRING,
                      description: "The exact matching substring in the raw log/text to highlight in the UI. MUST be an identical substring present in the input text."
                    }
                  },
                  required: ["type", "value", "confidence", "severity", "description", "matchedText"]
                }
              },
              playbook: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    phase: {
                      type: Type.STRING,
                      description: "E.g., isolation & containment, remediation, post-incident steps"
                    },
                    steps: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "Concrete remediation items (e.g., 'Block IP 185.220.101.5 on corporate firewalls', 'Decommission infected endpoint', 'Run MD5 hash blacklist in endpoint security tool')"
                    }
                  },
                  required: ["phase", "steps"]
                }
              }
            },
            required: ["riskScore", "threatLevel", "summary", "indicators", "playbook"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response received from the analysis model.");
      }

      const scanData = JSON.parse(responseText.trim());

      // Inject robust IDs onto indicators
      const sanitizedIndicators = (scanData.indicators || []).map((indicator: any, idx: number) => ({
        ...indicator,
        id: `ioc_${idx + 1}_${Math.random().toString(36).substring(2, 7)}`
      }));

      const finalResult = {
        rawText: text,
        riskScore: scanData.riskScore ?? 0,
        threatLevel: scanData.threatLevel ?? "SAFE",
        summary: scanData.summary ?? "No distinct threats identified in the analyzed text.",
        indicators: sanitizedIndicators,
        playbook: scanData.playbook ?? [],
        classificationTime: new Date().toISOString()
      };

      return res.json(finalResult);

    } catch (err: any) {
      console.error("Analysis route error:", err);
      return res.status(500).json({
        error: "Threat analysis failed",
        details: err.message || err.toString()
      });
    }
  });

  // Serve static assets / Vite configs
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
