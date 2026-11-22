# Setup and deployment guide

## Requirements
- Node.js 20 or newer
- PostgreSQL 16 or newer
- VS Code with the Live Server extension (for the frontend)

## 1. Create the database

As the PostgreSQL admin user, create a dedicated role and database:

```sql
CREATE ROLE nestora_app LOGIN PASSWORD 'choose-a-password';
CREATE DATABASE nestora OWNER nestora_app;
```

Use letters and numbers in the password, so it can sit safely in a connection string.

## 2. Configure the server

```bash
cd server
npm install
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
```

Edit `.env`:

| Variable | Purpose | Example |
|---|---|---|
| `NODE_ENV` | `development` or `production` | `development` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgres://nestora_app:PASSWORD@localhost:5432/nestora` |
| `CORS_ORIGIN` | The exact address of the frontend | `http://127.0.0.1:5500` |
| `JWT_SECRET` | Signs admin tokens, 32+ characters | generate below |

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

The server refuses to start, with a clear message, if a required variable is missing. `.env` is git-ignored and must never be committed.

## 3. Create the tables and sample data

```bash
npm run migrate     # applies every file in server/migrations once
npm run seed        # development only: adds 8 sample homes (refuses in production)
```

## 4. Create the admin account

```powershell
$env:ADMIN_EMAIL = "admin@example.com"
$env:ADMIN_PASSWORD = "a-long-password-of-10-plus-characters"
npm run create-admin
Remove-Item Env:ADMIN_EMAIL, Env:ADMIN_PASSWORD
```

Running it again with the same email resets that admin's password.

## 5. Start the server

```bash
npm run dev      # development, restarts on change
npm start        # production
```

Check it: `http://localhost:3000/api/health` should show `"database":"up"`.

## 6. Connect the frontend

Open the site root in VS Code and start Live Server. The address must match `CORS_ORIGIN` (`http://127.0.0.1:5500`). `js/api.js` and `js/data.js` call `http://localhost:3000` automatically on localhost. If the server is unreachable, the site falls back to the sample homes.

## Deployment checklist
- Runtime: Node.js 20+, started with `npm start`.
- Set all environment variables in the host's settings, with `NODE_ENV=production`.
- Use a managed PostgreSQL database with its own user. Do not use a personal account.
- Run `npm run migrate` on every deploy before starting the server. Never run `npm run seed`.
- Serve over HTTPS and set `CORS_ORIGIN` to the real frontend address.
- Health check path: `/api/health` (200 when healthy, 503 when the database is down).
- Photos are stored on the server disk (`server/uploads`). Many hosts wipe this on redeploy, so use a persistent disk or object storage in production.