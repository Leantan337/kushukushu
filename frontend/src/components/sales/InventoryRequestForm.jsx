import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Package, Send } from "lucide-react";
import { useToast } from "../../hooks/use-toast";

const InventoryRequestForm = () => {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    product_name: "",
    package_size: "50kg",
    num_packages: "",
    reason: "",
    branch_id: "berhane" // Sales chooses which branch to request from
  });
  const [loading, setLoading] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.num_packages || parseInt(formData.num_packages) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid number of packages",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Get user name from localStorage
      const userStr = localStorage.getItem('user');
      const userName = userStr ? JSON.parse(userStr).name || JSON.parse(userStr).username : "Sales User";
      
      const request = {
        product_name: formData.product_name,
        package_size: formData.package_size,
        quantity: parseInt(formData.num_packages),
        requested_by: userName,
        branch_id: formData.branch_id,
        reason: formData.reason
      };

      const response = await fetch(`${BACKEND_URL}/api/stock-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request)
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Request Submitted",
          description: `Request ${data.request_number} submitted for approval`,
        });
        // Reset form
        setFormData({
          product_name: "1st Quality 50kg",
          package_size: "50kg",
          num_packages: "",
          reason: "",
          branch_id: "sales_branch"
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
    <div className="max-w-2xl mx-auto">
      <Card className="border-slate-200 shadow-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-slate-900">Request Flour Stock</CardTitle>
              <CardDescription>Request flour from main store for your sales point</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setFormData({
                  product_name: "1st Quality Flour",
                  package_size: "50",
                  num_packages: "",
                  reason: "",
                  branch_id: "BR001"
                })}
              >
                Reset
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-green-500 hover:bg-green-600"
                disabled={loading}
              >
                <Send className="w-4 h-4 mr-2" />
                {loading ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryRequestForm;
