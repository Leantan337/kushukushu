import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  ArrowLeft,
  FileBarChart,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Download,
  Filter
} from "lucide-react";
import { mockData } from "../../data/mockData";

const ReportsScreen = () => {
  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] = useState("sales");

  const ReportCard = ({ title, description, type, icon: Icon, isActive, onClick }) => (
    <Card 
      className={`cursor-pointer transition-all duration-200 ${
        isActive 
          ? 'bg-slate-900 text-white shadow-lg' 
          : 'bg-white shadow-sm border-slate-200 hover:shadow-md'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            isActive ? 'bg-white bg-opacity-20' : 'bg-slate-100'
          }`}>
            <Icon className={`w-5 h-5 ${
              isActive ? 'text-white' : 'text-slate-700'
            }`} />
          </div>
          <div>
            <h3 className={`font-semibold ${
              isActive ? 'text-white' : 'text-slate-900'
            }`}>{title}</h3>
            <p className={`text-sm ${
              isActive ? 'text-slate-200' : 'text-slate-600'
            }`}>{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const SalesReport = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-700">Total Sales (6 months)</p>
          <p className="text-2xl font-bold text-green-900">ETB 334M</p>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">Average Monthly</p>
          <p className="text-2xl font-bold text-blue-900">ETB 55.7M</p>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-700">Growth Rate</p>
          <p className="text-2xl font-bold text-purple-900">+12.5%</p>
        </div>
      </div>
      
      {mockData.reports.salesTrends.map((item, index) => (
        <Card key={index} className="bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-slate-900">{item.month}</p>
                <p className="text-sm text-slate-600">Sales: ETB {(item.sales / 1000000).toFixed(1)}M</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">Target: ETB {(item.target / 1000000).toFixed(1)}M</p>
                <Badge variant={item.sales >= item.target ? "default" : "secondary"}>
                  {item.sales >= item.target ? "Target Met" : "Below Target"}
                </Badge>
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-slate-800 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((item.sales / item.target) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const ProductionReport = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-amber-50 rounded-lg">
          <p className="text-sm text-amber-700">Total Production (6 months)</p>
          <p className="text-2xl font-bold text-amber-900">1,125 tons</p>
        </div>
        <div className="text-center p-4 bg-indigo-50 rounded-lg">
          <p className="text-sm text-indigo-700">Avg Efficiency</p>
          <p className="text-2xl font-bold text-indigo-900">90.7%</p>
        </div>
      </div>
      
      {mockData.reports.productionTrends.map((item, index) => (
        <Card key={index} className="bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-slate-900">{item.month}</p>
                <p className="text-sm text-slate-600">{(item.production / 1000).toFixed(0)} tons produced</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-slate-900">{item.efficiency}%</p>
                <p className="text-sm text-slate-600">Efficiency</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const ProfitLossReport = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-700">Total Revenue</p>
          <p className="text-2xl font-bold text-green-900">ETB 334M</p>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <p className="text-sm text-red-700">Total Costs</p>
          <p className="text-2xl font-bold text-red-900">ETB 241M</p>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">Net Profit</p>
          <p className="text-2xl font-bold text-blue-900">ETB 93M</p>
        </div>
      </div>
      
      {mockData.reports.profitLoss.map((item, index) => (
        <Card key={index} className="bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-slate-900">{item.month}</p>
                <p className="text-lg font-bold text-green-600">ETB {(item.profit / 1000000).toFixed(1)}M</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Revenue:</span>
                  <span className="text-slate-900">ETB {(item.revenue / 1000000).toFixed(1)}M</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Costs:</span>
                  <span className="text-slate-900">ETB {(item.costs / 1000000).toFixed(1)}M</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-slate-700">Margin:</span>
                  <span className="text-green-700">{((item.profit / item.revenue) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const CustomerCreditReport = () => (
    <div className="space-y-4">
      <div className="text-center p-4 bg-red-50 rounded-lg mb-6">
        <p className="text-sm text-red-700">Total Outstanding</p>
        <p className="text-2xl font-bold text-red-900">ETB 3.24M</p>
      </div>
      
      {mockData.reports.customerCredits.map((item, index) => (
        <Card key={index} className="bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-slate-900">{item.customer}</p>
                <p className="text-sm text-slate-600">ETB {(item.amount / 1000).toFixed(0)}K outstanding</p>
              </div>
              <div className="text-right">
                <Badge variant={item.daysOverdue > 20 ? "destructive" : item.daysOverdue > 10 ? "secondary" : "default"}>
                  {item.daysOverdue} days
                </Badge>
                <p className="text-xs text-slate-500 mt-1">overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderSelectedReport = () => {
    switch (selectedReport) {
      case "sales":
        return <SalesReport />;
      case "production":
        return <ProductionReport />;
      case "profit":
        return <ProfitLossReport />;
      case "credit":
        return <CustomerCreditReport />;
      default:
        return <SalesReport />;
    }
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
                <h1 className="text-xl font-semibold text-slate-900">Reports & Analytics</h1>
                <p className="text-sm text-slate-600">Historical trends and insights</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="border-slate-200">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="border-slate-200">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Report Selection */}
        <div className="grid gap-3">
          <ReportCard
            title="Sales Trends"
            description="Monthly sales performance vs targets"
            type="sales"
            icon={DollarSign}
            isActive={selectedReport === "sales"}
            onClick={() => setSelectedReport("sales")}
          />
          <ReportCard
            title="Production Analysis"
            description="Production volumes and efficiency metrics"
            type="production"
            icon={TrendingUp}
            isActive={selectedReport === "production"}
            onClick={() => setSelectedReport("production")}
          />
          <ReportCard
            title="Profit & Loss"
            description="Revenue, costs, and profit margins"
            type="profit"
            icon={FileBarChart}
            isActive={selectedReport === "profit"}
            onClick={() => setSelectedReport("profit")}
          />
          <ReportCard
            title="Customer Credits"
            description="Outstanding receivables and overdue accounts"
            type="credit"
            icon={Users}
            isActive={selectedReport === "credit"}
            onClick={() => setSelectedReport("credit")}
          />
        </div>

        {/* Selected Report Content */}
        <div>
          {renderSelectedReport()}
        </div>
      </div>
    </div>
  );
};

export default ReportsScreen;