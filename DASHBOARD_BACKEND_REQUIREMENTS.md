# Dashboard Backend API Requirements

## 📊 Overview
The dashboard page requires several backend endpoints to display real-time statistics and recent activity. Currently, the frontend is using mock data and needs proper backend integration.

## 🚨 Critical Backend Endpoints Needed

### 1. **Dashboard Statistics Endpoint**
```
GET /api/dashboard/stats
```

**Purpose**: Provide aggregated statistics for the dashboard overview cards

**Expected Response**:
```json
{
  "total_invoices": 1250,
  "total_revenue": 45000000,
  "pending_invoices": 85,
  "active_patients": 156,
  "monthly_stats": {
    "current_month": {
      "invoices": 120,
      "revenue": 5400000,
      "patients": 45
    },
    "previous_month": {
      "invoices": 108,
      "revenue": 5000000,
      "patients": 38
    }
  },
  "payment_methods_breakdown": {
    "cash": 45,
    "mobile_money": 35,
    "insurance": 20
  }
}
```

**Fields Required**:
- `total_invoices`: Total number of invoices in the system
- `total_revenue`: Total revenue from all confirmed payments (in RWF)
- `pending_invoices`: Number of invoices with pending or partially paid status
- `active_patients`: Number of patients with recent visits (last 30 days)
- `monthly_stats`: Comparative stats for current vs previous month
- `payment_methods_breakdown`: Percentage breakdown by payment method

### 2. **Recent Invoices Endpoint**
```
GET /api/dashboard/recent-invoices?limit=5
```

**Purpose**: Fetch recent invoices for the dashboard sidebar

**Expected Response**:
```json
{
  "data": [
    {
      "id": 1250,
      "invoice_number": "INV-2024-1250",
      "visit_id": 890,
      "status": "paid",
      "total_amount": 75000,
      "total_paid": 75000,
      "remaining_balance": 0,
      "created_at": "2024-04-27T10:30:00Z",
      "visit": {
        "id": 890,
        "patient": {
          "id": 456,
          "first_name": "John",
          "last_name": "Doe",
          "full_name": "John Doe"
        }
      },
      "line_items": [
        {
          "item_code": "CONSULTATION",
          "description": "General Consultation",
          "quantity": 1,
          "unit_price": 50000,
          "total_price": 50000
        }
      ]
    }
  ],
  "total": 1250
}
```

**Fields Required**:
- `id`: Invoice ID
- `invoice_number`: Human-readable invoice number
- `status`: Invoice status (pending, partially_paid, paid, overdue)
- `total_amount`: Total invoice amount
- `total_paid`: Amount already paid
- `remaining_balance`: Outstanding balance
- `created_at`: Invoice creation timestamp
- `visit.patient`: Associated patient information
- `line_items`: Invoice line items (optional for dashboard)

### 3. **Active Patients Endpoint**
```
GET /api/dashboard/active-patients
```

**Purpose**: Count of patients with recent activity (visits, appointments, payments)

**Expected Response**:
```json
{
  "active_patients": 156,
  "period": "30_days",
  "breakdown": {
    "new_patients": 23,
    "returning_patients": 133,
    "patients_with_visits": 145,
    "patients_with_payments": 89
  }
}
```

**Fields Required**:
- `active_patients`: Total active patients count
- `period`: Time period for the count (30 days, 7 days, etc.)
- `breakdown`: Detailed breakdown of patient activity types

### 4. **Revenue Summary Endpoint**
```
GET /api/dashboard/revenue-summary?period=30d
```

**Purpose**: Revenue statistics for dashboard display

**Expected Response**:
```json
{
  "total_revenue": 45000000,
  "period": "30_days",
  "daily_average": 1500000,
  "growth_rate": 8.5,
  "by_payment_method": {
    "cash": {
      "amount": 20250000,
      "count": 225,
      "percentage": 45
    },
    "mobile_money": {
      "amount": 15750000,
      "count": 175,
      "percentage": 35
    },
    "insurance": {
      "amount": 9000000,
      "count": 100,
      "percentage": 20
    }
  },
  "daily_breakdown": [
    {
      "date": "2024-04-27",
      "revenue": 1800000,
      "transactions": 12
    }
  ]
}
```

**Fields Required**:
- `total_revenue`: Total revenue for the period
- `daily_average`: Average daily revenue
- `growth_rate`: Percentage growth from previous period
- `by_payment_method`: Revenue breakdown by payment method
- `daily_breakdown`: Daily revenue data (optional for charts)

## 🔄 Existing Endpoints Being Used

The dashboard is already using these existing endpoints successfully:

### ✅ Working Endpoints
1. **GET /api/payments/summary** - Payment statistics
2. **GET /api/facilities/{id}/insurances** - Insurance providers
3. **GET /api/invoices** - Recent invoices (with limit=5)
4. **GET /api/patients** - Patient list for modals
5. **POST /api/patients** - Create new patient
6. **POST /api/invoices** - Create new invoice
7. **POST /api/invoices/{id}/payments** - Process payments

