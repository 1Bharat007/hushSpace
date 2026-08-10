# hushSpace

[![React 19](https://img.shields.io/badge/React-19.1-61DAFB.svg?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF.svg?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-v10-FFCA28.svg?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4.1-38BDF8.svg?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

**hushSpace** is a private personal sanctuary designed for capturing diary entries, organizing photo galleries, and recording voice audio notes behind secure, user-scoped authentication.

---

## Features

- 🔐 **Private Authentication**: Secure login & signup powered by Firebase Auth.
- 📖 **Personal Diary**: Rich text entry management with real-time Firestore synchronization.
- 🖼️ **Photo Gallery**: User-scoped image upload and media management powered by Firebase Storage.
- 🎙️ **Voice Notes**: Audio recording and playback manager.
- 🛡️ **Scoped Security Rules**: Strict Firestore & Firebase Storage rule definitions enforcing `request.auth.uid` data isolation across all resources.

---

## Screenshots & Demo

*(Placeholder image links — add your actual screenshots below)*

| Diary Interface | Photo Gallery | Audio Voice Notes |
| :---: | :---: | :---: |
| ![Diary Screenshot](docs/screenshots/diary.png) | ![Gallery Screenshot](docs/screenshots/gallery.png) | ![Audio Screenshot](docs/screenshots/audio.png) |

---

## Tech Stack

- **Frontend**: React 19, React Router v6, Tailwind CSS v4, Framer Motion
- **Build Tool**: Vite 7
- **Backend & Storage**: Firebase Authentication, Cloud Firestore, Firebase Storage
- **Icons**: Lucide React

---

## Getting Started

### Prerequisites

- Node.js `^20.0.0` or higher
- Firebase Project with Email/Password Authentication, Firestore Database, and Firebase Storage enabled

### Setup & Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/1Bharat007/hushSpace.git
   cd hushSpace
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env` and fill in your Firebase credentials:
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Deploy Security Rules (Optional / Production):**
   ```bash
   firebase deploy --only firestore:rules,storage
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## License

Distributed under the MIT License. See `LICENSE` for details.
