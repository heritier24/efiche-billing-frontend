# Backend API Requirements - Complete Implementation Guide

## 🎯 Overview

This document outlines all the **missing API endpoints** that need to be implemented in the Laravel backend to make the eFiche billing frontend fully functional. The frontend is 95% complete but requires these specific endpoints for complete integration.

## 📋 Current Status

### ✅ **Already Implemented (From Your Previous API Doc)**
- `GET /visits/{visitId}/invoice` - Invoice details
- `POST /invoices/{invoiceId}/payments` - Payment processing
- `GET /facilities/{facilityId}/insurances` - Facility insurances
- `GET /dashboard/stats` - Dashboard statistics
- `GET /dashboard/payment-stats` - Payment statistics
- `GET /dashboard/top-patients` - Top patients
- `POST /webhooks/efichepay` - Mobile money webhooks

### ❌ **Missing Critical APIs** (This Document)

---

## 🔐 **1. Authentication APIs** ⭐ **PRIORITY 1 - CRITICAL**

The frontend authentication system is completely non-functional without these endpoints.

### Required Endpoints

#### **POST /api/auth/login**
**Purpose**: User authentication
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response**:
```json
{
  "success": true,
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin|user|finance",
    "avatar": "https://example.com/avatar.jpg"
  },
  "expires_in": 3600
}
```

#### **POST /api/auth/logout**
**Purpose**: User logout
**Headers**: `Authorization: Bearer {token}`
**Response**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### **POST /api/auth/register**
**Purpose**: User registration
**Request Body**:
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "role": "user"
}
```
**Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "user"
  }
}
```

#### **GET /api/auth/me**
**Purpose**: Get current authenticated user
**Headers**: `Authorization: Bearer {token}`
**Response**:
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin|user|finance",
  "avatar": "https://example.com/avatar.jpg",
  "created_at": "2024-01-01T00:00:00Z",
  "last_login": "2024-04-26T10:30:00Z"
}
```

---

## 📊 **2. Dashboard Enhancement APIs** ⭐ **PRIORITY 1 - CRITICAL**

The dashboard page needs additional data for complete functionality.

### Required Endpoints

#### **GET /api/dashboard/recent-invoices**
**Purpose**: Recent invoices for dashboard display
**Headers**: `Authorization: Bearer {token}`
**Query Parameters**: `?limit=10&status=pending`
**Response**:
```json
{
  "data": [
    {
      "id": 123,
      "invoice_number": "INV-2024-001",
      "patient_name": "John Doe",
      "total_amount": 50000.00,
      "status": "pending",
      "created_at": "2024-04-26T10:30:00Z",
      "due_date": "2024-05-03T23:59:59Z"
    }
  ],
  "total": 25,
  "unread_count": 5
}
```

#### **GET /api/dashboard/upcoming-payments**
**Purpose**: Upcoming payment reminders
**Headers**: `Authorization: Bearer {token}`
**Response**:
```json
{
  "data": [
    {
      "id": 123,
      "invoice_number": "INV-2024-001",
      "patient_name": "John Doe",
      "amount_due": 15000.00,
      "due_date": "2024-04-28T23:59:59Z",
      "days_overdue": 2,
      "patient_phone": "+250788123456"
    }
  ],
  "total_overdue": 8,
  "total_due_this_week": 15
}
```

#### **GET /api/dashboard/monthly-revenue**
**Purpose**: Monthly revenue trends
**Headers**: `Authorization: Bearer {token}`
**Query Parameters**: `?months=12`
**Response**:
```json
{
  "data": [
    {
      "month": "2024-01",
      "revenue": 2500000.00,
      "invoices_count": 45,
      "growth_rate": 12.5
    }
  ],
  "current_month": {
    "month": "2024-04",
    "revenue": 3200000.00,
    "invoices_count": 62,
    "growth_rate": 8.3
  },
  "year_total": 12400000.00
}
```

---

## 👥 **3. Patient Management APIs** ⭐ **PRIORITY 2 - IMPORTANT**

The patient dashboard and modals need these endpoints for CRUD operations.

### Required Endpoints

#### **GET /api/patients**
**Purpose**: List patients with search and filters
**Headers**: `Authorization: Bearer {token}`
**Query Parameters**: `?search=john&status=active&page=1&limit=20`
**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+250788123456",
      "date_of_birth": "1985-06-15",
      "gender": "male",
      "address": "Kigali, Kicukiro, KG 123 Ave",
      "insurance_name": "RSSB",
      "registration_date": "2024-01-15",
      "last_visit_date": "2024-04-20",
      "total_visits": 12,
      "total_billed": 450000.00,
      "total_paid": 380000.00,
      "outstanding_balance": 70000.00,
      "status": "active"
    }
  ],
  "total": 150,
  "per_page": 20,
  "current_page": 1,
  "last_page": 8
}
```

