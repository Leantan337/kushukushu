import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { 
  CreditCard, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  FileText,
  Printer,
  Send
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../../hooks/use-toast';
import { useAppContext } from '../../context/AppContext';
import FinanceFundRequestForm from './FinanceFundRequestForm';

const PaymentProcessing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const { formatCurrency, currentUser } = useAppContext();
  
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [approvedRequisitions, setApprovedRequisitions] = useState([]);
  const [showFundRequestForm, setShowFundRequestForm] = useState(false);
  const [spendingLimits, setSpendingLimits] = useState(null);
  
  const [paymentDetails, setPaymentDetails] = useState({
    paymentMethod: '',
    bankAccount: '',
    referenceNumber: '',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: '',
    attachments: []
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    loadPendingAuthorizations();
    loadSpendingLimits();
  }, []);

  useEffect(() => {
    // Check if a specific approval was passed from dashboard
    if (location.state?.approval) {
      setSelectedRequisition(location.state.approval);
    }
  }, [location]);

  const loadPendingAuthorizations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/finance/pending-authorizations`);
      if (response.ok) {
        const data = await response.json();
        setApprovedRequisitions(data);
      }
    } catch (error) {
      console.error('Error loading pending authorizations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pending authorizations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSpendingLimits = async () => {
    try {
      const financeOfficer = currentUser?.username || 'Finance Officer';
      const response = await fetch(`${BACKEND_URL}/api/finance/spending-limits?finance_officer=${financeOfficer}`);
      if (response.ok) {
        const data = await response.json();
        setSpendingLimits(data);
      }
    } catch (error) {
      console.error('Error loading spending limits:', error);
    }
  };

  const checkPaymentThreshold = (pr) => {
    if (!pr) return null;
    
    const amount = pr.estimated_cost;
    
    // Check if PR already marked as requiring fund request
    if (pr.requires_fund_request) {
      return {
        needsFundRequest: true,
        message: `Amount of ETB ${amount.toLocaleString()} requires Owner fund authorization`
      };
    }
    
    // Check if already funds-approved
    if (pr.status === 'funds_approved' || pr.can_process_directly) {
      return {
        needsFundRequest: false,
        canProcess: true
      };
    }
    
    return { canProcess: true };
  };

  const handleProcessPayment = async () => {
    if (!selectedRequisition) {
      toast({
        title: 'No Requisition Selected',
        description: 'Please select a requisition to process payment',
        variant: 'destructive'
      });
      return;
    }

    if (!paymentDetails.paymentMethod || !paymentDetails.bankAccount) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required payment details',
        variant: 'destructive'
      });
      return;
    }

    setProcessing(true);

    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      
      // Process payment via finance API
      const response = await fetch(`${BACKEND_URL}/api/finance/process-payment/${selectedRequisition.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedRequisition.estimated_cost,
          payment_method: paymentDetails.paymentMethod,
          bank_account: paymentDetails.bankAccount,
          reference_number: paymentDetails.referenceNumber,
          payment_date: paymentDetails.paymentDate,
          processed_by: currentUser?.username || 'Finance Officer',
          notes: paymentDetails.notes
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        toast({
          title: '✅ Payment Processed Successfully',
          description: `Payment of ${formatCurrency(selectedRequisition.estimated_cost)} processed. Purchase requisition status updated to PURCHASED.`,
          variant: 'default'
        });

        // Reset form
        setSelectedRequisition(null);
        setPaymentDetails({
          paymentMethod: '',
          bankAccount: '',
          referenceNumber: '',
          paymentDate: new Date().toISOString().split('T')[0],
          notes: '',
          attachments: []
        });

        // Reload the list
        await loadPendingAuthorizations();
        
        // Navigate back to dashboard
        setTimeout(() => {
          navigate('/finance/dashboard');
        }, 1500);
      } else {
        const error = await response.json();
        toast({
          title: 'Payment Failed',
          description: error.detail || 'Failed to process payment',
          variant: 'destructive'
        });
      }

    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: 'Payment Failed',
        description: 'Failed to process payment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <CreditCard className="w-12 h-12 mx-auto mb-4 text-green-600 animate-pulse" />
          <p className="text-slate-600">Loading pending payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/finance/dashboard')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-4">
              <div className="bg-green-600 p-3 rounded-2xl">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Payment Processing</h1>
                <p className="text-slate-600">Process approved purchase requisitions</p>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {approvedRequisitions.length} Pending
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column - Approved Requisitions List */}
          <Card className="border-slate-200 shadow-md">
            <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-t-xl">
              <CardTitle>Owner-Approved Requisitions</CardTitle>
              <CardDescription className="text-slate-300">
                Select a requisition to process payment
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {approvedRequisitions.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <p className="text-slate-600">No pending payments</p>
                    <p className="text-sm text-slate-400">All requisitions processed</p>
                  </div>
                ) : (
                  approvedRequisitions.map((req) => (
                    <div
                      key={req.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedRequisition?.id === req.id
                          ? 'border-green-500 bg-green-50 shadow-md'
                          : 'border-slate-200 hover:border-green-300 hover:bg-slate-50'
                      }`}
                      onClick={() => setSelectedRequisition(req)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {req.request_number}
                            </Badge>
                            <Badge variant="success">Owner Approved</Badge>
                          </div>
                          <h3 className="font-semibold text-slate-900">
                            {req.description}
                          </h3>
                        </div>
                        {selectedRequisition?.id === req.id && (
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">
                        {req.reason}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          Requested by {req.requested_by}
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(req.estimated_cost)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Payment Details Form */}
          <Card className="border-slate-200 shadow-md">
            <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-xl">
              <CardTitle>Payment Details</CardTitle>
              <CardDescription className="text-green-100">
                Enter payment information
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {!selectedRequisition ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600">Select a requisition to process payment</p>
                </div>
              ) : showFundRequestForm ? (
                <FinanceFundRequestForm
                  purchaseRequisition={selectedRequisition}
                  onClose={() => setShowFundRequestForm(false)}
                  onSuccess={() => {
                    setShowFundRequestForm(false);
                    setSelectedRequisition(null);
                    loadPendingAuthorizations();
                  }}
                />
              ) : (
                <div className="space-y-6">
                  
                  {/* Threshold Check Alert */}
                  {selectedRequisition.requires_fund_request && selectedRequisition.status !== 'funds_approved' && (
                    <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-amber-600 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-amber-900 mb-1">Owner Fund Authorization Required</h3>
                          <p className="text-sm text-amber-700">
                            This payment of {formatCurrency(selectedRequisition.estimated_cost)} exceeds your authorization threshold. 
                            You must request Owner approval before processing.
                          </p>
                          <Button
                            className="mt-3 bg-amber-600 hover:bg-amber-700 text-white"
                            size="sm"
                            onClick={() => setShowFundRequestForm(true)}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Request Fund Authorization
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedRequisition.status === 'funds_approved' && (
                    <div className="bg-green-50 border border-green-300 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <p className="text-sm font-semibold text-green-900">
                          Funds Approved by Owner - Ready to Process
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Requisition Summary */}
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h3 className="font-semibold text-slate-900 mb-3">Requisition Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Request Number:</span>
                        <span className="font-medium">{selectedRequisition.request_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Description:</span>
                        <span className="font-medium">{selectedRequisition.description}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Status:</span>
                        <Badge variant={selectedRequisition.status === 'funds_approved' ? 'success' : 'default'}>
                          {selectedRequisition.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Amount to Pay:</span>
                        <span className="font-bold text-green-600 text-lg">
                          {formatCurrency(selectedRequisition.estimated_cost)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Form */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="paymentMethod">Payment Method *</Label>
                      <Select
                        value={paymentDetails.paymentMethod}
                        onValueChange={(value) => setPaymentDetails({...paymentDetails, paymentMethod: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="check">Check</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="mobile_money">Mobile Money</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="bankAccount">Bank Account / Source *</Label>
                      <Select
                        value={paymentDetails.bankAccount}
                        onValueChange={(value) => setPaymentDetails({...paymentDetails, bankAccount: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="commercial_bank_001">Commercial Bank - Account 001</SelectItem>
                          <SelectItem value="commercial_bank_002">Commercial Bank - Account 002</SelectItem>
                          <SelectItem value="abyssinia_bank">Abyssinia Bank - Main Account</SelectItem>
                          <SelectItem value="petty_cash">Petty Cash</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="referenceNumber">Reference Number</Label>
                      <Input
                        id="referenceNumber"
                        placeholder="Transaction/Check reference number"
                        value={paymentDetails.referenceNumber}
                        onChange={(e) => setPaymentDetails({...paymentDetails, referenceNumber: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="paymentDate">Payment Date *</Label>
                      <Input
                        id="paymentDate"
                        type="date"
                        value={paymentDetails.paymentDate}
                        onChange={(e) => setPaymentDetails({...paymentDetails, paymentDate: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Additional payment notes or remarks"
                        rows={3}
                        value={paymentDetails.notes}
                        onChange={(e) => setPaymentDetails({...paymentDetails, notes: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Approval Trail */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Approval Trail
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-slate-700">
                          Manager: {selectedRequisition.manager_approval?.approved_by}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-slate-700">
                          Admin: {selectedRequisition.admin_approval?.approved_by}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-slate-700">
                          Owner: {selectedRequisition.owner_approval?.approved_by}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={handleProcessPayment}
                      disabled={
                        processing || 
                        !paymentDetails.paymentMethod || 
                        !paymentDetails.bankAccount ||
                        (selectedRequisition.requires_fund_request && selectedRequisition.status !== 'funds_approved')
                      }
                    >
                      {processing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Process Payment
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedRequisition(null)}>
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

export default PaymentProcessing;

