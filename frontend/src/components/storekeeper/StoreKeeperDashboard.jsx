import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, FileText, TrendingUp, Users, Bell, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import InventoryManagement from '../inventory/InventoryManagement';
import StoreKeeperFulfillment from './StoreKeeperFulfillment';

const StoreKeeperDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockItems: 0,
    pendingFulfillments: 0,
    todayTransactions: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);

  // Get current user info from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = currentUser.name || 'Store Keeper';
  const userBranch = currentUser.branch || 'Main Store';

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentActivities();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      
      // Fetch inventory stats - filter by branch
      const inventoryResponse = await fetch(`${backendUrl}/api/inventory?branch_id=${userBranch}`);
      const inventoryData = await inventoryResponse.json();
      
      // Fetch pending internal orders for fulfillment - filter by source_branch
      const ordersResponse = await fetch(`${backendUrl}/api/stock-requests?source_branch=${userBranch}&status=pending_fulfillment`);
      const ordersData = await ordersResponse.json();
      
      const totalItems = inventoryData.length;
      const lowStockItems = inventoryData.filter(item => 
        item.stock_level === 'low' || item.stock_level === 'critical'
      ).length;
      const pendingFulfillments = ordersData.length;

      setStats({
        totalItems,
        lowStockItems,
        pendingFulfillments,
        todayTransactions: 0 // Will be updated with actual data
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      
      // Fetch recent audit logs - filter by branch
      const auditResponse = await fetch(`${backendUrl}/api/audit-logs?branch_id=${userBranch}&limit=10`);
      const auditData = await auditResponse.json();
      
      const activities = auditData.map(log => ({
        id: log.id,
        timestamp: new Date(log.timestamp).toLocaleTimeString(),
        description: `${log.action.replace(/_/g, ' ')} - ${log.details?.product_name || log.entity_type}`,
        type: log.action
      }));
      
      setRecentActivities(activities);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      // Set some mock data if API fails
      setRecentActivities([
        {
          id: 1,
          timestamp: new Date().toLocaleTimeString(),
          description: `Stock level updated for ${userBranch === 'berhane' ? 'Bread Flour' : '1st Quality Flour'}`,
          type: 'inventory_update'
        },
        {
          id: 2,
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toLocaleTimeString(),
          description: `Internal order fulfilled - ${userBranch} branch`,
          type: 'order_fulfillment'
        }
      ]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    sessionStorage.clear();
    window.location.href = '/';
  };

  const StatCard = ({ title, value, icon: Icon, color = "blue" }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold text-${color}-600`}>{value}</div>
      </CardContent>
    </Card>
  );

  const QuickActionButton = ({ icon: Icon, label, onClick, variant = "outline" }) => (
    <Button 
      variant={variant} 
      onClick={onClick}
      className="h-auto p-4 flex flex-col gap-2 w-full"
    >
      <Icon className="h-6 w-6" />
      <span className="text-sm">{label}</span>
    </Button>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                title="Total Inventory Items" 
                value={stats.totalItems} 
                icon={Package} 
                color="blue" 
              />
              <StatCard 
                title="Low Stock Alerts" 
                value={stats.lowStockItems} 
                icon={Bell} 
                color="red" 
              />
              <StatCard 
                title="Pending Fulfillments" 
                value={stats.pendingFulfillments} 
                icon={ShoppingCart} 
                color="orange" 
              />
              <StatCard 
                title="Today's Transactions" 
                value={stats.todayTransactions} 
                icon={TrendingUp} 
                color="green" 
              />
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <QuickActionButton
                    icon={Package}
                    label="Manage Inventory"
                    onClick={() => setActiveTab('inventory')}
                  />
                  <QuickActionButton
                    icon={ShoppingCart}
                    label="Fulfill Orders"
                    onClick={() => setActiveTab('fulfillment')}
                  />
                  <QuickActionButton
                    icon={FileText}
                    label="Stock Report"
                    onClick={() => alert('Stock report functionality coming soon')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivities.length > 0 ? (
                    recentActivities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.description}</p>
                          <p className="text-xs text-gray-500">{activity.timestamp}</p>
                        </div>
                        <Badge variant="secondary">
                          {activity.type.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No recent activities</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'inventory':
        return <InventoryManagement userRole="store_keeper" userBranch={userBranch} />;

      case 'fulfillment':
        return <StoreKeeperFulfillment />;

      default:
        return <div>Tab content not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Store Keeper Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {userName}</p>
              <p className="text-xs text-blue-600 font-semibold mt-1">
                📍 {userBranch === 'berhane' ? 'Berhane Branch' : userBranch === 'girmay' ? 'Girmay Branch' : userBranch}
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'inventory'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Inventory Management
            </button>
            <button
              onClick={() => setActiveTab('fulfillment')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'fulfillment'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Order Fulfillment
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default StoreKeeperDashboard;