#### **POST /api/patients**
**Purpose**: Create new patient
**Headers**: `Authorization: Bearer {token}`
**Request Body**:
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+250733987654",
  "date_of_birth": "1990-03-22",
  "gender": "female",
  "address": "Kigali, Gasabo, KN 456 St",
  "insurance_id": 2
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "id": 151,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+250733987654",
    "date_of_birth": "1990-03-22",
    "gender": "female",
    "address": "Kigali, Gasabo, KN 456 St",
    "insurance_name": "MMI",
    "registration_date": "2024-04-26",
    "status": "active"
  }
}
```

#### **GET /api/patients/{id}**
**Purpose**: Get patient details
**Headers**: `Authorization: Bearer {token}`
**Response**:
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+250788123456",
  "date_of_birth": "1985-06-15",
  "gender": "male",
  "address": "Kigali, Kicukiro, KG 123 Ave",
  "insurance_id": 1,
  "insurance_name": "RSSB",
  "registration_date": "2024-01-15",
  "last_visit_date": "2024-04-20",
  "total_visits": 12,
  "total_billed": 450000.00,
  "total_paid": 380000.00,
  "outstanding_balance": 70000.00,
  "status": "active",
  "visits": [
    {
      "id": 123,
      "visit_date": "2024-04-20",
      "visit_type": "consultation",
      "status": "completed"
    }
  ]
}
```

#### **PUT /api/patients/{id}**
**Purpose**: Update patient information
**Headers**: `Authorization: Bearer {token}`
**Request Body**:
```json
{
  "name": "John Doe Updated",
  "email": "john.doe@example.com",
  "phone": "+250788123456",
  "address": "Kigali, Nyarugenge, KK 789 St",
  "insurance_id": 2
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe Updated",
    "email": "john.doe@example.com",
    "phone": "+250788123456",
    "address": "Kigali, Nyarugenge, KK 789 St",
    "insurance_name": "MMI",
    "updated_at": "2024-04-26T11:00:00Z"
  }
}
```

#### **GET /api/patients/{id}/visits**
**Purpose**: Patient visit history
**Headers**: `Authorization: Bearer {token}`
**Response**:
```json
{
  "data": [
    {
      "id": 123,
      "visit_date": "2024-04-20",
      "visit_type": "consultation",
      "status": "completed",
      "invoice_id": 456,
      "invoice_number": "INV-2024-001",
      "total_amount": 50000.00,
      "paid_amount": 35000.00
    }
  ],
  "total": 12,
  "last_visit": "2024-04-20"
}
```

---

## 📋 **4. Invoice Management APIs** ⭐ **PRIORITY 2 - IMPORTANT**

The invoice dashboard and modals need these endpoints for complete invoice operations.

### Required Endpoints

#### **GET /api/invoices**
**Purpose**: List invoices with advanced filtering
**Headers**: `Authorization: Bearer {token}`
**Query Parameters**: `?search=john&status=pending&date_from=2024-04-01&date_to=2024-04-30&page=1&limit=20`
**Response**:
```json
{
  "data": [
    {
      "id": 123,
      "invoice_number": "INV-2024-001",
      "patient_name": "John Doe",
      "visit_id": 456,
      "invoice_date": "2024-04-20",
      "due_date": "2024-04-27",
      "status": "pending",
      "total_amount": 50000.00,
      "amount_paid": 0.00,
      "remaining_balance": 50000.00,
      "line_items_count": 3,
      "last_payment_date": null
    }
  ],
  "total": 156,
  "per_page": 20,
  "current_page": 1,
  "last_page": 8
}
```

