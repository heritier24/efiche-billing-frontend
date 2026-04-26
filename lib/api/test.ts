/**
 * API Testing and Validation Suite
 * Comprehensive testing for all backend API endpoints
 */

import { api, ApiError } from './backend';
import { LoginCredentials, CreatePatientRequest, PaymentRequest } from '@/lib/types';

// Test configuration
const TEST_CONFIG = {
  API_BASE: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api',
  TEST_USER: {
    email: 'admin@efiche.rw',
    password: 'password123',
  },
  TEST_PATIENT: {
    first_name: 'Test',
    last_name: 'Patient',
    email: 'test@example.com',
    phone: '+250788123456',
    date_of_birth: '1990-01-01',
    gender: 'male' as const,
    address: 'Kigali, Rwanda',
  },
};

/**
 * Test authentication endpoints
 */
export async function testAuthentication() {
  console.log('🔐 Testing Authentication APIs...');
  
  try {
    // Test login
    console.log('Testing login...');
    const loginResponse = await api.auth.login(TEST_CONFIG.TEST_USER);
    console.log('✅ Login successful:', { 
      user: loginResponse.user.name, 
      role: loginResponse.user.role 
    });

    // Test getting current user
    console.log('Testing get current user...');
    const currentUser = await api.auth.getCurrentUser();
    console.log('✅ Current user retrieved:', { 
      user: currentUser.name, 
      role: currentUser.role 
    });

    // Test logout
    console.log('Testing logout...');
    await api.auth.logout();
    console.log('✅ Logout successful');

    return { success: true, message: 'Authentication tests passed' };
  } catch (error) {
    console.error('❌ Authentication test failed:', error);
    return { 
      success: false, 
      message: error instanceof ApiError ? error.message : 'Authentication test failed',
      error 
    };
  }
}

/**
 * Test dashboard endpoints
 */
export async function testDashboard() {
  console.log('📊 Testing Dashboard APIs...');
  
  try {
    // First login to get token
    await api.auth.login(TEST_CONFIG.TEST_USER);

    // Test dashboard stats
    console.log('Testing dashboard stats...');
    const stats = await api.dashboard.getStats();
    console.log('✅ Dashboard stats retrieved:', {
      totalInvoices: stats.total_invoices,
      totalRevenue: stats.total_revenue,
      totalPatients: stats.total_patients,
    });

    // Test recent invoices
    console.log('Testing recent invoices...');
    const recentInvoices = await api.dashboard.getRecentInvoices({ limit: 5 });
    console.log('✅ Recent invoices retrieved:', {
      count: recentInvoices.data.length,
      total: recentInvoices.total,
    });

    // Test upcoming payments
    console.log('Testing upcoming payments...');
    const upcomingPayments = await api.dashboard.getUpcomingPayments();
    console.log('✅ Upcoming payments retrieved:', {
      totalOverdue: upcomingPayments.total_overdue,
      totalDueThisWeek: upcomingPayments.total_due_this_week,
    });

    // Test monthly revenue
    console.log('Testing monthly revenue...');
    const monthlyRevenue = await api.dashboard.getMonthlyRevenue(6);
    console.log('✅ Monthly revenue retrieved:', {
      months: monthlyRevenue.data.length,
      yearTotal: monthlyRevenue.year_total,
    });

    return { success: true, message: 'Dashboard tests passed' };
  } catch (error) {
    console.error('❌ Dashboard test failed:', error);
    return { 
      success: false, 
      message: error instanceof ApiError ? error.message : 'Dashboard test failed',
      error 
    };
  }
}

/**
 * Test patient management endpoints
 */
export async function testPatients() {
  console.log('👥 Testing Patient Management APIs...');
  
  try {
    // Login first
    await api.auth.login(TEST_CONFIG.TEST_USER);

    // Test list patients
    console.log('Testing list patients...');
    const patients = await api.patients.listPatients({ limit: 10 });
    console.log('✅ Patients listed:', {
      count: patients.data.length,
      total: patients.total,
    });

    // Test create patient
    console.log('Testing create patient...');
    const testPatient = { ...TEST_CONFIG.TEST_PATIENT };
    testPatient.email = `test-${Date.now()}@example.com`; // Unique email
    
    const createResponse = await api.patients.createPatient(testPatient);
    console.log('✅ Patient created:', {
      id: createResponse.data?.id,
      name: `${createResponse.data?.first_name} ${createResponse.data?.last_name}`,
    });

    const newPatientId = createResponse.data?.id;
    if (!newPatientId) {
      throw new Error('Failed to get new patient ID');
    }

    // Test get patient
    console.log('Testing get patient...');
    const patient = await api.patients.getPatient(newPatientId);
    console.log('✅ Patient retrieved:', {
      name: `${patient.first_name} ${patient.last_name}`,
      email: patient.email,
      totalVisits: patient.total_visits,
    });

    // Test update patient
    console.log('Testing update patient...');
    const updateResponse = await api.patients.updatePatient(newPatientId, {
      address: 'Kigali, Updated Address',
    });
    console.log('✅ Patient updated:', {
      address: updateResponse.data?.address,
    });

    // Test patient visits
    console.log('Testing patient visits...');
    const visits = await api.patients.getPatientVisits(newPatientId);
    console.log('✅ Patient visits retrieved:', {
      total: visits.total,
      lastVisit: visits.last_visit,
    });

    return { success: true, message: 'Patient tests passed' };
  } catch (error) {
    console.error('❌ Patient test failed:', error);
    return { 
      success: false, 
      message: error instanceof ApiError ? error.message : 'Patient test failed',
      error 
    };
  }
}

