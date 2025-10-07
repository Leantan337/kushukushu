import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import OwnerLogin from "./components/owner/OwnerLogin";
import OwnerDashboard from "./components/owner/OwnerDashboard";
import RatioConfiguration from "./components/owner/RatioConfiguration";
import ApprovalsScreen from "./components/owner/ApprovalsScreen";
import AlertsScreen from "./components/owner/AlertsScreen";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<OwnerLogin />} />
          <Route path="/dashboard" element={<OwnerDashboard />} />
          <Route path="/ratio-config" element={<RatioConfiguration />} />
          <Route path="/approvals" element={<ApprovalsScreen />} />
          <Route path="/alerts" element={<AlertsScreen />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;