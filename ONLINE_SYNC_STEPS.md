# Online Sync and Real Service Steps

Current status:

- This folder is not a Git repository yet.
- No GitHub remote is configured.
- No Vercel project is linked yet.
- The local app works at `http://localhost:5173`, but it is not online until you deploy it.

## Step 1. Create a GitHub repository

Create an empty repository on GitHub, for example:

```text
apac-remote-job-tracker
```

Do not add README/gitignore/license on GitHub if it asks.

## Step 2. Upload this project to GitHub

Open Command Prompt in `D:\job_api` and run:

```bat
git init
git add .
git commit -m "Prepare APAC remote job tracker service"
git branch -M main
git remote add origin https://github.com/YOUR_NAME/YOUR_REPO.git
git push -u origin main
```

Replace `YOUR_NAME` and `YOUR_REPO`.

## Step 3. Create an online Postgres database

Use one of these:

- Vercel Marketplace Prisma Postgres
- Vercel Marketplace Neon
- Supabase Postgres

Copy the production `DATABASE_URL`.

## Step 4. Deploy the API project

In Vercel:

```text
Add New Project
Import your GitHub repo
Root Directory: api
Build Command: npm run build
```

Set these API environment variables:

```text
DATABASE_URL=your online postgres url
CORS_ORIGIN=*
CRON_SECRET=make-a-long-random-secret
LINKEDIN_IMPORT_PAGE_LIMIT=3
IMPORT_CRON_ENABLED=false
```

Deploy. Vercel will give you an API URL like:

```text
https://your-api-project.vercel.app
```

## Step 5. Create online DB tables and seed sources

On your PC:

```bat
cd /d D:\job_api\api
npx vercel env pull .env
npx prisma db push --schema prisma/schema.prisma
npm run seed
```

Run the first online import:

```bat
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-api-project.vercel.app/import/cron
```

## Step 6. Deploy the Web project

In Vercel:

```text
Add New Project
Import the same GitHub repo
Root Directory: web
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
```

Set this Web environment variable:

```text
VITE_API_BASE_URL=https://your-api-project.vercel.app
```

Deploy. Vercel will give you a browser URL like:

```text
https://your-web-project.vercel.app
```

## Step 7. Lock API CORS to your web URL

Go back to the API project in Vercel and change:

```text
CORS_ORIGIN=https://your-web-project.vercel.app
```

Redeploy the API.

## Step 8. Apply future changes online

After editing local code:

```bat
cd /d D:\job_api
git add .
git commit -m "Update job tracker"
git push
```

If Vercel is connected to GitHub, it redeploys automatically after `git push`.

For manual deploys, double-click:

```text
04 Deploy API to Vercel.cmd
05 Deploy Web to Vercel.cmd
```

## Real-time behavior

Vercel is not a live-sync editor. Changes become online after:

```bat
git push
```

or after:

```bat
npx vercel --prod
```

The job import runs daily through Vercel Cron. You can also trigger it manually with:

```bat
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-api-project.vercel.app/import/cron
```
