import React, { useState } from "react";
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
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  UserCheck,
  Calendar,
  FileText
} from "lucide-react";
import { mockData } from "../../data/mockData";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [selectedTimeframe, setSelectedTimeframe] = useState("Today");

  // Enhanced admin mock data
  const adminData = {
    systemOverview: {
      totalRevenue: "₦75,450,000",
      totalProduction: "15,200kg", 
      activeUsers: "28",
      pendingApprovals: "6",
      criticalAlerts: "2"
    },
    modules: [
      {
        name: "Sales Management",
        status: "Active",
        todaySales: "₦2,350,000",
        transactions: "156",
        icon: DollarSign,
        color: "bg-green-600"
      },
      {
        name: "Production Control",
        status: "Active", 
        todayProduction: "8,500kg",
        efficiency: "91%",
        icon: Package,
        color: "bg-blue-600"
      },
      {
        name: "Finance Module",
        status: "Active",
        cashFlow: "₦45,230,000",
        pendingPayments: "4",
        icon: TrendingUp,
        color: "bg-purple-600"
      },
      {
        name: "User Management",
        status: "Active",
        totalUsers: "28",
        activeToday: "24",
        icon: Users,
        color: "bg-orange-600"
      }
    ],
    branchComparison: [
      {
        branch: "Berhane Branch",
        sales: "₦1,240,000",
        production: "4,200kg",
        efficiency: "92%",
        staff: "14",
        alerts: "1"
      },
      {
        branch: "Girmay Branch", 
        sales: "₦1,110,000",
        production: "4,300kg",
        efficiency: "89%",
        staff: "14",
        alerts: "1"
      }
    ],
    recentActivity: [
      {
        action: "New user registered",
        user: "John Doe - Sales",
        time: "10 min ago",
        type: "user"
      },
      {
        action: "Payment approved",
        user: "Finance Team",
        time: "25 min ago", 
        type: "finance"
      },
      {
        action: "Production target met",
        user: "Berhane Manager",
        time: "45 min ago",
        type: "production"
      },
      {
        action: "Alert resolved",
        user: "System Admin",
        time: "1 hour ago",
        type: "alert"
      }
    ]
  };

  const StatCard = ({ title, value, change, trend, icon: Icon, color }) => (
    <Card className="bg-white shadow-lg border-slate-200 hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-slate-600 text-sm font-medium mb-2">{title}</p>
            <p className="text-3xl font-bold text-slate-900 mb-3">{value}</p>
            {change && (
              <div className="flex items-center text-sm">
                {trend === "up" ? (
                  <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-600 mr-1" />
                )}
                <span className={trend === "up" ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                  {change}
                </span>
                <span className="text-slate-500 ml-2">vs yesterday</span>
              </div>
            )}
          </div>
          <div className={`p-4 rounded-2xl ${color}`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ModuleCard = ({ module }) => {
    const IconComponent = module.icon;
    
    return (
      <Card className="bg-white shadow-lg border-slate-200 hover:shadow-xl transition-all duration-300 cursor-pointer group">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-slate-700 transition-colors">
              {module.name}
            </CardTitle>
            <Badge className="bg-green-100 text-green-800">
              {module.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${module.color}`}>
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4 flex-1">
              <div className="text-center p-2 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600 font-medium">Primary Metric</p>
                <p className="font-bold text-slate-900">
                  {module.todaySales || module.todayProduction || module.cashFlow || module.totalUsers}
                </p>
              </div>
              <div className="text-center p-2 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600 font-medium">Secondary</p>
                <p className="font-bold text-slate-900">
                  {module.transactions || module.efficiency || module.pendingPayments || module.activeToday}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-slate-600">Central Factory Management System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                {["Today", "Week", "Month"].map((timeframe) => (
                  <Button
                    key={timeframe}
                    variant={selectedTimeframe === timeframe ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTimeframe(timeframe)}
                    className={selectedTimeframe === timeframe 
                      ? "bg-slate-900 text-white" 
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }
                  >
                    {timeframe}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                onClick={() => navigate("/admin/users")}
                className="border-slate-200 hover:bg-slate-50"
              >
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
              
              <Button
                variant="outline"
                className="relative border-slate-200 hover:bg-slate-50"
              >
                <Bell className="w-4 h-4" />
                <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                  {adminData.systemOverview.criticalAlerts}
                </Badge>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* System Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="Total Revenue"
            value={adminData.systemOverview.totalRevenue}
            change="+8.2%"
            trend="up"
            icon={DollarSign}
            color="bg-green-600"
          />
          <StatCard
            title="Total Production"
            value={adminData.systemOverview.totalProduction}
            change="+5.1%"
            trend="up"
            icon={Package}
            color="bg-blue-600"
          />
          <StatCard
            title="Active Users"
            value={adminData.systemOverview.activeUsers}
            change="+3"
            trend="up"
            icon={Users}
            color="bg-purple-600"
          />
          <StatCard
            title="Pending Approvals"
            value={adminData.systemOverview.pendingApprovals}
            icon={Clock}
            color="bg-yellow-600"
          />
          <StatCard
            title="Critical Alerts"
            value={adminData.systemOverview.criticalAlerts}
            icon={AlertTriangle}
            color="bg-red-600"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Modules Overview */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">System Modules</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adminData.modules.map((module, index) => (
                  <ModuleCard key={index} module={module} />
                ))}
              </div>
            </div>

            {/* Branch Comparison */}
            <Card className="bg-white shadow-lg border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900 flex items-center">
                  <Building2 className="w-6 h-6 mr-3" />
                  Branch Performance Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminData.branchComparison.map((branch, index) => (
                    <div key={index} className="p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-slate-900">{branch.branch}</h3>
                        <Badge className={branch.alerts === "0" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                          {branch.alerts} Alert{branch.alerts !== "1" ? "s" : ""}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <p className="text-slate-600 font-medium">Sales</p>
                          <p className="font-bold text-slate-900">{branch.sales}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-600 font-medium">Production</p>
                          <p className="font-bold text-slate-900">{branch.production}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-600 font-medium">Efficiency</p>
                          <p className="font-bold text-slate-900">{branch.efficiency}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-600 font-medium">Staff</p>
                          <p className="font-bold text-slate-900">{branch.staff}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="space-y-6">
            <Card className="bg-white shadow-lg border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {adminData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === "user" ? "bg-blue-100" :
                      activity.type === "finance" ? "bg-green-100" :
                      activity.type === "production" ? "bg-purple-100" : "bg-red-100"
                    }`}>
                      {activity.type === "user" && <UserCheck className="w-4 h-4 text-blue-600" />}
                      {activity.type === "finance" && <DollarSign className="w-4 h-4 text-green-600" />}
                      {activity.type === "production" && <Package className="w-4 h-4 text-purple-600" />}
                      {activity.type === "alert" && <AlertTriangle className="w-4 h-4 text-red-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                      <p className="text-xs text-slate-600">{activity.user}</p>
                      <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white shadow-lg border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => navigate("/admin/users")}
                  className="w-full justify-start bg-slate-900 hover:bg-slate-800 text-white"
                >
                  <Users className="w-4 h-4 mr-2" />
                  User Management
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-slate-200 hover:bg-slate-50"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Reports
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-slate-200 hover:bg-slate-50"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  System Settings
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-slate-200 hover:bg-slate-50"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Audit Logs
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;