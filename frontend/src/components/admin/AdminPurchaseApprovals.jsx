import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { 
  ArrowLeft,
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  ShoppingCart,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";

const AdminPurchaseApprovals = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchPendingRequests();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchPendingRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingRequests = async () => {
    setLoadingData(true);
    try {
      // Fetch purchase requisitions awaiting admin approval
      const response = await fetch(`${BACKEND_URL}/api/purchase-requisitions?status=pending_admin_approval`);
      if (response.ok) {
        const data = await response.json();
        console.log("Admin purchase approvals:", data);
        setRequests(data);
      } else {
        console.error("Failed to fetch purchase approvals:", response.status);
      }
    } catch (error) {
      console.error("Error fetching purchase approvals:", error);
      toast({
        title: "Error",
        description: "Failed to load purchase requests",
        variant: "destructive"
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleApprove = async (requestId) => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/purchase-requisitions/${requestId}/approve-admin`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approved_by: "Admin",
          notes: notes || "Approved by Admin"
        })
      });

      if (response.ok) {
        toast({
          title: "Approved",
          description: "Purchase request approved and sent to Finance for payment",
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
      const response = await fetch(`${BACKEND_URL}/api/purchase-requisitions/${requestId}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rejected_by: "Admin",
          rejection_reason: notes
        })
      });

      if (response.ok) {
        toast({
          title: "Rejected",
          description: "Purchase request has been rejected",
          variant: "destructive"
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

  const formatCurrency = (amount) => {
    return `Br ${Number(amount || 0).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200 mb-6">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate("/dashboard")}
                className="border-slate-300 hover:bg-slate-50"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-xl shadow-lg">
                  <ShoppingCart className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Purchase Request Approvals</h1>
                  <p className="text-sm text-slate-600">Review and approve purchase requests (up to Br 50,000)</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-base px-4 py-2 border-blue-300 text-blue-700 bg-blue-50">
                {requests.length} Pending
              </Badge>
              <Button
                onClick={fetchPendingRequests}
                disabled={loadingData}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loadingData ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-6">
        {loadingData ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Clock className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-pulse" />
              <p className="text-slate-600">Loading purchase requests...</p>
            </div>
          </div>
        ) : requests.length === 0 ? (
          <Card className="bg-white shadow-lg border-slate-200">
            <CardContent className="p-12 text-center">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">All Caught Up!</h3>
              <p className="text-slate-600">No pending purchase requests at the moment.</p>
              <p className="text-sm text-slate-500 mt-2">Purchase requests under Br 50,000 will appear here for your approval.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {requests.map((request) => (
              <Card key={request.id} className="bg-white shadow-lg border-slate-200 hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold text-slate-900 mb-1">
                        {request.request_number}
                      </CardTitle>
                      <p className="text-sm text-slate-600">{request.description || request.item_name}</p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                      Pending Approval
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                  {/* Amount */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Amount</span>
                      </div>
                      <span className="text-2xl font-bold text-blue-700">
                        {formatCurrency(request.estimated_cost)}
                      </span>
                    </div>
                    {request.admin_threshold && (
                      <p className="text-xs text-blue-600 mt-1">
                        Within admin approval limit (≤ Br {request.admin_threshold.toLocaleString()})
                      </p>
                    )}
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-slate-600 font-medium mb-1">Item</p>
                      <p className="text-slate-900 font-semibold">{request.item_name || "N/A"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-slate-600 font-medium mb-1">Quantity</p>
                      <p className="text-slate-900 font-semibold">
                        {request.quantity} {request.unit || "pcs"}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-slate-600 font-medium mb-1">Requested By</p>
                      <p className="text-slate-900 font-semibold">{request.requested_by || "Unknown"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-slate-600 font-medium mb-1">Requested</p>
                      <p className="text-slate-900 font-semibold text-xs">{formatDate(request.requested_at)}</p>
                    </div>
                  </div>

                  {/* Supplier Info */}
                  {request.supplier_name && (
                    <div className="bg-white border border-slate-200 p-3 rounded-lg">
                      <p className="text-slate-600 font-medium text-sm mb-1">Supplier</p>
                      <p className="text-slate-700 text-sm">{request.supplier_name}</p>
                    </div>
                  )}

                  {/* Notes */}
                  {request.notes && (
                    <div className="bg-white border border-slate-200 p-3 rounded-lg">
                      <p className="text-slate-600 font-medium text-sm mb-1">Notes</p>
                      <p className="text-slate-700 text-sm">{request.notes}</p>
                    </div>
                  )}

                  {/* Action Section */}
                  {selectedRequest === request.id ? (
                    <div className="border-t border-slate-200 pt-4 space-y-3">
                      <div>
                        <Label htmlFor={`notes-${request.id}`} className="text-sm font-medium text-slate-700">
                          {notes ? "Notes / Reason" : "Notes (optional for approval, required for rejection)"}
                        </Label>
                        <Textarea
                          id={`notes-${request.id}`}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Add your notes or reason here..."
                          className="mt-1"
                          rows={3}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleReject(request.id)}
                          disabled={loading}
                          className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          {loading ? "Processing..." : "Reject"}
                        </Button>
                        <Button
                          onClick={() => handleApprove(request.id)}
                          disabled={loading}
                          className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {loading ? "Processing..." : "Approve"}
                        </Button>
                      </div>
                      <Button
                        onClick={() => {
                          setSelectedRequest(null);
                          setNotes("");
                        }}
                        variant="outline"
                        className="w-full"
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="border-t border-slate-200 pt-4">
                      <Button
                        onClick={() => setSelectedRequest(request.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Review & Take Action
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPurchaseApprovals;

