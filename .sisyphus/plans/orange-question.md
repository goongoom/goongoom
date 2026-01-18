# 궁금닷컴 (goongoom.com) - Work Breakdown Plan

**Project**: 궁금닷컴 (goongoom.com) - Korean Q&A Platform  
**Type**: Live, production-ready Q&A service (100% functional)  
**Created**: 2026-01-18  
**Updated**: 2026-01-18 (Korean localization & responsive design)

---

## Technology Stack (MANDATORY)

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS (default primitives, minimal customization)
- **Authentication**: Clerk
- **Database**: PlanetScale
- **ORM**: Drizzle ORM
- **Components**: coss/ui (shadcn/ui with Tailwind defaults)
- **Language**: TypeScript (strict mode)
- **UI Language**: Korean (all text, labels, content)
- **Fonts**: Pretendard, Apple SD Gothic Neo (Korean-optimized)

---

## Project Architecture

### Layout Specifications (RESPONSIVE)
**Mobile (< 768px)**:
- Single column layout
- Hamburger menu for navigation
- Full-width content

**Tablet (768px - 1024px)**:
- Left sidebar: `w-64` (256px), white background
- Main content: Fluid width, `bg-gray-50` background
- Right panel: Hidden

**Desktop (> 1024px)**:
- Left sidebar: `w-80` (320px), white background, `hidden lg:block`
- Main content: Fluid width, `bg-gray-50` background
- Right panel: `w-96` (384px), white background, `hidden lg:block`

### Brand Colors (Tailwind Primitives)
- Primary orange: `orange-500`
- Light orange (active pill): `orange-100`
- Main background: `gray-50`
- Text dark: `gray-900`
- Text light: `gray-500`
- Borders: `gray-200`

### Border Radius Values (Tailwind Defaults)
- Hero card: `rounded-3xl` (24px)
- Chat bubbles: `rounded-xl` (12px)
- Inputs/buttons: `rounded-lg` (8px)
- Navigation pill: `rounded-full` (9999px)

### Korean UI Labels
- 홈 (Home)
- 내 프로필 (My Profile)
- 알림 (Notifications)
- 더보기 (More/Settings)
- 질문하기 (Ask Question)
- 익명으로 질문 (Ask Anonymously)
- 답변하기 (Answer)
- 공지사항 (Announcements)
- 이벤트 (Events)
- 문의하기 (Contact)
- 환경설정 (Settings)

### Typography (Korean-Optimized)
- Font family: Pretendard (primary), Apple SD Gothic Neo (fallback), system-ui
- Line height: Increased for Hangul readability (1.6-1.8)
- Font weights: 400 (regular), 500 (medium), 700 (bold)

### Database Schema
```
users (Clerk sync)
├── id (string, primary key)
├── clerk_id (string, unique)
├── username (string, unique)
├── email (string)
├── created_at (timestamp)
└── updated_at (timestamp)

profiles
├── id (serial, primary key)
├── user_id (string, foreign key -> users.id)
├── avatar_url (string, nullable)
├── bio (text, nullable)
├── created_at (timestamp)
└── updated_at (timestamp)

questions
├── id (serial, primary key)
├── text (text)
├── user_id (string, nullable, foreign key -> users.id) -- nullable for anonymous
├── recipient_id (string, foreign key -> users.id)
├── created_at (timestamp)
└── updated_at (timestamp)

answers
├── id (serial, primary key)
├── text (text)
├── user_id (string, foreign key -> users.id)
├── question_id (integer, foreign key -> questions.id)
├── created_at (timestamp)
└── updated_at (timestamp)

social_links
├── id (serial, primary key)
├── user_id (string, foreign key -> users.id)
├── instagram (string, nullable)
├── facebook (string, nullable)
├── github (string, nullable)
├── created_at (timestamp)
└── updated_at (timestamp)
```

### Screens to Implement
1. `/` - 홈 (Home page with hero card + Q&A feed + people list)
2. `/@username` - 프로필 (User profile with Q&A feed + question form)
3. `/more` - 더보기 (Settings/options page)

### Korean Content Examples
- Question: "개발자로 일하면서 가장 보람찬 순간은 언제인가요?"
- Answer: "처음 만든 서비스가 실제 사용자들에게 도움이 되었을 때입니다."
- Bio: "웹 개발을 좋아하는 개발자입니다. 궁금한 것이 있으면 언제든 물어보세요!"
- Timestamp: "약 5분 전", "약 2시간 전", "약 3일 전"

---

## Phase 1: Project Foundation & Setup

### 1.1 Initialize Next.js 16 Project
**Parallelizable**: ❌ (Must be first)  
**Estimated Effort**: Quick (15 min)

**Tasks**:
- [ ] Create Next.js 16 project with App Router
- [ ] Configure TypeScript strict mode
- [ ] Set up project structure:
  ```
  goongoom/
  ├── app/
  │   ├── layout.tsx
  │   ├── page.tsx
  │   ├── more/
  │   │   └── page.tsx
  │   └── @[username]/
  │       └── page.tsx
  ├── components/
  │   ├── ui/ (shadcn/ui components)
  │   ├── layout/
  │   ├── questions/
  │   └── profile/
  ├── lib/
  │   ├── db/
  │   ├── auth/
  │   └── utils/
  ├── db/
  │   ├── schema.ts
  │   └── migrations/
  └── public/
  ```

**Verification**:
- [ ] `npm run dev` starts successfully
- [ ] TypeScript strict mode enabled in tsconfig.json
- [ ] App Router structure confirmed

---

### 1.2 Configure Tailwind CSS with Minimal Customization
**Parallelizable**: ✅ (After 1.1)  
**Estimated Effort**: Quick (20 min)

**Tasks**:
- [ ] Install and configure Tailwind CSS
- [ ] Use Tailwind default color primitives (orange-500, gray-50, etc.)
- [ ] Configure Korean-optimized fonts in `tailwind.config.ts`:
  ```typescript
  fontFamily: {
    sans: ['Pretendard', 'Apple SD Gothic Neo', 'system-ui', 'sans-serif'],
  },
  extend: {
    lineHeight: {
      'korean': '1.7', // Optimized for Hangul
    }
  }
  ```
- [ ] Use default Tailwind spacing and breakpoints
- [ ] Minimal theme customization (prefer defaults)

