import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  CheckCircle, 
  Clock, 
  Package, 
  User,
  Calendar,
  AlertCircle,
  Check,
  X
} from 'lucide-react';

const ManagerQueue = ({ manager, onSuccess }) => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const fetchPendingOrders = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      // Filter by branch
      const response = await fetch(`${backendUrl}/api/inventory-requests/manager-queue?branch_id=${manager.branch_id}`);
      
      if (response.ok) {
        const data = await response.json();
        // Ensure we only show orders for this manager's branch
        const branchOrders = data.filter(order => order.branch_id === manager.branch_id || order.source_branch === manager.branch_id);
        setPendingOrders(branchOrders);
      } else {
        console.error('Failed to fetch pending orders');
        // Mock data for demo
        setPendingOrders([
          {
            id: 'order-001',
            request_number: 'IOR-00001',
            product_name: '1st Quality Flour',
            package_size: '50kg',
            quantity: 10,
            total_weight: 500,
            requested_by: 'Hana Tekle (Sales)',
            requested_at: new Date().toISOString(),
            manager_approval_status: 'pending'
          },
          {
            id: 'order-002',
            request_number: 'IOR-00002',
            product_name: 'Bread Flour',
            package_size: '25kg',
            quantity: 8,
            total_weight: 200,
            requested_by: 'Meron Gebru (Sales)',
            requested_at: new Date(Date.now() - 86400000).toISOString(),
            manager_approval_status: 'pending'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching pending orders:', error);
    }
  };

  const handleApproval = async (orderId) => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/inventory-requests/${orderId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approved_by: manager.name || manager.id,
          notes: 'Approved by manager'
        })
      });

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: 'Order approved successfully! Store Keeper can now fulfill this request.' 
        });
        
        // Remove from pending list
        setPendingOrders(prev => prev.filter(order => order.id !== orderId));
        
        // Call success callback
        onSuccess && onSuccess();
      } else {
        const error = await response.json();
        setMessage({ 
          type: 'error', 
          text: error.detail || 'Failed to approve order' 
        });
      }
    } catch (error) {
      console.error('Error approving order:', error);
      setMessage({ 
        type: 'error', 
        text: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-ET', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-600" />
          Manager Approval Queue
          {pendingOrders.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {pendingOrders.length} pending
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {message.text && (
          <Alert className={`mb-4 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {pendingOrders.length > 0 ? (
          <div className="space-y-4">
            {pendingOrders.map((order) => (
              <div key={order.id} className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-lg text-slate-900 mb-1">
                      Request #{order.request_number}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {order.requested_by}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(order.requested_at)}
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className="bg-orange-50 text-orange-700 border-orange-200"
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    Pending Manager Approval
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-700">Product</span>
                    </div>
                    <p className="font-semibold text-slate-900">{order.product_name}</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-700">Quantity</span>
                    </div>
                    <p className="font-semibold text-slate-900">
                      {order.quantity} × {order.package_size}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-700">Total Weight</span>
                    </div>
                    <p className="font-semibold text-slate-900">{order.total_weight}kg</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleApproval(order.id)}
                    disabled={loading}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4" />
                    {loading ? 'Approving...' : 'Approve Request'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
                    disabled={loading}
                  >
                    <X className="w-4 h-4" />
                    Reject Request
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">All caught up!</h3>
            <p className="text-slate-600">No internal order requests pending your approval.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ManagerQueue;