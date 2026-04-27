# Visit Management Backend API Requirements

## 📋 Overview

This document outlines the backend API requirements for the visit management system that supports invoice creation. The visit management system is a critical component that links patients to their medical encounters, which are then billed through invoices.

## 🎯 Current Frontend Implementation

### **User-Friendly Visit Selection**
The frontend now provides an intuitive visit selection interface:

1. **Clear Explanation**: Users see "What is a visit?" with a simple explanation
2. **Visual Indicators**: Each visit type has an emoji icon (🩺 consultation, 🔄 follow-up, 🚨 emergency)
3. **Smart Options**: Shows existing visits or allows creating new ones
4. **Better UX**: Color-coded messages for different states

### **Visit Types Supported**
- 🩺 **Consultation** - Initial patient examination
- 🔄 **Follow-up** - Return visit for ongoing treatment
- 🚨 **Emergency** - Urgent medical attention
- 📋 **General** - Other types of visits

## 🔧 Backend API Requirements

### **1. List Patient Visits**
**Endpoint**: `GET /api/visits`

**Purpose**: Fetch all visits for a specific patient

**Query Parameters**:
```json
{
  "patient_id": "required (integer)",
  "status": "optional (string: 'active', 'completed', 'cancelled')",
  "visit_type": "optional (string: 'consultation', 'follow_up', 'emergency')",
  "limit": "optional (integer, default: 50)",
  "page": "optional (integer, default: 1)"
}
```

