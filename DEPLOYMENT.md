# FirstDrop Deployment Guide

This guide walks you through deploying FirstDrop to production using Vercel and Neon PostgreSQL.

---

## Table of Contents

1. [Setting up Managed PostgreSQL (Neon)](#1-setting-up-managed-postgresql-neon)
2. [Deploying to Vercel](#2-deploying-to-vercel)
3. [Connecting a Custom Domain](#3-connecting-a-custom-domain)
4. [Post-Deployment Smoke Tests](#4-post-deployment-smoke-tests)
5. [Environment Variables Reference](#5-environment-variables-reference)

---

## 1. Setting up Managed PostgreSQL (Neon)

Neon is our recommended PostgreSQL provider for its generous free tier, Vercel integration, and database branching for preview deployments.

### Step 1: Create Neon Account

1. Go to [https://neon.tech](https://neon.tech)
2. Sign up with GitHub or email
3. Verify your email

### Step 2: Create a Project

1. Click "New Project"
2. Choose a name (e.g., "firstdrop")
3. Select a region closest to your users (e.g., "US East" for US-based users)
4. Click "Create Project"

### Step 3: Get Connection String

1. In your Neon dashboard, go to your project
2. Click on "Connection Details" or "Dashboard"
3. Find the "Connection String" section
4. Copy the connection string (it looks like):
   ```
   postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/firstdrop?sslmode=require
   ```

### Step 4: Modify Connection String for Vercel

Add `connection_limit=1` to the connection string for serverless compatibility:

```
postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/firstdrop?sslmode=require&connection_limit=1
```

Save this modified string - you'll need it for Vercel.

### Alternative: Using Supabase

If you prefer Supabase:

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. In Settings > Database, find the connection string
4. Use the "URI" tab and add `?connection_limit=1` at the end

---

## 2. Deploying to Vercel

### Step 1: Push to GitHub

1. Create a new repository on GitHub
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/firstdrop.git
   git push -u origin main
   ```

### Step 2: Import to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click "Add New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Next.js settings

### Step 3: Configure Environment Variables

In the Vercel project settings, add these environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://...&connection_limit=1` | Your Neon connection string |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` | Secret for JWT signing |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` | Your production URL |
| `RESEND_API_KEY` | `re_...` | (Optional) Resend API key for emails |
| `RESEND_FROM_EMAIL` | `notifications@yourdomain.com` | (Optional) From email address |

**To generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### Step 4: Deploy

1. Click "Deploy"
2. Vercel will build and deploy your application
3. Wait for the build to complete (2-3 minutes)

### Step 5: Run Migrations

After first deployment, run migrations on your production database:

**Option A: Via Vercel CLI**
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login
vercel login

# Link to project
vercel link

# Run migration
vercel env pull .env.production
npx prisma migrate deploy
```

**Option B: Via Build Command**
Add this to your build command in Vercel settings:
```bash
prisma migrate deploy && next build
```

Or use the existing `vercel-build` script in package.json.

### Step 6: Seed Database (Optional)

To add demo data to production:
```bash
# Set production DATABASE_URL locally
export DATABASE_URL="your-production-url"

# Run seed
npx prisma db seed
```

---

## 3. Connecting a Custom Domain

### Step 1: Add Domain in Vercel

1. Go to your Vercel project dashboard
2. Click "Settings" → "Domains"
3. Enter your domain (e.g., `firstdrop.io`)
4. Click "Add"

### Step 2: Configure DNS

Vercel will show you the required DNS records. Common configurations:

**For apex domain (firstdrop.io):**
- Type: `A`
- Name: `@`
- Value: `76.76.21.21`

**For www (www.firstdrop.io):**
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com`

Add these records in your domain registrar's DNS settings.

### Step 3: Wait for Propagation

DNS changes can take 24-48 hours to propagate. You can check status with:
```bash
dig firstdrop.io
```

### Step 4: Update NEXTAUTH_URL

Once your custom domain is working:

1. Go to Vercel project settings
2. Update `NEXTAUTH_URL` to your custom domain
3. Redeploy the application

---

## 4. Post-Deployment Smoke Tests

After deployment, verify everything works:

### Basic Functionality

- [ ] Homepage loads without errors
- [ ] `/discovery` page loads and shows ideas
- [ ] Can view individual idea pages
- [ ] Registration works
- [ ] Login works
- [ ] Can create ideas (as founder)
- [ ] Can join waitlists
- [ ] Dashboard shows correct data

### API Tests

```bash
# Test public API
curl https://your-domain.com/api/ideas

# Should return JSON with ideas array
```

### Database Verification

Check that migrations ran successfully:
```bash
# Connect to Neon console or use Prisma Studio
npx prisma studio
```

### Email (if configured)

- [ ] Join a waitlist
- [ ] Check that founder receives notification

### Performance

- [ ] Page loads in < 3 seconds
- [ ] No console errors
- [ ] Mobile responsive

---

## 5. Environment Variables Reference

### Production .env.example

```bash
# =============================================================================
# FirstDrop Production Environment Variables
# =============================================================================

# -----------------------------------------------------------------------------
# Database Configuration (Neon PostgreSQL)
# -----------------------------------------------------------------------------
# Get this from your Neon dashboard
# Format: postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require&connection_limit=1
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/firstdrop?sslmode=require&connection_limit=1"

# -----------------------------------------------------------------------------
# NextAuth.js Configuration
# -----------------------------------------------------------------------------
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-super-secret-random-string-min-32-characters-long"

# Your production domain
NEXTAUTH_URL="https://firstdrop.io"

# -----------------------------------------------------------------------------
# Email Configuration (Resend) - Optional but recommended
# -----------------------------------------------------------------------------
# Get your API key from: https://resend.com/api-keys
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Must be a verified domain in Resend
RESEND_FROM_EMAIL="notifications@firstdrop.io"

# -----------------------------------------------------------------------------
# Optional: App Configuration
# -----------------------------------------------------------------------------
NODE_ENV="production"
```

### Variable Descriptions

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string with connection_limit=1 |
| `NEXTAUTH_SECRET` | ✅ Yes | Random string for JWT signing (min 32 chars) |
| `NEXTAUTH_URL` | ✅ Yes | Your canonical domain URL |
| `RESEND_API_KEY` | ❌ No | API key for email notifications |
| `RESEND_FROM_EMAIL` | ❌ No | Verified sender email address |
| `NODE_ENV` | ⚙️ Auto | Set automatically by Vercel |

---

## Troubleshooting

### Build Fails

**Error: "Prisma Client could not be found"**
- Solution: Add `postinstall` script to package.json (already included)

**Error: "Database connection failed"**
- Check DATABASE_URL is correct
- Verify connection_limit=1 is in the URL
- Check Neon allows connections from Vercel IPs

### Runtime Errors

**Error: "JWT must be provided"**
- NEXTAUTH_SECRET is not set or incorrect
- Generate a new one and redeploy

**Error: "Session not found"**
- NEXTAUTH_URL doesn't match your actual domain
- Update and redeploy

### Database Issues

**Migrations not running**
- Check build command includes `prisma migrate deploy`
- Or run manually via Vercel CLI

**Connection pool exhausted**
- Ensure connection_limit=1 in DATABASE_URL
- Consider Prisma Accelerate for high traffic

---

## Maintenance

### Regular Tasks

1. **Monitor logs** in Vercel dashboard
2. **Check database usage** in Neon dashboard
3. **Update dependencies** monthly:
   ```bash
   npm update
   npm audit fix
   ```

### Scaling

If you need more resources:

1. **Database**: Upgrade Neon plan
2. **Serverless Functions**: Upgrade Vercel plan
3. **Connection Pooling**: Consider Prisma Accelerate

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Neon Docs**: https://neon.tech/docs
- **NextAuth Docs**: https://next-auth.js.org
- **Prisma Docs**: https://prisma.io/docs
