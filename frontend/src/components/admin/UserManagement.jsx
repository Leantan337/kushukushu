import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Shield,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  MoreVertical
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";

const UserManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@factory.com",
      phone: "+234 901 234 5678",
      role: "Sales",
      branch: "Berhane Branch",
      status: "Active",
      lastLogin: "2025-01-15 09:30",
      dateCreated: "2024-12-01"
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.johnson@factory.com", 
      phone: "+234 902 234 5679",
      role: "Finance",
      branch: "Both Branches",
      status: "Active",
      lastLogin: "2025-01-15 10:15",
      dateCreated: "2024-11-15"
    },
    {
      id: 3,
      name: "Michael Chen",
      email: "michael.chen@factory.com",
      phone: "+234 903 234 5680", 
      role: "Manager",
      branch: "Girmay Branch",
      status: "Active",
      lastLogin: "2025-01-15 08:45",
      dateCreated: "2024-10-20"
    },
    {
      id: 4,
      name: "Emma Wilson",
      email: "emma.wilson@factory.com",
      phone: "+234 904 234 5681",
      role: "Store Keeper", 
      branch: "Berhane Branch",
      status: "Active",
      lastLogin: "2025-01-14 16:30",
      dateCreated: "2024-12-10"
    },
    {
      id: 5,
      name: "David Brown",
      email: "david.brown@factory.com",
      phone: "+234 905 234 5682",
      role: "Sales",
      branch: "Girmay Branch", 
      status: "Inactive",
      lastLogin: "2025-01-10 14:20",
      dateCreated: "2024-09-15"
    }
  ]);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    branch: "",
    password: ""
  });

  const roles = ["Admin", "Finance", "Manager", "Sales", "Store Keeper"];
  const branches = ["Berhane Branch", "Girmay Branch", "Both Branches"];

  const getRoleColor = (role) => {
    const colors = {
      "Admin": "bg-red-100 text-red-800",
      "Finance": "bg-green-100 text-green-800", 
      "Manager": "bg-blue-100 text-blue-800",
      "Sales": "bg-purple-100 text-purple-800",
      "Store Keeper": "bg-orange-100 text-orange-800"
    };
    return colors[role] || "bg-slate-100 text-slate-800";
  };

  const getStatusColor = (status) => {
    return status === "Active" 
      ? "bg-green-100 text-green-800" 
      : "bg-red-100 text-red-800";
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "All" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.email || !newUser.role || !newUser.branch) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const user = {
      id: users.length + 1,
      ...newUser,
      status: "Active",
      lastLogin: "Never",
      dateCreated: new Date().toISOString().split('T')[0]
    };

    setUsers([...users, user]);
    setNewUser({ name: "", email: "", phone: "", role: "", branch: "", password: "" });
    setIsCreateDialogOpen(false);
    
    toast({
      title: "User Created",
      description: `${user.name} has been added to the system`,
      variant: "default"
    });
  };

  const handleDeleteUser = (userId) => {
    setUsers(users.filter(user => user.id !== userId));
    toast({
      title: "User Deleted",
      description: "User has been removed from the system",
      variant: "default"
    });
  };

  const toggleUserStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === "Active" ? "Inactive" : "Active" }
        : user
    ));
    
    const user = users.find(u => u.id === userId);
    toast({
      title: "Status Updated",
      description: `${user.name} is now ${user.status === "Active" ? "Inactive" : "Active"}`,
      variant: "default"
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate("/admin/dashboard")}
                className="border-slate-200 hover:bg-slate-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
                <p className="text-slate-600">Manage user accounts and permissions</p>
              </div>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>
                    Add a new user to the factory management system
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                      placeholder="Enter full name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      placeholder="Enter email address"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                      placeholder="Enter phone number"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Branch Access</Label>
                    <Select value={newUser.branch} onValueChange={(value) => setNewUser({...newUser, branch: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Initial Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      placeholder="Enter initial password"
                    />
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateUser}
                      className="flex-1 bg-slate-900 hover:bg-slate-800"
                    >
                      Create User
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Filters and Search */}
        <Card className="bg-white shadow-lg border-slate-200">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-slate-200"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Roles</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Badge className="bg-slate-100 text-slate-800">
                  {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-white shadow-lg border-slate-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900 flex items-center">
              <Shield className="w-6 h-6 mr-3" />
              System Users ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                        <User className="w-6 h-6 text-slate-600" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-bold text-slate-900">{user.name}</h3>
                          <Badge className={getRoleColor(user.role)}>
                            {user.role}
                          </Badge>
                          <Badge className={getStatusColor(user.status)}>
                            {user.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                          <div className="flex items-center space-x-1">
                            <Mail className="w-4 h-4" />
                            <span>{user.email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone className="w-4 h-4" />
                            <span>{user.phone}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{user.branch}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-slate-500">
                          <span>Last login: {user.lastLogin}</span>
                          <span>•</span>
                          <span>Created: {user.dateCreated}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleUserStatus(user.id)}
                        className={`border-slate-200 ${
                          user.status === "Active" 
                            ? "hover:bg-red-50 hover:border-red-200 hover:text-red-700" 
                            : "hover:bg-green-50 hover:border-green-200 hover:text-green-700"
                        }`}
                      >
                        {user.status === "Active" ? "Deactivate" : "Activate"}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-200 hover:bg-slate-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserManagement;