import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Download,
  Calendar
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";

const CustomerDeliveryReport = () => {
  const { toast } = useToast();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchCustomerDeliveries();
  }, [dateRange]);

  const fetchCustomerDeliveries = async () => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const branchId = user?.branch || "berhane";

      const response = await fetch(
        `${BACKEND_URL}/api/customer-deliveries?branch_id=${branchId}`
      );
      
      if (response.ok) {
        const data = await response.json();
        // Filter by date range
        const filtered = data.filter(d => {
          const requestDate = new Date(d.requested_at).toISOString().split('T')[0];
          return requestDate >= dateRange.start && requestDate <= dateRange.end;
        });
        setDeliveries(filtered);
      }
    } catch (error) {
      console.error("Error fetching customer deliveries:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMetrics = () => {
    const total = deliveries.length;
    const pending = deliveries.filter(d => 
      (!d.dispatch_status || d.dispatch_status === "pending_dispatch") && 
      d.status !== "confirmed"
    ).length;
    const dispatched = deliveries.filter(d => d.dispatch_status === "dispatched").length;
    const delivered = deliveries.filter(d => d.status === "confirmed").length;
    
    // Calculate total weight
    const totalWeight = deliveries.reduce((sum, d) => sum + (d.total_weight || 0), 0);
    
    // Group by sales person
    const bySalesPerson = {};
    deliveries.forEach(d => {
      const person = d.requested_by || "Unknown";
      if (!bySalesPerson[person]) {
        bySalesPerson[person] = { count: 0, delivered: 0 };
      }
      bySalesPerson[person].count++;
      if (d.status === "confirmed") {
        bySalesPerson[person].delivered++;
      }
    });
    
    // Group by status
    const byStatus = {};
    deliveries.forEach(d => {
      const status = d.status || "unknown";
      byStatus[status] = (byStatus[status] || 0) + 1;
    });

    return {
      total,
      pending,
      dispatched,
      delivered,
      totalWeight,
      bySalesPerson,
      byStatus,
      deliveryRate: total > 0 ? ((delivered / total) * 100).toFixed(1) : 0
    };
  };

  const metrics = getMetrics();

  const handleExport = () => {
    // Create CSV content
    const headers = [
      "Request Number",
      "Customer Name",
      "Product",
      "Quantity",
      "Weight (kg)",
      "Status",
      "Dispatch Status",
      "Requested By",
      "Requested Date",
      "Dispatched Date",
      "Delivered Date"
    ];
    
    const rows = deliveries.map(d => [
      d.request_number || "",
      d.customer_info?.name || "",
      d.product_name || "",
      `${d.quantity} × ${d.package_size}`,
      d.total_weight || 0,
      d.status || "",
      d.dispatch_status || "pending",
      d.requested_by || "",
      new Date(d.requested_at).toLocaleDateString(),
      d.dispatch_info?.dispatched_at ? new Date(d.dispatch_info.dispatched_at).toLocaleDateString() : "",
      d.delivered_at ? new Date(d.delivered_at).toLocaleDateString() : ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customer-deliveries-${dateRange.start}-to-${dateRange.end}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Report has been downloaded as CSV"
    });
  };

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <Card className="border-slate-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Report Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="mt-2"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                max={new Date().toISOString().split('T')[0]}
                className="mt-2"
              />
            </div>
            <Button
              onClick={handleExport}
              className="bg-green-500 hover:bg-green-600"
              disabled={deliveries.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-slate-200 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Deliveries</p>
                <p className="text-3xl font-bold text-slate-900">{metrics.total}</p>
                <p className="text-xs text-slate-500 mt-1">{metrics.totalWeight.toFixed(0)} kg total</p>
              </div>
              <Package className="w-12 h-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">Pending</p>
                <p className="text-3xl font-bold text-yellow-900">{metrics.pending}</p>
                <p className="text-xs text-yellow-600 mt-1">
                  {metrics.total > 0 ? ((metrics.pending / metrics.total) * 100).toFixed(0) : 0}% of total
                </p>
              </div>
              <Clock className="w-12 h-12 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Dispatched</p>
                <p className="text-3xl font-bold text-blue-900">{metrics.dispatched}</p>
                <p className="text-xs text-blue-600 mt-1">In transit</p>
              </div>
              <Truck className="w-12 h-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Delivered</p>
                <p className="text-3xl font-bold text-green-900">{metrics.delivered}</p>
                <p className="text-xs text-green-600 mt-1">{metrics.deliveryRate}% delivery rate</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card className="border-slate-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-slate-900">Status Breakdown</CardTitle>
          <CardDescription>Distribution of delivery statuses</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-slate-600">Loading...</p>
          ) : deliveries.length === 0 ? (
            <p className="text-center py-8 text-slate-600">No deliveries in selected period</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(metrics.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="font-medium text-slate-900 capitalize">
                      {status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{count} deliveries</Badge>
                    <span className="text-sm text-slate-600">
                      {((count / metrics.total) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sales Person Performance */}
      <Card className="border-slate-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Sales Person Performance
          </CardTitle>
          <CardDescription>Customer delivery requests by sales personnel</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-slate-600">Loading...</p>
          ) : Object.keys(metrics.bySalesPerson).length === 0 ? (
            <p className="text-center py-8 text-slate-600">No data available</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(metrics.bySalesPerson)
                .sort((a, b) => b[1].count - a[1].count)
                .map(([person, data]) => (
                  <div key={person} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-900">{person}</span>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="bg-blue-50">
                          {data.count} requests
                        </Badge>
                        <Badge variant="outline" className="bg-green-50">
                          {data.delivered} delivered
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ 
                          width: `${data.count > 0 ? (data.delivered / data.count) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      {data.count > 0 ? ((data.delivered / data.count) * 100).toFixed(1) : 0}% delivery completion rate
                    </p>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed List */}
      <Card className="border-slate-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-slate-900">Delivery Details</CardTitle>
          <CardDescription>All customer deliveries in selected period</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-slate-600">Loading...</p>
          ) : deliveries.length === 0 ? (
            <p className="text-center py-8 text-slate-600">No deliveries found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Request #</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Requested By</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {deliveries.map((delivery) => (
                    <tr key={delivery.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-mono text-slate-900">
                        {delivery.request_number}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900">
                        {delivery.customer_info?.name || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900">
                        {delivery.product_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900">
                        {delivery.quantity} × {delivery.package_size}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge className={
                          delivery.status === "confirmed" ? "bg-green-500" :
                          delivery.dispatch_status === "dispatched" ? "bg-blue-500" :
                          "bg-yellow-500"
                        }>
                          {delivery.dispatch_status === "dispatched" ? "Dispatched" :
                           delivery.status === "confirmed" ? "Delivered" :
                           "Pending"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900">
                        {delivery.requested_by}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {new Date(delivery.requested_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Customer Delivery Analytics</p>
              <p className="text-blue-800">
                This report provides comprehensive insights into customer delivery performance.
                Use the date range selector to analyze different periods and export data for further analysis.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerDeliveryReport;

