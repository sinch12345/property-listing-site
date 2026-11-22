# Nestora API reference

Base URL (development): `http://localhost:3000`

All requests and responses use JSON. Errors look like `{ "error": "message" }`. Validation errors also include `"fields": { "fieldName": "message" }`.

## Status codes

| Code | Meaning |
|---|---|
| 200 / 201 | Success / created |
| 400 | Invalid input |
| 401 | Login required or invalid token |
| 404 | Record not found |
| 409 | Duplicate or conflicting request |
| 413 | Request or photo too large |
| 429 | Rate limit reached |
| 500 | Unexpected server error (no details are sent) |
| 503 | Database unavailable (health check) |

## Rate limits (per IP, per 15 minutes)

General API 300 · Forms 10 · Photo uploads 60 · Admin login 5 failed attempts.

---

## Public endpoints

### GET /api/health
Checks the server and database. No auth.
- 200: `{ "status": "ok", "database": "up", "time": "..." }`
- 503: `{ "status": "error", "database": "down" }`

### GET /api/properties
Lists **approved** homes. No auth. Owner details are never included.

Query (all optional): `location`, `type`, `vibe`, `maxPrice`, `beds`, `baths`, `sort` (`newest`, `priceLow`, `priceHigh`), `limit` (1 to 100, default 50).
- 200: `{ "count": 8, "homes": [ { "id", "title", "location", "type", "price", "beds", "baths", "area", "vibes": [], "photos": [], "added" } ] }`
- 400: `Invalid filters`

### GET /api/properties/:id
One approved home.
- 200: a single home object (same shape as above)
- 400: `Invalid id` · 404: `Home not found`

### POST /api/properties
Submit a listing. It is saved as `pending` and is not public until an admin approves it.

Body: `title` (3 to 100), `location`, `type`, `price`, `beds` (1 to 10), `baths` (1 to 10), `area`, `vibes` (up to 3, optional), `ownerName`, `ownerEmail`.
- 201: `{ "id", "status": "pending", "uploadToken", "message" }`
- 400: validation errors · 409: same listing within 10 minutes

`uploadToken` is shown once and only a hash is stored. It is needed to upload photos.

### POST /api/properties/:id/photos
Upload one JPEG for a pending listing.

Body: `{ "token": "<uploadToken>", "photo": "data:image/jpeg;base64,..." }`
- 201: `{ "position": 1 }`
- 400: not a valid JPEG or invalid input · 404: wrong token or listing · 409: more than 6 photos, or listing no longer pending · 413: over 300 KB

### POST /api/enquiries
Body: `propertyId`, `name`, `email`, `message` (1 to 2000).
- 201: `{ "id", "message" }`
- 400: validation errors · 404: home not found or not approved · 409: identical enquiry within 10 minutes

### POST /api/contact
Body: `name`, `email`, `topic` (`Buying a home`, `Listing a property`, `Something else`), `message` (1 to 2000).
- 201: `{ "id", "message" }` · 400: validation errors

### GET /uploads/:file
Serves an uploaded photo.

---

## Admin endpoints

Send `Authorization: Bearer <token>`. Without a valid token they return 401.

### POST /api/admin/login
Body: `email`, `password`.
- 200: `{ "token", "expiresIn": 7200 }`
- 401: `Invalid email or password` (same message for both cases)
- 429: too many failed attempts

### GET /api/admin/me
- 200: `{ "email" }`

### GET /api/admin/properties?status=pending
`status`: `pending` (default), `approved` or `rejected`. Also `limit` and `offset`. Includes owner name and email.

### PATCH /api/admin/properties/:id
Body: `{ "status": "approved" }` or `"rejected"`.
- 200: `{ "id", "status" }` · 400 · 404

### GET /api/admin/enquiries
Paged with `limit` and `offset`. Includes visitor name and email.

### GET /api/admin/contact-messages
Paged with `limit` and `offset`.