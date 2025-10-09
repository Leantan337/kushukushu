import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { TrendingUp, DollarSign, ShoppingCart, CreditCard, Package } from "lucide-react";
import { useToast } from "../../hooks/use-toast";

const SalesReports = () => {
  const { toast } = useToast();
  const [period, setPeriod] = useState("daily");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchReport();
  }, [period]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/reports/sales?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch sales report",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch sales report",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card className="border-slate-200 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900">Sales Performance Report</CardTitle>
              <CardDescription>View your sales statistics and performance</CardDescription>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="period">Report Period</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Today</SelectItem>
                  <SelectItem value="weekly">This Week</SelectItem>
                  <SelectItem value="monthly">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={fetchReport} className="mt-6 bg-blue-500 hover:bg-blue-600">
              Refresh Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      {reportData && reportData.summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-slate-200 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Total Sales</CardTitle>
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                ETB {reportData.summary.total_sales?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {reportData.summary.total_transactions || 0} transactions
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Cash Sales</CardTitle>
                <DollarSign className="w-5 h-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                ETB {reportData.summary.cash_sales?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">Paid transactions</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Credit Sales</CardTitle>
                <CreditCard className="w-5 h-5 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                ETB {reportData.summary.credit_sales?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">Unpaid (loan) transactions</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Avg Transaction</CardTitle>
                <ShoppingCart className="w-5 h-5 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                ETB {reportData.summary.average_transaction?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">Per transaction</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Products */}
      {reportData && reportData.top_products && reportData.top_products.length > 0 && (
        <Card className="border-slate-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Top Selling Products
            </CardTitle>
            <CardDescription>Best performing products in this period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.top_products.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{product.product_name}</p>
                      <p className="text-sm text-slate-600">{product.total_quantity} kg sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">ETB {product.total_revenue?.toLocaleString() || 0}</p>
                    <p className="text-xs text-slate-500">{product.transaction_count} transactions</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      {reportData && reportData.transactions && reportData.transactions.length > 0 && (
        <Card className="border-slate-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-slate-900">Recent Transactions</CardTitle>
            <CardDescription>Latest sales in this period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.transactions.slice(0, 10).map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono font-semibold text-slate-900">{transaction.transaction_number}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        transaction.status === "paid" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-orange-100 text-orange-700"
                      }`}>
                        {transaction.status}
                      </span>
                      <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                        {transaction.payment_type}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      {transaction.items?.length || 0} items • {new Date(transaction.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">ETB {transaction.total_amount?.toLocaleString() || 0}</p>
                    {transaction.customer_name && (
                      <p className="text-xs text-slate-500">{transaction.customer_name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {reportData && reportData.transactions && reportData.transactions.length === 0 && (
        <Card className="border-slate-200 shadow-md">
          <CardContent className="py-12">
            <div className="text-center">
              <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-lg font-medium">No transactions found</p>
              <p className="text-slate-500 text-sm mt-2">There are no sales in the selected period</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SalesReports;
