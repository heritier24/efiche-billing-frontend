# 🧪 Complete User Journey Testing Guide

## 📋 Step-by-Step Navigation

### **Step 1: Access the Application**
1. Start your development server: `npm run dev`
2. Open browser: `http://localhost:3000`
3. Login with your credentials

### **Step 2: Navigate to Invoices**
1. From dashboard, click **"Invoices"** in sidebar
2. URL: `http://localhost:3000/dashboard/invoices`
3. You should see a list of patient invoices

### **Step 3: Access Visit Billing**
Choose one of these methods:

#### **Method A: From Invoice List**
1. Find any invoice in the list
2. Click the **"View"** button
3. This takes you to: `/billing/{visitId}`

#### **Method B: Direct Access**
1. Type directly: `http://localhost:3000/billing/1/visit-billing`
2. Try different visit IDs: 1, 2, 3, etc.

### **Step 4: Explore the Billing Page**
You should see:
- ✅ Header with "Patient Billing" title and Visit ID
- ✅ Invoice Summary card with amounts
- ✅ Line Items list with services
- ✅ Payment Form with method selection

### **Step 5: Test Payment Methods**

#### **Test Cash Payment:**
1. Select **"Cash"** from dropdown
2. Enter amount: `5000`
3. Click **"Pay RWF 5,000"**
4. ✅ Immediate success message
5. ✅ Balance updates automatically

#### **Test Mobile Money:**
1. Select **"Mobile Money"** from dropdown
2. Enter phone: `+250788123456`
3. Enter amount: `10000`
4. Click **"Pay RWF 10,000"**
5. ✅ "Waiting for confirmation..." message
6. ✅ Status polls every 5 seconds
7. ✅ Success message when confirmed

#### **Test Insurance:**
1. Select **"Insurance"** from dropdown
2. Choose insurance provider
3. Enter amount: `7500`
4. Click **"Pay RWF 7,500"**
5. ✅ Payment processes with insurance validation

### **Step 6: Complete the Journey**
1. After payment, see success message
2. Check that balance updated
3. Click **"Back to Invoices"** to return
4. Verify the invoice shows updated payment status

## 🔍 Expected Behaviors

### **Loading States:**
- Initial page load shows spinner
- Payment processing shows "Processing..."
- Mobile money shows polling animation

### **Error Handling:**
- Invalid phone number shows validation error
- Amount exceeding balance shows warning
- Network errors show user-friendly messages

### **Real-time Updates:**
- Mobile money status updates automatically
- Balance refreshes after payment
- Line items remain visible throughout

### **Validation Rules:**
- Phone format: `+2507xxxxxxxx`
- Amount: Cannot exceed remaining balance
- Required fields: Amount, Method, Phone (for mobile money)

## 🚨 Troubleshooting

### **If Page Doesn't Load:**
1. Check console for errors
2. Verify API server is running
3. Ensure visit ID exists (try 1-20)

### **If Payment Fails:**
1. Check network connection
2. Verify amount format (numbers only)
3. Check phone number format for mobile money

### **If Real-time Updates Don't Work:**
1. Check browser console for polling errors
2. Verify API endpoints are accessible
3. Check for CORS issues

## 📱 Mobile Testing
1. Test on mobile device or browser dev tools
2. Verify responsive layout
3. Test touch interactions
4. Check form validation on mobile

## ✅ Success Criteria
- [ ] All payment methods work correctly
- [ ] Real-time updates function properly
- [ ] Validation rules are enforced
- [ ] Error messages are user-friendly
- [ ] Mobile layout is responsive
- [ ] Navigation flows smoothly
