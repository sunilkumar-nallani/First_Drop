# FirstDrop Developer Guide

Welcome to FirstDrop! This guide will help you understand the codebase and get started as a developer on the team.

---

## Table of Contents

1. [What is FirstDrop?](#1-what-is-firstdrop)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Getting Started](#4-getting-started)
5. [Authentication](#5-authentication)
6. [Database](#6-database)
7. [API Reference](#7-api-reference)
8. [Frontend](#8-frontend)
9. [Discovery Flow](#9-discovery-flow)
10. [Email Notifications](#10-email-notifications)
11. [Deployment](#11-deployment)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. What is FirstDrop?

FirstDrop is a platform that connects startup founders with early adopters through a card-based discovery system.

### Who Uses It?

- **Founders**: List early-stage ideas to validate interest before building
- **Users/Early Adopters**: Discover new products and join waitlists

### How It Works

1. Founders create idea listings with details about their concept
2. Users browse ideas like swiping through cards
3. Users hit "I'm in" to join waitlists or "Pass" to skip
4. Founders get notified when users join their waitlist
5. Both parties have dashboards to track activity

---

## 2. Tech Stack

| Technology | Purpose | Why We Chose It |
|------------|---------|-----------------|
| **Next.js 14+** | React framework | App Router, Server Components, excellent DX |
| **TypeScript** | Type safety | Catch errors at compile time, better IDE support |
| **Tailwind CSS** | Styling | Utility-first, rapid development, consistent design |
| **Prisma** | ORM | Type-safe database queries, great migrations |
| **PostgreSQL** | Database | Reliable, scalable, excellent with Prisma |
| **NextAuth.js** | Authentication | Flexible, secure, works great with Next.js |
| **bcryptjs** | Password hashing | Pure JS (no native deps), secure |
| **React Hook Form** | Form handling | Performance, minimal re-renders |
| **Zod** | Validation | TypeScript-first, great error messages |
| **TanStack Query** | Server state | Caching, background updates, optimistic UI |
| **Resend** | Email | Modern API, generous free tier |
| **react-hot-toast** | Notifications | Simple, customizable toast notifications |

---

## 3. Project Structure

```
firstdrop/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── auth/             # NextAuth.js & registration
│   │   ├── dashboard/        # Dashboard data API
│   │   ├── ideas/            # Ideas CRUD API
│   │   └── profile/          # Profile update API
│   ├── [companySlug]/        # Public idea pages
│   ├── create/               # Create idea page (founders)
│   ├── dashboard/            # User dashboard
│   ├── discovery/            # Card discovery page
│   ├── join/                 # Registration page
│   ├── login/                # Login page
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Landing page
│   └── providers.tsx         # Context providers
├── components/               # React components
│   ├── forms/                # Form components
│   ├── ui/                   # Reusable UI components
│   ├── Footer.tsx
│   └── Navigation.tsx
├── lib/                      # Utility functions
│   ├── auth.ts               # Auth helpers
│   ├── email.ts              # Email service
│   ├── prisma.ts             # Prisma client
│   └── utils.ts              # General utilities
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Seed data
├── services/                 # Business logic
│   ├── ideaService.ts
│   ├── reactionService.ts
│   ├── userService.ts
│   └── waitlistService.ts
├── types/
│   └── next-auth.d.ts        # NextAuth type extensions
├── middleware.ts             # Route protection
└── package.json
```

### Key Files Explained

- **`app/layout.tsx`**: Root layout with fonts, providers, nav, footer
- **`app/providers.tsx`**: Wraps app with SessionProvider, QueryClientProvider, Toaster
- **`lib/prisma.ts`**: Singleton Prisma client (prevents connection exhaustion)
- **`middleware.ts`**: Protects routes based on auth status and roles
- **`services/`**: All database operations go through service layer

---

## 4. Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (local or remote)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/firstdrop.git
cd firstdrop

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Set up database
npx prisma migrate dev
npx prisma db seed

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/firstdrop"

# Auth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Email (optional for dev)
RESEND_API_KEY=""
RESEND_FROM_EMAIL=""
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Create migration |
| `npm run db:deploy` | Deploy migrations |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |

---

## 5. Authentication

We use NextAuth.js with credentials provider and JWT sessions.

### How Auth Works

1. User submits email/password to `/api/auth/register`
2. Password is hashed with bcrypt (12 rounds)
3. User created in database
4. On login, credentials verified against database
5. JWT created with user ID, isFounder, isUser
6. Token stored in HTTP-only cookie
7. Session callback adds user data to session

### JWT vs Database Sessions

We use **JWT sessions** because:
- Stateless (no database lookup per request)
- Works better with serverless (Vercel)
- Simpler to scale

### Role System

Users can have one or both roles:
- `isFounder`: Can create ideas
- `isUser`: Can discover ideas and join waitlists

### Protected Routes

Middleware (`middleware.ts`) protects:
- `/dashboard/*` → Requires auth
- `/create` → Requires auth + isFounder

### Getting Current User (Server Components)

```typescript
import { getCurrentUser } from '@/lib/auth';

export default async function Page() {
  const session = await getCurrentUser();
  if (!session) {
    redirect('/login');
  }
  // ...
}
```

### Getting Current User (Client Components)

```typescript
import { useSession } from 'next-auth/react';

export default function Component() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') return <Loading />;
  if (status === 'unauthenticated') return <LoginPrompt />;
  
  return <div>Hello {session.user.name}</div>;
}
```

---

## 6. Database

### Schema Overview

```
User
├── id, name, email, passwordHash
├── isFounder, isUser (roles)
├── about, profilePhoto, socialHandles
└── Relations: ideas[], reactions[], waitlistEntries[]

Idea
├── id, title, slug (unique)
├── sector, subSector
├── ideaDescription, moat, usp
├── marketSize, ask
├── isFirstTimeFounder
├── mediaUrls, companyInfo, contactInfo
└── Relations: founder, reactions[], waitlistEntries[]

Reaction
├── id, type (IN | PASS)
├── userId, ideaId
└── Unique: [userId, ideaId]

WaitlistEntry
├── id, email
├── userId (nullable), ideaId
└── Unique: [email, ideaId]
```

### Inspecting with Prisma Studio

```bash
npx prisma studio
```

Opens at [http://localhost:5555](http://localhost:5555)

### Common Queries

```typescript
// Get user with ideas
const user = await prisma.user.findUnique({
  where: { id: 'user_123' },
  include: { ideas: true }
});

// Get idea with founder
const idea = await prisma.idea.findUnique({
  where: { slug: 'my-idea' },
  include: { founder: true }
});

// Get waitlist for idea
const waitlist = await prisma.waitlistEntry.findMany({
  where: { ideaId: 'idea_123' },
  include: { user: true }
});
```

---

## 7. API Reference

### Public Endpoints (No Auth Required)

#### GET /api/ideas
Returns all ideas for discovery.

**Response:**
```json
{
  "ideas": [...],
  "count": 10
}
```

#### GET /api/ideas/[slug]
Returns a single idea by slug.

**Response:**
```json
{
  "idea": {
    "id": "...",
    "title": "...",
    "founder": {...},
    "_count": { "waitlistEntries": 5, "reactions": 10 }
  }
}
```

### Protected Endpoints (Auth Required)

#### POST /api/ideas
Create a new idea (founders only).

**Body:**
```json
{
  "title": "My Idea",
  "sector": "AI",
  "ideaDescription": "...",
  "moat": "...",
  "usp": "..."
}
```

#### POST /api/ideas/[id]/interest
"I'm in" action.

**Body (anonymous):**
```json
{ "email": "user@example.com" }
```

#### POST /api/ideas/[id]/pass
"Pass" action.

#### GET /api/dashboard
Get dashboard data.

**Response:**
```json
{
  "user": {...},
  "founderIdeas": [...],
  "likedIdeas": [...]
}
```

#### PUT /api/profile
Update profile.

**Body:**
```json
{
  "name": "New Name",
  "about": "New bio"
}
```

### Error Format

All errors follow this format:
```json
{
  "error": {
    "message": "Human readable message",
    "code": "ERROR_CODE",
    "details": [...] // Optional validation errors
  }
}
```

---

## 8. Frontend

### Pages

| Page | Path | Auth | Description |
|------|------|------|-------------|
| Landing | `/` | No | Marketing page |
| Discovery | `/discovery` | No | Card browsing |
| Idea Page | `/[slug]` | No | Public idea page |
| Login | `/login` | No | Sign in |
| Join | `/join` | No | Register |
| Dashboard | `/dashboard` | Yes | User dashboard |
| Create Idea | `/create` | Founder | List new idea |

### Components

#### UI Components (`components/ui/`)

Reusable, unstyled components:
- `Button` - Primary, secondary, outline, ghost variants
- `Input` - With label, error, helper text
- `Card` - Content container with shadow
- `Badge` - Labels and tags
- `Avatar` - Profile photo with initials fallback
- `Tabs` - Tab navigation

#### Form Components (`components/forms/`)

- `RegisterForm` - User/founder registration
- `LoginForm` - Sign in
- `CreateIdeaForm` - List new idea
- `WaitlistEmailForm` - Email-only waitlist join

### Styling

We use Tailwind CSS with custom colors:
- `navy` (#1a202c) - Primary text
- `coral` (#f56565) - CTAs, accents
- `off-white` (#f9fafb) - Backgrounds

### Responsive Breakpoints

- `sm`: 640px
- `md`: 768px (navigation changes)
- `lg`: 1024px
- `xl`: 1280px

---

## 9. Discovery Flow

Here's the complete flow from page load to "I'm in" recorded:

### 1. Page Load
```
User navigates to /discovery
↓
DiscoveryPage component mounts (Client Component)
↓
useQuery fetches ideas from GET /api/ideas
↓
API returns ideas (filtered if user is logged in)
```

### 2. Display Card
```
First idea card is displayed
↓
5-minute timer starts (useEffect)
↓
User sees: title, description, founder info, stats
```

### 3. User Action

**Option A: "I'm In"**
```
User clicks "I'm In" button
↓
handleInterest() called
↓
If logged in:
  POST /api/ideas/[id]/interest (no body)
  → Creates Reaction (IN)
  → Creates WaitlistEntry
  → Sends email to founder
  → Shows success toast
  → Advances card
↓
If not logged in:
  Shows email modal
  → User enters email
  → POST /api/ideas/[id]/interest with { email }
  → Creates anonymous WaitlistEntry
  → Sends email to founder
  → Shows success
```

**Option B: "Pass"**
```
User clicks "Pass" button
↓
handlePass() called
↓
If logged in:
  POST /api/ideas/[id]/pass
  → Creates Reaction (PASS)
↓
Advances to next card
```

**Option C: Timer Expires**
```
5 minutes pass without action
↓
Auto-advance (treated as Pass)
```

### 4. Card Exhausted
```
All ideas viewed
↓
Show "You've seen everything!" message
↓
Option to start over or create idea
```

---

## 10. Email Notifications

### How It Works

1. User joins waitlist (via API)
2. API calls `sendFounderNotification()`
3. If RESEND_API_KEY is set:
   - Email sent via Resend API
   - HTML template with idea title, user email
4. If not set:
   - Details logged to console
   - App continues without error

### Configuration

```bash
# .env
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
RESEND_FROM_EMAIL="notifications@yourdomain.com"
```

### Testing Without Resend

Leave RESEND_API_KEY empty. Email details will be logged to console.

### Testing With Resend

1. Sign up at [resend.com](https://resend.com)
2. Get API key
3. Verify your domain (or use `onboarding@resend.dev` for testing)
4. Add to environment variables

---

## 11. Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Quick Deploy Checklist

- [ ] Database created (Neon/Supabase)
- [ ] Connection string with `connection_limit=1`
- [ ] NEXTAUTH_SECRET generated
- [ ] NEXTAUTH_URL set to production domain
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables configured
- [ ] Initial deployment successful
- [ ] Migrations run on production DB
- [ ] Smoke tests pass

---

## 12. Troubleshooting

### Common Issues

#### 1. "Cannot find module '@prisma/client'"

**Fix:**
```bash
npx prisma generate
```

#### 2. "Database connection failed"

**Fix:**
- Check DATABASE_URL
- Ensure `connection_limit=1` in URL
- Verify PostgreSQL is running

#### 3. "JWT must be provided"

**Fix:**
- Set NEXTAUTH_SECRET
- Must be at least 32 characters

#### 4. "Session not found"

**Fix:**
- Check NEXTAUTH_URL matches actual domain
- Clear cookies and try again

#### 5. Form validation not working

**Fix:**
- Ensure `zodResolver` is imported correctly
- Check Zod schema is valid
- Verify all fields are registered

#### 6. "Multiple Prisma Client instances"

**Fix:**
- Ensure using singleton pattern in `lib/prisma.ts`
- Restart dev server

#### 7. Build fails on Vercel

**Fix:**
- Check `postinstall` script in package.json
- Ensure `prisma generate` runs after install

### Debug Mode

Enable NextAuth debug mode in development:
```typescript
// app/api/auth/[...nextauth]/route.ts
export const authOptions = {
  debug: process.env.NODE_ENV === 'development',
  // ...
};
```

### Getting Help

- Next.js Docs: https://nextjs.org/docs
- NextAuth Docs: https://next-auth.js.org
- Prisma Docs: https://prisma.io/docs
- Tailwind Docs: https://tailwindcss.com/docs

---

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

### Code Style

- Use TypeScript strictly
- Follow existing component patterns
- Use `cn()` for class merging
- Add JSDoc comments for functions
- Keep components small and focused

---

Happy coding! 🚀