#### **POST /api/invoices**
**Purpose**: Create new invoice
**Headers**: `Authorization: Bearer {token}`
**Request Body**:
```json
{
  "visit_id": 456,
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
**Response**:
```json
{
  "success": true,
  "data": {
    "id": 157,
    "invoice_number": "INV-2024-001",
    "visit_id": 456,
    "status": "pending",
    "total_amount": 23000.00,
    "insurance_coverage": 18400.00,
    "patient_responsibility": 4600.00,
    "due_date": "2024-05-03",
    "created_at": "2024-04-26T11:00:00Z",
    "line_items": [...]
  }
}
```

#### **GET /api/invoices/{id}**
**Purpose**: Get invoice details
**Headers**: `Authorization: Bearer {token}`
**Response**:
```json
{
  "id": 123,
  "invoice_number": "INV-2024-001",
  "visit_id": 456,
  "status": "pending",
  "total_amount": 50000.00,
  "insurance_coverage": 40000.00,
  "patient_responsibility": 10000.00,
  "total_paid": 0.00,
  "remaining_balance": 10000.00,
  "due_date": "2024-04-27",
  "created_at": "2024-04-20T10:30:00Z",
  "line_items": [
    {
      "id": 1,
      "item_code": "CONS-001",
      "description": "General Consultation",
      "quantity": 1,
      "unit_price": 15000.00,
      "total_price": 15000.00
    }
  ],
  "payments": [],
  "visit": {
    "id": 456,
    "patient": {
      "id": 1,
      "name": "John Doe",
      "phone": "+250788123456"
    }
  }
}
```

#### **POST /api/invoices/{id}/send-reminder**
**Purpose**: Send payment reminder to patient
**Headers**: `Authorization: Bearer {token}`
**Request Body**:
```json
{
  "method": "sms|email|both",
  "message": "Reminder: Your invoice INV-2024-001 is due on 2024-04-27"
}
```
**Response**:
```json
{
  "success": true,
  "message": "Reminder sent successfully",
  "sent_via": ["sms"],
  "sent_at": "2024-04-26T11:00:00Z"
}
```

---

## 💳 **5. Payment Management APIs** ⭐ **PRIORITY 2 - IMPORTANT**

The payment dashboard needs these endpoints for complete payment tracking.

### Required Endpoints

#### **GET /api/payments**
**Purpose**: List payments with filtering
**Headers**: `Authorization: Bearer {token}`
**Query Parameters**: `?search=john&method=mobile_money&status=confirmed&date_from=2024-04-01&page=1&limit=20`
**Response**:
```json
{
  "data": [
    {
      "id": 789,
      "invoice_id": 123,
      "invoice_number": "INV-2024-001",
      "patient_name": "John Doe",
      "amount": 10000.00,
      "method": "mobile_money",
      "status": "confirmed",
      "transaction_ref": "MTN-20240426103500-ABC123",
      "processed_at": "2024-04-26T10:35:00Z",
      "confirmed_at": "2024-04-26T10:36:00Z",
      "processed_by": "Cashier Jane",
      "notes": "Mobile money payment"
    }
  ],
  "total": 180,
  "per_page": 20,
  "current_page": 1,
  "last_page": 9
}
```

#### **GET /api/payments/{id}**
**Purpose**: Get payment details
**Headers**: `Authorization: Bearer {token}`
**Response**:
```json
{
  "id": 789,
  "invoice_id": 123,
  "amount": 10000.00,
  "method": "mobile_money",
  "status": "confirmed",
  "transaction_ref": "MTN-20240426103500-ABC123",
  "processed_at": "2024-04-26T10:35:00Z",
  "confirmed_at": "2024-04-26T10:36:00Z",
  "cashier_id": 2,
  "processed_by": "Cashier Jane",
  "notes": "Mobile money payment",
  "invoice": {
    "id": 123,
    "invoice_number": "INV-2024-001",
    "patient_name": "John Doe"
  }
}
```

#### **POST /api/payments/{id}/refund**
**Purpose**: Refund a payment
**Headers**: `Authorization: Bearer {token}`
**Request Body**:
```json
{
  "amount": 5000.00,
  "reason": "Patient overpayment",
  "refund_method": "cash|mobile_money|bank_transfer"
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "refund_id": "REF-001",
    "amount": 5000.00,
    "status": "processed",
    "processed_at": "2024-04-26T11:00:00Z"
  }
}
```

---

## 🏥 **6. Visit Management APIs** ⭐ **PRIORITY 3 - NICE TO HAVE**

### Required Endpoints

#### **GET /api/visits**
**Purpose**: List visits
**Headers**: `Authorization: Bearer {token}`
**Query Parameters**: `?patient_id=123&status=completed&page=1&limit=20`
**Response**:
```json
{
  "data": [
    {
      "id": 456,
      "patient_id": 1,
      "patient_name": "John Doe",
      "visit_type": "consultation",
      "status": "completed",
      "created_at": "2024-04-20T09:00:00Z",
      "completed_at": "2024-04-20T10:30:00Z",
      "invoice_id": 123,
      "invoice_number": "INV-2024-001"
    }
  ],
  "total": 45,
  "per_page": 20,
  "current_page": 1
}
```

#### **POST /api/visits**
**Purpose**: Create new visit
**Headers**: `Authorization: Bearer {token}`
**Request Body**:
```json
{
  "patient_id": 1,
  "visit_type": "consultation",
  "facility_id": 1
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "id": 457,
    "patient_id": 1,
    "visit_type": "consultation",
    "status": "active",
    "created_at": "2024-04-26T11:00:00Z"
  }
}
```

---

## ⚙️ **7. Settings & User Management APIs** ⭐ **PRIORITY 3 - NICE TO HAVE**

### Required Endpoints

#### **GET /api/users**
**Purpose**: List users for admin management
**Headers**: `Authorization: Bearer {token}`
**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin",
      "status": "active",
      "last_login": "2024-04-26T10:30:00Z",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 5
}
```

