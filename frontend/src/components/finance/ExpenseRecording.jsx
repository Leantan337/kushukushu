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
  CreditCard, 
  ArrowLeft,
  CheckCircle2,
  Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/use-toast';

const ExpenseRecording = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    payment_method: '',
    payee_name: '',
    payee_contact: '',
    payee_account: '',
    payment_date: new Date().toISOString().split('T')[0],
    reference_number: '',
    bank_account: '',
    branch_id: '',
    account_allocation: '',
    description: ''
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  const expenseCategories = [
    { value: 'salary', label: 'Salary/Wages' },
    { value: 'utility', label: 'Utilities (Water, Electric, etc.)' },
    { value: 'rent', label: 'Rent/Lease' },
    { value: 'depreciation', label: 'Depreciation' },
    { value: 'tax', label: 'Taxes' },
    { value: 'maintenance', label: 'Maintenance/Repairs' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'other_expense', label: 'Other Expense' }
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
    { value: 'both', label: 'Both Branches' },
    { value: 'head_office', label: 'Head Office' }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category || !formData.amount || !formData.payment_method || !formData.payee_name) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/finance/expenses/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: formData.category,
          amount: parseFloat(formData.amount),
          payment_method: formData.payment_method,
          payee_name: formData.payee_name,
          payee_contact: formData.payee_contact || null,
          payee_account: formData.payee_account || null,
          payment_date: formData.payment_date,
          reference_number: formData.reference_number || null,
          bank_account: formData.bank_account || null,
          branch_id: formData.branch_id || null,
          account_allocation: formData.account_allocation || null,
          description: formData.description,
          supporting_documents: [],
          processed_by: 'Finance Officer'  // Replace with actual user
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: '✅ Expense Recorded Successfully',
          description: `Expense ${data.expense_number} recorded. Amount: ETB ${parseFloat(formData.amount).toLocaleString()}`,
          variant: 'default'
        });

        // Reset form
        setFormData({
          category: '',
          amount: '',
          payment_method: '',
          payee_name: '',
          payee_contact: '',
          payee_account: '',
          payment_date: new Date().toISOString().split('T')[0],
          reference_number: '',
          bank_account: '',
          branch_id: '',
          account_allocation: '',
          description: ''
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.detail || 'Failed to record expense',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error recording expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to record expense. Please try again.',
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
              <div className="bg-red-600 p-3 rounded-2xl">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Record Expense</h1>
                <p className="text-slate-600">Record salaries, utilities, taxes, and other expenses</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-slate-200 shadow-md">
          <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-xl">
            <CardTitle>Expense Transaction Details</CardTitle>
            <CardDescription className="text-red-100">
              Record all non-purchase expenses for accurate financial tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Expense Category and Amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Expense Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((cat) => (
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

              {/* Payee Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payee_name">Payee Name *</Label>
                  <Input
                    id="payee_name"
                    value={formData.payee_name}
                    onChange={(e) => handleChange('payee_name', e.target.value)}
                    placeholder="Individual, vendor, or organization"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="payee_contact">Payee Contact</Label>
                  <Input
                    id="payee_contact"
                    value={formData.payee_contact}
                    onChange={(e) => handleChange('payee_contact', e.target.value)}
                    placeholder="Phone or email"
                  />
                </div>
              </div>

              {/* Payment Method and Date */}
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
                  <Label htmlFor="payment_date">Payment Date *</Label>
                  <Input
                    id="payment_date"
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => handleChange('payment_date', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Bank Account and Reference Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div>
                  <Label htmlFor="reference_number">
                    {formData.payment_method === 'check' ? 'Check Number' : 
                     formData.payment_method === 'bank_transfer' ? 'Transfer Reference' : 
                     'Reference Number'}
                  </Label>
                  <Input
                    id="reference_number"
                    value={formData.reference_number}
                    onChange={(e) => handleChange('reference_number', e.target.value)}
                    placeholder="Reference or tracking number"
                  />
                </div>
              </div>

              {/* Branch and Account Allocation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="branch_id">Branch/Department</Label>
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

                <div>
                  <Label htmlFor="account_allocation">Account Code</Label>
                  <Input
                    id="account_allocation"
                    value={formData.account_allocation}
                    onChange={(e) => handleChange('account_allocation', e.target.value)}
                    placeholder="e.g., 5100-SALARY"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Detailed description of the expense..."
                  rows={4}
                  required
                />
              </div>

              {/* Summary Box */}
              {formData.amount && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-red-600" />
                    <h3 className="font-semibold text-red-900">Expense Summary</h3>
                  </div>
                  <div className="text-sm text-red-800 space-y-1">
                    <p><span className="font-medium">Amount:</span> ETB {parseFloat(formData.amount || 0).toLocaleString()}</p>
                    <p><span className="font-medium">Category:</span> {expenseCategories.find(c => c.value === formData.category)?.label || 'Not selected'}</p>
                    <p><span className="font-medium">Payee:</span> {formData.payee_name || 'Not entered'}</p>
                    <p><span className="font-medium">Method:</span> {paymentMethods.find(m => m.value === formData.payment_method)?.label || 'Not selected'}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
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
                      Record Expense
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

export default ExpenseRecording;

