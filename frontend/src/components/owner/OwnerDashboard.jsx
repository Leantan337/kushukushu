import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Settings, 
  Bell, 
  CheckCircle, 
  BarChart3,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  FileBarChart,
  UserCog
} from "lucide-react";
import { mockData } from "../../data/mockData";

const OwnerDashboard = () => {
  const navigate = useNavigate();

  const StatCard = ({ title, value, change, trend, icon: Icon, color }) => (
    <Card className="bg-white shadow-sm border-slate-200 hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-600 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
            <div className="flex items-center mt-2 text-sm">
              {trend === "up" ? (
                <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-600 mr-1" />
              )}
              <span className={trend === "up" ? "text-green-600" : "text-red-600"}>
                {change}
              </span>
              <span className="text-slate-500 ml-1">vs yesterday</span>
            </div>
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const BranchCard = ({ branch }) => (
    <Card className="bg-white shadow-sm border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">{branch.name}</CardTitle>
          <Badge variant={branch.status === "Active" ? "default" : "secondary"} className="bg-green-100 text-green-800">
            {branch.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">Production</p>
            <p className="font-semibold text-slate-900">{branch.production}</p>
          </div>
          <div className="text-center p-2 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">Sales</p>
            <p className="font-semibold text-slate-900">{branch.sales}</p>
          </div>
        </div>
        <div className="text-center p-2 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600">Efficiency</p>
          <p className="font-semibold text-blue-900">{branch.efficiency}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Owner Dashboard</h1>
                <p className="text-sm text-slate-600">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/alerts")}
                className="relative border-slate-200"
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

      <div className="p-4 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            title="Daily Sales"
            value={mockData.dashboard.dailySales}
            change="+12%"
            trend="up"
            icon={DollarSign}
            color="bg-green-600"
          />
          <StatCard
            title="Cash in Bank"
            value={mockData.dashboard.cashInBank}
            change="+5%"
            trend="up"
            icon={TrendingUp}
            color="bg-blue-600"
          />
          <StatCard
            title="Gross Profit"
            value={mockData.dashboard.grossProfit}
            change="+8%"
            trend="up"
            icon={DollarSign}
            color="bg-emerald-600"
          />
          <StatCard
            title="Net Profit"
            value={mockData.dashboard.netProfit}
            change="+6%"
            trend="up"
            icon={TrendingUp}
            color="bg-teal-600"
          />
        </div>

        {/* Inventory and Receivables */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Key Inventory Levels
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-amber-50 rounded-lg">
                <span className="text-sm font-medium text-amber-800">Raw Wheat</span>
                <span className="font-semibold text-amber-900">{mockData.dashboard.inventoryLevels.rawWheat}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-800">Finished Flour</span>
                <span className="font-semibold text-blue-900">{mockData.dashboard.inventoryLevels.finishedFlour}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-purple-800">Fruska</span>
                <span className="font-semibold text-purple-900">{mockData.dashboard.inventoryLevels.fruska}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Outstanding Receivables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-4">
                <p className="text-3xl font-bold text-red-600">{mockData.dashboard.outstandingReceivables}</p>
                <p className="text-sm text-slate-600 mt-1">Total Credit Sales Due</p>
                <div className="flex items-center justify-center mt-2 text-sm">
                  <ArrowUpRight className="w-4 h-4 text-red-600 mr-1" />
                  <span className="text-red-600">+15%</span>
                  <span className="text-slate-500 ml-1">vs last week</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            title="Production"
            value={mockData.dashboard.totalProduction}
            change="-3%"
            trend="down"
            icon={Package}
            color="bg-purple-600"
          />
          <StatCard
            title="Active Staff"
            value={mockData.dashboard.activeStaff}
            change="+2"
            trend="up"
            icon={Users}
            color="bg-orange-600"
          />
        </div>

        {/* Production Chart */}
        <Card className="bg-white shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Weekly Production Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.dashboard.weeklyProduction.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{item.day}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-slate-800 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(item.amount / 1000) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-slate-900 w-16 text-right">{item.amount}kg</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Branch Status */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Branch Status</h2>
          <div className="grid gap-4">
            {mockData.dashboard.branches.map((branch, index) => (
              <BranchCard key={index} branch={branch} />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => navigate("/ratio-config")}
            className="h-16 bg-slate-900 hover:bg-slate-800 text-white font-medium flex items-center justify-center space-x-2"
          >
            <Settings className="w-5 h-5" />
            <span>Ratio Config</span>
          </Button>
          <Button
            onClick={() => navigate("/approvals")}
            className="h-16 bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-50 font-medium flex items-center justify-center space-x-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Approvals</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;