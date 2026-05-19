# MockAI - AI Mock Interview Platform

This is a full-stack AI Mock Interview application built with React, Node.js (Express), and Firebase. It uses Vapi.ai for real-time voice interactions and Gemini AI for detailed feedback.

## Features
- **Voice Interviews**: Realistic conversation with a low-latency AI interviewer.
- **AI Feedback**: Detailed performance analysis and scoring using Gemini 3 Flash.
- **Admin Panel**: Full control over system prompts, job roles, and session history.
- **Secure Auth**: Firebase Authentication with Google Sign-In.
- **Modern UI**: Polished, responsive design with Tailwind CSS and Framer Motion.

## Local Setup Instructions

### 1. Prerequisites
- Node.js (v18 or higher)
- A Firebase Project (with Firestore and Google Auth enabled)
- A Vapi.ai account
- A Google AI Studio API Key

### 2. Configuration
Create a `.env` file in the root directory based on `.env.example`:
```env
GEMINI_API_KEY=your_gemini_key
VAPI_API_KEY=your_vapi_secret_key
VITE_VAPI_PUBLIC_KEY=your_vapi_public_key
VAPI_ASSISTANT_ID=your_assistant_id
```

### 3. Installation
```bash
npm install
```

### 4. Database Setup
1. Copy your Firebase Web Config into `src/lib/firebase.ts` or ensure `firebase-applet-config.json` exists.
2. Deploy the Firestore rules provided in `firestore.rules`.
3. In your Firebase console, manually set your user's `role` to `"admin"` in the `users` collection to access the Admin Panel.

### 5. Running the App
```bash
# Start development server (Frontend + Backend)
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS, shadcn/ui, motion
- **Backend**: Node.js, Express, tsx
- **Database**: Firebase Firestore
- **AI**: Google Gemini API, Vapi.ai SDK
