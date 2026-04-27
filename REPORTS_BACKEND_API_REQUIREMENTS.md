# Reports Backend API Requirements

## 📋 Overview

This document outlines backend API requirements for comprehensive reports and analytics system that supports billing insights, revenue tracking, and business intelligence for the healthcare billing system.

## 🎯 Frontend Reports Features

### **Current Implementation**
The frontend now provides comprehensive reports with:
- **Summary Dashboard** - Revenue, invoices, payments, and patient metrics
- **Payment Method Breakdown** - Analysis by cash, mobile money, insurance
- **Date Range Filtering** - Daily, weekly, monthly, quarterly, yearly views
- **Export Functionality** - PDF and Excel export capabilities
- **Real-time Updates** - Dynamic data refresh with API integration

### **Report Types Supported**
1. **Overview Report** - Complete system summary with key metrics
2. **Revenue Report** - Detailed revenue analysis with trends and growth
3. **Payments Report** - Payment status, methods, and transaction analysis
4. **Patients Report** - Patient acquisition, retention, and activity metrics

## 🔧 Backend API Requirements

### **1. Reports Summary Endpoint**
**Endpoint**: `GET /api/reports/summary`

**Purpose**: Get comprehensive summary statistics for dashboard

**Query Parameters**:
```json
{
  "date_from": "required (ISO date string)",
  "date_to": "required (ISO date string)",
  "facility_id": "optional (integer)",
  "cashier_id": "optional (integer)"
}
```

**Response Format**:
```json
{
  "success": true,
  "data": {
    "total_revenue": 2500000,
    "total_invoices": 156,
    "total_payments": 142,
    "average_payment_amount": 17605,
    "pending_invoices": 23,
    "overdue_invoices": 8,
    "growth_rate": {
      "revenue": 12.5,
      "payments": 8.3,
      "invoices": 6.7
    },
    "period_comparison": {
      "previous_period": {
        "revenue": 2222222,
        "payments": 131,
        "invoices": 146
      },
      "change_percentages": {
        "revenue": 12.5,
        "payments": 8.3,
        "invoices": 6.7
      }
    }
  }
}
```

### **2. Payment Method Breakdown Endpoint**
**Endpoint**: `GET /api/reports/payment-methods`

**Purpose**: Get detailed breakdown of payments by method

**Query Parameters**:
```json
{
  "date_from": "required (ISO date string)",
  "date_to": "required (ISO date string)",
  "group_by": "optional (string: 'method', 'status', 'daily')",
  "facility_id": "optional (integer)"
}
```

**Response Format**:
```json
{
  "success": true,
  "data": {
    "payment_methods": [
      {
        "method": "cash",
        "count": 85,
        "total": 1500000,
        "percentage": 60.0,
        "average_amount": 17647
      },
      {
        "method": "mobile_money",
        "count": 45,
        "total": 900000,
        "percentage": 36.0,
        "average_amount": 20000
      },
      {
        "method": "insurance",
        "count": 12,
        "total": 100000,
        "percentage": 4.0,
        "average_amount": 8333
      }
    ],
    "total_transactions": 142,
    "period_trends": {
      "cash_trend": "+5.2%",
      "mobile_money_trend": "+12.8%",
      "insurance_trend": "-2.1%"
    }
  }
}
```

### **3. Revenue Analytics Endpoint**
**Endpoint**: `GET /api/reports/revenue`

**Purpose**: Get detailed revenue analytics with trends

**Query Parameters**:
```json
{
  "date_from": "required (ISO date string)",
  "date_to": "required (ISO date string)",
  "granularity": "optional (string: 'daily', 'weekly', 'monthly')",
  "facility_id": "optional (integer)"
}
```

**Response Format**:
```json
{
  "success": true,
  "data": {
    "revenue_data": [
      {
        "date": "2024-01-01",
        "revenue": 85000,
        "invoice_count": 12,
        "payment_count": 10
      },
      {
        "date": "2024-01-02",
        "revenue": 92000,
        "invoice_count": 14,
        "payment_count": 11
      }
    ],
    "summary": {
      "total_revenue": 2500000,
      "average_daily_revenue": 80645,
      "best_day": {
        "date": "2024-01-15",
        "revenue": 125000
      },
      "worst_day": {
        "date": "2024-01-03",
        "revenue": 45000
      },
      "growth_rate": 12.5,
      "moving_averages": {
        "7_day": 78500,
        "30_day": 76233
      }
    },
    "forecasts": {
      "next_month": 2650000,
      "confidence": 0.85
    }
  }
}
```

