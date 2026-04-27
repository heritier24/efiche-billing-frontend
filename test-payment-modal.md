# Payment Modal Testing Guide

## 🧪 Test Payment Form Modal

### **Test Steps:**

1. **Open Invoice Page**
   - Navigate to `/dashboard/invoices`
   - Ensure invoices are displayed correctly

2. **Trigger Payment Modal**
   - Click "Process Payment" on any invoice
   - Verify modal opens with backdrop blur effect

3. **Test Payment Methods**
   
   **Cash Payment:**
   - Select "Cash" as payment method
   - Enter amount (e.g., 10000)
   - Click "Pay" button
   - Verify payment processes successfully
   
   **Mobile Money Payment:**
   - Select "Mobile Money" as payment method
   - Phone number field should appear
   - Enter valid Rwanda number (+250788123456)
   - Enter amount (e.g., 15000)
   - Click "Pay" button
   - Verify payment processes successfully
   
   **Insurance Payment:**
   - Select "Insurance" as payment method
   - Enter amount (e.g., 50000)
   - Click "Pay" button
   - Verify payment processes successfully

4. **Validation Testing**
   
   **Amount Validation:**
   - Enter "0" → Should show "Amount must be greater than 0"
   - Enter "-100" → Should show "Amount must be greater than 0"
   - Enter "abc" → Should show "Amount must be in valid currency format"
   - Enter "10000.50" → Should pass validation
   
   **Phone Number Validation:**
   - Select Mobile Money without phone → Should show "Phone number is required"
   - Enter "0788123456" → Should show "Phone number must be a valid Rwanda number"
   - Enter "+250788123456" → Should pass validation

5. **Error Handling**
   - Test network failure scenarios
   - Verify error messages display correctly
   - Test form reset after successful payment

6. **UI/UX Testing**
   - Verify modal backdrop blur effect
   - Test responsive design on mobile
   - Verify loading states during payment processing
   - Test form field clearing after payment

### **Expected Results:**

✅ **Modal opens** with proper backdrop blur
✅ **Form validation** works for all scenarios
✅ **Payment processing** shows loading state
✅ **Success callback** triggers parent component update
✅ **Error handling** displays user-friendly messages
✅ **Form reset** clears all fields after payment
✅ **Mobile optimization** works on touch devices

### **Integration Points:**

- **API Integration**: Uses `api.payments.processPayment()`
- **Real-time Updates**: Payment status polling implemented
- **Currency Support**: RWF formatting with Rwanda locale
- **Validation**: Comprehensive client-side validation
- **Error Handling**: Graceful failure handling
- **Responsive Design**: Mobile-optimized interface

### **Debug Tips:**

1. Check browser console for API errors
2. Verify payment appears in payment list after processing
3. Test with different invoice amounts and statuses
4. Verify payment status updates in real-time
5. Check network requests in browser dev tools

### **Success Criteria:**

- Modal opens and closes properly
- All payment methods work correctly
- Validation prevents invalid submissions
- Payments process and update UI
- Error states are user-friendly
- Mobile interface is touch-optimized
