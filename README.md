# LearnSphere - E-learning Platform Mockup

This is a real-time e-learning platform mockup built for the hackathon. It features a student dashboard, course catalog, and a virtual classroom with real-time chat capabilities.

## Tech Stack
- **Frontend**: React, Vite, TailwindCSS
- **Backend**: Node.js, Express, Socket.io
- **Real-time**: Socket.io for chat and signaling

## Features Implemented
- **Authentication**: specialized Login page (mock).
- **Dashboard**: Track course progress, upcoming classes, and gamification stats (XP, badges).
- **Course Catalog**: Browse available courses with filtering options.
- **Virtual Classroom**: 
  - Simulated video conferencing interface.
  - Real-time chat with other participants.
  - Participant list with status indicators.

## Getting Started

### Prerequisites
- Node.js installed on your system.

### Installation
1. Install server dependencies:
   ```bash
   cd server
   npm install
   ```
2. Install client dependencies:
   ```bash
   cd client
   npm install
   ```

### Running the Application
1. Start the Backend Server:
   ```bash
   cd server
   npm run dev
   ```
   (Runs on http://localhost:5000)

2. Start the Frontend Client:
   ```bash
   cd client
   npm run dev
   ```
   (Runs on http://localhost:5173)

3. Open your browser and navigate to `http://localhost:5173`.

## Usage
- **Login**: Click "Sign In" (credentials are pre-filled).
- **Dashboard**: View your progress and stats.
- **Classroom**: Click "Classroom" in the sidebar to join a live session. Use the chat to communicate in real-time.