### **4. Invoice Analytics Endpoint**
**Endpoint**: `GET /api/reports/invoices`

**Purpose**: Get detailed invoice analytics and aging

**Query Parameters**:
```json
{
  "date_from": "required (ISO date string)",
  "date_to": "required (ISO date string)",
  "status_filter": "optional (array: ['pending', 'paid', 'overdue'])",
  "aging_days": "optional (integer: 30, 60, 90)",
  "facility_id": "optional (integer)"
}
```

**Response Format**:
```json
{
  "success": true,
  "data": {
    "invoice_summary": {
      "total": 156,
      "paid": 125,
      "pending": 23,
      "overdue": 8,
      "partially_paid": 0
    },
    "aging_report": [
      {
        "aging_bucket": "0-30 days",
        "count": 85,
        "total_amount": 1250000
      },
      {
        "aging_bucket": "31-60 days",
        "count": 45,
        "total_amount": 850000
      },
      {
        "aging_bucket": "61-90 days",
        "count": 20,
        "total_amount": 350000
      },
      {
        "aging_bucket": "90+ days",
        "count": 6,
        "total_amount": 50000
      }
    ],
    "average_invoice_amount": 16025,
    "payment_collection_rate": 80.1
  }
}
```

### **5. Patient Analytics Endpoint**
**Endpoint**: `GET /api/reports/patients`

**Purpose**: Get patient analytics and demographics

**Query Parameters**:
```json
{
  "date_from": "required (ISO date string)",
  "date_to": "required (ISO date string)",
  "group_by": "optional (string: 'acquisition_source', 'age_group', 'visit_type')",
  "facility_id": "optional (integer)"
}
```

**Response Format**:
```json
{
  "success": true,
  "data": {
    "patient_summary": {
      "total": 1250,
      "active": 890,
      "new_this_period": 45,
      "retention_rate": 92.3
    },
    "demographics": {
      "age_groups": [
        {
          "group": "0-18",
          "count": 234,
          "percentage": 18.7
        },
        {
          "group": "19-35",
          "count": 567,
          "percentage": 45.4
        },
        {
          "group": "36-50",
          "count": 312,
          "percentage": 25.0
        },
        {
          "group": "51+",
          "count": 137,
          "percentage": 11.0
        }
      ],
      "visit_types": [
        {
          "type": "consultation",
          "count": 678,
          "percentage": 54.2
        },
        {
          "type": "follow_up",
          "count": 445,
          "percentage": 35.6
        },
        {
          "type": "emergency",
          "count": 89,
          "percentage": 7.1
        },
        {
          "type": "general",
          "count": 38,
          "percentage": 3.0
        }
      ]
    },
    "acquisition_trends": {
      "new_patients_per_month": [
        {
          "month": "2024-01",
          "count": 45
        },
        {
          "month": "2024-02",
          "count": 38
        }
      ],
      "retention_cohorts": [
        {
          "cohort": "2024-01",
          "retention_rate": 94.2
        },
        {
          "cohort": "2023-12",
          "retention_rate": 89.5
        }
      ]
    }
  }
}
```

### **6. Export Reports Endpoint**
**Endpoint**: `POST /api/reports/export`

**Purpose**: Generate and export reports in various formats

**Request Body**:
```json
{
  "report_type": "required (string: 'summary', 'revenue', 'payments', 'invoices', 'patients')",
  "date_from": "required (ISO date string)",
  "date_to": "required (ISO date string)",
  "format": "required (string: 'pdf', 'excel', 'csv')",
  "filters": "optional (object with various filter options)",
  "facility_id": "optional (integer)"
}
```

**Response Format**:
```json
{
  "success": true,
  "data": {
    "export_id": "exp_123456",
    "download_url": "https://api.example.com/downloads/exp_123456.pdf",
    "expires_at": "2024-01-15T18:00:00Z",
    "file_size": 2048576,
    "format": "pdf"
  },
  "message": "Report generated successfully"
}
```

