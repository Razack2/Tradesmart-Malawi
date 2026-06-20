// ...existing code...
# TradeSmart Malawi

TradeSmart Malawi is a Vite + React learning platform that delivers structured trading education (Beginner → Intermediate → Expert) targeted at Malawian traders. It provides courses, modules, lessons, progress tracking and an optional premium subscription flow. The app uses Supabase for auth, data storage and serverless functions.

Key app entrypoints and services:
- App root: [`App`](src/App.tsx) — main routes and providers.
- Auth: [`AuthProvider`](src/contexts/AuthContext.tsx) (supabase-backed).
- Content: [`CourseProvider`](src/contexts/CourseContext.tsx) and [`src/services/contentService.ts`](src/services/contentService.ts).
- Payments & serverless: [`src/services/PaymentService.ts`](src/services/PaymentService.ts) and [supabase/functions](supabase/functions).
- Supabase client: [`src/lib/supabaseClient.ts`](src/lib/supabaseClient.ts).
- Pages: [`src/pages/UpgradePage.tsx`](src/pages/UpgradePage.tsx), [`src/pages/PaymentPage.tsx`](src/pages/PaymentPage.tsx), [`src/pages/CoursePage.tsx`](src/pages/CoursePage.tsx).

Functional Requirements
- User registration, email verification and login using Supabase auth. See [`AuthProvider`](src/contexts/AuthContext.tsx).
- User profile storage with unlocked levels, subscription status, and role (admin/student).
- Browse learning Levels → Courses → Modules → Lessons UI with progress tracking (local + user profile merge). See [`CourseProvider`](src/contexts/CourseContext.tsx) and [`src/contexts/ProgressContext.tsx`](src/contexts/ProgressContext.tsx).
- Access control:
  - Free/paid gating per level and lesson. Components use guards such as `PaidContentGuard` and `AdminRoute` in [`src/components/ProtectedRoute.tsx`](src/components/ProtectedRoute.tsx).
  - Admin routes for managing courses/modules/lessons/quizzes under `/src/pages/admin`.
- Admin content CRUD (courses, modules, lessons, quizzes) backed by Supabase. See [`src/services/contentService.ts`](src/services/contentService.ts) and admin pages in [`src/pages/admin`](src/pages/admin).
- Payment flow:
  - Initialize payment → redirect/checkout via external provider → webhook/verify to unlock access. Serverless functions live in [supabase/functions](supabase/functions) (`order-initialization`, `create-payment`, `verify-payment`, `payment-webhook`).
  - Payment record lifecycle persisted in `payments` / `subscriptions` tables; unlocking updates `user_profiles`.
- Notifications & toasts using the local `useToast` hook and UI components in [`src/components/ui`](src/components/ui).
- Client routing and layout: [`App`](src/App.tsx), [`DashboardLayout`](src/components/DashboardLayout.tsx), [`AppSidebar`](src/components/AppSidebar.tsx).

Non-Functional Requirements
- Security:
  - Sensitive server operations occur server-side in Supabase Edge Functions; service role keys kept out of client code. See [supabase/functions](supabase/functions).
  - Auth flows use Supabase auth; backend updates verify payment status before granting access.
- Performance:
  - Lazy-load large pages (already implemented via React.lazy in [`App`](src/App.tsx)).
  - Use caching and pagination for lists where applicable (courses/users).
- Reliability:
  - Idempotent webhook handlers that safely ignore failed or duplicate events. See [`supabase/functions/payment-webhook/index.ts`](supabase/functions/payment-webhook/index.ts).
- Maintainability:
  - Clear separation: UI primitives in [`src/components/ui`](src/components/ui), contexts in [`src/contexts`](src/contexts), services in [`src/services`](src/services).
  - Typed models under [`src/types`](src/types).
- Usability & Accessibility:
  - Keyboard-accessible UI primitives (Radix + accessible attributes in `src/components/ui`).
  - Mobile-responsive layouts and ARIA attributes.
- Observability:
  - Console logging in serverless functions and critical client flows (login/register/payment) for debugging (search for `console` in [`supabase/functions`](supabase/functions) and [`src/contexts/AuthContext.tsx`](src/contexts/AuthContext.tsx)).

Basic run / dev
```sh
npm install
npm run dev
```
Build
```sh
npm run build
```

Useful files
- [`src/App.tsx`](src/App.tsx) — routes & providers
- [`src/main.tsx`](src/main.tsx) — client bootstrap
- [`src/contexts/AuthContext.tsx`](src/contexts/AuthContext.tsx)
- [`src/contexts/CourseContext.tsx`](src/contexts/CourseContext.tsx)
- [`src/services/PaymentService.ts`](src/services/PaymentService.ts)
- [`src/services/contentService.ts`](src/services/contentService.ts)
- [supabase/functions](supabase/functions) — serverless payment endpoints

If you want this converted into a separate formal SRS file (IEEE-style) or split into ISSUE/TODO checklists, I can add it.