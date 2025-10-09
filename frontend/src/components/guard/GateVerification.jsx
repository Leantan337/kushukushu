import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Shield, CheckCircle, Truck, FileText } from "lucide-react";
import { useToast } from "../../hooks/use-toast";

const GateVerification = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [gatePassNumber, setGatePassNumber] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchPendingRequests();
    const interval = setInterval(fetchPendingRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/stock-requests?status=ready_for_pickup`);
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const generateGatePass = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `GP-${timestamp}`;
  };

  const handleVerify = async (requestId) => {
    if (!gatePassNumber) {
      toast({
        title: "Error",
        description: "Gate pass number is required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/stock-requests/${requestId}/gate-verify`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verified_by: "Guard User", // Replace with actual user
          gate_pass_number: gatePassNumber,
          vehicle_number: vehicleNumber || undefined,
          driver_name: driverName || undefined,
          notes: notes || undefined
        })
      });

      if (response.ok) {
        toast({
          title: "Verified & Released",
          description: "Items cleared for exit - gate pass issued",
        });
        setSelectedRequest(null);
        setGatePassNumber("");
        setVehicleNumber("");
        setDriverName("");
        setNotes("");
        fetchPendingRequests();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.detail || "Failed to verify request",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify request",
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
            <Shield className="w-6 h-6 text-blue-600" />
            Gate Verification
          </CardTitle>
          <CardDescription>Verify and release items for transport</CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-slate-600 text-lg font-medium">No items at gate</p>
              <p className="text-slate-500 text-sm mt-2">All clear!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className={`border rounded-lg p-4 ${
                    selectedRequest?.id === request.id ? 'border-blue-600 bg-blue-50' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900">{request.request_number}</h3>
                        <Badge variant="outline" className="text-blue-600 border-blue-300">
                          <Shield className="w-3 h-3 mr-1" />
                          At Gate
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        Destination: <span className="font-medium">{request.branch_id?.toUpperCase()}</span>
                      </p>
                      {request.fulfillment && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ Fulfilled by {request.fulfillment.fulfilled_by}
                        </p>
                      )}
                    </div>
                    {selectedRequest?.id !== request.id && (
                      <Button
                        onClick={() => {
                          setSelectedRequest(request);
                          setGatePassNumber(generateGatePass());
                        }}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Verify & Release
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3 p-3 bg-slate-50 rounded">
                    <div>
                      <p className="text-xs text-slate-500">Product</p>
                      <p className="font-semibold text-slate-900">{request.product_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Quantity</p>
                      <p className="font-semibold text-slate-900">
                        {request.fulfillment?.actual_quantity || request.quantity} × {request.package_size}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Packing Slip</p>
                      <p className="font-semibold text-blue-600">
                        {request.fulfillment?.packing_slip_number || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Total Weight</p>
                      <p className="font-semibold text-slate-900">{request.total_weight} kg</p>
                    </div>
                  </div>

                  {selectedRequest?.id === request.id && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm font-semibold text-yellow-900 mb-1">
                          📋 Verification Checklist
                        </p>
                        <ul className="text-xs text-yellow-800 space-y-1">
                          <li>□ Check packing slip matches items</li>
                          <li>□ Verify package count and condition</li>
                          <li>□ Confirm authorization/approval</li>
                          <li>□ Record vehicle and driver details</li>
                        </ul>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <Label htmlFor="gate_pass">Gate Pass Number *</Label>
                          <div className="flex gap-2 mt-2">
                            <Input
                              id="gate_pass"
                              value={gatePassNumber}
                              onChange={(e) => setGatePassNumber(e.target.value)}
                              placeholder="GP-XXXXXX"
                              required
                            />
                            <Button
                              type="button"
                              onClick={() => setGatePassNumber(generateGatePass())}
                              variant="outline"
                              size="sm"
                            >
                              Generate
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="vehicle">Vehicle Number</Label>
                          <Input
                            id="vehicle"
                            value={vehicleNumber}
                            onChange={(e) => setVehicleNumber(e.target.value)}
                            placeholder="ET-123-ABC"
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="driver">Driver Name</Label>
                          <Input
                            id="driver"
                            value={driverName}
                            onChange={(e) => setDriverName(e.target.value)}
                            placeholder="Driver name"
                            className="mt-2"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="notes">Verification Notes (Optional)</Label>
                        <Textarea
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Any observations, issues, or special notes..."
                          rows={2}
                          className="mt-2"
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => {
                            setSelectedRequest(null);
                            setGatePassNumber("");
                            setVehicleNumber("");
                            setDriverName("");
                            setNotes("");
                          }}
                          variant="outline"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleVerify(request.id)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          disabled={loading}
                        >
                          <Truck className="w-4 h-4 mr-2" />
                          {loading ? "Processing..." : "Issue Gate Pass & Release"}
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
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Guard Responsibilities</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-800">
                <li>Verify packing slip and authorization</li>
                <li>Check package count and condition</li>
                <li>Record vehicle and driver information</li>
                <li>Issue gate pass for exit</li>
                <li>Items released for transport to destination</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GateVerification;

