# Reel Legend Fishing

## Overview

Reel Legend Fishing is a relaxing arcade-style fishing game built as a full-stack web application. Players can explore different fishing locations, catch various fish species, manage their inventory, and progress through levels. The game features a real-time day/night cycle, fish mastery system, equipment upgrades, and an in-game economy.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: React Context API (GameContext) for global game state, TanStack Query for server state
- **Styling**: Tailwind CSS v4 with custom game theme (water, wood, grass, gold colors)
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Animations**: Framer Motion for game animations
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Pattern**: RESTful endpoints under `/api` prefix
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Session Storage**: connect-pg-simple for PostgreSQL-backed sessions

### Data Storage
- **Database**: PostgreSQL (provisioned via Replit)
- **Schema Location**: `shared/schema.ts` - contains users, players, catches, and mastery tables
- **Migrations**: Drizzle Kit with `db:push` command

### Key Design Patterns
1. **Shared Code**: The `shared/` directory contains code used by both frontend and backend (schema, fish data)
2. **Guest Authentication**: Simple guest user system using auto-generated usernames for demo/prototype purposes
3. **Game Time System**: In-game clock runs faster than real time (12x multiplier) with day/night cycles affecting fish availability
4. **Fish Ranking System (C, B, A, S)**: Fish are ranked based on their size percentile - S-rank (95%+) are rare trophy specimens
5. **Mastery System**: Tracks player progress per fish species with star ratings. 5 stars requires catching 10 S-rank specimens
6. **Spawn System**: Uses 1-20 dice roll mechanics where bait match (+5) and time of day (+5 if active) increase catch chances
7. **Realistic Fish Data**: Each species has scientific data including size/weight ranges and sex-based multipliers (males typically larger)
8. **Settings System**: SettingsContext provides multi-language support (PT, EN, ES, JP) with localStorage persistence. All measurements use Brazilian metric system (kg, meters)
9. **Unit Display**: Equipment data internally uses imperial units (lb, ft) but displays are converted to metric (kg, m) for Brazilian users

### Project Structure
```
├── client/           # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── context/     # React context (GameContext)
│   │   ├── pages/       # Route pages
│   │   ├── lib/         # Utilities and fish data
│   │   └── hooks/       # Custom React hooks
├── server/           # Express backend
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API route definitions
│   ├── storage.ts    # Database access layer
│   └── db.ts         # Database connection
├── shared/           # Shared code (schema, fish data)
└── migrations/       # Database migrations
```

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries with `drizzle-zod` for validation

### Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **framer-motion**: Animation library for game effects
- **embla-carousel-react**: Carousel component
- **date-fns**: Date formatting utilities
- **wouter**: Lightweight routing

### UI Framework
- **shadcn/ui**: Component library built on Radix UI primitives
- **Tailwind CSS v4**: Utility-first CSS with custom theme
- **Lucide React**: Icon library

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Error overlay in development
- **@replit/vite-plugin-cartographer**: Development tooling
- **Custom meta-images plugin**: Updates OpenGraph images for Replit deployments

### Build & Development
- **Vite**: Frontend build tool
- **esbuild**: Server bundling for production
- **tsx**: TypeScript execution for development