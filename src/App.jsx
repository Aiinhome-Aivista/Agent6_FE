import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Landing from './components/Landing';
import Login from './components/Login';
import Register from './components/Register';
import Layout from './components/Layout';
import AdminDashboard from './pages/AdminDashboard';
import Applications from './pages/Applications';
import UserManagement from './pages/UserManagement';
import AuditLogs from './pages/AuditLogs';
import KnowledgeBase from './pages/KnowledgeBase';
import RagChat from './pages/RagChat';
import ClaimTracker from './pages/ClaimTracker';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<Layout />}>
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/cases" element={<Applications />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/audit" element={<AuditLogs />} />
            <Route path="/knowledge-base" element={<KnowledgeBase />} />
            <Route path="/rag-chat" element={<RagChat />} />
            <Route path="/manage-application" element={<Applications />} />
            <Route path="/case-queue" element={<Applications />} />
            <Route path="/claim-tracker" element={<ClaimTracker />} />

          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
