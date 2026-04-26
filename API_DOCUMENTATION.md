# Efiche Healthcare Billing - API Documentation

## Overview

This document outlines the API endpoints required for the Efiche healthcare billing frontend. The frontend is built with Next.js 16, React 19, TypeScript, and Tailwind CSS.

## Base URL

```
https://api.efiche.rw
```

## Authentication

All API endpoints should require authentication using JWT tokens or session-based auth.

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Get Invoice by Visit ID

**Endpoint:** `GET /api/invoices/{visitId}`

**Description:** Fetch invoice details for a specific patient visit.

**Path Parameters:**
- `visitId` (string): Unique identifier for the patient visit

**Response:**
```json
{
  "id": "INV-V001",
  "visitId": "V001", 
  "patientName": "John Doe",
  "invoiceDate": "2024-04-26",
  "status": "pending", // "pending" | "paid" | "partially_paid"
  "totalAmount": 50000,
  "amountPaid": 0,
  "remainingBalance": 50000,
  "lineItems": [
    {
      "id": "item-1",
      "name": "Consultation",
      "description": "Doctor Consultation (30 mins)",
      "quantity": 1,
      "unitPrice": 20000,
      "totalPrice": 20000
    },
    {
      "id": "item-2", 
      "name": "Lab Test",
      "description": "Complete Blood Count (CBC)",
      "quantity": 1,
      "unitPrice": 15000,
      "totalPrice": 15000
    },
    {
      "id": "item-3",
      "name": "Medication", 
      "description": "Antibiotic - 7 days supply",
      "quantity": 1,
      "unitPrice": 15000,
      "totalPrice": 15000
    }
  ]
}
```

**Error Responses:**
- `404 Not Found`: Invoice not found for the given visitId
- `500 Internal Server Error`: Server error

---

### 2. Get Insurance Providers

**Endpoint:** `GET /api/facilities/{facilityId}/insurances`

**Description:** Fetch list of active insurance providers for a facility.

**Path Parameters:**
- `facilityId` (string): Unique identifier for the healthcare facility

**Response:**
```json
[
  {
    "id": "ins-1",
    "name": "RSSB",
    "code": "RSSB-001", 
    "coveragePercentage": 80,
    "isActive": true
  },
  {
    "id": "ins-2",
    "name": "MMI",
    "code": "MMI-002",
    "coveragePercentage": 75,
    "isActive": true
  },
  {
    "id": "ins-3",
    "name": "MediCare Rwanda",
    "code": "MCR-003",
    "coveragePercentage": 85,
    "isActive": true
  }
]
```

**Error Responses:**
- `404 Not Found`: Facility not found
- `500 Internal Server Error`: Server error

---

### 3. Process Payment

**Endpoint:** `POST /api/invoices/{invoiceId}/payments`

**Description:** Process a payment for an invoice.

**Path Parameters:**
- `invoiceId` (string): Unique identifier for the invoice

**Request Body:**
```json
{
  "amount": 50000,
  "method": "cash", // "cash" | "mobile_money" | "insurance"
  "insuranceId": "ins-1", // Required only if method is "insurance"
  "phoneNumber": "+250788123456" // Required only if method is "mobile_money"
}
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "PAY-1714123456789",
    "invoiceId": "INV-V001",
    "amount": 50000,
    "method": "cash",
    "insuranceId": null,
    "status": "completed", // "pending" | "completed" | "failed"
    "timestamp": "2024-04-26T10:30:00Z",
    "confirmationCode": "CNF-ABC123XYZ"
  },
  "updatedInvoice": {
    "id": "INV-V001",
    "visitId": "V001",
    "patientName": "John Doe", 
    "invoiceDate": "2024-04-26",
    "status": "paid",
    "totalAmount": 50000,
    "amountPaid": 50000,
    "remainingBalance": 0,
    "lineItems": [...]
  }
}
```

