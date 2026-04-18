# ConsentLens 🔍

> **AI-Powered Surgical Consent Platform for Indian Hospitals**
>
> ConsentLens replaces paper consent forms with a legally verifiable, multilingual, biometric-backed digital consent workflow — enabling patients and emergency kin to provide informed consent through guided AI video education and voice signature capture.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Consent Workflows](#consent-workflows)
  - [Standard Patient Flow](#standard-patient-flow)
  - [Emergency Kin Bypass](#emergency-kin-bypass)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Running Migrations](#running-migrations)
- [Supported Languages](#supported-languages)
- [Supported Surgeries](#supported-surgeries)
- [Progressive Web App (PWA)](#progressive-web-app-pwa)
- [Deployment](#deployment)

---

## Overview

In Indian hospitals, surgical consent is still largely collected on paper — a process that is:
- **Rushed**: Patients sign without understanding risks
- **Not inclusive**: Often only in English or Hindi
- **Not auditable**: Paper forms are lost, tampered, or incomplete
- **Not accessible**: Illiterate patients cannot truly consent

**ConsentLens** solves this by providing a structured, AI-witnessed consent journey that delivers:
- Multilingual risk explanations (Hindi, Bhojpuri, Awadhi, Marathi, English)
- AI-guided video education per surgical risk
- Biometric video/voice signature recorded via WebRTC
- Cryptographic fingerprinting (C2PA metadata standard)
- PDF consent certificates with SHA-256 audit hashes
- Emergency bypass pathway for unconscious patients via kin consent

---

## Key Features

| Feature | Description |
|---|---|
| 🎥 **AI Video Education** | Gemini 2.5 Flash translates surgical risks into patient-friendly regional language bullet points |
| 🧠 **Interactive Risk Education** | Step-by-step video + acknowledgment for each of 5 surgical risks per procedure |
| 🎤 **Biometric Voice Signature** | Patient/Kin records a legally binding verbal consent statement on camera |
| 🔐 **C2PA Cryptographic Signing** | SHA-256 hash fingerprint on every recorded biometric, audit-trail ready |
| 🚨 **Emergency Kin Bypass** | When a patient is unable to consent (unconscious/critical), registered kin can consent immediately |
| 📄 **Auto PDF Certificate** | Instant downloadable PDF with patient/kin details, surgery info, and biometric hash |
| 🌐 **Multilingual** | Full UI and consent prompts in 5+ languages with Gemini-powered translation fallback |
| 📊 **Doctor Dashboard** | Real-time session tracking, approval, and kin consent badge visibility |
| 💬 **AI Chat (Dr. Sharma)** | Patients can ask follow-up questions post-education via conversational Gemini AI |
| 📵 **Offline-Resilient** | PWA-capable with IndexedDB write queue and background sync for low-connectivity Indian hospital settings |
| 🏥 **50+ Surgeries** | Covers General, Gynae, Orthopedic, Cardiac, Neuro, ENT, Ophthal, Urology, Oncology, Pediatric, Dental, and Plastic surgery categories |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, Vanilla CSS, Lucide Icons |
| **AI / LLM** | Google Gemini 2.5 Flash (risk translation + patient chat) |
| **Video Synthesis** | D-ID API (AI doctor avatar video generation) |
| **Voice / TTS** | ElevenLabs (multilingual audio generation) |
| **Database** | Supabase (Postgres via PostgREST) |
| **Storage** | Supabase Storage (biometric recordings, PDFs) |
| **PDF Generation** | `pdf-lib` (client-side, no server dependency) |
| **Biometrics** | WebRTC MediaRecorder API (video/webm) |
| **Push Notifications** | Web Push API + Notification API |
| **PWA** | next-pwa / custom service worker |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   DOCTOR PORTAL                  │
│  /consent/new → Submit session → API → Supabase │
└───────────────────────┬─────────────────────────┘
                        │ session_id (UUID)
                        ▼
┌─────────────────────────────────────────────────┐
│              PATIENT EDUCATION FLOW              │
│  /p/[session_id]                                 │
│  Intro → Risk 1 → Risk 2 → ... → Risk 5 → Done  │
│  Each step: AI Video + "I Understand" / Replay   │
└───────────────────────┬─────────────────────────┘
                        │ navigates to /complete
                        ▼
┌─────────────────────────────────────────────────┐
│             BIOMETRIC CONSENT STEP               │
│  /p/[session_id]/complete                        │
│  VoiceConfirmation → WebRTC → SHA-256 Hash       │
│  PDF auto-generated → Supabase upload            │
└───────────────────────┬─────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│               DOCTOR DASHBOARD                   │
│  /dashboard                                      │
│  Session cards, status, "Approve" button         │
│  Kin Consent badge for emergency sessions        │
└─────────────────────────────────────────────────┘
```

---

## Consent Workflows

### Standard Patient Flow

1. **Doctor** logs into `/consent/new` and fills patient details (Name, ID, Bed, Surgery, Language, Kin Phone)
2. **System** calls `POST /api/consent/generate` → creates session in Supabase → triggers D-ID video generation
3. **Link shared** with patient (SMS/QR) → Patient opens `/p/[session_id]`
4. **Patient watches** 5 risk education videos, tapping "I Understand" after each
5. **Patient navigates** to `/p/[session_id]/complete` for biometric identity verification
6. **Patient records** their verbal consent statement on camera (WebRTC)
7. **Recording uploaded** → SHA-256 hash computed → PDF certificate generated
8. **Doctor approves** session from Dashboard → Status becomes `approved`

### Emergency Kin Bypass

1. **Doctor enables** Emergency Mode toggle on `/consent/new`
2. **Doctor enters** emergency reason + Kin Name/Phone/Relation (Patient ID/Bed not required)
3. **System calls** `POST /api/emergency/kin-consent` → session created with `consent_actor = 'kin'`, status `ready`
4. **System immediately shows** the Emergency Consent Summary (patient, surgery, justification)
5. **Kin records** their verbal consent on camera — *no education videos required (fast-track)*
6. **PDF auto-downloads** the moment biometric is submitted — no extra clicks
7. **Dashboard shows** a red "KIN CONSENT" badge on the session card

> ⚡ The Emergency flow is designed to complete in **under 15 seconds** from session creation to downloaded legal PDF.

---

## Project Structure

```
consentlens/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── page.jsx                  # Landing page (marketing + pricing)
│   │   ├── dashboard/page.jsx        # Doctor dashboard (session management)
│   │   ├── consent/new/page.jsx      # Doctor portal: create new consent session
│   │   ├── doctor/session/[id]/      # Emergency session dedicated view
│   │   ├── p/[session_id]/           # Patient education flow
│   │   │   └── complete/             # Biometric consent capture step
│   │   ├── verify/                   # QR-based session verification
│   │   └── api/
│   │       ├── consent/
│   │       │   ├── generate/         # POST: Start standard session
│   │       │   ├── session/[id]/     # GET: Poll session status
│   │       │   ├── response/         # POST: Log patient's risk acknowledgement
│   │       │   ├── approve/          # POST: Doctor approves completed session
│   │       │   ├── voice-save/       # POST: Upload biometric recording
│   │       │   ├── complete/         # POST: Mark session completed
│   │       │   └── pdf/[id]/         # GET: (stub) PDF retrieval
│   │       ├── emergency/
│   │       │   └── kin-consent/      # POST: Create emergency kin session
│   │       ├── agent/chat/           # POST: AI chat (Dr. Sharma)
│   │       └── chat/                 # POST: Gemini chat passthrough
│   │
│   ├── components/
│   │   ├── landing/                  # Landing page section components
│   │   └── ui/
│   │       ├── PatientInteractionFlow.jsx  # Master orchestrator: VoiceBot → VoiceConfirmation → PDF
│   │       ├── VoiceBot.jsx                # AI doctor greeting + conversation (pre-signature)
│   │       ├── VoiceConfirmation.jsx       # WebRTC biometric capture + C2PA upload
│   │       ├── VideoPlayer.jsx             # Adaptive video player with demo fallback
│   │       ├── ChatInterface.jsx           # AI patient chat UI
│   │       ├── CameraModal.jsx             # Face capture modal
│   │       ├── NurseBanner.jsx             # Nurse notification banner
│   │       ├── ProgressBar.jsx             # Education flow progress
│   │       ├── PillButton.jsx              # Primary CTA button component
│   │       └── Toast.jsx                   # Notification toast
│   │
│   └── lib/
│       ├── supabase.js           # Supabase client (anon) + supabaseAdmin (service role)
│       ├── gemini.js             # Gemini AI: risk translation + patient chat
│       ├── did.js                # D-ID API: avatar video generation
│       ├── elevenlabs.js         # ElevenLabs: TTS audio synthesis
│       ├── surgeryConfigs.js     # Static surgical risk configs (vetted clinical content)
│       ├── apiPost.js            # Offline-resilient fetch with IndexedDB queue
│       ├── idb.js                # IndexedDB helper for write queue
│       └── notify.js             # Web Push notification helper
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_init.sql          # Base schema: surgeries, consent_sessions, comprehension_log
│   │   └── 002_emergency_kin.sql # Emergency columns: consent_actor, emergency_reason, kin_*
│   └── seed.sql                  # Sample surgery data for local development
│
├── public/
│   ├── logo-horizontal.svg       # ConsentLens branded logo (navbar)
│   ├── logo-phone.svg            # Dark mode logo (3D phone mockup)
│   └── videos/                   # Placeholder/demo educational videos
│
└── scratch/
    └── seed-surgeries.js         # Node.js script to bulk-insert 50+ surgeries into Supabase
```

---

## Database Schema

### `consent_sessions`

| Column | Type | Description |
|---|---|---|
| `session_id` | `uuid` | Primary key, auto-generated |
| `patient_id` | `varchar` | Hospital patient ID |
| `patient_name` | `text` | Full name of the patient |
| `bed_number` | `varchar` | Ward bed assignment |
| `surgery_id` | `varchar` | Foreign key → `surgeries.id` |
| `doctor_id` | `varchar` | ID of the creating doctor |
| `language` | `varchar(30)` | Consent language (e.g., `Hindi`) |
| `video_url` | `text` | D-ID generated explanation video URL |
| `pdf_url` | `text` | Uploaded consent certificate URL |
| `c2pa_hash` | `text` | SHA-256 fingerprint of biometric recording |
| `comprehension_score` | `integer` | Count of acknowledged risks (max 5) |
| `status` | `consent_status` | `generating` → `ready` → `completed` → `approved` |
| `consent_actor` | `consent_actor_type` | `patient` (default) or `kin` (emergency) |
| `emergency_reason` | `text` | Reason patient cannot consent (e.g., "Unconscious") |
| `kin_name` | `text` | Full name of consenting kin |
| `kin_phone` | `text` | Kin contact number |
| `kin_relation` | `text` | Relationship to patient (e.g., "Son", "Spouse") |
| `created_at` | `timestamp` | Session creation time |
| `completed_at` | `timestamp` | Time consent was submitted |
| `approved_at` | `timestamp` | Time doctor approved the session |

### `comprehension_log`

| Column | Type | Description |
|---|---|---|
| `id` | `serial` | Auto-increment primary key |
| `session_id` | `uuid` | Foreign key → `consent_sessions` |
| `risk_index` | `integer` | Which risk (1–5) this log refers to |
| `response` | `varchar` | `understood`, `replay_requested`, or `nurse_flagged` |
| `timestamp` | `timestamp` | When the response was logged |
| `replay_count` | `integer` | How many times this risk was replayed |

---

## API Reference

### `POST /api/consent/generate`
Creates a standard patient consent session and triggers AI video generation.

**Request Body:**
```json
{
  "surgery_id": "knee_replace",
  "patient_id": "AIIMS-1234",
  "patient_name": "Ramesh Kumar",
  "bed_number": "B-12",
  "language": "Hindi",
  "kin_phone": "+91 9876543210",
  "doctor_id": "DR-SHARMA-001"
}
```
**Response:** `{ session_id: "uuid", status: "generating" }`

---

### `POST /api/emergency/kin-consent`
Creates an emergency session bypassing standard video generation. Session status is immediately `ready`.

**Request Body:**
```json
{
  "surgery_id": "trauma_lap",
  "patient_name": "Sunita Devi",
  "language": "Hindi",
  "doctor_id": "DR-SHARMA-001",
  "emergency_reason": "Unconscious, critical abdominal bleed",
  "kin_name": "Amit Kumar",
  "kin_phone": "+91 9988776655",
  "kin_relation": "Son"
}
```
**Response:** `{ session_id: "uuid", status: "ready" }`

---

### `GET /api/consent/session/[session_id]`
Polls session status. Used by the doctor portal loading screen.

**Response:** `{ session: { status, video_url, ... } }`

---

### `POST /api/consent/response`
Logs a patient's risk acknowledgement (called after each "I Understand" tap).

**Request Body:**
```json
{
  "session_id": "uuid",
  "risk_index": 2,
  "response_type": "understood",
  "timestamp": "2026-04-18T04:00:00Z"
}
```

---

### `POST /api/consent/voice-save`
Uploads the WebRTC biometric recording and returns the SHA-256 C2PA hash.

**Request:** `multipart/form-data` with `audio` (Blob), `session_id`, `type`

**Response:** `{ hash: "sha256...", url: "https://..." }`

---

### `POST /api/consent/approve`
Doctor approves a completed session. Updates status to `approved`.

**Request Body:** `{ session_id: "uuid" }`

---

### `POST /api/agent/chat`
Conversational Gemini AI endpoint for patient follow-up questions.

**Request Body:** `{ message: "...", context: { surgeryName, risks, benefits }, language: "Hindi" }`

---

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# D-ID (Avatar Video Generation)
DID_API_KEY=your-did-api-key

# ElevenLabs (Text-to-Speech)
ELEVENLABS_API_KEY=your-elevenlabs-api-key
ELEVENLABS_VOICE_ID=your-voice-id

# Web Push Notifications (optional)
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- API keys for Gemini, D-ID, and ElevenLabs

### 1. Clone and Install

```bash
git clone https://github.com/your-org/consentlens.git
cd consentlens
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
# Fill in your keys (see Environment Variables section above)
```

### 3. Run Database Migrations

See [Running Migrations](#running-migrations) below.

### 4. Seed Surgery Data (optional)

```bash
node scratch/seed-surgeries.js
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Running Migrations

The database schema is managed via SQL files in `supabase/migrations/`. Run them in order in the **Supabase SQL Editor** (Dashboard → SQL Editor → New Query):

**Step 1 — Base Schema:**
```bash
# Copy and run: supabase/migrations/001_init.sql
```

**Step 2 — Emergency Kin Columns:**
```bash
# Copy and run: supabase/migrations/002_emergency_kin.sql
```

```sql
-- 002_emergency_kin.sql content:
CREATE TYPE consent_actor_type AS ENUM ('patient', 'kin');

ALTER TABLE consent_sessions 
ADD COLUMN consent_actor consent_actor_type DEFAULT 'patient',
ADD COLUMN emergency_reason text,
ADD COLUMN kin_name text,
ADD COLUMN kin_phone text,
ADD COLUMN kin_relation text;
```

> **After running migrations**: If you see schema cache errors, go to **Supabase Dashboard → Settings → API → Reload PostgREST Schema**.

---

## Supported Languages

| Language | Consent Prompts | AI Risk Translation | UI |
|---|---|---|---|
| Hindi | ✅ | ✅ | ✅ |
| Bhojpuri | ✅ | ✅ | ✅ |
| Awadhi | ✅ | ✅ | ✅ |
| Marathi | ✅ | ✅ | ✅ |
| English | ✅ | ✅ | ✅ |
| Tamil | 🔜 | 🔜 | — |
| Kannada | 🔜 | 🔜 | — |
| Gujarati | 🔜 | 🔜 | — |
| Punjabi | 🔜 | 🔜 | — |

---

## Supported Surgeries

ConsentLens ships with **55+ pre-configured high-volume surgeries** across Indian hospitals:

| Category | Examples |
|---|---|
| **General Surgery** | Laparoscopic Appendectomy, Cholecystectomy, Hernia Repair, Piles, Thyroidectomy |
| **Obstetrics & Gynae** | C-Section (LSCS), Normal Delivery, Hysterectomy, Tubectomy, MTP, Ectopic |
| **Orthopedic** | Total Knee Replacement, Total Hip Replacement, Fracture Fixation, ACL Repair, Spine Surgery |
| **Cardiac** | Angiography, Angioplasty + Stent, CABG (Bypass), Pacemaker, Valve Replacement |
| **Neurosurgery** | Craniotomy, VP Shunt, Epilepsy Surgery, Brain Biopsy, Spine Tumor Removal |
| **ENT** | Tonsillectomy, Septoplasty, FESS (Sinus), Mastoidectomy, Ear Drum Surgery |
| **Ophthalmology** | Cataract, Glaucoma, LASIK, Retinal Detachment, Squint Correction |
| **Urology** | PCNL (Kidney Stone), TURP (Prostate), Nephrectomy, Varicocele, Cystoscopy |
| **Oncology** | Mastectomy, Lumpectomy, Colon Cancer Surgery, Oral Cancer Surgery |
| **Pediatric** | Cleft Lip, Congenital Hernia, Undescended Testis, PDA Ligation |
| **Dental** | Root Canal (RCT), Tooth Extraction, Jaw Fracture, Wisdom Tooth Removal |
| **Plastic Surgery** | Burn Contracture Release, Skin Graft, Scar Revision, Rhinoplasty |
| **Emergency** | Trauma Laparotomy, Emergency Craniotomy, Emergency C-Section, Vascular Repair |

---

## Progressive Web App (PWA)

ConsentLens is designed to function in low-connectivity Indian hospital environments:

- **Offline write queue**: API calls made without internet are stored in IndexedDB and retried when connectivity returns
- **Background sync**: Failed consent responses are auto-replayed
- **Installable**: Can be added to homescreen on Android/iOS for native-like use by nursing staff
- **Caching**: Static assets and pages cached for offline viewing

---

## Deployment

### Deploy on Vercel (Recommended)

```bash
npm install -g vercel
vercel --prod
```

Add all environment variables in the Vercel project settings under **Environment Variables**.

### Docker / Self-Hosted

```bash
npm run build
npm start
```

Set `NODE_ENV=production` and all required environment variables in your hosting environment.

---

## License

This project is proprietary software developed for the Indian healthcare sector. All rights reserved.

---

## Contact

Built with ❤️ for Indian healthcare — making informed consent accessible to every patient, regardless of language or literacy.
