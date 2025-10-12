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
import OwnerFundApprovalQueue from "./components/owner/OwnerFundApprovalQueue";
import FinancialControlSettings from "./components/owner/FinancialControlSettings";
import InventoryValuationDashboard from "./components/owner/InventoryValuationDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import UserManagement from "./components/admin/UserManagement";
import InventoryManagement from "./components/inventory/InventoryManagement";
import PurchaseRequisitions from "./components/requisitions/PurchaseRequisitions";
import InternalOrderRequisitions from "./components/requisitions/InternalOrderRequisitions";
import ManagerDashboard from "./components/manager/ManagerDashboard";
import SalesDashboard from "./components/sales/SalesDashboard";
import EndOfDayReconciliation from "./components/sales/EndOfDayReconciliation";
import StoreKeeperDashboard from "./components/storekeeper/StoreKeeperDashboard";
import SimplePOS from "./components/demo/SimplePOS";
import SimpleInventoryDashboard from "./components/demo/SimpleInventoryDashboard";
import SimpleSalesDashboard from "./components/demo/SimpleSalesDashboard";
import DemoFinanceDashboard from "./components/demo/FinanceDashboard";
import DemoLanding from "./components/demo/DemoLanding";
import PrintableFormsPreview from "./components/printable/PrintableFormsPreview";
import FinanceDashboard from "./components/finance/FinanceDashboard";
import PaymentProcessing from "./components/finance/PaymentProcessing";
import DailyReconciliation from "./components/finance/DailyReconciliationNew";
import AccountsReceivable from "./components/finance/AccountsReceivable";
import IncomeRecording from "./components/finance/IncomeRecording";
import ExpenseRecording from "./components/finance/ExpenseRecording";
import { Toaster } from "./components/ui/toaster";
import { AppProvider } from "./context/AppContext";

function App() {
  return (
    <AppProvider>
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
          <Route path="/owner/fund-approvals" element={<OwnerFundApprovalQueue />} />
          <Route path="/owner/financial-controls" element={<FinancialControlSettings />} />
          <Route path="/owner/inventory-valuation" element={<InventoryValuationDashboard />} />
          
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
          
          {/* Manager Routes */}
          <Route path="/manager/dashboard" element={<ManagerDashboard />} />
          
          {/* Sales Routes */}
          <Route path="/sales/dashboard" element={<SalesDashboard />} />
          <Route path="/sales/end-of-day-reconciliation" element={<EndOfDayReconciliation />} />
          
          {/* Store Keeper Routes */}
          <Route path="/storekeeper/dashboard" element={<StoreKeeperDashboard />} />
          
          {/* Demo Routes for Client Presentation */}
          <Route path="/demo" element={<DemoLanding />} />
          <Route path="/demo/pos" element={<SimplePOS />} />
          <Route path="/demo/inventory" element={<SimpleInventoryDashboard />} />
          <Route path="/demo/sales" element={<SimpleSalesDashboard />} />
          <Route path="/demo/finance" element={<DemoFinanceDashboard />} />
          
          {/* Printable Forms Preview */}
          <Route path="/printable-forms" element={<PrintableFormsPreview />} />
          
          {/* Finance Routes */}
          <Route path="/finance/dashboard" element={<FinanceDashboard />} />
          <Route path="/finance/payment-processing" element={<PaymentProcessing />} />
          <Route path="/finance/reconciliation" element={<DailyReconciliation />} />
          <Route path="/finance/receivables" element={<AccountsReceivable />} />
          <Route path="/finance/income-recording" element={<IncomeRecording />} />
          <Route path="/finance/expense-recording" element={<ExpenseRecording />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
    </AppProvider>
  );
}

export default App;