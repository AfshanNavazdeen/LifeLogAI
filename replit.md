# LifeLog AI

## Overview

LifeLog AI is a privacy-focused personal life management application that helps users track and analyze various aspects of their daily lives including receipts, expenses, car data, life events, emotions, medical information, and ideas. The application uses AI-powered insights to automatically categorize entries and provide intelligent analytics about spending patterns, habits, and personal trends.

The system is designed as a Progressive Web App (PWA) with a Material Design-inspired interface, emphasizing trust, clarity, and frictionless data input while maintaining strong privacy principles.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and caching

**UI Component System:**
- Shadcn/ui component library with Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Material Design principles adapted for privacy-focused utility applications
- Theme system supporting light/dark modes via React Context

**Design System:**
- Typography: Inter for UI elements, IBM Plex Mono for data/timestamps
- Spacing based on Tailwind units (2, 4, 6, 8, 12, 16)
- Responsive grid layouts with mobile-first approach
- Custom color system using HSL variables for consistent theming

**PWA Capabilities:**
- Service Worker for offline functionality and asset caching
- Web App Manifest for installability
- Network-first strategy for API requests with cache fallback

### Backend Architecture

**Runtime & Framework:**
- Node.js with Express.js for HTTP server
- TypeScript throughout for type safety
- ESM modules for modern JavaScript features

**API Design:**
- RESTful endpoints organized by resource type
- Session-based authentication via Replit Auth (OpenID Connect)
- Request/response logging middleware for debugging
- JSON request body parsing with raw body preservation for webhooks

**Route Organization:**
- `/api/auth/*` - Authentication and user management
- `/api/entries` - Life log entries (receipts, events, emotions)
- `/api/car` - Vehicle-related data tracking
- `/api/insights` - AI-generated insights
- `/api/medical/*` - Medical contacts, referrals, and follow-ups
- `/api/ideas` - Idea and project management
- `/api/chat` - AI conversational interface

### Data Storage

**Database:**
- PostgreSQL via Neon serverless (configured but not yet provisioned)
- Drizzle ORM for type-safe database queries and migrations
- Connection pooling via `@neondatabase/serverless` with WebSocket support

**Schema Design:**
- `users` - User profiles from Replit Auth
- `sessions` - Server-side session storage (connect-pg-simple)
- `entries` - Generic life log entries with flexible metadata (JSONB)
- `carData` - Vehicle-specific tracking (odometer, fuel costs)
- `insights` - AI-generated insights and recommendations
- `medicalContacts` - Healthcare provider information
- `medicalReferrals` - Medical referrals and appointments
- `followUpTasks` - Action items and reminders
- `ideas` - Ideas and projects with status tracking

**Data Patterns:**
- UUID primary keys for all entities
- Timestamps for created/updated tracking
- Soft deletes via cascade constraints
- JSONB fields for flexible, schema-less metadata
- Array types for tags and attachments

**Follow-up Task Features:**
- triggerDate: Date for the reminder (stored as timestamp)
- triggerTime: Optional time for notification (stored as text HH:mm)
- notificationsEnabled: Toggle for browser notifications (stored as text "true"/"false")
- Browser notifications fire when local date/time threshold is reached
- Timezone handling: Uses local date string comparison (YYYY-MM-DD) to prevent early notifications for users in negative UTC offsets

### Authentication & Authorization

**Authentication Strategy:**
- Auth0 via OpenID Connect (OIDC)
- express-openid-connect middleware for session management
- Supports Google, Facebook, Apple, email/password authentication via Auth0

**Session Management:**
- Auth0-managed sessions with secure cookies
- Session secret from environment variable
- Automatic token refresh

**Authorization Pattern:**
- `isAuthenticated` middleware for protected routes
- User ID extraction from Auth0 claims (req.oidc.user.sub)
- Row-level security through userId foreign keys

**Required Auth0 Configuration:**
- AUTH0_CLIENT_ID - Application Client ID
- AUTH0_CLIENT_SECRET - Application Client Secret
- AUTH0_ISSUER_BASE_URL - Auth0 domain (https://YOUR-TENANT.auth0.com)
- Callback URL: https://YOUR-APP-URL/api/callback
- Logout URL: https://YOUR-APP-URL

### AI Integration

**Service Provider:**
- OpenAI API for AI-powered features
- GPT models for chat interface and insight generation

**AI Capabilities:**
- Automatic entry categorization
- Spending pattern analysis
- Conversational query interface
- Insight generation from user data

## External Dependencies

### Third-Party Services

**Replit Platform Integration:**
- Replit Auth for user authentication (OpenID Connect)
- Replit-specific Vite plugins for development experience
- Environment-based feature detection (`REPL_ID`)

**OpenAI:**
- API key required via `OPENAI_API_KEY` environment variable
- Used for chat interface and AI insights

### Database

**Neon Serverless PostgreSQL:**
- Connection string via `DATABASE_URL` environment variable
- WebSocket-based connections for serverless compatibility
- Drizzle Kit for schema migrations (`drizzle-kit push`)

### UI Component Libraries

**Core Dependencies:**
- `@radix-ui/*` - Accessible, unstyled component primitives (20+ components)
- `cmdk` - Command palette interface
- `recharts` - Chart and data visualization
- `date-fns` - Date formatting and manipulation
- `vaul` - Drawer component primitives
- `embla-carousel-react` - Carousel functionality

### Build & Development Tools

**Vite Plugins:**
- `@vitejs/plugin-react` - React Fast Refresh
- `@replit/vite-plugin-runtime-error-modal` - Enhanced error reporting
- `@replit/vite-plugin-cartographer` - Development tooling
- `@replit/vite-plugin-dev-banner` - Development indicators

### Form & Validation

- `react-hook-form` - Form state management
- `@hookform/resolvers` - Validation resolver integration
- `zod` - Schema validation
- `drizzle-zod` - Automatic Zod schema generation from Drizzle schemas

### Session & Storage

- `express-session` - Session middleware
- `connect-pg-simple` - PostgreSQL session store
- `memoizee` - Function memoization for caching