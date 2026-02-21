# Csodaszarvas Booking App - Planning Document

## Project Overview

**Goal**: Replace Salonic with a custom archery range booking system that addresses key pain points and provides better UX for multi-lane bookings.

**Current pain points with Salonic:**

- ❌ Only single lane booking allowed
- ❌ No visibility of available lane count (shows "at least 1 available" only)
- ❌ No group/multi-person booking support
- ❌ Forces users to call during off-hours → lost conversions

**Key improvements:**

- ✅ Multi-lane booking (1-5 lanes simultaneously)
- ✅ Real-time availability visibility
- ✅ Flexible payment splitting (pass + payment mixed)
- ✅ Self-service booking without admin intervention
- ✅ 24/7 availability

---

## Context

**Archery Range Setup:**

- 5 shooting lanes total
- Operating hours and lane availability managed via separate admin app (out of scope)

**Tech Stack:**

- Nuxt 4 + TypeScript
- Turso database (separate from main website)
- Better Auth (migrated from main website)
- Vuestic UI (for visual consistency with main site)
- Docker deployment on same VPS

---

## User Personas

### Primary: Regular Archer (with membership pass)

- Has active membership pass
- Books 1-2 lanes regularly, often for 2-3 hours at a time
- May bring guests who need equipment rental
- Wants quick, hassle-free booking

### Secondary: Casual Visitor (no pass)

- Occasional shooter
- Pays per booking with deposit
- May need equipment rental
- Price-sensitive
- Usually books 1-2 hours

### Tertiary: Group Organizer

- Books 3-5 lanes for group events
- Mixed needs (some have equipment, some don't)
- Needs flexibility in payment options

### Quaternary: Event Organizer (team building, parties)

- Books entire venue (all 5 lanes)
- 10+ participants rotating through lanes
- Minimum 2 hours, often 3-4 hours
- Wants simple "full venue" option
- May need special arrangements (catering, instructors)

---

## Core Features & User Stories

### Epic 1: Authentication & User Management

**US-1.1: Login Required**

```
AS A user
I WANT to be required to login before accessing the app
SO THAT my bookings and passes are tied to my account
```

**Acceptance Criteria:**

- App redirects to login if not authenticated
- Uses Better Auth with Google OAuth (migrated from main site)
- No public/anonymous access allowed

**US-1.2: View Profile**

```
AS A logged-in user
I WANT to view my profile information
SO THAT I can verify my account details
```

**Acceptance Criteria:**

- Sidebar/navbar shows profile link
- Profile page displays: name, email, registration date
- Data from Better Auth user session

---

### Epic 2: Dashboard & Booking Overview

**US-2.1: View Upcoming Bookings**

```
AS A user
I WANT to see my upcoming bookings on the landing page
SO THAT I can track my scheduled range time
```

**Acceptance Criteria:**

- Landing page displays list of future bookings
- Shows: date, time, number of lanes, payment method
- Sorted chronologically (nearest first)
- Empty state if no bookings

**US-2.2: Cancel Booking (>48h notice)**

```
AS A user with a booking >48h away
I WANT to cancel my booking and get refunded/credited
SO THAT I don't lose money if plans change
```

**Acceptance Criteria:**

- Cancel button visible on bookings >48h away
- **If paid with pass**: usage credits returned to pass immediately
- **If paid with deposit**:
  - Modal explains: "You'll receive a coupon for future bookings. Contact us if you prefer a refund."
  - Coupon auto-generated (e.g., 1-use pass equivalent)
  - Contact info shown for refund requests
- Booking removed from list after confirmation

**US-2.3: Cancel Booking (<48h notice)**

```
AS A user with a booking <48h away
I WANT to still be able to cancel technically
SO THAT I can free up the lane for others, even without refund
```

**Acceptance Criteria:**

- Cancel button visible but with warning
- Modal: "Warning: Cancelling within 48h means no refund or coupon. Proceed?"
- If confirmed: booking deleted, no credits/coupons issued
- ToS link shown (cancellation policy)

---

### Epic 3: Booking Wizard (Core Feature)

**US-3.1: Start Booking Flow**

```
AS A user
I WANT a clear CTA button on the landing page
SO THAT I can easily start the booking process
```

**Acceptance Criteria:**

- Prominent "Book Now" or "Start Booking" button on landing
- Opens step-by-step wizard
- Can be cancelled/exited anytime (state not persisted)

**US-3.2: Select Number of Lanes 🔥 CRITICAL**

```
AS A user booking for multiple people
I WANT to choose how many lanes I need (1-5)
SO THAT I can see only time slots with enough availability
```

**Acceptance Criteria:**

- First step: "How many lanes do you need?" (1-5 selector)
- Default: 1
- Can be changed later in wizard (refreshes availability)
- UI clearly shows selected count

**US-3.3: View Filtered Time Slot Availability 🔥 CRITICAL**

```
AS A user who selected N lanes
I WANT to see ONLY time slots where ≥N lanes are available
SO THAT I don't see unusable options
```

**Acceptance Criteria:**

- Calendar view shows available dates
- Time slots filtered by selected lane count
- Each slot shows: time, available lanes count (e.g., "3/5 lanes free")
- Grayed out if insufficient lanes
- Real-time updates (prevent double-booking)

**US-3.4: Select Date & Time**

```
AS A user
I WANT to pick a specific date and time slot
SO THAT I can reserve my preferred range time
```

**Acceptance Criteria:**

- Interactive calendar (week/day view preferred)
- Time slots shown based on availability
- Selected slot highlighted
- Shows available lanes for each time slot

**US-3.4b: Select Booking Duration 🔥 NEW**

```
AS A regular member who trains for multiple hours
I WANT to book 2-3 hour blocks at once
SO THAT I don't have to make multiple separate bookings
```

**Acceptance Criteria:**

- Duration selector: 1h, 2h, 3h (configurable max)
- Default: 1 hour
- Availability filtered by continuous availability
  - Example: If selecting 2h, only show slots where N lanes are free for full 2 hours
- Price calculation updated based on duration × lanes
- Pass credit calculation: duration = credits consumed

**US-3.4c: Full Venue Booking (Quick Option) 🔥 NEW**

```
AS AN event organizer
I WANT a quick "Book entire venue" option
SO THAT I don't have to manually select all 5 lanes
```

**Acceptance Criteria:**

- Checkbox/toggle: "Full venue rental (all 5 lanes)"
- When enabled:
  - Lane selector auto-set to 5 and disabled
  - Duration defaults to minimum 2 hours
  - Only shows time slots where all 5 lanes available for full duration
- Clear pricing (full venue rate if different from 5× single lane)
- Recommended for 10+ participants (UI hint)

**US-3.4d: Equipment Rental Selection 🔥 MVP CRITICAL**

```
AS A user without archery equipment
I WANT to indicate I need to rent equipment
SO THAT the pricing reflects equipment rental and staff prepares gear
```

**Acceptance Criteria:**

- Checkbox/toggle: "Need to rent equipment" (default: unchecked)
- Applies to ALL lanes in booking (not per-lane)
- Pricing updates immediately:
  - Own equipment: 3,500 HUF/hour/lane
  - With equipment: 5,000 HUF/hour/lane
- Clear price breakdown shown:
  - Example: "2 lanes × 2 hours × 5,000 HUF = 20,000 HUF"
- Stored in booking record (`equipmentNeeded` field)
- Pass compatibility: equipment rental allowed with pass usage

**US-3.4e: Participant Count (Optional Info)**

```
AS A user booking multiple lanes for a group
I WANT to indicate how many people will attend
SO THAT staff can prepare adequate equipment and space
```

**Acceptance Criteria:**

- Optional number input: "Expected number of participants"
- Only shown when lanes ≥ 2 or "Full venue" selected
- Min: 2, Max: 50 (reasonable upper bound)
- Not required, informational only
- Stored in `participantCount` field
- Displayed to admin for planning purposes

**US-3.5: Choose Payment Method**

```
AS A user finalizing a booking
I WANT to choose between my pass or paying a deposit
SO THAT I can use my membership benefits or pay directly
```

**Acceptance Criteria:**

- **Option 1: Use Pass** (if user has active pass with credits)
  - Shows remaining credits
  - Disabled if insufficient credits or pass doesn't cover booking type
- **Option 2: Pay Deposit** (Phase 2 - Simple integration)
  - Shows price
  - Placeholder for now ("Coming soon - contact admin")
- Can proceed if valid payment method selected

**US-3.6: Split Payment (Partial Pass Usage) 🔥 KEY DIFFERENTIATOR**

```
AS A user with a pass booking multiple lanes
I WANT to use my pass for some lanes and pay for others
SO THAT I can bring guests without blocking my own booking
```

**Acceptance Criteria:**

- If lanes > 1 AND user has pass:
  - Option: "Use pass for X lanes, pay for Y lanes"
  - Slider or stepper: split between pass/payment
  - Example: "2 lanes - 1 from pass, 1 paid deposit"
- Updates pricing dynamically
- Clear summary before confirmation

**US-3.7: Confirm Booking**

```
AS A user
I WANT to review all details before confirming
SO THAT I can verify everything is correct
```

**Acceptance Criteria:**

- Summary screen shows:
  - Date & time
  - Number of lanes
  - Payment breakdown (pass credits used, deposit amount)
  - Equipment rental (if applicable - Phase 2)
- "Confirm Booking" button
- Success message after creation
- Redirects to landing page (shows new booking)

**US-3.8: Prevent Race Conditions (Concurrent Bookings) 🔥 CRITICAL**

```
AS A user going through the booking wizard
I WANT the system to reserve my selected time slot temporarily
SO THAT another user cannot book it while I'm completing payment
```

**Acceptance Criteria:**

- When user selects time slot + lanes (Step 2), create temporary reservation:
  - Insert booking record with `status = "reserved"`
  - Set `reservedUntil` timestamp (e.g., now + 10 minutes)
  - Decrement `lane_availability` immediately
- Temporary reservation expires automatically after timeout:
  - Background job or lazy cleanup on next availability query
  - Status changes to "cancelled"
  - Lane capacity restored
- Availability API excludes reserved slots (treats as booked)
- If user completes booking before timeout:
  - Status → "confirmed" (or "pending_payment" in Phase 2)
  - Clear `reservedUntil`
- If user abandons wizard:
  - Reservation auto-expires
  - Slot becomes available again
- UI shows countdown timer: "This slot is reserved for you for X minutes"
- Handle edge cases:
  - User refreshes page → extend reservation if still valid
  - User navigates back in wizard → keep reservation
  - Multiple tabs → share same reservation (sessionId or userId based)

---

### Epic 4: Membership Pass Management

**US-4.1: View Active Pass**

```
AS A user with a membership pass
I WANT to see my pass details and remaining credits
SO THAT I know how many bookings I can make
```

**Acceptance Criteria:**

- Sidebar/navbar link: "My Pass"
- Shows: pass type, expiry date, remaining credits
- History of credit usage (bookings)
- Empty state if no pass

**US-4.2: Admin Grants Pass (MVP)**

```
AS AN ADMIN (via separate admin app)
I WANT to manually grant a pass to a user
SO THAT they can start booking during MVP phase
```

**Acceptance Criteria:**

- Admin app feature (out of scope for this app)
- Pass data stored in booking app database
- User sees pass immediately in booking app

**US-4.3: Purchase Pass (Phase 2)**

```
AS A user without a pass
I WANT to purchase a membership pass online
SO THAT I can get better rates and book easily
```

**Acceptance Criteria:**

- (Deferred to Phase 2)
- Simple payment integration
- Auto-generates pass after payment

---

### Epic 5: Async Payment & Pending Bookings (Phase 2)

**US-5.1: Deposit Payment with Deadline 🔥 PHASE 2**

```
AS A user booking with deposit payment
I WANT to complete payment within a grace period
SO THAT I can secure my booking even if I don't have immediate payment info
```

**Acceptance Criteria:**

- When user confirms booking with "Pay Deposit" option:
  - Booking created with `status = "pending_payment"`
  - Set `paymentDeadline` timestamp:
    - User-initiated booking: deadline = now + 2-3 hours
    - Admin-initiated booking: deadline = now + 24 hours
  - Lane capacity reserved (booking visible in admin, not to other users)
- User receives payment reminder email:
  - Simple payment link
  - Deadline clearly stated
  - Instructions for payment
- User completes payment before deadline:
  - Status → "confirmed"
  - Clear `paymentDeadline`
  - Send confirmation email
- Payment deadline expires (auto-cleanup job):
  - Status → "cancelled"
  - Lane capacity restored
  - Send cancellation notification email
  - Remove from user's upcoming bookings
- UI shows pending bookings differently:
  - "Payment pending - deadline: X hours"
  - "Pay Now" button with payment link

**US-5.2: Payment Reminder Notifications (Phase 2)**

```
AS A user with pending payment
I WANT to receive reminders before my deadline
SO THAT I don't forget to pay and lose my booking
```

**Acceptance Criteria:**

- Email reminder sent 1 hour before deadline
- Includes payment link and deadline time
- Shows booking details for reference

**US-5.3: Admin-Created Bookings with Payment (Phase 2)**

```
AS AN ADMIN creating a booking for a user
I WANT to send them a payment request with 24h deadline
SO THAT they can confirm financially without immediate phone call
```

**Acceptance Criteria:**

- Admin app allows creating booking with "Send payment request"
- Longer deadline (24 hours) than user bookings
- Same auto-cancel logic if unpaid
- Admin notified when payment completed or booking auto-cancelled

---

### Epic 6: Notifications & Communication

**US-6.1: Booking Confirmation Email (Phase 2)**

```
AS A user who just booked
I WANT to receive a confirmation email
SO THAT I have a record and can add it to my calendar
```

**Acceptance Criteria:**

- Email sent after booking confirmed
- Contains: date, time, lanes, payment method
- Includes .ics calendar invite
- Thank you message + directions/rules link

**US-5.2: Cancellation Confirmation Email (Phase 2)**

```
AS A user who cancelled
I WANT to receive confirmation
SO THAT I know my cancellation was processed
```

**Acceptance Criteria:**

- Email sent after cancellation
- Shows refund/coupon details
- Contact info for questions

---

## Database Schema (Draft)

### Tables

**users** (from Better Auth)

```sql
id: integer (PK)
email: text
name: text
image: text
createdAt: integer
```

**passes**

```sql
id: integer (PK, auto-increment)
userId: integer (FK -> users.id)
passType: text (e.g., "standard-12", "unlimited", "custom-36")
creditsTotal: integer (total credits in pass, e.g., 12, 999 for unlimited)
creditsRemaining: integer
expiresAt: integer (timestamp, 2 months from issue by default)
createdAt: integer
updatedAt: integer
```

**bookings**

```sql
id: integer (PK, auto-increment)
userId: integer (FK -> users.id)
bookingDate: integer (date as timestamp)
startTime: text (e.g., "10:00")
endTime: text (e.g., "11:00")
durationHours: integer (1-3, configurable max)
lanesBooked: integer (1-5)
equipmentNeeded: boolean (true = rent equipment, affects pricing)
participantCount: integer | null (for info: expected number of people)
status: text (enum: "reserved", "pending_payment", "confirmed", "cancelled")
reservedUntil: integer | null (timestamp, temp lock during booking flow - Phase 1)
paymentDeadline: integer | null (timestamp, for async payment - Phase 2)
cancelledAt: integer | null
createdAt: integer
updatedAt: integer
```

**booking_payments**

```sql
id: integer (PK, auto-increment)
bookingId: integer (FK -> bookings.id)
passId: integer | null (FK -> passes.id, if pass used)
lanesFromPass: integer (lanes paid with pass)
lanesFromDeposit: integer (lanes paid with deposit)
depositAmount: integer | null (in HUF cents)
paymentStatus: text (enum: "pending", "completed", "refunded")
createdAt: integer
```

**coupons** (for refunds)

```sql
id: integer (PK, auto-increment)
userId: integer (FK -> users.id)
generatedFromBookingId: integer | null (FK -> bookings.id)
creditsValue: integer (equivalent to X lanes)
usedAt: integer | null
expiresAt: integer
createdAt: integer
```

**lane_availability** (pre-populated by admin app)

```sql
id: integer (PK, auto-increment)
date: integer (date as timestamp)
startTime: text
endTime: text
availableLanes: integer (0-5, updated via bookings)
isOpen: boolean (set by admin)
```

---

## Pricing & Business Rules

### Hourly Rates

| Equipment Type   | Price per Lane per Hour |
| ---------------- | ----------------------- |
| Own equipment    | 3,500 HUF               |
| Rental equipment | 5,000 HUF               |

### Pricing Formula

```
Total Price = Lanes × Hours × Rate
Where Rate = equipmentNeeded ? 5000 : 3500
```

**Examples:**

- 1 lane, 1 hour, own equipment: `1 × 1 × 3,500 = 3,500 HUF`
- 2 lanes, 2 hours, rental equipment: `2 × 2 × 5,000 = 20,000 HUF`
- 5 lanes, 3 hours, own equipment: `5 × 3 × 3,500 = 52,500 HUF`

### Pass Credit System

- **1 credit = 1 lane for 1 hour** (regardless of equipment rental)
- Pass types:
  - **Standard**: 12 credits (buy 10, get 2 free)
  - **Unlimited**: For insiders (non-purchasable)
  - **Custom**: Ad-hoc amounts (e.g., 36 credits), admin-granted

**Credit Consumption:**

```
Credits Used = Lanes (from pass) × Hours
```

**Example**: User books 2 lanes for 3 hours, uses pass for 1 lane:

- Credits consumed: `1 × 3 = 3 credits`
- Deposit for remaining lane: `1 × 3 × rate`

### Cancellation Policy

- **>48 hours notice**: Full refund (pass credits or coupon)
- **<48 hours notice**: No refund, booking can still be cancelled
- Refund method:
  - Pass booking → credits returned to pass
  - Deposit booking → coupon issued (same value, 2-month expiry)
  - Refund via bank transfer → manual contact required

### Operational Rules

- Max advance booking: **60 days**
- Pass expiry: **2 months** from issue (extendable by admin)
- Coupon expiry: **2 months** from issue
- Time slot granularity: **1 hour** (10:00-11:00, 11:00-12:00, etc.)
- Booking duration: **1-3 hours** (configurable max)
- Lane capacity: **5 lanes** total
- Equipment rental: All-or-nothing (applies to all lanes in booking)

---

## MVP Scope (Phase 1)

### In Scope

- ✅ Better Auth migration (Google OAuth)
- ✅ Landing page with upcoming bookings list
- ✅ Booking wizard:
  - Select lane count (1-5)
  - Select duration (1-3 hours)
  - Equipment rental toggle (per booking, affects all lanes)
  - View filtered time slots
  - Date/time picker
  - **Temporary slot reservation (race condition prevention)** 🔥
  - Payment method: pass only (admin grants passes manually)
  - Partial pass usage (split payment)
  - Participant count (optional field for multi-lane bookings)
  - Booking confirmation
- ✅ Cancellation:
  - > 48h: pass credits returned or coupon generated
  - <48h: warning modal, no refund
- ✅ Profile view (basic)
- ✅ Pass view (read-only, shows expiry)
- ✅ Database schema + migrations
- ✅ Docker deployment config
- ✅ Pricing logic:
  - Own equipment: 3,500 HUF/hour/lane
  - With equipment: 5,000 HUF/hour/lane
  - Formula: `price = lanes × hours × rate`
- ✅ **Race condition handling**:
  - Temporary booking reservations during wizard
  - Auto-expiry of abandoned bookings (10 min timeout)
  - Availability queries exclude reserved slots

### Out of Scope (Phase 2)

- ❌ Pass purchase flow
- ❌ Simple payment integration (deposits)
- ❌ Async payment flow (pending bookings with deadlines)
- ❌ Email notifications
- ❌ Admin app (lane config, pass management)
- ❌ Full venue special packages/discounts
- ❌ Per-lane equipment rental (MVP: all-or-nothing)

---

## Phase 2 Scope (Future)

- **Async payment flow** (Salonic-style):
  - Pending bookings with payment deadlines
  - User bookings: 2-3 hour payment window
  - Admin bookings: 24 hour payment window
  - Auto-cancellation of unpaid bookings
  - Payment reminder emails
- Simple payment integration (Simple or Stripe)
- Pass purchase flow
- Automated emails (confirmation, reminders, cancellations)
- Coupon management UI
- Recurring bookings
- Group booking invites (send link to friends)

---

## Technical Architecture

### Repository Structure

```
csodaszarvas-booking/
├── app/
│   ├── components/
│   │   ├── booking/
│   │   │   ├── lane-selector.vue
│   │   │   ├── time-slot-picker.vue
│   │   │   ├── payment-split.vue
│   │   │   └── booking-summary.vue
│   │   ├── dashboard/
│   │   │   ├── upcoming-bookings.vue
│   │   │   └── booking-card.vue
│   │   └── cs-navbar.vue (shared from main site)
│   ├── pages/
│   │   ├── index.vue (landing/dashboard)
│   │   ├── booking/
│   │   │   └── wizard.vue
│   │   ├── profile/
│   │   │   ├── index.vue
│   │   │   └── pass.vue
│   │   └── login.vue
│   ├── middleware/
│   │   └── auth.ts (require login globally)
│   └── layouts/
│       └── default.vue
├── server/
│   ├── api/
│   │   ├── [...auth].ts (Better Auth)
│   │   ├── bookings/
│   │   │   ├── index.get.ts (list user bookings)
│   │   │   ├── index.post.ts (create booking)
│   │   │   └── [id]/cancel.post.ts
│   │   ├── availability/
│   │   │   └── index.get.ts (filtered by lane count)
│   │   └── passes/
│   │       └── index.get.ts (user's active pass)
│   └── middleware/
│       └── auth.ts (attach user to context)
├── lib/
│   ├── auth.ts (Better Auth config)
│   ├── db/
│   │   ├── index.ts
│   │   ├── schema/
│   │   │   ├── auth.ts
│   │   │   ├── bookings.ts
│   │   │   ├── passes.ts
│   │   │   └── availability.ts
│   │   └── queries/
│   │       ├── bookings.ts
│   │       ├── passes.ts
│   │       └── availability.ts
│   └── env.ts
├── stores/
│   ├── auth.ts
│   └── bookings.ts
├── docker-compose.yml
├── Dockerfile
└── README.md
```

### Key Technical Decisions

**Database:**

- Separate Turso instance (not shared with main site)
- Reason: Different access patterns, easier to scale independently

**Auth:**

- Migrate Better Auth from main site
- Same Google OAuth credentials
- Only change: `BETTER_AUTH_URL` env var

**UI:**

- Reuse Vuestic theme from main site
- Copy color config from main `nuxt.config.ts`
- Shared navbar/footer components (copy or extract to package later)

**Deployment:**

- New Docker container on same VPS
- Separate docker-compose files (test/staging/production)
- Reverse proxy routes: `booking.csodaszarvas.hu`

**Concurrency & Race Conditions:**

- **Pessimistic locking approach** (temporary reservations)
- When user selects slot → create booking with `status = 'reserved'`
- Reservation timeout: **10 minutes**
- Availability queries exclude reserved slots
- Auto-cleanup via:
  - Lazy evaluation on availability API calls
  - Optional: cron job every 5 minutes (belt-and-suspenders)
- **No optimistic locking** (avoid conflicts, simpler UX)
- Trade-off: Slots locked during wizard → may reduce availability
  - Acceptable given low concurrent user count (~100 users)
- If traffic grows: add reservation extension API (user clicks "extend")

**Phase 2 Payment Flow:**

- Pending bookings (`status = 'pending_payment'`)
- Payment deadline tracking (`paymentDeadline` timestamp)
- Same auto-cleanup mechanism as reservations
- Email sent on auto-cancellation

---

## Implementation Status (Updated: 2026-02-20)

### Epic 1: Authentication & User Management ✅ COMPLETE

- ✅ **US-1.1: Login Required** - Better Auth with Google OAuth working, middleware protection
- ✅ **US-1.2: View Profile** - Profile page displays user info from session

### Epic 2: Dashboard & Booking Overview ✅ COMPLETE

- ✅ **US-2.1: View Upcoming Bookings** - `cs-upcoming-bookings` component fetches and displays list
- ✅ **US-2.2: Cancel Booking (>48h notice)** - Refund logic implemented (pass credits returned)
- ✅ **US-2.3: Cancel Booking (<48h notice)** - Warning modal, no refund, booking deleted

### Epic 3: Booking Wizard ✅ COMPLETE (with minor gaps)

- ✅ **US-3.1: Start Booking Flow** - "Make a booking" button on landing page
- ✅ **US-3.2: Select Number of Lanes** - Lane selector (1-5) in step-1.vue
- ✅ **US-3.3: View Filtered Time Slot Availability** - Date picker + time slot chips in step-2.vue, filtered by duration & lanes
- ✅ **US-3.4: Select Date & Time** - VaDatePicker with available slots
- ✅ **US-3.4b: Select Booking Duration** - Duration selector (1-3 hours) in step-1.vue
- ✅ **US-3.4d: Equipment Rental Selection** - `creditType` (REGULAR vs RENTAL) in step-3.vue
- ❌ **US-3.4c: Full Venue Booking** - NOT IMPLEMENTED (can manually select 5 lanes)
- 🔍 **US-3.4e: Participant Count** - Schema field exists, UI input NOT implemented
- ✅ **US-3.5: Choose Payment Method** - Payment step (step-5.vue) with pass selection
- ❌ **US-3.6: Split Payment (Partial Pass Usage)** - NOT IMPLEMENTED (payment.post.ts only handles single pass)
- ✅ **US-3.7: Confirm Booking** - Confirmation step (step-4.vue) with summary
- ✅ **US-3.8: Prevent Race Conditions** - ✅ **FULLY IMPLEMENTED!** 🎉
  - ✅ `/api/bookings/preserve-slot` POST endpoint creates `RESERVED` booking
  - ✅ `/api/bookings/:id/finalize` POST endpoint transitions `RESERVED` → `WAITING_FOR_PAYMENT`
  - ✅ `cleanUpExpiredReservations()` function auto-cancels expired reservations
  - ✅ `createOrUpdateReservation()` with transaction-based lane availability locking
  - ✅ 5-minute reservation timeout
  - ✅ Wizard refactored: `preserveTimeSlot()` called in step 2-3 `beforeLeave`
  - ✅ Wizard split into 5 step components (step-1.vue - step-5.vue)
  - ✅ Transaction support in `updateLaneAvailability()` prevents race conditions

### Epic 4: Membership Pass Management ✅ COMPLETE

- ✅ **US-4.1: View Active Pass** - Pass details visible on profile page
- ✅ **US-4.2: Admin Grants Pass (MVP)** - ✅ **Admin UI fully implemented!**

### Epic 5 & 6: Phase 2 Features ⏸️ DEFERRED

- ⏸️ Async payment with deadlines (Phase 2)
- ⏸️ Email notifications (Phase 2)

### Epic 7: Admin Dashboard & Core Features 🎯 IN PROGRESS (70% Complete)

- ✅ **US-7.1: Admin Dashboard Overview** - Tile-based dashboard at `/admin` with navigation cards
- 🔍 **US-7.2: User Management List** - ✅ **Page exists** (`/admin/users` with AG Grid), ❌ **NO create/edit forms yet**
- ❌ **US-7.3: Create/Edit User** - NOT IMPLEMENTED (API endpoints and forms missing)
- ✅ **US-7.4: Pass Management List** - ✅ **Fully implemented!** (`/admin/passes` with AG Grid)
  - ✅ AG Grid table with columns: ID, User, Credit Type, Credits Remaining, Expires At, Created At, Actions
  - ✅ Pagination (10/20/50/100 per page)
  - ✅ Sortable, filterable columns
  - ✅ Localized with i18n (en/hu)
  - ✅ Relations: passes include user data
- ✅ **US-7.5: Issue New Pass** - ✅ **Fully implemented!**
  - ✅ "Issue Pass" button opens modal with form (`cs-issue-pass-modal.vue`)
  - ✅ Form fields: User (searchable picker), Credit Type (REGULAR/RENTAL), Credits Total (default 12), Expiry Date (picker, default +60 days)
  - ✅ User picker modal (`cs-select-pass-user-modal.vue`) with search
  - ✅ API: POST `/api/admin/passes` creates pass
  - ✅ Validation: required fields, credit type enum
  - ✅ Auto-refresh table after creation
  - ✅ Soft delete support (`isDeleted` field)
- ✅ **US-7.5b: Edit Pass** - ✅ **Fully implemented!**
  - ✅ Edit action in table rows opens modal (`cs-edit-pass-modal.vue`)
  - ✅ Form fields: User (read-only), Credit Type, Credits Total, Credits Remaining, Expiry Date
  - ✅ API: PUT `/api/admin/passes/:id` updates pass
  - ✅ Validation: all fields required
  - ✅ Auto-refresh table after save
- ✅ **US-7.5c: Delete Pass** - ✅ **Soft delete implemented!**
  - ✅ Delete action in table rows
  - ✅ API: DELETE `/api/admin/passes/:id` sets `isDeleted = 1`
  - ✅ Confirmation dialog before deletion
  - ✅ Auto-refresh table after deletion
  - ✅ Queries filter out deleted passes (`isDeleted = 0`)
- ❌ **US-7.6: Booking Management List** - NOT IMPLEMENTED
- ❌ **US-7.7: Create Booking for User** - NOT IMPLEMENTED
- ❌ **US-7.8: Payment Management List** - NOT IMPLEMENTED
- ❌ **US-7.9: Settings Management** - NOT IMPLEMENTED
- ❌ **US-7.10: Special Hours / Closures** - NOT IMPLEMENTED
- ❌ **US-7.11: System Jobs Overview** - NOT IMPLEMENTED

### Implementation Differences from Original Plan

#### ✅ Good Deviations

1. **Equipment Selection via CreditType** ✅
   - Original: Equipment checkbox affects pricing calculation
   - Implemented: `creditType` enum (REGULAR = own equipment, RENTAL = need equipment)
   - **Why better**: Pass compatibility check is simpler, database normalization improved

2. **Booking Status Flow** ✅
   - Uses `BOOKING_STATUS_RESERVED` → `WAITING_FOR_PAYMENT` → `ACTIVE` flow
   - Clear state transitions, ready for Phase 2 async payment

3. **Wizard Component Architecture** ✅ **NEW**
   - Original: Single monolithic booking.vue component
   - Implemented: 5 separate step components (step-1.vue - step-5.vue)
   - **Why better**: Better separation of concerns, easier to test, more maintainable

4. **Concurrency Handling via Separate Endpoints** ✅ **NEW**
   - Original: Single `/api/bookings` POST endpoint
   - Implemented:
     - `/api/bookings/preserve-slot` POST (creates `RESERVED` booking)
     - `/api/bookings/:id/finalize` POST (transitions to `WAITING_FOR_PAYMENT`)
   - **Why better**: Explicit state transitions, clearer API semantics, easier to reason about

5. **Transaction-based Lane Availability Updates** ✅ **NEW**
   - `updateLaneAvailability()` supports optional transaction parameter
   - Nested transactions in `createOrUpdateReservation()` ensure atomicity
   - **Why better**: Prevents race conditions at database level, guarantees data consistency

6. **Soft Delete for Passes** ✅ **NEW**
   - `isDeleted` field instead of hard delete
   - **Why better**: Preserves audit trail, allows data recovery, safer admin operations

7. **AG Grid for Admin Tables** ✅ **NEW**
   - Original plan: VaDataTable
   - Implemented: AG Grid with Vuestic theme
   - **Why better**: More features (advanced filtering, sorting, pagination), better performance for large datasets

#### 🔍 Missing or Incomplete Features

1. **Split Payment (US-3.6)** ❌ **STILL MISSING**
   - Original plan: Use pass for X lanes, pay for Y lanes
   - Current: Only single pass OR card payment
   - Impact: Users with passes cannot bring guests without separate bookings

2. **Participant Count Input** ❌ **STILL MISSING**
   - Schema field exists (`participantCount`)
   - No UI input in booking wizard
   - Impact: Staff cannot prepare for group size

3. **Full Venue Quick Toggle** ❌ **STILL MISSING**
   - No "Book entire venue" checkbox
   - Users must manually select 5 lanes
   - Minor UX issue

4. **Admin User Management CRUD** ❌ **PARTIAL**
   - List view exists (`/admin/users`)
   - No create/edit forms
   - No API endpoints for POST/PUT/DELETE
   - Impact: Cannot onboard users without OAuth

#### ✅ Recently Resolved Issues (2026-02-20)

1. **Temporary Reservation Logic** ✅ **FIXED!** (was 🔥 HIGH priority)
   - **Previous issue**: `reservedUntil` existed but status was `WAITING_FOR_PAYMENT` instead of `RESERVED`
   - **Solution implemented**:
     - New endpoint: `/api/bookings/preserve-slot` creates `RESERVED` booking
     - New endpoint: `/api/bookings/:id/finalize` transitions to `WAITING_FOR_PAYMENT`
     - `cleanUpExpiredReservations()` function auto-cancels expired bookings
     - `createOrUpdateReservation()` function handles updates vs new reservations
     - Wizard calls `preserveTimeSlot()` in step 2-3 `beforeLeave` hooks
   - **Impact**: Race conditions now properly handled 🎉

2. **Admin Pass Management** ✅ **FIXED!** (was 🔥 HIGH priority)
   - **Previous issue**: No admin UI to grant passes, manual DB inserts required
   - **Solution implemented**:
     - `/admin/passes` page with AG Grid table
     - Forms: `cs-issue-pass-form.vue`, `cs-edit-pass-form.vue`
     - Modals: `cs-issue-pass-modal.vue`, `cs-edit-pass-modal.vue`
     - User picker: `cs-select-pass-user-modal.vue`
     - API endpoints: GET, POST, PUT, DELETE
     - Soft delete support
   - **Impact**: Testing and admin operations much easier now 🎉

#### 📝 Database Schema Notes

- ✅ `isDeleted` field added to `pass` table (soft delete support)
- ✅ `passRelations` defined in Drizzle (pass.user relation)
- ✅ `PreserveSlotSchema` added for reservation creation
- ✅ `FinalizeBookingSchema` added for finalization
- 🔍 `booking.paymentId` referenced in code but not as foreign key in schema (minor issue)
- ⏸️ `coupons` table from original plan not implemented (Phase 2)

---

## Task Breakdown with Priorities

### ✅ Priority 1: Foundation (Week 1) - COMPLETE

**T1.1: Repository Setup** ✅

- ✅ Create new repo: `csodaszarvas-booking`
- ✅ Copy Nuxt 4 boilerplate from main site
- ✅ Setup Vuestic UI with theme config
- ✅ Configure env validation (Zod)
- ✅ Setup ESLint, TypeScript
- ✅ Create Docker configs (dev/test/staging/prod)

**T1.2: Database Setup** ✅

- ✅ Create Turso database instance
- ✅ Setup Drizzle ORM
- ✅ Define schema: users, passes, bookings, payments, lane_availability
- ✅ Generate Zod schemas from Drizzle
- ✅ Create initial migration
- 🔍 Seed dev data (manual DB inserts required for passes)

**T1.3: Authentication Migration** ✅

- ✅ Copy Better Auth config from main site
- ✅ Update `BETTER_AUTH_URL` env var
- ✅ Setup session middleware
- ✅ Create login page (redirect flow)
- ✅ Test Google OAuth flow
- ✅ Add global auth middleware (require login)

### ✅ Priority 2: Core Booking (Week 2-3) - ✅ COMPLETE (with minor gaps)

**T2.1: Landing Page / Dashboard** ✅

- ✅ Create layout with navbar/sidebar
- ✅ Fetch user's upcoming bookings (API)
- ✅ Display bookings list component
- ✅ Add "Book Now" CTA button
- ✅ Empty state design

**T2.2: Booking Wizard - Step 1-2: Lane & Duration Selection** ✅

- ✅ Create wizard layout component (VaStepper)
- ✅ Lane count selector (1-5) - VaRadio in step-1.vue
- ✅ Duration selector: 1h, 2h, 3h - VaRadio in step-1.vue
- ❌ "Full venue" quick toggle - NOT IMPLEMENTED
- ❌ Participant count input - NOT IMPLEMENTED (schema exists)
- ✅ State management (reactive model ref for wizard)
- ✅ Navigation: VaStepper built-in

**T2.3: Booking Wizard - Step 3: Date & Time Selection** ✅

- ✅ API: POST `/api/slots/available` (filters by lanes + duration)
- ✅ Query logic: consecutive slots for multi-hour bookings
- ✅ Calendar component (VaDatePicker with allowed days) in step-2.vue
- ✅ Time slot picker (VaChip list, filtered by selected date)
- ✅ Update when lane count OR duration changed (via `whenever()` watcher)
- 🔍 Pricing estimate not shown in this step (shown in confirmation)

**T2.3b: Temporary Slot Reservation** ✅ **FULLY IMPLEMENTED!**

- ✅ API: POST `/api/bookings/preserve-slot` creates reservation
- ✅ Insert booking with `status = 'reserved'`
- ✅ Set `reservedUntil = now() + 5 minutes`
- ✅ Decrement `lane_availability` via transaction
- ✅ Return reservation ID to client
- ✅ Store reservation in wizard reactive model
- ✅ Wizard calls `preserveTimeSlot()` in step 2-3 `beforeLeave` hooks
- ✅ If user navigates back: keep reservation, update if slot changes
- ✅ Auto-cleanup function: `cleanUpExpiredReservations()`
  - ✅ Finds bookings where `status = 'reserved'` AND `reservedUntil < now()`
  - ✅ Sets status to 'cancelled'
  - ✅ Restores `lane_availability`
  - ✅ Also cleans up expired `WAITING_FOR_PAYMENT` bookings
- ✅ Transaction support prevents race conditions
- ❌ UI countdown timer - NOT IMPLEMENTED (functional without it)

**T2.4: Booking Wizard - Step 6: Payment Method** ✅

- ✅ Fetch user's active pass (via Pinia store)
- ✅ "Use Pass" vs "Pay with Card" buttons in step-5.vue
- ✅ Disable pass option if insufficient credits
- ✅ Show remaining credits
- ✅ Compatible pass filtering (creditType match, expiry, credits)
- ✅ Placeholder for card payment (alert modal)

**T2.5: Booking Wizard - Step 3b: Split Payment** ❌ NOT IMPLEMENTED

- ❌ No UI for partial pass usage
- ❌ Payment API (`payment.post.ts`) only handles single pass (`lanesFromPass`, `lanesFromDeposit` fields exist but not used)
- **BLOCKER**: Cannot bring guests when using pass

**T2.6: Booking Wizard - Step 4-5: Equipment & Confirmation** ✅

- ✅ Equipment selection via `creditType` (step-3.vue)
- ✅ Summary component (step-4.vue) shows date, time, duration, lanes, equipment
- ✅ **Three-step process**:
  1. Steps 2-3: Call `preserveTimeSlot()` in `beforeLeave` → POST `/api/bookings/preserve-slot` (creates `RESERVED`)
  2. Step 4: Call `finalizeBookingDetails()` in `beforeLeave` → POST `/api/bookings/:id/finalize` (transitions to `WAITING_FOR_PAYMENT`)
  3. Step 5: Select pass → POST `/api/bookings/:id/payment` (transitions to `ACTIVE`)
- ✅ Pass credit decrement logic working
- ❌ No participant count in summary (field not collected)
- ✅ Redirect to dashboard after payment

### ✅ Priority 3: Cancellation & Pass View (Week 3) - COMPLETE

**T3.1: Cancellation Logic** ✅

- ✅ API: DELETE `/api/bookings/:id`
  - ✅ Check if >48h or <48h from booking start time
  - ✅ If >48h + pass: refund credits to pass (implemented in `[id].delete.ts`)
  - 🔍 If >48h + deposit: coupon generation NOT IMPLEMENTED (Phase 2)
  - ✅ If <48h: just mark cancelled, no refund
  - ✅ Update lane_availability (restore capacity via `updateLaneAvailability()`)
  - ✅ Update booking status to "cancelled"
- ✅ Cancel button on booking cards (`cs-upcoming-bookings.vue`)
- ✅ Confirmation modals (different messages per scenario)
- 🔍 Contact info for refund requests - NOT SHOWN (Phase 2)

**T3.2: Pass Management View** ✅

- ✅ Integrated into `/profile` page (not separate route)
- ✅ Display pass details (type via `creditType`, expiry, credits remaining)
- ✅ List credit usage - NOT IMPLEMENTED (only shows passes, not history)
- ✅ Empty state if no pass

**T3.3: Profile Page** ✅

- ✅ Page: `/profile`
- ✅ Display user info (name, email, registration date)
- ✅ Pass list integrated
- ✅ Logout button (redirects to `/profile/logout` route)

### 🔍 Priority 4: Polish & Testing (Week 4) - PARTIAL

**T4.1: Error Handling** 🔍

- ✅ Validation errors (422 status with Zod validation in API routes)
- ✅ Network error states (try-catch in components)
- ✅ Toast notifications via VaModal's `confirm()` and `useModal()`
- ✅ 404/403 pages exist with custom designs

**T4.2: Responsive Design** 🔍

- ✅ Mobile layout for wizard (VaStepper vertical mode)
- ✅ Touch-friendly calendar (VaDatePicker native)
- ✅ Navbar → hamburger menu (VaDropdown)
- 🔍 Not extensively tested on all breakpoints

**T4.3: Testing** ❌ NOT DONE

- ❌ Manual testing: full booking flow - NEEDS SYSTEMATIC TESTING
- ❌ Edge cases: simultaneous bookings, expired passes - NOT TESTED
- ❌ Cross-browser testing - NOT DONE
- ❌ Load testing (basic) - NOT DONE

**T4.4: Deployment** 🔍

- ✅ Docker configs exist (docker-compose.yml, Dockerfile)
- 🔍 Actual deployment to test/staging/production - STATUS UNKNOWN
- ❌ Setup reverse proxy subdomain - NOT CONFIRMED
- ❌ Smoke test production build - NOT DONE
- ❌ User acceptance testing - NOT DONE

### ⏸️ Priority 5: Documentation - DEFERRED

**T5.1: User Documentation** ⏸️

- ⏸️ Booking guide (screenshots)
- ⏸️ Cancellation policy
- ⏸️ ToS / ÁSZF
- ⏸️ FAQ

**T5.2: Technical Documentation** 🔍

- ✅ README with setup instructions (basic)
- ❌ API documentation (endpoints) - NOT DOCUMENTED
- ✅ Database schema diagram (via Drizzle schema files)
- ❌ Deployment guide - NOT WRITTEN

---

## Admin Features - NEW SCOPE

### Decision: Admin Panel in Same App (Not Separate)

**Rationale:**

- Testing difficulty: manually creating DB records is cumbersome
- Code reuse: same auth, DB client, utilities
- Deployment simplicity: single container deployment
- Access control: Better Auth admin plugin already integrated

**Scope:**

Admin features will be role-protected routes within this app, accessible only to users with `role = "admin"`.

### Epic 7: Admin Dashboard & Core Features

**US-7.1: Admin Dashboard Overview**

```
AS AN ADMIN
I WANT a dashboard with tiles for main admin functions
SO THAT I can quickly navigate to different management areas
```

**Acceptance Criteria:**

- Route: `/admin` (protected by `admin-logged-in` middleware)
- Card/tile layout with icons and labels
- Links to:
  - User management
  - Pass management
  - Booking management
  - Payment management
  - Settings
  - System jobs (cron/background tasks)
- Responsive grid layout (2 cols mobile, 3-4 cols desktop)

**US-7.2: User Management List**

```
AS AN ADMIN
I WANT to see a list of all users
SO THAT I can view and manage user accounts
```

**Acceptance Criteria:**

- Route: `/admin/users`
- VaDataTable with columns:
  - Name
  - Email
  - Role (admin/user)
  - Registration date
  - Status (active/inactive)
- Features:
  - Search by name/email
  - Sort by any column
  - Filter by role
  - Pagination (20 per page)
- Actions per row:
  - Edit user (opens modal/form)
  - View bookings (navigate to bookings filtered by user)
  - View passes (navigate to passes filtered by user)

**US-7.3: Create/Edit User**

```
AS AN ADMIN
I WANT to manually create or edit user accounts
SO THAT I can onboard users without requiring OAuth
```

**Acceptance Criteria:**

- Modal form (triggered from "Add User" button or row edit action)
- Fields:
  - Name (required)
  - Email (required, validated)
  - Role (dropdown: user/admin)
- Validation:
  - Email uniqueness check (server-side)
  - Name min 2 characters
- On save:
  - If new user: insert into `user` table
  - If edit: update existing record
- Toast notification on success/error
- Table refreshes after save

**US-7.4: Pass Management List**

```
AS AN ADMIN
I WANT to see all issued passes
SO THAT I can track membership and credits
```

**Acceptance Criteria:**

- Route: `/admin/passes`
- VaDataTable with columns:
  - User name (with link to user profile)
  - Credit type (REGULAR/RENTAL)
  - Credits total
  - Credits remaining
  - Issue date
  - Expiry date
  - Status (active/expired)
- Features:
  - Search by user name
  - Filter by credit type, status (active/expired)
  - Sort by expiry date, issue date
  - Pagination
- Actions per row:
  - Edit pass (adjust credits, expiry)
  - View related bookings

**US-7.5: Issue New Pass**

```
AS AN ADMIN
I WANT to issue a pass to an existing user
SO THAT they can start making bookings
```

**Acceptance Criteria:**

- "Issue Pass" button opens modal form
- Fields:
  - User (searchable dropdown, required)
  - Credit type (radio: REGULAR/RENTAL)
  - Credits total (number input, default 12)
  - Expiry date (date picker, default: +60 days)
- Server-side logic:
  - Insert into `pass` table
  - Set `creditsRemaining = creditsTotal`
  - Set `createdAt`, `updatedAt`
- Toast notification on success
- Passes table refreshes

**US-7.6: Booking Management List**

```
AS AN ADMIN
I WANT to see all bookings (past and future)
SO THAT I can monitor range usage and resolve issues
```

**Acceptance Criteria:**

- Route: `/admin/bookings`
- VaDataTable with columns:
  - User name
  - Date & time
  - Duration
  - Lanes booked
  - Equipment needed (yes/no)
  - Status (reserved/waiting_for_payment/confirmed/cancelled)
  - Payment status (from related payment record)
- Features:
  - Search by user name
  - Filter by:
    - Date range (from-to)
    - Status
    - Equipment needed
  - Sort by date, user, status
  - Pagination
- Actions per row:
  - View details (modal with full booking info + payment)
  - Cancel booking (admin override, refunds if applicable)
  - Edit booking (change date/time/lanes - advanced feature, Phase 2)

**US-7.7: Create Booking for User (Admin-Initiated)**

```
AS AN ADMIN
I WANT to manually create a booking for a user
SO THAT I can handle phone/in-person reservations
```

**Acceptance Criteria:**

- "Create Booking" button opens multi-step modal/form
- Steps:
  1. Select user (searchable dropdown)
  2. Select lanes, duration, equipment (same logic as user wizard)
  3. Select date & time (same availability API)
  4. Payment method:
     - Use user's pass (if available)
     - Mark as "paid in person" (cash/card on-site)
     - Send payment request (Phase 2 - async payment with 24h deadline)
- Creates booking with appropriate status:
  - If paid in person: status = `ACTIVE`, create payment record
  - If using pass: same flow as user booking
  - If payment request: status = `WAITING_FOR_PAYMENT`, deadline = +24h
- Lane availability decremented immediately
- Toast notification on success

**US-7.8: Payment Management List**

```
AS AN ADMIN
I WANT to see all payment records
SO THAT I can track revenue and reconcile accounts
```

**Acceptance Criteria:**

- Route: `/admin/payments`
- VaDataTable with columns:
  - User name
  - Booking date & time (linked)
  - Pass used (if applicable)
  - Lanes from pass
  - Lanes from deposit
  - Deposit amount (HUF)
  - Payment status (paid/pending/refunded)
  - Payment date
- Features:
  - Search by user name
  - Filter by:
    - Payment status
    - Payment method (pass/deposit)
    - Date range
  - Sort by payment date, amount
  - Pagination
- Export to CSV (future enhancement)

**US-7.9: Settings Management**

```
AS AN ADMIN
I WANT to configure basic system settings
SO THAT I can adjust operational parameters without code changes
```

**Acceptance Criteria:**

- Route: `/admin/settings`
- Form with sections:
  - **Operating Hours**:
    - Default opening time (time picker)
    - Default closing time (time picker)
    - Days of week toggles (Mon-Sun)
  - **Booking Rules**:
    - Max advance booking days (number input, default 60)
    - Max booking duration hours (number input, default 3)
    - Cancellation grace period hours (number input, default 48)
  - **Pricing** (Phase 2, read-only for MVP):
    - Regular rate (HUF/hour/lane)
    - Rental rate (HUF/hour/lane)
  - **Pass Defaults**:
    - Standard pass credits (default 12)
    - Pass expiry days (default 60)
- Settings stored in new `settings` table (key-value or JSON column)
- Save button with validation
- Toast notification on save
- **Phase 2**: Settings applied dynamically (currently hardcoded in constants.ts)

**US-7.10: Special Hours / Closures**

```
AS AN ADMIN
I WANT to override normal operating hours for specific dates
SO THAT I can handle holidays, special events, or maintenance
```

**Acceptance Criteria:**

- Route: `/admin/special-hours`
- List of special hour records (VaDataTable):
  - Date
  - Type (opened/closed/custom)
  - Custom hours (if type = custom)
  - Reason/note
- Actions:
  - Add special hours (button → modal form)
  - Edit existing entry
  - Delete entry
- **Add/Edit Form**:
  - Date (date picker, required)
  - Type (radio: Closed / Custom Hours)
  - If Custom Hours:
    - Opening time (time picker)
    - Closing time (time picker)
  - Reason (text input, optional)
- **Server-side logic**:
  - Store in new `special_hours` table
  - When generating `lane_availability` slots:
    - Check if date has special hours override
    - If closed: don't generate slots (or mark `isOpen = false`)
    - If custom: adjust slot times accordingly
- **Availability API impact**:
  - Filter slots based on special hours table
  - Show "Closed" message on date picker for closed dates

**US-7.11: System Jobs Overview**

```
AS AN ADMIN
I WANT to see background jobs and their status
SO THAT I can monitor system health and troubleshoot issues
```

**Acceptance Criteria:**

- Route: `/admin/jobs`
- List of configured background jobs (read-only for MVP):
  - **Slot Generator**: Creates `lane_availability` records X days ahead
    - Last run timestamp
    - Next scheduled run
    - Status (success/failed)
  - **Reservation Cleanup**: Expires old reserved bookings
    - Last run timestamp
    - Records cleaned (count)
  - **Payment Deadline Checker**: Cancels unpaid bookings past deadline (Phase 2)
- **Manual Trigger Buttons** (future):
  - "Run Slot Generator Now"
  - "Run Cleanup Now"
- Job logs table (last 50 entries):
  - Job name
  - Run timestamp
  - Status
  - Message (e.g., "Generated 168 slots for 7 days")

---

### Epic 8: Admin Data Tables - Shared Features

**Cross-Cutting Requirements for All Admin Tables:**

- Consistent VaDataTable styling (matches Vuestic theme)
- Sticky header on scroll
- Responsive: stacked cards on mobile, table on desktop
- Loading states (skeleton or spinner)
- Empty states with helpful messages
- Error states with retry button
- Keyboard navigation support (accessibility)
- Action buttons:
  - Icon-only on mobile
  - Icon + label on desktop
- Confirmation modals for destructive actions
- Optimistic UI updates (client-side update, then refresh on error)

**Shared Components to Create:**

- `AdminDataTable.vue` - Wrapper around VaDataTable with common features
- `AdminPageHeader.vue` - Title + primary action button layout
- `AdminStatsCards.vue` - Dashboard stat cards (e.g., "Total Users: 42")
- `AdminUserPicker.vue` - User search/select dropdown (reused in multiple forms)

---

### Database Schema Updates for Admin Features

**New Tables:**

```sql
settings:
  id: integer (PK, auto-increment)
  key: text (unique, e.g., "default_opening_time", "max_booking_days")
  value: text (JSON string or plain value)
  updated_at: integer
  updated_by: integer (FK -> user.id)

special_hours:
  id: integer (PK, auto-increment)
  date: integer (date timestamp, unique)
  type: text (enum: "closed", "custom")
  opening_time: integer | null (time as seconds since midnight)
  closing_time: integer | null
  reason: text | null
  created_at: integer
  created_by: integer (FK -> user.id)
  updated_at: integer
  updated_by: integer

job_logs:
  id: integer (PK, auto-increment)
  job_name: text (e.g., "slot_generator")
  run_at: integer (timestamp)
  status: text (enum: "success", "failed")
  message: text | null
  records_affected: integer | null
```

**Schema Modifications:**

- Add `updatedBy` to `pass` table (missing in current schema, already used in code)
- Add `paymentId` foreign key to `booking` table (referenced in code but not in schema)

---

### Admin Feature Task Breakdown

### 🎯 Priority 6: Admin Core (Week 5-6) - 🎯 70% COMPLETE

**T6.1: Admin Dashboard Layout** ✅ **COMPLETE**

- ✅ Create `/admin` index page with tile grid
- ✅ Implement navigation tiles (users, passes)
- ❌ Add basic stats cards (total users, active passes, upcoming bookings) - DEFERRED
- ✅ Responsive grid layout (VaCard grid)
- ✅ Icons for tiles (Tabler icons via Iconify)

**T6.2: User Management** 🔍 **PARTIAL (40%)**

- ✅ Create `/admin/users` page with AG Grid
- ✅ API: GET `/api/admin/users` (list all users)
- ❌ API: POST `/api/admin/users` (create user) - NOT IMPLEMENTED
- ❌ API: PATCH `/api/admin/users/:id` (edit user) - NOT IMPLEMENTED
- ✅ Implement search, sort, filter functionality (AG Grid built-in)
- ❌ Create user form modal (create/edit) - NOT IMPLEMENTED
- ❌ Form validation (email uniqueness, role enum) - NOT IMPLEMENTED
- ❌ Row actions: edit, view bookings, view passes - PARTIALLY (only view implemented)

**T6.3: Pass Management** ✅ **COMPLETE** 🎉

- ✅ Create `/admin/passes` page with AG Grid
- ✅ API: GET `/api/admin/passes` (list all passes with user info)
- ✅ API: POST `/api/admin/passes` (issue new pass)
- ✅ API: PUT `/api/admin/passes/:id` (edit credits, expiry)
- ✅ API: DELETE `/api/admin/passes/:id` (soft delete)
- ✅ Implement user picker component (searchable dropdown)
  - ✅ `cs-select-pass-user-modal.vue` with user search
- ✅ Issue pass modal form
  - ✅ `cs-issue-pass-modal.vue`
  - ✅ `cs-issue-pass-form.vue`
  - ✅ Fields: User, Credit Type, Credits Total, Expiry Date
  - ✅ Validation: all required fields
  - ✅ Default values: 12 credits, +60 days expiry
- ✅ Edit pass modal form
  - ✅ `cs-edit-pass-modal.vue`
  - ✅ `cs-edit-pass-form.vue`
  - ✅ Fields: User (read-only), Credit Type, Credits Total, Credits Remaining, Expiry Date
  - ✅ Validation: all required fields
- ✅ Filter by credit type, status (AG Grid built-in)
- ✅ Row actions: edit, delete (via `cs-pass-actions-cell.vue`)
- ✅ Soft delete implementation (`isDeleted` field)
- ✅ Drizzle relations: `pass.user` with user data
- ✅ i18n: translations for en/hu
- ✅ Pinia store: `useAdminPassesStore()`
- ✅ AG Grid localization with custom locale text
- ✅ Date formatters for createdAt, expiresAt
- ✅ Pagination: 10/20/50/100 per page

**T6.4: Booking Management** ❌ NOT STARTED

- ❌ Create `/admin/bookings` page with AG Grid
- ❌ API: GET `/api/admin/bookings` (list all bookings with filters)
- ❌ API: POST `/api/admin/bookings` (admin-created booking)
- ❌ API: DELETE `/api/admin/bookings/:id` (admin cancel booking)
- ❌ Date range filter component
- ❌ Status filter (multi-select)
- ❌ Create booking wizard modal (simplified version of user wizard)
- ❌ Row actions: view details, cancel

**T6.5: Payment Management** ❌ NOT STARTED

- ❌ Create `/admin/payments` page with AG Grid
- ❌ API: GET `/api/admin/payments` (list all payments with filters)
- ❌ Payment status badge styling (color-coded)
- ❌ Filter by payment status, method, date range
- ❌ Export to CSV (future enhancement - skip for MVP)

**T6.6: Settings Management** ❌ NOT STARTED

- ❌ Create `settings` DB table + schema
- ❌ Create `/admin/settings` page with form sections
- ❌ API: GET `/api/admin/settings` (fetch all settings)
- ❌ API: PATCH `/api/admin/settings` (update settings)
- ❌ Operating hours time pickers
- ❌ Days of week toggles
- ❌ Booking rules number inputs
- ❌ Save validation (e.g., opening < closing time)
- ❌ Toast notifications on save

**T6.7: Special Hours / Closures** ❌ NOT STARTED

- ❌ Create `special_hours` DB table + schema
- ❌ Create `/admin/special-hours` page with AG Grid
- ❌ API: GET `/api/admin/special-hours` (list overrides)
- ❌ API: POST `/api/admin/special-hours` (add override)
- ❌ API: PATCH `/api/admin/special-hours/:id` (edit)
- ❌ API: DELETE `/api/admin/special-hours/:id` (remove)
- ❌ Special hours form modal (date, type, times, reason)
- ❌ Update availability API to respect special hours
- ❌ Date picker integration (show closures in user wizard)

**T6.8: System Jobs Overview** ❌ NOT STARTED

- ❌ Create `job_logs` DB table + schema
- ❌ Create `/admin/jobs` page with job list
- ❌ API: GET `/api/admin/jobs/logs` (fetch recent logs)
- ❌ Display last run timestamps, status, message
- ❌ Future: Manual trigger buttons (out of scope for MVP)

**T6.9: Admin Shared Components** 🔍 **PARTIAL**

- ❌ Create `AdminDataTable.vue` wrapper component - NOT NEEDED (using AG Grid directly)
- ❌ Create `AdminPageHeader.vue` (title + action button) - NOT NEEDED (using CsArrowSeparator)
- ✅ Create `AdminUserPicker.vue` (user search dropdown) - ✅ **DONE** (`cs-select-pass-user-modal.vue`)
- ❌ Create `AdminStatsCards.vue` (dashboard stats) - NOT IMPLEMENTED
- ✅ Consistent styling and theme application (AG Grid Vuestic theme)

**T6.10: Admin API Security** ✅ **COMPLETE**

- ✅ `defineAdminAuthenticatedEventHandler()` utility exists and used
- ✅ All admin API routes protected with admin role check
- ✅ Server-side validation for admin routes
- ✅ Unauthorized access returns 403 responses

---

## Decisions Made ✅

1. **Time slot granularity**: ✅ Full hour slots (10:00-11:00, 11:00-12:00, etc.). Multi-hour bookings span consecutive slots (10:00-12:00 = 2 hours). **IMPLEMENTED**

2. **Pass types**: ✅
   - **Standard**: 12 credits (purchasable in Phase 2)
   - **Unlimited**: For insiders only (not purchasable via app, admin grants)
   - **Custom**: Ad-hoc amounts (e.g., 36 credits), admin-granted
   - **1 credit = 1 hour on 1 lane**
   - **IMPLEMENTED via `creditType` enum and `creditsTotal`/`creditsRemaining` fields**

3. **Pricing**: ✅
   - Own equipment: **3,500 HUF/hour/lane**
   - With equipment rental: **5,000 HUF/hour/lane**
   - Linear scaling: 2 lanes × 2 hours = 4× base price (no discounts)
   - **IMPLEMENTED via `creditType` (REGULAR vs RENTAL)**

4. **Equipment rental**: ✅ **IMPLEMENTED IN MVP** - Critical feature, step 4 in wizard

5. **Booking duration**: ✅ User selectable 1-3 hours, configurable max. **IMPLEMENTED in step 2**

6. **Max advance booking**: ✅ **60 days** ahead (to be configurable via admin settings in Epic 7)

7. **Pass/Coupon expiry**: ✅
   - Passes: **2 months** from issue date (extendable by admin)
   - **IMPLEMENTED** (checked in queries: `expiresAt > Date.now()`)
   - Coupons: Same expiry logic (Phase 2 - not yet implemented)

8. **Lane assignment**: ✅
   - **Capacity-only tracking** - IMPLEMENTED
   - System reserves "N lanes available" count in `lane_availability` table
   - Physical differences (lane length, equipment) irrelevant to users
   - Range officer assigns actual lanes on-site

9. **Admin override**: ✅ Admin can cancel/modify/overbook (Epic 7 in progress)

10. **Waiting list**: ✅ **No waiting list**. Admin can overbook if needed (admin app feature).

11. **Multi-hour pass credits**: ✅ **Linear consumption** - IMPLEMENTED
    - 2 hours × 1 lane = 2 credits
    - 2 hours × 2 lanes = 4 credits
    - Formula: `credits = lanes × hours` (implemented in `payment.post.ts`)

12. **Full venue pricing**: ✅
    - **No special discount** for 5-lane bookings (for now)
    - 5 lanes × N hours = 5N × base price
    - May add discounts/packages later (Phase 2 business decision)
    - Users CAN book all 5 lanes via app
    - 🔍 **Future**: Quick "Full Venue" toggle (not yet implemented)

13. **Participant count tracking**: ✅
    - **Store participant count** for multi-lane bookings (optional field)
    - **SCHEMA IMPLEMENTED** (`booking.participantCount`)
    - ❌ **UI NOT IMPLEMENTED** (manual testing shows field unused)
    - Used for operational planning (extra equipment, staff)
    - Relevant for events (10+ people on 5 lanes)
    - Not enforced, informational only

14. **Admin panel location**: ✅ **IN SAME APP** (ADR-001)
    - Originally planned as separate app
    - **DECISION (2026-02-15)**: Integrate into main app with role-based routes
    - Reason: Easier testing, code reuse, simpler deployment

15. **Equipment selection model**: ✅ **Via CreditType enum** (ADR-002)
    - Originally: boolean flag `equipmentNeeded`
    - **IMPLEMENTED**: `creditType = "regular" | "regular_with_rental"`
    - Benefit: Pass compatibility check simplified

16. **Booking status flow**: 🔍 **NEEDS REVIEW** (ADR-003)
    - Current: Booking created with `WAITING_FOR_PAYMENT` status
    - Original plan: `RESERVED` → `ACTIVE` (after payment)
    - **ISSUE**: Temporary reservation logic unclear, race conditions possible
    - **ACTION NEEDED**: Refactor to proper `RESERVED` → `WAITING_FOR_PAYMENT` → `ACTIVE` flow

---

## Open Questions ✅ ALL RESOLVED

**None at this time.** All core decisions finalized for MVP and admin features documented above.

### Recently Resolved (2026-02-15)

- ✅ **Admin panel scope**: In same app, not separate
  **Decision**: Role-protected routes within main app

- ✅ **Admin features priority**: High priority to enable testing
  **Decision**: Epic 7 added, target weeks 5-6

- ✅ **Special hours management**: Needed for holidays/events
  **Decision**: US-7.10 added with `special_hours` table

### Deferred to Phase 2 (Documented, Not Blocking)

- Async payment flow details (Salonic-style 2-3h user, 24h admin deadlines)
- Email notification templates and triggers
- Payment provider choice (Simple vs Stripe)
- Coupon design and redemption flow
- CSV export formats for admin reports

---

## Success Metrics

**Business Goals:**

- Reduce phone call volume for bookings by 80%
- Increase multi-lane bookings by 50%
- Improve booking completion rate (reduce drop-offs)
- Eliminate Salonic subscription cost

**Technical Goals:**

- <2s page load time
- 99.5% uptime
- Zero double-booking incidents
- <24h bug resolution time

---

## Critical Issues to Address (Technical Debt)

### ✅ RESOLVED RECENTLY (2026-02-20)

1. **✅ Temporary Reservation Logic Gap** - **FIXED!**
   - **Previous issue**: Race conditions possible (two users booking same slot simultaneously)
   - **Solution**:
     - Separate preserve-slot and finalize endpoints
     - Proper `RESERVED` → `WAITING_FOR_PAYMENT` state transitions
     - Transaction-based lane availability updates
     - Auto-cleanup of expired reservations
   - **Status**: ✅ Fully implemented and working

2. **✅ Admin Pass Management Missing** - **FIXED!**
   - **Previous issue**: No UI to create passes, manual DB setup required
   - **Solution**: Complete admin UI with forms, modals, API endpoints
   - **Status**: ✅ Fully functional

### 🔥 HIGH PRIORITY (Still Remaining)

3. **Split Payment NOT Implemented** ❌
   - **Issue**: Cannot use pass for some lanes and pay for others
   - **Business impact**: Pass holders cannot bring guests easily
   - **Fix**: Implement `lanesFromPass` and `lanesFromDeposit` logic in wizard + API
   - **Estimated effort**: 8-10 hours

### ⚠️ MEDIUM PRIORITY

4. **Participant Count Field Unused** ❌
   - **Issue**: Schema field exists, no UI input
   - **Impact**: Staff cannot prepare adequately for groups
   - **Fix**: Add optional number input in wizard (step 1, conditional on lanes ≥ 2)
   - **Estimated effort**: 2-3 hours

5. **Admin User Management CRUD Missing** ❌
   - **Issue**: Can only view users, cannot create/edit without OAuth
   - **Impact**: Limited admin capabilities for user onboarding
   - **Fix**: Implement forms + API endpoints (similar to passes management)
   - **Estimated effort**: 6-8 hours

### 📋 LOW PRIORITY (Nice to Have)

6. **Full Venue Quick Toggle** ❌
   - Missing "Book entire venue" checkbox
   - Easy workaround: select 5 lanes manually
   - **Estimated effort**: 1-2 hours

7. **Pass Usage History** ❌
   - Profile shows passes but not booking history using those passes
   - Would help users track their credit consumption
   - **Estimated effort**: 3-4 hours

8. **Missing updatedBy in Some Schemas** 🔍
   - Used in queries but not defined in all table schemas
   - Minor type safety issue
   - **Estimated effort**: 1 hour + migration

---

## Next Steps (Updated 2026-02-20)

### Recently Completed (Week 5)

1. **✅ Review & Update Planning Document**
   - ✅ Compare implementation vs original plan
   - ✅ Mark completed tasks
   - ✅ Document deviations
   - ✅ Add admin feature requirements

2. **✅ Fix Critical Issue: Temporary Reservation Logic** - **COMPLETE!**
   - ✅ Refactored booking flow with `RESERVED` status
   - ✅ Separate preserve-slot and finalize endpoints
   - ✅ Transaction-based lane availability updates
   - ✅ Auto-cleanup of expired reservations
   - ✅ Wizard split into 5 step components
   - **Was BLOCKER for production launch - NOW RESOLVED**

3. **✅ Implement Admin Pass Management (Epic 7, US-7.4, US-7.5)** - **COMPLETE!**
   - ✅ Created `/admin/passes` page with AG Grid
   - ✅ Issue pass form modal with user picker
   - ✅ Edit pass form modal
   - ✅ API endpoints for admin pass CRUD (GET, POST, PUT, DELETE)
   - ✅ Soft delete implementation
   - **Was BLOCKER for testing without DB access - NOW RESOLVED**

### Immediate Priorities (Week 6)

4. **🎯 Admin User Management (Epic 7, US-7.2, US-7.3)**
   - Create user create/edit forms
   - API: POST `/api/admin/users` (create user)
   - API: PATCH `/api/admin/users/:id` (edit user)
   - **ENABLES easier test account creation**

### Short-Term Goals (Week 6-7)

5. **Fix Medium Priority Issues**
   - Implement participant count input
   - Add background job for reservation cleanup
   - Fix schema inconsistencies (`updatedBy`, `paymentId` FK)

6. **Complete Admin Dashboard (Epic 7)**
   - Admin index with navigation tiles
   - Booking management page
   - Payment management page
   - Settings page (basic version)

7. **Testing & QA**
   - Manual test all booking flows (own equipment + rental)
   - Test cancellation scenarios (>48h, <48h, pass vs deposit)
   - Test admin CRUD operations
   - Cross-browser testing
   - Mobile responsiveness check

### Medium-Term Goals (Month 2)

8. **Implement Split Payment (Epic 3, US-3.6)**
   - Design UI flow (slider or stepper)
   - Update payment API to handle mixed payment
   - Test with edge cases (partial pass credits)

9. **Special Hours Management (Epic 7, US-7.10)**
   - Implement special hours table + API
   - Admin UI for closures/overrides
   - Integrate with availability filtering
   - Test with holiday scenarios

10. **System Jobs & Monitoring (Epic 7, US-7.11)**
    - Implement slot generator cron job
    - Create job logs tracking
    - Admin UI to view job status
    - Manual trigger buttons (optional)

### Long-Term Goals (Phase 2)

11. **Async Payment with Deadlines (Epic 5)**
    - Implement pending payment flow
    - Email notifications (reminders, confirmations)
    - Auto-cancellation for unpaid bookings
    - Integration with payment provider (Simple/Stripe)

12. **Coupon System**
    - Implement coupons table + schema
    - Coupon generation for deposit refunds
    - Coupon redemption in payment flow
    - Admin coupon management

13. **Advanced Features**
    - Recurring bookings (weekly training)
    - Group booking invites
    - Equipment preference tracking
    - Export reports (CSV, PDF)
    - Email notifications for bookings

---

## Recommended Development Order (Next 2 Weeks)

**Week 5 Focus: Admin MVP + Critical Fixes** - ✅ **MOSTLY COMPLETE**

| Priority | Task                            | Est. Hours | Status       | Blocker? |
| -------- | ------------------------------- | ---------- | ------------ | -------- |
| 🔥       | Fix temporary reservation logic | 6          | ✅ COMPLETE  | YES      |
| 🔥       | Admin pass management UI        | 8          | ✅ COMPLETE  | YES      |
| 🔥       | Admin user management UI        | 6          | 🔍 PARTIAL   | NO       |
| ⚠️       | Admin dashboard layout          | 4          | ✅ COMPLETE  | NO       |
| ⚠️       | Background cleanup job          | 6          | ❌ DEFERRED  | PARTIAL  |
| 📋       | Add participant count input     | 3          | ❌ TODO      | NO       |
| 📋       | Schema fixes (updatedBy, FK)    | 2          | ❌ TODO      | NO       |
|          | **Total**                       | **35h**    | **22h done** |          |

**Week 6 Focus: Admin Features + Testing**

| Priority | Task                        | Est. Hours | Blocker? |
| -------- | --------------------------- | ---------- | -------- |
| 🎯       | Admin booking management UI | 8          | NO       |
| 🎯       | Admin payment management UI | 6          | NO       |
| 🎯       | Admin settings page         | 6          | NO       |
| ⚠️       | Manual testing (full suite) | 6          | NO       |
| ⚠️       | Fix bugs found in testing   | 8          | YES      |
| 📋       | Responsive testing          | 4          | NO       |
| 📋       | Documentation updates       | 4          | NO       |
|          | **Total**                   | **42h**    |          |

**AFTER Week 6: Ready for beta testing with admin tools**

---

## Architecture Decisions Log

### ADR-001: Admin Panel in Same App (Not Separate) ✅

**Date**: 2026-02-15
**Status**: Accepted
**Context**: Initially planned separate admin app, but testing difficulties arose.
**Decision**: Integrate admin features into main app with role-based access.
**Consequences**:

- ✅ Easier testing (no manual DB inserts needed)
- ✅ Code reuse (auth, DB, utilities)
- ✅ Simpler deployment (single container)
- ⚠️ Larger app bundle (mitigated by route-level code splitting)
- ⚠️ Must ensure strong role-based access control

### ADR-002: Equipment Selection via CreditType Enum ✅

**Date**: 2026-02-XX (during implementation)
**Status**: Accepted
**Context**: Original plan had equipment as boolean flag affecting price calculation.
**Decision**: Model equipment choice as `creditType` enum (REGULAR vs RENTAL).
**Consequences**:

- ✅ Pass compatibility check simplified (pass.creditType === booking.creditType)
- ✅ Database normalization improved
- ✅ Future-proof for additional equipment tiers
- ⚠️ Pricing logic must derive from creditType (not explicit boolean)

### ADR-003: Booking Status Flow with Reservation State ✅

**Date**: 2026-02-20 (updated from original)
**Status**: Accepted & Implemented
**Context**: Race conditions possible when multiple users book same slot simultaneously.
**Decision**: Use three-state flow: `RESERVED` → `WAITING_FOR_PAYMENT` → `ACTIVE`
**Implementation**:

- `/api/bookings/preserve-slot` POST creates `RESERVED` booking (5-minute timeout)
- `/api/bookings/:id/finalize` POST transitions to `WAITING_FOR_PAYMENT`
- `/api/bookings/:id/payment` POST transitions to `ACTIVE`
- `cleanUpExpiredReservations()` auto-cancels expired bookings
  **Consequences**:

- ✅ Prevents race conditions at application level
- ✅ Aligns with Phase 2 async payment design
- ✅ Clear state transitions with explicit endpoints
- ✅ Graceful handling of abandoned bookings
- ⚠️ Requires background cleanup job (or cleanup on each request)

### ADR-004: No Email Notifications in MVP 🔍

**Date**: 2026-02-XX
**Status**: Accepted
**Context**: Email integration adds complexity.
**Decision**: Defer all email notifications to Phase 2.
**Consequences**:

- ✅ Faster MVP delivery
- ❌ Users have no booking confirmation receipt
- ❌ No payment reminders (when async payment added)
- ⚠️ Must implement before full production launch

### ADR-005: Transaction-Based Lane Availability Updates ✅

**Date**: 2026-02-20
**Status**: Accepted & Implemented
**Context**: Race conditions at database level when updating lane counts.
**Decision**: Use Drizzle transaction parameter in `updateLaneAvailability()` for nested transactions.
**Implementation**:

- `updateLaneAvailability()` accepts optional `tx` parameter
- `createOrUpdateReservation()` wraps updates in transaction
- Rollback if lane count becomes invalid (< 0 or > MAX_LANES)
  **Consequences**:

- ✅ Prevents race conditions at database level
- ✅ Guarantees data consistency
- ✅ Atomic operations for complex updates
- ⚠️ Requires careful transaction management in calling code
- ⚠️ Potential performance impact on high-concurrency scenarios (acceptable for current scale)

### ADR-006: Wizard Split into Step Components ✅

**Date**: 2026-02-20
**Status**: Accepted & Implemented
**Context**: Monolithic booking.vue became hard to maintain and test.
**Decision**: Split wizard into 5 separate step components (step-1.vue through step-5.vue).
**Implementation**:

- Each step is self-contained component
- Parent component (booking.vue) manages reactive model and navigation
- Steps 2-4 use `beforeLeave` hooks to call preserve/finalize endpoints
  **Consequences**:

- ✅ Better separation of concerns
- ✅ Easier to test individual steps
- ✅ More maintainable codebase
- ✅ Clearer step-specific logic isolation
- ⚠️ Slightly more complex state management (parent handles shared model)

### ADR-007: AG Grid for Admin Tables ✅

**Date**: 2026-02-20
**Status**: Accepted & Implemented
**Context**: VaDataTable insufficient for advanced admin features (filtering, pagination, sorting).
**Decision**: Use AG Grid Community Edition with Vuestic theme integration.
**Implementation**:

- Custom Vuestic theme applied via AG Grid theming
- All admin tables use AG Grid (users, passes, future bookings/payments)
- Column definitions with custom cell renderers (actions, dates)
- Built-in filtering, sorting, pagination
  **Consequences**:

- ✅ Much richer feature set (advanced filtering, column sizing, export options)
- ✅ Better performance for large datasets
- ✅ Professional admin interface
- ✅ Built-in accessibility features
- ⚠️ Larger bundle size (~200KB for AG Grid)
- ⚠️ Learning curve for custom cell renderers
- ⚠️ Some styling customization needed for Vuestic consistency

### ADR-008: Soft Delete for Passes ✅

**Date**: 2026-02-20
**Status**: Accepted & Implemented
**Context**: Hard deletes lose audit trail and risk data integrity issues.
**Decision**: Use `isDeleted` field (0/1) instead of hard delete.
**Implementation**:

- `isDeleted` field added to pass schema (default 0)
- DELETE `/api/admin/passes/:id` sets `isDeleted = 1`
- Queries filter by `isDeleted = 0` by default
  **Consequences**:

- ✅ Preserves audit trail
- ✅ Allows data recovery if needed
- ✅ Safer admin operations (less risk of accidental permanent deletion)
- ✅ Can implement "restore" feature in future
- ⚠️ Queries must remember to filter by `isDeleted = 0`
- ⚠️ Slight performance impact (extra filter condition)
- ⚠️ Database growth over time (mitigated by archival strategy in future)

---

## Success Metrics (Revised)

**MVP Success Criteria (Before Production Launch):**

- ✅ User can complete booking flow end-to-end
- ✅ Admin can issue passes without DB access
- ✅ Zero race condition incidents (reservation logic fully implemented with transaction support)
- ✅ Cancellation logic works correctly (>48h refund tested)
- ❌ Full test suite passed (not yet done)
- ❌ Cross-browser compatibility verified (not yet done)

**Phase 1 Production Goals (Month 1 after launch):**

- Reduce phone call volume for bookings by 60% (target: 80%)
- 100+ bookings processed through app
- Zero double-booking incidents
- < 5% booking abandonment rate (wizard incomplete)
- Admin can manage passes/users without developer help

**Phase 2 Success Metrics (Month 3):**

- Increase multi-lane bookings by 40% (target: 50%)
- Async payment flow working (user & admin-initiated)
- Email notifications sent for all bookings
- Pass purchase flow implemented
- Salonic subscription cancelled (cost savings: ~€50/month)

---

## Notes & Constraints

### Current Status (2026-02-20)

- **Development progress**: ~80% MVP complete ⬆️
- **Estimated completion**: Remaining admin features + optional enhancements = 1-2 weeks
- **Recent milestones completed**: ✅ Race condition handling, ✅ Admin pass management UI
- **Blocker status**: ✅ **All critical blockers resolved!** 🎉
- **Next focus**: Split payment implementation OR admin user management CRUD

### Timeline

- **MVP initial estimate**: ~4 weeks (single developer)
- **Actual progress**: ~4 weeks elapsed, core booking flow + admin pass management working
- **Remaining work**: Admin user CRUD (1 week) + split payment (1 week) + optional features
- **Revised MVP completion**: Week 6-7 (fully functional with admin tools)

### Budget & Infrastructure

- **Hosting**: Self-hosted VPS (minimize SaaS costs)
- **Deployment**: Docker containers (test/staging/production)
- **Database**: Turso (separate instance from main site)
- **Auth**: Better Auth with Google OAuth (shared credentials with main site)
- **Monitoring**: Sentry for error tracking (already configured)
- **Payment**: Deferred to Phase 2 (no payment processor in MVP)

### Maintenance Expectations

- **Low-touch after launch** (goal maintained)
- **Admin UI reduces support burden** (can self-service pass management)
- **Background jobs needed**: Slot generator, reservation cleanup (Epic 7)
- **Monitoring required**: Job logs, error tracking (Sentry)

### Scalability

- **Current customer base**: ~100 users
- **Expected growth**: 2x in first year
- **Concurrent booking scenarios**: Low risk (small user base)
- **Database**: Turso scales well for this workload
- **Code architecture**: Ready for horizontal scaling if needed

### Compliance

- **GDPR**: EU user data protection (Better Auth handles session storage)
- **Hungarian VAT**: Applies to payments (Phase 2 implementation)
- **Data retention**: User data kept indefinitely (no auto-deletion policy yet)
- **Privacy policy**: Needed before production launch (to-do)

### Key Business Context

- **Current solution**: Salonic (monthly subscription ~€50)
  - Async payment model: booking created → payment reminder → deadline → auto-cancel if unpaid
  - User bookings: few hours to pay
  - Admin bookings: 24 hours to pay
  - **We'll replicate this in Phase 2** (Epic 5)
- **Migration strategy**: Run parallel initially, full cutover after user acceptance
- **Primary differentiator**: Multi-lane booking with real availability visibility ✅
- **Secondary differentiator**: Flexible pass credit usage (partial redemption ❌ not yet implemented)
- **Equipment rental**: Critical for casual users (50%+ of bookings need equipment) ✅
- **Insider culture**: Regular members get special treatment (unlimited passes, custom bundles)
- **Physical space**: 5 lanes with varying lengths/equipment - managed on-site by range officer
- **Operating model**: Limited staff hours → self-service booking essential ✅
- **Concurrency**: Low concurrent users (~100 total) → pessimistic locking acceptable (needs fix 🔥)

### Technical Constraints

- **Must reuse existing Better Auth setup** (same Google OAuth project) ✅ Done
- **Must use Vuestic UI** (visual consistency with main website) ✅ Done
- **Deployment**: Same VPS as main site, separate Docker container ✅ Ready
- **Database**: Separate Turso instance (different access patterns than main site) ✅ Done
- **No payment processor initially** (admin grants passes manually for MVP) 🔍 Admin UI in progress
- **Single developer**: Feature prioritization critical, realistic timelines

### Implementation Learnings

**What Worked Well:**

- ✅ Vuestic UI integration: Rapid prototyping, consistent theming
- ✅ Drizzle ORM: Type-safe queries, easy migrations
- ✅ Better Auth: Google OAuth seamless, admin plugin useful
- ✅ Equipment via CreditType: Cleaner than boolean flag, better normalization
- ✅ VaStepper: Linear wizard flow intuitive for users

**Pain Points:**

- ⚠️ Temporary reservation logic: Unclear status transitions, race condition risk
- ⚠️ Admin tooling gap: Manual DB inserts slow down development/testing
- ⚠️ Split payment complexity: Deferred due to time constraints, impacts UX
- ⚠️ Schema evolution: `updatedBy` used in code but not in all schemas
- ⚠️ Testing without emails: Hard to verify booking confirmations

**Architecture Wins:**

- ✅ `defineAuthenticatedEventHandler()`: Clean auth abstraction
- ✅ Pinia stores: Client-side state management works well
- ✅ Nuxt auto-imports: Reduced boilerplate significantly
- ✅ Drizzle-zod integration: Validation schemas from DB schema

**Technical Debt Identified:**

- 🔥 Reservation flow refactoring (HIGH priority)
- 🔥 Background cleanup job (HIGH priority)
- ⚠️ Schema FK inconsistencies (MEDIUM priority)
- ⚠️ Split payment implementation (MEDIUM priority)
- 📋 Participant count UI (LOW priority)

### Future Enhancements (Post-MVP, Post-Admin)

#### Phase 2 Features (Month 2-3)

- **Async payment with deadlines** (inspired by Salonic):
  - Create booking → send payment reminder → deadline → auto-cancel if unpaid
  - Different deadlines: user (2-3h) vs admin (24h) created bookings
  - Email notifications for payment reminders and cancellations
- Simple payment integration for deposits (Simple or Stripe)
- Pass purchase flow (online payment for standard passes)
- Email/SMS notifications (booking confirmations, reminders)
- Coupon management (for deposit refunds)

#### Phase 3 Features (Month 4+)

- Recurring bookings (weekly training sessions)
- Group booking invites (share link with friends)
- Special event packages (birthday parties, team building)
- Loyalty program integration (rewards for frequent users)
- Equipment preference tracking (bow type, draw weight)
- Integration with main website (show booking widget on range page)
- Reservation extension (allow user to extend 10-min lock if needed)
- Advanced reporting (CSV export, revenue analytics)
- Multi-language support expansion (German, Slovak for cross-border users)

---
