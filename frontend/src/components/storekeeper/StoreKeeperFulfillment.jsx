import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Package, CheckCircle, Loader, BoxIcon } from "lucide-react";
import { useToast } from "../../hooks/use-toast";

const StoreKeeperFulfillment = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [packingSlip, setPackingSlip] = useState("");
  const [actualQuantity, setActualQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [gatePassNumber, setGatePassNumber] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
  
  // Get current user info
  const getUserInfo = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return {
        name: user.name || user.username,
        branch_id: user.branch
      };
    }
    return {
      name: "Storekeeper",
      branch_id: "main_warehouse"
    };
  };
  
  const currentUser = getUserInfo();

  const fetchPendingRequests = useCallback(async () => {
    try {
      // Filter by source branch - only show requests from this storekeeper's warehouse
      const response = await fetch(`${BACKEND_URL}/api/stock-requests?status=pending_fulfillment&source_branch=${currentUser.branch_id}`);
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  }, [BACKEND_URL, currentUser.branch_id]);

  useEffect(() => {
    fetchPendingRequests();
    const interval = setInterval(fetchPendingRequests, 30000);
    return () => clearInterval(interval);
  }, [fetchPendingRequests]);

  const handleFulfill = async (requestId) => {
    if (!actualQuantity) {
      toast({
        title: "Error",
        description: "Please enter actual quantity packaged",
        variant: "destructive"
      });
      return;
    }

    if (!vehicleNumber || !driverName) {
      toast({
        title: "Error",
        description: "Please enter vehicle number and driver name for gate pass",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/stock-requests/${requestId}/fulfill`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fulfilled_by: currentUser.name,
          packing_slip_number: packingSlip || undefined,
          actual_quantity: parseInt(actualQuantity),
          notes: notes || undefined,
          gate_pass_number: gatePassNumber || undefined,
          vehicle_number: vehicleNumber,
          driver_name: driverName
        })
      });

      if (response.ok) {
        toast({
          title: "Fulfilled",
          description: "Stock request fulfilled with gate pass. Awaiting manager approval for release.",
        });
        setSelectedRequest(null);
        setPackingSlip("");
        setActualQuantity("");
        setNotes("");
        setGatePassNumber("");
        setVehicleNumber("");
        setDriverName("");
        fetchPendingRequests();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.detail || "Failed to fulfill request",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fulfill request",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <BoxIcon className="w-6 h-6 text-orange-500" />
            Fulfillment Queue
          </CardTitle>
          <CardDescription>Package and prepare approved stock requests for pickup</CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-slate-600 text-lg font-medium">All done!</p>
              <p className="text-slate-500 text-sm mt-2">No requests waiting for fulfillment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className={`border rounded-lg p-4 ${
                    selectedRequest?.id === request.id ? 'border-orange-500 bg-orange-50' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900">{request.request_number}</h3>
                        <Badge variant="outline" className="text-orange-600 border-orange-300">
                          <Loader className="w-3 h-3 mr-1" />
                          Ready to Fulfill
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        Requested by: <span className="font-medium">{request.requested_by}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(request.requested_at).toLocaleString()}
                      </p>
                    </div>
                    {selectedRequest?.id !== request.id && (
                      <Button
                        onClick={() => {
                          setSelectedRequest(request);
                          setActualQuantity(request.quantity.toString());
                        }}
                        size="sm"
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        Start Fulfillment
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3 p-3 bg-slate-50 rounded">
                    <div>
                      <p className="text-xs text-slate-500">Product</p>
                      <p className="font-semibold text-slate-900">{request.product_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Quantity to Pack</p>
                      <p className="font-semibold text-orange-600 text-lg">
                        {request.quantity} × {request.package_size}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Total Weight</p>
                      <p className="font-semibold text-slate-900">{request.total_weight} kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Destination</p>
                      <p className="font-semibold text-slate-900">
                        {request.branch_id?.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-3">
                    <Badge variant="outline" className="text-green-600 border-green-300">
                      ✓ Admin Approved
                    </Badge>
                    <Badge variant="outline" className="text-purple-600 border-purple-300">
                      ✓ Manager Approved
                    </Badge>
                  </div>

                  {selectedRequest?.id === request.id && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="packing_slip">Packing Slip Number (Optional)</Label>
                          <Input
                            id="packing_slip"
                            value={packingSlip}
                            onChange={(e) => setPackingSlip(e.target.value)}
                            placeholder={`PS-${request.request_number}`}
                            className="mt-2"
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            Auto-generated if left blank
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="actual_quantity">Actual Quantity Packaged *</Label>
                          <Input
                            id="actual_quantity"
                            type="number"
                            value={actualQuantity}
                            onChange={(e) => setActualQuantity(e.target.value)}
                            placeholder={request.quantity.toString()}
                            className="mt-2"
                            required
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            Number of {request.package_size} packages
                          </p>
                        </div>
                      </div>

                      <div className="p-3 bg-yellow-50 border border-yellow-300 rounded">
                        <p className="text-sm font-semibold text-yellow-900 mb-2">
                          🚧 Gate Pass Information (Required)
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="gate_pass" className="text-xs">Gate Pass Number (Optional)</Label>
                            <Input
                              id="gate_pass"
                              value={gatePassNumber}
                              onChange={(e) => setGatePassNumber(e.target.value)}
                              placeholder={`GP-${request.request_number}`}
                              className="mt-1 h-9"
                            />
                          </div>
                          <div>
                            <Label htmlFor="vehicle" className="text-xs">Vehicle Number *</Label>
                            <Input
                              id="vehicle"
                              value={vehicleNumber}
                              onChange={(e) => setVehicleNumber(e.target.value)}
                              placeholder="ET-123-ABC"
                              className="mt-1 h-9"
                              required
                            />
                          </div>
                          <div className="col-span-2">
                            <Label htmlFor="driver" className="text-xs">Driver Name *</Label>
                            <Input
                              id="driver"
                              value={driverName}
                              onChange={(e) => setDriverName(e.target.value)}
                              placeholder="Driver full name"
                              className="mt-1 h-9"
                              required
                            />
                          </div>
                        </div>
                        <p className="text-xs text-yellow-800 mt-2">
                          Gate pass will be printed for guard verification
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="notes">Fulfillment Notes (Optional)</Label>
                        <Textarea
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Any special notes about packaging, condition, etc..."
                          rows={2}
                          className="mt-2"
                        />
                      </div>

                      <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm font-semibold text-blue-900 mb-2">
                          ⚠️ Before fulfilling:
                        </p>
                        <ul className="text-xs text-blue-800 space-y-1">
                          <li>✓ Verify product quality and condition</li>
                          <li>✓ Count and package items securely</li>
                          <li>✓ Label packages with destination branch</li>
                          <li>✓ Prepare packing slip with item details</li>
                          <li>⚠️ Inventory will be DEDUCTED from {request.source_branch?.replace('_', ' ')}</li>
                        </ul>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => {
                            setSelectedRequest(null);
                            setPackingSlip("");
                            setActualQuantity("");
                            setNotes("");
                            setGatePassNumber("");
                            setVehicleNumber("");
                            setDriverName("");
                          }}
                          variant="outline"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleFulfill(request.id)}
                          className="flex-1 bg-orange-500 hover:bg-orange-600"
                          disabled={loading}
                        >
                          <Package className="w-4 h-4 mr-2" />
                          {loading ? "Processing..." : "Mark as Fulfilled"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <BoxIcon className="w-5 h-5 text-orange-600 mt-0.5" />
            <div className="text-sm text-orange-900">
              <p className="font-semibold mb-1">Fulfillment Process</p>
              <ol className="list-decimal list-inside space-y-1 text-orange-800">
                <li>Pull items from warehouse inventory</li>
                <li>Verify quality and count accuracy</li>
                <li>Package securely for transport</li>
                <li>Generate packing slip and gate pass</li>
                <li>Enter vehicle and driver information</li>
                <li>Submit for manager approval</li>
                <li>Print gate pass for guard (manual check)</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoreKeeperFulfillment;

