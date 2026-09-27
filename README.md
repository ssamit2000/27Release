# ReleaseOps

ReleaseOps is a small internal release readiness tool for engineering, QA, DevOps, and release teams. Create releases, work through a shared eight step checklist, and see readiness status and progress at a glance.

## Stack and architecture

- Next.js App Router, React, TypeScript, and Tailwind CSS
- Next.js route handlers with Zod request validation
- PostgreSQL through Prisma
- Jest and React Testing Library

The browser calls `/api/releases`; route handlers validate inputs and use the release service, while shared domain utilities own checklist definitions, status, and progress rules. Prisma persists each release as one row. Checklist completion is stored as a string array because this MVP has one canonical checklist and no per-step metadata; a relational step model can be introduced if steps later need individual owners, timestamps, or custom workflows.

## Requirements

- Node.js 20 or newer
- PostgreSQL 14 or newer

## Local setup

1. Install dependencies with `npm install`.
2. Create a PostgreSQL database named `releaseops` (or choose another database).
3. Copy `.env.example` to `.env` and set `DATABASE_URL` to the connection string for that database.
4. Run `npm run db:deploy` to apply the checked-in migrations.
5. Start the app with `npm run dev` and open `http://localhost:3000`.

Example local URL:

```text
postgresql://postgres:postgres@localhost:5432/releaseops?schema=public
```

`DATABASE_URL` is the only required environment variable. Keep real credentials in `.env` or your deployment provider's secret settings; `.env` is ignored by Git.

## Project structure

```text
prisma/                 Prisma model and SQL migrations
src/app/                Dashboard, create/detail pages, and route handlers
src/components/         App shell, release forms, dashboard, and detail UI
src/lib/                Prisma client, API helpers, services, validation, domain rules
```

## Database changes

For local schema changes, update `prisma/schema.prisma` and run `npm run db:migrate -- --name describe_change`. This creates and applies a development migration. For production, set `DATABASE_URL` in the deployment environment and run `npm run db:deploy` as a release step. `npm run db:generate` regenerates Prisma Client; it also runs during the production build.

## Development and checks

```bash
npm run dev
npm run test
npm run lint
npm run typecheck
npm run build
```

The tests cover the status/progress rules, input schemas, release collection/item API behavior, and create form validation/navigation. API tests mock persistence so they can run without a live database. `npm run db:studio` opens Prisma Studio for local inspection.

## Production deployment

Deploy the app to Vercel or another Next.js host, provision a PostgreSQL database, and configure `DATABASE_URL` in the host environment. Apply migrations with `npm run db:deploy` before serving new code, then build with `npm run build`. No release data or database credentials are bundled into the client.

## API Endpoints

The application exposes the following REST API endpoints:

| Method | Endpoint            | Description                 |
| ------ | ------------------- | --------------------------- |
| GET    | `/api/releases`     | Retrieve all releases       |
| POST   | `/api/releases`     | Create a new release        |
| GET    | `/api/releases/:id` | Retrieve a specific release |
| PATCH  | `/api/releases/:id` | Update a specific release   |
| DELETE | `/api/releases/:id` | Delete a specific release   |

### Database Schema

The application uses PostgreSQL with Prisma ORM.

#### `Release`

| Field            | Type     | Constraints / Description                                |
| ---------------- | -------- | -------------------------------------------------------- |
| `id`             | String   | Primary key, generated using CUID                        |
| `name`           | String   | Maximum 80 characters                                    |
| `date`           | DateTime | Release date, stored as a database date                  |
| `additionalInfo` | String   | Optional additional information, maximum 2000 characters |
| `completedSteps` | String[] | Array containing completed checklist steps               |
| `createdAt`      | DateTime | Automatically set when the record is created             |
| `updatedAt`      | DateTime | Automatically updated when the record changes            |

### Database Index

The `Release` model has an index on `date` in descending order to support efficient retrieval of recent releases.

```prisma
@@index([date(sort: Desc)])
```

### Database Technology

* **Database:** PostgreSQL
* **ORM:** Prisma
* **Hosting:** Neon PostgreSQL
