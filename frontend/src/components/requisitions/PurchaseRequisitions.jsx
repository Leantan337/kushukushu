import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { 
  ShoppingCart, 
  CheckCircle, 
  XCircle, 
  Clock,
  DollarSign,
  User,
  Calendar,
  Plus,
  AlertCircle
} from 'lucide-react';

const PurchaseRequisitions = ({ userRole = "manager" }) => {
  const [requisitions, setRequisitions] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [description, setDescription] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [reason, setReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  
  const currentUser = userRole === "manager" ? "Yohannes Teklu" :
                      userRole === "admin" ? "Admin User" :
                      userRole === "owner" ? "Factory Owner" :
                      "Sales User";

  useEffect(() => {
    fetchRequisitions();
  }, []);

  const fetchRequisitions = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/purchase-requisitions`);
      if (response.ok) {
        const data = await response.json();
        setRequisitions(data);
      } else {
        setRequisitions(getMockRequisitions());
      }
    } catch (error) {
      console.error('Error fetching requisitions:', error);
      setRequisitions(getMockRequisitions());
    }
  };

  const getMockRequisitions = () => [
    {
      id: "1",
      request_number: "PR-00001",
      description: "New Milling Equipment",
      estimated_cost: 25000000,
      reason: "Replacement of old machinery to increase production efficiency",
      requested_by: "Yohannes Teklu",
      requested_at: "2025-01-15T10:30:00",
      status: "pending"
    },
    {
      id: "2",
      request_number: "PR-00002",
      description: "Office Supplies and Stationery",
      estimated_cost: 15000,
      reason: "Monthly office supplies replenishment",
      requested_by: "Mekdes Alem",
      requested_at: "2025-01-14T14:20:00",
      status: "manager_approved",
      manager_approval: {
        approved_by: "Yohannes Teklu",
        approved_at: "2025-01-15T09:00:00",
        notes: "Approved for standard office supplies"
      }
    },
    {
      id: "3",
      request_number: "PR-00003",
      description: "Maintenance Services Contract",
      estimated_cost: 180000,
      reason: "Quarterly maintenance contract for all equipment",
      requested_by: "Berhe Kidane",
      requested_at: "2025-01-13T11:45:00",
      status: "admin_approved",
      manager_approval: {
        approved_by: "Yohannes Teklu",
        approved_at: "2025-01-14T10:30:00"
      },
      admin_approval: {
        approved_by: "Admin User",
        approved_at: "2025-01-14T15:20:00"
      }
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      manager_approved: 'bg-blue-100 text-blue-800 border-blue-300',
      admin_approved: 'bg-purple-100 text-purple-800 border-purple-300',
      owner_approved: 'bg-green-100 text-green-800 border-green-300',
      purchased: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      rejected: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'purchased':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'owner_approved':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      manager_approved: 'Manager Approved',
      admin_approved: 'Admin Approved',
      owner_approved: 'Owner Approved',
      purchased: 'Purchased',
      rejected: 'Rejected'
    };
    return labels[status] || status;
  };

  const canApprove = (requisition) => {
    if (userRole === "manager" && requisition.status === "pending") return true;
    if (userRole === "admin" && requisition.status === "manager_approved") return true;
    if (userRole === "owner" && requisition.status === "admin_approved") return true;
    return false;
  };

  const canMarkPurchased = (requisition) => {
    return (userRole === "admin" || userRole === "owner") && requisition.status === "owner_approved";
  };

  const canReject = (requisition) => {
    return (userRole === "manager" || userRole === "admin" || userRole === "owner") && 
           !['purchased', 'rejected'].includes(requisition.status);
  };

  const handleCreateRequisition = async () => {
    if (!description || !estimatedCost || !reason) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/purchase-requisitions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          estimated_cost: parseFloat(estimatedCost),
          reason,
          requested_by: currentUser
        })
      });

      if (response.ok) {
        alert('Purchase requisition created successfully!');
        setShowCreateModal(false);
        resetForm();
        fetchRequisitions();
      } else {
        alert('Failed to create requisition');
      }
    } catch (error) {
      console.error('Error creating requisition:', error);
      alert('Error creating requisition');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      let endpoint = '';
      
      if (userRole === "manager") endpoint = `/purchase-requisitions/${selectedRequisition.id}/approve-manager`;
      else if (userRole === "admin") endpoint = `/purchase-requisitions/${selectedRequisition.id}/approve-admin`;
      else if (userRole === "owner") endpoint = `/purchase-requisitions/${selectedRequisition.id}/approve-owner`;

      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approved_by: currentUser,
          notes: approvalNotes
        })
      });

      if (response.ok) {
        alert('Requisition approved successfully!');
        setShowApprovalModal(false);
        setApprovalNotes('');
        fetchRequisitions();
      } else {
        alert('Failed to approve requisition');
      }
    } catch (error) {
      console.error('Error approving requisition:', error);
      alert('Error approving requisition');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) {
      alert('Please provide a reason for rejection');
      return;
    }

    setLoading(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/purchase-requisitions/${selectedRequisition.id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rejected_by: currentUser,
          reason: rejectionReason
        })
      });

      if (response.ok) {
        alert('Requisition rejected');
        setShowApprovalModal(false);
        setRejectionReason('');
        fetchRequisitions();
      } else {
        alert('Failed to reject requisition');
      }
    } catch (error) {
      console.error('Error rejecting requisition:', error);
      alert('Error rejecting requisition');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPurchased = async (requisition) => {
    const confirm = window.confirm('Mark this requisition as purchased?');
    if (!confirm) return;

    setLoading(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/purchase-requisitions/${requisition.id}/mark-purchased?user=${encodeURIComponent(currentUser)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        alert('Requisition marked as purchased!');
        fetchRequisitions();
      } else {
        alert('Failed to mark as purchased');
      }
    } catch (error) {
      console.error('Error marking as purchased:', error);
      alert('Error marking as purchased');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDescription('');
    setEstimatedCost('');
    setReason('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-ET', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return 'Br 0';
    }
    return `Br ${Number(amount).toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Purchase Requisitions</h1>
            <p className="text-slate-600">Request and manage purchase approvals for goods and services</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </div>

        {/* Workflow Status Guide */}
        <Card className="mb-6 shadow-sm bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">1</div>
                  <span className="text-xs mt-2 text-slate-600">Pending</span>
                </div>
                <div className="h-0.5 w-12 bg-slate-300"></div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">2</div>
                  <span className="text-xs mt-2 text-slate-600">Manager</span>
                </div>
                <div className="h-0.5 w-12 bg-slate-300"></div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">3</div>
                  <span className="text-xs mt-2 text-slate-600">Admin</span>
                </div>
                <div className="h-0.5 w-12 bg-slate-300"></div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">4</div>
                  <span className="text-xs mt-2 text-slate-600">Owner</span>
                </div>
                <div className="h-0.5 w-12 bg-slate-300"></div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <span className="text-xs mt-2 text-slate-600">Purchased</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requisitions List */}
        <div className="space-y-4">
          {requisitions.length === 0 ? (
            <Card className="shadow-sm">
              <CardContent className="py-12">
                <div className="text-center text-slate-500">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p className="text-lg">No purchase requisitions yet</p>
                  <p className="text-sm mt-2">Create a new request to get started</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            requisitions.map((req) => (
              <Card key={req.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="font-mono">{req.request_number}</Badge>
                        <Badge className={`${getStatusColor(req.status)} flex items-center gap-1`}>
                          {getStatusIcon(req.status)}
                          {getStatusLabel(req.status)}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">{req.description}</h3>
                      <p className="text-sm text-slate-600 mb-3">{req.reason}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{formatCurrency(req.estimated_cost)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-600">Requested by:</span>
                      <span className="font-medium text-slate-900">{req.requested_by}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-600">Date:</span>
                      <span className="font-medium text-slate-900">{formatDate(req.requested_at)}</span>
                    </div>
                  </div>

                  {/* Approval Chain */}
                  {(req.manager_approval || req.admin_approval || req.owner_approval) && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Approval History
                      </h4>
                      <div className="space-y-2">
                        {req.manager_approval && (
                          <div className="text-sm">
                            <span className="font-medium text-blue-800">Manager:</span> {req.manager_approval.approved_by}
                            {req.manager_approval.notes && <span className="text-slate-600 ml-2">- {req.manager_approval.notes}</span>}
                          </div>
                        )}
                        {req.admin_approval && (
                          <div className="text-sm">
                            <span className="font-medium text-purple-800">Admin:</span> {req.admin_approval.approved_by}
                            {req.admin_approval.notes && <span className="text-slate-600 ml-2">- {req.admin_approval.notes}</span>}
                          </div>
                        )}
                        {req.owner_approval && (
                          <div className="text-sm">
                            <span className="font-medium text-green-800">Owner:</span> {req.owner_approval.approved_by}
                            {req.owner_approval.notes && <span className="text-slate-600 ml-2">- {req.owner_approval.notes}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Rejection Info */}
                  {req.status === 'rejected' && req.rejection_reason && (
                    <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
                      <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        Rejection Reason
                      </h4>
                      <p className="text-sm text-red-800">{req.rejection_reason}</p>
                      <p className="text-xs text-red-600 mt-1">Rejected by: {req.rejected_by}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {canApprove(req) && (
                      <Button
                        onClick={() => {
                          setSelectedRequisition(req);
                          setShowApprovalModal(true);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                    )}
                    {canMarkPurchased(req) && (
                      <Button
                        onClick={() => handleMarkPurchased(req)}
                        className="bg-emerald-600 hover:bg-emerald-700"
                        disabled={loading}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Mark as Purchased
                      </Button>
                    )}
                    {canReject(req) && (
                      <Button
                        onClick={() => {
                          setSelectedRequisition(req);
                          setShowApprovalModal(true);
                        }}
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Create Requisition Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Purchase Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Item/Service Description *
              </label>
              <Input
                placeholder="e.g., New Milling Equipment, Office Supplies"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Estimated Cost (ETB) *
              </label>
              <Input
                type="number"
                placeholder="e.g., 25000"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Reason/Justification *
              </label>
              <Textarea
                placeholder="Explain why this purchase is needed"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
              />
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Approval Flow:</strong> Manager → Admin → Owner
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateModal(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleCreateRequisition} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? 'Creating...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval/Rejection Modal */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review Requisition - {selectedRequisition?.request_number}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="font-semibold text-slate-900 mb-2">{selectedRequisition?.description}</p>
              <p className="text-2xl font-bold text-blue-600 mb-2">{formatCurrency(selectedRequisition?.estimated_cost || 0)}</p>
              <p className="text-sm text-slate-600">{selectedRequisition?.reason}</p>
            </div>
            
            {canApprove(selectedRequisition) && (
              <>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Approval Notes (Optional)
                  </label>
                  <Textarea
                    placeholder="Add any notes or conditions for approval"
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleApprove}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {loading ? 'Approving...' : 'Approve Requisition'}
                </Button>
              </>
            )}

            {canReject(selectedRequisition) && (
              <>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Rejection Reason *
                  </label>
                  <Textarea
                    placeholder="Explain why this requisition is being rejected"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleReject}
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {loading ? 'Rejecting...' : 'Reject Requisition'}
                </Button>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowApprovalModal(false);
              setApprovalNotes('');
              setRejectionReason('');
            }}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseRequisitions;
