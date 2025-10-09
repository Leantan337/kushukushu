import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { DollarSign, TrendingUp, ShoppingCart, Clock, RefreshCw } from 'lucide-react';

const SimpleSalesDashboard = () => {
  const [todaysSales, setTodaysSales] = useState({
    totalSales: 0,
    totalTransactions: 0,
    cashSales: 0,
    creditSales: 0,
    loading: true
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchTodaysSales();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchTodaysSales, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTodaysSales = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/reports/sales?period=daily`);
      if (response.ok) {
        const data = await response.json();
        setTodaysSales({
          totalSales: data.summary?.total_sales || 0,
          totalTransactions: data.summary?.total_transactions || 0,
          cashSales: data.summary?.cash_sales || 0,
          creditSales: data.summary?.credit_sales || 0,
          loading: false
        });
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
      setTodaysSales(prev => ({ ...prev, loading: false }));
    }
  };

  const handleRefresh = () => {
    setTodaysSales(prev => ({ ...prev, loading: true }));
    fetchTodaysSales();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-slate-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-3">
              <TrendingUp className="w-8 h-8" />
              Sales Dashboard - Today's Performance
            </CardTitle>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleRefresh}
              disabled={todaysSales.loading}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${todaysSales.loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {todaysSales.loading ? (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-pulse" />
              <p className="text-gray-500">Loading today's sales data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Sales */}
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-green-700">
                      Today's Total Sales
                    </CardTitle>
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-700 mb-1">
                    ETB {todaysSales.totalSales.toLocaleString()}
                  </div>
                  <p className="text-xs text-green-600">
                    Revenue generated today
                  </p>
                </CardContent>
              </Card>

              {/* Total Transactions */}
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-blue-700">
                      Total Transactions
                    </CardTitle>
                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-700 mb-1">
                    {todaysSales.totalTransactions}
                  </div>
                  <p className="text-xs text-blue-600">
                    Sales completed today
                  </p>
                </CardContent>
              </Card>

              {/* Cash Sales */}
              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-emerald-700">
                      Cash Sales
                    </CardTitle>
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-emerald-700 mb-1">
                    ETB {todaysSales.cashSales.toLocaleString()}
                  </div>
                  <p className="text-xs text-emerald-600">
                    Immediate payments
                  </p>
                </CardContent>
              </Card>

              {/* Credit Sales */}
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-orange-700">
                      Credit Sales (Loans)
                    </CardTitle>
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-700 mb-1">
                    ETB {todaysSales.creditSales.toLocaleString()}
                  </div>
                  <p className="text-xs text-orange-600">
                    Outstanding receivables
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Additional Info */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Auto-refreshes every 30 seconds
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleSalesDashboard;