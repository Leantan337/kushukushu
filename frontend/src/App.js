import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import OwnerLogin from "./components/owner/OwnerLogin";
import OwnerDashboard from "./components/owner/OwnerDashboard";
import RatioConfiguration from "./components/owner/RatioConfiguration";
import ApprovalsScreen from "./components/owner/ApprovalsScreen";
import AlertsScreen from "./components/owner/AlertsScreen";
import ReportsScreen from "./components/owner/ReportsScreen";
import UserManagementScreen from "./components/owner/UserManagementScreen";
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";
import UserManagement from "./components/admin/UserManagement";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Owner Routes (Mobile) */}
          <Route path="/" element={<OwnerLogin />} />
          <Route path="/dashboard" element={<OwnerDashboard />} />
          <Route path="/ratio-config" element={<RatioConfiguration />} />
          <Route path="/approvals" element={<ApprovalsScreen />} />
          <Route path="/alerts" element={<AlertsScreen />} />
          <Route path="/reports" element={<ReportsScreen />} />
          <Route path="/user-management" element={<UserManagementScreen />} />
          
          {/* Admin Routes (Web) */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;