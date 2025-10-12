import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Package, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  Calendar,
  Plus,
  Truck,
  AlertCircle
} from 'lucide-react';

const InternalOrderRequisitions = ({ userRole = "sales", userBranch = null }) => {
  const [orders, setOrders] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [productName, setProductName] = useState('');
  const [packageSize, setPackageSize] = useState('');
  const [quantity, setQuantity] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  
  const currentUser = userRole === "sales" ? "Mekdes Alem" :
                      userRole === "store_keeper" ? "Berhe Kidane" :
                      userRole === "manager" ? "Yohannes Teklu" :
                      "Admin User";

  // Product configurations
  const products = [
    { 
      name: "1st Quality Flour",
      sizes: ["50kg", "25kg", "10kg", "5kg"]
    },
    {
      name: "Bread Flour",
      sizes: ["50kg", "25kg"]
    }
  ];

  const availableSizes = products.find(p => p.name === productName)?.sizes || [];

  useEffect(() => {
    fetchOrders();
  }, [userBranch]);

  const fetchOrders = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      
      // For storekeepers, fetch stock requests for their branch only
      let url = `${backendUrl}/api/internal-orders`;
      if (userRole === "store_keeper" && userBranch) {
        // Storekeepers see requests where they are the source (fulfillment)
        url = `${backendUrl}/api/stock-requests?source_branch=${userBranch}&status=pending_fulfillment`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        setOrders(getMockOrders());
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders(getMockOrders());
    }
  };

  const getMockOrders = () => [
    {
      id: "1",
      request_number: "IO-00001",
      product_name: "1st Quality Flour",
      package_size: "50kg",
      quantity: 20,
      total_weight: 1000,
      requested_by: "Mekdes Alem",
      requested_at: "2025-01-15T10:30:00",
      status: "pending_approval"
    },
    {
      id: "2",
      request_number: "IO-00002",
      product_name: "Bread Flour",
      package_size: "25kg",
      quantity: 40,
      total_weight: 1000,
      requested_by: "Mekdes Alem",
      requested_at: "2025-01-14T14:20:00",
      status: "approved",
      approved_by: "Yohannes Teklu",
      approved_at: "2025-01-14T15:30:00"
    },
    {
      id: "3",
      request_number: "IO-00003",
      product_name: "1st Quality Flour",
      package_size: "10kg",
      quantity: 50,
      total_weight: 500,
      requested_by: "Mekdes Alem",
      requested_at: "2025-01-13T11:45:00",
      status: "fulfilled",
      approved_by: "Yohannes Teklu",
      approved_at: "2025-01-13T12:30:00",
      fulfilled_by: "Berhe Kidane",
      fulfilled_at: "2025-01-13T14:00:00"
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      pending_approval: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-blue-100 text-blue-800 border-blue-300',
      fulfilled: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'fulfilled':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'approved':
        return <Truck className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending_approval: 'Pending Approval',
      approved: 'Approved (Awaiting Pickup)',
      fulfilled: 'Fulfilled',
      rejected: 'Rejected'
    };
    return labels[status] || status;
  };

  const canApprove = (order) => {
    if (!order) return false;
    return (userRole === "manager" || userRole === "admin") && order.status === "pending_approval";
  };

  const canFulfill = (order) => {
    if (!order) return false;
    return userRole === "store_keeper" && order.status === "approved";
  };

  const canReject = (order) => {
    if (!order) return false;
    return (userRole === "manager" || userRole === "admin" || userRole === "store_keeper") && 
           !['fulfilled', 'rejected'].includes(order.status);
  };

  const handleCreateOrder = async () => {
    if (!productName || !packageSize || !quantity) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/internal-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: productName,
          package_size: packageSize,
          quantity: parseInt(quantity),
          requested_by: currentUser
        })
      });

      if (response.ok) {
        alert('Flour request created successfully!');
        setShowCreateModal(false);
        resetForm();
        fetchOrders();
      } else {
        alert('Failed to create flour request');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating flour request');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/internal-orders/${selectedOrder.id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approved_by: currentUser
        })
      });

      if (response.ok) {
        alert('Order approved successfully! Sales team can now pick up the items.');
        setShowActionModal(false);
        fetchOrders();
      } else {
        alert('Failed to approve order');
      }
    } catch (error) {
      console.error('Error approving order:', error);
      alert('Error approving order');
    } finally {
      setLoading(false);
    }
  };

  const handleFulfill = async () => {
    const confirm = window.confirm(`Fulfill this order? This will deduct ${selectedOrder.total_weight}kg of ${selectedOrder.product_name} from inventory.`);
    if (!confirm) return;

    setLoading(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/internal-orders/${selectedOrder.id}/fulfill`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fulfilled_by: currentUser
        })
      });

      if (response.ok) {
        alert('Order fulfilled successfully! Inventory has been updated.');
        setShowActionModal(false);
        fetchOrders();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to fulfill order');
      }
    } catch (error) {
      console.error('Error fulfilling order:', error);
      alert('Error fulfilling order');
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
      const response = await fetch(`${backendUrl}/internal-orders/${selectedOrder.id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rejected_by: currentUser,
          reason: rejectionReason
        })
      });

      if (response.ok) {
        alert('Order rejected');
        setShowActionModal(false);
        setRejectionReason('');
        fetchOrders();
      } else {
        alert('Failed to reject order');
      }
    } catch (error) {
      console.error('Error rejecting order:', error);
      alert('Error rejecting order');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProductName('');
    setPackageSize('');
    setQuantity('');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Internal Order Requisitions</h1>
            <p className="text-slate-600">Request and manage flour orders from the main store</p>
          </div>
          {userRole === "sales" && (
            <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Request Flour
            </Button>
          )}
        </div>

        {/* Workflow Status Guide */}
        <Card className="mb-6 shadow-sm bg-gradient-to-r from-blue-50 to-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="text-xs mt-2 text-slate-600">Pending</span>
                </div>
                <div className="h-0.5 w-16 bg-slate-300"></div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <span className="text-xs mt-2 text-slate-600">Approved</span>
                </div>
                <div className="h-0.5 w-16 bg-slate-300"></div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                    <Truck className="w-5 h-5" />
                  </div>
                  <span className="text-xs mt-2 text-slate-600">Fulfilled</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.length === 0 ? (
            <Card className="shadow-sm">
              <CardContent className="py-12">
                <div className="text-center text-slate-500">
                  <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p className="text-lg">No flour requests yet</p>
                  {userRole === "sales" && (
                    <p className="text-sm mt-2">Create a new request to get started</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="font-mono">{order.request_number}</Badge>
                        <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                          {getStatusIcon(order.status)}
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">{order.product_name}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">Total Weight</p>
                      <p className="text-2xl font-bold text-blue-600">{order.total_weight.toLocaleString()}kg</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Package Size</p>
                      <p className="text-lg font-semibold text-slate-900">{order.package_size}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Quantity</p>
                      <p className="text-lg font-semibold text-slate-900">{order.quantity} packages</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Total</p>
                      <p className="text-lg font-semibold text-blue-600">{order.total_weight}kg</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-600">Requested by:</span>
                      <span className="font-medium text-slate-900">{order.requested_by}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-600">Date:</span>
                      <span className="font-medium text-slate-900">{formatDate(order.requested_at)}</span>
                    </div>
                  </div>

                  {/* Approval/Fulfillment Info */}
                  {(order.approved_by || order.fulfilled_by) && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="space-y-2 text-sm">
                        {order.approved_by && (
                          <div>
                            <span className="font-medium text-blue-800">Approved by:</span> {order.approved_by}
                            <span className="text-slate-600 ml-2">on {formatDate(order.approved_at)}</span>
                          </div>
                        )}
                        {order.fulfilled_by && (
                          <div>
                            <span className="font-medium text-green-800">Fulfilled by:</span> {order.fulfilled_by}
                            <span className="text-slate-600 ml-2">on {formatDate(order.fulfilled_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Rejection Info */}
                  {order.status === 'rejected' && order.rejection_reason && (
                    <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
                      <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        Rejection Reason
                      </h4>
                      <p className="text-sm text-red-800">{order.rejection_reason}</p>
                      <p className="text-xs text-red-600 mt-1">Rejected by: {order.rejected_by}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {canApprove(order) && (
                      <Button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowActionModal(true);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                    )}
                    {canFulfill(order) && (
                      <Button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowActionModal(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Truck className="w-4 h-4 mr-2" />
                        Fulfill Order
                      </Button>
                    )}
                    {canReject(order) && (
                      <Button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowActionModal(true);
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

      {/* Create Order Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Request Flour from Store</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Product *
              </label>
              <Select value={productName} onValueChange={(value) => {
                setProductName(value);
                setPackageSize(''); // Reset package size when product changes
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select flour type" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.name} value={product.name}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Package Size *
              </label>
              <Select value={packageSize} onValueChange={setPackageSize} disabled={!productName}>
                <SelectTrigger>
                  <SelectValue placeholder="Select package size" />
                </SelectTrigger>
                <SelectContent>
                  {availableSizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {productName && (
                <p className="text-xs text-slate-500 mt-1">
                  Available sizes for {productName}: {availableSizes.join(', ')}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Quantity (Number of Packages) *
              </label>
              <Input
                type="number"
                min="1"
                placeholder="e.g., 20"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
              {quantity && packageSize && (
                <p className="text-sm text-blue-600 mt-2 font-medium">
                  Total Weight: {parseInt(quantity) * parseInt(packageSize.replace('kg', ''))}kg
                </p>
              )}
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Workflow:</strong> Request → Manager/Admin Approval → Store Keeper Fulfillment
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateModal(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrder} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? 'Creating...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Modal (Approve/Fulfill/Reject) */}
      <Dialog open={showActionModal} onOpenChange={setShowActionModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review Order - {selectedOrder?.request_number}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="font-semibold text-slate-900 mb-2">{selectedOrder?.product_name}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-600">Package Size:</p>
                  <p className="font-medium">{selectedOrder?.package_size}</p>
                </div>
                <div>
                  <p className="text-slate-600">Quantity:</p>
                  <p className="font-medium">{selectedOrder?.quantity} packages</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200">
                <p className="text-slate-600 text-sm">Total Weight:</p>
                <p className="text-2xl font-bold text-blue-600">{selectedOrder?.total_weight}kg</p>
              </div>
            </div>
            
            {canApprove(selectedOrder) && (
              <>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    Approving will allow the Store Keeper to fulfill this order
                  </p>
                </div>
                <Button
                  onClick={handleApprove}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {loading ? 'Approving...' : 'Approve Order'}
                </Button>
              </>
            )}

            {canFulfill(selectedOrder) && (
              <>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    Fulfilling will automatically deduct {selectedOrder?.total_weight}kg from inventory
                  </p>
                </div>
                <Button
                  onClick={handleFulfill}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Truck className="w-4 h-4 mr-2" />
                  {loading ? 'Fulfilling...' : 'Fulfill Order'}
                </Button>
              </>
            )}

            {canReject(selectedOrder) && (
              <>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Rejection Reason *
                  </label>
                  <textarea
                    className="w-full p-2 border border-slate-300 rounded-md"
                    placeholder="Explain why this order is being rejected"
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
                  {loading ? 'Rejecting...' : 'Reject Order'}
                </Button>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowActionModal(false);
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

export default InternalOrderRequisitions;
