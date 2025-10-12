import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { 
  CheckCircle2, 
  XCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/use-toast';

const DailyReconciliationNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [pendingReconciliations, setPendingReconciliations] = useState([]);
  const [selectedRecon, setSelectedRecon] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [varianceExplanation, setVarianceExplanation] = useState('');
  const [processing, setProcessing] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    loadPendingReconciliations();
  }, []);

  const loadPendingReconciliations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/finance/reconciliation/pending`);
      if (response.ok) {
        const data = await response.json();
        setPendingReconciliations(data);
      }
    } catch (error) {
      console.error('Error loading reconciliations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pending reconciliations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyReconciliation = async (status) => {
    if (!selectedRecon) return;

    if (status === 'approved' && Math.abs(selectedRecon.variance) > 100 && !varianceExplanation) {
      toast({
        title: 'Explanation Required',
        description: 'Please provide an explanation for the variance',
        variant: 'destructive'
      });
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/finance/reconciliation/${selectedRecon.id}/verify`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: status,
            verified_by: 'Finance Officer',  // Replace with actual user
            verification_notes: verificationNotes,
            variance_explanation: varianceExplanation || null
          })
        }
      );

      if (response.ok) {
        toast({
          title: status === 'approved' ? '✅ Reconciliation Approved' : '⚠️ Reconciliation Disputed',
          description: `Reconciliation ${selectedRecon.reconciliation_number} ${status === 'approved' ? 'verified and approved' : 'marked as disputed'}`,
          variant: 'default'
        });

        // Reset and reload
        setSelectedRecon(null);
        setVerificationNotes('');
        setVarianceExplanation('');
        await loadPendingReconciliations();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.detail || 'Failed to verify reconciliation',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error verifying reconciliation:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify reconciliation',
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

  const getVarianceBadge = (variance) => {
    const absVariance = Math.abs(variance);
    if (absVariance === 0) {
      return <Badge variant="success" className="flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3" />
        Perfect Match
      </Badge>;
    } else if (absVariance < 10) {
      return <Badge variant="warning" className="flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        Minor Variance
      </Badge>;
    } else {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        Significant Variance
      </Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-pulse" />
          <p className="text-slate-600">Loading reconciliations...</p>
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
              <div className="bg-blue-600 p-3 rounded-2xl">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Daily Reconciliation</h1>
                <p className="text-slate-600">Verify end-of-day cash submissions from Sales</p>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {pendingReconciliations.length} Pending
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column - Pending Reconciliations */}
          <Card className="border-slate-200 shadow-md">
            <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-t-xl">
              <CardTitle>Pending Reconciliations</CardTitle>
              <CardDescription className="text-slate-300">
                Select a reconciliation to review
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {pendingReconciliations.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <p className="text-slate-600">All reconciliations verified!</p>
                    <p className="text-sm text-slate-400">No pending reconciliations</p>
                  </div>
                ) : (
                  pendingReconciliations.map((recon) => (
                    <div
                      key={recon.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedRecon?.id === recon.id
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                      onClick={() => setSelectedRecon(recon)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {recon.reconciliation_number}
                            </Badge>
                            {getVarianceBadge(recon.variance)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Building2 className="w-4 h-4" />
                            {recon.branch_id} Branch
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Submitted by {recon.submitted_by}
                          </p>
                        </div>
                        {selectedRecon?.id === recon.id && (
                          <CheckCircle2 className="w-6 h-6 text-blue-600" />
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-slate-500">Expected:</span>
                          <p className="font-semibold">{formatCurrency(recon.expected_cash)}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Actual:</span>
                          <p className="font-semibold">{formatCurrency(recon.actual_cash)}</p>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Variance:</span>
                          <span className={`text-lg font-bold ${
                            recon.variance < 0 ? 'text-red-600' : recon.variance > 0 ? 'text-green-600' : 'text-slate-600'
                          }`}>
                            {recon.variance < 0 ? (
                              <span className="flex items-center gap-1">
                                <TrendingDown className="w-4 h-4" />
                                {formatCurrency(Math.abs(recon.variance))} shortage
                              </span>
                            ) : recon.variance > 0 ? (
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                {formatCurrency(recon.variance)} overage
                              </span>
                            ) : (
                              '0.00'
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Verification Details */}
          <Card className="border-slate-200 shadow-md">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-xl">
              <CardTitle>Verification Details</CardTitle>
              <CardDescription className="text-blue-100">
                Review and verify reconciliation
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {!selectedRecon ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600">Select a reconciliation to verify</p>
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* Reconciliation Summary */}
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h3 className="font-semibold text-slate-900 mb-3">Reconciliation Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Date:</span>
                        <span className="font-medium">
                          {new Date(selectedRecon.reconciliation_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Branch:</span>
                        <span className="font-medium">{selectedRecon.branch_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Transactions:</span>
                        <span className="font-medium">{selectedRecon.transaction_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Total Sales:</span>
                        <span className="font-bold text-blue-600">
                          {formatCurrency(selectedRecon.total_sales)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Transaction Breakdown */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-3">Transaction Breakdown</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Cash Sales:</span>
                        <span className="font-medium">{formatCurrency(selectedRecon.cash_sales)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Mobile Money:</span>
                        <span className="font-medium">{formatCurrency(selectedRecon.mobile_money_sales)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Loan Sales:</span>
                        <span className="font-medium">{formatCurrency(selectedRecon.loan_sales)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-blue-300">
                        <span className="text-blue-900 font-semibold">Expected Cash:</span>
                        <span className="font-bold text-lg">{formatCurrency(selectedRecon.expected_cash)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Variance Analysis */}
                  <div className={`p-4 rounded-lg border ${
                    Math.abs(selectedRecon.variance) === 0 ? 'bg-green-50 border-green-200' :
                    Math.abs(selectedRecon.variance) < 10 ? 'bg-amber-50 border-amber-200' :
                    'bg-red-50 border-red-200'
                  }`}>
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Variance Analysis
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">Actual Cash Counted:</span>
                        <span className="font-bold text-lg">{formatCurrency(selectedRecon.actual_cash)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Expected Cash:</span>
                        <span className="font-bold text-lg">{formatCurrency(selectedRecon.expected_cash)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-300">
                        <span className="font-bold">Variance:</span>
                        <span className={`font-bold text-xl ${
                          selectedRecon.variance < 0 ? 'text-red-600' :
                          selectedRecon.variance > 0 ? 'text-green-600' :
                          'text-slate-600'
                        }`}>
                          {selectedRecon.variance < 0 ? '-' : '+'}{formatCurrency(Math.abs(selectedRecon.variance))}
                        </span>
                      </div>
                      {selectedRecon.variance !== 0 && (
                        <p className="text-xs mt-2 italic">
                          {selectedRecon.variance < 0 ? 'Cash shortage - less than expected' : 'Cash overage - more than expected'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Submission Notes */}
                  {selectedRecon.submission_notes && (
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <h3 className="font-semibold text-slate-900 mb-2">Submission Notes</h3>
                      <p className="text-sm text-slate-700">{selectedRecon.submission_notes}</p>
                    </div>
                  )}

                  {/* Verification Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Verification Notes
                      </label>
                      <Textarea
                        value={verificationNotes}
                        onChange={(e) => setVerificationNotes(e.target.value)}
                        placeholder="Add any notes about this reconciliation..."
                        rows={3}
                      />
                    </div>

                    {Math.abs(selectedRecon.variance) > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Variance Explanation {Math.abs(selectedRecon.variance) > 100 && <span className="text-red-600">*</span>}
                        </label>
                        <Textarea
                          value={varianceExplanation}
                          onChange={(e) => setVarianceExplanation(e.target.value)}
                          placeholder="Explain the reason for the variance..."
                          rows={3}
                        />
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleVerifyReconciliation('approved')}
                      disabled={processing}
                    >
                      {processing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Approve
                        </>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleVerifyReconciliation('disputed')}
                      disabled={processing}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Dispute
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedRecon(null);
                        setVerificationNotes('');
                        setVarianceExplanation('');
                      }}
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

export default DailyReconciliationNew;