## 📋 Implementation Priority

### 🔴 High Priority (Critical for Dashboard)
1. **GET /api/dashboard/stats** - Main statistics endpoint
2. **GET /api/dashboard/active-patients** - Active patients count
3. **GET /api/dashboard/revenue-summary** - Revenue analytics

### 🟡 Medium Priority (Enhanced Features)
4. **GET /api/dashboard/recent-invoices** - Optimized recent invoices
5. **GET /api/dashboard/payment-trends** - Payment method trends
6. **GET /api/dashboard/patient-analytics** - Patient demographics

### 🟢 Low Priority (Future Enhancements)
7. **GET /api/dashboard/performance-metrics** - System performance
8. **GET /api/dashboard/alerts** - System alerts and notifications

## 🎯 Frontend Integration Notes

### Current Frontend Implementation
- ✅ Uses real API calls instead of mock data
- ✅ Proper error handling with fallback to empty states
- ✅ Loading states for all data fetching
- ✅ Real-time updates after CRUD operations
- ✅ Responsive design for mobile and desktop

### Data Transformations Required
The frontend transforms backend data to match the expected format:

```typescript
// Dashboard Stats Transformation
{
  total_invoices: stats.total_invoices,
  total_revenue: stats.total_revenue,
  pending_invoices: stats.pending_invoices,
  active_patients: stats.active_patients
}

// Invoice Transformation
{
  id: invoice.id.toString(),
  patientName: invoice.visit?.patient?.full_name || 'Unknown Patient',
  totalAmount: invoice.total_amount || 0,
  status: invoice.status
}
```

## 🚀 Testing Requirements

### Manual Testing Scenarios
1. **Dashboard Loading**: Verify all stats load correctly
2. **Real-time Updates**: Confirm stats update after CRUD operations
3. **Error Handling**: Test behavior when endpoints fail
4. **Performance**: Ensure dashboard loads quickly (< 2 seconds)
5. **Mobile Responsiveness**: Test on mobile devices

### API Testing
```bash
# Test dashboard stats
curl -H "Authorization: Bearer {token}" \
     http://localhost:8000/api/dashboard/stats

# Test recent invoices
curl -H "Authorization: Bearer {token}" \
     http://localhost:8000/api/dashboard/recent-invoices?limit=5

# Test active patients
curl -H "Authorization: Bearer {token}" \
     http://localhost:8000/api/dashboard/active-patients
```

## 📊 Database Queries Needed

### Dashboard Stats Query
```sql
SELECT 
  COUNT(DISTINCT i.id) as total_invoices,
  COALESCE(SUM(p.amount), 0) as total_revenue,
  COUNT(DISTINCT CASE WHEN i.status IN ('pending', 'partially_paid') THEN i.id END) as pending_invoices,
  COUNT(DISTINCT CASE WHEN v.created_at >= NOW() - INTERVAL '30 days' THEN v.patient_id END) as active_patients
FROM invoices i
LEFT JOIN payments p ON i.id = p.invoice_id AND p.status = 'confirmed'
LEFT JOIN visits v ON i.visit_id = v.id
WHERE i.created_at >= NOW() - INTERVAL '30 days';
```

### Active Patients Query
```sql
SELECT COUNT(DISTINCT v.patient_id) as active_patients
FROM visits v
WHERE v.created_at >= NOW() - INTERVAL '30 days'
AND v.status = 'completed';
```

## 🔐 Security Considerations

### Authentication Required
All dashboard endpoints must require valid JWT authentication:
```http
Authorization: Bearer {jwt_token}
```

### Authorization Levels
- **Admin**: Full access to all dashboard statistics
- **Cashier**: Access to payment-related stats only
- **Staff**: Read-only access to basic statistics

### Rate Limiting
Consider rate limiting for dashboard endpoints to prevent abuse:
```php
// Example: 60 requests per minute per user
RateLimiter::perMinute(60)->by($request->user());
```

## 📱 Mobile Optimization

The dashboard is designed to work on mobile devices. Ensure:
- Fast API responses (< 500ms for dashboard stats)
- Efficient data transfer (only necessary fields)
- Proper error handling for poor connectivity

## 🎨 UI/UX Requirements

### Loading States
- Show skeleton loaders while fetching data
- Display appropriate empty states when no data exists
- Handle network errors gracefully with retry options

### Real-time Updates
- Stats should update immediately after CRUD operations
- Consider WebSocket implementation for real-time updates in future versions

---

## 📞 Contact Information

**Frontend Team**: Ready to integrate these endpoints immediately
**Backend Contact**: Please implement these endpoints for full dashboard functionality
**Testing**: Frontend team will test all endpoints upon implementation

**Priority**: High - Dashboard is the main landing page and critical for user experience

---

*This document outlines the minimum backend requirements for a fully functional dashboard. Additional features can be added in future iterations.*