#### **POST /api/users**
**Purpose**: Create new user
**Headers**: `Authorization: Bearer {token}`
**Request Body**:
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "user",
  "status": "active"
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "id": 6,
    "name": "New User",
    "email": "newuser@example.com",
    "role": "user",
    "status": "active",
    "created_at": "2024-04-26T11:00:00Z"
  }
}
```

#### **GET /api/roles**
**Purpose**: List available roles
**Headers**: `Authorization: Bearer {token}`
**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "name": "admin",
      "description": "Full system access",
      "permissions": ["users", "patients", "invoices", "payments", "settings"]
    },
    {
      "id": 2,
      "name": "finance",
      "description": "Billing and payments access",
      "permissions": ["patients", "invoices", "payments"]
    },
    {
      "id": 3,
      "name": "user",
      "description": "Basic access",
      "permissions": ["patients", "invoices"]
    }
  ]
}
```

---

## 🔧 **Implementation Requirements**

### **Authentication & Security**
- All endpoints (except auth) require `Authorization: Bearer {token}` header
- Use JWT tokens with 1-hour expiration
- Implement token refresh mechanism
- Rate limiting for auth endpoints
- Password hashing with bcrypt

### **Response Format Standards**
```json
{
  "success": true|false,
  "data": {...}, // for successful responses
  "message": "Human readable message",
  "errors": {...} // for validation errors
}
```

### **Pagination Standard**
```json
{
  "data": [...],
  "total": 150,
  "per_page": 20,
  "current_page": 1,
  "last_page": 8
}
```

### **Error Handling**
- **400**: Validation errors
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not found
- **422**: Business logic errors
- **500**: Server errors

### **Rwanda-Specific Requirements**
- **Currency**: All amounts in RWF (decimal format)
- **Phone Numbers**: Validate `+2507xxxxxxxx` format
- **Date Format**: ISO 8601 UTC
- **Insurance**: Support RSSB, MMI, MediCare Rwanda

---

## 📅 **Implementation Priority Timeline**

### **Week 1: Critical APIs**
1. **Authentication System** (4 days)
   - Login, logout, register, current user
   - JWT token management
   - Middleware for protected routes

2. **Dashboard Enhancement** (3 days)
   - Recent invoices
   - Upcoming payments
   - Monthly revenue

### **Week 2: Core Business Logic**
1. **Patient Management** (4 days)
   - CRUD operations
   - Search and filtering
   - Visit history

2. **Invoice Management** (3 days)
   - Invoice listing and creation
   - Payment reminders
   - Advanced filtering

### **Week 3: Advanced Features**
1. **Payment Management** (3 days)
   - Payment history
   - Refund processing
   - Reconciliation reports

2. **Settings & Admin** (2 days)
   - User management
   - Role management
   - System settings

---

## 🧪 **Testing Examples**

### **Authentication Test**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@efiche.rw",
    "password": "password123"
  }'
```

### **Patient Creation Test**
```bash
curl -X POST http://localhost:8000/api/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "name": "Test Patient",
    "email": "test@example.com",
    "phone": "+250788123456",
    "date_of_birth": "1990-01-01",
    "gender": "male",
    "address": "Kigali, Rwanda"
  }'
```

### **Invoice Creation Test**
```bash
curl -X POST http://localhost:8000/api/invoices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "visit_id": 1,
    "line_items": [
      {
        "item_code": "CONS-001",
        "description": "General Consultation",
        "quantity": 1,
        "unit_price": 15000.00
      }
    ],
    "due_date": "2024-05-03"
  }'
```

---

## 🎯 **Success Criteria**

### **Phase 1 Complete When:**
- ✅ Users can login/logout
- ✅ Dashboard shows real data
- ✅ Recent invoices and payments visible

### **Phase 2 Complete When:**
- ✅ Full patient CRUD operations
- ✅ Invoice creation and management
- ✅ Payment processing works end-to-end

### **Phase 3 Complete When:**
- ✅ All frontend features functional
- ✅ Admin panel operational
- ✅ System ready for production

---

## 📞 **Support & Questions**

For any clarification on these requirements:
- **Frontend Integration**: Refer to existing frontend code structure
- **Database Schema**: See technical challenge solution document
- **API Format**: Follow existing backend API documentation patterns

**The frontend is ready and waiting for these endpoints! Let's make the eFiche billing system fully functional!** 🇷🇼💼
