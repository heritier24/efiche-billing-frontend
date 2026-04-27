# Payments Backend API Requirements

This document outlines the required backend API endpoints and functionality for the payments module to work correctly with the frontend.

## Required API Endpoints

### 1. Payment Statistics
**Endpoint:** `GET /api/payments/summary`

**Description:** Get payment statistics for dashboard display

**Response:**
```json
{
  "total_payments": 150,
  "completed_payments": 120,
  "total_revenue": 2500000,
  "pending_amount": 300000,
  "payment_methods_breakdown": {
    "cash": 80,
    "mobile_money": 50,
    "insurance": 20
  },
  "monthly_stats": {
    "current_month": {
      "payments": 25,
      "revenue": 500000
    },
    "previous_month": {
      "payments": 20,
      "revenue": 400000
    }
  }
}
```

### 2. List All Payments
**Endpoint:** `GET /api/payments`

**Query Parameters:**
- `search` (optional): Search by invoice ID, patient name, or transaction reference
- `status` (optional): Filter by status (pending, confirmed, failed)
- `method` (optional): Filter by payment method (cash, mobile_money, insurance)
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "invoice_id": 123,
      "amount": 50000,
      "method": "mobile_money",
      "status": "confirmed",
      "transaction_ref": "TXN123456",
      "phone": "+250788123456",
      "notes": "Payment for consultation",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:35:00Z",
      "confirmed_at": "2024-01-15T10:35:00Z",
      "cashier_id": 1
    }
  ],
  "total": 150,
  "per_page": 20,
  "current_page": 1,
  "last_page": 8
}
```

### 3. Get Pending Invoices for Payment
**Endpoint:** `GET /api/invoices/pending`

**Description:** Get list of invoices with remaining balance for payment recording

**Response:**
```json
{
  "data": [
    {
      "id": 123,
      "invoice_number": "INV-2024-001",
      "patient_name": "John Doe",
      "total_amount": 100000,
      "remaining_balance": 50000,
      "created_at": "2024-01-15T09:00:00Z",
      "status": "partially_paid"
    }
  ]
}
```

### 4. Process Payment (Create Payment)
**Endpoint:** `POST /api/invoices/{invoiceId}/payments`

**Request Body:**
```json
{
  "amount": "50000.00",
  "method": "mobile_money",
  "phone": "+250788123456",
  "notes": "Partial payment for consultation"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "id": 456,
    "invoice_id": 123,
    "amount": 50000,
    "method": "mobile_money",
    "status": "pending",
    "transaction_ref": "TXN123456",
    "phone": "+250788123456",
    "notes": "Partial payment for consultation",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "cashier_id": 1
  },
  "invoice_status": "paid",
  "remaining_balance": 0
}
```

### 5. Update Payment Status
**Endpoint:** `PUT /api/payments/{paymentId}/status`

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment status updated successfully",
  "data": {
    "id": 456,
    "status": "confirmed",
    "confirmed_at": "2024-01-15T10:35:00Z",
    "updated_at": "2024-01-15T10:35:00Z"
  }
}
```

### 6. Delete Payment
**Endpoint:** `DELETE /api/payments/{paymentId}`

**Response:**
```json
{
  "success": true,
  "message": "Payment deleted successfully"
}
```

### 7. Retry Failed Payment
**Endpoint:** `POST /api/payments/{paymentId}/retry`

**Response:**
```json
{
  "success": true,
  "message": "Payment retry initiated",
  "data": {
    "id": 456,
    "status": "pending",
    "transaction_ref": "TXN123457",
    "updated_at": "2024-01-15T11:00:00Z"
  }
}
```

## Payment Status Values

- `pending`: Payment initiated, waiting for confirmation
- `confirmed`: Payment successfully confirmed
- `failed`: Payment failed or was rejected

## Payment Method Values

- `cash`: Cash payment
- `mobile_money`: Mobile money payment (MTN, Airtel Money)
- `insurance`: Insurance payment

## Webhook Requirements

### Mobile Money Webhook
**Endpoint:** `POST /api/webhooks/efichepay`

**Description:** Handle mobile money payment confirmations

**Request Body:**
```json
{
  "transaction_id": "TXN123456",
  "status": "successful",
  "amount": 50000,
  "phone": "+250788123456",
  "reference": "INV-2024-001",
  "timestamp": "2024-01-15T10:35:00Z"
}
```

## Database Schema Requirements

### Payments Table
```sql
CREATE TABLE payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    invoice_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    method ENUM('cash', 'mobile_money', 'insurance') NOT NULL,
    status ENUM('pending', 'confirmed', 'failed') NOT NULL DEFAULT 'pending',
    transaction_ref VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP NULL,
    cashier_id BIGINT,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    FOREIGN KEY (cashier_id) REFERENCES users(id)
);
```

## Business Logic Requirements

### Payment Processing
1. Validate invoice exists and has remaining balance
2. Validate payment amount doesn't exceed remaining balance
3. Process payment based on method:
   - **Cash**: Mark as confirmed immediately
   - **Mobile Money**: Initiate mobile money transaction, mark as pending
   - **Insurance**: Process insurance claim, mark as pending
4. Update invoice remaining balance
5. Generate unique transaction reference

### Payment Confirmation
1. Handle webhook confirmations from mobile money providers
2. Update payment status to confirmed
3. Update invoice status if fully paid
4. Send notifications to patient

### Payment Validation
1. Amount must be positive and not exceed remaining balance
2. Phone number validation for mobile money (Rwanda format: +2507xxxxxxxx)
3. Invoice must exist and not be fully paid
4. Cashier must be authenticated

### Error Handling
- Return appropriate HTTP status codes
- Provide detailed error messages
- Handle duplicate transaction references
- Handle network timeouts for mobile money

## Security Requirements

1. Authentication required for all payment endpoints
2. Authorization: Cashiers can only process payments for their facility
3. Audit trail: Log all payment activities
4. Rate limiting: Prevent duplicate payment submissions
5. Data validation: Sanitize all input data

## Testing Requirements

1. Unit tests for all payment processing logic
2. Integration tests for webhook handling
3. Test payment retry functionality
4. Test concurrent payment scenarios
5. Test payment status updates
6. Test payment deletion with invoice balance updates

## Implementation Priority

1. **High Priority:**
   - List payments endpoint
   - Process payment endpoint
   - Payment statistics endpoint
   - Pending invoices endpoint

2. **Medium Priority:**
   - Update payment status endpoint
   - Delete payment endpoint
   - Retry payment endpoint

3. **Low Priority:**
   - Webhook implementation
   - Advanced filtering and search
   - Export functionality

## Notes for Backend Developers

1. The frontend expects the `BackendPayment` interface structure as defined in `lib/types/index.ts`
2. Payment amounts should be stored as decimal with 2 precision
3. All timestamps should be in UTC
4. Transaction references should be unique and trackable
5. Payment status changes should trigger invoice balance updates
6. Consider implementing payment timeouts for mobile money transactions
