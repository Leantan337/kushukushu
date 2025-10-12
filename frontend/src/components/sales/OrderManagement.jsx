import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { 
  ShoppingCart, 
  Package, 
  FileText, 
  CheckCircle,
  Clock,
  XCircle,
  Search,
  TrendingUp
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";

const OrderManagement = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [salesOrders, setSalesOrders] = useState([]);
  const [stockRequests, setStockRequests] = useState([]);
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchAllOrders();
    const interval = setInterval(fetchAllOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllOrders = async () => {
    try {
      // Fetch sales transactions
      const salesRes = await fetch(`${BACKEND_URL}/api/sales-transactions`);
      if (salesRes.ok) {
        const salesData = await salesRes.json();
        setSalesOrders(salesData);
      }

      // Fetch stock requests
      const stockRes = await fetch(`${BACKEND_URL}/api/stock-requests`);
      if (stockRes.ok) {
        const stockData = await stockRes.json();
        setStockRequests(stockData);
      }

      // Fetch purchase requests
      const purchaseRes = await fetch(`${BACKEND_URL}/api/purchase-requisitions`);
      if (purchaseRes.ok) {
        const purchaseData = await purchaseRes.json();
        setPurchaseRequests(purchaseData);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const getStatusBadge = (type, status) => {
    const statusColors = {
      sales: {
        paid: "bg-green-500",
        unpaid: "bg-orange-500"
      },
      stock: {
        confirmed: "bg-green-500",
        in_transit: "bg-blue-500",
        pending_admin_approval: "bg-yellow-500",
        pending_manager_approval: "bg-yellow-500",
        pending_fulfillment: "bg-orange-500",
        rejected: "bg-red-500"
      },
      purchase: {
        owner_approved: "bg-green-500",
        purchased: "bg-blue-500",
        received: "bg-green-600",
        pending: "bg-yellow-500",
        rejected: "bg-red-500"
      }
    };

    const color = statusColors[type]?.[status] || "bg-slate-500";
    return <Badge className={color}>{status?.replace(/_/g, ' ')}</Badge>;
  };

  const filteredSales = salesOrders.filter(order => 
    (filterStatus === "all" || order.status === filterStatus) &&
    (searchTerm === "" || 
     order.transaction_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
     order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredStock = stockRequests.filter(request =>
    (filterStatus === "all" || request.status.includes(filterStatus)) &&
    (searchTerm === "" || 
     request.request_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
     request.product_name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredPurchase = purchaseRequests.filter(request =>
    (filterStatus === "all" || request.status === filterStatus) &&
    (searchTerm === "" || 
     request.request_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
     request.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-slate-200 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Sales Orders</CardTitle>
              <ShoppingCart className="w-5 h-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{salesOrders.length}</div>
            <p className="text-xs text-slate-500 mt-1">
              {salesOrders.filter(s => s.status === "paid").length} completed
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Stock Requests</CardTitle>
              <Package className="w-5 h-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stockRequests.length}</div>
            <p className="text-xs text-slate-500 mt-1">
              {stockRequests.filter(s => s.status === "confirmed").length} confirmed
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Purchase Requests</CardTitle>
              <FileText className="w-5 h-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{purchaseRequests.length}</div>
            <p className="text-xs text-slate-500 mt-1">
              {purchaseRequests.filter(p => p.status === "pending").length} pending
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Total Value</CardTitle>
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              ETB {salesOrders.reduce((sum, s) => sum + (s.total_amount || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">Sales revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border-slate-200 shadow-md">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search orders by number, customer, product..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Tabs */}
      <Card className="border-slate-200 shadow-md">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="sales">Sales Orders</TabsTrigger>
              <TabsTrigger value="stock">Stock Requests</TabsTrigger>
              <TabsTrigger value="purchase">Purchase Requests</TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent>
            {/* All Orders Tab */}
            <TabsContent value="all" className="space-y-4">
              <div className="space-y-3">
                {/* Sales Orders */}
                {filteredSales.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Sales Orders ({filteredSales.length})
                    </h4>
                    {filteredSales.slice(0, 5).map((order) => (
                      <div key={order.id} className="border border-slate-200 rounded p-3 mb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-mono font-semibold text-slate-900">{order.transaction_number}</p>
                            <p className="text-sm text-slate-600">{order.customer_name || "Walk-in customer"}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(order.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            {getStatusBadge("sales", order.status)}
                            <p className="font-bold text-slate-900 mt-1">
                              ETB {order.total_amount?.toLocaleString()}
                            </p>
                            <p className="text-xs text-slate-500">{order.payment_type}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Stock Requests */}
                {filteredStock.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2 mt-4">
                      <Package className="w-4 h-4" />
                      Stock Requests ({filteredStock.length})
                    </h4>
                    {filteredStock.slice(0, 5).map((request) => (
                      <div key={request.id} className="border border-slate-200 rounded p-3 mb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-mono font-semibold text-slate-900">{request.request_number}</p>
                            <p className="text-sm text-slate-600">{request.product_name}</p>
                            <p className="text-xs text-slate-500">
                              {request.quantity} × {request.package_size}
                            </p>
                          </div>
                          <div className="text-right">
                            {getStatusBadge("stock", request.status)}
                            <p className="text-xs text-slate-500 mt-1">
                              {new Date(request.requested_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Purchase Requests */}
                {filteredPurchase.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2 mt-4">
                      <FileText className="w-4 h-4" />
                      Purchase Requests ({filteredPurchase.length})
                    </h4>
                    {filteredPurchase.slice(0, 5).map((request) => (
                      <div key={request.id} className="border border-slate-200 rounded p-3 mb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-mono font-semibold text-slate-900">{request.request_number}</p>
                            <p className="text-sm text-slate-600">{request.description}</p>
                            <p className="text-xs text-slate-500">
                              {request.vendor_name || "No vendor"}
                            </p>
                          </div>
                          <div className="text-right">
                            {getStatusBadge("purchase", request.status)}
                            <p className="font-semibold text-slate-900 mt-1">
                              ETB {request.estimated_cost?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Sales Orders Tab */}
            <TabsContent value="sales" className="space-y-3">
              {filteredSales.map((order) => (
                <div key={order.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-mono font-bold text-slate-900">{order.transaction_number}</h3>
                        {getStatusBadge("sales", order.status)}
                        <Badge variant="outline">{order.payment_type}</Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        Customer: <span className="font-medium">{order.customer_name || "Walk-in"}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(order.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600 text-lg">
                        ETB {order.total_amount?.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">{order.items?.length || 0} items</p>
                    </div>
                  </div>

                  {order.items && order.items.length > 0 && (
                    <div className="p-3 bg-slate-50 rounded">
                      <p className="text-xs font-medium text-slate-600 mb-2">Items:</p>
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-slate-700 py-1">
                          <span>{item.product_name}</span>
                          <span>{item.quantity_kg}kg @ ETB {item.unit_price}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </TabsContent>

            {/* Stock Requests Tab */}
            <TabsContent value="stock" className="space-y-3">
              {filteredStock.map((request) => (
                <div key={request.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-mono font-bold text-slate-900">{request.request_number}</h3>
                        {getStatusBadge("stock", request.status)}
                      </div>
                      <p className="text-sm text-slate-600">
                        Product: <span className="font-medium">{request.product_name}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Requested: {new Date(request.requested_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {request.quantity} × {request.package_size}
                      </p>
                      <p className="text-xs text-slate-500">{request.total_weight}kg total</p>
                    </div>
                  </div>

                  {/* Workflow Progress */}
                  {request.workflow_history && request.workflow_history.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs font-medium text-slate-600 mb-2">Workflow Progress:</p>
                      <div className="space-y-1">
                        {request.workflow_history.slice(-3).map((step, idx) => (
                          <div key={idx} className="text-xs text-slate-600 flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span>{step.action} - {step.actor}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </TabsContent>

            {/* Purchase Requests Tab */}
            <TabsContent value="purchase" className="space-y-3">
              {filteredPurchase.map((request) => (
                <div key={request.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-mono font-bold text-slate-900">{request.request_number}</h3>
                        {getStatusBadge("purchase", request.status)}
                        {request.purchase_type && (
                          <Badge variant="outline">{request.purchase_type}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{request.description}</p>
                      {request.vendor_name && (
                        <p className="text-xs text-slate-500 mt-1">
                          Vendor: {request.vendor_name}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-600">
                        ETB {request.estimated_cost?.toLocaleString()}
                      </p>
                      {request.actual_cost && (
                        <p className="text-xs text-green-600">
                          Actual: ETB {request.actual_cost?.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Approval Progress */}
                  <div className="flex gap-2 mt-3">
                    {request.manager_approval && (
                      <Badge variant="outline" className="text-green-600 border-green-300 text-xs">
                        ✓ Manager
                      </Badge>
                    )}
                    {request.admin_approval && (
                      <Badge variant="outline" className="text-green-600 border-green-300 text-xs">
                        ✓ Admin
                      </Badge>
                    )}
                    {request.owner_approval && (
                      <Badge variant="outline" className="text-green-600 border-green-300 text-xs">
                        ✓ Owner
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Quick Insights */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-blue-900 font-semibold">Today's Sales</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {salesOrders.filter(s => {
                  const today = new Date().toDateString();
                  return new Date(s.timestamp).toDateString() === today;
                }).length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-blue-900 font-semibold">Pending Approvals</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {stockRequests.filter(s => s.status.includes("pending")).length +
                 purchaseRequests.filter(p => p.status === "pending").length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-blue-900 font-semibold">In Progress</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {stockRequests.filter(s => s.status === "in_transit" || s.status.includes("fulfillment")).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderManagement;

