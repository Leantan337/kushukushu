import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ArrowLeft, CheckCircle, XCircle, Clock, User, Calendar, DollarSign, Package } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { mockData } from "../../data/mockData";
import StockRequestApprovals from "./StockRequestApprovals";

const ApprovalsScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [approvals, setApprovals] = useState(mockData.approvals);
  const [filter, setFilter] = useState("All");

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "Payment": return DollarSign;
      case "Purchase": return Clock;
      case "Contract": return User;
      case "Expense": return Calendar;
      default: return Clock;
    }
  };

  const handleApprove = (id) => {
    setApprovals(prev => prev.filter(approval => approval.id !== id));
    toast({
      title: "Approved",
      description: "Request has been approved successfully",
      variant: "default"
    });
  };

  const handleReject = (id) => {
    setApprovals(prev => prev.filter(approval => approval.id !== id));
    toast({
      title: "Rejected", 
      description: "Request has been rejected",
      variant: "destructive"
    });
  };

  const filteredApprovals = filter === "All" 
    ? approvals 
    : approvals.filter(approval => approval.priority === filter);

  const ApprovalCard = ({ approval }) => {
    const TypeIcon = getTypeIcon(approval.type);
    
    return (
      <Card className="bg-white shadow-lg border-slate-200 hover:shadow-xl transition-all duration-200 hover:border-indigo-300">
        <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-xl flex items-center justify-center shadow-sm">
                <TypeIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base font-semibold text-slate-900 leading-tight">
                  {approval.title}
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">{approval.type}</p>
              </div>
            </div>
            <Badge className={getPriorityColor(approval.priority)}>
              {approval.priority}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-slate-600 font-medium mb-1">Amount</p>
              <p className="text-indigo-700 font-bold text-lg">{approval.amount}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-slate-600 font-medium mb-1">Requested By</p>
              <p className="text-slate-900 font-semibold">{approval.requestedBy}</p>
            </div>
          </div>
          
          <div className="bg-white border border-slate-200 p-3 rounded-lg">
            <p className="text-slate-600 font-medium text-sm mb-1">Description</p>
            <p className="text-slate-700 text-sm leading-relaxed">{approval.description}</p>
          </div>
          
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Submitted: {approval.date}
            </span>
          </div>
          
          <div className="flex space-x-3 pt-2 border-t border-slate-100">
            <Button
              onClick={() => handleReject(approval.id)}
              className="flex-1 h-11 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-md hover:shadow-lg transition-all"
              size="lg"
            >
              <XCircle className="w-5 h-5 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => handleApprove(approval.id)}
              className="flex-1 h-11 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all"
              size="lg"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Approve
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border border-slate-200 mx-6 mt-6 rounded-xl">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate("/dashboard")}
                className="border-slate-300 hover:bg-slate-50"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-3 rounded-xl shadow-lg">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">General Approvals</h1>
                  <p className="text-sm text-slate-600">Stock requests, purchase orders, and other approvals</p>
                </div>
              </div>
            </div>
            <Badge variant="outline" className="text-base px-4 py-2 border-indigo-300 text-indigo-700 bg-indigo-50">
              {filteredApprovals.length} Pending
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Tabs for different approval types */}
        <Tabs defaultValue="stock-requests" className="space-y-6">
          <TabsList className="bg-white border border-slate-200 p-1 rounded-lg shadow-sm">
            <TabsTrigger value="stock-requests" className="flex items-center gap-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Package className="w-4 h-4" />
              Stock Requests (Real Data)
            </TabsTrigger>
            <TabsTrigger value="other" className="flex items-center gap-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <DollarSign className="w-4 h-4" />
              Other Approvals
            </TabsTrigger>
          </TabsList>

          {/* Stock Request Approvals - REAL DATA */}
          <TabsContent value="stock-requests">
            <StockRequestApprovals />
          </TabsContent>

          {/* Other Approvals - Mock Data */}
          <TabsContent value="other" className="space-y-4">
            {/* Filter Tabs */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {["All", "High", "Medium", "Low"].map((filterOption) => (
                <Button
                  key={filterOption}
                  variant={filter === filterOption ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(filterOption)}
                  className={`whitespace-nowrap ${
                    filter === filterOption
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                      : "border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {filterOption}
                  {filterOption !== "All" && (
                    <Badge className="ml-2 bg-white text-indigo-700 text-xs">
                      {approvals.filter(a => a.priority === filterOption).length}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            {/* Approvals List */}
            {filteredApprovals.length === 0 ? (
              <Card className="bg-white shadow-lg border-slate-200">
                <CardContent className="p-12 text-center">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">All Caught Up!</h3>
                  <p className="text-slate-600">No pending approvals at the moment.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredApprovals.map((approval) => (
                  <ApprovalCard key={approval.id} approval={approval} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ApprovalsScreen;