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

Load testing was performed against the production API endpoint:

`GET /api/releases`

The test used k6 with 30-second runs and a 1-second pause between iterations. VUs represent concurrent simulated clients, not exact human users.

### Initial implementation

| Concurrent VUs | Requests | Failed | Failure Rate | p95 Latency |
| -------------: | -------: | -----: | -----------: | ----------: |
|             50 |      771 |      0 |        0.00% |       1.56s |
|            100 |    1,036 |      0 |        0.00% |       2.43s |
|            200 |    1,069 |     32 |        2.99% |       3.66s |

The initial implementation remained fully successful at 100 VUs. At 200 VUs, requests began to fail, establishing an observed degradation/breaking point under this test configuration.

### Optimization

The release-list query was optimized to fetch only the fields required by the dashboard instead of returning the complete Release record.

This reduced unnecessary database result payload and application-level data handling.

### Optimized implementation

| Concurrent VUs | Requests | Failed | Failure Rate | p95 Latency |
| -------------: | -------: | -----: | -----------: | ----------: |
|            200 |    1,124 |     18 |        1.60% |       4.64s |

At 200 VUs, the observed request failure rate decreased from 2.99% to 1.60%, while throughput increased from 17.82 req/s to 18.73 req/s.

The latency result was variable: p95 increased from 3.66s to 4.64s in this run. Therefore, the optimization is reported as an observed improvement in failure rate and throughput rather than a universal latency improvement.

### Conclusion

The initial load test showed that the application handled 50 and 100 concurrent simulated clients without failed requests, while failures appeared at 200 VUs.

After optimizing the release-list query, the same 200-VU test showed a lower observed failure rate and slightly higher throughput. The experiment demonstrates the effect of reducing unnecessary database result data while also showing that serverless load-test performance can vary across runs.

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
