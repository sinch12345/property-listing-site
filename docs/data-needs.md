# Nestora backend: data needs

## Features that need a backend
- List a property: stores a listing, its vibes and photos, with status pending/approved/rejected
- Property enquiry form: stores an enquiry linked to a property
- Contact form: stores a contact message
- Homes and property pages: read approved listings from the database

## Stays in the browser (no backend)
Favorites, compare list, recently viewed, theme, text size, motion settings, quiz and filters.

## Roles
- Visitor: no account. Can read approved homes and submit forms.
- Admin: one login. Can review listings and read enquiries and messages.

## Public vs private
- Public: approved homes, photos, vibes
- Private: owner name and email, enquiries, contact messages, pending and rejected listings

## Tables
neighborhoods, properties, property_vibes, property_photos, enquiries, contact_messages, admins

## Stack (pending lead approval)
Node.js 20+, Express, PostgreSQL, Zod, bcrypt, SQL migration files.