**Verification**:
- [ ] Tailwind classes work in components
- [ ] Korean fonts load correctly
- [ ] Default Tailwind colors work (orange-500, gray-50, etc.)
- [ ] Responsive breakpoints work (sm, md, lg, xl)

---

### 1.3 Install and Configure coss/ui (shadcn/ui)
**Parallelizable**: ✅ (After 1.2)  
**Estimated Effort**: Quick (15 min)

**Tasks**:
- [ ] Initialize shadcn/ui with `npx shadcn-ui@latest init`
- [ ] Install required components:
  - [ ] Button
  - [ ] Input
  - [ ] Textarea
  - [ ] Avatar
  - [ ] Card
  - [ ] Separator
  - [ ] Dropdown Menu
- [ ] Use default shadcn/ui styles (minimal customization)
- [ ] Configure orange-500 as primary color in components.json

**Verification**:
- [ ] All shadcn/ui components installed in `components/ui/`
- [ ] Components render with Tailwind defaults
- [ ] No style conflicts with Tailwind
- [ ] Korean text renders properly in components

---

### 1.4 Set Up Clerk Authentication
**Parallelizable**: ✅ (After 1.1)  
**Estimated Effort**: Short (30 min)

**Tasks**:
- [ ] Install Clerk SDK: `npm install @clerk/nextjs`
- [ ] Create Clerk application and get API keys
- [ ] Configure environment variables:
  ```
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
  CLERK_SECRET_KEY=
  NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
  NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
  ```
- [ ] Wrap app with `ClerkProvider` in root layout
- [ ] Create middleware for protected routes
- [ ] Configure username-based routing for `/@username` pattern
- [ ] Set up Clerk webhook for user sync

**Verification**:
- [ ] Sign-in/sign-up flows work
- [ ] Protected routes redirect to sign-in
- [ ] User session persists across page reloads
- [ ] `/@username` routes resolve correctly

---

### 1.5 Set Up PlanetScale Database
**Parallelizable**: ✅ (After 1.1)  
**Estimated Effort**: Short (30 min)

**Tasks**:
- [ ] Create PlanetScale database
- [ ] Get connection string
- [ ] Configure environment variables:
  ```
  DATABASE_URL=
  ```
- [ ] Install Drizzle ORM: `npm install drizzle-orm @planetscale/database`
- [ ] Install Drizzle Kit: `npm install -D drizzle-kit`
- [ ] Configure `drizzle.config.ts`
- [ ] Set up database connection in `lib/db/index.ts`

**Verification**:
- [ ] Database connection successful
- [ ] Drizzle Kit commands work
- [ ] Environment variables loaded correctly

---

### 1.6 Create Database Schema with Drizzle
**Parallelizable**: ✅ (After 1.5)  
**Estimated Effort**: Short (45 min)

**Tasks**:
- [ ] Create `db/schema.ts` with exact schema:
  - [ ] `users` table (Clerk sync)
  - [ ] `profiles` table (avatar, bio)
  - [ ] `questions` table (text, user_id nullable for anonymous, recipient_id)
  - [ ] `answers` table (text, user_id, question_id)
  - [ ] `social_links` table (instagram, facebook, github)
- [ ] Define relationships:
  - [ ] users -> profiles (one-to-one)
  - [ ] users -> questions (one-to-many, nullable)
  - [ ] users -> answers (one-to-many)
  - [ ] questions -> answers (one-to-many)
  - [ ] users -> social_links (one-to-one)
- [ ] Create indexes for performance:
  - [ ] username (unique)
  - [ ] clerk_id (unique)
  - [ ] recipient_id (for profile queries)
  - [ ] question_id (for answer queries)
- [ ] Generate migration: `npm run drizzle-kit generate`
- [ ] Push to database: `npm run drizzle-kit push`

**Verification**:
- [ ] All tables created in PlanetScale
- [ ] Relationships defined correctly
- [ ] Indexes created
- [ ] No migration errors

---

### 1.7 Create Clerk Webhook for User Sync
**Parallelizable**: ✅ (After 1.4, 1.6)  
**Estimated Effort**: Short (30 min)

**Tasks**:
- [ ] Create webhook endpoint: `app/api/webhooks/clerk/route.ts`
- [ ] Handle `user.created` event to sync to `users` table
- [ ] Handle `user.updated` event to update user data
- [ ] Handle `user.deleted` event to soft delete or cascade
- [ ] Verify webhook signature for security
- [ ] Create initial profile and social_links records on user creation

**Verification**:
- [ ] New Clerk users appear in `users` table
- [ ] User updates sync correctly
- [ ] Webhook signature validation works
- [ ] Profile and social_links created automatically

---

## Phase 2: Core Layout Components

### 2.1 Create Root Layout with Responsive 3-Column Structure
**Parallelizable**: ✅ (After Phase 1)  
**Estimated Effort**: Short (45 min)

**Tasks**:
- [ ] Create `app/layout.tsx` with responsive Tailwind layout:
  - [ ] Mobile (< 768px): Single column, hamburger menu
  - [ ] Tablet (768px - 1024px): Left sidebar `w-64`, main content fluid
  - [ ] Desktop (> 1024px): Left sidebar `w-80`, main content fluid, right panel `w-96`
- [ ] Use Tailwind responsive classes:
  - [ ] `hidden lg:block` for sidebar/right panel
  - [ ] `bg-white` for sidebars, `bg-gray-50` for main content
- [ ] Add Clerk authentication wrapper
- [ ] Set up global fonts (Pretendard, Apple SD Gothic Neo)
- [ ] Configure Korean-optimized line-height

**Verification**:
- [ ] Layout responsive on all breakpoints
- [ ] Sidebar collapses on mobile
- [ ] Right panel hidden on mobile/tablet
- [ ] Korean fonts load correctly
- [ ] No layout shift on page load

---

### 2.2 Create Left Sidebar Component (Korean UI)
**Parallelizable**: ✅ (After 2.1)  
**Estimated Effort**: Short (1 hour)

**Tasks**:
- [ ] Create `components/layout/Sidebar.tsx`
- [ ] Implement responsive specifications:
  - [ ] Width: `w-64 lg:w-80` (responsive)
  - [ ] Background: `bg-white`
  - [ ] Sticky positioning: `sticky top-0`
  - [ ] Mobile: `hidden lg:block` (hamburger menu)
- [ ] Add navigation items (Korean labels):
  - [ ] Logo/branding: "궁금닷컴"
  - [ ] 홈 (Home) - link to `/`
  - [ ] 내 프로필 (My Profile) - link to `/@username`
  - [ ] 더보기 (More) - link to `/more`
  - [ ] 로그아웃 (Sign out) - button
- [ ] Style active navigation pill:
  - [ ] Background: `bg-orange-100`
  - [ ] Border radius: `rounded-full`
  - [ ] Text color: `text-orange-500`
- [ ] Add user avatar and username display
- [ ] Implement mobile hamburger menu

**Verification**:
- [ ] Sidebar responsive (w-64 on tablet, w-80 on desktop)
- [ ] All labels in Korean
- [ ] Active state highlights correctly
- [ ] Navigation links work
- [ ] Mobile menu toggles properly
- [ ] User info displays when authenticated

---

### 2.3 Create Right Panel Component (Korean UI)
**Parallelizable**: ✅ (After 2.1)  
**Estimated Effort**: Short (45 min)

**Tasks**:
- [ ] Create `components/layout/RightPanel.tsx`
- [ ] Implement responsive specifications:
  - [ ] Width: `w-96` (384px)
  - [ ] Background: `bg-white`
  - [ ] Sticky positioning: `sticky top-0`
  - [ ] Mobile/Tablet: `hidden lg:block`
- [ ] Create people list section (Korean):
  - [ ] Title: "사람들" (People)
  - [ ] User avatars in grid/list
  - [ ] Username display with @ prefix
  - [ ] Click to navigate to `/@username`
- [ ] Fetch and display users from database
- [ ] Add loading state: "로딩 중..." (Loading...)
- [ ] Add empty state: "아직 사용자가 없습니다" (No users yet)

**Verification**:
- [ ] Right panel width w-96 (384px)
- [ ] Hidden on mobile/tablet
- [ ] All labels in Korean
- [ ] People list displays correctly
- [ ] Click navigation works
- [ ] Loading and empty states render in Korean
- [ ] Scrollable when content overflows

---

## Phase 3: Home Page (/) Implementation

### 3.1 Create Hero Card Component (Korean Content)
**Parallelizable**: ✅ (After Phase 2)  
**Estimated Effort**: Short (1 hour)

**Tasks**:
- [ ] Create `components/HeroCard.tsx`
- [ ] Implement specifications:
  - [ ] Border radius: `rounded-3xl` (24px)
  - [ ] Background: `bg-white`
  - [ ] Padding: `p-8 lg:p-12` (responsive)
  - [ ] Shadow: `shadow-lg`
