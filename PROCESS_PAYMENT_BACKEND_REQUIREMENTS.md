# Process Payment Backend Requirements

## 📋 Overview

Requirements for the **Process Payment** functionality used in the invoice data table. This workflow processes payments for a specific, pre-selected invoice.

## 🔗 Current Implementation

### Frontend Component
- **Component**: `PaymentModal` → `SimplePaymentForm`
- **Usage**: Invoice data table action button
- **Flow**: Select invoice → Process Payment button → Payment form with pre-filled invoice data

### Current API Endpoint
```http
POST /api/invoices/{invoiceId}/payments
Authorization: Bearer {token}
Content-Type: application/json
```

## 🚀 Required Backend Endpoints

### 1. Process Payment for Specific Invoice
```http
POST /api/invoices/{invoiceId}/payments
Authorization: Bearer {token}
Content-Type: application/json
```

**Purpose**: Process a payment for a specific invoice

**Request Body**:
```json
{
  "amount": "4999.95",
  "method": "cash",
  "phone": "+250788123456",
  "notes": "Payment for consultation services"
}
```

**Expected Response**:
```json
{
  "id": 123,
  "invoice_id": 45,
  "amount": 4999.95,
  "method": "cash",
  "phone": null,
  "notes": "Payment for consultation services",
  "status": "confirmed",
  "created_at": "2026-04-27T15:30:00.000000Z",
  "updated_at": "2026-04-27T15:30:00.000000Z"
}
```

**Fields Description**:
- `amount`: Payment amount as string (for precise decimal handling)
- `method`: Payment method (`cash`, `mobile_money`, `insurance`)
- `phone`: Phone number (required for `mobile_money` method)
- `notes`: Optional payment notes
- `status`: Payment status (`pending`, `confirmed`, `failed`)

### 2. Get Invoice Details (for validation)
```http
GET /api/invoices/{invoiceId}
Authorization: Bearer {token}
```

**Purpose**: Get invoice details for payment validation

**Expected Response**:
```json
{
  "id": 45,
  "invoice_number": "INV-20260045",
  "visit_id": 67,
  "status": "pending",
  "total_amount": 4999.95,
  "total_paid": 0,
  "remaining_balance": 4999.95,
  "created_at": "2026-04-27T12:43:54.000000Z",
  "visit": {
    "id": 67,
    "patient": {
      "id": 89,
      "first_name": "John",
      "last_name": "Doe",
      "full_name": "John Doe"
    }
  },
  "line_items": [
    {
      "item_code": "CONSULT",
      "description": "General consultation",
      "quantity": 1,
      "unit_price": 4999.95,
      "total_price": 4999.95
    }
  ]
}
```

## 🔧 Business Logic Requirements

### Payment Validation
1. **Invoice Status**: Only allow payments for invoices with status `pending` or `partially_paid`
2. **Amount Validation**: 
   - Amount must be > 0
   - Amount cannot exceed remaining balance
   - Amount must be valid decimal with 2 decimal places
3. **Method Validation**:
   - `cash`: No additional validation required
   - `mobile_money`: Phone number required, must be valid format
   - `insurance`: Insurance provider must exist and be valid

### Payment Processing
1. **Create Payment Record**: Insert payment record with status `pending`
2. **Update Invoice**: 
   - Increase `total_paid` by payment amount
   - Update `remaining_balance`
   - Update invoice status if fully paid
3. **Mobile Money Integration**: If method is `mobile_money`, initiate payment with mobile money provider
4. **Insurance Integration**: If method is `insurance`, process insurance claim

### Payment Status Updates
1. **Cash Payments**: Auto-confirm immediately
2. **Mobile Money**: Update status based on provider response
3. **Insurance**: Update status based on claim processing

## 📊 Database Schema Requirements

### Payments Table
```sql
CREATE TABLE payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    invoice_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    method ENUM('cash', 'mobile_money', 'insurance') NOT NULL,
    phone VARCHAR(20) NULL,
    insurance_id BIGINT NULL,
    notes TEXT NULL,
    status ENUM('pending', 'confirmed', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    FOREIGN KEY (insurance_id) REFERENCES insurances(id),
    INDEX idx_invoice_id (invoice_id),
    INDEX idx_status (status),
    INDEX idx_method (method)
);
```

### Invoices Table Updates
```sql
ALTER TABLE invoices ADD COLUMN total_paid DECIMAL(10,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN remaining_balance DECIMAL(10,2) GENERATED ALWAYS AS (total_amount - total_paid) STORED;
```

