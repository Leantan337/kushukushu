import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Plus, Minus, Trash2, ShoppingCart, DollarSign } from "lucide-react";
import { useToast } from "../../hooks/use-toast";

const POSTransaction = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [paymentType, setPaymentType] = useState("cash");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBranch, setSelectedBranch] = useState("all"); // Allow selecting which branch to view

  useEffect(() => {
    fetchProducts();
  }, [selectedBranch]); // Refetch when branch filter changes

  const fetchProducts = async () => {
    try {
      // Fetch products from ALL branches or specific branch
      const url = selectedBranch === "all" 
        ? `${BACKEND_URL}/api/inventory`
        : `${BACKEND_URL}/api/inventory?branch_id=${selectedBranch}`;
        
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        // Filter sellable products only (exclude service items, raw materials, and items with no price)
        const sellableProducts = data.filter(item => 
          item.is_sellable !== false &&
          item.category !== "service" &&
          item.name !== "Raw Wheat" &&
          (item.unit_price > 0 || item.unit_selling_price > 0)
        );
        setProducts(sellableProducts);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to load products. Please refresh the page.",
        variant: "destructive"
      });
    }
  };

  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const addToCart = (product) => {
    const existingItem = cartItems.find(item => item.product_id === product.id);
    if (existingItem) {
      updateQuantity(product.id, existingItem.quantity + 1);
    } else {
      setCartItems([...cartItems, {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: product.unit_price || 50,
        available_stock: product.quantity || product.current_stock || 0
      }]);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(cartItems.map(item =>
      item.product_id === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeFromCart = (productId) => {
    setCartItems(cartItems.filter(item => item.product_id !== productId));
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add items to cart",
        variant: "destructive"
      });
      return;
    }

    if (paymentType === "loan" && (!customerName || !customerPhone)) {
      toast({
        title: "Error",
        description: "Customer information required for loan payment",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Transform cart items to match backend schema
      const transformedItems = cartItems.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        quantity_kg: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price
      }));

      const transaction = {
        items: transformedItems,
        payment_type: paymentType,
        sales_person_id: "SALES-001", // Replace with actual user ID
        sales_person_name: "Sales User", // Replace with actual user name
        branch_id: selectedBranch === "all" ? "berhane" : selectedBranch,
        customer_id: paymentType === "loan" ? customerPhone : null,
        customer_name: paymentType === "loan" ? customerName : null,
        notes: notes || null
      };

      const response = await fetch(`${BACKEND_URL}/api/sales-transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction)
      });

      if (response.ok) {
        const data = await response.json();
        
        // Show different messages based on payment type
        let successMessage = `Transaction ${data.transaction_number} completed successfully`;
        if (paymentType === "loan") {
          successMessage += `. Loan created for ${customerName}. View in Loan Management.`;
        } else {
          successMessage += `. Payment recorded via ${paymentType.toUpperCase()}. View in Order Management.`;
        }
        
        toast({
          title: "✅ Sale Processed",
          description: successMessage,
        });
        
        // Reset form
        setCartItems([]);
        setPaymentType("cash");
        setCustomerName("");
        setCustomerPhone("");
        setNotes("");
        fetchProducts(); // Refresh inventory
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.detail || "Failed to process transaction",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process transaction",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Products List */}
      <Card className="lg:col-span-2 border-slate-200 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <div>
              <CardTitle className="text-slate-900">Available Products</CardTitle>
              <CardDescription>Select products to add to cart</CardDescription>
            </div>
            {/* Branch Selector */}
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                <SelectItem value="berhane">Berhane Branch</SelectItem>
                <SelectItem value="girmay">Girmay Branch</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Category Filter */}
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => setSelectedCategory("all")}
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              className={selectedCategory === "all" ? "bg-blue-500" : ""}
            >
              All Products
            </Button>
            <Button
              onClick={() => setSelectedCategory("flour")}
              variant={selectedCategory === "flour" ? "default" : "outline"}
              size="sm"
              className={selectedCategory === "flour" ? "bg-blue-500" : ""}
            >
              Flour
            </Button>
            <Button
              onClick={() => setSelectedCategory("bran")}
              variant={selectedCategory === "bran" ? "default" : "outline"}
              size="sm"
              className={selectedCategory === "bran" ? "bg-blue-500" : ""}
            >
              Bran
            </Button>
          </div>

          {/* Branch Info */}
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
            <p className="text-xs text-blue-900">
              <span className="font-semibold">Showing products from:</span> {
                selectedBranch === "all" ? "All Branches" :
                selectedBranch === "berhane" ? "Berhane Branch" : "Girmay Branch"
              } {" "}({filteredProducts.length} products available)
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="border border-slate-200 rounded-lg p-4 hover:border-blue-400 transition-colors hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-slate-900">{product.name}</h3>
                    {product.package_size && product.package_size !== "bulk" && (
                      <span className="text-xs text-slate-500">
                        Package: {product.package_size}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    product.stock_level === "ok" ? "bg-green-100 text-green-700" :
                    product.stock_level === "low" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {product.quantity || product.current_stock || 0} {product.unit}
                  </span>
                </div>
                {product.packages_available > 0 && (
                  <div className="text-xs text-slate-600 mb-2">
                    {product.packages_available} packages available
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-blue-600">
                      ETB {product.unit_price?.toLocaleString() || 50}
                    </span>
                    {product.package_size && product.package_size !== "bulk" ? (
                      <span className="text-xs text-slate-500 ml-1">/{product.package_size}</span>
                    ) : (
                      <span className="text-xs text-slate-500 ml-1">/{product.unit}</span>
                    )}
                  </div>
                  <Button
                    onClick={() => addToCart(product)}
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600"
                    disabled={(product.quantity || product.current_stock || 0) <= 0 || product.stock_level === "critical"}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cart & Checkout */}
      <Card className="border-slate-200 shadow-md h-fit sticky top-6">
        <CardHeader>
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Cart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Cart Items */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {cartItems.length === 0 ? (
                <p className="text-center text-slate-500 py-8">Cart is empty</p>
              ) : (
                cartItems.map((item) => (
                  <div key={item.product_id} className="border border-slate-200 rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm text-slate-900">{item.product_name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.product_id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="h-7 w-7 p-0"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="h-7 w-7 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <span className="text-sm font-bold text-blue-600">
                        ETB {(item.quantity * item.unit_price).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Payment Details */}
            {cartItems.length > 0 && (
              <>
                <div className="border-t pt-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentType">Payment Type</Label>
                    <Select value={paymentType} onValueChange={setPaymentType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                        <SelectItem value="transfer">Bank Transfer</SelectItem>
                        <SelectItem value="loan">Loan (Credit)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {paymentType === "loan" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="customerName">Customer Name *</Label>
                        <Input
                          id="customerName"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customerPhone">Customer Phone *</Label>
                        <Input
                          id="customerPhone"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          required
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-slate-900">Total</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ETB {calculateTotal().toLocaleString()}
                    </span>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-green-500 hover:bg-green-600 text-white h-12 text-lg font-bold"
                    disabled={loading}
                  >
                    <DollarSign className="w-5 h-5 mr-2" />
                    {loading ? "Processing..." : "Complete Sale"}
                  </Button>
                </div>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default POSTransaction;
