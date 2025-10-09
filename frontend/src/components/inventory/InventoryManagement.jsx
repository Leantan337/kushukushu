import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Search,
  Filter
} from 'lucide-react';

const InventoryManagement = ({ userRole = "store_keeper", userBranch = null }) => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [loading, setLoading] = useState(false);
  const currentUser = userRole === "store_keeper" ? "Berhe Kidane" : 
                      userRole === "manager" ? "Yohannes Teklu" : 
                      "Admin User";

  // Fetch inventory data
  useEffect(() => {
    fetchInventory();
  }, [userBranch]);

  const fetchInventory = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      // Add branch filter if userBranch is provided (for storekeepers)
      const branchParam = userBranch ? `?branch_id=${userBranch}` : '';
      const response = await fetch(`${backendUrl}/api/inventory${branchParam}`);
      if (response.ok) {
        const data = await response.json();
        setInventoryItems(data);
      } else {
        // Use mock data if API fails
        setInventoryItems(getMockInventory());
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setInventoryItems(getMockInventory());
    }
  };

  const getMockInventory = () => [
    {
      id: "1",
      name: "Raw Wheat",
      quantity: 12500,
      unit: "kg",
      stock_level: "ok",
      low_threshold: 5000,
      critical_threshold: 2000,
      transactions: [
        { id: "t1", date: "2025-01-15T10:30:00", type: "in", quantity: 1560, reference: "Purchase Order #245", performed_by: "Berhe Kidane" },
        { id: "t2", date: "2025-01-14T14:20:00", type: "out", quantity: 800, reference: "Milling Order #58", performed_by: "System" }
      ]
    },
    {
      id: "2",
      name: "1st Quality Flour",
      quantity: 3200,
      unit: "kg",
      stock_level: "low",
      low_threshold: 5000,
      critical_threshold: 2000,
      transactions: [
        { id: "t3", date: "2025-01-15T09:15:00", type: "in", quantity: 650, reference: "Milling Order #58", performed_by: "System" },
        { id: "t4", date: "2025-01-14T16:45:00", type: "out", quantity: 500, reference: "Sales Request #101", performed_by: "Mekdes Alem" }
      ]
    },
    {
      id: "3",
      name: "Bread Flour",
      quantity: 4800,
      unit: "kg",
      stock_level: "ok",
      low_threshold: 4000,
      critical_threshold: 1500,
      transactions: [
        { id: "t5", date: "2025-01-15T11:00:00", type: "in", quantity: 480, reference: "Milling Order #59", performed_by: "System" }
      ]
    },
    {
      id: "4",
      name: "Fruska",
      quantity: 1800,
      unit: "kg",
      stock_level: "critical",
      low_threshold: 3000,
      critical_threshold: 2000,
      transactions: [
        { id: "t6", date: "2025-01-15T11:00:00", type: "in", quantity: 280, reference: "Milling Order #58", performed_by: "System" }
      ]
    }
  ];

  const getStockLevelColor = (level) => {
    switch (level) {
      case 'ok':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'low':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStockLevelIcon = (level) => {
    switch (level) {
      case 'ok':
        return <CheckCircle className="w-4 h-4" />;
      case 'low':
        return <AlertCircle className="w-4 h-4" />;
      case 'critical':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const handleAdjustStock = () => {
    if (!selectedItem) return;
    setShowAdjustmentModal(true);
  };

  const submitAdjustment = async () => {
    if (!adjustmentAmount || !adjustmentReason) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/stock-adjustments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventory_item_id: selectedItem.id,
          adjustment_amount: parseFloat(adjustmentAmount),
          reason: adjustmentReason,
          requested_by: currentUser
        })
      });

      if (response.ok) {
        alert('Stock adjustment request submitted successfully! Awaiting approval from Manager/Owner.');
        setShowAdjustmentModal(false);
        setAdjustmentAmount('');
        setAdjustmentReason('');
      } else {
        alert('Failed to submit adjustment request');
      }
    } catch (error) {
      console.error('Error submitting adjustment:', error);
      alert('Error submitting adjustment request');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterLevel === 'all' || item.stock_level === filterLevel;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-ET', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Inventory Management</h1>
          <p className="text-slate-600">Track and manage all inventory items from raw materials to finished products</p>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search inventory items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterLevel === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterLevel('all')}
                  className="flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  All
                </Button>
                <Button
                  variant={filterLevel === 'ok' ? 'default' : 'outline'}
                  onClick={() => setFilterLevel('ok')}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  OK
                </Button>
                <Button
                  variant={filterLevel === 'low' ? 'default' : 'outline'}
                  onClick={() => setFilterLevel('low')}
                  className="flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  Low
                </Button>
                <Button
                  variant={filterLevel === 'critical' ? 'default' : 'outline'}
                  onClick={() => setFilterLevel('critical')}
                  className="flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  Critical
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inventory Grid - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Inventory Items</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedItem?.id === item.id ? 'ring-2 ring-blue-500 shadow-md' : ''
                  }`}
                  onClick={() => handleItemClick(item)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 text-sm">{item.name}</h3>
                          <p className="text-xs text-slate-500">Current Stock</p>
                        </div>
                      </div>
                    </div>
                    <Badge className={`${getStockLevelColor(item.stock_level)} flex items-center gap-1 w-full justify-center mb-2`}>
                      {getStockLevelIcon(item.stock_level)}
                      {item.stock_level.toUpperCase()}
                    </Badge>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-2xl font-bold text-slate-900">
                        {item.quantity.toLocaleString()}
                      </span>
                      <span className="text-base text-slate-500">{item.unit}</span>
                    </div>
                    <div className="pt-3 border-t border-slate-200 space-y-1 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Low:</span>
                        <span className="font-medium">{item.low_threshold.toLocaleString()}{item.unit}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Critical:</span>
                        <span className="font-medium text-red-600">{item.critical_threshold.toLocaleString()}{item.unit}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Item Detail View - Takes 1 column */}
          <div className="space-y-4">
            {selectedItem ? (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-slate-900">Item Details</h2>
                  {(userRole === "store_keeper" || userRole === "manager" || userRole === "owner" || userRole === "admin") && (
                    <Button onClick={handleAdjustStock} className="bg-blue-600 hover:bg-blue-700">
                      Adjust Stock
                    </Button>
                  )}
                </div>

                <Card className="shadow-md">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                    <CardTitle className="flex items-center gap-3">
                      <Package className="w-6 h-6 text-blue-600" />
                      {selectedItem.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-600 mb-1">Current Quantity</p>
                        <p className="text-3xl font-bold text-slate-900">
                          {selectedItem.quantity.toLocaleString()} {selectedItem.unit}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <p className="text-xs text-yellow-700 mb-1">Low Threshold</p>
                          <p className="text-lg font-semibold text-yellow-900">
                            {selectedItem.low_threshold.toLocaleString()}{selectedItem.unit}
                          </p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                          <p className="text-xs text-red-700 mb-1">Critical Threshold</p>
                          <p className="text-lg font-semibold text-red-900">
                            {selectedItem.critical_threshold.toLocaleString()}{selectedItem.unit}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Transaction History */}
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">Transaction History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {selectedItem.transactions && selectedItem.transactions.length > 0 ? (
                        selectedItem.transactions.map((transaction) => (
                          <div
                            key={transaction.id}
                            className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {transaction.type === 'in' ? (
                                  <TrendingUp className="w-5 h-5 text-green-600" />
                                ) : (
                                  <TrendingDown className="w-5 h-5 text-red-600" />
                                )}
                                <span className={`font-semibold ${
                                  transaction.type === 'in' ? 'text-green-700' : 'text-red-700'
                                }`}>
                                  {transaction.type === 'in' ? '+' : '-'}{transaction.quantity.toLocaleString()} {selectedItem.unit}
                                </span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {formatDate(transaction.date)}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-700 mb-1">{transaction.reference}</p>
                            <p className="text-xs text-slate-500">By: {transaction.performed_by}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-slate-500 py-4">No transactions yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="shadow-md">
                <CardContent className="py-12">
                  <div className="text-center text-slate-500">
                    <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <p className="text-lg">Select an item to view details</p>
                    <p className="text-sm mt-2">Click on any inventory item to see its transaction history</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Adjustment Modal */}
      <Dialog open={showAdjustmentModal} onOpenChange={setShowAdjustmentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Stock - {selectedItem?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Adjustment Amount ({selectedItem?.unit})
              </label>
              <Input
                type="number"
                placeholder="Enter positive or negative number"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-slate-500 mt-1">
                Use positive numbers to add stock, negative to reduce
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Reason for Adjustment *
              </label>
              <Textarea
                placeholder="e.g., Spoilage, Correction after physical count, Damaged goods"
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                rows={4}
                className="w-full"
              />
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> This adjustment requires approval from Manager or Owner before being applied to inventory.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAdjustmentModal(false);
                setAdjustmentAmount('');
                setAdjustmentReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={submitAdjustment}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManagement;
