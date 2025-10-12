import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { 
  CreditCard, 
  DollarSign, 
  Users, 
  AlertCircle, 
  CheckCircle,
  Clock,
  TrendingUp,
  Search
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";

const LoanManagement = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [loans, setLoans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalLoans: 0,
    activeLoans: 0,
    overdueLoans: 0,
    totalOutstanding: 0,
    totalCollected: 0
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchLoans();
    fetchCustomers();
    const interval = setInterval(fetchLoans, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/loans`);
      if (response.ok) {
        const data = await response.json();
        setLoans(data);
        
        // Calculate stats
        const active = data.filter(l => l.status === "active").length;
        const overdue = data.filter(l => l.status === "overdue").length;
        const totalOut = data.reduce((sum, l) => sum + (l.balance || 0), 0);
        const totalColl = data.reduce((sum, l) => sum + (l.paid_amount || 0), 0);
        
        setStats({
          totalLoans: data.length,
          activeLoans: active,
          overdueLoans: overdue,
          totalOutstanding: totalOut,
          totalCollected: totalColl
        });
      }
    } catch (error) {
      console.error("Error fetching loans:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/customers`);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const handleRecordPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid payment amount",
        variant: "destructive"
      });
      return;
    }

    if (parseFloat(paymentAmount) > selectedLoan.balance) {
      toast({
        title: "Error",
        description: "Payment amount cannot exceed loan balance",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/loans/${selectedLoan.id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(paymentAmount),
          payment_method: paymentMethod,
          received_by: "Sales User", // Replace with actual user
          notes: paymentNotes || undefined
        })
      });

      if (response.ok) {
        toast({
          title: "Payment Recorded",
          description: `Payment of ETB ${parseFloat(paymentAmount).toLocaleString()} recorded successfully`,
        });
        setSelectedLoan(null);
        setPaymentAmount("");
        setPaymentNotes("");
        fetchLoans();
        fetchCustomers();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.detail || "Failed to record payment",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (loan) => {
    if (loan.status === "paid") {
      return <Badge className="bg-green-500">Paid</Badge>;
    } else if (loan.status === "overdue") {
      return <Badge className="bg-red-500">{loan.days_overdue} days overdue</Badge>;
    } else {
      return <Badge className="bg-blue-500">Active</Badge>;
    }
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : "Unknown";
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-slate-200 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Total Loans</CardTitle>
              <CreditCard className="w-5 h-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalLoans}</div>
            <p className="text-xs text-slate-500 mt-1">{stats.activeLoans} active</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Outstanding</CardTitle>
              <DollarSign className="w-5 h-5 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              ETB {stats.totalOutstanding.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">To be collected</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Collected</CardTitle>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              ETB {stats.totalCollected.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">Total recovered</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Overdue</CardTitle>
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.overdueLoans}</div>
            <p className="text-xs text-slate-500 mt-1">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Card className="border-slate-200 shadow-md">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="overview">All Loans</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
              <TabsTrigger value="customers">Customers</TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent>
            {/* All Loans Tab */}
            <TabsContent value="overview" className="space-y-4">
              {loans.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-slate-600">No loans found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {loans.map((loan) => (
                    <div
                      key={loan.id}
                      className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-slate-900">{loan.loan_number}</h3>
                            {getStatusBadge(loan)}
                          </div>
                          <p className="text-sm text-slate-600">
                            Customer: <span className="font-medium">{getCustomerName(loan.customer_id)}</span>
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Transaction: {loan.transaction_number} • 
                            Issued: {new Date(loan.issue_date).toLocaleDateString()}
                          </p>
                        </div>
                        {loan.status !== "paid" && (
                          <Button
                            onClick={() => {
                              setSelectedLoan(loan);
                              setActiveTab("overview");
                            }}
                            size="sm"
                            className="bg-green-500 hover:bg-green-600"
                          >
                            Record Payment
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-4 p-3 bg-slate-50 rounded">
                        <div>
                          <p className="text-xs text-slate-500">Principal</p>
                          <p className="font-semibold text-slate-900">
                            ETB {loan.initial_amount?.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Paid</p>
                          <p className="font-semibold text-green-600">
                            ETB {loan.paid_amount?.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Balance</p>
                          <p className="font-semibold text-orange-600">
                            ETB {loan.balance?.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {loan.payments && loan.payments.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-slate-600 font-medium mb-2">
                            Payment History ({loan.payments.length} payments)
                          </p>
                          <div className="space-y-1">
                            {loan.payments.slice(-3).map((payment, idx) => (
                              <div key={idx} className="text-xs text-slate-600 flex justify-between">
                                <span>{new Date(payment.payment_date).toLocaleDateString()}</span>
                                <span className="font-medium text-green-600">
                                  ETB {payment.amount?.toLocaleString()} ({payment.payment_method})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedLoan?.id === loan.id && (
                        <div className="mt-4 pt-4 border-t space-y-4">
                          <h4 className="font-semibold text-slate-900">Record Payment</h4>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="payment_amount">Payment Amount (ETB) *</Label>
                              <Input
                                id="payment_amount"
                                type="number"
                                min="0"
                                max={loan.balance}
                                step="0.01"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                placeholder="0.00"
                                className="mt-2"
                              />
                              <p className="text-xs text-slate-500 mt-1">
                                Max: ETB {loan.balance?.toLocaleString()}
                              </p>
                            </div>

                            <div>
                              <Label htmlFor="payment_method">Payment Method *</Label>
                              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                <SelectTrigger className="mt-2">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="cash">Cash</SelectItem>
                                  <SelectItem value="check">Check</SelectItem>
                                  <SelectItem value="transfer">Bank Transfer</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="payment_notes">Notes (Optional)</Label>
                            <Textarea
                              id="payment_notes"
                              value={paymentNotes}
                              onChange={(e) => setPaymentNotes(e.target.value)}
                              placeholder="Any notes about this payment..."
                              rows={2}
                              className="mt-2"
                            />
                          </div>

                          {paymentAmount && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded">
                              <p className="text-sm text-green-900">
                                <span className="font-semibold">New Balance:</span> ETB{" "}
                                {(loan.balance - parseFloat(paymentAmount || 0)).toLocaleString()}
                              </p>
                              {loan.balance - parseFloat(paymentAmount || 0) <= 0 && (
                                <p className="text-xs text-green-700 mt-1">
                                  ✓ This will mark the loan as PAID IN FULL
                                </p>
                              )}
                            </div>
                          )}

                          <div className="flex gap-3">
                            <Button
                              onClick={() => {
                                setSelectedLoan(null);
                                setPaymentAmount("");
                                setPaymentNotes("");
                              }}
                              variant="outline"
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleRecordPayment}
                              className="flex-1 bg-green-500 hover:bg-green-600"
                              disabled={loading}
                            >
                              <DollarSign className="w-4 h-4 mr-2" />
                              {loading ? "Processing..." : "Record Payment"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Overdue Loans Tab */}
            <TabsContent value="overdue" className="space-y-4">
              {loans.filter(l => l.status === "overdue").length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-slate-600">No overdue loans!</p>
                  <p className="text-xs text-slate-500 mt-2">All customers are current</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {loans
                    .filter(l => l.status === "overdue")
                    .sort((a, b) => b.days_overdue - a.days_overdue)
                    .map((loan) => (
                      <div
                        key={loan.id}
                        className="border border-red-200 bg-red-50 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-slate-900">{loan.loan_number}</h3>
                              <Badge className="bg-red-500">
                                {loan.days_overdue} days overdue
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-700">
                              Customer: <span className="font-medium">{getCustomerName(loan.customer_id)}</span>
                            </p>
                            <p className="text-xs text-red-600 mt-1">
                              Due: {new Date(loan.due_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-red-600 text-lg">
                              ETB {loan.balance?.toLocaleString()}
                            </p>
                            <p className="text-xs text-slate-600">Outstanding</p>
                          </div>
                        </div>

                        <Button
                          onClick={() => {
                            setSelectedLoan(loan);
                            setActiveTab("overdue");
                          }}
                          size="sm"
                          className="w-full bg-red-500 hover:bg-red-600 mt-2"
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Collect Payment Now
                        </Button>

                        {selectedLoan?.id === loan.id && (
                          <div className="mt-4 pt-4 border-t border-red-200 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Payment Amount (ETB) *</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max={loan.balance}
                                  value={paymentAmount}
                                  onChange={(e) => setPaymentAmount(e.target.value)}
                                  placeholder="0.00"
                                  className="mt-2"
                                />
                              </div>
                              <div>
                                <Label>Payment Method *</Label>
                                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                  <SelectTrigger className="mt-2">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="check">Check</SelectItem>
                                    <SelectItem value="transfer">Transfer</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <Button
                              onClick={handleRecordPayment}
                              className="w-full bg-green-500 hover:bg-green-600"
                              disabled={loading}
                            >
                              Record Payment
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </TabsContent>

            {/* Customers Tab */}
            <TabsContent value="customers" className="space-y-4">
              {customers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No customers yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {customers.map((customer) => {
                    const customerLoans = loans.filter(l => l.customer_id === customer.id);
                    const activeCustomerLoans = customerLoans.filter(l => l.status !== "paid");

                    return (
                      <div
                        key={customer.id}
                        className="border border-slate-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-900">{customer.name}</h3>
                            <p className="text-sm text-slate-600">{customer.phone}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              Customer #{customer.customer_number}
                            </p>
                          </div>
                          <Badge variant="outline" className={
                            customer.payment_history_rating === "excellent" || customer.payment_history_rating === "good" 
                              ? "border-green-300 text-green-700"
                              : "border-orange-300 text-orange-700"
                          }>
                            {customer.payment_history_rating?.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4 p-3 bg-slate-50 rounded">
                          <div>
                            <p className="text-xs text-slate-500">Credit Limit</p>
                            <p className="font-semibold text-slate-900">
                              ETB {customer.credit_limit?.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Outstanding</p>
                            <p className="font-semibold text-orange-600">
                              ETB {customer.outstanding_balance?.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Available</p>
                            <p className="font-semibold text-green-600">
                              ETB {customer.credit_available?.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {activeCustomerLoans.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-slate-600 font-medium mb-2">
                              Active Loans: {activeCustomerLoans.length}
                            </p>
                            {activeCustomerLoans.map((loan) => (
                              <div key={loan.id} className="text-xs text-slate-600 flex justify-between py-1">
                                <span>{loan.loan_number}</span>
                                <span className="font-medium text-orange-600">
                                  ETB {loan.balance?.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default LoanManagement;

