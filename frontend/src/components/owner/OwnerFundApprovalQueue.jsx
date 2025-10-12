import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { 
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ArrowLeft,
  TrendingUp,
  FileText,
  Building2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/use-toast';

const OwnerFundApprovalQueue = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [ownerNotes, setOwnerNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/owner/pending-fund-requests`);
      if (response.ok) {
        const data = await response.json();
        setPendingRequests(data);
      }
    } catch (error) {
      console.error('Error loading fund requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pending fund requests',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (decision) => {
    if (!selectedRequest) return;

    setProcessing(true);

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/owner/approve-funds/${selectedRequest.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: decision,
            owner_decision_by: 'Owner',  // Replace with actual user
            owner_notes: ownerNotes || null
          })
        }
      );

      if (response.ok) {
        toast({
          title: decision === 'approved' ? '✅ Funds Approved' : '❌ Funds Denied',
          description: `Fund request ${selectedRequest.request_number} ${decision}`,
          variant: decision === 'approved' ? 'default' : 'destructive'
        });

        // Reset and reload
        setSelectedRequest(null);
        setOwnerNotes('');
        await loadPendingRequests();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.detail || 'Failed to process decision',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error processing decision:', error);
      toast({
        title: 'Error',
        description: 'Failed to process decision',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return 'ETB 0';
    }
    return `ETB ${Number(amount).toLocaleString()}`;
  };

  const getUrgencyBadge = (urgency) => {
    const variants = {
      'emergency': 'destructive',
      'urgent': 'warning',
      'normal': 'default'
    };
    const colors = {
      'emergency': '🔴',
      'urgent': '🟡',
      'normal': '🟢'
    };
    return (
      <Badge variant={variants[urgency] || 'default'}>
        {colors[urgency]} {urgency.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <DollarSign className="w-12 h-12 mx-auto mb-4 text-green-600 animate-pulse" />
          <p className="text-slate-600">Loading fund requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="border-slate-300 hover:bg-slate-50"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-3 rounded-xl shadow-lg">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Fund Authorization Requests</h1>
                  <p className="text-slate-600 text-sm">Review and approve fund release for Finance Department</p>
                </div>
              </div>
            </div>
            <Badge variant="outline" className="text-base px-4 py-2 border-indigo-300 text-indigo-700 bg-indigo-50">
              {pendingRequests.length} Pending
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column - Pending Requests */}
          <Card className="border-slate-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-t-xl border-b border-slate-700">
              <CardTitle className="text-lg font-semibold">Pending Fund Requests</CardTitle>
              <CardDescription className="text-slate-300">
                Finance officers requesting fund authorization
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <p className="text-slate-600">No pending fund requests</p>
                    <p className="text-sm text-slate-400">All requests processed</p>
                  </div>
                ) : (
                  pendingRequests.map((req) => (
                    <div
                      key={req.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedRequest?.id === req.id
                          ? 'border-indigo-500 bg-indigo-50 shadow-lg ring-2 ring-indigo-200'
                          : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 hover:shadow-md'
                      }`}
                      onClick={() => setSelectedRequest(req)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs bg-slate-100">
                              {req.request_number}
                            </Badge>
                            {getUrgencyBadge(req.payment_urgency)}
                            {req.requires_multi_signature && (
                              <Badge className="text-xs bg-red-100 text-red-800 border-red-300">
                                Multi-Sig Required
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-slate-900 mb-1">
                            {req.pr_details?.description || 'Purchase Request'}
                          </h3>
                          <p className="text-xs text-slate-600 mb-1">
                            PR: {req.pr_details?.request_number}
                          </p>
                          <p className="text-xs text-slate-500">
                            Requested by {req.requested_by}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-indigo-700">
                            {formatCurrency(req.amount)}
                          </div>
                          {selectedRequest?.id === req.id && (
                            <CheckCircle2 className="w-6 h-6 text-indigo-600 mt-2" />
                          )}
                        </div>
                      </div>

                      {/* Spending Context */}
                      <div className="mt-3 pt-3 border-t border-slate-200 text-xs">
                        <div className="grid grid-cols-2 gap-2 text-slate-600">
                          <div>
                            <span className="font-medium">Daily Spent:</span> {formatCurrency(req.finance_officer_daily_spent)}
                          </div>
                          {req.remaining_daily_limit !== null && (
                            <div>
                              <span className="font-medium">Daily Remaining:</span> {formatCurrency(req.remaining_daily_limit)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Request Details */}
          <Card className="border-slate-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-700 to-indigo-800 text-white rounded-t-xl border-b border-indigo-600">
              <CardTitle className="text-lg font-semibold">Request Details & Decision</CardTitle>
              <CardDescription className="text-indigo-100">
                Review and approve/deny fund release
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {!selectedRequest ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600">Select a request to review</p>
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* Amount Display */}
                  <div className="bg-gradient-to-br from-indigo-50 via-slate-50 to-indigo-50 p-6 rounded-xl border-2 border-indigo-200 text-center shadow-inner">
                    <p className="text-sm font-medium text-indigo-700 mb-2">Requested Amount</p>
                    <p className="text-5xl font-bold text-indigo-900 tracking-tight">
                      {formatCurrency(selectedRequest.amount)}
                    </p>
                    {selectedRequest.exceeds_threshold && (
                      <Badge className="mt-3 bg-orange-100 text-orange-800 border-orange-300">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Exceeds Normal Threshold
                      </Badge>
                    )}
                  </div>

                  {/* Purchase Details */}
                  <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm">
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-600" />
                      Purchase Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">PR Number:</span>
                        <span className="font-medium">{selectedRequest.pr_details?.request_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Description:</span>
                        <span className="font-medium">{selectedRequest.pr_details?.description}</span>
                      </div>
                      {selectedRequest.pr_details?.vendor_name && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Vendor:</span>
                          <span className="font-medium">{selectedRequest.pr_details.vendor_name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Justification */}
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-300">
                    <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-slate-600" />
                      Justification
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed">{selectedRequest.justification}</p>
                  </div>

                  {/* Finance Officer Context */}
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-300 shadow-sm">
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-slate-600" />
                      Finance Officer Spending
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-1">
                        <span className="text-slate-600">Officer:</span>
                        <span className="font-semibold text-slate-900">{selectedRequest.requested_by}</span>
                      </div>
                      <div className="flex justify-between py-1 bg-white px-2 rounded">
                        <span className="text-slate-600">Today's Spending:</span>
                        <span className="font-medium text-slate-900">{formatCurrency(selectedRequest.finance_officer_daily_spent)}</span>
                      </div>
                      {selectedRequest.remaining_daily_limit !== null && (
                        <div className="flex justify-between py-1 bg-white px-2 rounded">
                          <span className="text-slate-600">Daily Remaining:</span>
                          <span className="font-bold text-indigo-700">
                            {formatCurrency(selectedRequest.remaining_daily_limit)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between py-1 bg-white px-2 rounded mt-2">
                        <span className="text-slate-600">Monthly Spending:</span>
                        <span className="font-medium text-slate-900">{formatCurrency(selectedRequest.finance_officer_monthly_spent)}</span>
                      </div>
                      {selectedRequest.remaining_monthly_limit !== null && (
                        <div className="flex justify-between py-1 bg-white px-2 rounded">
                          <span className="text-slate-600">Monthly Remaining:</span>
                          <span className="font-bold text-indigo-700">
                            {formatCurrency(selectedRequest.remaining_monthly_limit)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Owner Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Your Decision Notes (Optional)
                    </label>
                    <Textarea
                      value={ownerNotes}
                      onChange={(e) => setOwnerNotes(e.target.value)}
                      placeholder="Add notes about your decision..."
                      rows={3}
                      className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-slate-200">
                    <Button
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all"
                      onClick={() => handleDecision('approved')}
                      disabled={processing}
                      size="lg"
                    >
                      {processing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          Approve Funds
                        </>
                      )}
                    </Button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all"
                      onClick={() => handleDecision('denied')}
                      disabled={processing}
                      size="lg"
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Deny Funds
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedRequest(null);
                        setOwnerNotes('');
                      }}
                      className="border-slate-300 hover:bg-slate-100"
                      size="lg"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default OwnerFundApprovalQueue;

