import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import Classroom from './pages/Classroom';
import Login from './pages/Login';

const App = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isClassroom = location.pathname === '/classroom';

  // Show layout (sidebar/navbar) if not login page and not classroom (classroom has its own full layout)
  // Actually, Classroom has its own layout which includes a sidebar-like structure, so we hide the main Sidebar.
  // But wait, my Classroom component has 'pl-64' which assumes the main sidebar is present?
  // Let's check Classroom.jsx again.
  // It has `pl-64`. So it expects the Sidebar to be there.
  // But Login page shouldn't have Sidebar.

  const showSidebar = !isLoginPage;
  // If Classroom needs full width, we might want to hide Sidebar, but Classroom.jsx relies on padding.
  // Let's keep Sidebar for Classroom too for consistency, unless we refactor Classroom.
  // My Classroom component has `pl-64`, so it pushes content to right. This implies Sidebar IS visible.
  // So showSidebar = !isLoginPage.

  const showNavbar = !isLoginPage && !isClassroom;
  // Classroom has its own header (Navbar replacement).

  // Dynamic Title based on route
  const getTitle = () => {
    switch (location.pathname) {
      case '/dashboard': return 'Dashboard';
      case '/catalog': return 'Course Catalog';
      case '/classroom': return 'Virtual Classroom';
      case '/messages': return 'Messages';
      case '/settings': return 'Settings';
      default: return 'LearnSphere';
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen font-sans">
      {showSidebar && <Sidebar />}
      <div className="flex-1 flex flex-col">
        {showNavbar && <Navbar title={getTitle()} />}
        <main className={`flex-1 ${!showNavbar ? '' : ''}`}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/classroom" element={<Classroom />} />
            <Route path="/courses" element={<div className="pt-24 pl-72">My Courses (Coming Soon)</div>} />
            <Route path="/messages" element={<div className="pt-24 pl-72">Messages (Coming Soon)</div>} />
            <Route path="/settings" element={<div className="pt-24 pl-72">Settings (Coming Soon)</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
