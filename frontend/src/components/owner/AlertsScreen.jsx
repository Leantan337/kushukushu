import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  ArrowLeft, 
  Bell, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Eye, 
  CheckCircle2,
  Clock,
  Building2
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { mockData } from "../../data/mockData";

const AlertsScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState(mockData.alerts);
  const [filter, setFilter] = useState("All");

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "Critical": return "bg-red-100 text-red-800 border-red-200";
      case "High": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "Critical": return AlertTriangle;
      case "High": return AlertCircle;
      case "Medium": return Info;
      case "Low": return Bell;
      default: return Info;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "New": return "bg-red-100 text-red-800";
      case "Investigating": return "bg-yellow-100 text-yellow-800";
      case "Resolved": return "bg-green-100 text-green-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  const handleMarkAsRead = (id) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === id 
          ? { ...alert, status: alert.status === "New" ? "Investigating" : alert.status }
          : alert
      )
    );
    toast({
      title: "Alert Updated",
      description: "Alert marked as read",
      variant: "default"
    });
  };

  const handleResolve = (id) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === id 
          ? { ...alert, status: "Resolved" }
          : alert
      )
    );
    toast({
      title: "Alert Resolved",
      description: "Alert has been marked as resolved",
      variant: "default"
    });
  };

  const filteredAlerts = filter === "All" 
    ? alerts 
    : filter === "Unresolved"
      ? alerts.filter(alert => alert.status !== "Resolved")
      : alerts.filter(alert => alert.severity === filter);

  const AlertCard = ({ alert }) => {
    const SeverityIcon = getSeverityIcon(alert.severity);
    
    return (
      <Card className={`bg-white shadow-sm hover:shadow-md transition-all duration-200 ${
        alert.status === "New" ? "border-l-4 border-l-red-500" : "border-slate-200"
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                getSeverityColor(alert.severity).split(' ').slice(0, 2).join(' ')
              }`}>
                <SeverityIcon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Badge className={getSeverityColor(alert.severity)}>
                    {alert.severity}
                  </Badge>
                  <Badge className={getStatusColor(alert.status)}>
                    {alert.status}
                  </Badge>
                </div>
                <CardTitle className="text-base font-semibold text-slate-900 leading-tight">
                  {alert.title}
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">{alert.type}</p>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">{alert.branch}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">{alert.date} at {alert.time}</span>
            </div>
          </div>
          
          <div>
            <p className="text-slate-700 text-sm leading-relaxed">{alert.description}</p>
          </div>
          
          {alert.status !== "Resolved" && (
            <div className="flex space-x-3 pt-2">
              <Button
                onClick={() => handleMarkAsRead(alert.id)}
                variant="outline"
                size="sm"
                className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50"
                disabled={alert.status !== "New"}
              >
                <Eye className="w-4 h-4 mr-2" />
                {alert.status === "New" ? "Mark as Read" : "Reading"}
              </Button>
              <Button
                onClick={() => handleResolve(alert.id)}
                size="sm"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Resolve
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
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
                <h1 className="text-xl font-semibold text-slate-900">Alerts</h1>
                <p className="text-sm text-slate-600">
                  {alerts.filter(a => a.status !== "Resolved").length} active alerts
                </p>
              </div>
            </div>
            <Bell className="w-6 h-6 text-slate-600" />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Filter Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {["All", "Unresolved", "Critical", "High", "Medium"].map((filterOption) => (
            <Button
              key={filterOption}
              variant={filter === filterOption ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(filterOption)}
              className={`whitespace-nowrap ${
                filter === filterOption
                  ? "bg-slate-900 text-white"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {filterOption}
              <Badge className="ml-2 bg-white text-slate-900 text-xs">
                {filterOption === "All" 
                  ? alerts.length 
                  : filterOption === "Unresolved"
                  ? alerts.filter(a => a.status !== "Resolved").length
                  : alerts.filter(a => a.severity === filterOption).length
                }
              </Badge>
            </Button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-red-900 font-semibold text-lg">
                {alerts.filter(a => a.severity === "Critical" && a.status !== "Resolved").length}
              </p>
              <p className="text-red-700 text-sm">Critical Alerts</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4 text-center">
              <AlertCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-orange-900 font-semibold text-lg">
                {alerts.filter(a => a.severity === "High" && a.status !== "Resolved").length}
              </p>
              <p className="text-orange-700 text-sm">High Priority</p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts List */}
        {filteredAlerts.length === 0 ? (
          <Card className="bg-white shadow-sm border-slate-200">
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Alerts</h3>
              <p className="text-slate-600">Everything looks good! No alerts matching your filter.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsScreen;