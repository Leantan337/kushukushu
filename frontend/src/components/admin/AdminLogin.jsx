import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Shield, Lock, User } from "lucide-react";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Mock login - in real app would validate credentials
    if (username && password) {
      navigate("/admin/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-lg shadow-2xl border-0 bg-white/95 backdrop-blur">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="mx-auto w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-slate-900">Admin Portal</CardTitle>
            <CardDescription className="text-slate-600 mt-3 text-lg">
              Wheat Flour Factory - Central Management System
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="username" className="text-slate-700 font-semibold text-base">
                Admin Username
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-12 h-14 text-base border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                  placeholder="Enter admin username"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="password" className="text-slate-700 font-semibold text-base">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 h-14 text-base border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                  placeholder="Enter admin password"
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-base transition-colors duration-200"
            >
              Access Admin Dashboard
            </Button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-slate-500 text-sm">
              Secure access to factory management system
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;