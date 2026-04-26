# Backend API Documentation for eFiche Billing Module

## Laravel API Endpoints

### 1. Invoice Creation Endpoint

**POST** `/api/visits/{visitId}/invoices`

Creates a new invoice with line items for a specific visit.

#### Request Body:
```json
{
  "line_items": [
    {
      "item_code": "CONS-001",
      "description": "General Consultation",
      "quantity": 1,
      "unit_price": 15000.00
    },
    {
      "item_code": "LAB-001", 
      "description": "Complete Blood Count",
      "quantity": 1,
      "unit_price": 8000.00
    }
  ],
  "insurance_id": 1,
  "due_date": "2024-05-03"
}
```

#### Response:
```json
{
  "id": 123,
  "visit_id": 456,
  "invoice_number": "INV-2024000001",
  "status": "pending",
  "total_amount": 23000.00,
  "insurance_coverage": 18400.00,
  "patient_responsibility": 4600.00,
  "total_paid": 0.00,
  "due_date": "2024-05-03",
  "created_at": "2024-04-26T10:30:00Z",
  "line_items": [
    {
      "id": 1,
      "item_code": "CONS-001",
      "description": "General Consultation", 
      "quantity": 1,
      "unit_price": 15000.00,
      "total_price": 15000.00
    },
    {
      "id": 2,
      "item_code": "LAB-001",
      "description": "Complete Blood Count",
      "quantity": 1, 
      "unit_price": 8000.00,
      "total_price": 8000.00
    }
  ]
}
```

### 2. Payment Processing Endpoint

**POST** `/api/invoices/{invoiceId}/payments`

Processes a payment for a specific invoice with concurrency protection.

#### Request Body:
```json
{
  "amount": 4600.00,
  "method": "mobile_money",
  "phone_number": "+250788123456",
  "notes": "Patient mobile payment"
}
```

#### Response (Cash Payment):
```json
{
  "id": 789,
  "invoice_id": 123,
  "amount": 4600.00,
  "method": "cash",
  "status": "confirmed",
  "transaction_ref": null,
  "cashier_id": 1,
  "processed_at": "2024-04-26T10:35:00Z",
  "confirmed_at": "2024-04-26T10:35:00Z",
  "notes": "Patient cash payment"
}
```

#### Response (Mobile Money Initiation):
```json
{
  "id": 790,
  "invoice_id": 123,
  "amount": 4600.00,
  "method": "mobile_money",
  "status": "pending",
  "transaction_ref": "MTN-20240426103500-ABC123",
  "cashier_id": 1,
  "processed_at": "2024-04-26T10:35:00Z",
  "confirmed_at": null,
  "notes": "Patient mobile payment"
}
```

### 3. Webhook Handler Endpoint

**POST** `/api/webhooks/efichepay`

Handles asynchronous mobile money payment confirmations with idempotency.

#### Request Headers:
```
X-EfichePay-Signature: [HMAC-SHA256 signature]
Content-Type: application/json
```

#### Request Body:
```json
{
  "eventId": "evt_1234567890",
  "status": "PAYMENT_COMPLETE",
  "orderNumber": "MTN-20240426103500-ABC123",
  "amount": 460000,
  "phoneNumber": "+250788123456",
  "timestamp": "2024-04-26T10:36:00Z"
}
```

#### Response:
```json
{
  "status": "ok"
}
```

### 4. Facility Insurance Endpoint

**GET** `/api/facilities/{facilityId}/insurances`

Returns active insurance providers for a specific facility.

#### Response:
```json
{
  "data": [
    {
      "id": 1,
      "name": "RSSB",
      "code": "RSSB",
      "coverage_percentage": 80.00,
      "max_claim_amount": 500000.00,
      "requires_preauth": false,
      "is_active": true
    },
    {
      "id": 2,
      "name": "MMI",
      "code": "MMI", 
      "coverage_percentage": 70.00,
      "max_claim_amount": 300000.00,
      "requires_preauth": false,
      "is_active": true
    }
  ]
}
```

### 5. Payment Status Check Endpoint

**GET** `/api/payments/{paymentId}/status`

Checks the current status of a payment (for polling).

#### Response:
```json
{
  "id": 790,
  "status": "confirmed",
  "confirmed_at": "2024-04-26T10:36:00Z",
  "transaction_ref": "MTN-20240426103500-ABC123"
}
```

## Database Schema (PostgreSQL)

### Core Tables

