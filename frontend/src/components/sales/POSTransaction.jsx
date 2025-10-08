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

  const BACKEND_URL = import.meta.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/inventory`);
      if (response.ok) {
        const data = await response.json();
        // Filter only finished flour products
        const flourProducts = data.filter(item => 
          item.name.includes("Flour") || item.name.includes("Fruska") || item.name.includes("Fruskelo")
        );
        setProducts(flourProducts);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

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
        available_stock: product.current_stock
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
      const transaction = {
        items: cartItems,
        payment_type: paymentType,
        sales_person: "Current User", // Replace with actual user
        customer_name: paymentType === "loan" ? customerName : null,
        customer_phone: paymentType === "loan" ? customerPhone : null,
        notes: notes || null
      };

      const response = await fetch(`${BACKEND_URL}/api/sales-transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction)
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: `Transaction ${data.transaction_number} completed successfully`,
        });
        // Reset form
        setCartItems([]);
        setPaymentType("cash");
        setCustomerName("");
        setCustomerPhone("");
        setNotes("");
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
          <CardTitle className="text-slate-900">Available Products</CardTitle>
          <CardDescription>Select products to add to cart</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="border border-slate-200 rounded-lg p-4 hover:border-blue-400 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-slate-900">{product.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${
                    product.stock_level === "ok" ? "bg-green-100 text-green-700" :
                    product.stock_level === "low" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {product.current_stock} {product.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-blue-600">ETB {product.unit_price || 50}/{product.unit}</span>
                  <Button
                    onClick={() => addToCart(product)}
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600"
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