**Response Format**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "patient_id": 123,
      "facility_id": 1,
      "visit_type": "consultation",
      "status": "active",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T11:30:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 50
}
```

### **2. Create New Visit**
**Endpoint**: `POST /api/visits`

**Purpose**: Create a new visit for a patient

**Request Body**:
```json
{
  "patient_id": "required (integer)",
  "facility_id": "optional (integer, default: user's facility)",
  "visit_type": "required (string: 'consultation', 'follow_up', 'emergency', 'general')",
  "status": "optional (string, default: 'active')",
  "notes": "optional (string, for future implementation)"
}
```

**Response Format**:
```json
{
  "success": true,
  "data": {
    "id": 456,
    "patient_id": 123,
    "facility_id": 1,
    "visit_type": "consultation",
    "status": "active",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "message": "Visit created successfully"
}
```

### **3. Get Visit Details**
**Endpoint**: `GET /api/visits/{id}`

**Purpose**: Get detailed information about a specific visit

**Response Format**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "patient_id": 123,
    "facility_id": 1,
    "visit_type": "consultation",
    "status": "active",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T11:30:00Z",
    "patient": {
      "id": 123,
      "full_name": "John Doe",
      "first_name": "John",
      "last_name": "Doe"
    },
    "invoices": [
      {
        "id": 789,
        "invoice_number": "INV-2024-001",
        "status": "pending",
        "total_amount": 50000
      }
    ]
  }
}
```

### **4. Update Visit Status**
**Endpoint**: `PUT /api/visits/{id}/status`

**Purpose**: Update visit status (active → completed, etc.)

**Request Body**:
```json
{
  "status": "required (string: 'active', 'completed', 'cancelled')"
}
```

**Response Format**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "completed",
    "updated_at": "2024-01-15T12:00:00Z"
  },
  "message": "Visit status updated successfully"
}
```

## 🗄️ Database Schema Requirements

### **Visits Table**
```sql
CREATE TABLE visits (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    patient_id BIGINT NOT NULL,
    facility_id BIGINT NOT NULL,
    visit_type ENUM('consultation', 'follow_up', 'emergency', 'general') NOT NULL DEFAULT 'consultation',
    status ENUM('active', 'completed', 'cancelled') NOT NULL DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (facility_id) REFERENCES facilities(id),
    
    INDEX idx_patient_visits (patient_id, status),
    INDEX idx_facility_visits (facility_id, created_at),
    INDEX idx_visit_type_status (visit_type, status)
);
```

### **Visit-Invoice Relationship**
```sql
-- Invoices table should reference visits
ALTER TABLE invoices 
ADD COLUMN visit_id BIGINT,
ADD FOREIGN KEY (visit_id) REFERENCES visits(id),
ADD INDEX idx_visit_id (visit_id);
```

## 🔐 Security & Validation

### **Authentication Required**
- All endpoints require valid authentication token
- Users can only access visits from their facility
- Patient access respects user permissions

### **Input Validation**
```php
// Example validation rules
$rules = [
    'patient_id' => 'required|integer|exists:patients,id',
    'facility_id' => 'integer|exists:facilities,id',
    'visit_type' => 'required|in:consultation,follow_up,emergency,general',
    'status' => 'in:active,completed,cancelled',
    'notes' => 'nullable|string|max:1000'
];
```

### **Business Logic**
- A patient can have multiple active visits
- Visit status transitions: active → completed → cancelled
- Cannot delete visits with associated invoices
- Visit creation should check patient eligibility

## 📊 Enhanced Features (Future Implementation)

### **1. Visit Scheduling**
```json
// Scheduled visits
{
  "scheduled_date": "2024-01-20T14:00:00Z",
  "duration_minutes": 30,
  "practitioner_id": 456
}
```

### **2. Visit History Tracking**
```json
// Visit timeline
{
  "timeline": [
    {
      "action": "created",
      "timestamp": "2024-01-15T10:30:00Z",
      "user_id": 789
    },
    {
      "action": "status_changed",
      "from": "active",
      "to": "completed",
      "timestamp": "2024-01-15T12:00:00Z",
      "user_id": 789
    }
  ]
}
```

### **3. Visit Types Configuration**
```json
// Configurable visit types
{
  "visit_types": [
    {
      "code": "consultation",
      "name": "General Consultation",
      "default_duration": 30,
      "price_range": {
        "min": 10000,
        "max": 50000
      }
    }
  ]
}
```

## 🧪 Testing Requirements

### **Test Cases**
1. **Create Visit**: Successfully create visits for different types
2. **List Visits**: Retrieve patient visits with proper filtering
3. **Update Status**: Change visit status with validation
4. **Error Handling**: Handle invalid patient IDs, permissions
5. **Invoice Integration**: Ensure visits link properly to invoices

### **Sample Test Data**
```sql
-- Sample visits for testing
INSERT INTO visits (patient_id, facility_id, visit_type, status) VALUES
(1, 1, 'consultation', 'active'),
(1, 1, 'follow_up', 'completed'),
(2, 1, 'emergency', 'active'),
(3, 1, 'consultation', 'cancelled');
```

## 🚀 Implementation Priority

### **Phase 1: Core Functionality (High Priority)**
1. ✅ `GET /api/visits` - List patient visits
2. ✅ `POST /api/visits` - Create new visit
3. ✅ `GET /api/visits/{id}` - Get visit details
4. ✅ `PUT /api/visits/{id}/status` - Update visit status

### **Phase 2: Enhanced Features (Medium Priority)**
1. Visit scheduling and calendar integration
2. Visit history and timeline tracking
3. Advanced filtering and search
4. Visit types configuration

### **Phase 3: Advanced Features (Low Priority)**
1. Visit analytics and reporting
2. Integration with electronic health records
3. Automated visit reminders
4. Multi-location visit management

## 📞 Frontend-Backend Integration

### **Current Frontend Implementation**
The frontend already implements:
- ✅ User-friendly visit selection interface
- ✅ New visit creation workflow
- ✅ Proper error handling and validation
- ✅ Visual indicators and helpful messages

### **Backend Integration Points**
1. **Visit Fetching**: Frontend calls `api.visits.listVisits()`
2. **Visit Creation**: Frontend calls `api.visits.createVisit()`
3. **Error Handling**: Backend provides meaningful error messages
4. **Data Validation**: Backend validates all input data

## 🎯 Success Metrics

### **User Experience**
- Users can easily understand what a "visit" is
- Visit selection is intuitive and clear
- New visit creation works seamlessly
- Error messages are helpful and actionable

### **Technical Performance**
- API responses under 500ms
- Proper indexing for fast queries
- Secure access control
- Reliable data consistency

### **Business Impact**
- Improved invoice creation workflow
- Better patient visit tracking
- Enhanced billing accuracy
- Streamlined clinical operations

---

## 📝 Implementation Notes

### **For Backend Team:**
1. The frontend already handles the user interface improvements
2. Focus on implementing the core API endpoints
3. Ensure proper error handling and validation
4. Test with the frontend workflow

### **For Frontend Team:**
1. The UI improvements are already implemented
2. Test with real backend endpoints when ready
3. Handle edge cases and error states
4. Provide user feedback for all operations

### **Timeline:**
- **Core APIs**: 2-3 days
- **Testing & Integration**: 1-2 days
- **Documentation & Deployment**: 1 day

**🇷🇼 This visit management system will significantly improve the invoice creation workflow and provide a solid foundation for clinical billing operations! 🏥💼**
