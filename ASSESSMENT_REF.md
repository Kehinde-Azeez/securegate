# SecureGate — Assessment Reference Document
> Dev & Design · Design to MVP Bootcamp · Live Assessment Task
> **Confidential — for enrolled students only**

---

## Meta

| Field | Detail |
|---|---|
| **Task Name** | SecureGate — Build a Focused Authentication & Security App |
| **Type** | Individual Submission |
| **Duration** | 3 Hours (Strictly Enforced) |
| **Submission** | GitHub + Vercel + Markdown |
| **Stack** | Next.js · TypeScript · Prisma · PostgreSQL · NextAuth · Resend · Vercel |

---

## 01. Overview

### What is SecureGate?
SecureGate is a standalone authentication app. It is not a full product. It has one job: to show that you understand how to build identity and access management the right way, using the tools and engineering principles you have been taught.

### What You Will Build

| Feature | Description |
|---|---|
| **Sign Up** | Full form validation, password strength indicator, email confirmation via Resend |
| **Login** | Email + password, NextAuth session handling, proper error messaging that does not leak security information |
| **Email Verification** | User receives a token link, clicks it, account is verified in the database |
| **Protected Dashboard** | Only accessible to verified, authenticated users. Redirect logic must be airtight |
| **Forgot Password** | Request a reset, receive an email, submit a new password. Token must expire |
| **Rate Limiting** | Brute-force protection on the login endpoint |
| **Logout** | Clean session destruction, redirect to login |
| **Password Hashing** | Using bcrypt with a proper salt round configuration |

### Murphy's Law Reminder
> Anything that can go wrong in an auth system will go wrong. Rate limit your endpoints. Hash your passwords. Expire your tokens. Sanitise your inputs. Do not trust what comes from the client.

---

## 02. Tech Stack & Setup

| Layer | Tool | Purpose |
|---|---|---|
| Framework | Next.js 14 (App Router) | Full-stack React framework |
| Language | TypeScript | Type safety across the codebase |
| Database | PostgreSQL via Prisma ORM | User table, tokens, sessions |
| Auth | NextAuth.js (Auth.js) | Session management, providers |
| Password | bcrypt (via bcryptjs) | Secure password hashing |
| Email | Resend + React Email | Verification + reset emails |
| Validation | Zod | Server-side input validation schemas |
| Rate Limit | upstash/ratelimit or custom middleware | Brute-force protection |
| Deployment | Vercel | Production hosting + env vars |
| Repo | GitHub | Version control, required for submission |

### Required Environment Variables

