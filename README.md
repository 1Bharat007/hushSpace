# hushSpace

<div align="center">

[![Version: 0.0.1](https://img.shields.io/badge/Release-v0.0.1-emerald.svg?style=for-the-badge)](https://github.com/1Bharat007/hushSpace/releases/tag/v0.0.1)
[![Tests: 100% Passing](https://img.shields.io/badge/Tests-7%2F7%20Passed-brightgreen.svg?style=for-the-badge)](https://github.com/1Bharat007/hushSpace)
[![React 19](https://img.shields.io/badge/React-19.1-61DAFB.svg?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite 7](https://img.shields.io/badge/Vite-7.1-646CFF.svg?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Web Crypto API](https://img.shields.io/badge/Cryptography-AES--GCM--256-10B981.svg?style=for-the-badge&logo=auth0)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline_First-8B5CF6.svg?style=for-the-badge)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

**An open-source, zero-knowledge encrypted personal sanctuary & mental resilience platform.**

*Designed for cognitive clarity, uninhibited emotional self-reflection, and absolute digital privacy.*

[Live Application](https://1bharat007.github.io/hushSpace/) • [Architecture](#-cryptographic-architecture) • [Core Features](#-core-features) • [Threat Model](#-security--threat-model) • [Testing](#-automated-testing)

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

- **Key Derivation**: **PBKDF2** with **100,000 iterations** of **SHA-256** and a 128-bit cryptographically random salt.
- **Envelope Encryption**: 256-bit AES-GCM Data Encryption Key (DEK) wrapped by the user's Master Key.
- **Timing Attack Resistance**: Constant-time buffer byte comparison for authentication tags.
- **Memory Sanitization**: Explicit byte buffer zeroing on session timeout (15 min), manual lock, or tab close.
- **BIP-39 Mnemonic Recovery**: 12-word human-readable recovery phrase generated from 128-bit cryptographic entropy.

---

## ✨ Core Features

### 1. ✍️ Pro Zen Journal & Rich Markdown Editor
- Live markdown formatting toolbar (<kbd>Ctrl</kbd>+<kbd>B</kbd>, <kbd>Ctrl</kbd>+<kbd>I</kbd>, <kbd>Ctrl</kbd>+<kbd>K</kbd>, <kbd>Tab</kbd>).
- **Focus Mode**: Paragraph dimming to isolate active thoughts.
- **Typewriter Scrolling**: Vertically centers active lines smoothly.
- **Live Reading Metrics**: Real-time word count, character count, and reading time.
- **5-Point Emotional Mood Selector**: Overwhelmed, Low, Calm, Clear, Serene.

### 2. 🧠 Clinical CBT Reflection Protocols
- **CBT 5-Step Thought Record**: Trigger $\rightarrow$ Automatic Thought $\rightarrow$ Distortion Check $\rightarrow$ Evidence $\rightarrow$ Balanced Reframe.
- **Somatic Gratitude Triad**: Sensory detail $\rightarrow$ Body sensation $\rightarrow$ Meaning.
- **Worry Vault**: Circle of control delineating uncontrollable noise from actionable micro-steps.
- **Evening Unwind & Morning Boundary Compass**: Psychological start/finish protocols.

### 3. 🎧 Procedural Soundscape Studio & Spatial Acoustics
- Native **Web Audio API** mathematical synthesis (0 KB external audio assets).
- **6 Generators**: Brown Noise, Gentle Rain, Ocean Waves, Campfire, Forest Sanctuary, Alpha Binaural Beats (10Hz).
- **Spatial Stereo Panning**: Move sound sources across the stereo field (L $\leftrightarrow$ C $\leftrightarrow$ R).
- **Preset Engine**: Quick-load curated atmospheres or save custom user audio mixes.

### 4. 🎙️ Voice Memo Recorder & Waveform Visualizer
- In-browser microphone recording via `MediaRecorder` (Opus/WebM with WAV fallback).
- Real-time HTML5 Canvas oscilloscope frequency visualizer.
- Seekable interactive waveform scrubber with variable speed playback (`0.75x` to `2.0x`).

### 5. 📷 Encrypted Photo Memory Vault & Privacy Sanitizer
- **EXIF & GPS Sanitizer**: Canvas pixel repainting completely strips device serials, camera models, and GPS location tags before upload.
- **WebP Compression**: Automatic 2048px scaling reducing bandwidth by ~75%.
- **Photo Lightbox**: Full-screen zoom and inspection viewer.

### 6. 💾 Offline-First Architecture & IndexedDB Sync
- Local encrypted IndexedDB cache (`hushspace_vault_db`) for **0 ms instant cold starts**.
- Background synchronization manager with optimistic offline mutation queue and exponential backoff retry.

### 7. 🎭 Enterprise Panic Shield Suite
- Instant disguise overlay activated via global <kbd>Esc</kbd> hotkey.
- **3 Realistic Environments**: VS Code TypeScript IDE, Excel Financial Model, and Cloud API Technical Docs.
- Automatic browser tab title masking.

### 8. 🌐 Data Sovereignty Suite
- 1-Click Encrypted JSON Backup dump.
- 1-Click **Obsidian & Notion** Markdown export with structured YAML frontmatter.
- Irreversible double-confirmed cloud and local account purge.

### 9. 📱 Progressive Web App (PWA) & Accessibility
- Standalone installable PWA on Windows, macOS, Android, and iOS.
- **WCAG 2.1 AAA Accessibility**: High-contrast keyboard focus rings and `prefers-reduced-motion` compliance.

---

## 🧪 Automated Testing

```bash
# Run unit & cryptographic test suite
npm test
```

All 7 test suites pass with 100% code integrity:
- `Constant-time buffer equality checks`
- `Memory buffer zeroing`
- `12-Word Mnemonic Recovery Phrase generation & validation`
- `SHA-256 Hex Hash calculations`
- `PBKDF2 (100k) & AES-GCM-256 envelope encryption round-trip`
- `Clinical CBT protocol template validation`
- `Cognitive distortion taxonomy verification`

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/1Bharat007/hushSpace.git

# Navigate into project directory
cd hushSpace

# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build
```

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
