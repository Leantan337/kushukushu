import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Package, CheckCircle, Truck, AlertCircle } from "lucide-react";
import { useToast } from "../../hooks/use-toast";

const PendingDeliveries = () => {
  const { toast } = useToast();
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [receivedQuantity, setReceivedQuantity] = useState("");
  const [condition, setCondition] = useState("good");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchPendingDeliveries();
    const interval = setInterval(fetchPendingDeliveries, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingDeliveries = async () => {
    try {
      // Fetch both ready_for_pickup and in_transit items
      const [readyResponse, transitResponse] = await Promise.all([
        fetch(`${BACKEND_URL}/api/stock-requests?status=ready_for_pickup`),
        fetch(`${BACKEND_URL}/api/stock-requests?status=in_transit`)
      ]);
      
      const readyData = readyResponse.ok ? await readyResponse.json() : [];
      const transitData = transitResponse.ok ? await transitResponse.json() : [];
      
      // Combine and sort by requested_at
      const combined = [...readyData, ...transitData].sort((a, b) => 
        new Date(b.requested_at) - new Date(a.requested_at)
      );
      
      setDeliveries(combined);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    }
  };

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
      name: "Sales User",
      branch_id: "unknown"
    };
  };

  const handleConfirm = async (deliveryId) => {
    if (!receivedQuantity) {
      toast({
        title: "Error",
        description: "Please enter received quantity",
        variant: "destructive"
      });
      return;
    }

    const currentUser = getUserInfo();
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/stock-requests/${deliveryId}/confirm-delivery`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmed_by: currentUser.name,
          received_quantity: parseInt(receivedQuantity),
          condition: condition,
          notes: notes || undefined
        })
      });

      if (response.ok) {
        toast({
          title: "Delivery Confirmed",
          description: "Stock has been added to your inventory",
        });
        setSelectedDelivery(null);
        setReceivedQuantity("");
        setCondition("good");
        setNotes("");
        fetchPendingDeliveries();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.detail || "Failed to confirm delivery",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to confirm delivery",
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
            <Truck className="w-6 h-6 text-green-500" />
            Pending Deliveries
          </CardTitle>
          <CardDescription>Confirm receipt of stock deliveries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-900">
              <strong>ℹ️ Note:</strong> You can confirm delivery once items are fulfilled. 
              Items will show "Ready for Pickup" until gate verification, or "In Transit" after gate clearance.
            </p>
          </div>
          {deliveries.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-slate-600 text-lg font-medium">No pending deliveries</p>
              <p className="text-slate-500 text-sm mt-2">All deliveries confirmed!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {deliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className={`border rounded-lg p-4 ${
                    selectedDelivery?.id === delivery.id ? 'border-green-500 bg-green-50' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900">{delivery.request_number}</h3>
                        {delivery.status === 'in_transit' ? (
                          <Badge variant="outline" className="text-green-600 border-green-300">
                            <Truck className="w-3 h-3 mr-1" />
                            In Transit
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-orange-600 border-orange-300">
                            <Package className="w-3 h-3 mr-1" />
                            Ready for Pickup
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">
                        Your request from: <span className="font-medium">{new Date(delivery.requested_at).toLocaleDateString()}</span>
                      </p>
                      {delivery.gate_verification && (
                        <p className="text-xs text-blue-600 mt-1">
                          📋 Gate Pass: {delivery.gate_verification.gate_pass_number}
                          {delivery.gate_verification.vehicle_number && (
                            <span> • Vehicle: {delivery.gate_verification.vehicle_number}</span>
                          )}
                        </p>
                      )}
                    </div>
                    {selectedDelivery?.id !== delivery.id && (
                      <Button
                        onClick={() => {
                          setSelectedDelivery(delivery);
                          setReceivedQuantity(delivery.fulfillment?.actual_quantity?.toString() || delivery.quantity.toString());
                        }}
                        size="sm"
                        className="bg-green-500 hover:bg-green-600"
                      >
                        Confirm Receipt
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3 p-3 bg-slate-50 rounded">
                    <div>
                      <p className="text-xs text-slate-500">Product</p>
                      <p className="font-semibold text-slate-900">{delivery.product_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Expected Quantity</p>
                      <p className="font-semibold text-green-600 text-lg">
                        {delivery.fulfillment?.actual_quantity || delivery.quantity} × {delivery.package_size}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Total Weight</p>
                      <p className="font-semibold text-slate-900">{delivery.total_weight} kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">From</p>
                      <p className="font-semibold text-slate-900">
                        {delivery.source_branch?.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-3 flex-wrap">
                    <Badge variant="outline" className="text-green-600 border-green-300 text-xs">
                      ✓ Approved
                    </Badge>
                    <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs">
                      ✓ Fulfilled
                    </Badge>
                    {delivery.status === 'in_transit' && (
                      <Badge variant="outline" className="text-blue-600 border-blue-300 text-xs">
                        ✓ Gate Verified
                      </Badge>
                    )}
                    {delivery.status === 'ready_for_pickup' && (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-300 text-xs">
                        ⏳ Pending Gate Verification
                      </Badge>
                    )}
                  </div>

                  {selectedDelivery?.id === delivery.id && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm font-semibold text-blue-900 mb-1">
                          📦 Inspection Checklist
                        </p>
                        <ul className="text-xs text-blue-800 space-y-1">
                          <li>□ Count all packages received</li>
                          <li>□ Check package condition and seals</li>
                          <li>□ Verify product quality</li>
                          <li>□ Match against packing slip: {delivery.fulfillment?.packing_slip_number}</li>
                        </ul>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="received_qty">Received Quantity *</Label>
                          <Input
                            id="received_qty"
                            type="number"
                            value={receivedQuantity}
                            onChange={(e) => setReceivedQuantity(e.target.value)}
                            placeholder={delivery.quantity.toString()}
                            className="mt-2"
                            required
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            Number of {delivery.package_size} packages
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="condition">Delivery Condition *</Label>
                          <Select value={condition} onValueChange={setCondition}>
                            <SelectTrigger className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="good">
                                ✅ Good - All items perfect
                              </SelectItem>
                              <SelectItem value="acceptable">
                                ⚠️ Acceptable - Minor issues
                              </SelectItem>
                              <SelectItem value="damaged">
                                ❌ Damaged - Significant issues
                              </SelectItem>
                              <SelectItem value="partial">
                                📦 Partial - Some items missing
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {parseInt(receivedQuantity) !== (delivery.fulfillment?.actual_quantity || delivery.quantity) && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div className="text-sm text-yellow-900">
                              <p className="font-semibold">Quantity Mismatch Detected</p>
                              <p className="text-xs mt-1">
                                Expected: {delivery.fulfillment?.actual_quantity || delivery.quantity} • 
                                Received: {receivedQuantity} • 
                                Difference: {Math.abs((delivery.fulfillment?.actual_quantity || delivery.quantity) - parseInt(receivedQuantity || 0))}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <Label htmlFor="notes">Delivery Notes *</Label>
                        <Textarea
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Note any issues, damages, discrepancies, or special observations..."
                          rows={3}
                          className="mt-2"
                          required={condition !== "good"}
                        />
                        {condition !== "good" && (
                          <p className="text-xs text-red-600 mt-1">
                            ⚠️ Notes required when condition is not "Good"
                          </p>
                        )}
                      </div>

                      <div className="p-4 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm text-green-900">
                          <span className="font-semibold">✓ Upon confirmation:</span>
                          <br />
                          <span className="text-xs">
                            {receivedQuantity} packages ({parseInt(receivedQuantity || 0) * parseInt(delivery.package_size)} kg) 
                            will be added to your inventory
                          </span>
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => {
                            setSelectedDelivery(null);
                            setReceivedQuantity("");
                            setCondition("good");
                            setNotes("");
                          }}
                          variant="outline"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleConfirm(delivery.id)}
                          className="flex-1 bg-green-500 hover:bg-green-600"
                          disabled={loading || (condition !== "good" && !notes)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {loading ? "Processing..." : "Confirm Delivery"}
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
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="text-sm text-green-900">
              <p className="font-semibold mb-1">Delivery Confirmation</p>
              <p className="text-green-800">
                When you confirm receipt, the stock is automatically added to your branch inventory 
                and the request is marked as complete. Make sure to inspect all items before confirming!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingDeliveries;

