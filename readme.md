# FundOps ERP

> A multi-tenant ERP and CRM platform for managing customers, inventory, sales challans, and team operations.

![Status](https://img.shields.io/badge/Status-Live-brightgreen)
![Node](https://img.shields.io/badge/Node.js-20.x-green)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

---

## 🌐 Live

| | URL |
|---|---|
| **Frontend** | https://main.d1rv29fzdgu3or.amplifyapp.com |
| **Backend API** | https://fundops-backend.onrender.com/api |

### Demo Credentials

| Role | Email | Password |
|---|---|---|
| Super Admin | demo.admin@fundops.local | Password@123 |
| Business Admin | abc.admin@fundops.local | Password@123 |
| Sales | sales@abc.local | Password@123 |
| Warehouse | warehouse@abc.local | Password@123 |
| Accounts | accounts@abc.local | Password@123 |

---

## ✨ Features

- 🏢 **Multi-Tenant** — Each business gets its own isolated workspace with separate data
- 👥 **Customer Management** — Track retail, wholesale & distributor customers with follow-up scheduling
- 📦 **Product & Inventory** — Manage stock levels, movements (IN/OUT/ADJUSTMENT), and low-stock alerts
- 🧾 **Sales Challans** — Create, confirm, cancel, and print delivery challans
- 📊 **Dashboard** — Real-time stats on sales, stock movements, and customer activity
- 👨‍💼 **Employee Management** — Add team members and assign roles
- 🔔 **Follow-Ups** — Schedule and track customer follow-ups with status management
- 📋 **Audit Logs** — Full activity trail for every action
- 🌙 **Dark Mode** — Full dark theme support
- 📱 **Responsive** — Works on mobile, tablet, and desktop
- 🔐 **Role-Based Access** — 5 roles with granular permissions

---

## 🛠️ Tech Stack

### Frontend
| | |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Routing | React Router v6 |
| HTTP | Axios |
| Styling | CSS Variables (light/dark) |
| Hosting | AWS Amplify |

### Backend
| | |
|---|---|
| Runtime | Node.js 20 + TypeScript |
| Framework | Express 5 |
| ORM | Prisma 7 |
| Database | PostgreSQL (Neon) |
| Auth | JWT + bcryptjs |
| Validation | Zod |
| Hosting | Render.com / AWS EC2 |

---

## 🏗️ Architecture

```
┌─────────────────────┐     ┌──────────────────────┐     ┌──────────────┐
│   AWS Amplify       │────▶│   Render.com         │────▶│   Neon       │
│   React + Vite      │     │   Express REST API   │     │   PostgreSQL │
│   HTTPS + CDN       │     │   Node.js 20         │     │   Serverless │
└─────────────────────┘     └──────────────────────┘     └──────────────┘
```

---

## 📁 Project Structure

```
fundops-erp/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── seed.ts             # Seed data
│   ├── src/
│   │   ├── controllers/        # Route handlers
│   │   ├── services/           # Business logic
│   │   ├── routes/             # API routes
│   │   ├── middleware/         # Auth, roles, errors
│   │   ├── validators/         # Zod schemas
│   │   ├── lib/                # Prisma client
│   │   ├── config/             # Environment config
│   │   ├── app.ts              # Express app
│   │   └── server.ts           # Entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/              # Route pages
│   │   ├── components/         # Shared components
│   │   ├── services/           # API calls
│   │   ├── types/              # TypeScript types
│   │   ├── App.tsx             # Routes
│   │   ├── main.tsx            # Entry point
│   │   └── index.css           # Global styles
│   └── package.json
│
└── amplify.yml                 # Amplify build config
```

---

## 🔐 Roles & Permissions

| Feature | SUPER_ADMIN | BUSINESS_ADMIN | SALES | WAREHOUSE | ACCOUNTS |
|---|:---:|:---:|:---:|:---:|:---:|
| Manage Businesses | ✅ | ❌ | ❌ | ❌ | ❌ |
| Platform Dashboard | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Employees | ❌ | ✅ | ❌ | ❌ | ❌ |
| Customers | ❌ | ✅ | ✅ | ❌ | ✅ |
| Products | ❌ | ✅ | ✅ | ✅ | ❌ |
| Inventory | ❌ | ✅ | ❌ | ✅ | ❌ |
| Challans | ❌ | ✅ | ✅ | ❌ | ✅ |
| Follow-Ups | ❌ | ✅ | ✅ | ❌ | ❌ |
| Audit Logs | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 🚀 Local Development

### Prerequisites
- Node.js 20+
- PostgreSQL or [Neon](https://neon.tech) free account

### 1. Clone

```bash
git clone https://github.com/ManishKudtarkar/fundops.git
cd fundops
```

### 2. Backend

```bash
cd backend
npm install
```

Create `.env`:
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET=your_strong_secret_here
PORT=5000
NODE_ENV=development
```

```bash
npx prisma generate
npx prisma migrate deploy
npx tsx prisma/seed.ts
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
```

Create `.env.local`:
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
# Open http://localhost:5173
```

---

## 📡 API Reference

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/login` | Login | Public |
| POST | `/api/auth/register` | Register new business | Public |
| GET | `/api/auth/me` | Current user | Required |
| GET | `/api/dashboard` | Dashboard metrics | Required |
| GET/POST | `/api/customers` | List / Create customers | Required |
| GET/PUT/DELETE | `/api/customers/:id` | Get / Update / Delete | Required |
| GET/POST | `/api/products` | List / Create products | Required |
| GET/PUT | `/api/products/:id` | Get / Update product | Required |
| POST | `/api/products/:id/stock` | Stock movement | Required |
| GET | `/api/inventory` | Stock movement history | Required |
| GET/POST | `/api/challans` | List / Create challans | Required |
| POST | `/api/challans/:id/confirm` | Confirm challan | Required |
| POST | `/api/challans/:id/cancel` | Cancel challan | Required |
| GET/POST | `/api/followups` | List / Create follow-ups | Required |
| GET/POST | `/api/employees` | List / Create employees | Admin |
| GET/POST | `/api/businesses` | List / Create businesses | Super Admin |
| GET | `/api/audit` | Audit logs | Admin |

---

## 🌍 Deployment

### Frontend → AWS Amplify

The `amplify.yml` at the repo root handles the build automatically:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: frontend/dist
    files:
      - '**/*'
```

Set in Amplify Console → Environment variables:
```
VITE_API_URL = https://your-backend.onrender.com/api
```

### Backend → Render.com

- **Root Directory:** `backend`
- **Build Command:** `npm install && tsc || true`
- **Start Command:** `node dist/server.js`

Environment variables to add:
```
DATABASE_URL
JWT_SECRET
NODE_ENV=production
PORT=10000
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m 'feat: add your feature'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT © [Manish Kudtarkar](https://github.com/ManishKudtarkar)
