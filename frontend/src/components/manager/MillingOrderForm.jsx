import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Factory, CheckCircle, AlertCircle, Package, Clock, Plus } from 'lucide-react';

const MillingOrderForm = ({ manager, onSuccess, onCancel }) => {
  const [createFormData, setCreateFormData] = useState({
    raw_wheat_input_kg: ''
  });
  const [completionData, setCompletionData] = useState({
    outputs: []
  });
  const [millingOrders, setMillingOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [rawWheatStock, setRawWheatStock] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('create');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      
      // Fetch inventory for this branch only
      const inventoryResponse = await fetch(`${backendUrl}/api/inventory?branch_id=${manager.branch_id}`);
      if (inventoryResponse.ok) {
        const inventoryData = await inventoryResponse.json();
        // Filter to only show inventory for this branch
        const branchInventory = inventoryData.filter(item => item.branch_id === manager.branch_id);
        setInventory(branchInventory);
        
        const rawWheat = branchInventory.find(item => item.name === "Raw Wheat");
        setRawWheatStock(rawWheat ? rawWheat.quantity : 0);
      }

      // Fetch milling orders for this branch
      const millingOrdersResponse = await fetch(`${backendUrl}/api/milling-orders?branch_id=${manager.branch_id}&status=pending`);
      if (millingOrdersResponse.ok) {
        const millingOrdersData = await millingOrdersResponse.json();
        setMillingOrders(millingOrdersData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      
      const orderData = {
        raw_wheat_input_kg: parseFloat(createFormData.raw_wheat_input_kg),
        manager_id: manager.id,
        branch_id: manager.branch_id
      };

      const response = await fetch(`${backendUrl}/api/milling-orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const result = await response.json();
        setMessage({ 
          type: 'success', 
          text: `Milling order created successfully! ${orderData.raw_wheat_input_kg}kg raw wheat deducted from inventory.` 
        });
        
        // Reset form
        setCreateFormData({ raw_wheat_input_kg: '' });
        fetchData(); // Refresh data
        
        setTimeout(() => {
          onSuccess && onSuccess();
        }, 2000);
      } else {
        const error = await response.json();
        setMessage({ 
          type: 'error', 
          text: error.detail || 'Failed to create milling order' 
        });
      }
    } catch (error) {
      console.error('Error creating milling order:', error);
      setMessage({ 
        type: 'error', 
        text: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOrder = async (orderId) => {
    if (completionData.outputs.length === 0) {
      setMessage({ type: 'error', text: 'Please add at least one output product' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      
      const response = await fetch(`${backendUrl}/api/milling-orders/${orderId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completionData)
      });

      if (response.ok) {
        const result = await response.json();
        const totalOutput = completionData.outputs.reduce((sum, o) => sum + (parseFloat(o.quantity) || 0), 0);
        setMessage({ 
          type: 'success', 
          text: `✅ Production logged successfully! ${completionData.outputs.length} product(s) totaling ${totalOutput.toFixed(2)}kg added to inventory.` 
        });
        
        // Reset completion data
        setCompletionData({ outputs: [] });
        fetchData(); // Refresh data to show updated inventory
        
        setTimeout(() => {
          onSuccess && onSuccess();
        }, 2500);
      } else {
        const error = await response.json();
        setMessage({ 
          type: 'error', 
          text: error.detail || 'Failed to complete milling order' 
        });
      }
    } catch (error) {
      console.error('Error completing milling order:', error);
      setMessage({ 
        type: 'error', 
        text: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const addOutput = () => {
    setCompletionData(prev => ({
      ...prev,
      outputs: [...prev.outputs, { product_id: '', quantity: '' }]
    }));
  };

  const updateOutput = (index, field, value) => {
    setCompletionData(prev => ({
      ...prev,
      outputs: prev.outputs.map((output, i) => 
        i === index ? { ...output, [field]: value } : output
      )
    }));
  };

  const removeOutput = (index) => {
    setCompletionData(prev => ({
      ...prev,
      outputs: prev.outputs.filter((_, i) => i !== index)
    }));
  };

  // Get finished product options (exclude Raw Wheat)
  const finishedProducts = inventory.filter(item => item.name !== "Raw Wheat");

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Factory className="w-5 h-5 text-purple-600" />
          Milling Operations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Order</TabsTrigger>
            <TabsTrigger value="complete">Complete Order</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4 mt-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm text-slate-600">Available Raw Wheat Stock: <span className="font-semibold">{rawWheatStock.toLocaleString()}kg</span></p>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <Label htmlFor="raw_wheat_input">Raw Wheat Input (kg)</Label>
                <Input
                  id="raw_wheat_input"
                  type="number"
                  step="0.01"
                  min="0"
                  max={rawWheatStock}
                  value={createFormData.raw_wheat_input_kg}
                  onChange={(e) => setCreateFormData({ raw_wheat_input_kg: e.target.value })}
                  placeholder="Enter quantity in kg"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">Maximum: {rawWheatStock.toLocaleString()}kg</p>
              </div>

              <Button 
                type="submit" 
                disabled={loading || !createFormData.raw_wheat_input_kg || parseFloat(createFormData.raw_wheat_input_kg) > rawWheatStock}
                className="w-full"
              >
                {loading ? 'Creating Order...' : 'Create Milling Order'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="complete" className="space-y-4 mt-4">
            {millingOrders.filter(order => order.status === 'pending').length > 0 ? (
              <div className="space-y-4">
                {millingOrders.filter(order => order.status === 'pending').map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 space-y-4 bg-white shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-slate-900">Milling Order #{order.id.substring(0, 8).toUpperCase()}</h4>
                        <p className="text-sm text-slate-600 mt-1">
                          <span className="font-semibold">{order.raw_wheat_input_kg.toLocaleString()}kg</span> Raw Wheat Input
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Created: {new Date(order.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending Completion
                      </Badge>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-base font-semibold">Log Production Outputs</Label>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={addOutput}
                          className="text-green-600 border-green-200 hover:bg-green-50"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Product
                        </Button>
                      </div>
                      
                      <p className="text-sm text-slate-600 mb-3">
                        Record all finished products and by-products from this milling order
                      </p>

                      {completionData.outputs.length === 0 && (
                        <div className="text-center py-4 text-slate-500 text-sm">
                          Click "Add Product" to log your production outputs
                        </div>
                      )}

                      {completionData.outputs.map((output, index) => (
                        <div key={index} className="flex gap-2 items-start bg-white p-3 rounded-lg border">
                          <div className="flex-1">
                            <label className="text-xs text-slate-500 mb-1 block">Product</label>
                            <select 
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              value={output.product_id}
                              onChange={(e) => updateOutput(index, 'product_id', e.target.value)}
                              required
                            >
                              <option value="">Select finished product</option>
                              {finishedProducts.map((product) => (
                                <option key={product.id} value={product.id}>
                                  {product.name} (Available: {product.quantity.toLocaleString()}kg)
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="w-32">
                            <label className="text-xs text-slate-500 mb-1 block">Output (kg)</label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              value={output.quantity}
                              onChange={(e) => updateOutput(index, 'quantity', e.target.value)}
                              required
                              className="text-right"
                            />
                          </div>
                          <div className="pt-6">
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => removeOutput(index)}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {completionData.outputs.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">
                          Summary: {completionData.outputs.length} product{completionData.outputs.length !== 1 ? 's' : ''} to be logged
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          Total output: {completionData.outputs.reduce((sum, o) => sum + (parseFloat(o.quantity) || 0), 0).toFixed(2)}kg
                        </p>
                      </div>
                    )}

                    <Button 
                      onClick={() => handleCompleteOrder(order.id)}
                      disabled={loading || completionData.outputs.length === 0}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {loading ? 'Logging Production...' : 'Complete Order & Log Outputs'}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No pending milling orders</p>
                <p className="text-sm text-slate-500">Create a new milling order to get started</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {message.text && (
          <Alert className={`mt-4 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {onCancel && (
          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={loading}
              className="w-full"
            >
              Close
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MillingOrderForm;