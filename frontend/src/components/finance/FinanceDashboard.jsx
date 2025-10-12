import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  AlertCircle, 
  CheckCircle2,
  Clock,
  FileText,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  ShoppingCart,
  Package,
  Calendar,
  Building2,
  Bell,
  Settings,
  Download,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FinanceDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    kpis: {
      cashBalance: 0,
      pendingPayments: 0,
      accountsReceivable: 0,
      todaysSales: 0,
      cashFlow: 0,
      monthlyRevenue: 0
    },
    pendingApprovals: [],
    recentTransactions: [],
    alerts: []
  });
  const [spendingLimits, setSpendingLimits] = useState(null);

  useEffect(() => {
    // Load dashboard data
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
    const financeOfficer = 'Finance Officer'; // Replace with actual user
    
    try {
      // Parallel fetch all data
      const [
        financeSum,
        pendingAuth,
        recentTxns,
        pendingRecon,
        loansData,
        limitsData
      ] = await Promise.all([
        fetch(`${BACKEND_URL}/api/finance/summary`).then(r => r.ok ? r.json() : {}),
        fetch(`${BACKEND_URL}/api/finance/pending-authorizations`).then(r => r.ok ? r.json() : []),
        fetch(`${BACKEND_URL}/api/finance/transactions?limit=10`).then(r => r.ok ? r.json() : []),
        fetch(`${BACKEND_URL}/api/finance/reconciliation/pending`).then(r => r.ok ? r.json() : []),
        fetch(`${BACKEND_URL}/api/loans?status=active&limit=100`).then(r => r.ok ? r.json() : []),
        fetch(`${BACKEND_URL}/api/finance/spending-limits?finance_officer=${financeOfficer}`).then(r => r.ok ? r.json() : null)
      ]);
      
      setSpendingLimits(limitsData);

      // Calculate KPIs
      const totalReceivable = loansData.reduce((sum, loan) => sum + (loan.balance || 0), 0);
      const pendingPaymentsTotal = pendingAuth.reduce((sum, pr) => sum + (pr.estimated_cost || 0), 0);

      // Format pending approvals
      const formattedApprovals = pendingAuth.slice(0, 5).map((pr, index) => ({
        id: pr.id || index,
        type: 'Payment',
        title: pr.description || 'Purchase Request',
        amount: pr.estimated_cost || 0,
        requestedBy: pr.requested_by || 'Unknown',
        date: new Date(pr.requested_at || Date.now()).toLocaleDateString(),
        priority: pr.estimated_cost > 1000000 ? 'High' : pr.estimated_cost > 100000 ? 'Medium' : 'Low',
        status: pr.status || 'owner_approved'
      }));

      // Format recent transactions
      const formattedTransactions = recentTxns.map((txn) => ({
        id: txn.id,
        type: txn.type,
        description: txn.description || 'Transaction',
        amount: txn.amount || 0,
        date: new Date(txn.transaction_date || txn.created_at).toLocaleString(),
        branch: txn.branch_id || 'Unknown',
        status: txn.reconciliation_status === 'reconciled' ? 'completed' : 'pending'
      }));

      // Generate alerts
      const alerts = [];
      if (pendingPaymentsTotal > 0) {
        alerts.push({
          id: 1,
          type: 'warning',
          title: 'Pending Payments',
          message: `${pendingAuth.length} payment(s) totaling Br ${pendingPaymentsTotal.toLocaleString()} require processing`,
          priority: 'high'
        });
      }
      if (pendingRecon.length > 0) {
        alerts.push({
          id: 2,
          type: 'info',
          title: 'Daily Reconciliation Needed',
          message: `${pendingRecon.length} reconciliation(s) awaiting verification`,
          priority: 'medium'
        });
      }
      if (financeSum.net_balance > 0) {
        alerts.push({
          id: 3,
          type: 'success',
          title: 'Positive Cash Flow',
          message: 'Net cash flow is positive',
          priority: 'low'
        });
      }

      setDashboardData({
        kpis: {
          cashBalance: financeSum.cash_account || 0,
          pendingPayments: pendingPaymentsTotal,
          accountsReceivable: totalReceivable,
          todaysSales: 0, // Will be calculated from today's transactions
          cashFlow: financeSum.net_balance || 0,
          monthlyRevenue: financeSum.total_income || 0
        },
        pendingApprovals: formattedApprovals,
        recentTransactions: formattedTransactions,
        alerts: alerts
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set empty/default data on error
      setDashboardData({
        kpis: {
          cashBalance: 0,
          pendingPayments: 0,
          accountsReceivable: 0,
          todaysSales: 0,
          cashFlow: 0,
          monthlyRevenue: 0
        },
        pendingApprovals: [],
        recentTransactions: [],
        alerts: [{
          id: 1,
          type: 'warning',
          title: 'Connection Error',
          message: 'Unable to load dashboard data',
          priority: 'high'
        }]
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    // Handle undefined, null, or invalid values
    if (amount === undefined || amount === null || isNaN(amount)) {
      return 'Br 0';
    }
    return `Br ${Number(amount).toLocaleString()}`;
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      'High': 'destructive',
      'Medium': 'warning',
      'Low': 'secondary'
    };
    return <Badge variant={variants[priority] || 'default'}>{priority}</Badge>;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'completed': { variant: 'success', icon: CheckCircle2, text: 'Completed' },
      'pending': { variant: 'warning', icon: Clock, text: 'Pending' },
      'owner_approved': { variant: 'default', icon: CheckCircle2, text: 'Ready to Process' },
      'admin_approved': { variant: 'secondary', icon: Clock, text: 'Awaiting Owner' },
      'manager_approved': { variant: 'secondary', icon: Clock, text: 'Awaiting Admin' }
    };
    const config = statusConfig[status] || { variant: 'default', icon: Clock, text: status };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Wallet className="w-12 h-12 mx-auto mb-4 text-green-600 animate-pulse" />
          <p className="text-slate-600">Loading Finance Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-green-600 p-3 rounded-2xl">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Finance Dashboard</h1>
              <p className="text-slate-600">Financial Operations & Cash Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Today: {new Date().toLocaleDateString('en-ET')}
            </Button>
            <Button variant="outline" size="icon">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Cash Balance */}
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-green-700">
                  Cash in Bank
                </CardTitle>
                <div className="bg-green-100 p-2 rounded-lg">
                  <Wallet className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">
                {formatCurrency(dashboardData.kpis.cashBalance)}
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>+12% from last month</span>
              </div>
            </CardContent>
          </Card>

          {/* Pending Payments */}
          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-amber-700">
                  Pending Payments
                </CardTitle>
                <div className="bg-amber-100 p-2 rounded-lg">
                  <CreditCard className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-900">
                {formatCurrency(dashboardData.kpis.pendingPayments)}
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-amber-600">
                <Clock className="w-4 h-4" />
                <span>{dashboardData.pendingApprovals.length} items awaiting</span>
              </div>
            </CardContent>
          </Card>

          {/* Accounts Receivable */}
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-blue-700">
                  Accounts Receivable
                </CardTitle>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">
                {formatCurrency(dashboardData.kpis.accountsReceivable)}
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-blue-600">
                <AlertCircle className="w-4 h-4" />
                <span>Outstanding loans</span>
              </div>
            </CardContent>
          </Card>

          {/* Today's Sales */}
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-purple-700">
                  Today's Sales
                </CardTitle>
                <div className="bg-purple-100 p-2 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">
                {formatCurrency(dashboardData.kpis.todaysSales)}
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-purple-600">
                <TrendingUp className="w-4 h-4" />
                <span>Both branches combined</span>
              </div>
            </CardContent>
          </Card>

          {/* Cash Flow */}
          <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-teal-700">
                  Cash Flow (Today)
                </CardTitle>
                <div className="bg-teal-100 p-2 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-teal-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-teal-900">
                {formatCurrency(dashboardData.kpis.cashFlow)}
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-teal-600">
                <ArrowUpRight className="w-4 h-4" />
                <span>Positive flow</span>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Revenue */}
          <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-700">
                  Monthly Revenue
                </CardTitle>
                <div className="bg-slate-100 p-2 rounded-lg">
                  <DollarSign className="w-5 h-5 text-slate-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {formatCurrency(dashboardData.kpis.monthlyRevenue)}
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-slate-600">
                <Calendar className="w-4 h-4" />
                <span>January 2025</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Spending Limits Widget */}
        {spendingLimits && (
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-purple-900 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Your Spending Limits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Daily Limit */}
                {spendingLimits.daily_limit && (
                  <div className="bg-white p-4 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-700 mb-2">Today's Spending</p>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-2xl font-bold text-purple-900">
                        {formatCurrency(spendingLimits.daily_spent)}
                      </span>
                      <span className="text-sm text-slate-500">
                        / {formatCurrency(spendingLimits.daily_limit)}
                      </span>
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                      <div
                        className={`h-2 rounded-full ${
                          (spendingLimits.daily_spent / spendingLimits.daily_limit) > 0.8 ? 'bg-red-500' :
                          (spendingLimits.daily_spent / spendingLimits.daily_limit) > 0.5 ? 'bg-amber-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((spendingLimits.daily_spent / spendingLimits.daily_limit) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-purple-600 mt-1">
                      Remaining: {formatCurrency(spendingLimits.daily_remaining)}
                    </p>
                  </div>
                )}

                {/* Monthly Limit */}
                {spendingLimits.monthly_limit && (
                  <div className="bg-white p-4 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-700 mb-2">This Month's Spending</p>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-2xl font-bold text-purple-900">
                        {formatCurrency(spendingLimits.monthly_spent)}
                      </span>
                      <span className="text-sm text-slate-500">
                        / {formatCurrency(spendingLimits.monthly_limit)}
                      </span>
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                      <div
                        className={`h-2 rounded-full ${
                          (spendingLimits.monthly_spent / spendingLimits.monthly_limit) > 0.8 ? 'bg-red-500' :
                          (spendingLimits.monthly_spent / spendingLimits.monthly_limit) > 0.5 ? 'bg-amber-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((spendingLimits.monthly_spent / spendingLimits.monthly_limit) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-purple-600 mt-1">
                      Remaining: {formatCurrency(spendingLimits.monthly_remaining)}
                    </p>
                  </div>
                )}

                {/* Authorization Thresholds */}
                {spendingLimits.thresholds && (
                  <div className="bg-white p-4 rounded-lg border border-purple-200 md:col-span-2">
                    <p className="text-sm text-purple-700 mb-3 font-semibold">Payment Authorization Levels</p>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="text-center">
                        <div className="bg-green-100 rounded-lg p-2 mb-1">
                          <p className="font-semibold text-green-900">Auto-Process</p>
                          <p className="text-green-700">&lt; {formatCurrency(spendingLimits.thresholds.auto_approval)}</p>
                        </div>
                        <p className="text-slate-600">Direct processing</p>
                      </div>
                      <div className="text-center">
                        <div className="bg-amber-100 rounded-lg p-2 mb-1">
                          <p className="font-semibold text-amber-900">Owner Approval</p>
                          <p className="text-amber-700">&gt; {formatCurrency(spendingLimits.thresholds.owner_approval)}</p>
                        </div>
                        <p className="text-slate-600">Request funds</p>
                      </div>
                      <div className="text-center">
                        <div className="bg-red-100 rounded-lg p-2 mb-1">
                          <p className="font-semibold text-red-900">Multi-Signature</p>
                          <p className="text-red-700">&gt; {formatCurrency(spendingLimits.thresholds.multi_signature)}</p>
                        </div>
                        <p className="text-slate-600">Owner + Admin</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="border-slate-200 shadow-md">
          <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white h-auto py-4 flex flex-col gap-2"
                onClick={() => navigate('/finance/payment-processing')}
              >
                <CreditCard className="w-6 h-6" />
                <span className="text-sm">Process Payments</span>
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white h-auto py-4 flex flex-col gap-2"
                onClick={() => navigate('/finance/reconciliation')}
              >
                <CheckCircle2 className="w-6 h-6" />
                <span className="text-sm">Reconcile Sales</span>
              </Button>
              <Button 
                className="bg-purple-600 hover:bg-purple-700 text-white h-auto py-4 flex flex-col gap-2"
                onClick={() => navigate('/finance/receivables')}
              >
                <Users className="w-6 h-6" />
                <span className="text-sm">Manage Receivables</span>
              </Button>
              <Button 
                className="bg-orange-600 hover:bg-orange-700 text-white h-auto py-4 flex flex-col gap-2"
                onClick={() => navigate('/finance/reports')}
              >
                <FileText className="w-6 h-6" />
                <span className="text-sm">Financial Reports</span>
              </Button>
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700 text-white h-auto py-4 flex flex-col gap-2"
                onClick={() => navigate('/finance/income-recording')}
              >
                <DollarSign className="w-6 h-6" />
                <span className="text-sm">Record Income</span>
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white h-auto py-4 flex flex-col gap-2"
                onClick={() => navigate('/finance/expense-recording')}
              >
                <TrendingDown className="w-6 h-6" />
                <span className="text-sm">Record Expense</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content - Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Approvals ({dashboardData.pendingApprovals.length})
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Recent Transactions
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Alerts ({dashboardData.alerts.length})
            </TabsTrigger>
          </TabsList>

          {/* Pending Approvals Tab */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Payments Awaiting Processing</CardTitle>
                <CardDescription>
                  Owner-approved purchase requisitions ready for payment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.pendingApprovals.map((approval) => (
                    <div 
                      key={approval.id} 
                      className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline">{approval.type}</Badge>
                            {getPriorityBadge(approval.priority)}
                            {getStatusBadge(approval.status)}
                          </div>
                          <h3 className="font-semibold text-slate-900 mb-1">
                            {approval.title}
                          </h3>
                          <p className="text-sm text-slate-600">
                            Requested by: {approval.requestedBy} • {approval.date}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(approval.amount)}
                          </div>
                        </div>
                      </div>
                      {approval.status === 'owner_approved' && (
                        <div className="flex gap-2 mt-4">
                          <Button 
                            className="bg-green-600 hover:bg-green-700 flex-1"
                            onClick={() => navigate('/finance/payment-processing', { state: { approval } })}
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Process Payment
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <FileText className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recent Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Recent Financial Transactions</CardTitle>
                <CardDescription>
                  Latest income and expense transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.recentTransactions.map((transaction) => (
                    <div 
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          transaction.type === 'income' ? 'bg-green-100' : 
                          transaction.type === 'expense' ? 'bg-red-100' : 'bg-blue-100'
                        }`}>
                          {transaction.type === 'income' ? (
                            <ArrowUpRight className={`w-5 h-5 ${
                              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`} />
                          ) : transaction.type === 'expense' ? (
                            <ArrowDownRight className="w-5 h-5 text-red-600" />
                          ) : (
                            <Clock className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {transaction.description}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-slate-600">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {transaction.branch}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {transaction.date}
                            </span>
                            {getStatusBadge(transaction.status)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xl font-bold ${
                          transaction.type === 'income' ? 'text-green-600' : 
                          transaction.type === 'expense' ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle>Financial Alerts & Notifications</CardTitle>
                <CardDescription>
                  Important updates requiring your attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.alerts.map((alert) => (
                    <div 
                      key={alert.id}
                      className={`p-4 rounded-lg border ${
                        alert.type === 'warning' ? 'bg-amber-50 border-amber-200' :
                        alert.type === 'info' ? 'bg-blue-50 border-blue-200' :
                        'bg-green-50 border-green-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          alert.type === 'warning' ? 'bg-amber-100' :
                          alert.type === 'info' ? 'bg-blue-100' :
                          'bg-green-100'
                        }`}>
                          {alert.type === 'warning' ? (
                            <AlertCircle className="w-5 h-5 text-amber-600" />
                          ) : alert.type === 'info' ? (
                            <Clock className="w-5 h-5 text-blue-600" />
                          ) : (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 mb-1">
                            {alert.title}
                          </h3>
                          <p className="text-sm text-slate-600">
                            {alert.message}
                          </p>
                        </div>
                        {getPriorityBadge(alert.priority.charAt(0).toUpperCase() + alert.priority.slice(1))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Download Reports Section */}
        <Card className="border-slate-200 shadow-md">
          <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Daily Financial Report
              </Button>
              <Button variant="outline" className="justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Monthly P&L Statement
              </Button>
              <Button variant="outline" className="justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Cash Flow Statement
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default FinanceDashboard;