**Mobile Money Response:**
```json
{
  "success": true,
  "payment": {
    "id": "PAY-1714123456789",
    "invoiceId": "INV-V001", 
    "amount": 50000,
    "method": "mobile_money",
    "insuranceId": null,
    "status": "pending", // Mobile money payments start as "pending"
    "timestamp": "2024-04-26T10:30:00Z",
    "confirmationCode": null
  },
  "updatedInvoice": {
    // Invoice remains unchanged until payment is confirmed
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid payment amount, method, or missing required fields
- `404 Not Found`: Invoice not found
- `409 Conflict`: Invoice already paid or amount exceeds remaining balance
- `500 Internal Server Error`: Payment processing failed

---

### 4. Check Mobile Money Payment Status

**Endpoint:** `GET /api/payments/{paymentId}/status`

**Description:** Check the confirmation status of a mobile money payment.

**Path Parameters:**
- `paymentId` (string): Unique identifier for the payment

**Response:**
```json
{
  "status": "completed", // "pending" | "completed" | "failed"
  "confirmationCode": "CNF-ABC123XYZ" // Only available when status is "completed"
}
```

**Error Responses:**
- `404 Not Found`: Payment not found
- `500 Internal Server Error`: Server error

---

## Data Types

### Invoice Status
- `pending`: Invoice is unpaid
- `partially_paid`: Partial payment received
- `paid`: Invoice fully paid

### Payment Method
- `cash`: Direct cash payment
- `mobile_money`: Mobile money transfer (MTN, Airtel Money)
- `insurance`: Insurance provider payment

### Payment Status
- `pending`: Awaiting confirmation (mobile money only)
- `completed`: Payment successfully processed
- `failed`: Payment failed

## Currency

All monetary values should be in **Rwandan Francs (RWF)** as integers (no decimal points).

## Error Handling

All error responses should follow this format:

```json
{
  "error": {
    "code": "INVOICE_NOT_FOUND",
    "message": "Invoice not found for the given visit ID",
    "details": {}
  }
}
```

## Frontend Integration Notes

### Mobile Money Flow
1. Frontend calls `POST /api/invoices/{invoiceId}/payments` with `method: "mobile_money"`
2. Backend returns payment with `status: "pending"`
3. Frontend starts polling `GET /api/payments/{paymentId}/status` every 5 seconds
4. Backend should update payment status when mobile money provider confirms
5. Frontend stops polling when status is `completed` or `failed`
6. Maximum polling attempts: 10 (50 seconds total)

### Insurance Payments
- Frontend sends `insuranceId` from the insurance dropdown
- Backend should validate insurance is active and calculate coverage
- Apply insurance coverage percentage to the amount

### Amount Validation
- Payment amount cannot exceed remaining balance
- Minimum payment amount: 1 RWF
- Maximum payment amount: remaining balance

## Testing

### Sample Test Cases
1. **Valid cash payment**: Full amount payment should mark invoice as "paid"
2. **Partial payment**: Should mark invoice as "partially_paid" and update remaining balance
3. **Mobile money**: Should return "pending" status, then "completed" on confirmation
4. **Insurance payment**: Should validate insurance and apply coverage
5. **Invalid amount**: Should return 400 error for amount > remaining balance
6. **Non-existent invoice**: Should return 404 error

### Mock Data for Testing
Use the following visit IDs for testing:
- `V001`: Pending invoice with 50,000 RWF balance
- `V002`: Partially paid invoice with 15,000 RWF remaining
- `V003`: Fully paid invoice (0 RWF balance)

## Rate Limiting

Consider implementing rate limiting for:
- Payment processing: 5 requests per minute per user
- Status checking: 10 requests per minute per payment

## Security Considerations

1. Validate all input data
2. Ensure users can only access invoices for their facility
3. Implement proper authentication and authorization
4. Log all payment transactions for auditing
5. Use HTTPS for all API calls

## Frontend Implementation Status

✅ **Completed Features:**
- Invoice display with line items
- Payment form with method selection
- Mobile money polling mechanism
- Insurance dropdown integration
- Loading and error states
- Responsive design
- TypeScript type safety

🔄 **Ready for Backend Integration:**
- All mock API functions are implemented and ready to be replaced
- Component structure is modular and reusable
- Error handling is comprehensive
- State management is optimized

## Next Steps for Backend Team

1. Implement the 4 core endpoints
2. Set up authentication middleware
3. Configure database schema for invoices, payments, and insurance
4. Implement mobile money provider integrations (MTN, Airtel)
5. Set up insurance provider validations
6. Add comprehensive logging and monitoring
7. Write unit tests for all endpoints

## Contact

For frontend integration questions, contact the frontend development team.

---

*Last updated: April 26, 2026*