```env
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
RESEND_API_KEY
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

> **Kerckhoffs's Principle:** Your system's security must not depend on secrecy of its design. Security comes from the strength of your hashing, the integrity of your tokens, and the correct use of secrets stored in environment variables — not from hiding your implementation.

---

## 03. Build Phases

> Follow phases in strict order. Do not skip ahead.

---

### PHASE 1 — Scaffold & Database Schema

**Tools:** Prisma, PostgreSQL, GitHub Desktop, Windsurf / Cursor

- [ ] Bootstrap a new Next.js 14 project with App Router and TypeScript
- [ ] Initialise Prisma and connect to PostgreSQL database
- [ ] Create **User** model: `id`, `name`, `email`, `password` (hashed), `emailVerified`, `createdAt`
- [ ] Create **VerificationToken** model: `identifier`, `token`, `expires`
- [ ] Create **PasswordResetToken** model: `email`, `token`, `expires`
- [ ] Run `prisma migrate dev` to apply the schema
- [ ] Confirm tables in DB client
- [ ] Push initial scaffold to GitHub before writing any feature code

---

### PHASE 2 — Authentication Core with NextAuth

**Tools:** NextAuth.js, bcryptjs, Zod, Prisma

- [ ] Install and configure NextAuth with the **Credentials provider**
- [ ] Implement `authorize()` — query user by email, compare hashed password using `bcryptjs.compare()`
- [ ] Set up session strategy (JWT or database — **justify your choice in REFLECTION.md**)
- [ ] Create Sign Up API route: validate with Zod, hash password using `bcrypt.hash()` with **salt rounds = 12**, save user
- [ ] Protect `/dashboard` route using NextAuth middleware — redirect unauthenticated users to `/login`
- [ ] Test sign up and sign in manually
- [ ] Confirm session is created
- [ ] Confirm password in DB is **NOT plain text**

---

### PHASE 3 — Email Verification Flow

**Tools:** Resend, React Email, crypto (Node built-in), Prisma

- [ ] On sign up, generate a secure random token: `crypto.randomBytes(32).toString('hex')`
- [ ] Save token and expiry **(15 minutes)** to `VerificationToken` table
- [ ] Send verification email via Resend with token URL embedded
- [ ] Create `/verify-email/[token]` route: look up token, check expiry, mark user as verified, delete token
- [ ] If token expired or not found: show clear error, offer 'resend verification' option
- [ ] Only verified users can access dashboard — add check to session/middleware logic

---

### PHASE 4 — Forgot Password Flow

**Tools:** Resend, bcryptjs, Prisma, crypto

- [ ] Build `/forgot-password` page with email input
- [ ] On submit: look up email, generate reset token, save with **1-hour expiry** to `PasswordResetToken`
- [ ] Send password reset email via Resend with token link
- [ ] Build `/reset-password/[token]` route: validate token, check expiry, accept new password
- [ ] Hash new password before saving
- [ ] Delete used token
- [ ] Redirect user to login
- [ ] **IMPORTANT:** If email not found, still return a success message — do not confirm whether email exists

---

### PHASE 5 — Rate Limiting & Security Hardening

**Tools:** Upstash Redis (or custom middleware), next.config.js, Vercel

- [ ] Add rate limiting to `POST /api/auth/signin` — **max 5 attempts per IP per 10 minutes**
- [ ] Add rate limiting to `/forgot-password` submission endpoint
- [ ] Review all API error messages — must not reveal whether email exists, what the password was, or internal stack traces
- [ ] Ensure all sensitive env vars are correctly configured in Vercel — not hardcoded
- [ ] Add HTTP security headers in `next.config.js`:
  - `X-Frame-Options`
  - `X-Content-Type-Options`
  - `Referrer-Policy`
- [ ] Run app and try to break it: wrong password, expired token, missing fields. Document what happens.

---

### PHASE 6 — UI Polish & Deployment

**Tools:** Vercel, GitHub, Figma (reference), Tailwind CSS

- [ ] UI must be clean, usable, and consistent
- [ ] Every form: accessible labels, real validation messages (not just "Something went wrong"), loading state
- [ ] Password field must show **strength indicator** (weak / fair / strong based on length and character variety)
- [ ] Deploy to Vercel — set all env vars in Vercel dashboard — test live URL end to end
- [ ] Push final code to GitHub — confirm `.env.local` is NOT in repo
- [ ] Record live Vercel URL for submission

---

## 04. Engineering Laws Quiz (15 Questions)

> All 15 answers go in `REFLECTION.md`. Each answer requires:
> 1. Your explanation in plain English
> 2. A code snippet or file path from your SecureGate repo
> 3. What could go wrong if this was ignored

---

### Q1 — Murphy's Law
**Where in SecureGate did Murphy's Law force you to add protection you would not have thought about otherwise? Name at least two specific places.**
> Hint: Password brute force, token expiry, missing email checks, session edge cases.

---

### Q2 — Law of Leaky Abstractions
**NextAuth, Prisma, and Resend are all abstractions. Pick one and explain where it 'leaks' — where you had to understand the layer beneath it.**
> Hint: When the abstraction surprised you, forced you to read raw docs, or failed silently.

---

### Q3 — YAGNI
**SecureGate intentionally does not have social login, multi-factor auth, or audit logs. Explain why adding those right now would violate YAGNI, and how you would add them correctly later.**
> Hint: What is actually required vs what sounds impressive.

---

### Q4 — Kerckhoffs's Principle
**What is a salt, why does bcrypt use it automatically, and what would happen to your users if you stored SHA-256 hashes instead?**
> Hint: Rainbow tables, dictionary attacks, and why bcrypt is slow by design.

---

### Q5 — Postel's Law + Security by Design
**Your forgot-password endpoint returns a success message even if the email does not exist. Why? What law governs this decision?**
> Hint: What does an attacker learn if the response differs based on whether the email exists?

---

### Q6 — The Boy Scout Rule
**Find one place in your codebase where you applied the Boy Scout Rule — where you cleaned up something not part of your original plan.**
> Hint: A variable name, duplicated function, unused import, or messy component.

---

### Q7 — Gall's Law
**Your SecureGate started as a scaffold and grew phase by phase. How does this match Gall's Law?**
> Hint: Dependency order, debugging surface area, and how bugs compound.

---

### Q8 — Law of Leaky Abstractions (ORM-specific)
**Identify one situation where the Prisma schema model and the actual database table structure are NOT the same thing.**
> Hint: Generated fields, relation tables, cascades, or how Prisma handles optional vs required.

---

### Q9 — Zawinski's Law
**Rate limiting is not in the core Next.js or NextAuth package. You had to add it yourself. What software engineering principle does this demonstrate?**
> Hint: Feature creep, responsibility boundaries, and single-purpose design.

---

### Q10 — Principle of Least Surprise
**What exact error message do you show when credentials are wrong, and why did you choose that specific wording?**
> Hint: What users expect when they enter a wrong password vs a wrong email.

---

### Q11 — Murphy's Law + Defensive Programming
**How does your middleware know the user is authenticated? If a user manually deletes their session cookie, what happens? Trace the exact code path.**
> Hint: Where the check happens, what it reads, and what the fallback behaviour is.

---

### Q12 — Kerckhoffs's Principle + Technical Debt
**What would happen — step by step — if your NEXTAUTH_SECRET was accidentally committed to GitHub and how would you recover?**
> Hint: Secret rotation, invalidating old sessions, what attackers can do with a leaked NextAuth secret.

---

### Q13 — Conway's Law
**How does Conway's Law explain why full-stack developers organise code the way they do? How is your folder structure a reflection of how you think?**
> Hint: How the structure of a team or a mind shapes the structure of a system.

---

### Q14 — Technical Debt
**Identify one piece of technical debt in your codebase — something that works now but will cause problems when the app grows. Describe the debt precisely and write the refactored version.**
> Hint: Hardcoded value, missing abstraction, route handler that does too much, or a type that should be shared.

---

### Q15 — Synthesis (All Principles)
**If you were asked to add Flutterwave payment integration to SecureGate, walk through every engineering principle from this task that would still apply. Which ones become more critical when money is involved?**
> Hint: What payments demand from authentication, security, idempotency, error handling, and user trust.

---

## 05. REFLECTION.md — Required Structure

```markdown
# SecureGate — Reflection & Engineering Analysis

