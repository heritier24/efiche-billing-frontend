# 🏥 eFiche Billing Frontend

> Modern React frontend for Efiche's healthcare billing system with complete backend API integration.

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 18.0+ 
- **npm**: 9.0+ or **yarn**: 1.22+
- **Backend API**: eFiche Billing API running on `http://localhost:8000`

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd efiche-billing-frontend

# Install dependencies
npm install

# Configure environment
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api" > .env.local

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Login Credentials

Use these credentials to access the system:

```
Admin:    admin@efiche.rw     / password123
Cashier:  cashier@efiche.rw   / password123  
Staff:    staff@efiche.rw      / password123
```

## 📱 Key Features

### Authentication
- **JWT-based login** with automatic token management
- **Role-based access** (Admin, Cashier, Staff)
- **Secure logout** with token cleanup

### Patient Management
- **Patient registration** with Rwanda phone validation
- **Search and filter** patients by name, email, phone
- **Patient profiles** with visit history and billing records
- **Create new patients** with insurance information

### Billing & Payments
- **Invoice creation** from patient visits
- **Multiple payment methods**: Cash, Mobile Money, Insurance
- **Rwanda mobile money** integration (MTN, Airtel, Tigo)
- **Payment tracking** with real-time status updates
- **Currency formatting** in RWF (Rwandan Francs)

### Dashboard
- **Overview statistics** (total patients, invoices, revenue)
- **Recent invoices** and payment status
- **Patient analytics** and visit patterns
- **Revenue tracking** and financial reports

## 🌍 Rwanda-Specific Features

- **Phone validation**: +2507xxxxxxxx format
- **Currency**: RWF (Rwandan Franc)
- **Insurance providers**: RSSB, MMI, MediCare Rwanda, Prime Insurance
- **Mobile money**: MTN Mobile Money, Airtel Money, Tigo Cash

## 🛠️ Development

### Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Check code quality
npm run lint
```

### Testing API Connection

```typescript
// Test in browser console
import { testUtils } from '@/lib/api/test';
await testUtils.healthCheck();
```

## 🚨 Troubleshooting

### Common Issues

**API Connection Error**
- Check backend is running: `curl http://localhost:8000`
- Verify environment: `echo $NEXT_PUBLIC_API_BASE_URL`

**Login Issues**
- Clear browser storage and refresh
- Use correct test credentials

**Build Errors**
- Clear cache: `rm -rf .next`
- Reinstall: `npm ci`

## 📞 Support

- **Backend Integration**: See `BACKEND_INTEGRATION_GUIDE.md`
- **Test Credentials**: All users use password `password123`

---

## 🇷🇼 Built for Rwanda's Healthcare

**🚀 Production Ready • 🔒 Fully Integrated • 📱 Mobile Optimized**
