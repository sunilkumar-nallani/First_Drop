# FirstDrop

<p align="center">
  <strong>Validate Your Startup Ideas Before You Build</strong>
</p>

<p align="center">
  FirstDrop connects founders with early adopters through a card-based discovery platform. 
  List ideas, build waitlists, and validate demand—all before writing a single line of code.
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> •
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#documentation">Documentation</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js" alt="Next.js 14">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Prisma-6.0-2D3748?style=flat-square&logo=prisma" alt="Prisma">
  <img src="https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql" alt="PostgreSQL">
</p>

---

## Quick Start

Get FirstDrop running locally in 5 minutes:

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/firstdrop.git
cd firstdrop

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database credentials

# 4. Set up the database
npx prisma migrate dev
npx prisma db seed

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start exploring!

**Demo Credentials:**
- Founder: `sarah@techstart.io` / `password123`
- User: `alex@producthunt.com` / `password123`
- Dual: `jordan@innovate.co` / `password123`

---

## Features

### For Founders
- 📝 **List Ideas** - Create detailed listings for your startup concepts
- 📊 **Track Metrics** - Monitor waitlist growth and interest stats
- 🔔 **Instant Notifications** - Get notified when users join your waitlist
- 🔗 **Public Pages** - Share your idea with a unique URL
- 📱 **Responsive Dashboard** - Manage everything from any device

### For Users
- 🎯 **Discovery Feed** - Browse ideas like swiping through cards
- ❤️ **Join Waitlists** - Express interest with one click
- 📋 **Personal Dashboard** - Track all ideas you've liked
- 🕐 **5-Minute Timer** - Auto-advance keeps the flow going
- 🔍 **No Account Required** - Browse without signing up

### Platform Features
- 🔐 **Dual-Role System** - Be both founder and user with one account
- ✉️ **Email Notifications** - Powered by Resend (with console fallback)
- 🎨 **Modern UI** - Built with Tailwind CSS and custom design system
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile
- ⚡ **Fast Performance** - Next.js App Router with server components

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 3 |
| **Database** | PostgreSQL |
| **ORM** | Prisma 6 |
| **Auth** | NextAuth.js 4 |
| **Forms** | React Hook Form + Zod |
| **State** | TanStack React Query |
| **Email** | Resend |
| **UI** | Custom components + Lucide icons |

---

## Project Structure

```
firstdrop/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── [companySlug]/     # Public idea pages
│   ├── create/            # Create idea (founders)
│   ├── dashboard/         # User dashboard
│   ├── discovery/         # Card discovery
│   ├── join/              # Registration
│   ├── login/             # Login
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── forms/            # Form components
│   ├── ui/               # Reusable UI components
│   ├── Footer.tsx
│   └── Navigation.tsx
├── lib/                  # Utilities
│   ├── auth.ts          # Auth helpers
│   ├── email.ts         # Email service
│   ├── prisma.ts        # Prisma client
│   └── utils.ts         # General utilities
├── prisma/              # Database
│   ├── schema.prisma   # Schema definition
│   └── seed.ts         # Seed data
├── services/           # Business logic
│   ├── ideaService.ts
│   ├── reactionService.ts
│   ├── userService.ts
│   └── waitlistService.ts
└── types/             # Type definitions
```

---

## Environment Variables

Create a `.env.local` file with these variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✅ Yes | Random string for JWT signing |
| `NEXTAUTH_URL` | ✅ Yes | Your app URL |
| `RESEND_API_KEY` | ❌ No | Resend API key for emails |
| `RESEND_FROM_EMAIL` | ❌ No | Verified sender email |

**Example:**
```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/firstdrop"
NEXTAUTH_SECRET="your-secret-key-min-32-chars-long"
NEXTAUTH_URL="http://localhost:3000"
```

---

## Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel auto-detects Next.js settings

3. **Add Environment Variables**
   - Add all variables from `.env.local`
   - For production, use your production database URL

4. **Deploy**
   - Click "Deploy"
   - Vercel builds and deploys automatically

5. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   ```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

---

## Documentation

- **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** - Comprehensive developer documentation
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Step-by-step deployment guide
- **[TESTING.md](./TESTING.md)** - Manual testing checklist

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Create database migration |
| `npm run db:deploy` | Deploy migrations |
| `npm run db:seed` | Seed database with demo data |
| `npm run db:studio` | Open Prisma Studio |

---

## Contributing

Contributions are welcome! Please read our [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) for:
- Code style guidelines
- Project architecture
- Common patterns
- Troubleshooting tips

---

## License

MIT License - feel free to use this project for personal or commercial purposes.

---

## Support

- 📖 [Next.js Docs](https://nextjs.org/docs)
- 🔐 [NextAuth Docs](https://next-auth.js.org)
- 🗄️ [Prisma Docs](https://prisma.io/docs)
- 🎨 [Tailwind Docs](https://tailwindcss.com/docs)

---

<p align="center">
  Built with ❤️ for founders and early adopters
</p>
