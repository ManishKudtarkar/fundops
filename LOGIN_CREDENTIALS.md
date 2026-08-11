# 🔐 FundOps ERP - Login Credentials

**Default Password for All Test Accounts**: `Password@123`

---

## 📋 Test Accounts

### 1️⃣ SUPER_ADMIN (Full Platform Access)
```
Email:    admin@fundops.com
Password: Password@123
Role:     SUPER_ADMIN
```
**Access**: 
- Platform Dashboard
- Business Management
- All system features
- Platform audit logs

**What You'll See**:
- "Platform Dashboard" in sidebar
- "Businesses" in sidebar
- Full platform statistics
- Header shows "Platform Admin"

---

### 2️⃣ BUSINESS_ADMIN (Business-Level Access)
```
Email:    businessadmin@fundops.com
Password: Password@123
Role:     BUSINESS_ADMIN
```
**Access**:
- Business Dashboard
- Employee Management
- Audit Logs (business-level)
- All business operations
- Follow-ups management

**What You'll See**:
- "Employees" in sidebar
- "Audit Logs" in sidebar
- "Follow-ups" in sidebar
- Business dashboard
- Header shows "Business Admin"

---

### 3️⃣ SALES (Sales Operations)
```
Email:    sales@fundops.com
Password: Password@123
Role:     SALES
```
**Access**:
- Customer Management
- Product Catalog
- Sales Challans
- Follow-ups (assigned to them)

**What You'll See**:
- "Customers" in sidebar
- "Products" in sidebar
- "Sales Challans" in sidebar
- No "Employees" or "Businesses"
- Dashboard with sales metrics

---

### 4️⃣ WAREHOUSE (Warehouse Operations)
```
Email:    warehouse@fundops.com
Password: Password@123
Role:     WAREHOUSE
```
**Access**:
- Inventory Management
- Stock Movements
- Product Information
- Warehouse operations

**What You'll See**:
- "Inventory" in sidebar
- "Products" in sidebar
- Inventory dashboard
- Stock management
- No customer or sales items

---

### 5️⃣ ACCOUNTS (Finance Operations)
```
Email:    accounts@fundops.com
Password: Password@123
Role:     ACCOUNTS
```
**Access**:
- Customer Management
- Sales Challans
- Financial records
- Billing information

**What You'll See**:
- "Customers" in sidebar
- "Sales Challans" in sidebar
- Financial dashboard
- No inventory or employee items

---

## 🎯 How to Login

### Step 1: Open Application
Navigate to: **http://localhost:5173**

### Step 2: Enter Credentials
1. **Email Field**: Copy any email above
2. **Password Field**: `Password@123`
3. **Click Login Button**: Submit form

### Step 3: After Login
- You'll see the dashboard
- Header shows business name and role
- Sidebar shows filtered menu for your role
- Ready to explore features

---

## 🧪 Test Different Roles

### Recommended Testing Sequence

**1. Login as SUPER_ADMIN**
```
Email: admin@fundops.com
Password: Password@123
→ Notice: Platform Dashboard, Businesses in sidebar
→ Check: Header says "Platform Admin"
```

**2. Logout and Login as BUSINESS_ADMIN**
```
Email: businessadmin@fundops.com
Password: Password@123
→ Notice: Employees, Audit Logs, Follow-ups in sidebar
→ Check: Header shows business name and "Business Admin"
```

**3. Logout and Login as SALES**
```
Email: sales@fundops.com
Password: Password@123
→ Notice: Customers, Products, Challans in sidebar
→ Check: No admin options visible
```

**4. Try Unauthorized Access**
```
1. While logged in as SALES
2. Manually type in URL: /employees
3. Should see "403 Forbidden" error
4. This proves route protection works!
```

**5. Check Browser Storage**
```
1. Press F12 (DevTools)
2. Go to Application → LocalStorage
3. Click on "user" entry
4. See: businessId, businessName, role
5. This proves business context is stored!
```

---

## 💡 Tips

### Forgot Password?
- Development environment uses seed data
- Reset by running migrations again
- Or check seed.ts for default

### Can't Login?
- Verify email matches exactly
- Check password is `Password@123` (case-sensitive)
- Verify backend is running (port 5000)
- Check browser console (F12) for errors
- Try clearing localStorage (F12 → Application → Clear All)

### Multiple Test Accounts Same Role?
- Currently only one account per role
- Additional accounts can be created in admin panel (when implemented)

