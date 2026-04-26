/**
 * New Invoice Modal Component
 */

"use client";

import { useState } from "react";

interface LineItem {
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Invoice {
  patientId: string;
  patientName: string;
  visitId: string;
  lineItems: LineItem[];
  notes?: string;
}

interface NewInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (invoice: Invoice) => void;
  patients: Array<{ id: string; name: string }>;
}

export default function NewInvoiceModal({ isOpen, onClose, onSubmit, patients }: NewInvoiceModalProps) {
  const [formData, setFormData] = useState<Invoice>({
    patientId: "",
    patientName: "",
    visitId: "",
    lineItems: [
      { name: "", description: "", quantity: 1, unitPrice: 0, totalPrice: 0 }
    ],
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePatientChange = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    setFormData(prev => ({
      ...prev,
      patientId,
      patientName: patient?.name || "",
      visitId: `V${Date.now().toString().slice(-6)}`, // Generate visit ID
    }));
  };

  const handleLineItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    const updatedLineItems = [...formData.lineItems];
    updatedLineItems[index] = {
      ...updatedLineItems[index],
      [field]: value,
    };

    // Calculate total price if quantity or unit price changed
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = Number(updatedLineItems[index].quantity) || 0;
      const unitPrice = Number(updatedLineItems[index].unitPrice) || 0;
      updatedLineItems[index].totalPrice = quantity * unitPrice;
    }

    setFormData(prev => ({ ...prev, lineItems: updatedLineItems }));
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { name: "", description: "", quantity: 1, unitPrice: 0, totalPrice: 0 }]
    }));
  };

  const removeLineItem = (index: number) => {
    if (formData.lineItems.length > 1) {
      setFormData(prev => ({
        ...prev,
        lineItems: prev.lineItems.filter((_, i) => i !== index)
      }));
    }
  };

  const calculateTotal = () => {
    return formData.lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      setFormData({
        patientId: "",
        patientName: "",
        visitId: "",
        lineItems: [{ name: "", description: "", quantity: 1, unitPrice: 0, totalPrice: 0 }],
        notes: "",
      });
      onClose();
    } catch (error) {
      console.error("Error creating invoice:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-neutral-200">
          <h2 className="text-2xl font-bold text-neutral-900">Create New Invoice</h2>
          <p className="text-neutral-600 mt-1">Generate invoice for patient services</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Patient Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Select Patient *
              </label>
              <select
                value={formData.patientId}
                onChange={(e) => handlePatientChange(e.target.value)}
                required
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Choose a patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Visit ID
              </label>
              <input
                type="text"
                value={formData.visitId}
                readOnly
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg bg-neutral-50"
                placeholder="Auto-generated"
              />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">Invoice Items</h3>
              <button
                type="button"
                onClick={addLineItem}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors text-sm"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-4">
              {formData.lineItems.map((item, index) => (
                <div key={index} className="border border-neutral-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Service Name *
                      </label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleLineItemChange(index, 'name', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g., Consultation"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleLineItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                        required
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Unit Price (RWF) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleLineItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        required
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="flex items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Total (RWF)
                        </label>
                        <div className="px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg font-medium">
                          {item.totalPrice.toLocaleString()}
                        </div>
                      </div>
                      {formData.lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          className="ml-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Optional description"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Additional notes or instructions"
            />
          </div>

          {/* Total */}
          <div className="border-t border-neutral-200 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-neutral-900">Total Amount:</span>
              <span className="text-2xl font-bold text-primary-600">
                RWF {calculateTotal().toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Creating Invoice..." : "Create Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
