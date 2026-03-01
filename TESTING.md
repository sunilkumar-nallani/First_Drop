# FirstDrop Testing Guide

This document provides a comprehensive manual testing checklist for FirstDrop.

## Pre-requisites

1. Application is running locally (`npm run dev`)
2. Database is seeded (`npm run db:seed`)
3. All environment variables are configured

---

## Authentication Tests

### Registration

- [ ] **1. Register as user → redirects to /discovery**
  - Navigate to `/join`
  - Fill out user registration form (left side)
  - Submit form
  - Expected: Redirected to `/discovery`, toast shows success

- [ ] **2. Register as founder → redirects to /dashboard**
  - Navigate to `/join`
  - Fill out founder registration form (right side)
  - Submit form
  - Expected: Redirected to `/dashboard`, toast shows success

- [ ] **3. Register as both → /dashboard with tabs**
  - Navigate to `/join`
  - Fill out founder form with "I also want to discover ideas" checked
  - Submit form
  - Expected: Redirected to `/dashboard`, both tabs visible

- [ ] **4. Duplicate email shows error**
  - Try to register with an existing email
  - Expected: Error toast shows "Email already exists"

- [ ] **5. Password validation works**
  - Try to register with password < 8 characters
  - Expected: Validation error shown

### Login

- [ ] **6. Login as user → redirects to /discovery**
  - Navigate to `/login`
  - Enter user credentials (alex@producthunt.com / password123)
  - Submit
  - Expected: Redirected to `/discovery`

- [ ] **7. Login as founder → redirects to /dashboard**
  - Navigate to `/login`
  - Enter founder credentials (sarah@techstart.io / password123)
  - Submit
  - Expected: Redirected to `/dashboard`

- [ ] **8. Invalid credentials show error**
  - Enter wrong password
  - Expected: Error toast shows "Invalid email or password"

### Protected Routes

- [ ] **9. Navigate to /dashboard without auth → redirected to /login**
  - Log out
  - Navigate to `/dashboard`
  - Expected: Redirected to `/login` with callbackUrl

- [ ] **10. Navigate to /create as user (non-founder) → redirected**
  - Login as user-only (alex@producthunt.com)
  - Navigate to `/create`
  - Expected: Redirected to `/dashboard` with error

- [ ] **11. Navigate to /create without auth → redirected to /login**
  - Log out
  - Navigate to `/create`
  - Expected: Redirected to `/login`

---

## Idea Management Tests

### Creating Ideas

- [ ] **12. Create idea as founder → appears in /discovery**
  - Login as founder
  - Navigate to `/create`
  - Fill out all required fields
  - Submit
  - Expected: Redirected to `/dashboard`, idea appears in list

- [ ] **13. Idea form validation works**
  - Submit form with empty fields
  - Expected: Validation errors shown

- [ ] **14. Slug is auto-generated**
  - Create idea with title "My Amazing Startup"
  - Check API response or navigate to idea page
  - Expected: Slug is "my-amazing-startup" or similar

### Discovery

- [ ] **15. "I'm in" while logged in → Reaction + WaitlistEntry created**
  - Login as user
  - Go to `/discovery`
  - Click "I'm In" on an idea
  - Expected: Success toast, card advances

- [ ] **16. "Pass" while logged in → Reaction (PASS) created**
  - Login as user
  - Go to `/discovery`
  - Click "Pass"
  - Expected: Card advances

- [ ] **17. 5-minute timer fires → next card loads automatically**
  - Wait 5 minutes without clicking
  - Expected: Card auto-advances (or adjust TIMER_DURATION for testing)

- [ ] **18. "I'm in" while not logged in → email modal shown**
  - Log out
  - Go to `/discovery`
  - Click "I'm In"
  - Expected: Email modal appears

- [ ] **19. Submit email in modal → WaitlistEntry created with null userId**
  - In email modal, enter email
  - Submit
  - Expected: Success message, card advances

- [ ] **20. Already reacted ideas don't appear**
  - React to an idea
  - Refresh page
  - Expected: That idea no longer appears

### Public Idea Pages

- [ ] **21. /[companySlug] loads without login**
  - Log out
  - Navigate to an idea page (e.g., `/syncai-meeting-assistant`)
  - Expected: Page loads with all idea details

- [ ] **22. 404 for non-existent slug**
  - Navigate to `/non-existent-idea`
  - Expected: 404 page shown

---

## Dashboard Tests

### Founder View

- [ ] **23. Dashboard founder view shows correct waitlist count**
  - Login as founder
  - Go to `/dashboard`
  - Expected: Waitlist count matches database

- [ ] **24. Dashboard shows all founder ideas**
  - Check that all ideas created by founder are listed

