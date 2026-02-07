import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';

import Login from './pages/Login';

import CourseDetail from './pages/CourseDetail';
import LessonPlayer from './pages/LessonPlayer';
import Certificate from './pages/Certificate';
import AdminDashboard from './pages/admin/AdminDashboard';

import CourseList from './pages/admin/CourseList';
import CourseEditor from './pages/admin/CourseEditor';
import ReportingDashboard from './pages/admin/ReportingDashboard';
import MyCourses from './pages/MyCourses';
import Leaderboard from './pages/Leaderboard';
import Messages from './pages/Messages';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';


  // Show layout (sidebar/navbar) if not login page and not classroom (classroom has its own full layout)
  // Actually, Classroom has its own layout which includes a sidebar-like structure, so we hide the main Sidebar.
  // But wait, my Classroom component has 'pl-64' which assumes the main sidebar is present?
  // Let's check Classroom.jsx again.
  // It has `pl-64`. So it expects the Sidebar to be there.
  // But Login page shouldn't have Sidebar.

  const isLessonPage = location.pathname.includes('/learn/') || location.pathname.includes('/certificate/');
  const isAdminPage = location.pathname.startsWith('/admin');

  const showSidebar = !isLoginPage && !isLessonPage && !isAdminPage;
  const showNavbar = !isLoginPage && !isLessonPage && !isAdminPage;
  // Classroom has its own header (Navbar replacement).

  // Dynamic Title based on route
  const getTitle = () => {
    switch (location.pathname) {
      case '/dashboard': return 'Dashboard';
      case '/catalog': return 'Course Catalog';

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
            {/* Protected Learner Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/catalog" element={<ProtectedRoute><Catalog /></ProtectedRoute>} />
            <Route path="/courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/course/:id" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
            <Route path="/learn/:courseId/lesson/:lessonId" element={<ProtectedRoute><LessonPlayer /></ProtectedRoute>} />
            <Route path="/certificate/:courseId" element={<ProtectedRoute><Certificate /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/courses" element={<ProtectedRoute requiredRole="admin"><CourseList /></ProtectedRoute>} />
            <Route path="/admin/course/new" element={<ProtectedRoute requiredRole="admin"><CourseEditor /></ProtectedRoute>} />
            <Route path="/admin/course/edit/:id" element={<ProtectedRoute requiredRole="admin"><CourseEditor /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute requiredRole="admin"><ReportingDashboard /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
