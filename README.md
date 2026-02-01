# Mindweal by Pihu Suri

Mental health clinic website with scheduling, authentication, and content management.

**Tagline:** Untangle - Heal - Thrive

## Quick Start

```bash
# Start MySQL database
docker-compose up -d

# Install dependencies and run dev server
bun install
bun run dev      # http://localhost:4242
```

## Tech Stack

- **Framework**: Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **Database**: MySQL 8.0 (Docker), TypeORM
- **Auth**: Better Auth (email/password, Google OAuth)
- **Runtime**: Bun 1.3.6

## Project Structure

```
mindweal/
├── src/                # Application source
│   ├── app/           # Pages and API routes
│   ├── components/    # Reusable components
│   ├── entities/      # TypeORM entities
│   ├── lib/           # Utilities (auth, db, email)
│   └── templates/     # Email templates
├── migrations/        # TypeORM migrations
├── scripts/           # Utility scripts
├── docs/plans/        # Design documents
├── init/              # Database init SQL
└── docker-compose.yml # MySQL container
```

## Environment Setup

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

See `claude.md` for detailed documentation.

## License

Private - Mindweal by Pihu Suri
