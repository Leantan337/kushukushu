import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import {
  DollarSign,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Send,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/use-toast';

const EndOfDayReconciliation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [todaysSales, setTodaysSales] = useState({
    total_sales: 0,
    cash_sales: 0,
    mobile_money_sales: 0,
    loan_sales: 0,
    transaction_count: 0
  });
  
  const [formData, setFormData] = useState({
    actual_cash: '',
    submission_notes: ''
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
  const branch_id = 'berhane'; // Replace with actual branch from user context

  useEffect(() => {
    loadTodaysSales();
  }, []);

  const loadTodaysSales = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`${BACKEND_URL}/api/sales-transactions?branch_id=${branch_id}`);
      
      if (response.ok) {
        const transactions = await response.json();
        
        // Filter today's transactions
        const todaysTransactions = transactions.filter(txn => {
          const txnDate = new Date(txn.timestamp).toISOString().split('T')[0];
          return txnDate === today;
        });

        // Calculate totals
        let total = 0, cash = 0, mobile = 0, loan = 0;
        
        todaysTransactions.forEach(txn => {
          const amount = txn.total_amount || 0;
          total += amount;
          
          if (txn.payment_type === 'cash') {
            cash += amount;
          } else if (txn.payment_type === 'transfer') {
            mobile += amount;
          } else if (txn.payment_type === 'loan') {
            loan += amount;
          }
        });

        setTodaysSales({
          total_sales: total,
          cash_sales: cash,
          mobile_money_sales: mobile,
          loan_sales: loan,
          transaction_count: todaysTransactions.length
        });
      }
    } catch (error) {
      console.error('Error loading today\'s sales:', error);
      toast({
        title: 'Error',
        description: 'Failed to load today\'s sales data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.actual_cash || parseFloat(formData.actual_cash) < 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid cash amount',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/finance/reconciliation/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reconciliation_date: new Date().toISOString(),
          branch_id: branch_id,
          actual_cash: parseFloat(formData.actual_cash),
          submitted_by: 'Sales Person', // Replace with actual user
          submission_notes: formData.submission_notes || null
        })
      });

      if (response.ok) {
        const data = await response.json();
        const variance = data.variance || 0;
        
        toast({
          title: '✅ Reconciliation Submitted',
          description: `Reconciliation ${data.reconciliation_number} submitted successfully. ${
            Math.abs(variance) < 1 ? 'Perfect match!' : 
            `Variance: ETB ${Math.abs(variance).toLocaleString()} ${variance < 0 ? 'shortage' : 'overage'}`
          }`,
          variant: 'default'
        });

        // Reset form
        setFormData({
          actual_cash: '',
          submission_notes: ''
        });

        // Navigate back
        setTimeout(() => {
          navigate('/sales/dashboard');
        }, 2000);
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.detail || 'Failed to submit reconciliation',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error submitting reconciliation:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit reconciliation. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const expectedCash = todaysSales.cash_sales + todaysSales.mobile_money_sales;
  const variance = formData.actual_cash ? (parseFloat(formData.actual_cash) - expectedCash) : 0;

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return 'ETB 0';
    }
    return `ETB ${Number(amount).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <DollarSign className="w-12 h-12 mx-auto mb-4 text-green-600 animate-pulse" />
          <p className="text-slate-600">Loading today's sales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/sales/dashboard')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-4">
              <div className="bg-green-600 p-3 rounded-2xl">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">End of Day Reconciliation</h1>
                <p className="text-slate-600">Submit your daily cash count</p>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Sales Summary */}
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader>
            <CardTitle className="text-blue-900">Today's Sales Summary</CardTitle>
            <CardDescription>Overview of all transactions for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-slate-600 mb-1">Total Sales</p>
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(todaysSales.total_sales)}</p>
                <p className="text-xs text-slate-500 mt-1">{todaysSales.transaction_count} transactions</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <p className="text-sm text-slate-600 mb-1">Cash Sales</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(todaysSales.cash_sales)}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-purple-200">
                <p className="text-sm text-slate-600 mb-1">Mobile Money</p>
                <p className="text-2xl font-bold text-purple-900">{formatCurrency(todaysSales.mobile_money_sales)}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-amber-200">
                <p className="text-sm text-slate-600 mb-1">Loan Sales</p>
                <p className="text-2xl font-bold text-amber-900">{formatCurrency(todaysSales.loan_sales)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expected Cash */}
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 mb-1">Expected Cash to Reconcile</p>
                <p className="text-xs text-green-600">(Cash Sales + Mobile Money)</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-green-900">{formatCurrency(expectedCash)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reconciliation Form */}
        <Card className="border-slate-200 shadow-md">
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-xl">
            <CardTitle>Cash Count & Submission</CardTitle>
            <CardDescription className="text-green-100">
              Count your cash drawer and submit for finance verification
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div>
                <Label htmlFor="actual_cash">Actual Cash Counted (ETB) *</Label>
                <Input
                  id="actual_cash"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.actual_cash}
                  onChange={(e) => setFormData({ ...formData, actual_cash: e.target.value })}
                  placeholder="Enter the total cash you counted"
                  className="text-2xl font-bold"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  Count all cash and mobile money received today
                </p>
              </div>

              {/* Variance Display */}
              {formData.actual_cash && (
                <div className={`p-4 rounded-lg border ${
                  Math.abs(variance) < 1 ? 'bg-green-50 border-green-200' :
                  Math.abs(variance) < 100 ? 'bg-amber-50 border-amber-200' :
                  'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-900">Variance Check</h3>
                    {Math.abs(variance) < 1 ? (
                      <Badge variant="success" className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Perfect!
                      </Badge>
                    ) : (
                      <Badge variant={Math.abs(variance) < 100 ? 'warning' : 'destructive'} className="flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {Math.abs(variance) < 100 ? 'Minor' : 'Significant'}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-700">Expected Cash:</span>
                      <span className="font-semibold">{formatCurrency(expectedCash)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">Actual Cash:</span>
                      <span className="font-semibold">{formatCurrency(parseFloat(formData.actual_cash))}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-300">
                      <span className="font-bold">Variance:</span>
                      <span className={`text-xl font-bold flex items-center gap-1 ${
                        variance < 0 ? 'text-red-600' :
                        variance > 0 ? 'text-green-600' :
                        'text-slate-600'
                      }`}>
                        {variance < 0 ? (
                          <>
                            <TrendingDown className="w-5 h-5" />
                            -{formatCurrency(Math.abs(variance))} (shortage)
                          </>
                        ) : variance > 0 ? (
                          <>
                            <TrendingUp className="w-5 h-5" />
                            +{formatCurrency(variance)} (overage)
                          </>
                        ) : (
                          '0.00 (perfect match)'
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="submission_notes">Notes (Optional)</Label>
                <Textarea
                  id="submission_notes"
                  value={formData.submission_notes}
                  onChange={(e) => setFormData({ ...formData, submission_notes: e.target.value })}
                  placeholder="Add any notes about today's sales or explain any variance..."
                  rows={4}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white text-lg py-6"
                  disabled={submitting || !formData.actual_cash}
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Submit Reconciliation
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/sales/dashboard')}
                  className="py-6"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default EndOfDayReconciliation;

