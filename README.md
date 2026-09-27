# ReleaseOps

ReleaseOps is a small internal release readiness tool for engineering, QA, DevOps, and release teams. Create releases, work through a shared eight-step checklist, and see readiness status and progress at a glance.

## Stack and Architecture

* Next.js App Router, React, TypeScript, and Tailwind CSS
* Next.js route handlers with Zod request validation
* PostgreSQL through Prisma
* Jest and React Testing Library

The browser calls `/api/releases`; route handlers validate inputs and use the release service, while shared domain utilities own checklist definitions, status, and progress rules. Prisma persists each release as one row.

Checklist completion is stored as a string array because this MVP has one canonical checklist and no per-step metadata. A relational step model can be introduced if steps later need individual owners, timestamps, or custom workflows.

## Requirements

* Node.js 20 or newer
* PostgreSQL 14 or newer

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a PostgreSQL database named `releaseops` or choose another database.

3. Copy `.env.example` to `.env` and set `DATABASE_URL` to the connection string for that database.

4. Run the checked-in migrations:

```bash
npm run db:deploy
```

5. Start the application:

```bash
npm run dev
```

Open `http://localhost:3000`.

Example local database URL:

```text
postgresql://postgres:postgres@localhost:5432/releaseops?schema=public
```

`DATABASE_URL` is the only required environment variable. Keep real credentials in `.env` or your deployment provider's secret settings. `.env` is ignored by Git.

## Project Structure

```text
prisma/                 Prisma model and SQL migrations
src/app/                Dashboard, create/detail pages, and route handlers
src/components/         App shell, release forms, dashboard, and detail UI
src/lib/                Prisma client, API helpers, services, validation, and domain rules
```

## Database Changes

For local schema changes, update `prisma/schema.prisma` and run:

```bash
npm run db:migrate -- --name describe_change
```

This creates and applies a development migration.

For production, set `DATABASE_URL` in the deployment environment and run:

```bash
npm run db:deploy
```

`npm run db:generate` regenerates Prisma Client and also runs during the production build.

## Development and Checks

```bash
npm run dev
npm run test
npm run lint
npm run typecheck
npm run build
```

The tests cover:

* Status and progress rules
* Input schemas
* Release collection API behavior
* Release item API behavior
* Create form validation and navigation

API tests mock persistence so they can run without a live database.

To inspect the local database with Prisma Studio:

```bash
npm run db:studio
```

## API Endpoints

The application exposes the following REST API endpoints:

| Method | Endpoint            | Description                 |
| ------ | ------------------- | --------------------------- |
| GET    | `/api/releases`     | Retrieve all releases       |
| POST   | `/api/releases`     | Create a new release        |
| GET    | `/api/releases/:id` | Retrieve a specific release |
| PATCH  | `/api/releases/:id` | Update a specific release   |
| DELETE | `/api/releases/:id` | Delete a specific release   |

## Database Schema

The application uses PostgreSQL with Prisma ORM.

### `Release`

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

## Stress Testing

A k6 load test was performed against the deployed Vercel application using the `GET /api/releases` endpoint.

Each test ran for 30 seconds.

| Concurrent VUs | Requests | Failed | Avg Latency | p95 Latency |
| -------------: | -------: | -----: | ----------: | ----------: |
|             50 |      419 |     0% |       1.20s |       1.67s |
|            100 |      785 |  0.12% |       2.14s |       6.52s |
|            200 |      904 |  6.08% |       2.11s |       4.77s |

### Stress Test Conclusion

The API handled 50 concurrent virtual users with 0% request failures during the 30-second test.

At 100 concurrent virtual users, the failure rate was 0.12% and latency increased.

At 200 concurrent virtual users, the failure rate increased to 6.08%, with connection-related errors observed during the test.

These results indicate that performance degradation became visible as concurrency increased. The tested workload was fully successful at 50 concurrent virtual users, while higher concurrency produced measurable failures.

> Note: k6 virtual users represent concurrent simulated clients and should not be interpreted as an exact count of unique human users.

## Production Deployment

The application is deployed on Vercel and uses Neon PostgreSQL for production data storage.

Configure `DATABASE_URL` in the deployment environment and apply migrations with:

```bash
npm run db:deploy
```

Then build with:

```bash
npm run build
```

No release data or database credentials are bundled into the client.
