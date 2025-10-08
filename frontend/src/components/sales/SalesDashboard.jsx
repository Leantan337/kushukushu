import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  ShoppingCart, 
  Package, 
  FileText, 
  TrendingUp, 
  LogOut,
  DollarSign,
  AlertCircle,
  CheckCircle,
  ClipboardList,
  CreditCard,
  Truck
} from "lucide-react";
import POSTransaction from "./POSTransaction";
import InventoryRequestForm from "./InventoryRequestForm";
import PurchaseRequestForm from "./PurchaseRequestForm";
import SalesReports from "./SalesReports";
import OrderManagement from "./OrderManagement";
import LoanManagement from "./LoanManagement";
import PendingDeliveries from "./PendingDeliveries";

const SalesDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    todaySales: 0,
    todayTransactions: 0,
    pendingRequests: 0,
    lowStock: 0
  });

  const handleLogout = () => {
    // Clear any stored auth data
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

  const quickActions = [
    { 
      icon: ShoppingCart, 
      label: "New Sale", 
      color: "bg-blue-500", 
      tab: "pos",
      description: "Process customer transaction"
    },
    { 
      icon: ClipboardList, 
      label: "Orders", 
      color: "bg-indigo-500", 
      tab: "orders",
      description: "Track all orders"
    },
    { 
      icon: CreditCard, 
      label: "Loans", 
      color: "bg-rose-500", 
      tab: "loans",
      description: "Manage customer loans"
    },
    { 
      icon: Truck, 
      label: "Deliveries", 
      color: "bg-teal-500", 
      tab: "deliveries",
      description: "Pending stock deliveries"
    },
    { 
      icon: Package, 
      label: "Request Stock", 
      color: "bg-green-500", 
      tab: "inventory",
      description: "Request flour from store"
    },
    { 
      icon: FileText, 
      label: "Purchase Request", 
      color: "bg-purple-500", 
      tab: "purchase",
      description: "Request supplies"
    },
    { 
      icon: TrendingUp, 
      label: "View Reports", 
      color: "bg-orange-500", 
      tab: "reports",
      description: "Sales performance"
    }
  ];

  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    fetchRecentActivity();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchRecentActivity, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchRecentActivity = async () => {
    setLoadingActivity(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/recent-activity?limit=10`);
      if (response.ok) {
        const data = await response.json();
        setRecentActivity(data);
      }
    } catch (error) {
      console.error("Error fetching recent activity:", error);
    } finally {
      setLoadingActivity(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Sales Dashboard</h1>
              <p className="text-slate-600">Flour Factory ERP - Sales Point</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-slate-200 p-1 rounded-lg shadow-sm grid grid-cols-4 lg:grid-cols-8 gap-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white text-xs lg:text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="pos" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white text-xs lg:text-sm">
              POS
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white text-xs lg:text-sm">
              Orders
            </TabsTrigger>
            <TabsTrigger value="loans" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white text-xs lg:text-sm">
              Loans
            </TabsTrigger>
            <TabsTrigger value="deliveries" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white text-xs lg:text-sm">
              Deliveries
            </TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white text-xs lg:text-sm">
              Stock
            </TabsTrigger>
            <TabsTrigger value="purchase" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white text-xs lg:text-sm">
              Purchase
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white text-xs lg:text-sm">
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-slate-200 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-slate-600">Today's Sales</CardTitle>
                    <DollarSign className="w-5 h-5 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">ETB {stats.todaySales.toLocaleString()}</div>
                  <p className="text-xs text-slate-500 mt-1">+12% from yesterday</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-slate-600">Transactions</CardTitle>
                    <ShoppingCart className="w-5 h-5 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{stats.todayTransactions}</div>
                  <p className="text-xs text-slate-500 mt-1">Today's count</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-slate-600">Pending Requests</CardTitle>
                    <FileText className="w-5 h-5 text-purple-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{stats.pendingRequests}</div>
                  <p className="text-xs text-slate-500 mt-1">Awaiting approval</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-slate-600">Stock Alerts</CardTitle>
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{stats.lowStock}</div>
                  <p className="text-xs text-slate-500 mt-1">Low stock items</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-slate-200 shadow-md">
              <CardHeader>
                <CardTitle className="text-slate-900">Quick Actions</CardTitle>
                <CardDescription>Fast access to common tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      onClick={() => setActiveTab(action.tab)}
                      className={`${action.color} hover:opacity-90 text-white h-auto py-6 flex flex-col items-center justify-center gap-2 transition-all hover:scale-105`}
                    >
                      <action.icon className="w-8 h-8" />
                      <div className="text-center">
                        <div className="font-bold">{action.label}</div>
                        <div className="text-xs opacity-90">{action.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-slate-200 shadow-md">
              <CardHeader>
                <CardTitle className="text-slate-900 flex items-center justify-between">
                  Recent Activity
                  {loadingActivity && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  )}
                </CardTitle>
                <CardDescription>Latest updates from your sales point (auto-refreshes)</CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 && !loadingActivity ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500">No recent activity</p>
                    <p className="text-xs text-slate-400 mt-1">Activity will appear here as you work</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                        {activity.type === "success" ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        ) : activity.type === "warning" ? (
                          <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                          <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* POS Tab */}
          <TabsContent value="pos">
            <POSTransaction />
          </TabsContent>

          {/* Order Management Tab */}
          <TabsContent value="orders">
            <OrderManagement />
          </TabsContent>

          {/* Loan Management Tab */}
          <TabsContent value="loans">
            <LoanManagement />
          </TabsContent>

          {/* Pending Deliveries Tab */}
          <TabsContent value="deliveries">
            <PendingDeliveries />
          </TabsContent>

          {/* Stock Request Tab */}
          <TabsContent value="inventory">
            <InventoryRequestForm />
          </TabsContent>

          {/* Purchase Request Tab */}
          <TabsContent value="purchase">
            <PurchaseRequestForm />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <SalesReports />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SalesDashboard;
