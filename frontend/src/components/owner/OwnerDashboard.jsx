import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  Building2, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Package, 
  Settings, 
  Bell, 
  BarChart3,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  FileBarChart,
  UserCog,
  LogOut,
  AlertCircle,
  Send,
  Wallet,
  ShoppingCart,
  Factory,
  Clock,
  CheckCircle,
  RefreshCw,
  Eye,
  Activity,
  CreditCard,
  Truck,
  Boxes
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    financial_kpis: {
      cash_in_bank: 0,
      todays_sales: 0,
      accounts_receivable: 0,
      gross_profit: 0,
      pending_fund_requests: 0,
      inventory_value: 0
    },
    operations: {},
    trends: {}
  });
  const [branchStats, setBranchStats] = useState({});
  const [activityFeed, setActivityFeed] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  // Load all dashboard data
  const loadAllData = async () => {
    try {
      const [summaryRes, branchRes, activityRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/owner/dashboard-summary`),
        fetch(`${BACKEND_URL}/api/owner/branch-stats`),
        fetch(`${BACKEND_URL}/api/owner/activity-feed?limit=50`)
      ]);

      if (summaryRes.ok) {
        const summary = await summaryRes.json();
        setDashboardData(summary);
      }

      if (branchRes.ok) {
        const branches = await branchRes.json();
        setBranchStats(branches);
      }

      if (activityRes.ok) {
        const activity = await activityRes.json();
        setActivityFeed(activity);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadAllData();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshing(true);
      loadAllData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Manual refresh
  const handleManualRefresh = () => {
    setRefreshing(true);
    loadAllData();
    toast({
      title: "Dashboard Refreshed",
      description: "All data has been updated",
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return 'ETB 0';
    }
    return `ETB ${Number(amount).toLocaleString()}`;
  };

  // Format time ago
  const timeAgo = (timestamp) => {
    if (!timestamp) return "Unknown";
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000); // seconds
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    const colors = {
      sales: "bg-purple-100 text-purple-800",
      manager: "bg-blue-100 text-blue-800",
      finance: "bg-green-100 text-green-800",
      storekeeper: "bg-amber-100 text-amber-800",
      admin: "bg-slate-100 text-slate-800"
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  // Financial KPI Card Component
  const KPICard = ({ title, value, trend, icon: Icon, color, bgColor, onClick }) => (
    <Card 
      className={`${onClick ? 'cursor-pointer hover:shadow-lg' : ''} transition-shadow duration-200`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-slate-600 text-xs font-medium mb-1">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {trend && (
              <div className="flex items-center mt-1 text-xs">
                {trend.startsWith('+') ? (
                  <ArrowUpRight className="w-3 h-3 text-green-600 mr-1" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-red-600 mr-1" />
                )}
                <span className={trend.startsWith('+') ? "text-green-600" : "text-red-600"}>
                  {trend}
              </span>
            </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${bgColor}`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Branch Comparison Card Component
  const BranchCard = ({ branchId, stats }) => {
    const branchName = branchId === "berhane" ? "Berhane Branch" : "Girmay Branch";
    const isActive = stats?.operational_status === "active";
    
    return (
      <Card className="border-2 hover:shadow-lg transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              {branchName}
            </CardTitle>
            <Badge className={isActive ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>
              {isActive ? "Active" : "Idle"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-700 font-medium">Today's Sales</p>
              <p className="text-lg font-bold text-blue-900">
                {formatCurrency(stats?.todays_sales || 0)}
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-xs text-green-700 font-medium">Production</p>
              <p className="text-lg font-bold text-green-900">{stats?.todays_production || 0}kg</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-xs text-purple-700 font-medium">Inventory</p>
              <p className="text-lg font-bold text-purple-900">{stats?.current_inventory_kg || 0}kg</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <p className="text-xs text-orange-700 font-medium">Transactions</p>
              <p className="text-lg font-bold text-orange-900">{stats?.transaction_count || 0}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <span className="text-slate-600">Stock Requests</span>
              <Badge variant="outline">{stats?.pending_stock_requests || 0}</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <span className="text-slate-600">Milling Orders</span>
              <Badge variant="outline">{stats?.active_milling_orders || 0}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Activity Feed Item Component
  const ActivityItem = ({ activity, expanded = false }) => {
    const [isExpanded, setIsExpanded] = useState(expanded);
    
    return (
      <div 
        className="p-3 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 cursor-pointer transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Badge className={getRoleBadgeColor(activity.role)} variant="outline">
              {activity.role}
            </Badge>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900">{activity.description}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {activity.branch}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo(activity.timestamp)}
              </span>
            </div>
            {isExpanded && activity.details && (
              <div className="mt-2 p-2 bg-slate-50 rounded text-xs">
                {Object.entries(activity.details).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-1">
                    <span className="text-slate-600">{key.replace(/_/g, ' ')}:</span>
                    <span className="font-medium">{JSON.stringify(value)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 mx-auto mb-4 text-slate-900 animate-spin" />
          <p className="text-slate-600">Loading Control Room...</p>
        </div>
      </div>
  );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Owner Control Room</h1>
                <p className="text-xs text-slate-600">Real-time System Monitoring</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                disabled={refreshing}
                className="border-slate-200"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/alerts")}
                className="relative border-slate-200"
              >
                <Bell className="w-4 h-4" />
                {dashboardData.financial_kpis.pending_fund_requests > 0 && (
                <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                    {dashboardData.financial_kpis.pending_fund_requests}
                </Badge>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  navigate("/");
                }}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Financial KPIs - Top Priority */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Financial Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <KPICard
              title="Cash in Bank"
              value={formatCurrency(dashboardData.financial_kpis.cash_in_bank)}
              trend={dashboardData.trends.sales_trend}
              icon={Wallet}
              color="text-green-600"
              bgColor="bg-green-50"
            />
            <KPICard
              title="Today's Sales"
              value={formatCurrency(dashboardData.financial_kpis.todays_sales)}
              trend={dashboardData.trends.sales_trend}
            icon={DollarSign}
              color="text-blue-600"
              bgColor="bg-blue-50"
            />
            <KPICard
              title="Receivables"
              value={formatCurrency(dashboardData.financial_kpis.accounts_receivable)}
              trend={dashboardData.trends.receivables_trend}
              icon={CreditCard}
              color="text-purple-600"
              bgColor="bg-purple-50"
            />
            <KPICard
              title="Gross Profit"
              value={formatCurrency(dashboardData.financial_kpis.gross_profit)}
              trend={dashboardData.trends.profit_trend}
            icon={TrendingUp}
              color="text-emerald-600"
              bgColor="bg-emerald-50"
            />
            <KPICard
              title="Fund Requests"
              value={dashboardData.financial_kpis.pending_fund_requests}
              icon={AlertCircle}
              color="text-amber-600"
              bgColor="bg-amber-50"
              onClick={() => navigate('/owner/fund-approvals')}
            />
            <KPICard
              title="Inventory Value"
              value={formatCurrency(dashboardData.financial_kpis.inventory_value)}
              icon={Package}
              color="text-teal-600"
              bgColor="bg-teal-50"
              onClick={() => navigate('/owner/inventory-valuation')}
            />
          </div>
        </div>

        {/* Branch Comparison */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Branch Performance
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <BranchCard branchId="berhane" stats={branchStats.berhane} />
            <BranchCard branchId="girmay" stats={branchStats.girmay} />
          </div>
        </div>

        {/* Main Content - Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white p-1 rounded-lg shadow-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="manager">Manager</TabsTrigger>
            <TabsTrigger value="finance">Finance</TabsTrigger>
            <TabsTrigger value="storekeeper">Storekeeper</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>

          {/* Overview Tab - Activity Feed */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Real-Time Activity Feed
                  </span>
                  <Badge variant="outline">{activityFeed.length} activities</Badge>
              </CardTitle>
            </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {activityFeed.map((activity, index) => (
                    <ActivityItem key={activity.id || index} activity={activity} />
                  ))}
                  {activityFeed.length === 0 && (
                    <p className="text-center text-slate-500 py-8">No recent activity</p>
                  )}
              </div>
            </CardContent>
          </Card>
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-4">
            <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Sales Operations Monitor
              </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-xs text-blue-700">Today's Transactions</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {dashboardData.operations.todays_transaction_count || 0}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-xs text-purple-700">Active Loans</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {dashboardData.operations.active_loans_count || 0}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-xs text-green-700">Stock Requests</p>
                    <p className="text-2xl font-bold text-green-900">
                      {dashboardData.operations.pending_stock_requests || 0}
                    </p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <p className="text-xs text-amber-700">Revenue</p>
                    <p className="text-xl font-bold text-amber-900">
                      {formatCurrency(dashboardData.financial_kpis.todays_sales)}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Recent Sales Activity</h3>
                  {activityFeed.filter(a => a.role === 'sales').slice(0, 10).map((activity, index) => (
                    <ActivityItem key={index} activity={activity} />
                  ))}
              </div>
            </CardContent>
          </Card>
          </TabsContent>

          {/* Manager Tab */}
          <TabsContent value="manager" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Factory className="w-5 h-5" />
                  Manager Operations Monitor
                </CardTitle>
            </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-xs text-blue-700">Active Milling Orders</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {(branchStats.berhane?.active_milling_orders || 0) + 
                       (branchStats.girmay?.active_milling_orders || 0)}
                      </p>
                    </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-xs text-green-700">Today's Production</p>
                    <p className="text-2xl font-bold text-green-900">
                      {((branchStats.berhane?.todays_production || 0) + 
                        (branchStats.girmay?.todays_production || 0)).toLocaleString()}kg
                      </p>
                    </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-xs text-purple-700">Approvals Pending</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {(branchStats.berhane?.pending_stock_requests || 0) + 
                       (branchStats.girmay?.pending_stock_requests || 0)}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Recent Manager Activity</h3>
                  {activityFeed.filter(a => a.role === 'manager').slice(0, 10).map((activity, index) => (
                    <ActivityItem key={index} activity={activity} />
                  ))}
                </div>
            </CardContent>
          </Card>
          </TabsContent>

          {/* Finance Tab */}
          <TabsContent value="finance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Finance Operations Monitor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-xs text-green-700">Cash Balance</p>
                    <p className="text-xl font-bold text-green-900">
                      {formatCurrency(dashboardData.financial_kpis.cash_in_bank)}
                    </p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <p className="text-xs text-amber-700">Pending Payments</p>
                    <p className="text-2xl font-bold text-amber-900">
                      {dashboardData.operations.pending_purchase_requisitions || 0}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-xs text-blue-700">Fund Requests</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {dashboardData.financial_kpis.pending_fund_requests}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Recent Finance Activity</h3>
                  {activityFeed.filter(a => a.role === 'finance').slice(0, 10).map((activity, index) => (
                    <ActivityItem key={index} activity={activity} />
                  ))}
        </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Storekeeper Tab */}
          <TabsContent value="storekeeper" className="space-y-4">
            <Card>
          <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Boxes className="w-5 h-5" />
                  Storekeeper Operations Monitor
            </CardTitle>
          </CardHeader>
          <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-xs text-purple-700">Total Inventory Value</p>
                    <p className="text-xl font-bold text-purple-900">
                      {formatCurrency(dashboardData.financial_kpis.inventory_value)}
                    </p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <p className="text-xs text-amber-700">Low Stock Alerts</p>
                    <p className="text-2xl font-bold text-amber-900">
                      {(branchStats.berhane?.low_stock_alerts || 0) + 
                       (branchStats.girmay?.low_stock_alerts || 0)}
                    </p>
                    </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-xs text-blue-700">Fulfillments Pending</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {dashboardData.operations.pending_stock_requests || 0}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Recent Storekeeper Activity</h3>
                  {activityFeed.filter(a => a.role === 'storekeeper').slice(0, 10).map((activity, index) => (
                    <ActivityItem key={index} activity={activity} />
              ))}
            </div>
          </CardContent>
        </Card>
          </TabsContent>

          {/* Admin Tab */}
          <TabsContent value="admin" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCog className="w-5 h-5" />
                  Admin Operations Monitor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-xs text-slate-700">Purchase Requisitions</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {dashboardData.operations.pending_purchase_requisitions || 0}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-xs text-blue-700">System Status</p>
                    <p className="text-lg font-bold text-blue-900">Active</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-xs text-green-700">All Approvals</p>
                    <p className="text-2xl font-bold text-green-900">
                      {(dashboardData.operations.pending_purchase_requisitions || 0) +
                       (dashboardData.operations.pending_stock_requests || 0)}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Recent Admin Activity</h3>
                  {activityFeed.filter(a => a.role === 'admin').slice(0, 10).map((activity, index) => (
                    <ActivityItem key={index} activity={activity} />
            ))}
          </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
              <Button
                onClick={() => navigate("/owner/fund-approvals")}
                className="h-auto py-4 bg-amber-600 hover:bg-amber-700 text-white flex flex-col gap-2 relative"
              >
                <Send className="w-5 h-5" />
                <span className="text-xs">Fund Approvals</span>
                {dashboardData.financial_kpis.pending_fund_requests > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                    {dashboardData.financial_kpis.pending_fund_requests}
                  </Badge>
                )}
              </Button>
              <Button
                onClick={() => navigate("/approvals")}
                className="h-auto py-4 bg-green-600 hover:bg-green-700 text-white flex flex-col gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span className="text-xs">General Approvals</span>
              </Button>
              <Button
                onClick={() => navigate("/owner/financial-controls")}
                className="h-auto py-4 bg-indigo-600 hover:bg-indigo-700 text-white flex flex-col gap-2"
              >
                <Settings className="w-5 h-5" />
                <span className="text-xs">Financial Controls</span>
              </Button>
              <Button
                onClick={() => navigate("/owner/inventory-valuation")}
                className="h-auto py-4 bg-teal-600 hover:bg-teal-700 text-white flex flex-col gap-2"
              >
                <Package className="w-5 h-5" />
                <span className="text-xs">Inventory Value</span>
              </Button>
              <Button
                onClick={() => navigate("/ratio-config")}
                className="h-auto py-4 bg-slate-900 hover:bg-slate-800 text-white flex flex-col gap-2"
              >
                <Settings className="w-5 h-5" />
                <span className="text-xs">Ratio Config</span>
              </Button>
              <Button
                onClick={() => navigate("/reports")}
                className="h-auto py-4 bg-blue-600 hover:bg-blue-700 text-white flex flex-col gap-2"
              >
                <FileBarChart className="w-5 h-5" />
                <span className="text-xs">Reports</span>
              </Button>
              <Button
                onClick={() => navigate("/user-management")}
                className="h-auto py-4 bg-purple-600 hover:bg-purple-700 text-white flex flex-col gap-2"
              >
                <UserCog className="w-5 h-5" />
                <span className="text-xs">Users</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OwnerDashboard;
