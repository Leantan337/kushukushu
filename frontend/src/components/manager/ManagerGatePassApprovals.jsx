import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { CheckCircle, XCircle, Truck, Package, AlertTriangle } from "lucide-react";
import { useToast } from "../../hooks/use-toast";

const ManagerGatePassApprovals = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  // Get current user from localStorage
  const getUserInfo = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return {
        id: `manager-${user.branch}`,
        name: user.name || user.username,
        branch_id: user.branch,
        branch_name: user.branch === "berhane" ? "Berhane Branch" : "Girmay Branch"
      };
    }
    return {
      id: "manager-001",
      name: "Manager",
      branch_id: "berhane",
      branch_name: "Berhane Branch"
    };
  };

  const currentManager = getUserInfo();

  const fetchPendingRequests = useCallback(async () => {
    try {
      // Filter by manager's branch
      const response = await fetch(`${BACKEND_URL}/api/stock-requests?status=pending_gate_approval&source_branch=${currentManager.branch_id}`);
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  }, [BACKEND_URL, currentManager.branch_id]);

  useEffect(() => {
    fetchPendingRequests();
    const interval = setInterval(fetchPendingRequests, 30000);
    return () => clearInterval(interval);
  }, [fetchPendingRequests]);

  const handleApprove = async (requestId) => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/stock-requests/${requestId}/approve-gate-pass`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approved_by: currentManager.name,
          notes: notes || "Gate pass approved for release"
        })
      });

      if (response.ok) {
        toast({
          title: "Approved",
          description: "Gate pass approved. Items can now be released to sales.",
        });
        setSelectedRequest(null);
        setNotes("");
        fetchPendingRequests();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.detail || "Failed to approve gate pass",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve gate pass",
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
            <Truck className="w-6 h-6 text-blue-500" />
            Gate Pass Approvals
          </CardTitle>
          <CardDescription>Review and approve gate passes for release</CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-slate-600 text-lg font-medium">All caught up!</p>
              <p className="text-slate-500 text-sm mt-2">No gate passes pending approval</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className={`border rounded-lg p-4 ${
                    selectedRequest?.id === request.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900">{request.request_number}</h3>
                        <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Awaiting Gate Approval
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        Fulfilled by: <span className="font-medium">{request.fulfillment?.fulfilled_by}</span>
                      </p>
                    </div>
                    {selectedRequest?.id !== request.id && (
                      <Button
                        onClick={() => setSelectedRequest(request)}
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        Review Gate Pass
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
                      <p className="font-semibold text-blue-600 text-lg">
                        {request.fulfillment?.actual_quantity || request.quantity} × {request.package_size}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Destination</p>
                      <p className="font-semibold text-slate-900">
                        {request.branch_id?.toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Packing Slip</p>
                      <p className="font-semibold text-slate-900">
                        {request.fulfillment?.packing_slip_number}
                      </p>
                    </div>
                  </div>

                  {request.gate_pass_draft && (
                    <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm font-semibold text-yellow-900 mb-2">
                        🚧 Gate Pass Information
                      </p>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-yellow-700">Gate Pass #</p>
                          <p className="font-semibold text-yellow-900">
                            {request.gate_pass_draft.gate_pass_number}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-yellow-700">Vehicle</p>
                          <p className="font-semibold text-yellow-900">
                            {request.gate_pass_draft.vehicle_number}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-yellow-700">Driver</p>
                          <p className="font-semibold text-yellow-900">
                            {request.gate_pass_draft.driver_name}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedRequest?.id === request.id && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm font-semibold text-blue-900 mb-2">
                          📋 Manager Gate Pass Verification
                        </p>
                        <ul className="text-xs text-blue-800 space-y-1">
                          <li>✓ Verify vehicle number and driver information</li>
                          <li>✓ Confirm product, quantity, and destination match</li>
                          <li>✓ Ensure security protocols are followed</li>
                          <li>✓ Approve for guard to physically check at gate</li>
                        </ul>
                      </div>

                      <div>
                        <Label htmlFor="notes">Approval Notes (Optional)</Label>
                        <Textarea
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Any special instructions for guard or driver..."
                          rows={2}
                          className="mt-2"
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => {
                            setSelectedRequest(null);
                            setNotes("");
                          }}
                          variant="outline"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleApprove(request.id)}
                          className="flex-1 bg-green-500 hover:bg-green-600"
                          disabled={loading}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {loading ? "Processing..." : "Approve Gate Pass"}
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
            <Package className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Gate Pass Approval Process</p>
              <p className="text-blue-800">
                After storekeeper fulfills and creates a gate pass, you verify the vehicle/driver information 
                and approve for release. The guard will physically check the gate pass at the gate (no computer needed). 
                Once approved, sales can confirm delivery.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerGatePassApprovals;

