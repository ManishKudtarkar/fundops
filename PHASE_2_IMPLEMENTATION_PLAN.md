# PHASE 2: Frontend, Route Protection & Testing - Implementation Plan

## Current Status Summary

### Backend ✅ COMPLETE (100%)
- Multi-tenant database schema complete
- 10 services with business scoping
- 10 controllers with proper authorization
- 40+ API endpoints secured
- IDOR prevention implemented
- Atomic transactions for critical operations
- Audit logging system complete
- Follow-up tracking system complete

### Frontend ⏳ NEEDS UPDATE (6/11 pages, incomplete auth)
- 6 existing pages (Dashboard, Customers, Products, Inventory, Challans, Login)
- 3 existing components (Layout, ProtectedRoute, PrintableChallan)
- 5 pages missing (PlatformDashboard, Employees, Businesses, FollowUps, AuditLogs)
- Auth context incomplete (no businessId storage)
- Types incomplete (missing SUPER_ADMIN, BUSINESS_ADMIN, Business interface)
- ProtectedRoute doesn't validate roles or business context

### Testing ⏳ NOT IMPLEMENTED (0%)
- No test files
- No test framework
- 0 tests for tenant isolation

---

## PHASE 2: Implementation Plan

### Phase 2A: Frontend Types & Auth (Week 1)

#### Task 1: Update Frontend Types (40 minutes)
**File**: `frontend/src/types/index.ts`

Changes:
```typescript
// OLD
type Role = "ADMIN" | "SALES" | "WAREHOUSE" | "ACCOUNTS";
interface User { id, name, email, role }

// NEW
type Role = "SUPER_ADMIN" | "BUSINESS_ADMIN" | "SALES" | "WAREHOUSE" | "ACCOUNTS";
interface User { id, name, email, role, businessId, businessName, isActive }
interface Business { id, name, status, email, phone, ... }
interface FollowUp { id, businessId, customerId, title, notes, ... }
interface AuditLog { id, businessId, userId, action, ... }
```

#### Task 2: Update Auth Service (1 hour)
**File**: `frontend/src/services/auth.service.ts`

Changes:
- Store businessId from JWT
- Extract businessName from login response
- Add `getBusinessId()` method
- Add `getBusinessName()` method
- Add `isSuperAdmin()` method
- Add `isBusinessAdmin()` method
- Update localStorage keys

#### Task 3: Update ProtectedRoute (45 minutes)
**File**: `frontend/src/components/ProtectedRoute.tsx`

Changes:
- Add `requiredRoles` parameter
- Add `requireBusiness` parameter
- Check roles: return 403 if no match
- Check businessId if requireBusiness=true
- Show appropriate error message

#### Task 4: Update Layout Component (1 hour)
**File**: `frontend/src/components/Layout.tsx`

Changes:
- Display business name in header
- Display user role
- Show "Platform Admin" for SUPER_ADMIN
- Show "Business Admin" for BUSINESS_ADMIN
- Filter navigation by user role
- Hide unavailable menu items

---

### Phase 2B: New Pages (Week 1-2)

#### Task 5: Create PlatformDashboard Page (1.5 hours)
**File**: `frontend/src/pages/PlatformDashboard.tsx`
- SUPER_ADMIN only
- Show: Total businesses, active businesses, total users, platform activity
- List recent audit events
- Link to Businesses management

#### Task 6: Create Businesses Page (2 hours)
**File**: `frontend/src/pages/Businesses.tsx`
- SUPER_ADMIN only
- List all businesses with pagination
- Create business form
- Edit business details
- Change business status (ACTIVE/SUSPENDED/INACTIVE)
- View business users and statistics

#### Task 7: Create Employees Page (2 hours)
**File**: `frontend/src/pages/Employees.tsx`
- BUSINESS_ADMIN only
- List team members with pagination
- Create employee form (name, email, password, role)
- Edit employee (name, role, active status)
- Reset employee password
- Delete employee

#### Task 8: Create FollowUps Page (2 hours)
**File**: `frontend/src/pages/FollowUps.tsx`
- SALES and BUSINESS_ADMIN only
- Dashboard summary (Today, Overdue, Upcoming)
- List follow-ups with filtering
- Create follow-up form
- Edit follow-up
- Mark as completed/cancelled
- Filter by date, status, assigned user

#### Task 9: Create AuditLogs Page (1.5 hours)
**File**: `frontend/src/pages/AuditLogs.tsx`
- BUSINESS_ADMIN and SUPER_ADMIN only
- List audit logs with pagination
- Filter by action, user, date range
- Show: Who did what, when, on which entity
- Timestamp sorting (newest first)

#### Task 10: Create BusinessSettings Page (1 hour)
**File**: `frontend/src/pages/BusinessSettings.tsx`
- BUSINESS_ADMIN only
- View/edit business name, email, phone, address, GSTIN
- Upload logo (if implemented)
- Manage notification preferences

---

### Phase 2C: Route Protection (Week 1)

#### Task 11: Update App.tsx Routes (1.5 hours)
**File**: `frontend/src/App.tsx`

Changes:
```typescript
// Existing routes with role requirements
<Route path="/dashboard" element={<ProtectedRoute requiredRoles={["BUSINESS_ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"]} requireBusiness><Dashboard /></ProtectedRoute>} />

// New routes with role requirements
<Route path="/platform-dashboard" element={<ProtectedRoute requiredRoles={["SUPER_ADMIN"]}><PlatformDashboard /></ProtectedRoute>} />
<Route path="/businesses" element={<ProtectedRoute requiredRoles={["SUPER_ADMIN"]}><Businesses /></ProtectedRoute>} />
<Route path="/employees" element={<ProtectedRoute requiredRoles={["BUSINESS_ADMIN"]} requireBusiness><Employees /></ProtectedRoute>} />
<Route path="/followups" element={<ProtectedRoute requiredRoles={["BUSINESS_ADMIN", "SALES"]} requireBusiness><FollowUps /></ProtectedRoute>} />
<Route path="/audit" element={<ProtectedRoute requiredRoles={["BUSINESS_ADMIN", "SUPER_ADMIN"]}><AuditLogs /></ProtectedRoute>} />
<Route path="/business-settings" element={<ProtectedRoute requiredRoles={["BUSINESS_ADMIN"]} requireBusiness><BusinessSettings /></ProtectedRoute>} />
```

#### Task 12: Update Services for Business Context (1 hour)
**Files**: All service files in `frontend/src/services/`

Changes:
- Extract businessId from auth service
- Log businessId with API calls (for debugging)
- Handle 401 (redirect to login)
- Handle 403 (show unauthorized error)
- Don't expose error details to user

---

### Phase 2D: Comprehensive Testing (Week 2-3)

#### Task 13: Setup Test Framework (1 hour)
Install Jest and testing libraries:
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom supertest
```

#### Task 14: Create Backend Tenant Isolation Tests (4 hours)
**File**: `backend/src/__tests__/tenant-isolation.test.ts`

Tests:
```typescript
// Business A user accessing Business B data
test('Cannot access customer from other business')
test('Cannot access product from other business')
test('Cannot confirm challan for other business')
test('Cannot access inventory for other business')

// Role-based access control
test('SALES cannot access employee management')
test('WAREHOUSE cannot modify customers')
test('BUSINESS_ADMIN cannot access SUPER_ADMIN endpoints')

// Cross-business attacks
test('Cannot create customer under other business')
test('Cannot modify product from other business')
test('Cannot delete inventory from other business')

// Stock validation
test('Cannot confirm challan with insufficient stock')
test('Stock deduction is atomic (no partial updates)')

// Audit logging
test('Audit logs filtered by business')
test('SUPER_ADMIN sees platform logs')
test('BUSINESS_ADMIN sees business logs only')
```

#### Task 15: Create Frontend Auth Tests (2 hours)
**File**: `frontend/src/__tests__/auth.test.tsx`

Tests:
```typescript
test('Login stores businessId')
test('PlatformDashboard requires SUPER_ADMIN')
test('Employees page requires BUSINESS_ADMIN')
test('Logout clears businessId')
test('Refresh with valid JWT restores businessId')
```

#### Task 16: Create API Security Tests (3 hours)
**File**: `backend/src/__tests__/api-security.test.ts`

Tests:
```typescript
test('GET /customers returns 401 without auth')
test('GET /customers/:id returns 404 for other business')
test('POST /customers creates with user businessId')
test('PUT /customers/:id requires same business')
test('DELETE /customers/:id requires same business')

