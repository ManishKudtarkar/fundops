# FundOps Multi-Tenant ERP - Complete Documentation

## Quick Start

### Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run dev
```

### API Documentation
API runs on `http://localhost:5000/api`

### Test Credentials
```
SUPER_ADMIN:
  Email: admin@fundops.com
  Password: Password@123
  Role: Platform administrator
  
BUSINESS_ADMIN:
  Email: businessadmin@fundops.com
  Password: Password@123
  Role: Business manager
  
SALES:
  Email: sales@fundops.com
  Password: Password@123
  Role: Sales staff
```

---

## Architecture Overview

### Multi-Tenant Model
- **Single Database**: All businesses share one PostgreSQL database
- **Business Isolation**: Data isolated via `businessId` field
- **User Roles**: SUPER_ADMIN (platform), BUSINESS_ADMIN (business), Team members
- **Data Protection**: IDOR prevention, atomic transactions, audit logging

### Technology Stack
- **Backend**: Node.js + Express 5 + TypeScript
- **Database**: PostgreSQL with Prisma 7
- **Authentication**: JWT with businessId payload
- **Authorization**: Middleware-based role checking
- **Caching**: In-memory dashboard cache (per business)

---

## Key Concepts

### Business Context
Every operation happens within a business:
- User has `businessId` in JWT (null for SUPER_ADMIN)
- All queries filtered by `businessId` from token
- Business ID never trusted from client

### Role Hierarchy
```
SUPER_ADMIN (Platform Owner)
├─ businessId: null
├─ Can: Manage businesses, view platform data
└─ Cannot: Create/delete customers (business-specific)

BUSINESS_ADMIN (Business Manager)
├─ businessId: assigned
├─ Can: Manage staff, customers, products, operations
└─ Cannot: Access other business data

SALES/WAREHOUSE/ACCOUNTS (Team Members)
├─ businessId: assigned
├─ Can: Create/update their specific resources
└─ Cannot: Change permissions or business settings
```

### Data Model
```
Business (1) ──────────────────── (M) User (Staff)
         │                         ├── Can manage: Customers, Products
         │                         ├── Can view: Dashboard, Inventory
         │                         └── Can perform: Sales operations
         │
         ├────────── (M) Customer
         │            └── (1M) FollowUp (tracking)
         │
         ├────────── (M) Product
         │            └── (M) StockMovement (audit trail)
         │
         ├────────── (M) Challan (Sales documents)
         │            └── (M) ChallanItem (line items)
         │
         └────────── (M) AuditLog (all actions)
```

---

## API Endpoints

### Authentication
```
POST   /auth/login              # Login with email/password
GET    /auth/me                 # Get current user info
```

### Business Management (SUPER_ADMIN)
```
POST   /businesses              # Create business
GET    /businesses              # List all businesses  
GET    /businesses/:id          # Get business details
PUT    /businesses/:id          # Update business
POST   /businesses/:id/status   # Change status (ACTIVE/SUSPENDED/INACTIVE)
```

### Employee Management (BUSINESS_ADMIN)
```
GET    /employees               # List team members
POST   /employees               # Create employee
GET    /employees/:id           # Get employee
PUT    /employees/:id           # Update employee
POST   /employees/:id/reset-password  # Reset password
```

### Business Operations
```
GET    /dashboard               # Business or platform dashboard
GET    /customers               # List customers
POST   /customers               # Create customer
GET    /products                # List products
POST   /products                # Create product
POST   /products/:id/stock      # Record stock movement
GET    /inventory/movements     # Stock movement history
POST   /challans                # Create sales challan
POST   /challans/:id/confirm    # Confirm challan
GET    /followups               # List follow-ups
POST   /followups               # Create follow-up
GET    /audit/business          # Business audit logs
```

---

## Security Features

### ✅ Implemented
- **IDOR Prevention**: Dual-condition queries `{id, businessId}`
- **Authentication**: JWT with businessId embedded
- **Authorization**: Role-based middleware
- **Data Isolation**: All queries filtered by businessId
- **Transactions**: Atomic operations for consistency
- **Audit Trail**: All actions logged
- **Cross-Business Protection**: Validation on all operations

### Example: Prevented Attack
```
Attacker:
  POST /api/products/PRODUCT_FROM_OTHER_BUSINESS/stock
  { quantity: 10 }

Backend Validation:
  1. Extract businessId from JWT
  2. Query: findFirst({where: {id: productId, businessId}})
  3. Result: null (product doesn't belong to this business)
  4. Response: 404 "Product not found"
  
Result: Attack prevented, no data leak
```

---

## Important Patterns

### Business ID from JWT, Never from Client
```typescript
// ✅ CORRECT
const businessId = req.user.businessId;  // From JWT token
const customer = await getCustomerById(customerId, businessId);

// ❌ WRONG
const businessId = req.body.businessId;  // Never from client!
const customer = await getCustomerById(customerId, businessId);
```

### IDOR Prevention Pattern
```typescript
// ✅ CORRECT - Dual condition
export async function getCustomerById(id: string, businessId: string) {
  return prisma.customer.findFirst({
    where: { id, businessId }  // Both conditions required
  });
}

// ❌ WRONG - Single condition
export async function getCustomerById(id: string) {
  return prisma.customer.findUnique({
    where: { id }  // Missing businessId check!
  });
}
```

### Atomic Transactions
```typescript
// For stock operations and challan confirmation
await prisma.$transaction(async (tx) => {
  // 1. Validate all prerequisites
  // 2. Update all related records
  // 3. Create audit logs
  // All succeed or all fail - no partial updates
});
```

---

