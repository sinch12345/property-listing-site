# Architecture note

## How the parts connect

```
Browser (static site: HTML, CSS, JS)
   |  fetch, JSON over HTTP
   v
Express API (server/)  ->  validation (Zod), auth, rate limits
   |  parameterized SQL
   v
PostgreSQL  (constraints, foreign keys, migrations)
```

- **Frontend:** the Task 1 site (Nestora), hosted on GitHub Pages. `js/api.js` wraps `fetch` for the forms; `js/data.js` loads homes from the API.
- **API and server:** Express. Every request passes security headers (Helmet), CORS, rate limits, JSON parsing with size limits, then a route that validates input with Zod.
- **Database:** PostgreSQL. Tables: neighborhoods, properties, property_vibes, property_photos, enquiries, contact_messages, admins. CHECK constraints, unique keys and foreign keys enforce the rules even if the API had a bug. Schema changes live in numbered SQL migrations.

## Request flow example (submit a listing)
1. The visitor fills in the form and presses Submit.
2. The browser sends `POST /api/properties`.
3. The server validates every field and rejects bad input with 400.
4. In one transaction it checks for a duplicate and saves the home and its vibes as `pending`.
5. The server returns the id and a one-time upload token.
6. The browser uploads each photo with the token. The server checks size, real JPEG bytes and the token hash, then stores the file name.
7. An admin logs in and approves the listing. Only then does it appear in `GET /api/properties`.

## Design decisions
- **No visitor accounts.** The site doesn't need them. One admin account protects moderation and private data.
- **Moderation.** New listings are `pending` and the status is never taken from the request, so visitors cannot publish themselves.
- **Private data.** Owner emails, enquiries and contact messages are only returned by admin endpoints.
- **Passwords** are hashed with bcrypt. Login errors are identical for a wrong email or password.
- **Tokens:** admin tokens are signed JWTs that expire after 2 hours. The admin must still exist in the database.
- **Photo uploads** use a hashed one-time token instead of accounts.
- **Listings are rejected, not deleted,** so history is kept.
- **Favorites, compare list, theme and settings** stay in the browser because they are personal.

## Known limitations
- Rate-limit counters are in memory: they reset on restart and aren't shared across several servers.
- Admin tokens cannot be revoked before they expire.
- Photos are stored on local disk, which is not durable on many hosts.
- `js/data.js` uses a synchronous request so the other scripts work unchanged. An asynchronous version would be better.
- The admin has no web screen yet: moderation uses the API directly.
- The live GitHub Pages site has no backend until the API is deployed, so it shows the sample homes.