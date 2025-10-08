import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  CreditCard, 
  ArrowRight,
  Play,
  BarChart3
} from 'lucide-react';

const DemoLanding = () => {
  const navigate = useNavigate();

  const demoPages = [
    {
      id: 'pos',
      title: 'Point of Sale (POS)',
      description: 'Simple sales interface with loan payment support',
      icon: ShoppingCart,
      color: 'bg-blue-500 hover:bg-blue-600',
      route: '/demo/pos',
      demoScript: '1. Select flour product → 2. Set quantity → 3. Choose "Loan" payment → 4. Enter customer info → 5. Complete sale'
    },
    {
      id: 'inventory',
      title: 'Inventory Dashboard',
      description: 'Real-time stock levels and product tracking',
      icon: Package,
      color: 'bg-green-500 hover:bg-green-600',
      route: '/demo/inventory',
      demoScript: 'View live inventory levels → See stock deductions after sales → Monitor low stock alerts'
    },
    {
      id: 'sales',
      title: 'Sales Dashboard',
      description: 'Today\'s sales performance and metrics',
      icon: TrendingUp,
      color: 'bg-purple-500 hover:bg-purple-600',
      route: '/demo/sales',
      demoScript: 'Check today\'s total sales → View cash vs credit breakdown → Monitor transaction count'
    },
    {
      id: 'finance',
      title: 'Finance Dashboard',
      description: 'Outstanding loans and receivables tracking',
      icon: CreditCard,
      color: 'bg-red-500 hover:bg-red-600',
      route: '/demo/finance',
      demoScript: 'View total outstanding loans → See loan customer details → Track recent credit sales'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Flour Factory ERP - Demo Showcase
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Vertical Slice Demo: End-to-End Sales Workflow
          </p>
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Play className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Demo Workflow</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="font-semibold text-blue-800 mb-1">Step 1: Make Sale</div>
                <div className="text-blue-600">Create loan transaction in POS</div>
              </div>
              <ArrowRight className="mx-auto text-gray-400 hidden md:block mt-8" />
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="font-semibold text-green-800 mb-1">Step 2: Check Inventory</div>
                <div className="text-green-600">Verify stock deduction</div>
              </div>
              <ArrowRight className="mx-auto text-gray-400 hidden md:block mt-8" />
              <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="font-semibold text-purple-800 mb-1">Step 3: View Sales</div>
                <div className="text-purple-600">See increased total sales</div>
              </div>
              <ArrowRight className="mx-auto text-gray-400 hidden md:block mt-8" />
              <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="font-semibold text-red-800 mb-1">Step 4: Check Finance</div>
                <div className="text-red-600">Verify outstanding loans</div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {demoPages.map((page) => {
            const IconComponent = page.icon;
            return (
              <Card key={page.id} className="border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${page.color}`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-gray-900">{page.title}</CardTitle>
                      <p className="text-gray-600">{page.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Demo Script:
                    </h4>
                    <p className="text-sm text-gray-600">{page.demoScript}</p>
                  </div>
                  <Button 
                    onClick={() => navigate(page.route)}
                    className={`w-full ${page.color} text-white font-semibold py-3`}
                  >
                    Open {page.title}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Navigation */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Demo Navigation</h3>
          <div className="flex flex-wrap gap-3">
            {demoPages.map((page) => (
              <Button 
                key={page.id}
                variant="outline"
                onClick={() => navigate(page.route)}
                className="flex items-center gap-2"
              >
                <page.icon className="w-4 h-4" />
                {page.title}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoLanding;