import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { FileText, Send, Plus, ShoppingCart, X, Trash2 } from "lucide-react";
import { useToast } from "../../hooks/use-toast";

const PurchaseRequestForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    description: "",
    estimated_cost: "",
    reason: "",
    branch_id: "sales_branch",
    purchase_type: "cash",
    category: "supplies",
    impacts_inventory: false,
    vendor_name: "",
    vendor_contact: ""
  });
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState([]);
  const [batchReason, setBatchReason] = useState("");

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  const commonRequests = [
    { label: "Office Supplies", description: "Pens, paper, folders, etc.", estimatedCost: "2500" },
    { label: "Packaging Materials", description: "Flour bags, labels, tape", estimatedCost: "15000" },
    { label: "Cleaning Supplies", description: "Brooms, detergent, sanitizer", estimatedCost: "5000" },
    { label: "Marketing Materials", description: "Banners, brochures, flyers", estimatedCost: "8000" }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const useTemplate = (template) => {
    setFormData(prev => ({
      ...prev,
      description: template.description,
      estimated_cost: template.estimatedCost,
      reason: `Need ${template.label.toLowerCase()} for daily operations`
    }));
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    
    if (!formData.estimated_cost || parseFloat(formData.estimated_cost) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid estimated cost",
        variant: "destructive"
      });
      return;
    }

    if (!formData.description) {
      toast({
        title: "Error",
        description: "Please provide a description",
        variant: "destructive"
      });
      return;
    }

    // Add to cart
    const cartItem = {
      id: Date.now().toString(),
      description: formData.description,
      estimated_cost: parseFloat(formData.estimated_cost),
      reason: formData.reason,
      branch_id: formData.branch_id,
      purchase_type: formData.purchase_type,
      category: formData.category,
      vendor_name: formData.vendor_name,
      vendor_contact: formData.vendor_contact
    };

    setCart(prev => [...prev, cartItem]);
    
    toast({
      title: "✓ Added to Cart",
      description: `${formData.description} - ETB ${parseFloat(formData.estimated_cost).toLocaleString()}`,
    });

    // Reset form for next item
    setFormData({
      description: "",
      estimated_cost: "",
      reason: "",
      branch_id: formData.branch_id,
      purchase_type: formData.purchase_type,
      category: formData.category,
      impacts_inventory: false,
      vendor_name: "",
      vendor_contact: ""
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
      // Get user info
      const userStr = localStorage.getItem('user');
      const userName = userStr ? JSON.parse(userStr).name || JSON.parse(userStr).username : "Sales User";
      
      // Generate batch ID
      const batchId = `BATCH-${Date.now()}`;
      
      // Submit each item in cart as a separate request with batch_number
      const promises = cart.map(item => {
        const request = {
          description: item.description,
          estimated_cost: item.estimated_cost,
          reason: `${batchReason} - ${item.reason}`,
          branch_id: item.branch_id,
          requested_by: userName,
          purchase_type: item.purchase_type,
          category: item.category,
          impacts_inventory: item.purchase_type === "material",
          inventory_items: item.purchase_type === "material" ? [] : undefined,
          vendor_name: item.vendor_name || undefined,
          vendor_contact: item.vendor_contact || undefined,
          batch_number: batchId
        };

        return fetch(`${BACKEND_URL}/api/purchase-requests`, {
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

  const getTotalCost = () => {
    return cart.reduce((sum, item) => sum + item.estimated_cost, 0);
  };

  const handleSubmit = async (e, keepFormOpen = false) => {
    e.preventDefault();
    
    if (!formData.estimated_cost || parseFloat(formData.estimated_cost) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid estimated cost",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Get user info
      const userStr = localStorage.getItem('user');
      const userName = userStr ? JSON.parse(userStr).name || JSON.parse(userStr).username : "Sales User";
      
      const request = {
        description: formData.description,
        estimated_cost: parseFloat(formData.estimated_cost),
        reason: formData.reason,
        branch_id: formData.branch_id,
        requested_by: userName,
        purchase_type: formData.purchase_type,
        category: formData.category,
        impacts_inventory: formData.purchase_type === "material",
        inventory_items: formData.purchase_type === "material" ? [] : undefined,
        vendor_name: formData.vendor_name || undefined,
        vendor_contact: formData.vendor_contact || undefined
      };

      const response = await fetch(`${BACKEND_URL}/api/purchase-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request)
      });

      if (response.ok) {
        const data = await response.json();
        
        toast({
          title: "✓ Request Submitted",
          description: `Request ${data.request_number} submitted for approval`,
        });
        
        // Reset form
        setFormData({
          description: "",
          estimated_cost: "",
          reason: "",
          branch_id: "sales_branch",
          purchase_type: "cash",
          category: "supplies",
          impacts_inventory: false,
          vendor_name: "",
          vendor_contact: ""
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.detail || "Failed to submit request",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit request",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Quick Templates */}
        <Card className="border-slate-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-slate-900 text-sm">Quick Templates</CardTitle>
            <CardDescription className="text-xs">Click to use a template</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {commonRequests.map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3"
                  onClick={() => useTemplate(template)}
                >
                  <div>
                    <div className="font-semibold text-sm">{template.label}</div>
                    <div className="text-xs text-slate-500 mt-1">~ETB {parseInt(template.estimatedCost).toLocaleString()}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Request Form */}
        <Card className="lg:col-span-3 border-slate-200 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-slate-900">Purchase Request</CardTitle>
                <CardDescription>Request approval to purchase supplies or services</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
          <form onSubmit={handleAddToCart} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchase_type">Purchase Type *</Label>
                <Select 
                  value={formData.purchase_type} 
                  onValueChange={(value) => handleChange("purchase_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="material">Material (adds to inventory)</SelectItem>
                    <SelectItem value="cash">Cash Purchase</SelectItem>
                    <SelectItem value="service">Service/Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="raw_material">Raw Material (Wheat, etc)</SelectItem>
                    <SelectItem value="packaging">Packaging Materials</SelectItem>
                    <SelectItem value="equipment">Equipment/Machinery</SelectItem>
                    <SelectItem value="supplies">Supplies (Office, Cleaning)</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.purchase_type === "material" && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-900 font-medium">
                  📦 Material Purchase - Will update inventory when received
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Item/Service Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe what you need to purchase..."
                rows={3}
                required
              />
              <p className="text-xs text-slate-500">Be specific about quantities and specifications</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendor_name">Vendor Name</Label>
                <Input
                  id="vendor_name"
                  value={formData.vendor_name}
                  onChange={(e) => handleChange("vendor_name", e.target.value)}
                  placeholder="Supplier or vendor name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendor_contact">Vendor Contact</Label>
                <Input
                  id="vendor_contact"
                  value={formData.vendor_contact}
                  onChange={(e) => handleChange("vendor_contact", e.target.value)}
                  placeholder="Phone or email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_cost">Estimated Cost (ETB) *</Label>
              <Input
                id="estimated_cost"
                type="number"
                min="0"
                step="0.01"
                value={formData.estimated_cost}
                onChange={(e) => handleChange("estimated_cost", e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason & Justification *</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => handleChange("reason", e.target.value)}
                placeholder="Explain why this purchase is necessary..."
                rows={4}
                required
              />
              <p className="text-xs text-slate-500">This will go through Manager → Admin → Owner approval</p>
            </div>

              {formData.estimated_cost && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-900 font-semibold">
                    Estimated Cost: ETB {parseFloat(formData.estimated_cost || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-purple-700 mt-1">
                    Requires 3-level approval (Manager → Admin → Owner)
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setFormData({
                    description: "",
                    estimated_cost: "",
                    reason: "",
                    branch_id: "sales_branch",
                    purchase_type: formData.purchase_type,
                    category: formData.category,
                    impacts_inventory: false,
                    vendor_name: "",
                    vendor_contact: ""
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

        {/* Shopping Cart */}
        <Card className="border-slate-200 shadow-md sticky top-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900 flex items-center gap-2 text-sm">
                <ShoppingCart className="w-5 h-5" />
                Cart ({cart.length})
              </CardTitle>
              {cart.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCart([])}
                  className="text-red-600 hover:text-red-700 text-xs"
                >
                  Clear
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 text-xs">Cart is empty</p>
                <p className="text-slate-500 text-xs mt-1">Add items to batch</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="p-2 border border-slate-200 rounded bg-slate-50">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 text-xs line-clamp-1">{item.description}</p>
                          <p className="text-xs text-green-600 font-semibold">
                            ETB {item.estimated_cost.toLocaleString()}
                          </p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {item.category}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="text-red-600 hover:text-red-700 h-5 w-5 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cart Summary */}
                <div className="pt-3 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total Items:</span>
                    <span className="font-semibold text-slate-900">{cart.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total Cost:</span>
                    <span className="font-semibold text-green-600">
                      ETB {getTotalCost().toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Batch Reason */}
                <div className="space-y-2">
                  <Label htmlFor="batch_reason" className="text-xs">Batch Reason *</Label>
                  <Textarea
                    id="batch_reason"
                    value={batchReason}
                    onChange={(e) => setBatchReason(e.target.value)}
                    placeholder="Why these items together?"
                    rows={2}
                    required
                    className="text-xs"
                  />
                </div>

                {/* Submit Batch Button */}
                <Button
                  onClick={handleSubmitBatch}
                  className="w-full bg-green-500 hover:bg-green-600 text-xs"
                  disabled={loading || cart.length === 0 || !batchReason}
                  size="sm"
                >
                  <Send className="w-3 h-3 mr-2" />
                  {loading ? "Submitting..." : `Submit ${cart.length} Items`}
                </Button>

                <p className="text-xs text-center text-blue-600">
                  ℹ️ Batch for single approval
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PurchaseRequestForm;
