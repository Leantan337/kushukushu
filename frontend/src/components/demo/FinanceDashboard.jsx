import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  RefreshCw,
  Clock,
  Phone
} from 'lucide-react';

const FinanceDashboard = () => {
  const [loanData, setLoanData] = useState({
    totalOutstandingLoans: 0,
    totalCustomers: 0,
    recentLoans: [],
    loading: true
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchLoanData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchLoanData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLoanData = async () => {
    try {
      // Fetch all sales transactions to filter loan transactions
      const response = await fetch(`${BACKEND_URL}/api/reports/sales?period=monthly`);
      if (response.ok) {
        const data = await response.json();
        
        // Filter loan transactions from the transactions array
        const loanTransactions = data.transactions?.filter(tx => 
          tx.payment_type === 'loan' && tx.status === 'unpaid'
        ) || [];
        
        // Calculate total outstanding loans
        const totalOutstanding = loanTransactions.reduce((sum, tx) => sum + tx.total_amount, 0);
        
        // Get unique customers
        const uniqueCustomers = [...new Set(loanTransactions.map(tx => tx.customer_name))].length;
        
        // Get recent loan transactions (last 10)
        const recentLoans = loanTransactions
          .sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date))
          .slice(0, 10);

        setLoanData({
          totalOutstandingLoans: totalOutstanding,
          totalCustomers: uniqueCustomers,
          recentLoans: recentLoans,
          loading: false
        });
      }
    } catch (error) {
      console.error('Error fetching loan data:', error);
      setLoanData(prev => ({ ...prev, loading: false }));
    }
  };

  const handleRefresh = () => {
    setLoanData(prev => ({ ...prev, loading: true }));
    fetchLoanData();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-ET', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="border-slate-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-3">
              <CreditCard className="w-8 h-8" />
              Finance Dashboard - Outstanding Loans
            </CardTitle>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleRefresh}
              disabled={loanData.loading}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loanData.loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {loanData.loading ? (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-pulse" />
              <p className="text-gray-500">Loading loan data...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Outstanding */}
                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-red-700">
                        Total Outstanding Loans
                      </CardTitle>
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-700 mb-1">
                      ETB {loanData.totalOutstandingLoans.toLocaleString()}
                    </div>
                    <p className="text-xs text-red-600">
                      Amount to be collected
                    </p>
                  </CardContent>
                </Card>

                {/* Number of Customers */}
                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-orange-700">
                        Customers with Loans
                      </CardTitle>
                      <Users className="w-5 h-5 text-orange-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-700 mb-1">
                      {loanData.totalCustomers}
                    </div>
                    <p className="text-xs text-orange-600">
                      Active loan accounts
                    </p>
                  </CardContent>
                </Card>

                {/* Average Loan */}
                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-yellow-700">
                        Average Loan Amount
                      </CardTitle>
                      <DollarSign className="w-5 h-5 text-yellow-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-yellow-700 mb-1">
                      ETB {loanData.totalCustomers > 0 ? Math.round(loanData.totalOutstandingLoans / loanData.totalCustomers).toLocaleString() : 0}
                    </div>
                    <p className="text-xs text-yellow-600">
                      Per customer average
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Loan Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Recent Loan Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loanData.recentLoans.length > 0 ? (
                    <div className="space-y-3">
                      {loanData.recentLoans.map((transaction, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant="destructive">LOAN</Badge>
                              <span className="font-semibold">{transaction.transaction_number}</span>
                              <span className="text-sm text-gray-500">
                                {formatDate(transaction.transaction_date)}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="font-medium">{transaction.customer_name}</span>
                              {transaction.customer_phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {transaction.customer_phone}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-red-600">
                              ETB {transaction.total_amount.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              Outstanding
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500">No outstanding loans found</p>
                      <p className="text-sm text-gray-400 mt-1">All payments are up to date!</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Additional Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Last updated: {new Date().toLocaleTimeString()}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Auto-refreshes every 30 seconds
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceDashboard;