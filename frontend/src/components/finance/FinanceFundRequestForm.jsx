import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Badge } from '../ui/badge';
import { 
  AlertCircle,
  Send,
  XCircle,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const FinanceFundRequestForm = ({ purchaseRequisition, onClose, onSuccess }) => {
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    payment_urgency: 'normal',
    justification: '',
    supporting_documents: []
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.justification) {
      toast({
        title: 'Missing Information',
        description: 'Please provide justification for fund request',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/finance/request-funds/${purchaseRequisition.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            purchase_requisition_id: purchaseRequisition.id,
            amount: purchaseRequisition.estimated_cost,
            requested_by: 'Finance Officer',  // Replace with actual user
            payment_urgency: formData.payment_urgency,
            justification: formData.justification,
            supporting_documents: formData.supporting_documents
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast({
          title: '✅ Fund Request Submitted',
          description: `Request ${data.request_number} submitted to Owner for approval`,
          variant: 'default'
        });

        if (onSuccess) onSuccess();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.detail || 'Failed to submit fund request',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error submitting fund request:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit fund request',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => `ETB ${amount?.toLocaleString() || '0'}`;

  return (
    <Card className="border-amber-300 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-amber-600 to-amber-700 text-white">
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-6 h-6" />
          Owner Fund Authorization Required
        </CardTitle>
        <CardDescription className="text-amber-100">
          This payment exceeds your authorization limit
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Amount Alert */}
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-6 h-6 text-amber-600" />
              <div>
                <h3 className="font-semibold text-amber-900">Payment Amount</h3>
                <p className="text-3xl font-bold text-amber-600 mt-1">
                  {formatCurrency(purchaseRequisition?.estimated_cost)}
                </p>
              </div>
            </div>
            <p className="text-sm text-amber-700">
              This amount requires Owner approval before you can process payment.
            </p>
          </div>

          {/* Purchase Details */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-3">Purchase Request</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">PR Number:</span>
                <Badge variant="outline">{purchaseRequisition?.request_number}</Badge>
              </div>
              <div>
                <span className="text-slate-600 block mb-1">Description:</span>
                <p className="font-medium">{purchaseRequisition?.description}</p>
              </div>
              {purchaseRequisition?.vendor_name && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Vendor:</span>
                  <span className="font-medium">{purchaseRequisition.vendor_name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Urgency */}
          <div>
            <Label htmlFor="payment_urgency">Payment Urgency *</Label>
            <Select
              value={formData.payment_urgency}
              onValueChange={(value) => setFormData({ ...formData, payment_urgency: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">🟢 Normal - Standard processing</SelectItem>
                <SelectItem value="urgent">🟡 Urgent - Needed within 24 hours</SelectItem>
                <SelectItem value="emergency">🔴 Emergency - Critical/Immediate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Justification */}
          <div>
            <Label htmlFor="justification">Justification for Owner *</Label>
            <Textarea
              id="justification"
              value={formData.justification}
              onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
              placeholder="Explain why this payment is necessary and why it should be approved..."
              rows={6}
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Be specific about urgency, business impact, and why this payment can't wait
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit to Owner
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FinanceFundRequestForm;

