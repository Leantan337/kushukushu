import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { 
  Settings,
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle2,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/use-toast';

const FinancialControlSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    auto_approval_threshold: 100000,
    owner_approval_threshold: 1000000,
    multi_signature_threshold: 5000000,
    daily_limit: 5000000,
    monthly_limit: 50000000,
    notify_owner_threshold: 500000,
    emergency_approval: true,
    delegated_categories: []
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/settings/financial-controls`);
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load financial control settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/settings/financial-controls`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          updated_by: 'Owner'  // Replace with actual user
        })
      });

      if (response.ok) {
        toast({
          title: '✅ Settings Saved',
          description: 'Financial control settings updated successfully',
          variant: 'default'
        });
        await loadSettings();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.detail || 'Failed to save settings',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: field.includes('threshold') || field.includes('limit') ? parseFloat(value) || 0 : value
    }));
  };

  const formatCurrency = (amount) => `ETB ${amount?.toLocaleString() || '0'}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Settings className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-pulse" />
          <p className="text-slate-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-3 rounded-2xl">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Financial Control Settings</h1>
                <p className="text-slate-600">Configure authorization thresholds and spending limits</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">About Financial Controls</p>
                <p>These settings control when Finance can process payments directly vs. when your approval is required. Higher security for larger amounts ensures you maintain control over significant financial decisions.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Threshold Settings */}
        <Card className="border-slate-200 shadow-md">
          <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Authorization Thresholds
            </CardTitle>
            <CardDescription className="text-slate-300">
              Control when Finance needs your approval
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            
            <div>
              <Label htmlFor="auto_approval_threshold">Auto-Approval Threshold</Label>
              <Input
                id="auto_approval_threshold"
                type="number"
                min="0"
                step="1000"
                value={settings.auto_approval_threshold}
                onChange={(e) => handleChange('auto_approval_threshold', e.target.value)}
              />
              <p className="text-xs text-slate-500 mt-1">
                ✅ Payments below {formatCurrency(settings.auto_approval_threshold)} - Finance can process directly
              </p>
            </div>

            <div>
              <Label htmlFor="owner_approval_threshold">Owner Approval Required Threshold</Label>
              <Input
                id="owner_approval_threshold"
                type="number"
                min="0"
                step="1000"
                value={settings.owner_approval_threshold}
                onChange={(e) => handleChange('owner_approval_threshold', e.target.value)}
              />
              <p className="text-xs text-slate-500 mt-1">
                ⚠️ Payments above {formatCurrency(settings.owner_approval_threshold)} - Requires your fund authorization
              </p>
            </div>

            <div>
              <Label htmlFor="multi_signature_threshold">Multi-Signature Required Threshold</Label>
              <Input
                id="multi_signature_threshold"
                type="number"
                min="0"
                step="1000"
                value={settings.multi_signature_threshold}
                onChange={(e) => handleChange('multi_signature_threshold', e.target.value)}
              />
              <p className="text-xs text-slate-500 mt-1">
                🔴 Payments above {formatCurrency(settings.multi_signature_threshold)} - Requires Owner + Admin signatures
              </p>
            </div>

            <div>
              <Label htmlFor="notify_owner_threshold">Owner Notification Threshold</Label>
              <Input
                id="notify_owner_threshold"
                type="number"
                min="0"
                step="1000"
                value={settings.notify_owner_threshold}
                onChange={(e) => handleChange('notify_owner_threshold', e.target.value)}
              />
              <p className="text-xs text-slate-500 mt-1">
                📧 Notify you when Finance processes payments above this amount
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Spending Limits */}
        <Card className="border-slate-200 shadow-md">
          <CardHeader className="bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-t-xl">
            <CardTitle>Finance Spending Limits</CardTitle>
            <CardDescription className="text-amber-100">
              Set daily and monthly spending caps for Finance
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            
            <div>
              <Label htmlFor="daily_limit">Daily Spending Limit</Label>
              <Input
                id="daily_limit"
                type="number"
                min="0"
                step="1000"
                value={settings.daily_limit || ''}
                onChange={(e) => handleChange('daily_limit', e.target.value)}
                placeholder="No limit"
              />
              <p className="text-xs text-slate-500 mt-1">
                Maximum amount Finance can spend per day (leave empty for no limit)
              </p>
            </div>

            <div>
              <Label htmlFor="monthly_limit">Monthly Spending Limit</Label>
              <Input
                id="monthly_limit"
                type="number"
                min="0"
                step="1000"
                value={settings.monthly_limit || ''}
                onChange={(e) => handleChange('monthly_limit', e.target.value)}
                placeholder="No limit"
              />
              <p className="text-xs text-slate-500 mt-1">
                Maximum amount Finance can spend per month (leave empty for no limit)
              </p>
            </div>

            {/* Summary */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
              <h3 className="font-semibold text-amber-900 mb-2">Current Limits Summary</h3>
              <div className="space-y-1 text-sm text-amber-800">
                <p>Daily Limit: {settings.daily_limit ? formatCurrency(settings.daily_limit) : 'No limit set'}</p>
                <p>Monthly Limit: {settings.monthly_limit ? formatCurrency(settings.monthly_limit) : 'No limit set'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Control Flow Diagram */}
        <Card className="border-slate-200 shadow-md">
          <CardHeader>
            <CardTitle>Payment Authorization Flow</CardTitle>
            <CardDescription>How payments are processed based on amount</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-semibold text-green-900">
                    &lt; {formatCurrency(settings.auto_approval_threshold)}
                  </p>
                  <p className="text-xs text-green-700">Finance processes directly - No additional approval needed</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-900">
                    {formatCurrency(settings.auto_approval_threshold)} - {formatCurrency(settings.owner_approval_threshold)}
                  </p>
                  <p className="text-xs text-amber-700">Finance processes after PR approval chain</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <div className="flex-1">
                  <p className="font-semibold text-orange-900">
                    &gt; {formatCurrency(settings.owner_approval_threshold)}
                  </p>
                  <p className="text-xs text-orange-700">Requires Owner fund authorization before Finance can process</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <Shield className="w-5 h-5 text-red-600" />
                <div className="flex-1">
                  <p className="font-semibold text-red-900">
                    &gt; {formatCurrency(settings.multi_signature_threshold)}
                  </p>
                  <p className="text-xs text-red-700">Requires multi-signature (Owner + Admin) approval</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex gap-3">
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-lg py-6"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Settings
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="py-6"
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </Button>
        </div>

      </div>
    </div>
  );
};

export default FinancialControlSettings;

