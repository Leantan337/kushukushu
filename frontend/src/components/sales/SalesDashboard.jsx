import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
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
  Truck,
  RefreshCw
} from "lucide-react";
import POSTransaction from "./POSTransaction";
import InventoryRequestForm from "./InventoryRequestForm";
import PurchaseRequestForm from "./PurchaseRequestForm";
import SalesReports from "./SalesReports";
import OrderManagement from "./OrderManagement";
import LoanManagement from "./LoanManagement";
import PendingDeliveries from "./PendingDeliveries";
import CustomerDeliveryTracking from "./CustomerDeliveryTracking";

const SalesDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    todaySales: 0,
    todayTransactions: 0,
    pendingRequests: 0,
    lowStock: 0
  });
  const [loadingStats, setLoadingStats] = useState(false);

  // Get current user info from localStorage
  const getUserInfo = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return {
        name: user.name || user.username
      };
    }
    return {
      name: "Sales User"
    };
  };

  const currentUser = getUserInfo();

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

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Refresh stats when returning to overview tab
  useEffect(() => {
    if (activeTab === "overview") {
      fetchStats();
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    await Promise.all([
      fetchRecentActivity(),
      fetchStats()
    ]);
  };

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      // Fetch today's sales transactions
      const salesResponse = await fetch(`${BACKEND_URL}/api/sales-transactions`);
      let todaySales = 0;
      let todayTransactions = 0;
      
      if (salesResponse.ok) {
        const salesData = await salesResponse.json();
        console.log("Sales data fetched:", salesData.length, "transactions");
        const today = new Date().toDateString();
        
        // Calculate today's sales - handle both timestamp and created_at fields
        const todaysSales = salesData.filter(sale => {
          const dateToCheck = sale.timestamp || sale.created_at;
          if (!dateToCheck) return false;
          try {
            const saleDate = new Date(dateToCheck).toDateString();
          return saleDate === today;
          } catch (e) {
            console.error("Error parsing date:", dateToCheck, e);
            return false;
          }
        });
        
        todaySales = todaysSales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
        todayTransactions = todaysSales.length;
        console.log("Today's sales:", todaySales, "Transactions:", todayTransactions);
      } else {
        console.error("Failed to fetch sales transactions:", salesResponse.status);
      }

      // Fetch pending stock requests
      const requestsResponse = await fetch(`${BACKEND_URL}/api/stock-requests`);
      let pendingRequests = 0;
      
      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json();
        console.log("Stock requests fetched:", requestsData.length);
        pendingRequests = requestsData.filter(req => 
          req.status === "pending_admin_approval" || 
          req.status === "pending_manager_approval" ||
          req.status === "admin_approved" ||
          req.status === "pending"
        ).length;
        console.log("Pending requests:", pendingRequests);
      } else {
        console.error("Failed to fetch stock requests:", requestsResponse.status);
      }

      // Fetch inventory for low stock count
      const inventoryResponse = await fetch(`${BACKEND_URL}/api/inventory`);
      let lowStock = 0;
      
      if (inventoryResponse.ok) {
        const inventoryData = await inventoryResponse.json();
        console.log("Inventory items fetched:", inventoryData.length);
        lowStock = inventoryData.filter(item => {
          // Check various ways low stock might be indicated
          return item.stock_level === "low" || 
                 item.stock_level === "critical" ||
                 item.status === "low" ||
                 item.status === "critical" ||
                 (item.quantity !== undefined && item.min_quantity !== undefined && item.quantity <= item.min_quantity);
        }).length;
        console.log("Low stock items:", lowStock);
      } else {
        console.error("Failed to fetch inventory:", inventoryResponse.status);
      }

      setStats({
        todaySales,
        todayTransactions,
        pendingRequests,
        lowStock
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchRecentActivity = async () => {
    setLoadingActivity(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/recent-activity?limit=10`);
      if (response.ok) {
        const data = await response.json();
        
        // Transform backend data to match frontend expectations
        const transformedData = data.map(activity => {
          // Determine type based on action keywords
          let type = "info";
          const actionLower = (activity.action || "").toLowerCase();
          if (actionLower.includes("success") || actionLower.includes("complete") || actionLower.includes("approve")) {
            type = "success";
          } else if (actionLower.includes("warning") || actionLower.includes("pending") || actionLower.includes("low")) {
            type = "warning";
          } else if (actionLower.includes("error") || actionLower.includes("failed") || actionLower.includes("reject")) {
            type = "error";
          }
          
          // Format timestamp
          let formattedTime = "Just now";
          if (activity.timestamp) {
            try {
              const activityDate = new Date(activity.timestamp);
              const now = new Date();
              const diffMs = now - activityDate;
              const diffMins = Math.floor(diffMs / 60000);
              
              if (diffMins < 1) {
                formattedTime = "Just now";
              } else if (diffMins < 60) {
                formattedTime = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
              } else if (diffMins < 1440) {
                const hours = Math.floor(diffMins / 60);
                formattedTime = `${hours} hour${hours > 1 ? 's' : ''} ago`;
              } else {
                formattedTime = activityDate.toLocaleDateString() + " " + activityDate.toLocaleTimeString();
              }
            } catch (e) {
              console.error("Error formatting timestamp:", e);
            }
          }
          
          return {
            ...activity,
            type: type,
            time: formattedTime,
            action: activity.description || activity.action || "Unknown activity"
          };
        });
        
        setRecentActivity(transformedData);
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
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-900">Sales Dashboard</h1>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
                  Sales Office
                </Badge>
              </div>
              <p className="text-slate-600">Welcome, {currentUser.name} - Request products from any branch</p>
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
            <TabsTrigger value="customer-tracking" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white text-xs lg:text-sm">
              Track Customers
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Refresh Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-900">Dashboard Overview</h2>
              <Button
                onClick={fetchDashboardData}
                disabled={loadingStats || loadingActivity}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${(loadingStats || loadingActivity) ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-slate-200 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-slate-600">Today's Sales</CardTitle>
                    {loadingStats ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    ) : (
                    <DollarSign className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    ETB {loadingStats ? "..." : stats.todaySales.toLocaleString()}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Today's sales revenue</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-slate-600">Transactions</CardTitle>
                    {loadingStats ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                    ) : (
                    <ShoppingCart className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {loadingStats ? "..." : stats.todayTransactions}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Today's count</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-slate-600">Pending Requests</CardTitle>
                    {loadingStats ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
                    ) : (
                    <FileText className="w-5 h-5 text-purple-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {loadingStats ? "..." : stats.pendingRequests}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Awaiting approval</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-slate-600">Stock Alerts</CardTitle>
                    {loadingStats ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                    ) : (
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {loadingStats ? "..." : stats.lowStock}
                  </div>
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
                      <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                        {activity.type === "success" ? (
                          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                        ) : activity.type === "warning" ? (
                          <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-4 h-4 text-orange-600" />
                          </div>
                        ) : activity.type === "error" ? (
                          <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          </div>
                        ) : (
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-4 h-4 text-blue-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 break-words">{activity.action}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-slate-500">{activity.time}</p>
                            {activity.branch && (
                              <>
                                <span className="text-slate-300">•</span>
                                <Badge variant="outline" className="text-xs px-2 py-0">
                                  {activity.branch}
                                </Badge>
                              </>
                            )}
                          </div>
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

          {/* Customer Delivery Tracking Tab */}
          <TabsContent value="customer-tracking">
            <CustomerDeliveryTracking />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SalesDashboard;
