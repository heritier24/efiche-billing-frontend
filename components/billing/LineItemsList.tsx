/**
 * Line Items List Component
 * Displays breakdown of charges
 * Estate Rwanda Design - 60-30-10 Color Scheme
 */

import { BackendLineItem } from "@/lib/types";

interface LineItemsListProps {
  items: BackendLineItem[];
}

export default function LineItemsList({ items }: LineItemsListProps) {
  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-6">
        <div className="text-center">
          <div className="text-3xl mb-2">📋</div>
          <p className="text-neutral-500">No line items available</p>
          <p className="text-sm text-neutral-400 mt-1">Invoice details may not be loaded yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden mb-6">
      <div className="p-6 border-b border-neutral-200 bg-neutral-50">
        <h2 className="text-xl font-semibold text-neutral-900">
          Itemized Charges
        </h2>
      </div>

      <div className="hidden md:block">
        {/* Table view for desktop */}
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">
                Description
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-900">
                Quantity
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-900">
                Unit Price
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-900">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-neutral-50">
                <td className="px-6 py-4">
                  <p className="font-semibold text-neutral-900">{item.description}</p>
                  <p className="text-sm text-neutral-600 mt-1">
                    {item.item_code}
                  </p>
                </td>
                <td className="px-6 py-4 text-right text-neutral-700">
                  {item.quantity}
                </td>
                <td className="px-6 py-4 text-right text-neutral-700">
                  RWF {item.unit_price.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right font-semibold text-primary-600">
                  RWF {item.total_price?.toLocaleString() || (item.unit_price * item.quantity).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card view for mobile */}
      <div className="md:hidden">
        <div className="divide-y divide-neutral-200">
          {items.map((item) => (
            <div key={item.id} className="px-6 py-4">
              <p className="font-semibold text-neutral-900 mb-1">{item.description}</p>
              <p className="text-sm text-neutral-600 mb-3">{item.item_code}</p>
              <div className="flex justify-between text-sm mb-2 text-neutral-700">
                <span>Qty: {item.quantity} x</span>
                <span className="font-medium">
                  RWF {item.unit_price.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-neutral-900">Total:</span>
                <span className="text-primary-600">
                  RWF {item.total_price?.toLocaleString() || (item.unit_price * item.quantity).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
