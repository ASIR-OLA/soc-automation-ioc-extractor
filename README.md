# SecOps Automation: Indicators of Compromise (IoC) Analyzer & Triage Console (v1.0)

An incident response triage and threat enrichment web application designed to parse unstructured plain text, raw security telemetry, and suspicious email communications. The tool automatically extracts, categorizes, and scores Indicators of Compromise (IoCs) in real time, generating dynamic mitigation playbooks and exportable telemetry formatted for SIEM ingestion.

Engineered and prototyped using AI-assisted SecOps workflows in Google AI Studio, integrating the Gemini API on the backend with strict JSON schemas for deterministic parsing.

---

## Key Features

- **Automated Artifact Extraction:** Automatically identifies, validates, and tags network and file artifacts:
  - Cryptographic Hashes (MD5, SHA-1, SHA-256)
  - Network Entities (Malicious IPv4/IPv6, C2 domains, phishing URLs)
  - Common Vulnerabilities and Exposures (e.g., CVE-2021-44228 / Log4j)
- **Dynamic Threat Scoring:** Computes risk percentage and severity levels based on extracted indicator confidence.
- **Interactive Log Highlighting:** Directly maps identified threats back onto the raw console text with color-coded severity badges to accelerate forensic reviews.
- **Remediation Playbooks:** Generates structured Standard Operating Procedures (SOPs) organized by incident response phases (Isolation, Containment, Eradication).
- **SIEM Interoperability:** Exports telemetry data into formatted JSON and CSV ready for correlation in tools like Splunk, Microsoft Sentinel, or Elastic SIEM.

---

## Technical Architecture

- **Frontend:** React, TypeScript, Vite, Tailwind CSS (High-contrast dark mode tailored for SecOps environments).
- **Backend:** Node.js, Express.
- **AI / LLM Engine:** Google @google/genai SDK running Gemini Flash with structured JSON schema outputs to prevent hallucination and guarantee deterministic parsing.
- **Live Prototype:** [View App on Google AI Studio](https://ai.studio/apps/7835e2fb-e2bf-42e6-a045-0e50550cb902)

---

## Project Structure

```text
├── src/
│   ├── App.tsx         # Main interactive SecOps console & state management
│   ├── presetLogs.ts   # Pre-configured forensic scenarios (Phishing, Exploit logs)
│   ├── types.ts        # Threat telemetry and IoC data contracts
│   └── index.css       # Console theme styling
├── server.ts           # Express server with Google GenAI API integration
├── metadata.json       # Application capability manifest
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```
## Incident Scenarios Included
The application includes built-in test templates for rapid triage evaluation:

1. **Phishing Email Analysis:** Deconstructs spoofed Microsoft 365 credential-harvesting messages.

2. **Web Application Attack:** Evaluates Apache/Nginx web access logs containing injection vectors (Log4Shell / SQLi).

3. **Malware Forensic Journal:** Extracts C2 callbacks, registry manipulation artifacts, and staging directories from ransomware executions.

---

## Local Setup

1. **Clone the repository:**
   `git clone https://github.com/ASIR-OLA/soc-automation-ioc-extractor.git`
   `cd soc-automation-ioc-extractor`

2. **Install dependencies:**
   `npm install`

3. **Configure Environment:**
   Create a `.env.local` file and add your Gemini API key:
   `GEMINI_API_KEY=your_api_key_here`

4. **Run the development server:**
   `npm run dev`

---

## Author

**Carmen Ruiz**  
*Cybersecurity & SOC Operations Portfolio*  
GitHub: [@ASIR-OLA](https://github.com/ASIR-OLA)
