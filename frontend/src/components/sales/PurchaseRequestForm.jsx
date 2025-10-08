import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { FileText, Send } from "lucide-react";
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

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

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

  const handleSubmit = async (e) => {
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
      const request = {
        description: formData.description,
        estimated_cost: parseFloat(formData.estimated_cost),
        reason: formData.reason,
        branch_id: formData.branch_id,
        requested_by: "Sales User", // Replace with actual user
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
          title: "Request Submitted",
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
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
        <Card className="lg:col-span-2 border-slate-200 shadow-md">
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
          <form onSubmit={handleSubmit} className="space-y-6">
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
                    purchase_type: "cash",
                    category: "supplies",
                    impacts_inventory: false,
                    vendor_name: "",
                    vendor_contact: ""
                  })}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-purple-500 hover:bg-purple-600"
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
    </div>
  );
};

export default PurchaseRequestForm;