- [ ] Add Korean content:
  - [ ] Large heading: "궁금닷컴에 오신 것을 환영합니다" (Welcome to goongoom.com)
  - [ ] Tagline: "궁금한 것을 자유롭게 물어보세요" (Ask anything you're curious about)
  - [ ] Description: "익명으로 질문하고, 솔직하게 답변하는 공간입니다" (A space to ask anonymously and answer honestly)
  - [ ] CTA button: "시작하기" (Get Started) - `bg-orange-500 hover:bg-orange-600`
- [ ] Style with Tailwind colors
- [ ] Make responsive (adjust padding/size on mobile)

**Verification**:
- [ ] Border radius rounded-3xl
- [ ] All content in Korean
- [ ] Colors use Tailwind primitives (orange-500, etc.)
- [ ] Responsive on all screen sizes
- [ ] CTA button navigates correctly

---

### 3.2 Create Q&A Feed Component (Korean Content)
**Parallelizable**: ✅ (After Phase 2)  
**Estimated Effort**: Medium (2 hours)

**Tasks**:
- [ ] Create `components/questions/QAFeed.tsx`
- [ ] Implement chat bubble layout:
  - [ ] Question bubbles: `bg-white`, left-aligned
  - [ ] Answer bubbles: `bg-orange-500`, right-aligned
  - [ ] Border radius: `rounded-xl` (12px) for both
  - [ ] Proper spacing: `space-y-4`
- [ ] Create `components/questions/QuestionBubble.tsx`:
  - [ ] Background: `bg-white`
  - [ ] Question text (Korean)
  - [ ] "익명" (Anonymous) or username display
  - [ ] Relative timestamp: "약 5분 전", "약 2시간 전", "약 3일 전"
- [ ] Create `components/questions/AnswerBubble.tsx`:
  - [ ] Background: `bg-orange-500`
  - [ ] Text color: `text-white`
  - [ ] Answer text (Korean)
  - [ ] Username display
  - [ ] Relative timestamp (Korean)
- [ ] Fetch Q&A pairs from database
- [ ] Implement infinite scroll or pagination
- [ ] Add loading skeleton: "로딩 중..." (Loading...)
- [ ] Add empty state: "아직 질문이 없습니다" (No questions yet)

**Verification**:
- [ ] Question bubbles white, left-aligned
- [ ] Answer bubbles orange-500, right-aligned
- [ ] Border radius rounded-xl
- [ ] All text in Korean
- [ ] Timestamps display correctly in Korean
- [ ] Data loads from database
- [ ] Infinite scroll works

---

### 3.3 Create Home Page Layout
**Parallelizable**: ✅ (After 3.1, 3.2)  
**Estimated Effort**: Quick (30 min)

**Tasks**:
- [ ] Create `app/page.tsx`
- [ ] Compose layout:
  - [ ] Hero card at top
  - [ ] Q&A feed below hero
  - [ ] Right panel with people list
- [ ] Fetch recent Q&A pairs for feed
- [ ] Implement proper spacing and padding
- [ ] Add page metadata (title, description)

**Verification**:
- [ ] Hero card displays at top
- [ ] Q&A feed shows below
- [ ] Right panel visible on desktop
- [ ] Data loads correctly
- [ ] Page metadata set

---

## Phase 4: User Profile Page (/@username) Implementation

### 4.1 Create Profile Header Component (Korean UI)
**Parallelizable**: ✅ (After Phase 2)  
**Estimated Effort**: Short (1 hour)

**Tasks**:
- [ ] Create `components/profile/ProfileHeader.tsx`
- [ ] Implement profile display:
  - [ ] Large avatar (from Clerk or custom upload)
  - [ ] Username display (@username)
  - [ ] Bio text (Korean, if exists)
  - [ ] Social links (Instagram, Facebook, GitHub icons)
  - [ ] Edit button: "프로필 수정" (Edit Profile) - only for own profile
- [ ] Style with Tailwind colors
- [ ] Make responsive
- [ ] Add social link click handlers

**Verification**:
- [ ] Avatar displays correctly
- [ ] Username shows with @ prefix
- [ ] Korean bio renders if exists
- [ ] Social links clickable
- [ ] Edit button in Korean, shows only for own profile
- [ ] Responsive on mobile

---

### 4.2 Create Question Form Component (Korean UI)
**Parallelizable**: ✅ (After Phase 2)  
**Estimated Effort**: Short (1 hour)

**Tasks**:
- [ ] Create `components/questions/QuestionForm.tsx`
- [ ] Implement form (Korean labels):
  - [ ] Textarea placeholder: "궁금한 것을 물어보세요..." (Ask anything you're curious about...)
  - [ ] Character limit indicator: "X / 500자" (X / 500 characters)
  - [ ] Checkbox: "익명으로 질문하기" (Ask anonymously)
  - [ ] Submit button: "질문하기" (Ask) - `bg-orange-500 hover:bg-orange-600`
  - [ ] Border radius: `rounded-lg` (8px) for inputs
- [ ] Add form validation (Korean errors):
  - [ ] Required: "질문을 입력해주세요" (Please enter a question)
  - [ ] Max length: "500자를 초과할 수 없습니다" (Cannot exceed 500 characters)
- [ ] Implement submit handler:
  - [ ] Create question in database
  - [ ] Link to recipient user
  - [ ] Set user_id to null if anonymous
  - [ ] Success message: "질문이 전송되었습니다" (Question sent)
  - [ ] Clear form
- [ ] Add loading state: "전송 중..." (Sending...)
- [ ] Handle errors: "오류가 발생했습니다" (An error occurred)

**Verification**:
- [ ] All labels in Korean
- [ ] Form renders correctly
- [ ] Validation works with Korean messages
- [ ] Anonymous checkbox toggles user_id
- [ ] Questions save to database
- [ ] Success/error messages display in Korean
- [ ] Form clears after submit

---

### 4.3 Create Profile Q&A Feed (Korean UI)
**Parallelizable**: ✅ (After 3.2)  
**Estimated Effort**: Short (45 min)

**Tasks**:
- [ ] Create `components/profile/ProfileQAFeed.tsx`
- [ ] Reuse Q&A bubble components from 3.2
- [ ] Filter Q&A pairs by recipient_id (profile owner)
- [ ] Show only answered questions
- [ ] Sort by most recent
- [ ] Implement pagination or infinite scroll
- [ ] Add empty state: "아직 답변한 질문이 없습니다" (No answered questions yet)

**Verification**:
- [ ] Only shows questions for this user
- [ ] Only answered questions display
- [ ] Sorted by recency
- [ ] Pagination/scroll works
- [ ] Empty state renders in Korean

---

### 4.4 Create Profile Page Layout
**Parallelizable**: ✅ (After 4.1, 4.2, 4.3)  
**Estimated Effort**: Short (45 min)

**Tasks**:
- [ ] Create `app/@[username]/page.tsx`
- [ ] Implement dynamic route handling:
  - [ ] Extract username from params
  - [ ] Fetch user by username
  - [ ] Handle user not found (404)
- [ ] Compose layout:
  - [ ] Profile header at top
  - [ ] Question form below (if viewing another user)
  - [ ] Q&A feed below
  - [ ] No right panel on profile pages
- [ ] Add page metadata with username
- [ ] Implement proper error handling

**Verification**:
- [ ] Dynamic routes work (/@alice, /@bob)
- [ ] Profile data loads correctly
- [ ] Question form shows for other users
- [ ] Q&A feed displays user's answers
- [ ] 404 page for invalid usernames
- [ ] Metadata includes username

---

## Phase 5: Settings Page (/more) Implementation

### 5.1 Create Settings Layout Component (Korean UI)
**Parallelizable**: ✅ (After Phase 2)  
**Estimated Effort**: Short (45 min)

**Tasks**:
- [ ] Create `components/settings/SettingsLayout.tsx`
- [ ] Implement settings container:
  - [ ] Background: `bg-white`
  - [ ] Border radius: `rounded-lg` (8px)
  - [ ] Padding: `p-6 lg:p-8`
  - [ ] Section headers in Korean
- [ ] Create navigation tabs/sections (Korean):
  - [ ] 프로필 설정 (Profile settings)
  - [ ] 소셜 링크 (Social links)
  - [ ] 계정 설정 (Account settings)
  - [ ] 개인정보 설정 (Privacy settings)

**Verification**:
- [ ] Settings container renders correctly
- [ ] All section headers in Korean
- [ ] Navigation between sections works
- [ ] Styling uses Tailwind defaults

---

### 5.2 Create Profile Settings Form (Korean UI)
**Parallelizable**: ✅ (After 5.1)  
**Estimated Effort**: Short (1 hour)

**Tasks**:
- [ ] Create `components/settings/ProfileSettings.tsx`
- [ ] Implement form fields (Korean labels):
  - [ ] Avatar upload: "프로필 사진" (Profile picture) with preview
  - [ ] Bio textarea: "소개" (Bio) - placeholder: "자신을 소개해주세요..." (Introduce yourself...)
  - [ ] Username: "사용자명" (Username) - read-only, from Clerk
  - [ ] Email: "이메일" (Email) - read-only, from Clerk
- [ ] Add form validation (Korean errors):
  - [ ] Bio max length: "500자를 초과할 수 없습니다" (Cannot exceed 500 characters)
  - [ ] Avatar file: "이미지 파일만 업로드 가능합니다" (Only image files allowed)
- [ ] Implement save handler:
  - [ ] Update profile in database
  - [ ] Upload avatar to storage (if changed)
  - [ ] Success: "프로필이 저장되었습니다" (Profile saved)
- [ ] Loading state: "저장 중..." (Saving...)
- [ ] Error: "오류가 발생했습니다" (An error occurred)

**Verification**:
- [ ] All labels in Korean
- [ ] Form fields render correctly
- [ ] Avatar upload works
- [ ] Bio saves to database
- [ ] Validation prevents invalid data with Korean messages
- [ ] Success/error messages display in Korean

---

### 5.3 Create Social Links Form (Korean UI)
**Parallelizable**: ✅ (After 5.1)  
**Estimated Effort**: Short (45 min)

**Tasks**:
- [ ] Create `components/settings/SocialLinksForm.tsx`
- [ ] Implement form fields (Korean labels):
  - [ ] Instagram URL: "인스타그램" (Instagram) - placeholder: "인스타그램 URL"
  - [ ] Facebook URL: "페이스북" (Facebook) - placeholder: "페이스북 URL"
  - [ ] GitHub URL: "깃허브" (GitHub) - placeholder: "깃허브 URL"
  - [ ] Icons for each platform
- [ ] Add URL validation (Korean errors):
  - [ ] Invalid URL: "올바른 URL을 입력해주세요" (Please enter a valid URL)
- [ ] Implement save handler:
  - [ ] Upsert social_links in database
  - [ ] Success: "소셜 링크가 저장되었습니다" (Social links saved)
- [ ] Loading state: "저장 중..." (Saving...)
- [ ] Error: "오류가 발생했습니다" (An error occurred)

**Verification**:
- [ ] All labels in Korean
- [ ] Form fields render with icons
- [ ] URL validation works with Korean messages
- [ ] Links save to database
- [ ] Success/error messages display in Korean
- [ ] Links appear on profile page

---

### 5.4 Create Settings Page Layout
**Parallelizable**: ✅ (After 5.1, 5.2, 5.3)  
**Estimated Effort**: Quick (30 min)

**Tasks**:
- [ ] Create `app/more/page.tsx`
- [ ] Compose layout:
  - [ ] Settings layout wrapper
  - [ ] Profile settings section
  - [ ] Social links section
  - [ ] Account settings section (future)
- [ ] Add page metadata
- [ ] Protect route (require authentication)
- [ ] Add breadcrumb navigation

**Verification**:
- [ ] Settings page renders correctly
- [ ] All sections accessible
- [ ] Protected route redirects if not authenticated
- [ ] Metadata set correctly

---

## Phase 6: Database Queries & API Routes

### 6.1 Create User Queries
**Parallelizable**: ✅ (After 1.6)  
**Estimated Effort**: Short (45 min)

**Tasks**:
- [ ] Create `lib/db/queries/users.ts`
- [ ] Implement queries:
  - [ ] `getUserByUsername(username: string)`
  - [ ] `getUserById(id: string)`
  - [ ] `getAllUsers(limit?: number)`
  - [ ] `updateUserProfile(userId: string, data: ProfileUpdate)`
- [ ] Add proper error handling
- [ ] Add TypeScript types for return values

**Verification**:
- [ ] All queries execute successfully
- [ ] Type safety enforced
- [ ] Error handling works
- [ ] Queries optimized with indexes

---

### 6.2 Create Question Queries
**Parallelizable**: ✅ (After 1.6)  
**Estimated Effort**: Short (1 hour)

**Tasks**:
- [ ] Create `lib/db/queries/questions.ts`
- [ ] Implement queries:
  - [ ] `createQuestion(data: QuestionCreate)`
  - [ ] `getQuestionsByRecipient(recipientId: string, limit?: number)`
  - [ ] `getRecentQuestions(limit?: number)`
  - [ ] `getQuestionById(id: number)`
- [ ] Add proper joins for user data
- [ ] Add pagination support
- [ ] Add TypeScript types

**Verification**:
- [ ] All queries execute successfully
- [ ] Joins return user data correctly
- [ ] Pagination works
- [ ] Type safety enforced

---

### 6.3 Create Answer Queries
**Parallelizable**: ✅ (After 1.6)  
**Estimated Effort**: Short (45 min)

**Tasks**:
- [ ] Create `lib/db/queries/answers.ts`
- [ ] Implement queries:
  - [ ] `createAnswer(data: AnswerCreate)`
  - [ ] `getAnswersByQuestion(questionId: number)`
  - [ ] `getAnswersByUser(userId: string, limit?: number)`
  - [ ] `updateAnswer(id: number, text: string)`
  - [ ] `deleteAnswer(id: number)`
- [ ] Add proper joins for question data
- [ ] Add TypeScript types

**Verification**:
- [ ] All queries execute successfully
- [ ] Joins return question data correctly
- [ ] Type safety enforced
- [ ] CRUD operations work

---

### 6.4 Create Social Links Queries
**Parallelizable**: ✅ (After 1.6)  
**Estimated Effort**: Quick (30 min)

**Tasks**:
- [ ] Create `lib/db/queries/social-links.ts`
- [ ] Implement queries:
  - [ ] `getSocialLinks(userId: string)`
  - [ ] `upsertSocialLinks(userId: string, data: SocialLinksUpdate)`
- [ ] Add TypeScript types

**Verification**:
- [ ] Queries execute successfully
- [ ] Upsert logic works correctly
- [ ] Type safety enforced

---

### 6.5 Create API Routes for Questions
**Parallelizable**: ✅ (After 6.2)  
**Estimated Effort**: Short (1 hour)

**Tasks**:
- [ ] Create `app/api/questions/route.ts` (POST - create question)
- [ ] Create `app/api/questions/[id]/route.ts` (GET - get question)
- [ ] Implement request validation with Zod
- [ ] Add authentication checks
- [ ] Handle anonymous question creation
- [ ] Return proper HTTP status codes
- [ ] Add error handling

**Verification**:
- [ ] POST creates questions successfully
- [ ] GET retrieves questions correctly
- [ ] Validation rejects invalid data
- [ ] Authentication enforced where needed
- [ ] Anonymous questions work

---

### 6.6 Create API Routes for Answers
**Parallelizable**: ✅ (After 6.3)  
**Estimated Effort**: Short (1 hour)

**Tasks**:
- [ ] Create `app/api/answers/route.ts` (POST - create answer)
- [ ] Create `app/api/answers/[id]/route.ts` (GET, PUT, DELETE)
- [ ] Implement request validation with Zod
- [ ] Add authentication checks (only question recipient can answer)
- [ ] Return proper HTTP status codes
- [ ] Add error handling

**Verification**:
- [ ] POST creates answers successfully
- [ ] GET retrieves answers correctly
- [ ] PUT updates answers
- [ ] DELETE removes answers
- [ ] Only recipient can answer their questions
- [ ] Validation works

---

### 6.7 Create API Routes for Profile
**Parallelizable**: ✅ (After 6.1, 6.4)  
**Estimated Effort**: Short (45 min)

**Tasks**:
- [ ] Create `app/api/profile/route.ts` (GET, PUT)
- [ ] Create `app/api/profile/social-links/route.ts` (GET, PUT)
- [ ] Implement request validation
- [ ] Add authentication checks (only own profile)
- [ ] Handle avatar upload (if applicable)
- [ ] Return proper HTTP status codes
- [ ] Add error handling

**Verification**:
- [ ] GET retrieves profile correctly
- [ ] PUT updates profile successfully
- [ ] Social links CRUD works
- [ ] Only user can update own profile
- [ ] Validation works

---

## Phase 7: Utilities & Helpers

### 7.1 Create Timestamp Utility (Korean)
**Parallelizable**: ✅ (After Phase 1)  
**Estimated Effort**: Quick (20 min)

**Tasks**:
- [ ] Create `lib/utils/time.ts`
- [ ] Implement Korean relative time function:
  - [ ] "방금 전" (just now) - < 1 minute
  - [ ] "약 X분 전" (about X minutes ago) - < 60 minutes
  - [ ] "약 X시간 전" (about X hours ago) - < 24 hours
  - [ ] "약 X일 전" (about X days ago) - < 30 days
  - [ ] "약 X개월 전" (about X months ago) - < 12 months
  - [ ] "약 X년 전" (about X years ago) - >= 12 months
- [ ] Korean-only (no English toggle needed)
- [ ] Add TypeScript types

**Verification**:
- [ ] Relative times display correctly in Korean
- [ ] Edge cases handled (0, negative, very large)
- [ ] Proper Korean grammar (분/시간/일/개월/년)

---

### 7.2 Create Form Validation Schemas
**Parallelizable**: ✅ (After Phase 1)  
**Estimated Effort**: Quick (30 min)

**Tasks**:
- [ ] Install Zod: `npm install zod`
- [ ] Create `lib/validations/question.ts`:
  - [ ] Question text (required, max length)
  - [ ] Anonymous flag (boolean)
  - [ ] Recipient ID (required)
- [ ] Create `lib/validations/answer.ts`:
  - [ ] Answer text (required, max length)
  - [ ] Question ID (required)
- [ ] Create `lib/validations/profile.ts`:
  - [ ] Bio (optional, max length)
  - [ ] Avatar URL (optional, valid URL)
- [ ] Create `lib/validations/social-links.ts`:
  - [ ] Instagram URL (optional, valid URL)
  - [ ] Facebook URL (optional, valid URL)
  - [ ] GitHub URL (optional, valid URL)

**Verification**:
- [ ] All schemas validate correctly
- [ ] Invalid data rejected
- [ ] Type inference works
- [ ] Error messages clear

---

### 7.3 Create Avatar Upload Utility
**Parallelizable**: ✅ (After Phase 1)  
**Estimated Effort**: Short (1 hour)

**Tasks**:
- [ ] Choose storage solution (Vercel Blob, Uploadthing, or Cloudinary)
- [ ] Install required packages
- [ ] Create `lib/utils/upload.ts`
- [ ] Implement upload function:
  - [ ] File validation (size, type)
  - [ ] Image optimization
  - [ ] Return public URL
- [ ] Add error handling
- [ ] Add TypeScript types

**Verification**:
- [ ] Images upload successfully
- [ ] URLs returned correctly
- [ ] File validation works
- [ ] Errors handled gracefully

---

### 7.4 Create Database Seed Script (Korean Content)
**Parallelizable**: ✅ (After 1.6)  
**Estimated Effort**: Short (45 min)

**Tasks**:
- [ ] Create `db/seed.ts`
- [ ] Generate sample data (Korean content):
  - [ ] 5-10 sample users (Korean names)
  - [ ] 20-30 sample questions (Korean text, mix of anonymous and named)
    - Example: "개발자로 일하면서 가장 보람찬 순간은 언제인가요?"
  - [ ] 15-20 sample answers (Korean text)
    - Example: "처음 만든 서비스가 실제 사용자들에게 도움이 되었을 때입니다."
  - [ ] Sample social links
  - [ ] Sample profiles with Korean bios
    - Example: "웹 개발을 좋아하는 개발자입니다. 궁금한 것이 있으면 언제든 물어보세요!"
- [ ] Add script to package.json: `"db:seed": "tsx db/seed.ts"`
- [ ] Add reset script: `"db:reset": "drizzle-kit push && npm run db:seed"`

**Verification**:
- [ ] Seed script runs without errors
- [ ] All sample data in Korean
- [ ] Sample data appears in database
- [ ] Relationships maintained correctly
- [ ] Reset script works

---

## Phase 8: Polish & Optimization

### 8.1 Implement Loading States
**Parallelizable**: ✅ (After Phase 3, 4, 5)  
**Estimated Effort**: Short (1 hour)

**Tasks**:
- [ ] Create loading skeletons for:
  - [ ] Q&A feed
  - [ ] Profile header
  - [ ] People list
  - [ ] Settings forms
- [ ] Use shadcn/ui Skeleton component
- [ ] Match exact dimensions of actual content
- [ ] Add smooth transitions

**Verification**:
- [ ] Skeletons display during loading
- [ ] Dimensions match actual content
- [ ] Transitions smooth
- [ ] No layout shift

---

### 8.2 Implement Error States
**Parallelizable**: ✅ (After Phase 3, 4, 5)  
**Estimated Effort**: Short (45 min)

**Tasks**:
- [ ] Create error components:
  - [ ] Generic error boundary
  - [ ] 404 page
  - [ ] API error messages
  - [ ] Form validation errors
- [ ] Style with brand colors
- [ ] Add retry buttons where applicable
- [ ] Add helpful error messages

**Verification**:
- [ ] Error boundary catches errors
- [ ] 404 page displays for invalid routes
- [ ] API errors show user-friendly messages
- [ ] Form errors display inline

---

### 8.3 Implement Empty States (Korean)
**Parallelizable**: ✅ (After Phase 3, 4, 5)  
**Estimated Effort**: Quick (30 min)

**Tasks**:
- [ ] Create empty state components (Korean messages):
  - [ ] No questions: "아직 질문이 없습니다" (No questions yet)
  - [ ] No answers: "아직 답변한 질문이 없습니다" (No answered questions yet)
  - [ ] No people: "아직 사용자가 없습니다" (No users yet)
  - [ ] No social links: "소셜 링크를 추가해보세요" (Add social links)
- [ ] Add illustrations or icons
- [ ] Add helpful CTAs (Korean)
- [ ] Style with Tailwind colors

**Verification**:
- [ ] All empty state messages in Korean
- [ ] Empty states display when no data
- [ ] CTAs navigate correctly
- [ ] Styling uses Tailwind defaults
- [ ] Messages helpful and clear

---

### 8.4 Optimize Performance
**Parallelizable**: ✅ (After Phase 3, 4, 5, 6)  
**Estimated Effort**: Short (1 hour)

**Tasks**:
- [ ] Implement React Server Components where possible
- [ ] Add proper caching strategies:
  - [ ] Cache user profiles
  - [ ] Cache Q&A feeds
  - [ ] Revalidate on mutations
- [ ] Optimize images:
  - [ ] Use Next.js Image component
  - [ ] Add proper sizes and loading
- [ ] Add database query optimization:
  - [ ] Review and optimize indexes
  - [ ] Add query result caching
- [ ] Implement pagination for large lists
- [ ] Add prefetching for navigation

**Verification**:
- [ ] Lighthouse score > 90
- [ ] Time to Interactive < 3s
- [ ] No unnecessary re-renders
- [ ] Database queries optimized
- [ ] Images load efficiently

---

### 8.5 Implement Responsive Design (Mobile-First)
**Parallelizable**: ✅ (After Phase 2, 3, 4, 5)  
**Estimated Effort**: Medium (2 hours)

**Tasks**:
- [ ] Test all pages on mobile (375px, 414px)
- [ ] Test all pages on tablet (768px, 1024px)
- [ ] Test all pages on desktop (1280px, 1920px)
- [ ] Verify Tailwind responsive classes:
  - [ ] Mobile: Single column, hamburger menu
  - [ ] Tablet: `w-64` sidebar, hidden right panel
  - [ ] Desktop: `w-80` sidebar, `w-96` right panel
  - [ ] Use `hidden lg:block` for conditional visibility
- [ ] Test touch interactions on mobile (44px minimum)
- [ ] Ensure Korean text readable on all sizes
- [ ] Verify line-height for Hangul readability

**Verification**:
- [ ] All pages responsive on all breakpoints
- [ ] No horizontal scroll on mobile
- [ ] Touch targets minimum 44px
- [ ] Korean text readable without zoom
- [ ] Navigation works on all devices
- [ ] Sidebar/right panel hide/show correctly

---

### 8.6 Add Accessibility Features
**Parallelizable**: ✅ (After Phase 2, 3, 4, 5)  
**Estimated Effort**: Short (1 hour)

**Tasks**:
- [ ] Add proper ARIA labels to all interactive elements
- [ ] Ensure keyboard navigation works:
  - [ ] Tab order logical
  - [ ] Focus visible
  - [ ] Enter/Space activate buttons
- [ ] Add alt text to all images
- [ ] Ensure color contrast meets WCAG AA:
  - [ ] Orange on white: Check contrast
  - [ ] White on orange: Check contrast
  - [ ] Text on backgrounds: Check contrast
- [ ] Add skip to content link
- [ ] Test with screen reader

**Verification**:
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] Color contrast passes WCAG AA
- [ ] Screen reader announces correctly
- [ ] No accessibility errors in Lighthouse

---

### 8.7 Add Animations and Transitions
**Parallelizable**: ✅ (After Phase 2, 3, 4, 5)  
**Estimated Effort**: Short (1 hour)

**Tasks**:
- [ ] Add subtle transitions:
  - [ ] Button hover states
  - [ ] Navigation pill active state
  - [ ] Form focus states
  - [ ] Page transitions
- [ ] Add micro-interactions:
  - [ ] Question submit animation
  - [ ] Answer appear animation
  - [ ] Avatar hover effect
- [ ] Use CSS transitions (not JavaScript)
- [ ] Respect prefers-reduced-motion
- [ ] Keep animations subtle and fast (< 300ms)

**Verification**:
- [ ] Transitions smooth and subtle
- [ ] No janky animations
- [ ] Reduced motion respected
- [ ] Animations enhance UX, not distract

---

## Phase 9: Testing & Deployment

### 9.1 Manual Testing
**Parallelizable**: ❌ (After Phase 8)  
**Estimated Effort**: Medium (2 hours)

**Tasks**:
- [ ] Test all user flows:
  - [ ] Sign up → Create profile → Ask question
  - [ ] Sign in → Answer question → View profile
  - [ ] Update profile → Add social links → View changes
  - [ ] Anonymous question → View on profile
- [ ] Test edge cases:
  - [ ] Invalid usernames
  - [ ] Empty states
  - [ ] Very long text
  - [ ] Special characters
  - [ ] Concurrent edits
- [ ] Test on multiple browsers:
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge
- [ ] Test on multiple devices:
  - [ ] iPhone
  - [ ] Android
  - [ ] iPad
  - [ ] Desktop

**Verification**:
- [ ] All user flows work end-to-end
- [ ] No critical bugs found
- [ ] Cross-browser compatible
- [ ] Cross-device compatible

---

### 9.2 Performance Testing
**Parallelizable**: ✅ (After Phase 8)  
**Estimated Effort**: Short (45 min)

**Tasks**:
- [ ] Run Lighthouse audits on all pages
- [ ] Check Core Web Vitals:
  - [ ] LCP < 2.5s
  - [ ] FID < 100ms
  - [ ] CLS < 0.1
- [ ] Test with slow 3G network
- [ ] Test with CPU throttling
- [ ] Optimize any bottlenecks found

**Verification**:
- [ ] Lighthouse scores > 90 on all pages
- [ ] Core Web Vitals pass
- [ ] Usable on slow connections
- [ ] No performance regressions

---

### 9.3 Security Audit
**Parallelizable**: ✅ (After Phase 6)  
**Estimated Effort**: Short (1 hour)

**Tasks**:
- [ ] Review authentication flows:
  - [ ] Protected routes work
  - [ ] Session management secure
  - [ ] CSRF protection enabled
- [ ] Review API routes:
  - [ ] Input validation on all endpoints
  - [ ] Authorization checks enforced
  - [ ] Rate limiting considered
- [ ] Review database queries:
  - [ ] No SQL injection vulnerabilities
  - [ ] Proper parameterization
- [ ] Check environment variables:
  - [ ] No secrets in client code
  - [ ] .env.local in .gitignore
- [ ] Add security headers

**Verification**:
- [ ] No authentication bypasses
- [ ] All inputs validated
- [ ] No SQL injection possible
- [ ] Secrets not exposed
- [ ] Security headers set

---

### 9.4 Prepare for Deployment
**Parallelizable**: ✅ (After 9.1, 9.2, 9.3)  
**Estimated Effort**: Short (45 min)

**Tasks**:
- [ ] Set up production environment variables
- [ ] Configure PlanetScale production branch
- [ ] Run production build: `npm run build`
- [ ] Test production build locally
- [ ] Set up Vercel project (or other host)
- [ ] Configure custom domain (if applicable)
- [ ] Set up monitoring (Vercel Analytics, Sentry)
- [ ] Create deployment checklist

**Verification**:
- [ ] Production build succeeds
- [ ] Environment variables set
- [ ] Database migrations applied
- [ ] Monitoring configured

---

### 9.5 Deploy to Production
**Parallelizable**: ❌ (After 9.4)  
**Estimated Effort**: Quick (30 min)

**Tasks**:
- [ ] Deploy to Vercel (or chosen platform)
- [ ] Verify deployment successful
- [ ] Run smoke tests on production:
  - [ ] Sign up works
  - [ ] Sign in works
  - [ ] Create question works
  - [ ] Create answer works
  - [ ] Profile loads
- [ ] Monitor for errors
- [ ] Set up alerts for critical issues

**Verification**:
- [ ] Deployment successful
- [ ] All smoke tests pass
- [ ] No errors in logs
- [ ] Monitoring active

---

## Phase 10: Documentation & Handoff

### 10.1 Create README
**Parallelizable**: ✅ (After Phase 9)  
**Estimated Effort**: Short (45 min)

**Tasks**:
- [ ] Create comprehensive README.md:
  - [ ] Project description
  - [ ] Technology stack
  - [ ] Setup instructions
  - [ ] Environment variables
  - [ ] Database setup
  - [ ] Development workflow
  - [ ] Deployment instructions
- [ ] Add screenshots
- [ ] Add architecture diagram
- [ ] Add contributing guidelines

**Verification**:
- [ ] README complete and accurate
- [ ] Setup instructions work for new developers
- [ ] Screenshots up to date

---

### 10.2 Create Technical Documentation
**Parallelizable**: ✅ (After Phase 9)  
**Estimated Effort**: Short (1 hour)

**Tasks**:
- [ ] Document database schema
- [ ] Document API endpoints
- [ ] Document component hierarchy
- [ ] Document authentication flow
- [ ] Document deployment process
- [ ] Create troubleshooting guide

**Verification**:
- [ ] All documentation accurate
- [ ] Easy to understand
- [ ] Covers all major systems

---

### 10.3 Create User Guide (Korean)
**Parallelizable**: ✅ (After Phase 9)  
**Estimated Effort**: Quick (30 min)

**Tasks**:
- [ ] Create user-facing documentation (Korean):
  - [ ] 계정 만들기 (How to create account)
  - [ ] 질문하는 방법 (How to ask questions)
  - [ ] 답변하는 방법 (How to answer questions)
  - [ ] 프로필 수정하기 (How to update profile)
  - [ ] 소셜 링크 추가하기 (How to add social links)
  - [ ] 익명 질문과 개인정보 (Privacy and anonymous questions)
- [ ] Add screenshots/GIFs with Korean UI
- [ ] Make accessible to non-technical users

**Verification**:
- [ ] User guide in Korean
- [ ] Easy to follow
- [ ] Covers all features
- [ ] Screenshots show Korean UI

---

## Summary

**Total Estimated Effort**: ~30-35 hours

**Parallelization Opportunities**:
- Phase 1 tasks can run in parallel after 1.1
- Phase 2 tasks can run in parallel after Phase 1
- Phase 3, 4, 5 can run in parallel after Phase 2
- Phase 6 tasks can run in parallel after 1.6
- Phase 7 tasks can run in parallel after Phase 1
- Phase 8 tasks can run in parallel after their dependencies

**Critical Path**:
1. Project setup (1.1)
2. Database setup (1.5, 1.6)
3. Layout components (2.1, 2.2, 2.3)
4. Page implementations (3, 4, 5)
5. API routes (6)
6. Polish (8)
7. Testing & deployment (9)

**Key Success Metrics**:
- [ ] All 3 screens fully functional and production-ready
- [ ] Responsive layout (mobile, tablet, desktop)
- [ ] All UI text in Korean (labels, messages, content)
- [ ] Tailwind color primitives (orange-500, gray-50, etc.)
- [ ] Tailwind responsive classes (w-64, lg:w-80, hidden lg:block)
- [ ] Korean-optimized fonts (Pretendard, Apple SD Gothic Neo)
- [ ] Next.js 16 with App Router
- [ ] PlanetScale + Drizzle ORM
- [ ] Clerk authentication with @username routes
- [ ] Anonymous question posting
- [ ] coss/ui (shadcn/ui) with minimal customization
- [ ] Live, deployable service (100% functional)
- [ ] Lighthouse score > 90
- [ ] Zero accessibility errors
- [ ] Korean text readable on all devices

---

**Next Steps**:
1. Review and approve this plan
2. Set up development environment
3. Begin Phase 1: Project Foundation & Setup
4. Execute tasks in parallel where possible
5. Track progress and update plan as needed
