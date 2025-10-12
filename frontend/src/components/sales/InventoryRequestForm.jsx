import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Package, Send, CheckCircle2, User, ShoppingCart, Plus, Trash2, X } from "lucide-react";
import { useToast } from "../../hooks/use-toast";

const InventoryRequestForm = () => {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    product_name: "",
    package_size: "50kg",
    num_packages: "",
    reason: "",
    branch_id: "berhane", // Sales chooses which branch to request from
    is_customer_delivery: false,
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    delivery_date_preference: ""
  });
  const [loading, setLoading] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [batchReason, setBatchReason] = useState("");

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  // Package size options
  const packageSizes = [
    { value: "25kg", label: "25 kg" },
    { value: "50kg", label: "50 kg" },
    { value: "100kg", label: "100 kg" }
  ];

  useEffect(() => {
    fetchAvailableProducts();
  }, [formData.branch_id]); // Refetch when branch changes

  const fetchAvailableProducts = async () => {
    try {
      // Fetch products from the selected branch
      const response = await fetch(`${BACKEND_URL}/api/inventory?branch_id=${formData.branch_id}`);
      if (response.ok) {
        const data = await response.json();
        // Get unique products (excluding service items, raw materials, and items with no price)
        const products = data
          .filter(item => 
            item.is_sellable !== false && 
            item.category !== "service" &&
            item.name !== "Raw Wheat" &&
            (item.unit_price > 0 || item.unit_selling_price > 0)
          )
          .map(item => ({
            value: item.name,
            label: item.name,
            available: item.quantity
          }));
        
        // Remove duplicates by name
        const unique = products.filter((product, index, self) =>
          index === self.findIndex((p) => p.value === product.value)
        );
        
        setAvailableProducts(unique);
        if (unique.length > 0 && !formData.product_name) {
          setFormData(prev => ({ ...prev, product_name: unique[0].value }));
        }
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to load available products",
        variant: "destructive"
      });
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotalWeight = () => {
    // Extract numeric value from package_size (e.g., "50kg" -> 50)
    const sizeValue = parseInt(formData.package_size) || 0;
    return sizeValue * parseInt(formData.num_packages || 0);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    
    if (!formData.num_packages || parseInt(formData.num_packages) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid number of packages",
        variant: "destructive"
      });
      return;
    }

    // Validate customer delivery fields if enabled
    if (formData.is_customer_delivery) {
      if (!formData.customer_name || !formData.customer_phone || !formData.customer_address) {
        toast({
          title: "Error",
          description: "Please fill in all customer details",
          variant: "destructive"
        });
        return;
      }
    }

    // Add to cart
    const cartItem = {
      id: Date.now().toString(),
      product_name: formData.product_name,
      package_size: formData.package_size,
      num_packages: parseInt(formData.num_packages),
      reason: formData.reason,
      branch_id: formData.branch_id,
      is_customer_delivery: formData.is_customer_delivery,
      customer_info: formData.is_customer_delivery ? {
        name: formData.customer_name,
        phone: formData.customer_phone,
        address: formData.customer_address,
        delivery_date_preference: formData.delivery_date_preference
      } : null
    };

    setCart(prev => [...prev, cartItem]);
    
    toast({
      title: "✓ Added to Cart",
      description: `${formData.num_packages}× ${formData.package_size} ${formData.product_name}`,
    });

    // Reset form for next item
    setFormData({
      product_name: availableProducts[0]?.value || "",
      package_size: "50kg",
      num_packages: "",
      reason: "",
      branch_id: formData.branch_id, // Keep same branch
      is_customer_delivery: false,
      customer_name: "",
      customer_phone: "",
      customer_address: "",
      delivery_date_preference: ""
    });
  };

  const handleRemoveFromCart = (itemId) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
    toast({
      title: "Removed from Cart",
      description: "Item removed from cart"
    });
  };

  const handleSubmitBatch = async () => {
    if (cart.length === 0) {
      toast({
        title: "Error",
        description: "Cart is empty. Add items before submitting.",
        variant: "destructive"
      });
      return;
    }

    if (!batchReason) {
      toast({
        title: "Error",
        description: "Please provide a reason for this batch request",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Get user name from localStorage
      const userStr = localStorage.getItem('user');
      const userName = userStr ? JSON.parse(userStr).name || JSON.parse(userStr).username : "Sales User";
      
      // Generate batch ID
      const batchId = `BATCH-${Date.now()}`;
      
      // Submit each item in cart as a separate request with batch_id
      const promises = cart.map(item => {
        const request = {
          product_name: item.product_name,
          package_size: item.package_size,
          quantity: item.num_packages,
          requested_by: userName,
          branch_id: item.branch_id,
          reason: `${batchReason} - ${item.reason}`,
          is_customer_delivery: item.is_customer_delivery,
          customer_info: item.customer_info,
          batch_id: batchId
        };

        return fetch(`${BACKEND_URL}/api/stock-requests`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request)
        });
      });

      const responses = await Promise.all(promises);
      const successCount = responses.filter(r => r.ok).length;

      if (successCount === cart.length) {
        toast({
          title: "✓ Batch Submitted Successfully",
          description: `${cart.length} items submitted as one batch (${batchId})`,
        });
        
        // Clear cart and reset
        setCart([]);
        setBatchReason("");
      } else {
        toast({
          title: "Partial Success",
          description: `${successCount} of ${cart.length} items submitted`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit batch request",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTotalWeight = () => {
    return cart.reduce((sum, item) => {
      const sizeValue = parseInt(item.package_size) || 0;
      return sum + (sizeValue * item.num_packages);
    }, 0);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Request Form */}
        <div className="lg:col-span-2">

      <Card className="border-slate-200 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-slate-900">Request Flour Stock</CardTitle>
                <CardDescription>Request flour from main store for your sales point</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddToCart} className="space-y-6">
            {/* Branch Selection */}
            <div className="space-y-2">
              <Label htmlFor="branch_id">Request From Branch</Label>
              <Select 
                value={formData.branch_id} 
                onValueChange={(value) => handleChange("branch_id", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="berhane">Berhane Branch</SelectItem>
                  <SelectItem value="girmay">Girmay Branch</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                Choose which warehouse branch to request products from
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product_name">Product Type</Label>
              <Select 
                value={formData.product_name} 
                onValueChange={(value) => handleChange("product_name", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product..." />
                </SelectTrigger>
                <SelectContent>
                  {availableProducts.map((product) => (
                    <SelectItem key={product.value} value={product.value}>
                      {product.label} ({product.available}kg available)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                Products available from {formData.branch_id === "berhane" ? "Berhane" : "Girmay"} Branch
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="package_size">Package Size</Label>
                <Select 
                  value={formData.package_size} 
                  onValueChange={(value) => handleChange("package_size", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {packageSizes.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="num_packages">Number of Packages</Label>
                <Input
                  id="num_packages"
                  type="number"
                  min="1"
                  value={formData.num_packages}
                  onChange={(e) => handleChange("num_packages", e.target.value)}
                  required
                />
              </div>
            </div>

            {formData.num_packages && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">Total Weight:</span> {calculateTotalWeight()} kg
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  {formData.num_packages} packages × {formData.package_size}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Request</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => handleChange("reason", e.target.value)}
                placeholder="Explain why you need this stock..."
                rows={3}
                required
              />
            </div>

            {/* Customer Delivery Toggle */}
            <div className="border-t pt-6">
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  id="is_customer_delivery"
                  checked={formData.is_customer_delivery}
                  onChange={(e) => handleChange("is_customer_delivery", e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <Label htmlFor="is_customer_delivery" className="flex items-center gap-2 cursor-pointer">
                  <User className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold">Direct Customer Delivery</span>
                </Label>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Check this if the stock is for direct delivery to a customer
              </p>

              {/* Customer Info Fields */}
              {formData.is_customer_delivery && (
                <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900">Customer Information</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customer_name">Customer Name *</Label>
                      <Input
                        id="customer_name"
                        value={formData.customer_name}
                        onChange={(e) => handleChange("customer_name", e.target.value)}
                        placeholder="Full name"
                        required={formData.is_customer_delivery}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="customer_phone">Phone Number *</Label>
                      <Input
                        id="customer_phone"
                        value={formData.customer_phone}
                        onChange={(e) => handleChange("customer_phone", e.target.value)}
                        placeholder="+251..."
                        required={formData.is_customer_delivery}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer_address">Delivery Address *</Label>
                    <Textarea
                      id="customer_address"
                      value={formData.customer_address}
                      onChange={(e) => handleChange("customer_address", e.target.value)}
                      placeholder="Full delivery address..."
                      rows={2}
                      required={formData.is_customer_delivery}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="delivery_date_preference">Preferred Delivery Date</Label>
                    <Input
                      id="delivery_date_preference"
                      type="date"
                      value={formData.delivery_date_preference}
                      onChange={(e) => handleChange("delivery_date_preference", e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setFormData({
                  product_name: availableProducts[0]?.value || "",
                  package_size: "50kg",
                  num_packages: "",
                  reason: "",
                  branch_id: formData.branch_id,
                  is_customer_delivery: false,
                  customer_name: "",
                  customer_phone: "",
                  customer_address: "",
                  delivery_date_preference: ""
                })}
              >
                Reset
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-500 hover:bg-blue-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
        </div>

        {/* Right: Shopping Cart */}
        <div>
          <Card className="border-slate-200 shadow-md sticky top-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-900 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Cart ({cart.length})
                </CardTitle>
                {cart.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCart([])}
                    className="text-red-600 hover:text-red-700"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 text-sm">Cart is empty</p>
                  <p className="text-slate-500 text-xs mt-2">Add items to submit as batch</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Cart Items */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900 text-sm">{item.product_name}</p>
                            <p className="text-xs text-slate-600">
                              {item.num_packages}× {item.package_size} = {parseInt(item.package_size) * item.num_packages}kg
                            </p>
                            {item.is_customer_delivery && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                <User className="w-3 h-3 mr-1" />
                                Customer: {item.customer_info?.name}
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">{item.reason}</p>
                      </div>
                    ))}
                  </div>

                  {/* Cart Summary */}
                  <div className="pt-4 border-t space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Total Items:</span>
                      <span className="font-semibold text-slate-900">{cart.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Total Weight:</span>
                      <span className="font-semibold text-slate-900">{getTotalWeight()} kg</span>
                    </div>
                  </div>

                  {/* Batch Reason */}
                  <div className="space-y-2">
                    <Label htmlFor="batch_reason">Batch Reason *</Label>
                    <Textarea
                      id="batch_reason"
                      value={batchReason}
                      onChange={(e) => setBatchReason(e.target.value)}
                      placeholder="Why are you requesting these items together?"
                      rows={3}
                      required
                    />
                    <p className="text-xs text-slate-500">
                      This will be the main reason for the entire batch
                    </p>
                  </div>

                  {/* Submit Batch Button */}
                  <Button
                    onClick={handleSubmitBatch}
                    className="w-full bg-green-500 hover:bg-green-600"
                    disabled={loading || cart.length === 0 || !batchReason}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {loading ? "Submitting..." : `Submit All ${cart.length} Requests`}
                  </Button>

                  <p className="text-xs text-center text-blue-600">
                    ℹ️ All items will be submitted as one batch for single approval
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InventoryRequestForm;
