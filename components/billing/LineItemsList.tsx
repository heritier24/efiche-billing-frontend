/**
 * Line Items List Component
 * Displays breakdown of charges
 */

import { LineItem } from "@/lib/types";

interface LineItemsListProps {
  items: LineItem[];
}

export default function LineItemsList({ items }: LineItemsListProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <p className="text-center text-gray-500">No line items found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <div className="p-6 border-b bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">
          Itemized Charges
        </h2>
      </div>

      <div className="hidden md:block">
        {/* Table view for desktop */}
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Description
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                Quantity
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                Unit Price
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  {item.description && (
                    <p className="text-sm text-gray-500">{item.description}</p>
                  )}
                </td>
                <td className="px-6 py-4 text-right text-gray-900">
                  {item.quantity}
                </td>
                <td className="px-6 py-4 text-right text-gray-900">
                  KES {item.unitPrice.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-right font-semibold text-gray-900">
                  KES {item.totalPrice.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card view for mobile */}
      <div className="md:hidden">
        <div className="divide-y">
          {items.map((item) => (
            <div key={item.id} className="px-6 py-4">
              <p className="font-medium text-gray-900 mb-1">{item.name}</p>
              {item.description && (
                <p className="text-sm text-gray-500 mb-3">{item.description}</p>
              )}
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Qty: {item.quantity} x</span>
                <span className="font-medium">
                  KES {item.unitPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-gray-900">Total:</span>
                <span className="text-blue-600">
                  KES {item.totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
