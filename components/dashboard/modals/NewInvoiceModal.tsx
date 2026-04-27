/**
 * New Invoice Modal Component - Clean Version
 */

"use client";

import { useState } from "react";
import { api } from "@/lib/api/backend";

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

interface Visit {
  id: number;
  patient_id: number;
  facility_id?: number;
  visit_type?: string;
  status: string;
  created_at: string;
  updated_at: string;
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
  const [availableVisits, setAvailableVisits] = useState<Visit[]>([]);
  const [isLoadingVisits, setIsLoadingVisits] = useState(false);

  const handlePatientChange = async (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    setFormData(prev => ({
      ...prev,
      patientId,
      patientName: patient?.name || "",
      visitId: "", // Reset visit ID
    }));

    // Fetch real visits for this patient from backend
    if (patientId) {
      setIsLoadingVisits(true);
      console.log('Fetching visits for patient:', patientId);
      try {
        const response = await api.visits.getVisits({
          patient_id: parseInt(patientId),
          status: 'active',
          limit: 50
        });
        console.log('Real visits API response:', response);
        setAvailableVisits(response.data || []);
      } catch (error: any) {
        console.error('Error fetching visits:', error);
        console.error('Error details:', {
          message: error?.message || 'Unknown error',
          status: error?.status || 'Unknown',
          stack: error?.stack || 'No stack trace'
        });
        // Fallback: create mock visits for testing
        setAvailableVisits([
          {
            id: 1,
            patient_id: parseInt(patientId),
            facility_id: 1,
            visit_type: 'consultation',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 2,
            patient_id: parseInt(patientId),
            facility_id: 1,
            visit_type: 'follow_up',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 3,
            patient_id: parseInt(patientId),
            facility_id: 1,
            visit_type: 'emergency',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
      } finally {
        setIsLoadingVisits(false);
      }
    } else {
      setAvailableVisits([]);
    }
  };

  const handleLineItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    const updatedLineItems = [...formData.lineItems];
    updatedLineItems[index] = {
      ...updatedLineItems[index],
      [field]: value,
    };

    // Calculate total price if quantity or unit price changed
    if (field === "quantity" || field === "unitPrice") {
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
      // Handle new visit creation if selected
      let finalVisitId = formData.visitId;
      
      if (formData.visitId.startsWith('new-')) {
        // Create a new visit first
        let visitType = formData.visitId.replace('new-', '');
        
        // Map frontend visit types to backend format
        if (visitType === 'followup') {
          visitType = 'follow_up';
        }
        
        console.log(`Creating new ${visitType} visit for patient ${formData.patientId}`);
        
        try {
          const newVisitResponse = await api.visits.createVisit({
            patient_id: parseInt(formData.patientId),
            visit_type: visitType as 'consultation' | 'follow_up' | 'emergency' | 'general',
            status: 'active'
          });
          
          finalVisitId = newVisitResponse.data.id.toString();
          console.log('New visit created with ID:', finalVisitId);
        } catch (visitError) {
          console.error('Error creating new visit:', visitError);
          throw new Error(`Failed to create new visit: ${visitError instanceof Error ? visitError.message : 'Unknown error'}`);
        }
      }
      
      // Submit invoice with the final visit ID
      const invoiceData = {
        ...formData,
        visitId: finalVisitId
      };
      
      await onSubmit(invoiceData);
      
      // Reset form
      setFormData({
        patientId: "",
        patientName: "",
        visitId: "",
        lineItems: [
          { name: "", description: "", quantity: 1, unitPrice: 0, totalPrice: 0 }
        ],
        notes: "",
      });
      onClose();
    } catch (error) {
      console.error("Error creating invoice:", error);
      alert(`Error creating invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
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
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base font-medium text-neutral-900 placeholder-neutral-500"
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
                Select Patient Visit *
              </label>
              {isLoadingVisits ? (
                <div className="w-full px-4 py-3 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-500">
                  Loading patient visits...
                </div>
              ) : availableVisits.length === 0 ? (
                <div className="space-y-3">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>No active visits found</strong> for this patient. You can either:
                    </p>
                    <ul className="text-sm text-yellow-700 mt-2 ml-4 list-disc">
                      <li>Select an existing visit from the list below</li>
                      <li>Create a new visit for this patient</li>
                    </ul>
                  </div>
                  <select
                    value={formData.visitId}
                    onChange={(e) => setFormData(prev => ({ ...prev, visitId: e.target.value }))}
                    required
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base font-medium text-neutral-900 placeholder-neutral-500"
                  >
                    <option value="">Choose an option</option>
                    <option value="new-consultation">New Consultation Visit</option>
                    <option value="new-followup">New Follow-up Visit</option>
                    <option value="new-emergency">New Emergency Visit</option>
                  </select>
                  <p className="text-xs text-neutral-500">Select a visit type to create a new visit for this patient</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      <strong>Found {availableVisits.length} active visit(s)</strong> for this patient
                    </p>
                  </div>
                  <select
                    value={formData.visitId}
                    onChange={(e) => setFormData(prev => ({ ...prev, visitId: e.target.value }))}
                    required
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base font-medium text-neutral-900 placeholder-neutral-500"
                  >
                    <option value="">Choose a visit</option>
                    {availableVisits.map(visit => {
                      const visitDate = new Date(visit.created_at).toLocaleDateString();
                      const visitType = visit.visit_type || "Consultation";
                      
                      return (
                        <option key={visit.id} value={visit.id.toString()}>
                          {visitType.charAt(0).toUpperCase() + visitType.slice(1)} - {visitDate} (Visit #{visit.id})
                        </option>
                      );
                    })}
                    <option value="new-consultation">+ Create New Consultation</option>
                    <option value="new-followup">+ Create New Follow-up</option>
                    <option value="new-emergency">+ Create New Emergency</option>
                  </select>
                  <p className="text-xs text-neutral-500">Select an existing visit or choose to create a new one</p>
                </div>
              )}
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
                        onChange={(e) => handleLineItemChange(index, "name", e.target.value)}
                        required
                        className="w-full px-3 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base font-medium text-neutral-900 placeholder-neutral-500"
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
                        onChange={(e) => handleLineItemChange(index, "quantity", parseInt(e.target.value) || 0)}
                        required
                        className="w-full px-3 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base font-medium text-neutral-900 placeholder-neutral-500"
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
                        onChange={(e) => handleLineItemChange(index, "unitPrice", parseFloat(e.target.value) || 0)}
                        required
                        className="w-full px-3 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base font-medium text-neutral-900 placeholder-neutral-500"
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
                          className="ml-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
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
                      onChange={(e) => handleLineItemChange(index, "description", e.target.value)}
                      className="w-full px-3 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base font-medium text-neutral-900 placeholder-neutral-500"
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
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base font-medium text-neutral-900 placeholder-neutral-500 resize-none"
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
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Creating Invoice..." : "Create Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