- [ ] **25. "Create New Idea" button works**
  - Click button
  - Expected: Navigates to `/create`

### User View

- [ ] **26. Dashboard user view shows ideas I liked**
  - Login as user
  - Join some waitlists
  - Go to `/dashboard`
  - Expected: Liked ideas appear in list

- [ ] **27. Ideas show correct founder name and date**
  - Verify each liked idea shows correct info

### Dual Role

- [ ] **28. Tabs switch between founder and user view**
  - Login as dual-role user
  - Go to `/dashboard`
  - Click tabs
  - Expected: Content switches correctly

---

## Profile Tests

- [ ] **29. Edit profile saves correctly**
  - Login
  - Go to dashboard
  - Click "Edit Profile"
  - Change name/bio
  - Save
  - Expected: Changes persist after refresh

- [ ] **30. Social links display correctly**
  - Add social handles
  - Expected: Links appear on dashboard with correct icons

---

## API Tests

Use curl or Postman to test:

```bash
# Get all ideas (public)
curl http://localhost:3000/api/ideas

# Get single idea (public)
curl http://localhost:3000/api/ideas/syncai-meeting-assistant

# Create idea (auth required)
curl -X POST http://localhost:3000/api/ideas \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{"title":"Test","sector":"AI","ideaDescription":"...","moat":"...","usp":"..."}'

# Join waitlist (auth or email required)
curl -X POST http://localhost:3000/api/ideas/IDEA_ID/interest \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

## UI/Responsive Tests

- [ ] **31. Mobile navigation works**
  - Open on mobile or resize to < 768px
  - Click hamburger menu
  - Expected: Menu opens, links work

- [ ] **32. All pages work at 320px width**
  - Test each page at minimum width
  - Expected: No horizontal scroll, content readable

- [ ] **33. Loading states show correctly**
  - Throttle network to 3G
  - Navigate between pages
  - Expected: Loading indicators appear

---

## Email Tests

- [ ] **34. Email notification logs to console (without Resend)**
  - Ensure RESEND_API_KEY is not set
  - Join a waitlist
  - Check console
  - Expected: Email details logged

- [ ] **35. Email notification sends (with Resend)**
  - Set RESEND_API_KEY
  - Join a waitlist
  - Expected: Email sent to founder

---

## Top 5 Most Likely Failure Points & Debug Steps

### 1. Database Connection Issues

**Symptoms:** 500 errors, "Can't reach database server"

**Debug Steps:**
1. Check DATABASE_URL in .env
2. Verify PostgreSQL is running: `pg_isready`
3. Test connection: `npx prisma db pull`
4. Check connection_limit in URL (should be 1 for Vercel)

### 2. NextAuth Session Issues

**Symptoms:** User appears logged out, session not persisting

**Debug Steps:**
1. Check NEXTAUTH_SECRET is set
2. Verify NEXTAUTH_URL matches your URL
3. Check browser cookies (Application tab in DevTools)
4. Enable debug mode in authOptions
5. Check server logs for JWT errors

### 3. Prisma Client Errors in Development

**Symptoms:** "Multiple Prisma Client instances", connection errors

**Debug Steps:**
1. Ensure singleton pattern in lib/prisma.ts
2. Restart dev server
3. Check for multiple prisma imports
4. Run `npx prisma generate`

### 4. API Route 404s

**Symptoms:** API routes return 404

**Debug Steps:**
1. Check file path matches URL pattern
2. Verify route.ts exports GET/POST handlers
3. Check for typos in file/folder names
4. Restart dev server

### 5. Form Validation Not Working

**Symptoms:** Forms submit with invalid data, no error messages

**Debug Steps:**
1. Check Zod schema is correct
2. Verify zodResolver is imported from @hookform/resolvers/zod
3. Check formState.errors is being used
4. Add console.log to see validation errors
5. Ensure all form fields are registered

---

## Quick Smoke Test Script

Run through these in 5 minutes:

1. ✅ Load homepage
2. ✅ Navigate to /discovery (without login)
3. ✅ Register as founder
4. ✅ Create an idea
5. ✅ View idea on dashboard
6. ✅ Open idea public page in incognito
7. ✅ Join waitlist as anonymous user
8. ✅ Check founder got notification (console or email)
9. ✅ Login as user
10. ✅ Join waitlist while logged in
11. ✅ Check user dashboard shows liked ideas
12. ✅ Logout
13. ✅ Verify protected routes redirect to login

---

## Performance Tests

- [ ] Page load time < 3s on 3G
- [ ] Time to interactive < 5s
- [ ] Lighthouse score > 80

Run: `npm run build` then `npx serve@latest out` and test with Lighthouse.
