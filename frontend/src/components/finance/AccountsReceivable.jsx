import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  Users, 
  DollarSign, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Phone,
  ArrowLeft,
  Search,
  TrendingUp,
  Calendar,
  Building2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/use-toast';

const AccountsReceivable = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, overdue, current
  
  const [receivablesData, setReceivablesData] = useState({
    summary: {
      totalOutstanding: 0,
      totalCustomers: 0,
      overdueAmount: 0,
      overdueCustomers: 0
    },
    customers: []
  });

  useEffect(() => {
    loadReceivablesData();
  }, []);

  const loadReceivablesData = async () => {
    setLoading(true);
    
    try {
      // In production:
      // const response = await fetch(`${BACKEND_URL}/api/finance/receivables`);
      // const data = await response.json();
      
      // Mock data for demo
      const mockData = {
        summary: {
          totalOutstanding: 3240000,
          totalCustomers: 12,
          overdueAmount: 1530000,
          overdueCustomers: 4
        },
        customers: [
          {
            id: 'CUST-001',
            name: 'Habesha Bakery',
            phone: '+251-911-234567',
            branch: 'Berhane',
            totalOwed: 850000,
            transactions: [
              { id: 'TXN-000115', date: '2025-01-05', amount: 350000, daysOverdue: 15, status: 'overdue' },
              { id: 'TXN-000120', date: '2025-01-10', amount: 500000, daysOverdue: 10, status: 'overdue' }
            ],
            lastPayment: '2024-12-28',
            creditLimit: 1000000,
            paymentHistory: 'good'
          },
          {
            id: 'CUST-002',
            name: 'Mekelle Distribution Center',
            phone: '+251-914-567890',
            branch: 'Girmay',
            totalOwed: 1200000,
            transactions: [
              { id: 'TXN-000118', date: '2025-01-08', amount: 600000, daysOverdue: 12, status: 'overdue' },
              { id: 'TXN-000125', date: '2025-01-12', amount: 600000, daysOverdue: 8, status: 'overdue' }
            ],
            lastPayment: '2025-01-02',
            creditLimit: 2000000,
            paymentHistory: 'fair'
          },
          {
            id: 'CUST-003',
            name: 'Tigray Wholesale Ltd',
            phone: '+251-912-345678',
            branch: 'Berhane',
            totalOwed: 680000,
            transactions: [
              { id: 'TXN-000110', date: '2024-12-28', amount: 680000, daysOverdue: 23, status: 'overdue' }
            ],
            lastPayment: '2024-12-15',
            creditLimit: 1500000,
            paymentHistory: 'poor'
          },
          {
            id: 'CUST-004',
            name: 'Adigrat Retailers',
            phone: '+251-913-456789',
            branch: 'Girmay',
            totalOwed: 510000,
            transactions: [
              { id: 'TXN-000132', date: '2025-01-14', amount: 510000, daysOverdue: 6, status: 'current' }
            ],
            lastPayment: '2025-01-08',
            creditLimit: 800000,
            paymentHistory: 'excellent'
          },
          {
            id: 'CUST-005',
            name: 'Axum Bakery Chain',
            phone: '+251-915-678901',
            branch: 'Both',
            totalOwed: 0,
            transactions: [],
            lastPayment: '2025-01-15',
            creditLimit: 3000000,
            paymentHistory: 'excellent'
          },
          {
            id: 'CUST-006',
            name: 'Shire Food Suppliers',
            phone: '+251-916-789012',
            branch: 'Berhane',
            totalOwed: 0,
            transactions: [],
            lastPayment: '2025-01-14',
            creditLimit: 1200000,
            paymentHistory: 'good'
          },
          {
            id: 'CUST-007',
            name: 'Samre Trading PLC',
            phone: '+251-917-890123',
            branch: 'Girmay',
            totalOwed: 0,
            transactions: [],
            lastPayment: '2025-01-13',
            creditLimit: 900000,
            paymentHistory: 'good'
          },
          {
            id: 'CUST-008',
            name: 'Wukro Distributors',
            phone: '+251-918-901234',
            branch: 'Berhane',
            totalOwed: 0,
            transactions: [],
            lastPayment: '2025-01-12',
            creditLimit: 600000,
            paymentHistory: 'fair'
          }
        ]
      };
      
      setReceivablesData(mockData);
    } catch (error) {
      console.error('Error loading receivables:', error);
      toast({
        title: 'Error',
        description: 'Failed to load accounts receivable data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = (customerId) => {
    toast({
      title: 'Payment Recording',
      description: 'Payment recording feature coming soon',
      variant: 'default'
    });
  };

  const handleSendReminder = (customerId) => {
    toast({
      title: 'Reminder Sent',
      description: 'Payment reminder sent successfully',
      variant: 'success'
    });
  };

  const formatCurrency = (amount) => {
    return `Br ${amount.toLocaleString()}`;
  };

  const getPaymentHistoryBadge = (history) => {
    const configs = {
      'excellent': { variant: 'success', text: 'Excellent' },
      'good': { variant: 'default', text: 'Good' },
      'fair': { variant: 'warning', text: 'Fair' },
      'poor': { variant: 'destructive', text: 'Poor' }
    };
    const config = configs[history] || configs.good;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getOverdueStatus = (daysOverdue) => {
    if (daysOverdue > 30) return { color: 'red', text: 'Critical' };
    if (daysOverdue > 15) return { color: 'amber', text: 'Warning' };
    if (daysOverdue > 0) return { color: 'yellow', text: 'Overdue' };
    return { color: 'green', text: 'Current' };
  };

  const filteredCustomers = receivablesData.customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'overdue') return matchesSearch && customer.totalOwed > 0;
    if (filter === 'current') return matchesSearch && customer.totalOwed === 0;
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-pulse" />
          <p className="text-slate-600">Loading accounts receivable...</p>
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
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Accounts Receivable</h1>
                <p className="text-slate-600">Manage customer credit & loan tracking</p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-blue-700">
                  Total Outstanding
                </CardTitle>
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">
                {formatCurrency(receivablesData.summary.totalOutstanding)}
              </div>
              <div className="text-sm text-blue-600 mt-1">
                {receivablesData.summary.totalCustomers} customers
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-red-700">
                  Overdue Amount
                </CardTitle>
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-900">
                {formatCurrency(receivablesData.summary.overdueAmount)}
              </div>
              <div className="text-sm text-red-600 mt-1">
                {receivablesData.summary.overdueCustomers} customers
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-green-700">
                  Collection Rate
                </CardTitle>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">
                87%
              </div>
              <div className="text-sm text-green-600 mt-1">
                Last 30 days
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-amber-700">
                  Avg. Days Outstanding
                </CardTitle>
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-900">
                14
              </div>
              <div className="text-sm text-amber-600 mt-1">
                Days average
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by customer name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilter('all')}
                >
                  All Customers
                </Button>
                <Button
                  variant={filter === 'overdue' ? 'default' : 'outline'}
                  onClick={() => setFilter('overdue')}
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Overdue
                </Button>
                <Button
                  variant={filter === 'current' ? 'default' : 'outline'}
                  onClick={() => setFilter('current')}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Current
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className={`border ${
              customer.totalOwed > 0 ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-slate-900">{customer.name}</h3>
                      <Badge variant="outline">{customer.id}</Badge>
                      {getPaymentHistoryBadge(customer.paymentHistory)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {customer.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {customer.branch} Branch
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Last payment: {customer.lastPayment}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-600 mb-1">Outstanding Balance</div>
                    <div className={`text-3xl font-bold ${
                      customer.totalOwed > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {formatCurrency(customer.totalOwed)}
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      Credit Limit: {formatCurrency(customer.creditLimit)}
                    </div>
                  </div>
                </div>

                {/* Outstanding Transactions */}
                {customer.transactions.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-slate-900 mb-2 text-sm">Outstanding Transactions</h4>
                    <div className="space-y-2">
                      {customer.transactions.map((txn) => {
                        const status = getOverdueStatus(txn.daysOverdue);
                        return (
                          <div key={txn.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-xs">{txn.id}</Badge>
                              <span className="text-sm text-slate-600">{txn.date}</span>
                              <Badge 
                                variant={status.color === 'red' ? 'destructive' : status.color === 'amber' ? 'warning' : 'default'}
                                className="text-xs"
                              >
                                {txn.daysOverdue} days {status.text.toLowerCase()}
                              </Badge>
                            </div>
                            <div className="text-lg font-semibold text-red-600">
                              {formatCurrency(txn.amount)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-slate-200">
                  {customer.totalOwed > 0 ? (
                    <>
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleRecordPayment(customer.id)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Record Payment
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleSendReminder(customer.id)}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Send Reminder
                      </Button>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center gap-2 text-green-600 py-2">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-medium">No outstanding balance</span>
                    </div>
                  )}
                  <Button variant="ghost">
                    View History
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCustomers.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-600">No customers found</p>
              <p className="text-sm text-slate-400">Try adjusting your search or filter</p>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
};

export default AccountsReceivable;

