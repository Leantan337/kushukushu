import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Phone, 
  User,
  Calendar,
  Package,
  Send
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";

const CustomerDeliveryQueue = () => {
  const { toast } = useToast();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [dispatchForm, setDispatchForm] = useState({
    driver_name: "",
    vehicle_number: "",
    expected_delivery_time: "",
    dispatch_notes: ""
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchCustomerDeliveries();
    const interval = setInterval(fetchCustomerDeliveries, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCustomerDeliveries = async () => {
    try {
      // Get user's branch
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const branchId = user?.branch || "berhane";

      const response = await fetch(
        `${BACKEND_URL}/api/customer-deliveries?branch_id=${branchId}`
      );
      
      if (response.ok) {
        const data = await response.json();
        // Filter for deliveries that are ready for dispatch (approved and fulfilled)
        const readyForDispatch = data.filter(d => 
          d.status === "ready_for_pickup" || 
          d.status === "in_transit" || 
          d.status === "confirmed" ||
          d.dispatch_status
        );
        setDeliveries(readyForDispatch);
      }
    } catch (error) {
      console.error("Error fetching customer deliveries:", error);
    }
  };

  const handleDispatchFormChange = (field, value) => {
    setDispatchForm(prev => ({ ...prev, [field]: value }));
  };

  const handleDispatch = async (deliveryId) => {
    if (!dispatchForm.driver_name || !dispatchForm.vehicle_number) {
      toast({
        title: "Error",
        description: "Please provide driver name and vehicle number",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const userName = user?.name || user?.username || "Manager";

      const response = await fetch(`${BACKEND_URL}/api/stock-requests/${deliveryId}/dispatch`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dispatched_by: userName,
          driver_name: dispatchForm.driver_name,
          vehicle_number: dispatchForm.vehicle_number,
          expected_delivery_time: dispatchForm.expected_delivery_time,
          dispatch_notes: dispatchForm.dispatch_notes
        })
      });

      if (response.ok) {
        toast({
          title: "✓ Dispatched",
          description: "Delivery has been marked as dispatched",
        });
        setSelectedDelivery(null);
        setDispatchForm({
          driver_name: "",
          vehicle_number: "",
          expected_delivery_time: "",
          dispatch_notes: ""
        });
        fetchCustomerDeliveries();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.detail || "Failed to dispatch delivery",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to dispatch delivery",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (delivery) => {
    const dispatchStatus = delivery.dispatch_status || "pending_dispatch";
    
    if (dispatchStatus === "dispatched") {
      return <Badge className="bg-blue-500"><Truck className="w-3 h-3 mr-1" />Dispatched</Badge>;
    } else if (delivery.status === "confirmed") {
      return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Delivered</Badge>;
    } else {
      return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Pending Dispatch</Badge>;
    }
  };

  const pendingCount = deliveries.filter(d => 
    (!d.dispatch_status || d.dispatch_status === "pending_dispatch") && 
    d.status !== "confirmed"
  ).length;
  
  const dispatchedCount = deliveries.filter(d => 
    d.dispatch_status === "dispatched"
  ).length;
  
  const deliveredCount = deliveries.filter(d => 
    d.status === "confirmed"
  ).length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">Pending Dispatch</p>
                <p className="text-3xl font-bold text-yellow-900">{pendingCount}</p>
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
                <p className="text-3xl font-bold text-blue-900">{dispatchedCount}</p>
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
                <p className="text-3xl font-bold text-green-900">{deliveredCount}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deliveries List */}
      <Card className="border-slate-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-slate-900">Customer Delivery Queue</CardTitle>
          <CardDescription>Manage and dispatch customer orders</CardDescription>
        </CardHeader>
        <CardContent>
          {deliveries.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-lg font-medium">No customer deliveries</p>
              <p className="text-slate-500 text-sm mt-2">Customer orders will appear here when ready for dispatch</p>
            </div>
          ) : (
            <div className="space-y-4">
              {deliveries.map((delivery) => (
                <Card 
                  key={delivery.id} 
                  className={`border-slate-200 ${selectedDelivery?.id === delivery.id ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-mono font-bold text-slate-900">
                              {delivery.request_number}
                            </h3>
                            {getStatusBadge(delivery)}
                          </div>
                          <p className="text-sm text-slate-600">
                            Requested by: {delivery.requested_by}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(delivery.requested_at).toLocaleString()}
                          </p>
                        </div>
                        {(!delivery.dispatch_status || delivery.dispatch_status === "pending_dispatch") && 
                         delivery.status !== "confirmed" && (
                          <Button
                            onClick={() => setSelectedDelivery(delivery)}
                            className="bg-blue-500 hover:bg-blue-600"
                          >
                            <Truck className="w-4 h-4 mr-2" />
                            Dispatch
                          </Button>
                        )}
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
                            <p className="text-xs text-slate-500">Status</p>
                            <p className="font-semibold text-slate-900">{delivery.status}</p>
                          </div>
                        </div>
                      </div>

                      {/* Customer Info */}
                      {delivery.customer_info && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Customer Details
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

                      {/* Dispatch Info (if already dispatched) */}
                      {delivery.dispatch_info && (
                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                          <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                            <Truck className="w-4 h-4" />
                            Dispatch Details
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-xs text-purple-700">Driver</p>
                              <p className="font-semibold text-purple-900">
                                {delivery.dispatch_info.driver_name}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-purple-700">Vehicle</p>
                              <p className="font-semibold text-purple-900">
                                {delivery.dispatch_info.vehicle_number}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-purple-700">Dispatched At</p>
                              <p className="font-semibold text-purple-900">
                                {new Date(delivery.dispatch_info.dispatched_at).toLocaleString()}
                              </p>
                            </div>
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

                      {/* Dispatch Form */}
                      {selectedDelivery?.id === delivery.id && (
                        <div className="mt-4 p-4 border-t bg-slate-50 rounded-lg space-y-4">
                          <h4 className="font-semibold text-slate-900">Dispatch Information</h4>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="driver_name">Driver Name *</Label>
                              <Input
                                id="driver_name"
                                value={dispatchForm.driver_name}
                                onChange={(e) => handleDispatchFormChange("driver_name", e.target.value)}
                                placeholder="Enter driver name"
                                required
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="vehicle_number">Vehicle Number *</Label>
                              <Input
                                id="vehicle_number"
                                value={dispatchForm.vehicle_number}
                                onChange={(e) => handleDispatchFormChange("vehicle_number", e.target.value)}
                                placeholder="e.g., AA-12345"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="expected_delivery_time">Expected Delivery Time</Label>
                            <Input
                              id="expected_delivery_time"
                              type="datetime-local"
                              value={dispatchForm.expected_delivery_time}
                              onChange={(e) => handleDispatchFormChange("expected_delivery_time", e.target.value)}
                              min={new Date().toISOString().slice(0, 16)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="dispatch_notes">Dispatch Notes</Label>
                            <Textarea
                              id="dispatch_notes"
                              value={dispatchForm.dispatch_notes}
                              onChange={(e) => handleDispatchFormChange("dispatch_notes", e.target.value)}
                              placeholder="Any special instructions or notes..."
                              rows={3}
                            />
                          </div>

                          <div className="flex gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              className="flex-1"
                              onClick={() => {
                                setSelectedDelivery(null);
                                setDispatchForm({
                                  driver_name: "",
                                  vehicle_number: "",
                                  expected_delivery_time: "",
                                  dispatch_notes: ""
                                });
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => handleDispatch(delivery.id)}
                              className="flex-1 bg-blue-500 hover:bg-blue-600"
                              disabled={loading}
                            >
                              <Send className="w-4 h-4 mr-2" />
                              {loading ? "Dispatching..." : "Confirm Dispatch"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Customer Delivery Management</p>
              <p className="text-blue-800">
                When marking a delivery as dispatched, ensure all information is accurate. Sales personnel
                and customers will be able to track the delivery status in real-time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerDeliveryQueue;

