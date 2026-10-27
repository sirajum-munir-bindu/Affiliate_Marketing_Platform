# Skill.jobs Affiliation — Course Affiliate Marketing Platform

A production-grade, secure **Course Affiliate Marketing Platform** built for **Skill.jobs Affiliation** using **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM** with **PostgreSQL**.

The platform is designed around a **trustworthy white-red-blue visual identity** and provides **manual bKash payment verification**, robust **30-day affiliate cookie tracking**, multi-tier role authorization, idempotent transactions, and comprehensive admin audit logging.

---

## 🚀 Key Architectural Pillars

### 1. Manual bKash Payment Workflow (Zero-Fraud Human Audit)
- **Configurable bKash Receiving Number:** Configurable directly via the Admin Settings dashboard. Supports both `Make Payment (Merchant)` and `Send Money (Personal)`.
- **Payment Lifecycle:** `SUBMITTED` ➔ Admin Review ➔ `APPROVED` or `REJECTED`.
- **Atomic Database Transaction on Approval:**
  1. Verifies the payment is in `SUBMITTED` state.
  2. Marks the payment as `APPROVED` and order as `PAID`.
  3. Upserts the customer's `Enrollment` (idempotent: unique constraint `[studentId, courseId]` prevents double-enrollment).
  4. Creates an immutable `Commission` snapshot if an eligible affiliate is linked (unique constraint `orderId` prevents duplicate commissions).
  5. Records the reviewing admin, timestamp, and writes an immutable `AuditLog`.
- **Rejection Workflow:** Admin records a rejection reason that is displayed to the customer with an option to resubmit corrected bKash details without overwriting history.

### 2. Affiliate Tracking & Commission System
- **Non-Enumerable Codes:** Unique referral codes in format `REF_XXXXXXXX`.
- **Attribution Policy:** Last-click attribution with a 30-day cookie window (`affiliate_ref`).
- **Self-Referral Prevention:** Prevents marketers from earning commissions on their own student accounts.
- **Commission Snapshots:** Locked to the actual paid course price and commission rate at order approval to eliminate price drift.
- **Payout Management:** Marketers can request bKash payouts once their approved balance reaches the configurable threshold (default: ৳1,000). Commissions are reserved atomically to prevent duplicate withdrawals.

### 3. Role-Based Access Control (RBAC)
- **Super Admin:** Full platform control, payment review queue, course CRUD, marketer approval/suspension, payout settlement, and platform settings.
- **Marketer / Affiliate:** Submit marketer application, view status (`PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED`). Once approved: access affiliate dashboard, generate unique course tracking links, view real-time clicks, conversions, commission charts (Recharts), and request payouts.
- **Customer / Student:** Browse published courses, initiate checkout, submit bKash payment details, track order status, and access course content upon payment approval.

---

## 🎨 Brand Identity & Design System

The platform strictly adheres to the clean SaaS white-red-blue color palette:
- **Primary Brand Red:** `#E53945` (Primary accents, key CTAs, highlights)
- **Primary Brand Blue:** `#2563EB` (Navigation, links, secondary actions, analytics)
- **Dark Text:** `#172033` (High readability headings and body copy)
- **Secondary Text:** `#64748B` (Muted labels and captions)
- **Primary Background:** `#FFFFFF`
- **Subtle Background:** `#F8FAFC`
- **Borders:** `#E2E8F0`
- **Success:** `#16A34A` | **Warning:** `#D97706` | **Error:** `#DC2626`

---

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript with strict type-checking
- **Styling:** Tailwind CSS with custom brand theme tokens
- **Database:** PostgreSQL
- **ORM:** Prisma Client
- **Authentication:** Session JWT with `jose` and `bcryptjs` (secure httpOnly cookies)
- **Form Validation:** React Hook Form + Zod
- **Analytics & Charts:** Recharts
- **Notifications:** Sonner Toast Notifications
- **Testing:** Vitest

---

## 📂 Project Directory Structure

