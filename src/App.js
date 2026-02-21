import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./components/route/ProtectedRoute";
import PublicRoute from "./components/route/PublicRoute";
import Agents from "./pages/Agents";
import KnowledgeBase from "./pages/KnowledgeBase";
import PhoneNumbers from "./pages/PhoneNumbers";
import Settings from "./pages/Settings";
import LLMEditor from "./pages/LLMEditor";
import CallAnalytics from "./pages/CallAnalytics";
import "./index.css";

// Placeholder components for now

import { ToastProvider } from "./context/ToastContext";

function App() {
  return (
    <ToastProvider>
      <Router>
        <div className="antialiased text-gray-900 bg-white min-h-screen font-sans">
          <Routes>
            {/* Public Routes (Login/Signup) - Restricted if already logged in */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Route>

            {/* Protected Dashboard Routes - Restricted if not logged in */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<DashboardLayout />}>
                <Route index element={<Navigate to="/agents" replace />} />
                <Route path="agents" element={<Agents />} />
                <Route path="llms/create" element={<LLMEditor />} />
                <Route path="llms/edit/:id" element={<LLMEditor />} />
                <Route path="knowledge-base" element={<KnowledgeBase />} />
                <Route path="phone-numbers" element={<PhoneNumbers />} />
                <Route path="call-analytics" element={<CallAnalytics />} />
                {/* <Route path="settings" element={<Settings />} /> */}
              </Route>
            </Route>
          </Routes>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
