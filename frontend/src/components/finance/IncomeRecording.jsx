import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
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
  DollarSign, 
  ArrowLeft,
  CheckCircle2,
  Send,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/use-toast';

const IncomeRecording = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    payment_method: '',
    party_name: '',
    party_contact: '',
    branch_id: '',
    account_type: '',
    bank_account: '',
    description: '',
    reference_number: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  const incomeCategories = [
    { value: 'bank_interest', label: 'Bank Interest' },
    { value: 'refund', label: 'Refund' },
    { value: 'asset_sale', label: 'Asset Sale' },
    { value: 'investment_income', label: 'Investment Income' },
    { value: 'other_income', label: 'Other Income' }
  ];

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'check', label: 'Check' },
    { value: 'mobile_money', label: 'Mobile Money' }
  ];

  const branches = [
    { value: 'berhane', label: 'Berhane Branch' },
    { value: 'girmay', label: 'Girmay Branch' },
    { value: 'both', label: 'Both Branches' }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category || !formData.amount || !formData.payment_method) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/finance/income/cash-receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'income',
          category: formData.category,
          amount: parseFloat(formData.amount),
          payment_method: formData.payment_method,
          party_name: formData.party_name || null,
          party_contact: formData.party_contact || null,
          branch_id: formData.branch_id || null,
          account_type: formData.account_type || null,
          bank_account: formData.bank_account || null,
          description: formData.description,
          reference_number: formData.reference_number || null,
          supporting_documents: [],
          processed_by: 'Finance Officer',  // Replace with actual user
          transaction_date: formData.transaction_date
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: '✅ Income Recorded Successfully',
          description: `Transaction ${data.transaction_number} recorded. Amount: ETB ${parseFloat(formData.amount).toLocaleString()}`,
          variant: 'default'
        });

        // Reset form
        setFormData({
          category: '',
          amount: '',
          payment_method: '',
          party_name: '',
          party_contact: '',
          branch_id: '',
          account_type: '',
          bank_account: '',
          description: '',
          reference_number: '',
          transaction_date: new Date().toISOString().split('T')[0]
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.detail || 'Failed to record income',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error recording income:', error);
      toast({
        title: 'Error',
        description: 'Failed to record income. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
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
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Record Income</h1>
                <p className="text-slate-600">Record non-sales cash receipts and income</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-slate-200 shadow-md">
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-xl">
            <CardTitle>Income Transaction Details</CardTitle>
            <CardDescription className="text-green-100">
              Record bank interest, refunds, asset sales, and other income
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Income Category and Amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Income Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {incomeCategories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="amount">Amount (ETB) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => handleChange('amount', e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Payment Method and Transaction Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payment_method">Payment Method *</Label>
                  <Select
                    value={formData.payment_method}
                    onValueChange={(value) => handleChange('payment_method', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="transaction_date">Transaction Date *</Label>
                  <Input
                    id="transaction_date"
                    type="date"
                    value={formData.transaction_date}
                    onChange={(e) => handleChange('transaction_date', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Party Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="party_name">Payer/Source Name</Label>
                  <Input
                    id="party_name"
                    value={formData.party_name}
                    onChange={(e) => handleChange('party_name', e.target.value)}
                    placeholder="Individual or organization"
                  />
                </div>

                <div>
                  <Label htmlFor="party_contact">Contact Information</Label>
                  <Input
                    id="party_contact"
                    value={formData.party_contact}
                    onChange={(e) => handleChange('party_contact', e.target.value)}
                    placeholder="Phone or email"
                  />
                </div>
              </div>

              {/* Branch and Bank Account */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="branch_id">Branch</Label>
                  <Select
                    value={formData.branch_id}
                    onValueChange={(value) => handleChange('branch_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.value} value={branch.value}>
                          {branch.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.payment_method === 'bank_transfer' && (
                  <div>
                    <Label htmlFor="bank_account">Bank Account</Label>
                    <Select
                      value={formData.bank_account}
                      onValueChange={(value) => handleChange('bank_account', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="commercial_bank_001">Commercial Bank - 001</SelectItem>
                        <SelectItem value="commercial_bank_002">Commercial Bank - 002</SelectItem>
                        <SelectItem value="abyssinia_bank">Abyssinia Bank</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.payment_method === 'check' && (
                  <div>
                    <Label htmlFor="reference_number">Check Number</Label>
                    <Input
                      id="reference_number"
                      value={formData.reference_number}
                      onChange={(e) => handleChange('reference_number', e.target.value)}
                      placeholder="Check number"
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Detailed description of the income received..."
                  rows={4}
                  required
                />
              </div>

              {/* Summary Box */}
              {formData.amount && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-green-900">Transaction Summary</h3>
                  </div>
                  <div className="text-sm text-green-800 space-y-1">
                    <p><span className="font-medium">Amount:</span> ETB {parseFloat(formData.amount || 0).toLocaleString()}</p>
                    <p><span className="font-medium">Category:</span> {incomeCategories.find(c => c.value === formData.category)?.label || 'Not selected'}</p>
                    <p><span className="font-medium">Method:</span> {paymentMethods.find(m => m.value === formData.payment_method)?.label || 'Not selected'}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Recording...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Record Income
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/finance/dashboard')}
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

export default IncomeRecording;