```
├── prisma/
│   └── schema.prisma         # Normalized database models, enums & relations
├── scripts/
│   └── seed.mjs              # Seed script (Admin, Marketer, Student, Courses, Settings)
├── src/
│   ├── __tests__/            # 19 Unit & Integration Tests (Business rules & bKash validation)
│   ├── app/
│   │   ├── (public)/         # Home, Courses catalog, Course details, How It Works
│   │   ├── admin/            # Admin Overview, Payments, Marketers, Courses, Orders, Payouts, Settings, Audit
│   │   ├── affiliate/        # Marketer application landing & form
│   │   ├── checkout/         # Course checkout & manual bKash submission
│   │   ├── login/            # Authentication login with demo accounts
│   │   ├── marketer/         # Marketer Dashboard, Link generation, Recharts analytics, Payout requests
│   │   ├── orders/           # Customer Order & Payment Status tracking
│   │   ├── register/         # Customer registration
│   │   ├── student/          # Student Portal & protected course classroom
│   │   └── api/              # RESTful API endpoints with Zod validation
│   ├── components/           # Reusable Navbar, Footer, CourseCard, StatusBadge, StatsCard
│   └── lib/
│       ├── affiliate.ts      # Referral code generator, commission calculations & attribution
│       ├── auth.ts           # Password hashing, JWT signing, role enforcement
│       ├── bkash.ts          # bKash TrxID & Bangladeshi phone normalization & validation
│       ├── prisma.ts         # Singleton PrismaClient
│       └── services/         # Decoupled business logic (verification, courses, orders, payouts)
```

---

## ⚡ Getting Started (Local Development)

### 1. Prerequisites
- Node.js 18+ (tested on Node 22)
- PostgreSQL database (local or hosted like Neon / Supabase)

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure your `DATABASE_URL` is set:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/affiliate_course_db?schema=public"
SESSION_SECRET="your-super-secret-random-key-at-least-32-characters-long"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Generate Prisma Client & Push Schema
```bash
npm run db:generate
npm run db:push
```

### 4. Seed Initial Data
```bash
npm run db:seed
```
This initializes:
- Default Platform Settings (bKash number: `01711223344`, instructions, ৳1,000 min payout)
- **Super Admin:** `admin@platform.com` / `AdminSecurePassword123!`
- **Approved Marketer:** `marketer@platform.com` / `Marketer123!` (Referral Code: `REF_GROW20`)
- **Pending Applicant:** `applicant@platform.com` / `Marketer123!`
- **Student Customer:** `student@platform.com` / `Student123!`
- 3 Verified Production-Ready Courses with curriculum modules

### 5. Start Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🧪 Testing

The platform includes comprehensive test suites covering all 14 mandatory business invariants:
```bash
npm test
```
Tests verify:
1. Marketer eligibility & status enforcement (`APPROVED` only).
2. Anti-self-referral protection.
3. Client cannot tamper with payment statuses (always `SUBMITTED`).
4. Duplicate transaction IDs are rejected across all orders.
5. Rejection creates no enrollment or commission.
6. Approval creates enrollment and commission snapshot exactly once (idempotency).
7. Repeated approvals do not create duplicate records.
8. Payout balance validation and minimum threshold enforcement.
9. Commission reservation to prevent double payout claims.
10. Role-based endpoint authorization.
11. bKash TrxID normalization and Bangladeshi phone validation.
12. Percentage and fixed commission calculation accuracy.

---

## 🚢 Deployment to Vercel & PostgreSQL

1. **Database:** Create a managed PostgreSQL database on [Neon.tech](https://neon.tech), [Supabase](https://supabase.com), or [Vercel Postgres](https://vercel.com/postgres).
2. **Environment Variables on Vercel:**
   - `DATABASE_URL`: Your hosted PostgreSQL connection string.
   - `SESSION_SECRET`: A secure 32+ character string.
   - `NEXT_PUBLIC_APP_URL`: Your production domain (e.g. `https://your-domain.vercel.app`).
   - `INITIAL_ADMIN_EMAIL`: Email for seed script.
   - `INITIAL_ADMIN_PASSWORD`: Strong password for Super Admin.
3. **Build Command:**
   ```bash
   npm run db:generate && next build
   ```
4. **Run Database Migration / Push:**
   In your CI or via terminal connected to your hosted DB:
   ```bash
   npx prisma db push
   node scripts/seed.mjs
   ```

---

## 🔒 Security Best Practices Implemented

- **Server-Side Authorization:** Every action checks the authenticated user's role on the server.
- **IDOR Protection:** Students can only view their own orders and access enrolled courses. Marketers can only view their own attributed orders and commission records.
- **CSRF & Cookie Hardening:** `httpOnly: true`, `sameSite: "lax"`, and `secure: true` in production.
- **Decimal Precision:** Financial amounts are stored using PostgreSQL `Decimal(10, 2)` to eliminate floating-point arithmetic errors.
- **Audit Logs:** Administrative actions (payment approval/rejection, marketer approval, payout settlement) are immutably logged with actor IDs and timestamp snapshots.
