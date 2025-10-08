import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { ArrowLeft, Settings, Save, RotateCcw } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { mockData } from "../../data/mockData";

const RatioConfiguration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [ratios, setRatios] = useState({
    flour: 70,
    fruska: 25,
    fruskelo: 3,
    waste: 2
  });

  const handleRatioChange = (type, value) => {
    const numValue = parseFloat(value) || 0;
    setRatios(prev => ({
      ...prev,
      [type]: numValue
    }));
  };

  const getTotalPercentage = () => {
    return ratios.flour + ratios.fruska + ratios.fruskelo + ratios.waste;
  };

  const handleSave = () => {
    if (!selectedBranch || !selectedProduct) {
      toast({
        title: "Missing Information",
        description: "Please select both branch and product",
        variant: "destructive"
      });
      return;
    }

    const total = getTotalPercentage();
    if (Math.abs(total - 100) > 0.1) {
      toast({
        title: "Invalid Ratios",
        description: `Total must equal 100%. Current total: ${total.toFixed(1)}%`,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Configuration Saved",
      description: `Ratios updated for ${selectedProduct} at ${selectedBranch} branch`,
      variant: "default"
    });
  };

  const resetRatios = () => {
    setRatios({ flour: 70, fruska: 25, fruskelo: 3, waste: 2 });
  };

  const isValidConfiguration = () => {
    const total = getTotalPercentage();
    return selectedBranch && selectedProduct && Math.abs(total - 100) < 0.1;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="border-slate-200"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Ratio Configuration</h1>
                <p className="text-sm text-slate-600">Set output percentages by branch and product</p>
              </div>
            </div>
            <Settings className="w-6 h-6 text-slate-600" />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Selection Cards */}
        <div className="grid gap-4">
          <Card className="bg-white shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Branch Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger className="h-12 border-slate-200">
                  <SelectValue placeholder="Select a branch" />
                </SelectTrigger>
                <SelectContent>
                  {mockData.ratioConfig.branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.name}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Product Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="h-12 border-slate-200">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {mockData.ratioConfig.products.map((product) => (
                    <SelectItem key={product.id} value={product.name}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Ratio Configuration */}
        {selectedBranch && selectedProduct && (
          <Card className="bg-white shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-900">
                Output Ratios
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={resetRatios}
                className="border-slate-200"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Configuration for</p>
                <p className="font-semibold text-slate-900">{selectedProduct} - {selectedBranch}</p>
              </div>

              <div className="space-y-4">
                {/* Flour Ratio */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-slate-700 font-medium">Flour (%)</Label>
                    <span className="text-sm font-semibold text-slate-900">{ratios.flour}%</span>
                  </div>
                  <Input
                    type="number"
                    value={ratios.flour}
                    onChange={(e) => handleRatioChange('flour', e.target.value)}
                    className="h-12 border-slate-200"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>

                {/* Fruska Ratio */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-slate-700 font-medium">Fruska (%)</Label>
                    <span className="text-sm font-semibold text-slate-900">{ratios.fruska}%</span>
                  </div>
                  <Input
                    type="number"
                    value={ratios.fruska}
                    onChange={(e) => handleRatioChange('fruska', e.target.value)}
                    className="h-12 border-slate-200"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>

                {/* Fruskelo Ratio */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-slate-700 font-medium">Fruskelo (%)</Label>
                    <span className="text-sm font-semibold text-slate-900">{ratios.fruskelo}%</span>
                  </div>
                  <Input
                    type="number"
                    value={ratios.fruskelo}
                    onChange={(e) => handleRatioChange('fruskelo', e.target.value)}
                    className="h-12 border-slate-200"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>

                {/* Waste Ratio */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-slate-700 font-medium">Waste (%)</Label>
                    <span className="text-sm font-semibold text-slate-900">{ratios.waste}%</span>
                  </div>
                  <Input
                    type="number"
                    value={ratios.waste}
                    onChange={(e) => handleRatioChange('waste', e.target.value)}
                    className="h-12 border-slate-200"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
              </div>

              {/* Total Validation */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-700">Total Percentage:</span>
                  <span className={`font-bold ${
                    Math.abs(getTotalPercentage() - 100) < 0.1 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {getTotalPercentage().toFixed(1)}%
                  </span>
                </div>
                {Math.abs(getTotalPercentage() - 100) > 0.1 && (
                  <p className="text-sm text-red-600 mt-1">
                    Total must equal 100%
                  </p>
                )}
              </div>

              <Button
                onClick={handleSave}
                disabled={!isValidConfiguration()}
                className={`w-full h-12 font-medium transition-colors duration-200 ${
                  isValidConfiguration()
                    ? 'bg-slate-900 hover:bg-slate-800 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Configuration
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RatioConfiguration;