// Similar for products, challans, inventory, etc.
```

---

### Phase 2E: API Security Review (Week 2)

#### Task 17: Audit Every API Endpoint (2 days)
**Review Checklist for each endpoint**:
1. ✅ Is authentication required? (check middleware)
2. ✅ What role is allowed? (check authorize())
3. ✅ What business owns this data? (check businessId)
4. ✅ Is businessId enforced server-side? (check service)
5. ✅ Can user access other business data? (IDOR test)
6. ✅ Can user create data under other business? (test POST)
7. ✅ Can user delete other business data? (test DELETE)

**Endpoints to Review**:
- `/api/customers/*` - ✅ PROTECTED
- `/api/products/*` - ✅ PROTECTED
- `/api/challans/*` - ✅ PROTECTED
- `/api/inventory/*` - ✅ PROTECTED
- `/api/followups/*` - ✅ PROTECTED
- `/api/employees/*` - ✅ PROTECTED
- `/api/businesses/*` - ✅ PROTECTED (SUPER_ADMIN only)
- `/api/audit/*` - ✅ PROTECTED
- `/api/dashboard` - ✅ PROTECTED
- `/api/auth/*` - LOGIN public, others need auth

---

### Phase 2F: Seed Data & Documentation (Week 2-3)

#### Task 18: Create Multi-Business Seed Data (2 hours)
**File**: `backend/prisma/seed.ts` (update)

Add:
```
Business 1: FundOps Demo Business
  - SUPER_ADMIN: admin@fundops.com
  - BUSINESS_ADMIN: demo-admin@fundops.com
  - 5 SALES users
  - 100+ customers
  - 50+ products
  - 1000+ inventory records
  - 50+ challans

Business 2: ABC Traders
  - BUSINESS_ADMIN: abc.admin@fundops.com
  - SALES: sales@abc.local
  - WAREHOUSE: warehouse@abc.local
  - ACCOUNTS: accounts@abc.local
  - 50+ customers
  - 30+ products
  - 500+ inventory records
  - 20+ challans
```

#### Task 19: Create Comprehensive Documentation (2 hours)
Document for developers:
- How to run the app
- How to test multi-tenancy
- API security checklist
- Frontend route protection
- Testing procedures

---

## Implementation Order (Strict Sequence)

### Week 1:
1. **Task 1**: Update types (40 min)
2. **Task 2**: Update auth service (1 hour)
3. **Task 3**: Update ProtectedRoute (45 min)
4. **Task 4**: Update Layout (1 hour)
5. **Task 11**: Update App.tsx routes (1.5 hours)
6. **Task 12**: Update services (1 hour)
7. **Task 5-10**: Create new pages (8.5 hours)

### Week 2:
1. **Task 17**: Audit API endpoints (2 days)
2. **Task 13**: Setup test framework (1 hour)
3. **Task 14**: Backend tenant tests (4 hours)
4. **Task 15**: Frontend auth tests (2 hours)
5. **Task 16**: API security tests (3 hours)

### Week 3:
1. **Task 18**: Seed data (2 hours)
2. **Task 19**: Documentation (2 hours)
3. Integration testing & fixes (3-4 hours)
4. Production deployment prep

---

## Code Examples

### Protected Route with Role Check
```typescript
// Before
<Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />

// After
<Route path="/customers" element={
  <ProtectedRoute 
    requiredRoles={["BUSINESS_ADMIN", "SALES", "ACCOUNTS"]} 
    requireBusiness
  >
    <Customers />
  </ProtectedRoute>
} />
```

### Layout with Business Context
```typescript
// Before
<header>FundOps ERP - System Administrator</header>

// After
<header>
  FundOps ERP | ABC Traders | Business Admin
  // or for SUPER_ADMIN
  FundOps ERP | Platform Administration | Super Admin
</header>
```

### Auth Service with businessId
```typescript
// Before
const user = JSON.parse(localStorage.getItem('user'));
// {id, name, email, role}

// After
const user = JSON.parse(localStorage.getItem('user'));
// {id, name, email, role, businessId, businessName}
const businessId = authService.getBusinessId();
const businessName = authService.getBusinessName();
```

---

## Testing Strategy

### Unit Tests (20 tests)
- Auth service logic
- Component rendering
- Type safety
- Role checking

### Integration Tests (15 tests)
- Login flow with businessId
- Create business → Create admin → Login flow
- Business A user can't access Business B data
- Stock deduction (confirm challan)
- Audit logging

### Security Tests (25 tests)
- IDOR prevention (each entity)
- Cross-business attacks (create, read, update, delete)
- Role-based access control
- API endpoint security

### End-to-End Tests (10 tests)
- SUPER_ADMIN workflow: Create business → Manage users → Audit logs
- BUSINESS_ADMIN workflow: Manage staff → Sales operations → Reports
- SALES workflow: Create customer → Create challan → Confirm
- WAREHOUSE workflow: Stock movements → Inventory tracking

---

## Success Criteria

### Frontend Complete When:
- ✅ All new pages render without errors
- ✅ ProtectedRoute blocks unauthorized access
- ✅ Navigation filters by user role
- ✅ Business name displays in header
- ✅ businessId stored from login
- ✅ API calls include proper auth

### Route Protection Complete When:
- ✅ SUPER_ADMIN can access /platform-dashboard
- ✅ SUPER_ADMIN cannot access /employees
- ✅ BUSINESS_ADMIN can access /employees
- ✅ BUSINESS_ADMIN cannot access /platform-dashboard
- ✅ SALES cannot access /businesses
- ✅ Redirects work properly

### Testing Complete When:
- ✅ 70+ tests pass
- ✅ No IDOR vulnerabilities found
- ✅ No cross-business data leaks
- ✅ 100% endpoint security verified
- ✅ Stock operations atomic
- ✅ Audit logging working

### Security Complete When:
- ✅ Every API endpoint authenticated
- ✅ Every endpoint role-checked
- ✅ Every query business-scoped
- ✅ No hardcoded credentials
- ✅ Error messages don't leak data
- ✅ All business data isolated

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Frontend auth incomplete | Can't use app | Test login flow immediately |
| ProtectedRoute not working | Unauthorized access | Test each role |
| API endpoints not secured | IDOR vulnerabilities | Audit all 40+ endpoints |
| Tests fail | Regressions in production | Fix during dev, not later |
| Seed data wrong | Testing with bad data | Verify data isolation |
| Performance issues | Slow app | Check query efficiency |

---

## Dependencies & Tools

### Backend Testing
- Jest: Unit & integration tests
- Supertest: HTTP testing
- ts-jest: TypeScript support

### Frontend Testing
- Vitest: Fast test runner
- React Testing Library: Component testing
- MSW: Mock API responses

### Development
- Node.js 18+
- PostgreSQL 13+
- npm or yarn

---

## Final Checklist

Before declaring Phase 2 complete:

**Frontend**
- [ ] Types updated with new roles
- [ ] Auth service stores businessId
- [ ] ProtectedRoute validates roles & business
- [ ] Layout shows business name & role
- [ ] All 11 pages created (6 existing + 5 new)
- [ ] Navigation filters by role
- [ ] All routes protected

**Route Protection**
- [ ] Every route has role requirement
- [ ] SUPER_ADMIN routes blocked for others
- [ ] BUSINESS_ADMIN routes require business context
- [ ] Unauthorized redirects to home/login
- [ ] 403 errors shown appropriately

**Testing**
- [ ] 70+ tests pass
- [ ] IDOR tests pass (no data leaks)
- [ ] Stock validation atomic
- [ ] Audit logging working
- [ ] All roles work correctly
- [ ] Login/logout flows work
- [ ] Cross-business attack blocked

**API Security**
- [ ] All 40+ endpoints reviewed
- [ ] Every endpoint authenticated
- [ ] Every endpoint role-checked
- [ ] Every query business-scoped
- [ ] No IDOR vulnerabilities
- [ ] Errors don't leak information

**Documentation**
- [ ] Frontend setup guide
- [ ] Testing guide
- [ ] API security checklist
- [ ] Deployment instructions
- [ ] Seed credentials documented

---

## Estimated Timeline

| Task | Estimate | Actual |
|------|----------|--------|
| **Week 1** | 15 hours | - |
| Types & Auth | 4 hours | |
| Route Protection | 3 hours | |
| New Pages | 8 hours | |
| | | |
| **Week 2** | 15 hours | - |
| API Audit | 16 hours | |
| Test Setup | 1 hour | |
| Tenant Tests | 4 hours | |
| Security Tests | 3 hours | |
| | | |
| **Week 3** | 6 hours | - |
| Seed Data | 2 hours | |
| Documentation | 2 hours | |
| Integration & Fixes | 3 hours | |
| **Total** | ~36 hours | |

---

## Success Definition

**The application is ready for production when:**

1. ✅ Every business-owned data entity has businessId
2. ✅ Every user has businessId (null for SUPER_ADMIN)
3. ✅ Every API query is business-scoped
4. ✅ Every API mutation is business-scoped
5. ✅ Every delete operation is business-scoped
6. ✅ Every search is business-scoped
7. ✅ Frontend routes protect based on role
8. ✅ Backend authorization protects all endpoints
9. ✅ SUPER_ADMIN separated from business users
10. ✅ Tests prove tenant isolation works
11. ✅ Existing features still work perfectly
12. ✅ IDOR tests all pass
13. ✅ No cross-business data visible
14. ✅ Audit logs track all actions
15. ✅ Documentation complete

---

This plan will be followed strictly. Ready to proceed with Phase 2A (Frontend Types & Auth) implementation.
