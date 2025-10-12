import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ShoppingCart, CreditCard, Banknote, Smartphone, UserX } from "lucide-react";
import { useToast } from "../../hooks/use-toast";

const SimplePOS = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [paymentType, setPaymentType] = useState("cash");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

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

  const getSelectedProductDetails = () => {
    return products.find(p => p.id === selectedProduct);
  };

  const calculateTotal = () => {
    const product = getSelectedProductDetails();
    if (!product) return 0;
    return (product.unit_price || 50) * quantity;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      toast({
        title: "Error",
        description: "Please select a product",
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

    const product = getSelectedProductDetails();
    setLoading(true);
    
    try {
      const transaction = {
        items: [{
          product_id: selectedProduct,
          product_name: product.name,
          quantity: quantity,
          unit_price: product.unit_price || 50
        }],
        payment_type: paymentType,
        sales_person: "Demo User",
        customer_name: paymentType === "loan" ? customerName : null,
        customer_phone: paymentType === "loan" ? customerPhone : null,
        notes: paymentType === "loan" ? `Loan sale to ${customerName}` : null
      };

      const response = await fetch(`${BACKEND_URL}/api/sales-transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction)
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "✅ Sale Completed",
          description: `Transaction ${data.transaction_number} - ETB ${calculateTotal()} ${paymentType === "loan" ? "(LOAN)" : ""}`,
        });
        
        // Reset form
        setSelectedProduct("");
        setQuantity(1);
        setPaymentType("cash");
        setCustomerName("");
        setCustomerPhone("");
        
        // Refresh products to show updated stock
        fetchProducts();
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

  const paymentIcons = {
    cash: Banknote,
    check: CreditCard,
    transfer: Smartphone,
    loan: UserX
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-slate-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl flex items-center gap-3">
            <ShoppingCart className="w-8 h-8" />
            Point of Sale - Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Selection */}
            <div className="space-y-2">
              <Label htmlFor="product" className="text-lg font-semibold">Select Product</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="w-full h-12 text-lg">
                  <SelectValue placeholder="Choose a flour product..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - ETB {product.unit_price || 50}/{product.unit} 
                      <span className="ml-2 text-sm text-gray-500">
                        ({product.current_stock} {product.unit} available)
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-lg font-semibold">Quantity ({getSelectedProductDetails()?.unit || "kg"})</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={getSelectedProductDetails()?.current_stock || 1000}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="h-12 text-lg"
              />
            </div>

            {/* Payment Type */}
            <div className="space-y-2">
              <Label htmlFor="payment" className="text-lg font-semibold">Payment Method</Label>
              <Select value={paymentType} onValueChange={setPaymentType}>
                <SelectTrigger className="w-full h-12 text-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">💵 Cash</SelectItem>
                  <SelectItem value="check">📝 Check</SelectItem>
                  <SelectItem value="transfer">📱 Transfer</SelectItem>
                  <SelectItem value="loan">🏦 Loan (Credit)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Customer Info for Loans */}
            {paymentType === "loan" && (
              <div className="space-y-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-800">Customer Information Required</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Full name..."
                      className="h-10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerPhone">Phone Number</Label>
                    <Input
                      id="customerPhone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Phone number..."
                      className="h-10"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Total */}
            {selectedProduct && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total Amount:</span>
                  <span className="text-blue-600">ETB {calculateTotal()}</span>
                </div>
                {paymentType === "loan" && (
                  <p className="text-sm text-red-600 mt-1">⚠️ This will be recorded as outstanding loan</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              disabled={loading || !selectedProduct}
            >
              {loading ? "Processing..." : `Complete Sale - ETB ${calculateTotal()}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimplePOS;