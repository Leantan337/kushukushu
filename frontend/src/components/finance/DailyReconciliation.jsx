import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  CheckCircle2, 
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Building2,
  Calendar,
  ArrowLeft,
  XCircle,
  Equal,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/use-toast';

const DailyReconciliation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [reconciling, setReconciling] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('berhane');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [reconciliationData, setReconciliationData] = useState({
    berhane: {
      reportedSales: 0,
      cashCollected: 0,
      creditSales: 0,
      transactions: [],
      reconciled: false
    },
    girmay: {
      reportedSales: 0,
      cashCollected: 0,
      creditSales: 0,
      transactions: [],
      reconciled: false
    }
  });

  const [actualCash, setActualCash] = useState({
    berhane: '',
    girmay: ''
  });

  const [reconciliationNotes, setReconciliationNotes] = useState({
    berhane: '',
    girmay: ''
  });

  useEffect(() => {
    loadReconciliationData();
  }, [selectedDate]);

  const loadReconciliationData = async () => {
    setLoading(true);
    
    try {
      // In production:
      // const response = await fetch(`${BACKEND_URL}/api/reports/sales?period=daily&date=${selectedDate}`);
      // const data = await response.json();
      
      // Mock data for demo
      const mockData = {
        berhane: {
          reportedSales: 1240000,
          cashCollected: 890000,
          creditSales: 350000,
          transactions: [
            { id: 'TXN-000125', time: '08:30', amount: 125000, type: 'cash', sales_person: 'Berhe Kidane' },
            { id: 'TXN-000126', time: '09:15', amount: 85000, type: 'cash', sales_person: 'Marta Hailu' },
            { id: 'TXN-000127', time: '10:45', amount: 200000, type: 'loan', sales_person: 'Berhe Kidane', customer: 'Habesha Bakery' },
            { id: 'TXN-000128', time: '11:20', amount: 95000, type: 'cash', sales_person: 'Marta Hailu' },
            { id: 'TXN-000129', time: '13:00', amount: 150000, type: 'loan', sales_person: 'Berhe Kidane', customer: 'Tigray Wholesale' },
            { id: 'TXN-000130', time: '14:30', amount: 180000, type: 'cash', sales_person: 'Marta Hailu' },
            { id: 'TXN-000131', time: '15:45', amount: 155000, type: 'cash', sales_person: 'Berhe Kidane' },
            { id: 'TXN-000132', time: '16:20', amount: 250000, type: 'cash', sales_person: 'Marta Hailu' }
          ],
          reconciled: false
        },
        girmay: {
          reportedSales: 1110000,
          cashCollected: 920000,
          creditSales: 190000,
          transactions: [
            { id: 'TXN-000133', time: '08:15', amount: 135000, type: 'cash', sales_person: 'Hiwet Alem' },
            { id: 'TXN-000134', time: '09:30', amount: 95000, type: 'cash', sales_person: 'Gebre Yohannes' },
            { id: 'TXN-000135', time: '10:00', amount: 190000, type: 'loan', sales_person: 'Hiwet Alem', customer: 'Adigrat Retailers' },
            { id: 'TXN-000136', time: '11:45', amount: 175000, type: 'cash', sales_person: 'Gebre Yohannes' },
            { id: 'TXN-000137', time: '13:15', amount: 145000, type: 'cash', sales_person: 'Hiwet Alem' },
            { id: 'TXN-000138', time: '14:45', amount: 125000, type: 'cash', sales_person: 'Gebre Yohannes' },
            { id: 'TXN-000139', time: '15:30', amount: 120000, type: 'cash', sales_person: 'Hiwet Alem' },
            { id: 'TXN-000140', time: '16:50', amount: 125000, type: 'cash', sales_person: 'Gebre Yohannes' }
          ],
          reconciled: false
        }
      };
      
      setReconciliationData(mockData);
    } catch (error) {
      console.error('Error loading reconciliation data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load sales data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReconcile = async (branch) => {
    const actual = parseFloat(actualCash[branch]);
    const expected = reconciliationData[branch].cashCollected;
    
    if (!actual || isNaN(actual)) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter actual cash collected',
        variant: 'destructive'
      });
      return;
    }

    const variance = actual - expected;
    const variancePercent = ((variance / expected) * 100).toFixed(2);

    if (Math.abs(variance) > 1000) {
      toast({
        title: 'Large Variance Detected',
        description: `Variance of Br ${Math.abs(variance).toLocaleString()} (${Math.abs(variancePercent)}%) requires explanation`,
        variant: 'warning'
      });
    }

    setReconciling(true);

    try {
      // In production:
      // await fetch(`${BACKEND_URL}/api/finance/reconciliation`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     branch,
      //     date: selectedDate,
      //     reported_sales: reconciliationData[branch].reportedSales,
      //     cash_collected: actual,
      //     variance,
      //     notes: reconciliationNotes[branch]
      //   })
      // });

      await new Promise(resolve => setTimeout(resolve, 1000));

      setReconciliationData({
        ...reconciliationData,
        [branch]: {
          ...reconciliationData[branch],
          reconciled: true,
          actualCash: actual,
          variance
        }
      });

      toast({
        title: 'Reconciliation Complete',
        description: `${branch.charAt(0).toUpperCase() + branch.slice(1)} branch reconciled successfully`,
        variant: 'success'
      });

    } catch (error) {
      console.error('Error reconciling:', error);
      toast({
        title: 'Reconciliation Failed',
        description: 'Failed to save reconciliation data',
        variant: 'destructive'
      });
    } finally {
      setReconciling(false);
    }
  };

  const formatCurrency = (amount) => {
    return `Br ${amount.toLocaleString()}`;
  };

  const calculateVariance = (branch) => {
    const actual = parseFloat(actualCash[branch]) || 0;
    const expected = reconciliationData[branch].cashCollected;
    return actual - expected;
  };

  const BranchReconciliationCard = ({ branch, branchName }) => {
    const data = reconciliationData[branch];
    const variance = calculateVariance(branch);
    const isMatch = Math.abs(variance) < 10; // Within 10 Birr tolerance

    return (
      <Card className="border-slate-200 shadow-md">
        <CardHeader className={`rounded-t-xl text-white ${
          branch === 'berhane' ? 'bg-gradient-to-r from-blue-600 to-blue-700' : 'bg-gradient-to-r from-purple-600 to-purple-700'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6" />
              <div>
                <CardTitle>{branchName} Branch</CardTitle>
                <CardDescription className="text-white/80">
                  {selectedDate}
                </CardDescription>
              </div>
            </div>
            {data.reconciled && (
              <Badge variant="success" className="bg-white text-green-600">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Reconciled
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          
          {/* Sales Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-700 mb-1">Total Sales</div>
              <div className="text-2xl font-bold text-blue-900">
                {formatCurrency(data.reportedSales)}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-sm text-green-700 mb-1">Cash Sales</div>
              <div className="text-2xl font-bold text-green-900">
                {formatCurrency(data.cashCollected)}
              </div>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <div className="text-sm text-amber-700 mb-1">Credit Sales</div>
              <div className="text-2xl font-bold text-amber-900">
                {formatCurrency(data.creditSales)}
              </div>
            </div>
          </div>

          {/* Transaction List */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Today's Transactions</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto border border-slate-200 rounded-lg p-3">
              {data.transactions.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded">
                  <div className="flex items-center gap-3">
                    <Badge variant={txn.type === 'cash' ? 'default' : 'warning'} className="text-xs">
                      {txn.type === 'cash' ? 'CASH' : 'LOAN'}
                    </Badge>
                    <span className="text-sm text-slate-600">{txn.id}</span>
                    <span className="text-xs text-slate-400">{txn.time}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-900">
                      {formatCurrency(txn.amount)}
                    </div>
                    <div className="text-xs text-slate-500">{txn.sales_person}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reconciliation Form */}
          {!data.reconciled && (
            <div className="space-y-4 border-t border-slate-200 pt-4">
              <div>
                <Label htmlFor={`actual-${branch}`}>Actual Cash Collected *</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id={`actual-${branch}`}
                    type="number"
                    placeholder="Enter actual cash amount"
                    value={actualCash[branch]}
                    onChange={(e) => setActualCash({...actualCash, [branch]: e.target.value})}
                    className="flex-1"
                  />
                  <div className="flex items-center px-4 bg-slate-100 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">Birr</span>
                  </div>
                </div>
              </div>

              {actualCash[branch] && (
                <div className={`p-4 rounded-lg border ${
                  isMatch ? 'bg-green-50 border-green-200' : 
                  Math.abs(variance) > 50000 ? 'bg-red-50 border-red-200' : 
                  'bg-amber-50 border-amber-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-900">Variance Analysis</span>
                    {isMatch ? (
                      <Equal className="w-5 h-5 text-green-600" />
                    ) : variance > 0 ? (
                      <TrendingUp className="w-5 h-5 text-amber-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-600">Expected Cash:</span>
                      <div className="font-semibold">{formatCurrency(data.cashCollected)}</div>
                    </div>
                    <div>
                      <span className="text-slate-600">Actual Cash:</span>
                      <div className="font-semibold">{formatCurrency(parseFloat(actualCash[branch]))}</div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Variance:</span>
                      <div className={`text-lg font-bold ${
                        isMatch ? 'text-green-600' : 
                        variance > 0 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {variance > 0 ? '+' : ''}{formatCurrency(variance)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor={`notes-${branch}`}>Reconciliation Notes</Label>
                <Textarea
                  id={`notes-${branch}`}
                  placeholder="Add notes about any variances or issues..."
                  rows={3}
                  value={reconciliationNotes[branch]}
                  onChange={(e) => setReconciliationNotes({...reconciliationNotes, [branch]: e.target.value})}
                />
              </div>

              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleReconcile(branch)}
                disabled={reconciling || !actualCash[branch]}
              >
                {reconciling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Reconciling...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Complete Reconciliation
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Reconciled Summary */}
          {data.reconciled && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-900">Reconciliation Complete</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-green-700">Expected:</span>
                  <div className="font-semibold">{formatCurrency(data.cashCollected)}</div>
                </div>
                <div>
                  <span className="text-green-700">Actual:</span>
                  <div className="font-semibold">{formatCurrency(data.actualCash)}</div>
                </div>
                <div className="col-span-2">
                  <span className="text-green-700">Variance:</span>
                  <div className="font-semibold">{formatCurrency(data.variance)}</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <DollarSign className="w-12 h-12 mx-auto mb-4 text-green-600 animate-pulse" />
          <p className="text-slate-600">Loading reconciliation data...</p>
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
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Daily Reconciliation</h1>
                <p className="text-slate-600">Verify sales vs actual cash collected</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-48"
            />
            <Button variant="outline" size="icon" onClick={loadReconciliationData}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">
                Total Sales Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">
                {formatCurrency(reconciliationData.berhane.reportedSales + reconciliationData.girmay.reportedSales)}
              </div>
              <div className="text-sm text-blue-600 mt-1">Both branches combined</div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700">
                Total Cash Collected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">
                {formatCurrency(reconciliationData.berhane.cashCollected + reconciliationData.girmay.cashCollected)}
              </div>
              <div className="text-sm text-green-600 mt-1">Expected amount</div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-700">
                Reconciliation Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-900">
                {(reconciliationData.berhane.reconciled ? 1 : 0) + (reconciliationData.girmay.reconciled ? 1 : 0)}/2
              </div>
              <div className="text-sm text-amber-600 mt-1">Branches reconciled</div>
            </CardContent>
          </Card>
        </div>

        {/* Branch Reconciliation Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BranchReconciliationCard branch="berhane" branchName="Berhane" />
          <BranchReconciliationCard branch="girmay" branchName="Girmay" />
        </div>

      </div>
    </div>
  );
};

export default DailyReconciliation;

