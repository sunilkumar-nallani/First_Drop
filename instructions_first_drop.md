# FirstDrop — Complete Instructions for AI Assistants

> **Purpose**: This file is the single source of truth for any AI assistant working on the FirstDrop project. Upload this file (along with the project folder) into a new conversation so the AI knows everything about the project and can help you deploy, debug, enhance, and maintain it.

---

## 1. What Is FirstDrop?

FirstDrop is a **startup idea validation platform** that connects founders with early adopters through a Tinder-like card-based discovery interface.

- **Founders** list early-stage startup ideas (title, description, sector, moat, USP, etc.)
- **Users / Early Adopters** browse those ideas by swiping through cards — clicking **"I'm In"** to join a waitlist or **"Pass"** to skip.
- **Founders get notified** whenever someone joins their waitlist.
- Both sides have **dashboards** to track activity.
- Users can browse without an account (anonymous waitlist join via email).

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 14 / 15 |
| Language | TypeScript | 5 |
| Styling | Tailwind CSS | 3.4 |
| Database | PostgreSQL | 15+ |
| ORM | Prisma | 6 |
| Authentication | NextAuth.js (Credentials + JWT) | 4 |
| Forms | React Hook Form + Zod validation | 7 / 3 |
| Server State | TanStack React Query | 5 |
| Email | Resend (optional, console fallback) | 4 |
| Icons | Lucide React | — |
| Toasts | react-hot-toast | 2 |
| Password Hashing | bcryptjs (pure JS, no native deps) | 2 |

---

## 3. Complete File & Folder Structure

```
firstdrop/
│
├── .env.example              # Template for environment variables
├── .eslintrc.json            # ESLint configuration
├── .gitignore                # Git ignore rules
├── middleware.ts              # NextAuth route-protection middleware
├── next.config.js             # Next.js configuration
├── next-env.d.ts              # Next.js TypeScript declarations
├── package.json               # Dependencies & npm scripts
├── package-lock.json          # Locked dependency tree
├── postcss.config.js          # PostCSS config (for Tailwind)
├── tailwind.config.ts         # Tailwind CSS theme & plugins
├── tsconfig.json              # TypeScript configuration
│
├── README.md                  # Project overview & quick start
├── DEVELOPER_GUIDE.md         # In-depth developer documentation
├── DEPLOYMENT.md              # Step-by-step Vercel + Neon deployment guide
├── TESTING.md                 # Manual testing checklist
├── instructions_first_drop.md # ← THIS FILE (AI instructions)
│
├── prisma/
│   ├── schema.prisma          # Database schema (4 models)
│   └── seed.ts                # Seed script with demo data
│
├── app/                       # Next.js App Router (pages + API)
│   ├── layout.tsx             # Root layout (fonts, providers, nav, footer)
│   ├── page.tsx               # Landing / home page
│   ├── providers.tsx          # SessionProvider + QueryClientProvider + Toaster
│   ├── globals.css            # Global Tailwind + custom styles
│   │
│   ├── login/page.tsx         # Login page
│   ├── join/page.tsx          # Registration page (user / founder / dual)
│   ├── create/page.tsx        # Create Idea page (founders only)
│   ├── dashboard/             # Dashboard page (founder tab + user tab)
│   │   ├── page.tsx
│   │   └── ...
│   ├── discovery/page.tsx     # Card-based idea discovery
│   ├── [companySlug]/         # Dynamic public idea pages
│   │   ├── page.tsx
│   │   └── ...
│   │
│   └── api/                   # API routes
│       ├── auth/              # NextAuth [...nextauth] + register
│       ├── ideas/             # CRUD for ideas + interest/pass actions
│       ├── dashboard/         # Dashboard data endpoint
│       └── profile/           # Profile update endpoint
│
├── components/
│   ├── Navigation.tsx         # Responsive top nav bar
│   ├── Footer.tsx             # Site footer
│   ├── forms/                 # Form components
│   │   ├── RegisterForm.tsx
│   │   ├── LoginForm.tsx
│   │   ├── CreateIdeaForm.tsx
│   │   └── WaitlistEmailForm.tsx
│   └── ui/                    # Reusable UI primitives
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       ├── Avatar.tsx
│       └── Tabs.tsx
│
├── lib/                       # Utilities & shared modules
│   ├── auth.ts                # Server-side auth helpers (getCurrentUser, requireAuth, etc.)
│   ├── email.ts               # Email service (Resend or console fallback)
│   ├── prisma.ts              # Singleton Prisma client
│   └── utils.ts               # General utilities (cn, formatDate, etc.)
│
├── services/                  # Business logic layer (all DB operations)
│   ├── ideaService.ts         # Create, read, list ideas
│   ├── reactionService.ts     # Record "I'm In" / "Pass" reactions
│   ├── userService.ts         # User registration, profile updates
│   └── waitlistService.ts     # Waitlist join, list, count
│
├── types/
│   └── next-auth.d.ts         # NextAuth session type extensions
│
└── node_modules/              # Installed dependencies (do NOT modify)
```