### Change Password Later?
- Settings page will allow password change
- Currently not implemented in Phase 2A
- Will be added in Phase 2B

---

## 🔐 Security Notes

### Development Only ⚠️
These are test credentials for **local development only**.
- Never use these in production
- Never commit passwords in code
- Always use secure password management in production

### Production Passwords
Before deploying to production:
- [ ] Change all default passwords
- [ ] Use a password manager
- [ ] Implement password reset flow
- [ ] Add 2-factor authentication
- [ ] Enable password hashing (bcryptjs is already used)

### Backend Security
- Passwords are hashed with bcryptjs (salt rounds: 10)
- Stored hashes in database, not plain text
- JWT for authentication (no session storage)
- businessId in JWT payload (backend validated)

---

## 🎓 What Each Account Can Access

### SUPER_ADMIN (admin@fundops.com)
```
✅ Platform Dashboard       → View platform statistics
✅ Businesses               → Manage all businesses
✅ User Management          → Manage platform users
✅ Audit Logs (Platform)    → View all actions across system
✅ Reports                  → Platform-wide reports
❌ Employee Management      → Only business admins can
❌ Customer Management      → Only business users can
```

### BUSINESS_ADMIN (businessadmin@fundops.com)
```
✅ Dashboard                → Business-specific dashboard
✅ Customers                → Manage business customers
✅ Products                 → Manage business products
✅ Inventory                → View inventory
✅ Sales Challans           → Create/manage challans
✅ Employees                → Manage team members
✅ Follow-ups               → Manage customer follow-ups
✅ Audit Logs (Business)    → View business activity logs
✅ Settings                 → Business settings
❌ Platform Dashboard       → Only SUPER_ADMIN
❌ Businesses               → Only SUPER_ADMIN
```

### SALES (sales@fundops.com)
```
✅ Dashboard                → Sales dashboard
✅ Customers                → Manage customers
✅ Products                 → View products
✅ Sales Challans           → Create/manage challans
✅ Follow-ups               → Manage assigned follow-ups
❌ Inventory                → Only warehouse
❌ Employees                → Only business admin
❌ Audit Logs               → Only business admin
```

### WAREHOUSE (warehouse@fundops.com)
```
✅ Dashboard                → Warehouse dashboard
✅ Products                 → View/manage products
✅ Inventory                → Full inventory management
✅ Stock Movements          → Track stock changes
❌ Customers                → Not warehouse role
❌ Sales Challans           → Not warehouse role
❌ Employee Management      → Not warehouse role
```

### ACCOUNTS (accounts@fundops.com)
```
✅ Dashboard                → Financial dashboard
✅ Customers                → View customers
✅ Sales Challans           → View/manage challans
✅ Reports                  → Financial reports
❌ Inventory                → Not finance role
❌ Employees                → Not finance role
❌ Product Management       → Not finance role
```

---

## 🎯 Quick Copy-Paste

### SUPER_ADMIN
```
admin@fundops.com
Password@123
```

### BUSINESS_ADMIN
```
businessadmin@fundops.com
Password@123
```

### SALES
```
sales@fundops.com
Password@123
```

### WAREHOUSE
```
warehouse@fundops.com
Password@123
```

### ACCOUNTS
```
accounts@fundops.com
Password@123
```

---

## ✅ Verify Login is Working

### Signs of Successful Login
- ✅ Redirected to dashboard
- ✅ Header shows business name and role
- ✅ Sidebar shows role-appropriate menu
- ✅ No error messages
- ✅ User avatar shows initials
- ✅ Logout button visible

### Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| "Invalid credentials" | Wrong email or password | Check credentials above |
| "User not found" | Email doesn't exist in database | Use exact email from above |
| "Connection failed" | Backend not running | Start backend: `npm run dev` in backend folder |
| "Network error" | Frontend/backend not communicating | Verify both on localhost |

---

## 🚀 You're Ready!

1. Open http://localhost:5173
2. Use any credential above
3. Explore the multi-tenant system
4. Try different roles
5. Test route protection

**Enjoy exploring FundOps ERP!** 🎉

---

**Remember**: Password is `Password@123` for all test accounts.
**Backend**: Must be running on port 5000
**Frontend**: Running on port 5173
**Database**: Connected to PostgreSQL

All credentials work! Pick any role and start exploring. 🚀
