# LearnSphere – Real-Time E-Learning Platform

LearnSphere is a real-time e-learning platform mockup built for a hackathon. It demonstrates a modern online learning system with live interaction, a clean user interface, and scalable architecture.

The platform includes a student dashboard, course catalog, and a virtual classroom with real-time chat powered by Socket.io.

## Live Deployment
**Production URLs**

*   **Frontend (Vercel)**: [https://odoo-sns-hack-final.vercel.app](https://odoo-sns-hack-final.vercel.app)
*   **Backend API (Render)**: [https://learnsphere-api.onrender.com](https://learnsphere-api.onrender.com)

> **Note**: The backend is hosted on Render free tier, so the first request may take a few seconds to respond.

## Tech Stack
### Frontend
*   React (Vite)
*   Tailwind CSS
*   Axios
*   Socket.io Client

### Backend
*   Node.js
*   Express.js
*   Socket.io

### Real-Time
*   WebSockets using Socket.io
*   Live classroom chat
*   Participant presence updates

## Features Implemented
### Authentication
*   Mock authentication system
*   Dedicated login page UI (demo purpose)

### Student Dashboard
*   Track course progress
*   View upcoming classes
*   Gamification stats (XP, badges)

### Course Catalog
*   Browse available courses
*   Filter and explore course details

### Virtual Classroom
*   Simulated video conferencing interface
*   Real-time chat with participants
*   Live participant list with status indicators

## Getting Started (Local Development)
### Prerequisites
*   Node.js (v18 or above)
*   npm

### Installation
1.  **Clone the Repository**
    ```bash
    git clone https://github.com/KarthikRaj07/Odoo-SNS-hack-Final.git
    cd LearnSphere
    ```
2.  **Install Backend Dependencies**
    ```bash
    cd server
    npm install
    ```
3.  **Install Frontend Dependencies**
    ```bash
    cd client
    npm install
    ```

### Running the Application Locally
1.  **Start Backend Server**
    ```bash
    cd server
    npm run dev
    ```
    *Runs on: http://localhost:5000*

2.  **Start Frontend Client**
    ```bash
    cd client
    npm run dev
    ```
    *Runs on: http://localhost:5173*

3.  **Access the Platform**
    Open your browser and navigate to: [http://localhost:5173](http://localhost:5173)

## Usage
*   Login using the mock **Sign In** button.
*   View progress and stats on the dashboard.
*   Join a classroom session and chat in real time.

## Environment Configuration (Optional)
```env
VITE_API_BASE_URL=https://learnsphere-api.onrender.com
```

## Hackathon Highlights
*   Real-time communication using Socket.io
*   Clean and responsive UI
*   Modular and scalable architecture
*   Designed for rapid extension to production systems

## Future Enhancements
*   JWT / OAuth authentication
*   Role-based access (Admin, Instructor, Student)
*   WebRTC-based live video classes
*   Database integration (PostgreSQL / MongoDB)
*   Course enrollment and payment system