
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Save, Calculator } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function TransactionEditModal({ transaction, onSave, onClose }) {
  const [formData, setFormData] = useState({
    rst_number: transaction.rst_number?.toString() || "",
    vehicle_number: transaction.vehicle_number || "",
    gross_weight: transaction.gross_weight?.toString() || "",
    tare_weight: transaction.tare_weight?.toString() || "",
    net_weight: transaction.net_weight || 0,
    material_type: transaction.material_type || "",
    customer_name: transaction.customer_name || "",
    transaction_date: transaction.transaction_date 
      ? format(new Date(transaction.transaction_date), "yyyy-MM-dd'T'HH:mm")
      : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    is_duplicate: transaction.is_duplicate || false
  });

  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    const gross = parseInt(formData.gross_weight) || 0;
    const tare = parseInt(formData.tare_weight) || 0;
    const net = Math.max(0, gross - tare);
    
    setFormData(prev => ({
      ...prev,
      net_weight: net
    }));
  }, [formData.gross_weight, formData.tare_weight]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updatedTransaction = {
        ...transaction,
        ...formData,
        rst_number: parseInt(formData.rst_number, 10),
        gross_weight: parseInt(formData.gross_weight),
        tare_weight: parseInt(formData.tare_weight),
        net_weight: formData.net_weight,
        transaction_date: new Date(formData.transaction_date).toISOString()
      };

      await onSave(updatedTransaction);
    } catch (error) {
      console.error("Error updating transaction:", error);
    }
    
    setIsSaving(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Edit Transaction - {transaction.rst_number}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="rst_number">RST Number</Label>
              <Input
                id="rst_number"
                type="number"
                value={formData.rst_number}
                onChange={(e) => handleInputChange("rst_number", e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle_number">Vehicle Number</Label>
              <Input
                id="vehicle_number"
                value={formData.vehicle_number}
                onChange={(e) => handleInputChange("vehicle_number", e.target.value)}
                className="font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transaction_date">Date & Time</Label>
            <Input
              id="transaction_date"
              type="datetime-local"
              value={formData.transaction_date}
              onChange={(e) => handleInputChange("transaction_date", e.target.value)}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="gross_weight">Gross Weight (T)</Label>
              <Input
                id="gross_weight"
                type="number"
                min="0"
                value={formData.gross_weight}
                onChange={(e) => handleInputChange("gross_weight", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tare_weight">Tare Weight (T)</Label>
              <Input
                id="tare_weight"
                type="number"
                min="0"
                value={formData.tare_weight}
                onChange={(e) => handleInputChange("tare_weight", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Net Weight (T)</Label>
              <div className="relative">
                <Input
                  value={formData.net_weight}
                  disabled
                  className="bg-green-50 border-green-200 text-green-800 font-bold"
                />
                <Calculator className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 mr-1 text-green-600" />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="material_type">Material Type</Label>
              <Input
                id="material_type"
                value={formData.material_type}
                onChange={(e) => handleInputChange("material_type", e.target.value)}
                placeholder="e.g., Stone, Sand, Gravel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_name">Customer Name</Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => handleInputChange("customer_name", e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                "Saving..."
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
