import React, { useState } from "react";
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
    product_name: "1st Quality Flour",
    package_size: "50",
    num_packages: "",
    reason: "",
    branch_id: "BR001"
  });
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  const packageSizes = [
    { value: "50", label: "50 kg" },
    { value: "25", label: "25 kg" },
    { value: "10", label: "10 kg" },
    { value: "5", label: "5 kg" }
  ];

  const products = [
    { value: "1st Quality Flour", label: "1st Quality Flour" },
    { value: "Bread Flour", label: "Bread Flour" },
    { value: "Fruska", label: "Fruska" },
    { value: "Fruskelo", label: "Fruskelo" }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotalWeight = () => {
    return parseInt(formData.package_size || 0) * parseInt(formData.num_packages || 0);
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
      const request = {
        product_name: formData.product_name,
        package_size: parseInt(formData.package_size),
        num_packages: parseInt(formData.num_packages),
        reason: formData.reason,
        branch_id: formData.branch_id,
        requested_by: "Current User" // Replace with actual user
      };

      const response = await fetch(`${BACKEND_URL}/api/inventory-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request)
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: `Request ${data.request_number} submitted successfully`,
        });
        // Reset form
        setFormData({
          product_name: "1st Quality Flour",
          package_size: "50",
          num_packages: "",
          reason: "",
          branch_id: "BR001"
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
            <div className="space-y-2">
              <Label htmlFor="product_name">Product Type</Label>
              <Select 
                value={formData.product_name} 
                onValueChange={(value) => handleChange("product_name", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.value} value={product.value}>
                      {product.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  {formData.num_packages} packages × {formData.package_size} kg
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