## 🔒 Security Requirements

### Authentication & Authorization
1. **Authentication**: JWT token required for all endpoints
2. **Authorization**: User must have permission to process payments for the facility
3. **Invoice Access**: User can only process payments for invoices from their facility

### Data Validation
1. **Input Sanitization**: All inputs must be sanitized
2. **SQL Injection Prevention**: Use parameterized queries
3. **Rate Limiting**: Limit payment processing attempts per user

### Audit Trail
1. **Payment Logging**: Log all payment attempts with user, timestamp, and result
2. **Error Logging**: Log all payment errors with full context
3. **Change Tracking**: Track all payment status changes

## 🚨 Error Handling

### HTTP Status Codes
- `200`: Payment processed successfully
- `400`: Bad request (invalid amount, method, etc.)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (no permission)
- `404`: Invoice not found
- `409`: Conflict (invoice already paid, duplicate payment)
- `422`: Validation error
- `500`: Server error

### Error Response Format
```json
{
  "message": "Payment amount exceeds remaining balance",
  "errors": {
    "amount": ["Amount cannot exceed RWF 4999.95"]
  }
}
```

## 🧪 Testing Requirements

### Unit Tests
1. **Payment Validation**: Test all validation rules
2. **Payment Processing**: Test payment creation and invoice updates
3. **Business Logic**: Test invoice status updates and balance calculations

### Integration Tests
1. **API Endpoints**: Test all endpoints with various scenarios
2. **Database Operations**: Test database transactions and rollbacks
3. **Third-party Integration**: Test mobile money and insurance integrations

### Manual Testing Scenarios
1. **Valid Payment**: Process valid payment for pending invoice
2. **Invalid Amount**: Try to pay more than remaining balance
3. **Invalid Invoice**: Try to pay for non-existent invoice
4. **Paid Invoice**: Try to pay for fully paid invoice
5. **Mobile Money**: Test mobile money payment flow
6. **Insurance**: Test insurance payment flow

## 📱 Mobile Money Integration Requirements

### Supported Providers
1. **MTN Mobile Money**: Rwanda MTN mobile money API
2. **Airtel Money**: Rwanda Airtel money API

### Integration Flow
1. **Initiate Payment**: Send payment request to provider
2. **Process Response**: Handle provider response (success/failure/pending)
3. **Update Status**: Update payment status based on provider response
4. **Webhook Handling**: Handle webhook notifications for status updates

### Webhook Endpoints
```http
POST /api/payments/webhooks/mobile-money
Content-Type: application/json
X-Webhook-Signature: {signature}
```

## 🏥 Insurance Integration Requirements

### Insurance Providers
1. **RSSB**: Rwanda Social Security Board
2. **Private Insurance**: Various private insurance providers

### Integration Flow
1. **Validate Coverage**: Check patient insurance coverage
2. **Submit Claim**: Submit insurance claim for payment
3. **Process Response**: Handle insurance company response
4. **Update Status**: Update payment status based on claim result

## 📈 Performance Requirements

### Response Times
- **Payment Processing**: < 2 seconds for cash payments
- **Mobile Money**: < 5 seconds initial response
- **Insurance**: < 10 seconds initial response

### Concurrency
- **Concurrent Payments**: Support 100+ concurrent payment processing
- **Database Locking**: Prevent duplicate payments with proper locking
- **Queue Processing**: Use queue for mobile money and insurance processing

## 🔄 Monitoring & Analytics

### Metrics to Track
1. **Payment Volume**: Number of payments per period
2. **Payment Methods**: Breakdown by payment method
3. **Processing Times**: Average processing time by method
4. **Error Rates**: Payment failure rates by method
5. **Revenue**: Total revenue processed

### Alerts
1. **High Error Rate**: Alert if error rate > 5%
2. **Slow Processing**: Alert if processing time exceeds thresholds
3. **Failed Payments**: Alert on payment failures
4. **Integration Issues**: Alert on third-party integration failures

---

## 🚀 Implementation Priority

### Phase 1: Core Functionality
- [ ] Basic payment processing (cash only)
- [ ] Invoice validation and updates
- [ ] Error handling and logging

### Phase 2: Additional Methods
- [ ] Mobile money integration
- [ ] Insurance integration
- [ ] Webhook handling

### Phase 3: Advanced Features
- [ ] Payment analytics
- [ ] Advanced monitoring
- [ ] Performance optimization

---

*This document provides comprehensive requirements for implementing the Process Payment functionality. The frontend is ready to integrate with these endpoints immediately upon implementation.*