### **7. Real-time Reports WebSocket**
**Endpoint**: `WS /ws/reports/updates`

**Purpose**: Real-time updates for dashboard metrics

**WebSocket Message Format**:
```json
{
  "type": "metric_update",
  "data": {
    "metric": "total_revenue",
    "value": 2550000,
    "previous_value": 2500000,
    "change": "+2.0%",
    "timestamp": "2024-01-15T14:30:00Z"
  }
}
```

## 🗄️ Database Schema Requirements

### **Reports Summary Table**
```sql
CREATE TABLE report_summaries (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    facility_id BIGINT NOT NULL,
    date_from DATE NOT NULL,
    date_to DATE NOT NULL,
    total_revenue DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_invoices INT NOT NULL DEFAULT 0,
    total_payments INT NOT NULL DEFAULT 0,
    average_payment_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    pending_invoices INT NOT NULL DEFAULT 0,
    overdue_invoices INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_facility_date (facility_id, date_from, date_to),
    INDEX idx_created_at (created_at)
);
```

### **Payment Method Analytics Table**
```sql
CREATE TABLE payment_method_analytics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    facility_id BIGINT NOT NULL,
    date DATE NOT NULL,
    payment_method ENUM('cash', 'mobile_money', 'insurance', 'bank_transfer') NOT NULL,
    transaction_count INT NOT NULL DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    average_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    percentage_of_total DECIMAL(5,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_facility_date_method (facility_id, date, payment_method),
    INDEX idx_date (date)
);
```

### **Invoice Aging Table**
```sql
CREATE TABLE invoice_aging (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    facility_id BIGINT NOT NULL,
    invoice_id BIGINT NOT NULL,
    aging_bucket ENUM('0-30', '31-60', '61-90', '90+') NOT NULL,
    invoice_count INT NOT NULL DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_facility_date_bucket (facility_id, created_at, aging_bucket),
    INDEX idx_invoice_id (invoice_id),
    INDEX idx_created_at (created_at)
);
```

## 🔐 Security & Validation

### **Authentication Required**
- All endpoints require valid authentication token
- Users can only access reports from their facility
- Admin users can access cross-facility reports
- Report access respects user permissions

### **Input Validation**
```php
// Example validation rules
$rules = [
    'date_from' => 'required|date|after:2020-01-01',
    'date_to' => 'required|date|after:date_from',
    'report_type' => 'required|in:summary,revenue,payments,invoices,patients',
    'format' => 'required|in:pdf,excel,csv',
    'facility_id' => 'integer|exists:facilities'
];
```

### **Rate Limiting**
- Report generation: 10 requests per minute per user
- Export requests: 5 requests per minute per user
- WebSocket connections: 3 concurrent connections per user

## 📊 Performance Requirements

### **Query Optimization**
- Reports queries should complete under 2 seconds
- Use proper indexing for date-based queries
- Implement caching for frequently accessed reports
- Use pagination for large datasets

### **Caching Strategy**
```php
// Example caching implementation
$cacheKey = "reports_summary_{$facilityId}_{$dateFrom}_{$dateTo}";
$cachedData = Cache::remember($cacheKey, 3600, function() {
    return $this->generateExpensiveReport($facilityId, $dateFrom, $dateTo);
});
```

## 🧪 Enhanced Features (Future Implementation)

### **1. Advanced Analytics**
- Revenue forecasting with ML models
- Patient lifetime value predictions
- Churn risk analysis
- Seasonal trend analysis

### **2. Custom Report Builder**
- Drag-and-drop report interface
- Custom field selection
- Saved report templates
- Scheduled report generation

### **3. Integration Capabilities**
- Accounting software integration (QuickBooks, Xero)
- External analytics platforms (Google Analytics, Mixpanel)
- Email report delivery system

### **4. Mobile Optimization**
- Mobile-optimized report views
- Touch-friendly export options
- Offline report caching

## 🧪 Testing Requirements

### **Test Cases**
1. **Summary Reports**: Verify all metrics calculate correctly
2. **Date Filtering**: Test various date ranges and edge cases
3. **Export Functionality**: Test all export formats and sizes
4. **Performance**: Test with large datasets and concurrent users
5. **Security**: Test permission boundaries and data access

