import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { CheckCircle, XCircle, Clock, Package, Factory } from "lucide-react";
import { useToast } from "../../hooks/use-toast";

const ManagerStockApprovals = () => {
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

   useEffect(() => {
    fetchPendingRequests();
    const interval = setInterval(fetchPendingRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingRequests = async () => {
    try {
      // Filter by manager's branch
      const response = await fetch(`${BACKEND_URL}/api/stock-requests?status=pending_manager_approval&branch_id=${currentManager.branch_id}`);
      if (response.ok) {
        const data = await response.json();
        // Ensure we only show requests for this manager's branch
        const branchRequests = data.filter(req => req.source_branch === currentManager.branch_id);
        setRequests(branchRequests);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const handleApprove = async (requestId) => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/stock-requests/${requestId}/approve-manager`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approved_by: currentManager.name,
          notes: notes || "Approved - capacity verified"
        })
      });

      if (response.ok) {
        toast({
          title: "Approved",
          description: "Stock request approved and sent to fulfillment",
        });
        setSelectedRequest(null);
        setNotes("");
        fetchPendingRequests();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.detail || "Failed to approve request",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve request",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (requestId) => {
    if (!notes) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/stock-requests/${requestId}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rejected_by: currentManager.name,
          reason: notes,
          stage: "manager_approval"
        })
      });

      if (response.ok) {
        toast({
          title: "Rejected",
          description: "Stock request rejected",
        });
        setSelectedRequest(null);
        setNotes("");
        fetchPendingRequests();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.detail || "Failed to reject request",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject request",
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
            <Factory className="w-6 h-6 text-purple-500" />
            Manager Stock Approvals
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 ml-2">
              {currentManager.branch_name}
            </Badge>
          </CardTitle>
          <CardDescription>Review stock requests approved by Admin - verify production capacity for your branch</CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-slate-600 text-lg font-medium">All caught up!</p>
              <p className="text-slate-500 text-sm mt-2">No pending stock requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                    selectedRequest?.id === request.id ? 'border-purple-500 bg-purple-50' : 'border-slate-200'
                  }`}
                  onClick={() => setSelectedRequest(request)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900">{request.request_number}</h3>
                        <Badge variant="outline" className="text-purple-600 border-purple-300">
                          <Clock className="w-3 h-3 mr-1" />
                          Manager Review
                        </Badge>
                        <Badge variant="outline" className="text-green-600 border-green-300">
                          Admin Approved
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        Requested by: <span className="font-medium">{request.requested_by}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Created: {new Date(request.requested_at).toLocaleString()}
                      </p>
                      {request.admin_approval && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ Approved by {request.admin_approval.approved_by}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3 p-3 bg-slate-50 rounded">
                    <div>
                      <p className="text-xs text-slate-500">Product</p>
                      <p className="font-semibold text-slate-900">{request.product_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Quantity</p>
                      <p className="font-semibold text-slate-900">
                        {request.quantity} × {request.package_size}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Total Weight</p>
                      <p className="font-semibold text-slate-900">{request.total_weight} kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Source → Destination</p>
                      <p className="font-semibold text-slate-900 text-xs">
                        {request.source_branch?.replace('_', ' ').toUpperCase()} → {request.branch_id?.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {request.admin_approval?.notes && (
                    <div className="p-2 bg-green-50 border border-green-200 rounded mb-3">
                      <p className="text-xs text-green-800">
                        <span className="font-semibold">Admin Notes:</span> {request.admin_approval.notes}
                      </p>
                    </div>
                  )}

                  {selectedRequest?.id === request.id && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      <div>
                        <Label htmlFor="notes">Manager Notes</Label>
                        <Textarea
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Verify production capacity, check priority, add notes..."
                          rows={3}
                          className="mt-2"
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleApprove(request.id)}
                          className="flex-1 bg-green-500 hover:bg-green-600"
                          disabled={loading}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {loading ? "Processing..." : "Approve & Send to Fulfillment"}
                        </Button>
                        <Button
                          onClick={() => handleReject(request.id)}
                          variant="destructive"
                          className="flex-1"
                          disabled={loading}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
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
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Factory className="w-5 h-5 text-purple-600 mt-0.5" />
            <div className="text-sm text-purple-900">
              <p className="font-semibold mb-1">Manager Responsibilities</p>
              <ul className="list-disc list-inside space-y-1 text-purple-800">
                <li>Verify production capacity for fulfillment</li>
                <li>Check request priority and urgency</li>
                <li>Ensure no conflicts with other operations</li>
                <li>Once approved, request goes to Storekeeper for fulfillment</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerStockApprovals;

