# hushSpace

<div align="center">

[![React 19](https://img.shields.io/badge/React-19.1-61DAFB.svg?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite 7](https://img.shields.io/badge/Vite-7.1-646CFF.svg?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Web Crypto API](https://img.shields.io/badge/Cryptography-AES--GCM--256-10B981.svg?style=for-the-badge&logo=auth0)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
[![Web Audio API](https://img.shields.io/badge/Audio-Web_Audio_API-8B5CF6.svg?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4.1-38BDF8.svg?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

**An open-source, zero-knowledge encrypted personal sanctuary & mental resilience platform.**

*Designed for cognitive clarity, uninhibited emotional self-reflection, and absolute digital privacy.*

[Live Demo](https://1bharat007.github.io/hushSpace/) • [Architecture](#-cryptographic-architecture) • [Features](#-core-features) • [Threat Model](#-security--threat-model) • [Getting Started](#-getting-started)

</div>

---

## 📖 The Problem & Vision

**Over 970 million people** worldwide experience mental health challenges. While clinical studies consistently demonstrate that expressive writing and Cognitive Behavioral Therapy (CBT) journaling dampen amygdala threat responses and significantly reduce anxiety, **74% of digital journal users self-censor** due to privacy anxiety.

Traditional cloud note apps store vulnerable thoughts in plaintext databases susceptible to employee snooping, data breaches, and third-party tracking.

**hushSpace** solves this with a mathematically guaranteed zero-knowledge architecture:

> **Core Philosophy**: Privacy is not a policy promise; it is a mathematical property enforced by client-side cryptography.

---

## 🔐 Cryptographic Architecture

All encryption and decryption happens exclusively inside the user's browser via the native **W3C Web Crypto API** (`window.crypto.subtle`). 

```
                               ┌─────────────────────────────────────────┐
                               │           hushSpace Browser Client      │
                               │                                         │
                               │  User Passphrase                        │
                               │       │                                 │
                               │       ▼ PBKDF2 (100,000 Iterations)     │
                               │  Master Key (In Memory Only)            │
                               │       │                                 │
                               │       ▼ Unwrap / Wrap                   │
                               │  Data Encryption Key (DEK - AES-256)    │
                               │       │                                 │
                               │       ▼ AES-GCM-256 (IV + Tag)          │
                               │  Decrypted Entry / Encrypted Payload    │
                               └────────────────────┬────────────────────┘
                                                    │
                                      Ciphertext Blob + Salt + IVs Only
                                                    │
                                                    ▼
                               ┌─────────────────────────────────────────┐
                               │          Cloud Firestore / Storage      │
                               │        (Zero Plaintext Knowledge)       │
                               └─────────────────────────────────────────┘
```

### Cryptographic Primitives:
- **Key Derivation**: `PBKDF2` with `SHA-256` and **100,000 iterations** using a cryptographically random 16-byte salt per user.
- **Envelope Encryption**: Generates a random 256-bit Data Encryption Key (DEK). The DEK is wrapped by the Master Key using `AES-GCM-256`.
- **Content Encryption**: AES-256 in Galois/Counter Mode (`AES-GCM`) with a unique 12-byte Initialization Vector (`IV`) per record, providing both **confidentiality** and **authenticated integrity**.
- **Zero In-Cloud State**: Plaintext DEK and Master Keys are never persisted to disk or cloud; they are destroyed on session close or manual lock.

---

## ✨ Core Features

### 1. 📝 Zen Journal & CBT Guided Prompts
- **Distraction-Free Editor**: Autosaves continuously with real-time word count and reading time estimation.
- **5-Point Emotional Mood Selector**: Log emotional state (`Overwhelmed`, `Low`, `Calm`, `Clear`, `Serene`) alongside reflections.
- **Cognitive Prompts Engine**: Preloaded with evidence-based prompts (Gratitude, CBT Cognitive Reframe, Evening Unwind, Morning Intention, Brain Dump).
- **Tag Categorization**: Organize reflections with custom `#tags`.

### 2. 🎧 Procedural Ambient Soundscapes (Zero CDN)
Pure client-side audio synthesis powered by the **Web Audio API** — zero external audio files, zero network bandwidth:
- **Brown Noise**: Brownian motion algorithm with lowpass filtering for deep relaxation.
- **Gentle Rain**: Filtered pink noise combined with randomized droplet impulse synthesis.
- **Ocean Waves**: LFO-modulated tidal amplitude envelope.
- **Campfire**: Warm bass rumble paired with randomized highpass crackle spikes.
- **Forest Sanctuary**: Gentle wind whisper with scheduled harmonic bell chimes.
- **Alpha Binaural Beats (10Hz)**: Dual independent stereo carrier oscillators (200Hz left / 210Hz right) for neurological focus entrainment.
- **Multi-Track Mixer & Sleep Timer**: Independent volume sliders and automatic exponential fade-out timer (15m, 30m, 60m).

### 3. 📈 Emotional Analytics Dashboard
- **7-Day Emotional Trajectory**: Visual flow chart tracking mood shifts over time.
- **Consistency Heatmap**: 30-day activity map visualizing daily mental decompression habits.
- **Streak & Milestones**: Active reflection streak tracking with milestone badges.
- **Theme Frequency Analysis**: Discover recurring topics through tag analytics.

### 4. 🛡️ Panic Shield (Instant Discretion Mask)
- **Emergency Mask**: Press <kbd>Esc</kbd> anywhere or tap the shield button to immediately replace the viewport with an authentic, interactive VS Code editor.
- Press <kbd>Esc</kbd> again to seamlessly return to your sanctuary.

### 5. 🖼️ Private Memory Vault & Voice Box
- **Scoped Image Vault**: User-isolated image gallery secured via strict Firebase Storage security rules.
- **Voice Memo Box**: In-browser audio recording and playback manager.

### 6. 💾 Data Sovereignty
- **Encrypted JSON Snapshot**: 1-click export of complete raw encrypted databases.
- **Decrypted Markdown Archive**: Export all reflections as a clean `.md` notebook compatible with Obsidian, Logseq, and Notion.
- **Irreversible Purge**: Complete account and data deletion from all cloud servers.

---

## 🛡️ Security & Threat Model

| Threat Vector | Mitigation Strategy |
| :--- | :--- |
| **Cloud Database Compromise** | Server stores only AES-GCM ciphertext blobs. Unreadable without user passphrase. |
| **Man-in-the-Middle (MITM)** | Data is encrypted *before* network transmission via TLS + Web Crypto. |
| **Shoulder Surfing in Public** | <kbd>Esc</kbd> key triggers instant Panic Shield code editor disguise. |
| **Memory Extraction on Device** | Keys live strictly in transient JavaScript heap memory and are wiped on logout/tab close. |
| **Passphrase Loss** | 24-character cryptographic recovery key generated once during initial vault initialization. |

---

## 🚀 Getting Started

### Prerequisites
- Node.js `^20.0.0` or higher
- npm `^10.0.0` or higher
- A Firebase project with Authentication (Email/Password, Google), Firestore Database, and Firebase Storage enabled.

### Local Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/1Bharat007/hushSpace.git
   cd hushSpace
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Fill in your Firebase credentials in `.env`:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📁 Repository Architecture

```
hushSpace/
├── src/
│   ├── components/
│   │   ├── AuthModal.jsx         # Firebase authentication modal
│   │   ├── DataExport.jsx        # Data sovereignty & export suite
│   │   ├── FloatingDots.jsx      # Ambient animated background
│   │   ├── Layout.jsx            # Sanctuary master layout & navigation
│   │   ├── PanicShield.jsx       # Instant VS Code disguise mask
│   │   ├── PassphraseModal.jsx   # Vault setup & unlock modal
│   │   └── SoundscapeMixer.jsx   # Web Audio procedural multi-track mixer
│   ├── context/
│   │   ├── AuthContext.jsx       # Firebase Auth state provider
│   │   └── CryptoContext.jsx     # Web Crypto AES-GCM lifecycle provider
│   ├── firebase/
│   │   └── config.js             # Firebase initialization & validation
│   ├── lib/
│   │   ├── ambientEngine.js      # Pure Web Audio synthesis engine
│   │   └── crypto.js             # Web Crypto PBKDF2 + AES-GCM engine
│   ├── pages/
│   │   ├── AudioBox.jsx          # Voice notes recorder & audio vault
│   │   ├── Diary.jsx             # Zen encrypted journal & CBT engine
│   │   ├── Gallery.jsx           # Private photo memory vault
│   │   ├── Home.jsx              # Sanctuary overview & quick check-in
│   │   ├── Landing.jsx           # Public landing page & showcase
│   │   └── MoodDashboard.jsx     # Emotional analytics & streak tracking
│   ├── App.jsx                   # Master routing & provider hierarchy
│   ├── index.css                 # Design tokens & glassmorphism system
│   └── main.jsx                  # React DOM root entry point
├── firestore.rules               # Strict Firestore UID security rules
├── storage.rules                 # Strict Firebase Storage security rules
├── vite.config.js                # Vite 7 build config with chunk optimization
└── package.json                  # Project metadata (v2.0.0)
```

---

## 📜 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more details.

---

<div align="center">
Built with deep respect for human privacy and cognitive well-being.
</div>
