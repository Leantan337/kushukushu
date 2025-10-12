import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { 
  Package,
  TrendingUp,
  DollarSign,
  Building2,
  Layers,
  Edit,
  AlertCircle
} from 'lucide-react';

const InventoryValuationDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [valuation, setValuation] = useState({
    total_inventory_value: 0,
    total_selling_value: 0,
    total_potential_profit: 0,
    profit_margin_percent: 0,
    by_branch: {}
  });
  const [categoryData, setCategoryData] = useState({
    total_inventory_value: 0,
    by_category: {},
    item_count: 0
  });
  const [products, setProducts] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editPricing, setEditPricing] = useState({
    actual_unit_cost: '',
    current_unit_cost: '',
    unit_selling_price: ''
  });
  const [saving, setSaving] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    loadValuation();
  }, []);

  const loadValuation = async () => {
    setLoading(true);
    try {
      const [branchData, catData, productsData] = await Promise.all([
        fetch(`${BACKEND_URL}/api/inventory/valuation`).then(r => r.ok ? r.json() : {}),
        fetch(`${BACKEND_URL}/api/inventory/valuation/summary`).then(r => r.ok ? r.json() : {}),
        fetch(`${BACKEND_URL}/api/inventory`).then(r => r.ok ? r.json() : [])
      ]);

      setValuation(branchData);
      setCategoryData(catData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading valuation:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => `ETB ${amount?.toLocaleString() || '0'}`;

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setEditPricing({
      actual_unit_cost: product.actual_unit_cost || '',
      current_unit_cost: product.current_unit_cost || product.actual_unit_cost || '',
      unit_selling_price: product.unit_selling_price || product.unit_price || ''
    });
    setShowEditModal(true);
  };

  const handleSavePricing = async () => {
    if (!selectedProduct) return;

    // Validate inputs
    const actualCost = parseFloat(editPricing.actual_unit_cost);
    const currentCost = parseFloat(editPricing.current_unit_cost);
    const sellingPrice = parseFloat(editPricing.unit_selling_price);

    if (isNaN(actualCost) || actualCost < 0) {
      alert('Please enter a valid actual cost');
      return;
    }
    if (isNaN(currentCost) || currentCost < 0) {
      alert('Please enter a valid current cost');
      return;
    }
    if (isNaN(sellingPrice) || sellingPrice < 0) {
      alert('Please enter a valid selling price');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/inventory/${selectedProduct.id}/pricing`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          actual_unit_cost: actualCost,
          current_unit_cost: currentCost,
          unit_selling_price: sellingPrice
        })
      });

      if (response.ok) {
        // Reload all data
        await loadValuation();
        setShowEditModal(false);
        setSelectedProduct(null);
        setEditPricing({
          actual_unit_cost: '',
          current_unit_cost: '',
          unit_selling_price: ''
        });
      } else {
        alert('Failed to update pricing. Please try again.');
      }
    } catch (error) {
      console.error('Error updating pricing:', error);
      alert('Error updating pricing. Please check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-slate-200">
        <CardContent className="p-12 text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-slate-400 animate-pulse" />
          <p className="text-slate-600">Loading inventory valuation...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 shadow-md">
      <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-xl">
        <CardTitle className="flex items-center gap-2">
          <Package className="w-6 h-6" />
          Inventory Valuation Summary
        </CardTitle>
        <CardDescription className="text-green-100">
          Real-time monetary value of your inventory
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        
        {/* Overall Totals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Inventory Cost</h3>
            </div>
            <p className="text-3xl font-bold text-blue-900">
              {formatCurrency(valuation.total_inventory_value)}
            </p>
            <p className="text-xs text-blue-600 mt-1">What we paid for stock</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">Potential Revenue</h3>
            </div>
            <p className="text-3xl font-bold text-purple-900">
              {formatCurrency(valuation.total_selling_value)}
            </p>
            <p className="text-xs text-purple-600 mt-1">If all stock sold</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-900">Potential Profit</h3>
            </div>
            <p className="text-3xl font-bold text-green-900">
              {formatCurrency(valuation.total_potential_profit)}
            </p>
            <p className="text-xs text-green-600 mt-1">
              Margin: {valuation.profit_margin_percent?.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* By Branch */}
        <div>
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Valuation by Branch
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(valuation.by_branch || {}).map(([branch, data]) => (
              <div key={branch} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-900 capitalize">{branch} Branch</h4>
                  <Badge variant="outline">{data.item_count} items</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Inventory Value:</span>
                    <span className="font-bold text-blue-600">
                      {formatCurrency(data.inventory_value)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Potential Revenue:</span>
                    <span className="font-bold text-purple-600">
                      {formatCurrency(data.selling_value)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-300">
                    <span className="text-slate-600">Potential Profit:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(data.potential_profit)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Category */}
        <div>
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Valuation by Category
          </h3>
          <div className="space-y-2">
            {Object.entries(categoryData.by_category || {}).map(([category, data]) => (
              <div key={category} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="capitalize">{category}</Badge>
                  <span className="text-sm text-slate-600">{data.items} items</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-slate-900">
                    {formatCurrency(data.value)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product List with Pricing */}
        <div>
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Package className="w-5 h-5" />
            All Products - Pricing Details
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 border-b-2 border-slate-300">
                <tr>
                  <th className="text-left p-3 font-semibold text-slate-700">Product Name</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Branch</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Category</th>
                  <th className="text-right p-3 font-semibold text-slate-700">Quantity</th>
                  <th className="text-right p-3 font-semibold text-slate-700">Current Cost</th>
                  <th className="text-right p-3 font-semibold text-slate-700">Selling Price</th>
                  <th className="text-right p-3 font-semibold text-slate-700">Total Value</th>
                  <th className="text-center p-3 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center p-6 text-slate-500">
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const currentCost = product.current_unit_cost || product.actual_unit_cost || 0;
                    const sellingPrice = product.unit_selling_price || product.unit_price || 0;
                    const totalValue = product.quantity * currentCost;
                    
                    return (
                      <tr key={product.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="p-3 font-medium text-slate-900">{product.name}</td>
                        <td className="p-3">
                          <Badge variant="outline" className="capitalize">
                            {product.branch_id || 'N/A'}
                          </Badge>
                        </td>
                        <td className="p-3 capitalize text-slate-600">{product.category || 'N/A'}</td>
                        <td className="p-3 text-right text-slate-900">
                          {product.quantity?.toLocaleString() || 0} {product.unit || 'kg'}
                        </td>
                        <td className="p-3 text-right font-medium text-blue-600">
                          {formatCurrency(currentCost)}
                        </td>
                        <td className="p-3 text-right font-medium text-purple-600">
                          {formatCurrency(sellingPrice)}
                        </td>
                        <td className="p-3 text-right font-bold text-green-600">
                          {formatCurrency(totalValue)}
                        </td>
                        <td className="p-3 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClick(product)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </CardContent>

      {/* Edit Pricing Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Product Pricing</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-semibold text-slate-900">{selectedProduct.name}</p>
                <p className="text-sm text-slate-600">
                  Branch: <span className="capitalize">{selectedProduct.branch_id || 'N/A'}</span> | 
                  Quantity: {selectedProduct.quantity?.toLocaleString() || 0} {selectedProduct.unit || 'kg'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Actual Unit Cost (ETB) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Enter actual cost per unit"
                  value={editPricing.actual_unit_cost}
                  onChange={(e) => setEditPricing({...editPricing, actual_unit_cost: e.target.value})}
                  className="w-full"
                />
                <p className="text-xs text-slate-500 mt-1">
                  The actual cost paid when purchasing this item
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Current Unit Cost (ETB) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Enter current cost per unit"
                  value={editPricing.current_unit_cost}
                  onChange={(e) => setEditPricing({...editPricing, current_unit_cost: e.target.value})}
                  className="w-full"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Current cost for valuation purposes
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Selling Price (ETB) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Enter selling price per unit"
                  value={editPricing.unit_selling_price}
                  onChange={(e) => setEditPricing({...editPricing, unit_selling_price: e.target.value})}
                  className="w-full"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Price at which this item is sold to customers
                </p>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                  <p className="text-xs text-amber-800">
                    <strong>Note:</strong> Updating pricing will recalculate all valuation metrics immediately.
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                setSelectedProduct(null);
                setEditPricing({
                  actual_unit_cost: '',
                  current_unit_cost: '',
                  unit_selling_price: ''
                });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePricing}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

// Also export a compact version for embedding in dashboards
export const InventoryValuationWidget = () => {
  const [loading, setLoading] = useState(true);
  const [valuation, setValuation] = useState({
    total_inventory_value: 0,
    total_selling_value: 0,
    total_potential_profit: 0,
    profit_margin_percent: 0
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    const loadValuation = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/inventory/valuation`);
        if (response.ok) {
          const data = await response.json();
          setValuation(data);
        }
      } catch (error) {
        console.error('Error loading valuation:', error);
      } finally {
        setLoading(false);
      }
    };
    loadValuation();
  }, [BACKEND_URL]);

  const formatCurrency = (amount) => `ETB ${amount?.toLocaleString() || '0'}`;

  if (loading) {
    return (
      <Card className="border-slate-200">
        <CardContent className="p-6 text-center">
          <Package className="w-8 h-8 mx-auto mb-2 text-slate-400 animate-pulse" />
          <p className="text-sm text-slate-600">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Package className="w-5 h-5 text-green-600" />
          Inventory Valuation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Total Value:</span>
            <span className="text-2xl font-bold text-blue-900">
              {formatCurrency(valuation.total_inventory_value)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Potential Revenue:</span>
            <span className="text-2xl font-bold text-purple-900">
              {formatCurrency(valuation.total_selling_value)}
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-green-200">
            <span className="text-sm font-medium text-slate-700">Potential Profit:</span>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(valuation.total_potential_profit)}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {valuation.profit_margin_percent?.toFixed(1)}% margin
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryValuationDashboard;

