# Csodaszarvas Íjászbarlang - AI Agent Guidelines

## Project Overview

Fullstack Nuxt 4 application for an archery association in Hungary, featuring bilingual content (Hungarian/English), Google OAuth authentication, and admin dashboard for notifications.

**Note**: Admin features and authentication will be retired from this repository in the future. Range booking will be a separate application with its own authentication system.

## Tech Stack & Architecture

- **Framework**: Nuxt 4 (Vue 3) with TypeScript
- **Database**: Turso (libSQL/SQLite) with Drizzle ORM
- **Auth**: Better Auth with Google OAuth, admin plugin, and role-based access
- **UI**: Vuestic UI component library with custom theming
- **i18n**: Custom route translations (e.g., `/bejelentkezes` ↔ `/login`)
- **Package Manager**: pnpm (v10.28.2+)
- **Deployment**: Docker with Alpine Linux, multi-environment configs (test/staging/production)
- **Monitoring**: Sentry for error tracking

## Critical Patterns

### Database & Schema

- Auto-incrementing integer IDs (`int().primaryKey({ autoIncrement: true })`)
- Drizzle schemas in `lib/db/schema/` with Zod validation schemas generated via `drizzle-zod`
- Snake case DB columns (`casing: "snake_case"` in both `drizzle.config.ts` and DB connection)
- Timestamps use `Date.now()` (milliseconds since epoch)
- Schema exports: `NotificationSchema` (select), `InsertNotificationSchema` (create), `UpdateNotificationSchema` (update)
- Run migrations: `npx drizzle-kit generate` → `npx drizzle-kit migrate`

### Authentication Architecture

- **Server-side**: `server/middleware/auth.ts` attaches user to `event.context.user` for all requests
- **API routes**: Use `defineAuthenticatedEventHandler()` (from `app/utils/`) to require auth, provides typed `event.context.user`
- **Client-side**: Pinia store `useAuthStore()` with `authClient.useSession()` for reactive session state
- **Admin protection**: Both server middleware AND client route middleware (`app/middleware/route.ts`) check `user.role === "admin"`
- **CSRF**: All mutating Better Auth requests require `csrf-token` header (via `useCsrf()`)
- User type: `UserWithId` extends Better Auth's `User` with integer ID and `role: "admin" | "user"`

### API Route Conventions

- Group related routes in folders with parentheses: `server/api/(notifications)/notifications.get.ts`
- Validate request bodies: `readValidatedBody(event, ZodSchema.safeParse)` → return 422 on validation errors
- Aggregate error messages: `result.error.issues.reduce((acc, issue) => \`${acc};${issue.message}\`, "")`
- Query functions live in `lib/db/queries/` (e.g., `getNotifications()`, `insertNotification()`)
- Auto-set audit fields: `createdBy`, `updatedBy`, `createdAt`, `updatedAt` in query functions, not in handlers

### i18n Implementation

- Translation keys use dot notation: `pages.admin.dashboard.notifications.description`
- Validation messages in schemas reference i18n keys: `"pages.admin.dashboard.notifications.validations.description.min-length"`
- Custom routes defined in `nuxt.config.ts` under `i18n.pages` (e.g., `"profile": { en: "/profile", hu: "/profilom" }`)
- Access in components: `$t('key')` in templates, `useI18n()` in script setup
- Locale-aware content: Use `locale.value` to select between `contentHu`/`contentEn` fields

### Component Patterns

- All components use `<script setup lang="ts">` with TypeScript
- Props: `defineProps<TypeName>()` with local type definitions in component files
- Component prefix: `cs-` (e.g., `cs-navbar.vue`, `cs-sidebar.vue`)
- Nested component folders: `components/navbar/cs-navbar.vue`, `components/(pages)/(notifications)/` for page-specific components
- No `pathPrefix: false` in `nuxt.config.ts` → use full component names without auto-prefixing

### Environment & Configuration

- Env validation: `lib/env.ts` with Zod schema, fails fast on missing vars
- Required vars: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SENTRY_AUTH_TOKEN`, `SENTRY_DSN`
- Docker builds use placeholder env vars (overridden at runtime)
- Import env before config: `import "./lib/env"` at top of `nuxt.config.ts`

### Image Optimization

- Nuxt Image presets: `carousel`, `hero`, `section` (all WebP, quality 85)
- Responsive densities: `[1, 2]` for Retina support
- Custom breakpoints: `xs: 375, sm: 576, md: 768, lg: 1000, xl: 1200, xxl: 1920`

## Development Workflow

### Setup & Running

```bash
pnpm install                    # Install dependencies
pnpm dev                        # Start dev server (port 3000)
pnpm build && pnpm preview      # Production build + preview
```

### Linting

```bash
pnpm lint                       # Check with ESLint (@antfu/eslint-config)
pnpm lint:fix                   # Auto-fix issues
```

### Database Workflow

1. Modify schemas in `lib/db/schema/`
2. Generate migration: `npx drizzle-kit generate`
3. Review SQL in `lib/db/migrations/`
4. Apply: `npx drizzle-kit migrate` (or done automatically on startup)
5. Push to Turso: Ensure env vars point to correct DB instance

### Docker Development

```bash
docker compose up -d            # Local development (port 3003)
docker compose -f docker-compose.test.yml up -d       # Test environment
docker compose -f docker-compose.staging.yml up -d    # Staging
docker compose -f docker-compose.production.yml up -d # Production
```

### Deployment

- VPS deployment with all 3 environments (test/staging/production) running side-by-side as Docker containers
- `scripts/deploy.sh` is invoked by Docker scripts for automated deployment
- Multi-stage Dockerfile: Alpine builder → optimized runtime image
- Native modules rebuilt for Alpine musl during Docker build
- Architecture designed for multiple apps to co-exist on same server

## Key Files Reference

- `lib/auth.ts` - Better Auth configuration with admin plugin
- `lib/db/index.ts` - Drizzle client setup
- `app/utils/define-authenticated-event-handler.ts` - Auth wrapper for API routes
- `server/middleware/auth.ts` - Global session attachment + admin route protection
- `app/middleware/route.ts` - Client-side admin route guard
- `nuxt.config.ts` - Complete app configuration (theming, i18n, image presets)
- `drizzle.config.ts` - Database migration configuration

## Anti-Patterns to Avoid

- ❌ Don't use `process.env` directly - always import from `lib/env.ts`
- ❌ Don't create API handlers without CSRF protection for mutations
- ❌ Don't forget to set `createdBy`/`updatedBy` when inserting/updating records
- ❌ Don't hardcode locale-specific content - use i18n keys
- ❌ Don't bypass authentication checks - use `defineAuthenticatedEventHandler()` or check `event.context.user`
- ❌ Don't create separate validation logic - generate schemas from Drizzle with `drizzle-zod`
