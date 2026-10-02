# Deploying APAC Remote Job Tracker to Vercel

This repo should be deployed as two Vercel projects:

- `api`: Express API, Prisma, job import cron.
- `web`: Vite React frontend.

The frontend is static and very Vercel-friendly. The backend runs as a Vercel Function, not as a long-running Node server, so scheduled imports use Vercel Cron at `/import/cron`.

## 1. Create a production Postgres database

Use a hosted Postgres database. Good Vercel-friendly options:

- Prisma Postgres from the Vercel Marketplace
- Neon from the Vercel Marketplace
- Supabase Postgres

Copy the production connection string. It will become `DATABASE_URL` in the API project.

## 2. Deploy the API project

In Vercel, create a new project from this repository and set:

- Root Directory: `api`
- Build Command: `npm run build`
- Install Command: `npm install`

Add these environment variables to the API project:

```text
DATABASE_URL=postgresql://...
CORS_ORIGIN=https://your-web-project.vercel.app
CRON_SECRET=<long-random-secret>
LINKEDIN_IMPORT_PAGE_LIMIT=3
IMPORT_CRON_ENABLED=false
```

`IMPORT_CRON_ENABLED=false` prevents the old local Node scheduler from running if the app is ever started as a normal server. Vercel production scheduling is handled by `vercel.json`.

Deploy the API:

```bash
cd api
npx vercel --prod
```

After the first deploy, initialize the database:

```bash
cd api
npx vercel env pull .env
npx prisma db push --schema prisma/schema.prisma
npm run seed
```

Then trigger the first production import manually:

```bash
curl -H "Authorization: Bearer <CRON_SECRET>" https://your-api-project.vercel.app/import/cron
```

Useful API checks:

```bash
curl https://your-api-project.vercel.app/health
curl https://your-api-project.vercel.app/jobs
```

## 3. Deploy the web project

In Vercel, create another project from this repository and set:

- Root Directory: `web`
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

Add this environment variable:

```text
VITE_API_BASE_URL=https://your-api-project.vercel.app
```

Deploy:

```bash
cd web
npx vercel --prod
```

## 4. Update API CORS after the web deploy

Once the web project has a production URL, update the API project environment variable:

```text
CORS_ORIGIN=https://your-web-project.vercel.app
```

Redeploy the API after changing it.

## 5. Cron behavior

The API project has `api/vercel.json` with:

```json
{
  "crons": [
    {
      "path": "/import/cron",
      "schedule": "0 23 * * *"
    }
  ]
}
```

Vercel Cron schedules are UTC. `0 23 * * *` runs around 08:00 Japan time.

On the Hobby plan, Vercel allows daily cron jobs. For more frequent imports, use Pro.

## 6. Production notes

- The cron import is idempotent because jobs upsert by `applyUrl`.
- LinkedIn import uses the public guest endpoint and can break if LinkedIn changes markup.
- If the cron function times out, reduce `LINKEDIN_IMPORT_PAGE_LIMIT` or disable slower sources in the database.
- The current `/jobs` response can be large. If traffic grows, add API-side pagination.
