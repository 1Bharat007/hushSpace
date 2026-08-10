import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import AuthModal from "./components/AuthModal";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Diary from "./pages/Diary";
import Gallery from "./pages/Gallery";
import AudioBox from "./pages/AudioBox";
import "./index.css";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen bg-brand-primary flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-brand-accent/30 border-t-brand-accent rounded-full animate-spin"></div>
    </div>
  );
  
  // Redirect logged-out user to landing page without history stack push
  if (!user) return <Navigate to="/" replace />;
  
  return <Layout>{children}</Layout>;
};

function AppContent() {
  return (
    <>
      <AuthModal />
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<Landing />} />
        
        {/* Protected Feature Routes */}
        <Route path="/home" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        
        <Route path="/diary/:entryId?" element={
          <ProtectedRoute>
            <Diary />
          </ProtectedRoute>
        } />
        
        <Route path="/gallery" element={
          <ProtectedRoute>
            <Gallery />
          </ProtectedRoute>
        } />
        
        <Route path="/audio" element={
          <ProtectedRoute>
            <AudioBox />
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;

