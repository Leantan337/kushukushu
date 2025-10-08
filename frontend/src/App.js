import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UnifiedLogin from "./components/UnifiedLogin";
import OwnerDashboard from "./components/owner/OwnerDashboard";
import RatioConfiguration from "./components/owner/RatioConfiguration";
import ApprovalsScreen from "./components/owner/ApprovalsScreen";
import AlertsScreen from "./components/owner/AlertsScreen";
import ReportsScreen from "./components/owner/ReportsScreen";
import UserManagementScreen from "./components/owner/UserManagementScreen";
import AdminDashboard from "./components/admin/AdminDashboard";
import UserManagement from "./components/admin/UserManagement";
import InventoryManagement from "./components/inventory/InventoryManagement";
import PurchaseRequisitions from "./components/requisitions/PurchaseRequisitions";
import InternalOrderRequisitions from "./components/requisitions/InternalOrderRequisitions";
import ManagerDashboard from "./components/manager/ManagerDashboard";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Unified Login - Entry point for all users */}
          <Route path="/" element={<UnifiedLogin />} />
          
          {/* Owner Routes (Mobile App) */}
          <Route path="/dashboard" element={<OwnerDashboard />} />
          <Route path="/ratio-config" element={<RatioConfiguration />} />
          <Route path="/approvals" element={<ApprovalsScreen />} />
          <Route path="/alerts" element={<AlertsScreen />} />
          <Route path="/reports" element={<ReportsScreen />} />
          <Route path="/user-management" element={<UserManagementScreen />} />
          
          {/* Admin Routes (Web App) */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          
          {/* Inventory & Requisitions Routes */}
          <Route path="/inventory" element={<InventoryManagement userRole="store_keeper" />} />
          <Route path="/inventory/manager" element={<InventoryManagement userRole="manager" />} />
          <Route path="/inventory/owner" element={<InventoryManagement userRole="owner" />} />
          <Route path="/inventory/admin" element={<InventoryManagement userRole="admin" />} />
          
          <Route path="/purchase-requisitions" element={<PurchaseRequisitions userRole="manager" />} />
          <Route path="/purchase-requisitions/admin" element={<PurchaseRequisitions userRole="admin" />} />
          <Route path="/purchase-requisitions/owner" element={<PurchaseRequisitions userRole="owner" />} />
          
          <Route path="/internal-orders" element={<InternalOrderRequisitions userRole="sales" />} />
          <Route path="/internal-orders/store-keeper" element={<InternalOrderRequisitions userRole="store_keeper" />} />
          <Route path="/internal-orders/manager" element={<InternalOrderRequisitions userRole="manager" />} />
          
          {/* Placeholder routes for other roles */}
          <Route path="/finance/dashboard" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Finance Dashboard - Coming Soon</h1></div>} />
          <Route path="/manager/dashboard" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Manager Dashboard - Coming Soon</h1></div>} />
          <Route path="/sales/dashboard" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Sales Dashboard - Coming Soon</h1></div>} />
          <Route path="/storekeeper/dashboard" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Store Keeper Dashboard - Coming Soon</h1></div>} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;