```sql
-- Visits table
CREATE TABLE visits (
    id BIGINT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    facility_id BIGINT NOT NULL,
    visit_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL
);

-- Invoices table
CREATE TABLE invoices (
    id BIGINT PRIMARY KEY,
    visit_id BIGINT NOT NULL REFERENCES visits(id),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    total_amount DECIMAL(12,2) NOT NULL,
    insurance_coverage DECIMAL(12,2) DEFAULT 0.00,
    patient_responsibility DECIMAL(12,2) GENERATED ALWAYS AS (total_amount - insurance_coverage) STORED,
    total_paid DECIMAL(12,2) DEFAULT 0.00,
    due_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoice line items
CREATE TABLE invoice_line_items (
    id BIGINT PRIMARY KEY,
    invoice_id BIGINT NOT NULL REFERENCES invoices(id),
    item_code VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE payments (
    id BIGINT PRIMARY KEY,
    invoice_id BIGINT NOT NULL REFERENCES invoices(id),
    payment_method VARCHAR(20) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    transaction_ref VARCHAR(100) NULL,
    cashier_id BIGINT,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP NULL,
    webhook_event_id BIGINT NULL,
    notes TEXT NULL
);

-- Webhook events table
CREATE TABLE webhook_events (
    id BIGINT PRIMARY KEY,
    event_id VARCHAR(100) UNIQUE NOT NULL,
    source VARCHAR(50) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'received',
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Facility insurance configuration
CREATE TABLE facility_insurances (
    id BIGINT PRIMARY KEY,
    facility_id BIGINT NOT NULL,
    insurance_id BIGINT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    coverage_percentage DECIMAL(5,2) DEFAULT 100.00,
    max_claim_amount DECIMAL(12,2) NULL,
    requires_preauth BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(facility_id, insurance_id)
);
```

## Concurrency & Idempotency Implementation

### 1. Payment Processing with Locking

```php
public function store(Request $request, $invoiceId)
{
    return DB::transaction(function () use ($request, $invoiceId) {
        // Lock the invoice row for the entire transaction
        $invoice = Invoice::lockForUpdate()->findOrFail($invoiceId);
        
        // Calculate remaining balance safely
        $totalPaid = Payment::where('invoice_id', $invoiceId)
                           ->where('status', 'confirmed')
                           ->sum('amount');
        
        $remaining = $invoice->patient_responsibility - $totalPaid;

        if ($request->amount > $remaining) {
            throw new ValidationException('Overpayment not allowed');
        }

        // Create payment with proper status
        $payment = Payment::create([
            'invoice_id' => $invoiceId,
            'amount' => $request->amount,
            'method' => $request->method,
            'status' => $request->method === 'cash' ? 'confirmed' : 'pending',
            'cashier_id' => auth()->id(),
            'transaction_ref' => $request->method === 'mobile_money' 
                ? $this->initiateMobileMoneyPayment($request) 
                : null
        ]);

        // Update invoice status if fully paid
        if ($totalPaid + $request->amount >= $remaining) {
            $invoice->update(['status' => 'paid']);
        }

        return $payment;
    });
}
```

### 2. Idempotent Webhook Handler

```php
public function handleEfichePay(Request $request)
{
    $payload = $request->all();
    
    try {
        DB::transaction(function () use ($payload) {
            // Atomic insert with unique constraint on event_id
            $webhookEvent = WebhookEvent::create([
                'event_id' => $payload['eventId'],
                'source' => 'efichepay',
                'event_type' => $payload['status'],
                'payload' => json_encode($payload)
            ]);

            if ($payload['status'] === 'PAYMENT_COMPLETE') {
                $this->confirmMobileMoneyPayment($payload, $webhookEvent);
            }
        });
    } catch (QueryException $e) {
        // Handle unique constraint violation (duplicate webhook)
        if ($e->getCode() === '23505') {
            return response()->json(['status' => 'already_processed']);
        }
        throw $e;
    }

    return response()->json(['status' => 'ok']);
}
```

## Error Handling

### HTTP Status Codes

- **200**: Success
- **201**: Created (invoice/payment created)
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid webhook signature)
- **404**: Not Found (invoice not found)
- **422**: Unprocessable Entity (business logic errors)
- **500**: Internal Server Error

### Error Response Format

```json
{
  "error": "Overpayment not allowed",
  "message": "Payment amount exceeds remaining balance of RWF 4,600",
  "code": "OVERPAYMENT_ERROR"
}
```

## Testing

### Manual Webhook Testing

```bash
# Test successful payment
curl -X POST http://localhost:8000/api/webhooks/efichepay \
  -H "Content-Type: application/json" \
  -H "X-EfichePay-Signature: test-signature" \
  -d '{
    "eventId": "evt_test_'$(date +%s)'",
    "status": "PAYMENT_COMPLETE", 
    "orderNumber": "MTN-20240426103500-ABC123",
    "amount": 460000,
    "phoneNumber": "+250788123456"
  }'
```

### Concurrency Testing

```bash
# Simulate concurrent payments (run in parallel)
curl -X POST http://localhost:8000/api/invoices/123/payments \
  -H "Content-Type: application/json" \
  -d '{"amount": 2300.00, "method": "cash"}' &

curl -X POST http://localhost:8000/api/invoices/123/payments \
  -H "Content-Type: application/json" \
  -d '{"amount": 2300.00, "method": "cash"}'
```

This backend API provides the foundation for secure, concurrent billing operations with proper idempotency guarantees and Rwanda-specific business logic.