---

## 4. Database Schema (PostgreSQL + Prisma)

There are **4 models** defined in `prisma/schema.prisma`:

### 4.1 User
| Field | Type | Notes |
|---|---|---|
| id | String (CUID) | Primary key |
| name | String | Display name |
| email | String | Unique |
| passwordHash | String | bcrypt hashed |
| isFounder | Boolean | Can list ideas |
| isUser | Boolean | Can discover ideas |
| about | String? | Bio |
| profilePhoto | String? | URL |
| socialHandles | Json? | `{ twitter, linkedin, ... }` |
| createdAt / updatedAt | DateTime | Auto |

### 4.2 Idea
| Field | Type | Notes |
|---|---|---|
| id | String (CUID) | Primary key |
| title | String | Idea name |
| slug | String | Unique, URL-friendly |
| sector / subSector | String | Category |
| ideaDescription | Text | Full description |
| moat | Text | Competitive advantage |
| usp | Text | Unique selling proposition |
| marketSize | String? | Market size |
| ask | String? | What founder needs |
| isFirstTimeFounder | Boolean | Default false |
| mediaUrls | Json? | Array of URLs |
| companyInfo | Text? | Company details |
| contactInfo | String? | Contact info |
| founderId | String | FK → User |

### 4.3 Reaction
| Field | Type | Notes |
|---|---|---|
| id | String (CUID) | Primary key |
| type | Enum (IN / PASS) | User's reaction |
| userId | String | FK → User |
| ideaId | String | FK → Idea |
| Unique constraint | [userId, ideaId] | One reaction per user per idea |

### 4.4 WaitlistEntry
| Field | Type | Notes |
|---|---|---|
| id | String (CUID) | Primary key |
| email | String | Email of person joining |
| userId | String? | FK → User (nullable for anonymous) |
| ideaId | String | FK → Idea |
| Unique constraint | [email, ideaId] | One entry per email per idea |

---

## 5. Authentication System

- **Provider**: NextAuth.js with **Credentials** provider (email + password).
- **Session Strategy**: **JWT** (stateless, no DB session table — ideal for Vercel serverless).
- **Password Hashing**: bcryptjs, 12 salt rounds.
- **Middleware** (`middleware.ts`): Protects `/dashboard/*` (any auth), `/create` (founders only), and write API routes.

### Role System
- `isFounder = true` → Can create ideas, see founder dashboard tab.
- `isUser = true` → Can browse/discover ideas, see user dashboard tab.
- Users can have **both** roles simultaneously (dual-role).

### Key Auth Functions (in `lib/auth.ts`)
- `getCurrentUser()` — Get session in Server Components.
- `getCurrentUserProfile()` — Get full user profile (excludes passwordHash).
- `requireAuth()` — Throws if not authenticated (for API routes).
- `requireFounder()` — Check founder permission.

---

## 6. API Routes

### Public (No Auth Required)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/ideas` | List all ideas for discovery |
| GET | `/api/ideas/[slug]` | Get single idea by slug |

### Protected (Auth Required)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ideas` | Create new idea (founders only) |
| POST | `/api/ideas/[id]/interest` | "I'm In" — joins waitlist |
| POST | `/api/ideas/[id]/pass` | "Pass" — records PASS reaction |
| GET | `/api/dashboard` | Get dashboard data |
| PUT | `/api/profile` | Update user profile |
| POST | `/api/auth/register` | Register new user |

### Error Format
```json
{
  "error": {
    "message": "Human readable message",
    "code": "ERROR_CODE",
    "details": []
  }
}
```

---

## 7. Environment Variables (REQUIRED)

Create a `.env.local` file (or set in Vercel dashboard for production):

```bash
# ═══════════════════════════════════════════════
# REQUIRED
# ═══════════════════════════════════════════════

# PostgreSQL connection string
# Local:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/firstdrop?schema=public"
# Production (Neon): postgresql://user:pass@ep-xxx.neon.tech/firstdrop?sslmode=require&connection_limit=1

# NextAuth secret — generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-random-secret-min-32-chars"

# Your app's canonical URL
NEXTAUTH_URL="http://localhost:3000"
# Production: https://your-domain.vercel.app

# ═══════════════════════════════════════════════
# OPTIONAL (email notifications)
# ═══════════════════════════════════════════════
RESEND_API_KEY=""
RESEND_FROM_EMAIL=""
```

> **Without RESEND_API_KEY**: Emails are logged to the console instead. The app works fine without it.