/**
 * Test invoice management endpoints
 */
export async function testInvoices() {
  console.log('📋 Testing Invoice Management APIs...');
  
  try {
    // Login first
    await api.auth.login(TEST_CONFIG.TEST_USER);

    // Test list invoices
    console.log('Testing list invoices...');
    const invoices = await api.invoices.listInvoices({ limit: 10 });
    console.log('✅ Invoices listed:', {
      count: invoices.data.length,
      total: invoices.total,
    });

    if (invoices.data.length > 0) {
      const firstInvoice = invoices.data[0];

      // Test get invoice
      console.log('Testing get invoice...');
      const invoice = await api.invoices.getInvoice(firstInvoice.id);
      console.log('✅ Invoice retrieved:', {
        invoiceNumber: invoice.invoice_number,
        status: invoice.status,
        totalAmount: invoice.total_amount,
      });

      // Test get invoice by visit
      console.log('Testing get invoice by visit...');
      const invoiceByVisit = await api.invoices.getInvoiceByVisit(
        invoice.visit_id.toString()
      );
      console.log('✅ Invoice by visit retrieved:', {
        invoiceNumber: invoiceByVisit.invoice_number,
        visitId: invoiceByVisit.visit_id,
      });
    } else {
      console.log('⚠️ No invoices found for detailed testing');
    }

    return { success: true, message: 'Invoice tests passed' };
  } catch (error) {
    console.error('❌ Invoice test failed:', error);
    return { 
      success: false, 
      message: error instanceof ApiError ? error.message : 'Invoice test failed',
      error 
    };
  }
}

/**
 * Test payment management endpoints
 */
export async function testPayments() {
  console.log('💳 Testing Payment Management APIs...');
  
  try {
    // Login first
    await api.auth.login(TEST_CONFIG.TEST_USER);

    // Test list payments
    console.log('Testing list payments...');
    const payments = await api.payments.listPayments({ limit: 10 });
    console.log('✅ Payments listed:', {
      count: payments.data.length,
      total: payments.total,
    });

    if (payments.data.length > 0) {
      const firstPayment = payments.data[0];

      // Test get payment
      console.log('Testing get payment...');
      const payment = await api.payments.getPayment(firstPayment.id);
      console.log('✅ Payment retrieved:', {
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        transactionRef: payment.transaction_ref,
      });

      // Test get payment status
      console.log('Testing get payment status...');
      const paymentStatus = await api.payments.getPaymentStatus(firstPayment.id);
      console.log('✅ Payment status retrieved:', {
        status: paymentStatus.status,
        confirmedAt: paymentStatus.confirmed_at,
      });
    } else {
      console.log('⚠️ No payments found for detailed testing');
    }

    return { success: true, message: 'Payment tests passed' };
  } catch (error) {
    console.error('❌ Payment test failed:', error);
    return { 
      success: false, 
      message: error instanceof ApiError ? error.message : 'Payment test failed',
      error 
    };
  }
}

/**
 * Test facility and insurance endpoints
 */
export async function testFacilities() {
  console.log('🏥 Testing Facility & Insurance APIs...');
  
  try {
    // Login first
    await api.auth.login(TEST_CONFIG.TEST_USER);

    // Test get insurances
    console.log('Testing get insurances...');
    const insurances = await api.facilities.getInsurances(1);
    console.log('✅ Insurances retrieved:', {
      count: insurances.data.length,
      providers: insurances.data.map(i => i.name),
    });

    return { success: true, message: 'Facility tests passed' };
  } catch (error) {
    console.error('❌ Facility test failed:', error);
    return { 
      success: false, 
      message: error instanceof ApiError ? error.message : 'Facility test failed',
      error 
    };
  }
}

/**
 * Run all API tests
 */
export async function runAllTests() {
  console.log('🚀 Starting Complete API Test Suite...');
  console.log(`API Base URL: ${TEST_CONFIG.API_BASE}`);
  
  const results = {
    authentication: await testAuthentication(),
    dashboard: await testDashboard(),
    patients: await testPatients(),
    invoices: await testInvoices(),
    payments: await testPayments(),
    facilities: await testFacilities(),
  };

  const passedTests = Object.values(results).filter(r => r.success).length;
  const totalTests = Object.keys(results).length;

  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  
  Object.entries(results).forEach(([testName, result]) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${testName}: ${result.message}`);
  });

  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Backend API integration is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the errors above.');
  }

  return results;
}

/**
 * Quick health check for API availability
 */
export async function healthCheck() {
  try {
    // Try to login to check if API is available
    await api.auth.login(TEST_CONFIG.TEST_USER);
    return { 
      success: true, 
      message: 'API is available and working',
      url: TEST_CONFIG.API_BASE 
    };
  } catch (error) {
    return { 
      success: false, 
      message: 'API is not available or credentials are invalid',
      url: TEST_CONFIG.API_BASE,
      error: error instanceof ApiError ? error.message : 'Unknown error'
    };
  }
}

// Export test utilities
export const testUtils = {
  runAllTests,
  healthCheck,
  testAuthentication,
  testDashboard,
  testPatients,
  testInvoices,
  testPayments,
  testFacilities,
  TEST_CONFIG,
};
