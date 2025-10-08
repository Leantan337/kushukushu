import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { FileText, Send } from "lucide-react";
import { useToast } from "../ui/use-toast";

const PurchaseRequestForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    description: "",
    estimated_cost: "",
    reason: "",
    branch_id: "BR001"
  });
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = import.meta.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL;

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
        requested_by: "Current User" // Replace with actual user
      };

      const response = await fetch(`${BACKEND_URL}/api/purchase-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request)
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: `Request ${data.requisition_number} submitted successfully`,
        });
        // Reset form
        setFormData({
          description: "",
          estimated_cost: "",
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
                    branch_id: "BR001"
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