---

## 8. Step-by-Step: Running Locally

### Prerequisites
- **Node.js 18+** installed
- **PostgreSQL** installed and running locally (or use a remote DB like Neon/Supabase)
- **npm** (comes with Node.js)

### Steps

```bash
# 1. Navigate to the project folder
cd firstdrop

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env.local
# Edit .env.local — at minimum set DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL

# 4. Generate Prisma Client
npx prisma generate

# 5. Create database tables (run migrations)
npx prisma migrate dev

# 6. Seed the database with demo data
npm run db:seed

# 7. Start the development server
npm run dev
```

Open **http://localhost:3000** in your browser.

### Demo Credentials (after seeding)
| Role | Email | Password |
|---|---|---|
| Founder | sarah@techstart.io | password123 |
| User | alex@producthunt.com | password123 |
| Dual (both) | jordan@innovate.co | password123 |

---

## 9. Step-by-Step: Deploying to Vercel

### 9.1 Set Up a Database (Neon — Free Tier)

1. Go to **https://neon.tech** → Sign up.
2. Create a new project named `firstdrop`.
3. Choose region closest to your users.
4. Copy the **connection string** from the dashboard.
5. Append `&connection_limit=1` to the connection string (required for Vercel serverless).

Example:
```
postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/firstdrop?sslmode=require&connection_limit=1
```

### 9.2 Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/firstdrop.git
git push -u origin main
```

### 9.3 Deploy to Vercel

1. Go to **https://vercel.com** → Sign in with GitHub.
2. Click **"Add New Project"** → Import your `firstdrop` repository.
3. Vercel auto-detects Next.js.
4. **Add Environment Variables** in the Vercel settings:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Neon connection string (with `connection_limit=1`) |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` and paste result |
| `NEXTAUTH_URL` | `https://your-project.vercel.app` |
| `RESEND_API_KEY` | *(optional)* Your Resend API key |
| `RESEND_FROM_EMAIL` | *(optional)* Verified sender email |

5. Click **"Deploy"** → Wait 2–3 minutes for the build.
6. The `vercel-build` script in `package.json` automatically runs `prisma generate`, `prisma migrate deploy`, and `next build`.

### 9.4 Seed Production Database (Optional)

```bash
# Option A: Temporarily set production DATABASE_URL locally
set DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/firstdrop?sslmode=require&connection_limit=1"
npm run db:seed

# Option B: Use Vercel CLI
npm i -g vercel
vercel login
vercel link
vercel env pull .env.production
npm run db:seed
```

### 9.5 Custom Domain (Optional)

1. In Vercel → Project Settings → Domains → Add your domain.
2. Configure DNS at your registrar:
   - **A record**: `@` → `76.76.21.21`
   - **CNAME**: `www` → `cname.vercel-dns.com`
3. Wait for DNS propagation (up to 48 hours).
4. **Update `NEXTAUTH_URL`** in Vercel to your custom domain → Redeploy.

---

## 10. npm Scripts Reference

