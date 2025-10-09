import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Package, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

const SimpleInventoryDashboard = () => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchInventory();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchInventory, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/inventory`);
      if (response.ok) {
        const data = await response.json();
        setInventoryItems(data);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockLevelColor = (level) => {
    switch (level) {
      case 'ok': return 'bg-green-100 text-green-800 border-green-200';
      case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStockIcon = (level) => {
    switch (level) {
      case 'ok': return <TrendingUp className="w-4 h-4" />;
      case 'low': return <AlertCircle className="w-4 h-4" />;
      case 'critical': return <TrendingDown className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-pulse" />
              <p className="text-gray-500">Loading inventory data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="border-slate-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl flex items-center gap-3">
            <Package className="w-8 h-8" />
            Inventory Dashboard - Live Stock Levels
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inventoryItems.map((item) => (
              <Card key={item.id} className="border border-slate-200 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    {getStockIcon(item.stock_level)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Current Stock */}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {item.current_stock.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">{item.unit}</div>
                  </div>

                  {/* Stock Level Badge */}
                  <div className="flex justify-center">
                    <Badge 
                      variant="outline" 
                      className={`${getStockLevelColor(item.stock_level)} font-semibold px-3 py-1`}
                    >
                      {item.stock_level.toUpperCase()} STOCK
                    </Badge>
                  </div>

                  {/* Thresholds */}
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Low Threshold:</span>
                      <span className="font-medium">{item.low_threshold} {item.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Critical Threshold:</span>
                      <span className="font-medium">{item.critical_threshold} {item.unit}</span>
                    </div>
                  </div>

                  {/* Unit Price for Saleable Items */}
                  {item.unit_price && (
                    <div className="pt-2 border-t border-gray-100">
                      <div className="text-center">
                        <span className="text-sm text-gray-600">Price: </span>
                        <span className="font-semibold text-green-600">
                          ETB {item.unit_price}/{item.unit}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Stock Level Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Stock Level</span>
                      <span>{Math.round((item.current_stock / (item.low_threshold * 2)) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          item.stock_level === 'ok' ? 'bg-green-500' : 
                          item.stock_level === 'low' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ 
                          width: `${Math.min(Math.max((item.current_stock / (item.low_threshold * 2)) * 100, 5), 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {inventoryItems.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No inventory items found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleInventoryDashboard;