# Record Payment Backend Requirements

## 📋 Overview

Requirements for the **Record Payment** functionality used in the dashboard quick actions. This workflow allows users to select from pending invoices and record payments independently.

## 🔗 Current Implementation

### Frontend Component
- **Component**: `DashboardRecordPaymentModal`
- **Usage**: Dashboard quick action button
- **Flow**: Dashboard → "Record Payment" → Invoice Selection → Payment form

## 🚀 Required Backend Endpoints

### 1. Get Pending Invoices for Payment Selection
```http
GET /api/invoices?status=pending&limit=100
Authorization: Bearer {token}
```

**Purpose**: Get list of pending invoices for payment selection

**Expected Response**:
```json
{
  "data": [
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
      }
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 100
}
```

**Query Parameters**:
- `status`: Filter by invoice status (`pending`, `partially_paid`)
- `limit`: Maximum number of invoices to return
- `page`: Pagination page number

### 2. Process Payment for Selected Invoice
```http
POST /api/invoices/{invoiceId}/payments
Authorization: Bearer {token}
Content-Type: application/json
```

**Purpose**: Process a payment for the selected invoice

**Request Body**:
```json
{
  "amount": "4999.95",
  "method": "cash",
  "phone": "+250788123456",
  "notes": "Payment recorded via dashboard"
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
  "notes": "Payment recorded via dashboard",
  "status": "confirmed",
  "created_at": "2026-04-27T15:30:00.000000Z",
  "updated_at": "2026-04-27T15:30:00.000000Z"
}
```

### 3. Get Invoice Details (for validation)
```http
GET /api/invoices/{invoiceId}
Authorization: Bearer {token}
```

**Purpose**: Get detailed invoice information for validation

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

### Invoice Filtering
1. **Status Filter**: Only show invoices with status `pending` or `partially_paid`
2. **Facility Filter**: Only show invoices from the user's facility
3. **Date Filter**: Optionally filter by date range (future enhancement)
4. **Patient Filter**: Optionally filter by patient (future enhancement)

### Invoice Selection
1. **Sort Order**: Sort by creation date (newest first) or remaining balance (highest first)
2. **Pagination**: Support pagination for large numbers of invoices
3. **Search**: Support search by invoice number or patient name (future enhancement)

### Payment Validation
1. **Invoice Validation**: Ensure invoice exists and is payable
2. **Amount Validation**: 
   - Amount must be > 0
   - Amount cannot exceed remaining balance
   - Amount must be valid decimal with 2 decimal places
3. **Method Validation**:
   - `cash`: No additional validation required
   - `mobile_money`: Phone number required, must be valid format
   - `insurance`: Insurance provider must exist and be valid

### Payment Processing
1. **Create Payment Record**: Insert payment record with appropriate status
2. **Update Invoice**: 
   - Increase `total_paid` by payment amount
   - Update `remaining_balance`
   - Update invoice status if fully paid
3. **Audit Trail**: Log payment creation with user context
4. **Notifications**: Send notifications for successful payments (future enhancement)

## 📊 Database Schema Requirements

### Invoices Table
```sql
CREATE TABLE invoices (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    visit_id BIGINT NOT NULL,
    status ENUM('pending', 'partially_paid', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    total_paid DECIMAL(10,2) DEFAULT 0,
    remaining_balance DECIMAL(10,2) GENERATED ALWAYS AS (total_amount - total_paid) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (visit_id) REFERENCES visits(id),
    INDEX idx_status (status),
    INDEX idx_remaining_balance (remaining_balance),
    INDEX idx_created_at (created_at),
    INDEX idx_facility_id (facility_id) -- If facility-specific filtering needed
);
```

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
    user_id BIGINT NOT NULL, -- User who recorded the payment
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (insurance_id) REFERENCES insurances(id),
    INDEX idx_invoice_id (invoice_id),
    INDEX idx_status (status),
    INDEX idx_method (method),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);
```

## 🔒 Security Requirements

### Authentication & Authorization
1. **Authentication**: JWT token required for all endpoints
2. **Authorization**: User must have permission to record payments
3. **Facility Access**: User can only see invoices from their facility
4. **Payment Permissions**: User must have payment recording permissions

### Data Validation
1. **Input Sanitization**: All inputs must be sanitized
2. **SQL Injection Prevention**: Use parameterized queries
3. **Amount Validation**: Validate decimal amounts to prevent injection
4. **Phone Validation**: Validate phone number format

### Audit & Logging
1. **Payment Logging**: Log all payment attempts with full context
2. **User Actions**: Track which user recorded which payment
3. **Access Logging**: Log all invoice list access
4. **Error Logging**: Detailed error logging for debugging

## 🚨 Error Handling

### HTTP Status Codes
- `200`: Success (invoices fetched, payment processed)
- `400`: Bad request (invalid amount, method, etc.)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (no permission to access invoices or record payments)
- `404`: Invoice not found
- `409`: Conflict (duplicate payment, invoice status conflict)
- `422`: Validation error
- `500`: Server error

### Error Response Format
```json
{
  "message": "Payment amount exceeds remaining balance",
  "errors": {
    "amount": ["Amount cannot exceed RWF 4999.95"],
    "invoiceId": ["Invoice is already fully paid"]
  }
}
```

### Specific Error Scenarios
1. **No Pending Invoices**: Return empty array with appropriate message
2. **Invalid Invoice ID**: Return 404 with clear error message
3. **Amount Exceeds Balance**: Return 422 with validation error
4. **Invoice Already Paid**: Return 409 with conflict message
5. **Payment Processing Failed**: Return 500 with error details

## 🧪 Testing Requirements

### Unit Tests
1. **Invoice Filtering**: Test status and facility filtering
2. **Payment Validation**: Test all validation rules
3. **Payment Processing**: Test payment creation and invoice updates
4. **Business Logic**: Test invoice status updates and balance calculations

### Integration Tests
1. **API Endpoints**: Test all endpoints with various scenarios
2. **Database Operations**: Test database transactions and rollbacks
3. **Error Handling**: Test all error scenarios
4. **Permission Testing**: Test user permissions and access control

### Manual Testing Scenarios
1. **Valid Payment**: Select pending invoice and record valid payment
2. **Invalid Amount**: Try to pay more than remaining balance
3. **Invalid Invoice**: Try to pay for non-existent invoice
4. **No Invoices**: Test when no pending invoices exist
5. **Mobile Money**: Test mobile money payment flow
6. **Insurance**: Test insurance payment flow

## 📱 Mobile Money Integration Requirements

### Enhanced Integration for Dashboard
1. **Provider Selection**: Allow selection of mobile money provider
2. **Instant Confirmation**: Provide immediate feedback for mobile money payments
3. **Retry Logic**: Implement retry for failed mobile money payments
4. **Status Tracking**: Track mobile money payment status in real-time

### Webhook Enhancements
```http
POST /api/payments/webhooks/mobile-money
Content-Type: application/json
X-Webhook-Signature: {signature}
```

**Webhook Payload**:
```json
{
  "payment_id": 123,
  "status": "confirmed",
  "transaction_id": "MTN123456789",
  "provider": "mtn",
  "processed_at": "2026-04-27T15:35:00.000000Z"
}
```

## 🏥 Insurance Integration Requirements

### Insurance Provider Management
1. **Provider List**: Get list of available insurance providers
2. **Coverage Validation**: Validate patient insurance coverage
3. **Claim Processing**: Process insurance claims automatically
4. **Status Updates**: Track claim status in real-time

### Insurance Endpoints
```http
GET /api/insurances
Authorization: Bearer {token}
```

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "name": "RSSB",
      "code": "RSSB",
      "is_active": true
    },
    {
      "id": 2,
      "name": "Mutuelle de Santé",
      "code": "MUTUELLE",
      "is_active": true
    }
  ]
}
```

## 📈 Performance Requirements

### Response Times
- **Invoice List**: < 1 second for 100 invoices
- **Payment Processing**: < 2 seconds for cash payments
- **Mobile Money**: < 5 seconds initial response
- **Insurance**: < 10 seconds initial response

### Database Optimization
1. **Indexing**: Proper indexes on status, remaining_balance, created_at
2. **Query Optimization**: Optimized queries for invoice filtering
3. **Caching**: Cache frequently accessed invoice data
4. **Pagination**: Efficient pagination for large datasets

### Concurrency
1. **Concurrent Payments**: Support 50+ concurrent payment processing
2. **Race Condition Prevention**: Prevent duplicate payments
3. **Database Locking**: Proper locking for invoice updates
4. **Queue Processing**: Use queue for mobile money and insurance processing

## 🔄 Real-time Updates

### WebSocket Integration (Future Enhancement)
1. **Payment Status**: Real-time payment status updates
2. **Invoice Updates**: Real-time invoice status changes
3. **Dashboard Updates**: Live dashboard statistics
4. **Notifications**: Real-time payment notifications

### Event Broadcasting
```javascript
// Example WebSocket event
{
  "event": "payment_processed",
  "data": {
    "payment_id": 123,
    "invoice_id": 45,
    "amount": 4999.95,
    "user": "John Doe"
  }
}
```

## 📊 Analytics & Reporting

### Payment Analytics
1. **Payment Volume**: Number of payments per period
2. **Payment Methods**: Breakdown by payment method
3. **Processing Times**: Average processing time by method
4. **User Activity**: Payment recording by user
5. **Revenue Tracking**: Total revenue processed

### Dashboard Metrics
1. **Pending Payments**: Number of pending payments
2. **Success Rate**: Payment success rate by method
3. **Average Amount**: Average payment amount
4. **Peak Times**: Peak payment recording times

## 🚨 Monitoring & Alerts

### Key Metrics
1. **Payment Success Rate**: Monitor payment success rate
2. **Error Rates**: Track payment error rates
3. **Response Times**: Monitor API response times
4. **Database Performance**: Monitor database query performance

### Alert Conditions
1. **High Error Rate**: Alert if error rate > 5%
2. **Slow Response**: Alert if response time exceeds thresholds
3. **Failed Payments**: Alert on payment failures
4. **Database Issues**: Alert on database performance issues

## 📱 Mobile Responsiveness

### Frontend Requirements
1. **Responsive Design**: Modal works on mobile devices
2. **Touch Interface**: Optimized for touch interactions
3. **Loading States**: Proper loading indicators
4. **Error Display**: Clear error messages on mobile

### Performance
1. **Fast Loading**: Invoice list loads quickly on mobile
2. **Efficient Rendering**: Optimized rendering for mobile devices
3. **Offline Support**: Basic offline support (future enhancement)

---

## 🚀 Implementation Priority

### Phase 1: Core Functionality
- [ ] Get pending invoices endpoint
- [ ] Basic payment processing
- [ ] Invoice validation and updates
- [ ] Error handling and logging

### Phase 2: Enhanced Features
- [ ] Mobile money integration
- [ ] Insurance integration
- [ ] Search and filtering
- [ ] Real-time updates

### Phase 3: Advanced Features
- [ ] Analytics and reporting
- [ ] Advanced monitoring
- [ ] Offline support
- [ ] Mobile optimizations

---

## 📋 Testing Checklist

### Pre-deployment Testing
- [ ] All endpoints tested with various scenarios
- [ ] Error handling tested for all edge cases
- [ ] Performance tested under load
- [ ] Security testing completed
- [ ] Mobile responsiveness tested

### Post-deployment Monitoring
- [ ] Error rates monitored
- [ ] Performance metrics tracked
- [ ] User feedback collected
- [ ] System health monitored

---

*This document provides comprehensive requirements for implementing the Record Payment functionality for the dashboard. The frontend is ready to integrate with these endpoints immediately upon implementation.*
