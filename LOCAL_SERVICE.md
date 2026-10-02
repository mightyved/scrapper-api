# Local Service Usage

Use these files from Windows Explorer. VS Code is not required.

## Normal use

Double-click:

```text
desktop\dist\APAC-Remote-Job-Tracker.exe
```

The EXE prepares the local app by itself:

- installs missing API/web dependencies when needed
- generates the Prisma client when needed
- creates/applies the PostgreSQL schema
- seeds job sources
- opens the desktop app window
- runs background job sync every 15 minutes

PostgreSQL must be running locally, and `api\.env` must contain the correct `DATABASE_URL`.

Keep the EXE inside this project folder so it can find the local `api` and `web` files.

## Maintenance Commands

These are optional fallback tools. Normal use should not need them.

If you changed code and want to refresh the built desktop assets first:

```text
07 Rebuild Desktop App.cmd
```

Then run `06 Start Desktop App.cmd`.

To rebuild the EXE:

```text
08 Package Desktop EXE.cmd
```

Manual setup, only if you need to debug setup separately:

```text
00 Setup Local Database.cmd
```

Desktop launcher without packaging:

```text
06 Start Desktop App.cmd
```

## Start in browser

Double-click:

```text
01 Start Local Job Tracker.cmd
```

It opens three command windows:

- API server on `http://localhost:4000`
- Web app on `http://localhost:5173`
- Auto-sync importer

It also opens the web app in your browser.

The auto-sync importer runs immediately, then imports fresh job data every 15 minutes. Refresh the browser after a sync finishes.

## Import jobs manually, optional

Double-click:

```text
02 Import Jobs Now.cmd
```

Use this only when you want an extra immediate sync outside the 15-minute auto-sync loop. After import finishes, refresh the browser page.

## Stop the app

Double-click:

```text
03 Stop Local Job Tracker.cmd
```

You can also close the API and Web command windows manually.
