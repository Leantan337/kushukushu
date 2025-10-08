import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  Shield, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users, 
  Settings, 
  Bell, 
  BarChart3,
  Building2,
  CheckCircle,
  Clock,
  ArrowUpRight,
  UserCheck,
  FileText,
  Activity,
  ShoppingCart,
  Boxes,
  Wallet
} from "lucide-react";
import { mockData } from "../../data/mockData";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Admin Dashboard Data - aligned with Ethiopian ERP context
  const adminData = {
    // Top-level KPIs
    kpis: {
      totalSalesToday: "Br 2,350,000",
      totalProductionToday: "8,500kg",
      pendingApprovals: "6",
      activeStaffOnline: "24"
    },
    
    // Branch Performance Comparison
    branchPerformance: [
      {
        branch: "Berhane Branch",
        todaySales: "Br 1,240,000",
        todayProduction: "4,200kg",
        currentInventory: "8,200kg",
        operationalStatus: "Active",
        statusColor: "bg-green-100 text-green-800"
      },
      {
        branch: "Girmay Branch",
        todaySales: "Br 1,110,000",
        todayProduction: "4,300kg",
        currentInventory: "7,800kg",
        operationalStatus: "Active",
        statusColor: "bg-green-100 text-green-800"
      }
    ],
    
    // Recent Activity Feed
    recentActivity: [
      {
        action: "Manager (Berhane) started new milling order for 'Bread Flour'",
        branch: "Berhane",
        time: "2 minutes ago",
        type: "production",
        icon: Package
      },
      {
        action: "Finance reconciled yesterday's sales reports",
        branch: "Both",
        time: "15 minutes ago",
        type: "finance",
        icon: DollarSign
      },
      {
        action: "New large 'Loan' sale created by Sales (Girmay)",
        branch: "Girmay",
        time: "28 minutes ago",
        type: "sales",
        icon: ShoppingCart
      },
      {
        action: "Store Keeper (Berhane) reported low stock for Raw Wheat",
        branch: "Berhane",
        time: "45 minutes ago",
        type: "inventory",
        icon: Boxes
      },
      {
        action: "Payment approval for supplier - Premium Wheat (Br 8.5M)",
        branch: "Both",
        time: "1 hour ago",
        type: "approval",
        icon: CheckCircle
      },
      {
        action: "Production target exceeded at Girmay Branch (102%)",
        branch: "Girmay",
        time: "2 hours ago",
        type: "production",
        icon: TrendingUp
      },
      {
        action: "New user registered: Hiwet Alem - Sales Team Lead",
        branch: "Girmay",
        time: "3 hours ago",
        type: "user",
        icon: UserCheck
      },
      {
        action: "Daily cash reconciliation completed - All branches",
        branch: "Both",
        time: "4 hours ago",
        type: "finance",
        icon: Wallet
      }
    ]
  };

  // Top-level KPI Card Component
  const KPICard = ({ title, value, icon: Icon, color, bgColor }) => (
    <Card className="bg-white shadow-md border-slate-200 hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-slate-600 text-sm font-medium mb-2">{title}</p>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
          </div>
          <div className={`p-4 rounded-2xl ${bgColor}`}>
            <Icon className={`w-8 h-8 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Branch Performance Card
  const BranchCard = ({ branch }) => (
    <div className="p-5 bg-gradient-to-br from-slate-50 to-white rounded-xl border-2 border-slate-200 hover:border-slate-300 transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center">
          <Building2 className="w-5 h-5 mr-2 text-slate-700" />
          {branch.branch}
        </h3>
        <Badge className={branch.statusColor}>
          {branch.operationalStatus}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-blue-700 font-medium mb-1">Today's Sales</p>
          <p className="text-lg font-bold text-blue-900">{branch.todaySales}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-xs text-green-700 font-medium mb-1">Today's Production</p>
          <p className="text-lg font-bold text-green-900">{branch.todayProduction}</p>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <p className="text-xs text-purple-700 font-medium mb-1">Current Inventory</p>
          <p className="text-lg font-bold text-purple-900">{branch.currentInventory}</p>
        </div>
        <div className="bg-amber-50 p-3 rounded-lg">
          <p className="text-xs text-amber-700 font-medium mb-1">Status</p>
          <p className="text-lg font-bold text-amber-900">{branch.operationalStatus}</p>
        </div>
      </div>
    </div>
  );

  // Activity Item Component
  const ActivityItem = ({ activity }) => {
    const typeColors = {
      production: "bg-blue-100",
      finance: "bg-green-100",
      sales: "bg-purple-100",
      inventory: "bg-amber-100",
      approval: "bg-teal-100",
      user: "bg-pink-100"
    };

    const typeIconColors = {
      production: "text-blue-600",
      finance: "text-green-600",
      sales: "text-purple-600",
      inventory: "text-amber-600",
      approval: "text-teal-600",
      user: "text-pink-600"
    };

    const IconComponent = activity.icon;

    return (
      <div className="flex items-start space-x-3 p-3 hover:bg-slate-50 rounded-lg transition-colors duration-150">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${typeColors[activity.type]}`}>
          <IconComponent className={`w-5 h-5 ${typeIconColors[activity.type]}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 leading-snug">{activity.action}</p>
          <div className="flex items-center mt-1 text-xs text-slate-500">
            <Building2 className="w-3 h-3 mr-1" />
            <span className="mr-3">{activity.branch}</span>
            <Clock className="w-3 h-3 mr-1" />
            <span>{activity.time}</span>
          </div>
        </div>
      </div>
    );
  };

  // Quick Navigation Card
  const QuickNavCard = ({ title, icon: Icon, color, onClick }) => (
    <Button
      onClick={onClick}
      className={`h-24 ${color} text-white hover:opacity-90 flex flex-col items-center justify-center space-y-2 transition-all duration-200 shadow-md hover:shadow-lg`}
    >
      <Icon className="w-6 h-6" />
      <span className="font-semibold text-sm">{title}</span>
    </Button>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-slate-600 text-sm">Central Operational Management - Adigrat Factory</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                className="border-slate-200 hover:bg-slate-50"
              >
                <Clock className="w-4 h-4 mr-2" />
                {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </Button>
              
              <Button
                variant="outline"
                className="relative border-slate-200 hover:bg-slate-50"
              >
                <Bell className="w-4 h-4" />
                <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                  3
                </Badge>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Top-Level KPIs */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Key Performance Indicators - Today</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <KPICard
              title="Total Sales Today"
              value={adminData.kpis.totalSalesToday}
              icon={DollarSign}
              color="text-green-600"
              bgColor="bg-green-50"
            />
            <KPICard
              title="Total Production Today"
              value={adminData.kpis.totalProductionToday}
              icon={Package}
              color="text-blue-600"
              bgColor="bg-blue-50"
            />
            <KPICard
              title="Pending Approvals"
              value={adminData.kpis.pendingApprovals}
              icon={Clock}
              color="text-amber-600"
              bgColor="bg-amber-50"
            />
            <KPICard
              title="Active Staff Online"
              value={adminData.kpis.activeStaffOnline}
              icon={Users}
              color="text-purple-600"
              bgColor="bg-purple-50"
            />
          </div>
        </div>

        {/* Branch Performance Comparison */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            Branch Performance Comparison
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {adminData.branchPerformance.map((branch, index) => (
              <BranchCard key={index} branch={branch} />
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity Feed */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-md border-slate-200">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Recent Activity Feed
                </CardTitle>
                <p className="text-xs text-slate-500 mt-1">Live updates from across the entire system</p>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {adminData.recentActivity.map((activity, index) => (
                    <ActivityItem key={index} activity={activity} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Navigation */}
          <div>
            <Card className="bg-white shadow-md border-slate-200">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-lg font-bold text-slate-900">Quick Navigation</CardTitle>
                <p className="text-xs text-slate-500 mt-1">Jump to main modules</p>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 gap-3">
                  <QuickNavCard
                    title="Manage Users"
                    icon={Users}
                    color="bg-slate-900"
                    onClick={() => navigate("/admin/users")}
                  />
                  <QuickNavCard
                    title="Review Approvals"
                    icon={CheckCircle}
                    color="bg-green-600"
                    onClick={() => navigate("/approvals")}
                  />
                  <QuickNavCard
                    title="View Financial Reports"
                    icon={FileText}
                    color="bg-blue-600"
                    onClick={() => navigate("/reports")}
                  />
                  <QuickNavCard
                    title="See Full Production Logs"
                    icon={BarChart3}
                    color="bg-purple-600"
                    onClick={() => {}}
                  />
                  <QuickNavCard
                    title="Monitor All Sales"
                    icon={ShoppingCart}
                    color="bg-orange-600"
                    onClick={() => {}}
                  />
                  <QuickNavCard
                    title="System Settings"
                    icon={Settings}
                    color="bg-slate-700"
                    onClick={() => {}}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;