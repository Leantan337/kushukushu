import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Truck, CheckCircle, AlertCircle } from 'lucide-react';

const WheatDeliveryForm = ({ manager, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    supplier_name: '',
    quantity_kg: '',
    quality_rating: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      
      const deliveryData = {
        supplier_name: formData.supplier_name,
        quantity_kg: parseFloat(formData.quantity_kg),
        quality_rating: formData.quality_rating,
        manager_id: manager.id,
        branch_id: manager.branch_id
      };

      const response = await fetch(`${backendUrl}/api/wheat-deliveries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deliveryData)
      });

      if (response.ok) {
        const result = await response.json();
        setMessage({ 
          type: 'success', 
          text: `Wheat delivery recorded successfully! ${deliveryData.quantity_kg}kg added to inventory.` 
        });
        
        // Reset form
        setFormData({
          supplier_name: '',
          quantity_kg: '',
          quality_rating: ''
        });
        
        // Call success callback after a short delay to show success message
        setTimeout(() => {
          onSuccess && onSuccess();
        }, 2000);
      } else {
        const error = await response.json();
        setMessage({ 
          type: 'error', 
          text: error.detail || 'Failed to record wheat delivery' 
        });
      }
    } catch (error) {
      console.error('Error recording wheat delivery:', error);
      setMessage({ 
        type: 'error', 
        text: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-blue-600" />
          Record Wheat Delivery
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="supplier_name">Supplier Name</Label>
            <Input
              id="supplier_name"
              value={formData.supplier_name}
              onChange={(e) => handleInputChange('supplier_name', e.target.value)}
              placeholder="Enter supplier name"
              required
            />
          </div>

          <div>
            <Label htmlFor="quantity_kg">Quantity (kg)</Label>
            <Input
              id="quantity_kg"
              type="number"
              step="0.01"
              min="0"
              value={formData.quantity_kg}
              onChange={(e) => handleInputChange('quantity_kg', e.target.value)}
              placeholder="Enter quantity in kg"
              required
            />
          </div>

          <div>
            <Label htmlFor="quality_rating">Quality Rating</Label>
            <Select 
              value={formData.quality_rating} 
              onValueChange={(value) => handleInputChange('quality_rating', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select quality rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="average">Average</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {message.text && (
            <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={loading || !formData.supplier_name || !formData.quantity_kg || !formData.quality_rating}
              className="flex-1"
            >
              {loading ? 'Recording...' : 'Record Delivery'}
            </Button>
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default WheatDeliveryForm;