## Common Operations

### Creating a Customer
```
1. User authenticates → JWT includes businessId
2. Client calls POST /api/customers with customer data
3. Controller extracts businessId from req.user
4. Service creates customer with businessId
5. Response includes customer with businessId
6. No chance for cross-business data access
```

### Confirming a Challan
```
1. User clicks "Confirm" on challan
2. Backend validates:
   - Challan belongs to user's business
   - Customer belongs to user's business
   - All products belong to user's business
   - Stock is available
3. Atomic transaction:
   - Deduct stock from each product
   - Create stock movement records
   - Update challan status
   - Log audit entry
4. All succeed or all fail together
```

### Following Up on Customer
```
1. BUSINESS_ADMIN or SALES creates follow-up
2. System captures:
   - businessId from JWT
   - customerId from request (validated)
   - followUpDate, notes, assignedTo
3. Can filter by date, status, assigned user
4. Dashboard shows: today, overdue, upcoming
5. Audit log tracks creation and updates
```

---

## Troubleshooting

### Issue: Customers from other business visible
**Check**: 
- Service using `findFirst({where: {id, businessId}})`
- businessId from `req.user.businessId`
- Database indexes on businessId

### Issue: Dashboard showing wrong data
**Check**:
- Dashboard service checking businessId
- Cache invalidation on updates
- Query filters by businessId

### Issue: Challan confirmation failing
**Check**:
- All validations include businessId
- Stock check considers current inventory
- Transaction working correctly

### Issue: Audit logs not recording
**Check**:
- Audit service called after operations
- businessId passed to audit functions
- Database connection to AuditLog table

---

## Deployment

### Prerequisites
```
- Node.js 18+
- PostgreSQL 13+
- npm or yarn
```

### Environment Variables
```
DATABASE_URL=postgresql://user:pass@host/dbname
JWT_SECRET=strong-random-secret-key
NODE_ENV=production
PORT=5000
```

### Deployment Steps
```bash
# 1. Build
npm run build

# 2. Run migrations
npx prisma migrate deploy

# 3. Seed initial data
npm run db:seed

# 4. Start server
npm start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npx prisma generate
RUN npx prisma migrate deploy
CMD ["npm", "start"]
```

---

## Monitoring & Logging

### Key Metrics to Monitor
- Auth success/failure rate
- API response times per businessId
- Database query performance
- Stock movement frequency
- Challan confirmation success rate
- Failed IDOR attempts (should be 0)

### Audit Log Queries
```typescript
// Get all actions by a user
GET /api/audit/my

// Get business activity
GET /api/audit/business

// Get platform activity (SUPER_ADMIN)
GET /api/audit/platform

// Filter by action type
GET /api/audit/business?action=CONFIRM_CHALLAN
```

---

## Limitations & Future Work

### Current Limitations
1. **PDF Generation**: Not implemented (Phase 2)
2. **Notifications**: Schema ready, API pending
3. **Reports**: Dashboard exists, detailed reports pending
4. **Business Settings**: Configured via seed, UI pending
5. **Rate Limiting**: Not implemented
6. **2FA**: Not implemented
7. **File Upload**: Logo/documents not implemented

### Planned Features
- [ ] PDF generation for challans
- [ ] Email notifications
- [ ] Advanced reporting with exports
- [ ] Business settings UI
- [ ] API rate limiting
- [ ] Two-factor authentication
- [ ] File storage (logos, attachments)
- [ ] Real-time notifications
- [ ] Mobile app support

---

## Testing

### Manual Testing Flow
1. **Login**: Try SUPER_ADMIN, BUSINESS_ADMIN, SALES
2. **Navigation**: Verify role-based menu visibility
3. **Create Customer**: Verify businessId assignment
4. **List Customers**: Verify only business customers shown
5. **Create Challan**: Verify product validation
6. **Confirm Challan**: Verify stock deduction
7. **Check Audit**: Verify action logged with businessId
8. **Cross-Business Attack**: Try accessing other business data (should fail)

### Recommended Tests
```typescript
// IDOR Prevention
test('cannot access customer from other business', () => {
  const result = getCustomerById('CUST_B', 'BUSINESS_A');
  expect(result).toBeNull();
});

// Stock Validation
test('cannot confirm challan with insufficient stock', () => {
  expect(() => confirmChallan(challanId, businessId))
    .toThrow('Insufficient stock');
});

// Audit Logging
test('audit log records business context', () => {
  const logs = getBusinessAuditLogs('BUSINESS_A');
  expect(logs[0].businessId).toBe('BUSINESS_A');
});
```

---

## Support & Documentation

### Files to Read
1. **Architecture**: `MULTI_TENANT_CONVERSION_STATUS.md`
2. **Task Details**: `TASK_7_COMPLETE.md`, `TASKS_12_21_COMPLETE.md`
3. **Frontend Guide**: `PHASE_2_FRONTEND_GUIDE.md` (for next phase)

### Key Source Files
- Services: `backend/src/services/*.ts`
- Controllers: `backend/src/controllers/*.ts`
- Routes: `backend/src/routes/*.ts`
- Middleware: `backend/src/middleware/*.ts`
- Schema: `backend/prisma/schema.prisma`

---

## Version Information
- **Prisma**: 7.9.1+
- **Express**: 5.0+
- **Node**: 18+
- **PostgreSQL**: 13+
- **TypeScript**: 5.0+

---

## Contact & Support
For questions about implementation, refer to task documentation or service comments.

---

**Last Updated**: August 11, 2026
**Status**: Production Ready (Backend)
**Next Phase**: Frontend Updates (Phase 2)
