import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  Truck, 
  Factory, 
  CheckCircle, 
  Package, 
  Clock,
  AlertCircle,
  Plus,
  ArrowRight,
  Wheat,
  FlaskConical,
  LogOut
} from "lucide-react";
import WheatDeliveryForm from "./WheatDeliveryForm";
import MillingOrderForm from "./MillingOrderForm";
import ManagerQueue from "./ManagerQueue";
import ManagerGatePassApprovals from "./ManagerGatePassApprovals";
import CustomerDeliveryQueue from "./CustomerDeliveryQueue";
import CustomerDeliveryReport from "./CustomerDeliveryReport";

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    todayDeliveries: 0,
    activeMilling: 0,
    rawWheatStock: 0,
    pendingCustomerDeliveries: 0,
    dispatchedToday: 0
  });
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [showMillingForm, setShowMillingForm] = useState(false);

  // Get current user from localStorage
  const getUserInfo = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return {
        id: `manager-${user.branch}`,
        name: user.name || user.username,
        branch_id: user.branch,
        branch_name: user.branch === "berhane" ? "Berhane Branch" : "Girmay Branch"
      };
    }
    return {
      id: "manager-001",
      name: "Manager",
      branch_id: "berhane",
      branch_name: "Berhane Branch"
    };
  };

  const currentManager = getUserInfo();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      
      // Fetch pending approvals for this branch
      const approvalResponse = await fetch(`${backendUrl}/api/inventory-requests/manager-queue?branch_id=${currentManager.branch_id}`);
      const pendingApprovals = approvalResponse.ok ? await approvalResponse.json() : [];
      
      // Fetch inventory for this branch only
      const inventoryResponse = await fetch(`${backendUrl}/api/inventory?branch_id=${currentManager.branch_id}`);
      const inventory = inventoryResponse.ok ? await inventoryResponse.json() : [];
      const rawWheatItem = inventory.find(item => item.name === "Raw Wheat" && item.branch_id === currentManager.branch_id);
      
      // Fetch customer deliveries
      const customerDeliveryResponse = await fetch(`${backendUrl}/api/customer-deliveries?branch_id=${currentManager.branch_id}`);
      const customerDeliveries = customerDeliveryResponse.ok ? await customerDeliveryResponse.json() : [];
      
      // Count pending customer deliveries (not yet dispatched)
      const pendingCustomer = customerDeliveries.filter(d => 
        (!d.dispatch_status || d.dispatch_status === "pending_dispatch") && 
        d.status !== "confirmed"
      ).length;
      
      // Count dispatched today
      const today = new Date().toDateString();
      const dispatchedToday = customerDeliveries.filter(d => 
        d.dispatch_info?.dispatched_at && 
        new Date(d.dispatch_info.dispatched_at).toDateString() === today
      ).length;
      
      setStats({
        pendingApprovals: pendingApprovals.length,
        todayDeliveries: 3, // Mock data - would be calculated from today's deliveries
        activeMilling: 1,   // Mock data - would be from active milling orders for this branch
        rawWheatStock: rawWheatItem ? rawWheatItem.quantity : 0,
        pendingCustomerDeliveries: pendingCustomer,
        dispatchedToday: dispatchedToday
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color, onClick }) => (
    <Card 
      className={`bg-white shadow-sm border-slate-200 hover:shadow-md transition-shadow duration-200 ${onClick ? 'cursor-pointer hover:bg-slate-50' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-600 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
            {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const QuickActionCard = ({ title, description, icon: Icon, color, onClick }) => (
    <Card className="bg-white shadow-sm border-slate-200 hover:shadow-md transition-shadow duration-200 cursor-pointer hover:bg-slate-50" onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-600 text-sm">{description}</p>
          </div>
          <div className={`p-3 rounded-xl ${color} ml-4`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-900">Manager Dashboard</h1>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                {currentManager.branch_name}
              </Badge>
            </div>
            <p className="text-slate-600">Welcome back, {currentManager.name}</p>
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            subtitle="Flour requests"
            icon={Clock}
            color="bg-orange-500"
            onClick={() => navigate('/manager/approvals')}
          />
          <StatCard
            title="Today's Deliveries"
            value={stats.todayDeliveries}
            subtitle="Raw wheat received"
            icon={Truck}
            color="bg-blue-500"
          />
          <StatCard
            title="Active Milling"
            value={stats.activeMilling}
            subtitle="Orders in progress"
            icon={Factory}
            color="bg-purple-500"
          />
          <StatCard
            title="Raw Wheat Stock"
            value={`${stats.rawWheatStock.toLocaleString()}kg`}
            subtitle="Current inventory"
            icon={Wheat}
            color="bg-green-500"
          />
          <StatCard
            title="Customer Deliveries"
            value={stats.pendingCustomerDeliveries}
            subtitle="Pending dispatch"
            icon={Package}
            color="bg-yellow-500"
          />
          <StatCard
            title="Dispatched Today"
            value={stats.dispatchedToday}
            subtitle="To customers"
            icon={CheckCircle}
            color="bg-teal-500"
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white p-1 rounded-lg shadow-sm">
            <TabsTrigger value="overview" className="px-6 py-2">Overview</TabsTrigger>
            <TabsTrigger value="deliveries" className="px-6 py-2">Wheat Deliveries</TabsTrigger>
            <TabsTrigger value="milling" className="px-6 py-2">Milling Orders</TabsTrigger>
            <TabsTrigger value="approvals" className="px-6 py-2">Stock Approvals</TabsTrigger>
            <TabsTrigger value="gatepass" className="px-6 py-2">Gate Pass Approvals</TabsTrigger>
            <TabsTrigger value="customer-deliveries" className="px-6 py-2">Customer Deliveries</TabsTrigger>
            <TabsTrigger value="delivery-reports" className="px-6 py-2">Delivery Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <QuickActionCard
                    title="Record Wheat Delivery"
                    description="Log new raw wheat deliveries from suppliers"
                    icon={Truck}
                    color="bg-blue-500"
                    onClick={() => setShowDeliveryForm(true)}
                  />
                  <QuickActionCard
                    title="Create Milling Order"
                    description="Start new production run"
                    icon={Factory}
                    color="bg-purple-500"
                    onClick={() => setShowMillingForm(true)}
                  />
                  <QuickActionCard
                    title="Review Flour Requests"
                    description="Approve or reject internal orders"
                    icon={CheckCircle}
                    color="bg-green-500"
                    onClick={() => navigate('/internal-orders/manager')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Truck className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Wheat delivery received</p>
                        <p className="text-sm text-slate-600">2,500kg from Tigray Cooperative</p>
                      </div>
                    </div>
                    <Badge variant="outline">2 hours ago</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Flour request approved</p>
                        <p className="text-sm text-slate-600">500kg 1st Quality Flour for Sales Team</p>
                      </div>
                    </div>
                    <Badge variant="outline">4 hours ago</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Factory className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Milling order completed</p>
                        <p className="text-sm text-slate-600">3,000kg raw wheat processed</p>
                      </div>
                    </div>
                    <Badge variant="outline">Yesterday</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deliveries">
            <WheatDeliveryForm manager={currentManager} onSuccess={() => fetchDashboardStats()} />
          </TabsContent>

          <TabsContent value="milling">
            <MillingOrderForm manager={currentManager} onSuccess={() => fetchDashboardStats()} />
          </TabsContent>

          <TabsContent value="approvals">
            <ManagerQueue manager={currentManager} onSuccess={() => fetchDashboardStats()} />
          </TabsContent>

          <TabsContent value="gatepass">
            <ManagerGatePassApprovals />
          </TabsContent>

          <TabsContent value="customer-deliveries">
            <CustomerDeliveryQueue />
          </TabsContent>

          <TabsContent value="delivery-reports">
            <CustomerDeliveryReport />
          </TabsContent>
        </Tabs>

        {/* Modals */}
        {showDeliveryForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <WheatDeliveryForm 
                manager={currentManager} 
                onSuccess={() => {
                  setShowDeliveryForm(false);
                  fetchDashboardStats();
                }}
                onCancel={() => setShowDeliveryForm(false)}
              />
            </div>
          </div>
        )}

        {showMillingForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <MillingOrderForm 
                manager={currentManager} 
                onSuccess={() => {
                  setShowMillingForm(false);
                  fetchDashboardStats();
                }}
                onCancel={() => setShowMillingForm(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;