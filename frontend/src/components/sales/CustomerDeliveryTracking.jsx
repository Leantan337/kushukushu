import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Phone, 
  User,
  Calendar,
  Search
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";

const CustomerDeliveryTracking = () => {
  const { toast } = useToast();
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchCustomerDeliveries();
    const interval = setInterval(fetchCustomerDeliveries, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterDeliveries();
  }, [deliveries, searchTerm, statusFilter, activeTab]);

  const fetchCustomerDeliveries = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/customer-deliveries`);
      if (response.ok) {
        const data = await response.json();
        setDeliveries(data);
      }
    } catch (error) {
      console.error("Error fetching customer deliveries:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterDeliveries = () => {
    let filtered = deliveries;

    // Filter by tab (dispatch status)
    if (activeTab !== "all") {
      filtered = filtered.filter(d => {
        const dispatchStatus = d.dispatch_status || "pending_dispatch";
        return dispatchStatus === activeTab;
      });
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(d => d.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(d => 
        d.request_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.customer_info?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.customer_info?.phone?.includes(searchTerm) ||
        d.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDeliveries(filtered);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending_admin_approval: { color: "bg-yellow-500", label: "Pending Approval" },
      pending_fulfillment: { color: "bg-orange-500", label: "Pending Fulfillment" },
      ready_for_pickup: { color: "bg-blue-500", label: "Ready for Pickup" },
      in_transit: { color: "bg-purple-500", label: "In Transit" },
      confirmed: { color: "bg-green-500", label: "Delivered" },
      rejected: { color: "bg-red-500", label: "Rejected" }
    };
    const config = statusConfig[status] || { color: "bg-gray-500", label: status };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getDispatchBadge = (dispatchStatus) => {
    const config = {
      pending_dispatch: { color: "bg-yellow-500", icon: Clock, label: "Pending Dispatch" },
      dispatched: { color: "bg-blue-500", icon: Truck, label: "Dispatched" },
      delivered: { color: "bg-green-500", icon: CheckCircle, label: "Delivered" }
    };
    const status = config[dispatchStatus] || config.pending_dispatch;
    const Icon = status.icon;
    return (
      <Badge className={status.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.label}
      </Badge>
    );
  };

  const getDeliveryCounts = () => {
    return {
      all: deliveries.length,
      pending_dispatch: deliveries.filter(d => (d.dispatch_status || "pending_dispatch") === "pending_dispatch").length,
      dispatched: deliveries.filter(d => d.dispatch_status === "dispatched").length,
      delivered: deliveries.filter(d => d.dispatch_status === "delivered" || d.status === "confirmed").length
    };
  };

  const counts = getDeliveryCounts();

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Deliveries</p>
                <p className="text-3xl font-bold text-slate-900">{counts.all}</p>
              </div>
              <Package className="w-10 h-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Dispatch</p>
                <p className="text-3xl font-bold text-yellow-600">{counts.pending_dispatch}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Dispatched</p>
                <p className="text-3xl font-bold text-blue-600">{counts.dispatched}</p>
              </div>
              <Truck className="w-10 h-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Delivered</p>
                <p className="text-3xl font-bold text-green-600">{counts.delivered}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-slate-200 shadow-md">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by request #, customer name, phone, or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending_admin_approval">Pending Approval</SelectItem>
                <SelectItem value="pending_fulfillment">Pending Fulfillment</SelectItem>
                <SelectItem value="ready_for_pickup">Ready for Pickup</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="confirmed">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Deliveries List */}
      <Card className="border-slate-200 shadow-md">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader>
            <CardTitle className="text-slate-900">Customer Deliveries</CardTitle>
            <TabsList className="grid grid-cols-4 w-full mt-4">
              <TabsTrigger value="all">
                All ({counts.all})
              </TabsTrigger>
              <TabsTrigger value="pending_dispatch">
                Pending ({counts.pending_dispatch})
              </TabsTrigger>
              <TabsTrigger value="dispatched">
                Dispatched ({counts.dispatched})
              </TabsTrigger>
              <TabsTrigger value="delivered">
                Delivered ({counts.delivered})
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent>
            <TabsContent value={activeTab} className="space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-slate-600">Loading deliveries...</p>
                </div>
              ) : filteredDeliveries.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 text-lg font-medium">No deliveries found</p>
                  <p className="text-slate-500 text-sm mt-2">Try adjusting your filters</p>
                </div>
              ) : (
                filteredDeliveries.map((delivery) => (
                  <Card key={delivery.id} className="border-slate-200">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-mono font-bold text-slate-900">
                                {delivery.request_number}
                              </h3>
                              {getStatusBadge(delivery.status)}
                              {getDispatchBadge(delivery.dispatch_status || "pending_dispatch")}
                            </div>
                            <p className="text-sm text-slate-600">
                              Requested: {new Date(delivery.requested_at).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-slate-500">Product</p>
                              <p className="font-semibold text-slate-900">{delivery.product_name}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Quantity</p>
                              <p className="font-semibold text-green-600">
                                {delivery.quantity} × {delivery.package_size}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Total Weight</p>
                              <p className="font-semibold text-slate-900">{delivery.total_weight} kg</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">From Branch</p>
                              <p className="font-semibold text-slate-900">
                                {delivery.source_branch?.replace('_', ' ').toUpperCase()}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Customer Info */}
                        {delivery.customer_info && (
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                              <User className="w-4 h-4" />
                              Customer Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="flex items-start gap-2">
                                <User className="w-4 h-4 text-blue-600 mt-0.5" />
                                <div>
                                  <p className="text-xs text-blue-700">Name</p>
                                  <p className="font-semibold text-blue-900">
                                    {delivery.customer_info.name}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <Phone className="w-4 h-4 text-blue-600 mt-0.5" />
                                <div>
                                  <p className="text-xs text-blue-700">Phone</p>
                                  <p className="font-semibold text-blue-900">
                                    {delivery.customer_info.phone}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2 md:col-span-2">
                                <MapPin className="w-4 h-4 text-blue-600 mt-0.5" />
                                <div>
                                  <p className="text-xs text-blue-700">Delivery Address</p>
                                  <p className="font-semibold text-blue-900">
                                    {delivery.customer_info.address}
                                  </p>
                                </div>
                              </div>
                              {delivery.customer_info.delivery_date_preference && (
                                <div className="flex items-start gap-2">
                                  <Calendar className="w-4 h-4 text-blue-600 mt-0.5" />
                                  <div>
                                    <p className="text-xs text-blue-700">Preferred Date</p>
                                    <p className="font-semibold text-blue-900">
                                      {new Date(delivery.customer_info.delivery_date_preference).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Dispatch Info */}
                        {delivery.dispatch_info && (
                          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                            <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                              <Truck className="w-4 h-4" />
                              Dispatch Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              {delivery.dispatch_info.driver_name && (
                                <div>
                                  <p className="text-xs text-purple-700">Driver</p>
                                  <p className="font-semibold text-purple-900">
                                    {delivery.dispatch_info.driver_name}
                                  </p>
                                </div>
                              )}
                              {delivery.dispatch_info.vehicle_number && (
                                <div>
                                  <p className="text-xs text-purple-700">Vehicle</p>
                                  <p className="font-semibold text-purple-900">
                                    {delivery.dispatch_info.vehicle_number}
                                  </p>
                                </div>
                              )}
                              {delivery.dispatch_info.dispatched_at && (
                                <div>
                                  <p className="text-xs text-purple-700">Dispatched At</p>
                                  <p className="font-semibold text-purple-900">
                                    {new Date(delivery.dispatch_info.dispatched_at).toLocaleString()}
                                  </p>
                                </div>
                              )}
                              {delivery.dispatch_info.expected_delivery_time && (
                                <div>
                                  <p className="text-xs text-purple-700">Expected Delivery</p>
                                  <p className="font-semibold text-purple-900">
                                    {new Date(delivery.dispatch_info.expected_delivery_time).toLocaleString()}
                                  </p>
                                </div>
                              )}
                              {delivery.dispatch_info.dispatch_notes && (
                                <div className="md:col-span-2">
                                  <p className="text-xs text-purple-700">Notes</p>
                                  <p className="text-purple-900">{delivery.dispatch_info.dispatch_notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Workflow Progress */}
                        {delivery.workflow_history && delivery.workflow_history.length > 0 && (
                          <div className="pt-3 border-t">
                            <p className="text-xs font-medium text-slate-600 mb-2">Progress Timeline:</p>
                            <div className="space-y-1">
                              {delivery.workflow_history.slice(-4).map((step, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                  <span className="font-medium">{step.stage}</span>
                                  <span className="text-slate-400">•</span>
                                  <span>{new Date(step.timestamp).toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Customer Delivery Tracking</p>
              <p className="text-blue-800">
                Track all your customer deliveries in real-time. You'll receive updates as orders are
                approved, fulfilled, and dispatched. Customers can be contacted directly using the
                information shown above.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerDeliveryTracking;

