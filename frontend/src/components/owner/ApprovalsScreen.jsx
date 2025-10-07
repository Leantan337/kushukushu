import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ArrowLeft, CheckCircle, XCircle, Clock, User, Calendar, DollarSign } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { mockData } from "../../data/mockData";

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
      <Card className="bg-white shadow-sm border-slate-200 hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                <TypeIcon className="w-5 h-5 text-slate-600" />
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
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-slate-500 font-medium">Amount</p>
              <p className="text-slate-900 font-semibold">{approval.amount}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Requested By</p>
              <p className="text-slate-900 font-semibold">{approval.requestedBy}</p>
            </div>
          </div>
          
          <div>
            <p className="text-slate-500 font-medium text-sm">Description</p>
            <p className="text-slate-700 text-sm mt-1 leading-relaxed">{approval.description}</p>
          </div>
          
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Submitted: {approval.date}</span>
          </div>
          
          <div className="flex space-x-3 pt-2">
            <Button
              onClick={() => handleReject(approval.id)}
              variant="outline"
              className="flex-1 h-10 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => handleApprove(approval.id)}
              className="flex-1 h-10 bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </div>
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
                <h1 className="text-xl font-semibold text-slate-900">Approvals</h1>
                <p className="text-sm text-slate-600">{filteredApprovals.length} pending requests</p>
              </div>
            </div>
            <CheckCircle className="w-6 h-6 text-slate-600" />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
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
                  ? "bg-slate-900 text-white"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {filterOption}
              {filterOption !== "All" && (
                <Badge className="ml-2 bg-white text-slate-900 text-xs">
                  {approvals.filter(a => a.priority === filterOption).length}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Approvals List */}
        {filteredApprovals.length === 0 ? (
          <Card className="bg-white shadow-sm border-slate-200">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">All Caught Up!</h3>
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
      </div>
    </div>
  );
};

export default ApprovalsScreen;