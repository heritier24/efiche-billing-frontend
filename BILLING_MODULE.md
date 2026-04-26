# Billing Module Documentation

## Overview

This is a **production-ready healthcare billing UI** built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS 4.

## Features

✅ Invoice viewing with dynamic patient data
✅ Itemized charge breakdown
✅ Multiple payment methods:
  - Cash
  - Mobile Money (with async polling)
  - Insurance (fetched from API)
✅ Responsive design (mobile & desktop)
✅ Loading and error states
✅ TypeScript types for all data structures

## Project Structure

```
app/
├── billing/
│   └── [visitId]/
│       └── page.tsx          # Main billing page (dynamic route)
├── layout.tsx                # Root layout with metadata
└── page.tsx                  # Home page with navigation

components/
└── billing/
    ├── InvoiceSummary.tsx    # Invoice header component
    ├── LineItemsList.tsx     # Itemized charges component
    ├── PaymentForm.tsx       # Payment form with method selection
    └── index.ts              # Barrel export

lib/
├── api/
│   └── mock.ts              # Mock API functions (replace with real endpoints)
└── types/
    └── index.ts             # TypeScript interfaces and types
```

## Getting Started

### 1. Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the app.

### 2. Test the Billing Page

Visit: `http://localhost:3000/billing/V001`

Replace `V001` with any visit ID to test different records.

### 3. Build for Production

```bash
npm run build
npm start
```

## Component Usage

### InvoiceSummary

Displays invoice details: ID, status, amounts.

```tsx
<InvoiceSummary invoice={invoice} />
```

**Props:**
- `invoice: Invoice` - Invoice data object

### LineItemsList

Shows itemized charges in a table (desktop) or card (mobile).

```tsx
<LineItemsList items={lineItems} />
```

**Props:**
- `items: LineItem[]` - Array of line items

### PaymentForm

Handles payment submission with method selection and insurance dropdown.

```tsx
<PaymentForm
  invoice={invoice}
  insurances={insurances}
  onSubmit={handlePayment}
  isLoading={loading}
  isWaitingForConfirmation={waiting}
/>
```

**Props:**
- `invoice: Invoice` - Current invoice
- `insurances: Insurance[]` - Available insurances
- `onSubmit: (data: PaymentFormData) => void` - Submit callback
- `isLoading: boolean` - Payment processing state
- `isWaitingForConfirmation: boolean` - Mobile money waiting state
- `successMessage?: string` - Success notification
- `errorMessage?: string` - Error notification

## API Integration

### Mock API Functions (lib/api/mock.ts)

Replace these with real API calls:

#### `getInvoice(visitId: string): Promise<Invoice>`
Fetch invoice by visit ID

#### `getInsurances(): Promise<Insurance[]>`
Fetch available insurance providers

#### `processPayment(...): Promise<{success, payment, updatedInvoice}>`
Submit payment

#### `checkMobileMoneyStatus(paymentId: string): Promise<{status, confirmationCode}>`
Poll mobile money payment status

### Example: Real API Integration

Replace mock functions in `page.tsx`:

```tsx
// Before (mock)
const invoiceData = await getInvoice(visitId);

// After (real API)
const response = await fetch(`/api/invoices/${visitId}`);
const invoiceData = await response.json();
```

## State Management

The main page uses **React hooks**:

- `useState` - Manage form state, loading, messages
- `useEffect` - Fetch data on mount, poll for mobile money confirmation
- `useRef` - Track polling interval and attempt count

### Mobile Money Polling Logic

1. User selects "Mobile Money" and submits payment
2. Page enters "waiting for confirmation" state
3. Automatically polls `/api/payments/status` every 5 seconds
4. Max 10 polling attempts (50 seconds)
5. Updates invoice upon confirmation or shows timeout error

## Types

All types are defined in `lib/types/index.ts`:

- `Invoice` - Invoice document
- `LineItem` - Individual charge
- `Payment` - Payment transaction
- `Insurance` - Insurance provider
- `PaymentFormData` - Form submission data

## Styling

Built with **Tailwind CSS 4**:

- Responsive grid layouts
- Card-based design with shadows
- Smooth transitions and hover states
- Mobile-first approach
- Utility-first CSS

### Colors Used:
- Primary: Blue (600/700)
- Success: Green (600/50)
- Warning: Yellow (100/800)
- Error: Red (100/800)

## Error Handling

- **Loading State**: Spinner while fetching data
- **Network Error**: User-friendly error messages
- **Validation**: Client-side form validation before submission
- **Mobile Money Timeout**: Graceful timeout after max polling attempts

## Performance

- Static generation where possible
- Efficient re-renders with React hooks
- Optimized API calls (Promise.all for parallel fetches)
- CSS containment with Tailwind

## Accessibility

- Semantic HTML (headings, labels)
- Form validation and error messages
- Proper ARIA attributes for buttons
- Keyboard navigation support

## Testing

To test different scenarios:

1. **Normal Payment**: Cash payment flow
2. **Mobile Money**: Simulates 5-10 second polling
3. **Insurance**: Select insurance from dropdown
4. **Validation**: Try submitting with invalid amounts
5. **Responsive**: Test on mobile and desktop

## Future Enhancements

- [ ] Real API integration
- [ ] Authentication/authorization
- [ ] Payment receipt generation
- [ ] Email notifications
- [ ] Invoice PDF export
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Advanced analytics

## Troubleshooting

### Invoice not loading
- Check if visitId parameter is present in URL
- Verify API mock data is returning valid invoice

### Mobile money payment stuck
- Check browser console for errors
- Max polling attempts is 50 seconds, adjust in code if needed

### Styling issues
- Clear `.next` cache and rebuild: `rm -rf .next && npm run dev`
- Ensure Tailwind CSS is properly configured

## Support

For issues or questions about the billing module, refer to component JSDoc comments and type definitions.
