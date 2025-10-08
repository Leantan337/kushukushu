import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  ArrowLeft,
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  Clock,
  Building2,
  Shield
} from "lucide-react";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { mockData } from "../../data/mockData";

const UserManagementScreen = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBranch, setFilterBranch] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredUsers = mockData.users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = filterBranch === "all" || user.branch === filterBranch;
    const matchesStatus = filterStatus === "all" || user.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesBranch && matchesStatus;
  });

  const getStatusColor = (status) => {
    return status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "Branch Manager":
        return <Building2 className="w-4 h-4" />;
      case "Finance Officer":
        return <Shield className="w-4 h-4" />;
      default:
        return <UserCheck className="w-4 h-4" />;
    }
  };

  const formatLastActivity = (activity) => {
    const [date, time] = activity.split(' ');
    return { date, time };
  };

  const UserCard = ({ user }) => {
    const { date, time } = formatLastActivity(user.lastActivity);
    
    return (
      <Card className="bg-white shadow-sm border-slate-200 hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* User Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center">
                  {getRoleIcon(user.role)}
                  <span className="text-white text-sm font-semibold ml-1">
                    {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{user.name}</h3>
                  <p className="text-sm text-slate-600">{user.role}</p>
                </div>
              </div>
              <Badge className={getStatusColor(user.status)}>
                {user.status}
              </Badge>
            </div>

            {/* User Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2 text-sm">
                <Building2 className="w-4 h-4 text-slate-500" />
                <span className="text-slate-700">{user.branch}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4 text-slate-500" />
                <span className="text-slate-700">{time}</span>
              </div>
            </div>

            {/* Last Activity */}
            <div className="p-2 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Last Activity</span>
                <span className="text-xs font-medium text-slate-900">{date}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const StatsCard = ({ title, value, icon: Icon, color }) => (
    <Card className="bg-white shadow-sm border-slate-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-600 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          </div>
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const activeUsers = mockData.users.filter(user => user.status === "Active").length;
  const totalUsers = mockData.users.length;
  const berhaneBranchUsers = mockData.users.filter(user => user.branch.includes("Berhane")).length;
  const girmayBranchUsers = mockData.users.filter(user => user.branch.includes("Girmay")).length;

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
                <h1 className="text-xl font-semibold text-slate-900">User Management</h1>
                <p className="text-sm text-slate-600">Staff overview and activity monitoring</p>
              </div>
            </div>
            <Users className="w-6 h-6 text-slate-600" />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <StatsCard
            title="Total Users"
            value={totalUsers}
            icon={Users}
            color="bg-blue-600"
          />
          <StatsCard
            title="Active Now"
            value={activeUsers}
            icon={UserCheck}
            color="bg-green-600"
          />
        </div>

        {/* Branch Distribution */}
        <Card className="bg-white shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Branch Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-2 bg-amber-50 rounded-lg">
              <span className="text-sm font-medium text-amber-800">Berhane Branch</span>
              <span className="font-semibold text-amber-900">{berhaneBranchUsers} users</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-blue-800">Girmay Branch</span>
              <span className="font-semibold text-blue-900">{girmayBranchUsers} users</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-purple-800">Both Branches</span>
              <span className="font-semibold text-purple-900">
                {mockData.users.filter(user => user.branch === "Both Branches").length} users
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search by name or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 border-slate-200"
              />
            </div>
            <Filter className="w-5 h-5 text-slate-500" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Select value={filterBranch} onValueChange={setFilterBranch}>
              <SelectTrigger className="h-12 border-slate-200">
                <SelectValue placeholder="Filter by branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                <SelectItem value="Berhane Branch">Berhane Branch</SelectItem>
                <SelectItem value="Girmay Branch">Girmay Branch</SelectItem>
                <SelectItem value="Both Branches">Both Branches</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-12 border-slate-200">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-900">
              Staff Members ({filteredUsers.length})
            </h2>
          </div>
          
          <div className="grid gap-4">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <UserCard key={user.id} user={user} />
              ))
            ) : (
              <Card className="bg-white shadow-sm border-slate-200">
                <CardContent className="p-8 text-center">
                  <UserX className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No users found matching your criteria</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementScreen;