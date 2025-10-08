import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Building2, Lock, User, UserCircle } from "lucide-react";

const UnifiedLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const navigate = useNavigate();

  const roles = [
    { value: "owner", label: "Owner", route: "/dashboard" },
    { value: "admin", label: "Admin", route: "/admin/dashboard" },
    { value: "finance", label: "Finance", route: "/finance/dashboard" },
    { value: "manager", label: "Manager", route: "/manager/dashboard" },
    { value: "sales", label: "Sales", route: "/sales/dashboard" },
    { value: "storekeeper", label: "Store Keeper", route: "/storekeeper/dashboard" }
  ];

  const handleCredentialsSubmit = (e) => {
    e.preventDefault();
    // Mock authentication - in real app would validate credentials
    if (username && password) {
      setShowRoleSelection(true);
    }
  };

  const handleRoleSelection = () => {
    if (selectedRole) {
      const role = roles.find(r => r.value === selectedRole);
      if (role) {
        navigate(role.route);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl flex items-center justify-center shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              {showRoleSelection ? "Select Your Role" : "Flour Factory ERP"}
            </CardTitle>
            <CardDescription className="text-slate-600 mt-2">
              {showRoleSelection 
                ? "Choose your role to continue" 
                : "Wheat Flour Factory Management System - Adigrat"}
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          {!showRoleSelection ? (
            // Credentials Form
            <form onSubmit={handleCredentialsSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-700 font-medium">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors duration-200"
              >
                Continue
              </Button>
            </form>
          ) : (
            // Role Selection
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-slate-700 font-medium flex items-center">
                  <UserCircle className="w-5 h-5 mr-2" />
                  Select Role
                </Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400">
                    <SelectValue placeholder="Choose your role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-3">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowRoleSelection(false);
                    setSelectedRole("");
                  }}
                  className="flex-1 h-12 border-slate-200 hover:bg-slate-50"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleRoleSelection}
                  disabled={!selectedRole}
                  className="flex-1 h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Login
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedLogin;