**Name:** [Your full name]
**Cohort:** Design to MVP Bootcamp
**Live URL:** [Your Vercel deployment link]
**GitHub Repo:** [Your repo URL]

---

## Part 1 — What I Built
[2–3 sentences describing SecureGate and the specific features you implemented]

## Part 2 — What Surprised Me
[The one thing that was harder than expected, and what you learned from it]

## Part 3 — Engineering Laws Quiz

### Q1 — Murphy's Law
**Code reference:** `src/app/api/auth/[...nextauth]/route.ts` lines 34-48
**My Answer:** [Your answer here]
**What goes wrong if ignored:** [Your answer here]

### Q2 — Law of Leaky Abstractions
[repeat pattern for all 15 questions]

## Part 4 — One Thing I Would Refactor
[Describe your identified technical debt and paste the refactored version]

## Part 5 — How This Changes How I Build
[What you now know about authentication, security, and engineering principles that you did not know before]
```

> **Writing Standard:** Plain English only. No bullet-point definitions. No Wikipedia copies. Every answer must reference your actual SecureGate code. If your answer could apply to any student's project, it is not specific enough.

---

## 06. Submission Checklist

- [ ] App is live on Vercel — test in incognito window, sign up from scratch
- [ ] Sign up creates a verified user in the DB — `emailVerified` set after clicking email link
- [ ] Passwords are hashed — DB password column starts with `$2b$`
- [ ] Verification email sends correctly — email arrives, link works
- [ ] Forgot password flow works end to end — request, receive, set new password, log in
- [ ] Rate limiting is active on login — blocked on attempt 6 (5 attempts max)
- [ ] Protected route redirects correctly — log out, try `/dashboard` directly, land on `/login`
- [ ] No `.env.local` in GitHub repo — search repo, zero results
- [ ] `REFLECTION.md` is in repo root — all 15 questions answered
- [ ] No hardcoded API keys or secrets in code — search codebase, zero results
- [ ] All env vars set in Vercel dashboard
- [ ] UI has loading states and real error messages — empty form, wrong credentials tested

---

## 07. Scoring Rubric

| Area | Excellent (5) | Acceptable (3) | Needs Work (1) |
|---|---|---|---|
| **App Functionality** | Auth works end-to-end, emails send, protected routes enforced | Core flow works, minor bugs | Auth broken or incomplete |
| **Security Depth** | Hashing, rate-limiting, env vars, no leaked errors | Hashing done, some gaps | Passwords plain or major gaps |
| **Code Quality** | Abstracted, no duplication, clean folder structure | Mostly clean, some repeated code | Spaghetti, no structure |
| **Engineering Laws Documentation** | All 15 questions answered with code references | 8–14 answered with some code refs | Fewer than 8 answered |
| **Deployment** | Live on Vercel, `.env` correct, no keys exposed | Live but env issues or minor leaks | Not deployed |
| **Markdown File** | Well-structured, clear, honest, insightful | Present and readable | Missing or mostly blank |

### Grade Scale

| Score | Grade | Meaning |
|---|---|---|
| 27–30 | **Distinction** | Principles internalised. Code could go to production. |
| 21–26 | **Merit** | Strong execution. Minor gaps in depth or documentation. |
| 15–20 | **Pass** | Built it. Reflection is shallow. Security gaps present. |
| Below 15 | **Resubmit** | Critical features missing or principles not understood. |

> **What Distinction Looks Like:** You can sit in front of a senior engineer, open your REFLECTION.md, and walk them through your choices line by line. You know why you chose 12 salt rounds. You know what happens when the reset token expires. You know which law told you not to confirm whether an email exists.

---

## 08. Submission Instructions

1. **GitHub Repository URL** — complete codebase, includes `REFLECTION.md`, does NOT include `.env.local` or any secrets
2. **Vercel Live URL** — working deployment, tested cold (sign up → verify email → log in → access dashboard → reset password)
3. **Voice Note (2 min max)** — record yourself answering one quiz question out loud, any question, any format (confirms reflection is yours)

---

## Integrity Notice

> You may use AI agents (Windsurf, Cursor, Claude, Gemini) to help you build SecureGate. This is expected. What is **not acceptable** is submitting a REFLECTION.md written by an AI. Your engineering analysis must be yours. We will ask follow-up questions on your submission. If you cannot explain what you submitted, the grade does not stand.

---

*Build it properly. Document it honestly. Ship it with pride. That is what a product engineer does.*