### **Sample Test Data**
```sql
-- Sample data for comprehensive testing
INSERT INTO report_summaries (facility_id, date_from, date_to, total_revenue, total_invoices, total_payments) VALUES
(1, '2024-01-01', '2024-01-31', 2500000, 156, 142),
(1, '2024-02-01', '2024-02-29', 2750000, 168, 155),
(1, '2024-03-01', '2024-03-31', 3200000, 189, 178);
```

## 🚀 Implementation Priority

### **Phase 1: Core Reporting APIs (High Priority)**
1. ✅ `GET /api/reports/summary` - Summary statistics
2. ✅ `GET /api/reports/payment-methods` - Payment method breakdown
3. ✅ `GET /api/reports/revenue` - Revenue analytics
4. ✅ `GET /api/reports/invoices` - Invoice analytics
5. ✅ `GET /api/reports/patients` - Patient analytics
6. ✅ `POST /api/reports/export` - Export functionality

### **Phase 2: Advanced Features (Medium Priority)**
1. WebSocket real-time updates
2. Custom report builder
3. Advanced analytics and forecasting
4. Integration capabilities

### **Phase 3: Performance & Security (Low Priority)**
1. Advanced caching strategies
2. Mobile optimization
3. Enhanced security features

## 📞 Frontend Integration Points

### **API Client Updates**
```typescript
// Add to lib/api/backend.ts
export const reportsApi = {
  async getReportsSummary(params: {
    date_from: string;
    date_to: string;
    facility_id?: number;
  }): Promise<ReportsSummaryResponse> {
    return apiRequest<ReportsSummaryResponse>(`/reports/summary`, {
      method: 'GET',
      params: new URLSearchParams(params).toString()
    });
  },

  async getPaymentMethods(params: {
    date_from: string;
    date_to: string;
    group_by?: string;
    facility_id?: number;
  }): Promise<PaymentMethodsResponse> {
    return apiRequest<PaymentMethodsResponse>(`/reports/payment-methods`, {
      method: 'GET',
      params: new URLSearchParams(params).toString()
    });
  },

  async getRevenueAnalytics(params: {
    date_from: string;
    date_to: string;
    granularity?: string;
    facility_id?: number;
  }): Promise<RevenueAnalyticsResponse> {
    return apiRequest<RevenueAnalyticsResponse>(`/reports/revenue`, {
      method: 'GET',
      params: new URLSearchParams(params).toString()
    });
  },

  async exportReports(params: {
    report_type: string;
    date_from: string;
    date_to: string;
    format: string;
    filters?: object;
    facility_id?: number;
  }): Promise<ExportResponse> {
    return apiRequest<ExportResponse>(`/reports/export`, {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }
};
```

### **Frontend Component Updates**
The frontend reports page is already enhanced with:
- ✅ Real API integration
- ✅ Dynamic data loading
- ✅ Export functionality
- ✅ Comprehensive filtering
- ✅ Responsive design

## 📈 Success Metrics

### **User Experience**
- Reports load in under 2 seconds
- Export generation completes in under 10 seconds
- Mobile-friendly interface
- Intuitive filtering and navigation

### **Technical Performance**
- API response times under 500ms
- Database query optimization with proper indexing
- Efficient caching implementation
- 99.9% uptime for report services

### **Business Impact**
- Improved decision-making with real-time data
- Enhanced financial visibility across all levels
- Reduced report generation time by 80%
- Better compliance with audit trails

---

## 📝 Implementation Notes

### **For Backend Team:**
1. Implement core reporting endpoints first
2. Focus on performance optimization with proper indexing
3. Add comprehensive error handling and validation
4. Test with frontend integration requirements
5. Document all API endpoints with examples

### **For Frontend Team:**
1. Update API client with new reports endpoints
2. Test all report types and edge cases
3. Implement proper error handling and loading states
4. Add export functionality with progress indicators
5. Optimize for mobile devices and accessibility

### **Timeline:**
- **Core APIs**: 3-4 days
- **Advanced Features**: 1-2 weeks
- **Performance Optimization**: 1 week
- **Testing & Documentation**: 3-5 days

**🇷🇼 This comprehensive reports system will provide powerful business intelligence and analytics for healthcare billing operations! 📊💼**
