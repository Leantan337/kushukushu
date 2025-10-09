import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { CheckCircle, XCircle, Clock, Package, AlertCircle } from "lucide-react";
import { useToast } from "../../hooks/use-toast";

const StockRequestApprovals = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchPendingRequests();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchPendingRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/stock-requests?status=pending_admin_approval`);
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const handleApprove = async (requestId) => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/stock-requests/${requestId}/approve-admin`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approved_by: "Admin User", // Replace with actual user
          notes: notes || "Approved"
        })
      });

      if (response.ok) {
        toast({
          title: "Approved",
          description: "Stock request approved successfully",
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
          rejected_by: "Admin User", // Replace with actual user
          reason: notes,
          stage: "admin_approval"
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
            <Package className="w-6 h-6 text-blue-500" />
            Stock Request Approvals
          </CardTitle>
          <CardDescription>Review and approve stock requests from sales team</CardDescription>
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
                    selectedRequest?.id === request.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
                  }`}
                  onClick={() => setSelectedRequest(request)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900">{request.request_number}</h3>
                        <Badge variant="outline" className="text-orange-600 border-orange-300">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending Approval
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        Requested by: <span className="font-medium">{request.requested_by}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(request.requested_at).toLocaleString()}
                      </p>
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
                      <p className="text-xs text-slate-500">Source Branch</p>
                      <p className="font-semibold text-slate-900">
                        {request.source_branch.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {selectedRequest?.id === request.id && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      <div>
                        <Label htmlFor="notes">Notes (Optional for approval, Required for rejection)</Label>
                        <Textarea
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Add any notes or comments..."
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
                          {loading ? "Processing..." : "Approve"}
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
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Approval Workflow</p>
              <p>When you approve a request:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-blue-800">
                <li>Inventory is reserved at the source warehouse</li>
                <li>Request moves to Manager for second approval</li>
                <li>After Manager approval, Storekeeper will fulfill</li>
                <li>Guard verifies at gate before release</li>
                <li>Sales confirms receipt when delivered</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockRequestApprovals;