| Command | What It Does |
|---|---|
| `npm run dev` | Start dev server at http://localhost:3000 |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Create a new Prisma migration |
| `npm run db:deploy` | Deploy pending migrations to DB |
| `npm run db:seed` | Seed the database with demo data |
| `npm run db:studio` | Open Prisma Studio (visual DB browser at http://localhost:5555) |
| `npm run db:reset` | Reset DB + re-seed (⚠️ destroys all data) |

---

## 11. Key Architecture Patterns

### Service Layer
All database operations go through the **services/** directory — never call Prisma directly from API routes or page components. Services: `ideaService`, `reactionService`, `userService`, `waitlistService`.

### Singleton Prisma Client
`lib/prisma.ts` uses a singleton pattern to prevent multiple Prisma Client instances in development (Next.js hot reload creates new instances).

### Middleware Route Protection
`middleware.ts` uses NextAuth's `withAuth` to protect routes:
- `/dashboard/*` → Requires any authenticated user.
- `/create` → Requires `isFounder = true`.
- Write API routes → Require auth.
- Public API (GET `/api/ideas`) → No auth needed.

### Provider Wrapping
`app/providers.tsx` wraps the app with: `SessionProvider` (NextAuth), `QueryClientProvider` (TanStack Query), and `Toaster` (react-hot-toast).

### Client vs Server Components
- **Server Components** (default): Pages, layouts — use `getCurrentUser()` from `lib/auth.ts`.
- **Client Components** (`"use client"`): Forms, discovery page, interactive UI — use `useSession()` from `next-auth/react`.

---

## 12. How the Discovery Flow Works

```
User opens /discovery
  ↓
Fetches ideas from GET /api/ideas (filtered: excludes already-reacted ideas if logged in)
  ↓
Displays first idea as a card (title, description, founder info, stats)
  ↓
5-minute timer starts
  ↓
User clicks "I'm In":
  → If logged in: Creates Reaction(IN) + WaitlistEntry, sends email notification to founder
  → If not logged in: Shows email modal → Creates anonymous WaitlistEntry
  ↓
User clicks "Pass":
  → If logged in: Creates Reaction(PASS)
  → Advances to next card
  ↓
Timer expires:
  → Auto-advances (treated as pass)
  ↓
All ideas viewed:
  → Shows "You've seen everything!" with option to restart or create idea
```

---

## 13. Common Troubleshooting

| Issue | Fix |
|---|---|
| `Cannot find module '@prisma/client'` | Run `npx prisma generate` |
| Database connection failed | Check `DATABASE_URL`, ensure PostgreSQL is running, add `connection_limit=1` |
| `JWT must be provided` | Set `NEXTAUTH_SECRET` (min 32 chars) |
| Session not persisting | Ensure `NEXTAUTH_URL` matches your actual domain, clear cookies |
| Multiple Prisma Client instances | Restart dev server; verify singleton pattern in `lib/prisma.ts` |
| Build fails on Vercel | Check `postinstall` script (`prisma generate`) exists in `package.json` |
| API routes return 404 | Check file paths match URL patterns; verify route.ts exports GET/POST |
| Form validation not working | Verify `zodResolver` import; check Zod schema; ensure all fields registered |

---

## 14. Instructions for the AI Assistant

When the user uploads the FirstDrop project folder along with this file into a new conversation, here is what you should know and be ready to do:

### What You Already Have
- ✅ A **complete, working Next.js project** with all source code.
- ✅ A **PostgreSQL database schema** (4 models: User, Idea, Reaction, WaitlistEntry).
- ✅ **Authentication** via NextAuth.js (Credentials + JWT).
- ✅ **API routes** for CRUD operations on ideas, waitlists, reactions, profiles.
- ✅ **Frontend pages**: Landing, Login, Register, Discovery, Dashboard, Create Idea, Public Idea Pages.
- ✅ **Email notifications** via Resend (with console fallback).
- ✅ **Tailwind CSS** styling with custom theme.

### What You Should Help The User Do
1. **Understand the project** — Walk through any part of the codebase upon request.
2. **Set up locally** — Help configure `.env.local`, install deps, run migrations, seed, and start the dev server.
3. **Connect a database** — Help set up Neon (or Supabase) PostgreSQL and configure the connection string.
4. **Deploy to Vercel** — Push to GitHub, import to Vercel, configure env vars, run migrations.
5. **Fix bugs** — Debug issues using the troubleshooting guide above.
6. **Add features** — Follow the existing architecture patterns (service layer, Prisma, App Router conventions).
7. **Customize UI** — Modify Tailwind theme, components, or create new pages.
8. **Set up email** — Help configure Resend for real email notifications.
9. **Test** — Walk through the manual testing checklist from TESTING.md.
10. **Custom domain** — Help configure DNS and update NEXTAUTH_URL.

### Important Rules When Modifying This Project
- **Always use the service layer** (`services/`) for database operations.
- **Never expose `passwordHash`** in API responses.
- **Use the singleton Prisma client** from `lib/prisma.ts`.
- **Follow the existing code patterns**: TypeScript strict mode, Zod validation, React Hook Form, etc.
- **Run `npx prisma generate`** after any schema changes.
- **Run `npx prisma migrate dev`** to create migrations after schema changes.
- **Keep `connection_limit=1`** in production DATABASE_URL for Vercel serverless compatibility.

---

## 15. Quick Reference Card

```
┌─────────────────────────────────────────────┐
│  FirstDrop — Quick Reference                │
├─────────────────────────────────────────────┤
│  Start dev:       npm run dev               │
│  Build:           npm run build             │
│  DB migrate:      npx prisma migrate dev    │
│  DB seed:         npm run db:seed           │
│  DB studio:       npm run db:studio         │
│  Generate client: npx prisma generate       │
│                                             │
│  Local URL:       http://localhost:3000      │
│  Prisma Studio:   http://localhost:5555      │
│                                             │
│  Founder login:   sarah@techstart.io        │
│  User login:      alex@producthunt.com      │
│  Both roles:      jordan@innovate.co        │
│  Password (all):  password123               │
│                                             │
│  Key env vars:    DATABASE_URL              │
│                   NEXTAUTH_SECRET           │
│                   NEXTAUTH_URL              │
└─────────────────────────────────────────────┘
```

---

*This file was generated to serve as a complete context document for AI assistants. Upload this file along with the project folder in any new conversation to give the AI full understanding of FirstDrop.*
