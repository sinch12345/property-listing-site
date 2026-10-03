# Nestora: Property Listing Website

A multi-page property listing website built from scratch with plain HTML, CSS and JavaScript. No frameworks, themes or templates.

**Live site:** https://YOUR-USERNAME.github.io/property-listing-site/

## Design concept: "Arch & Paper"
An editorial, boutique-hotel look. Doorway-shaped arches frame every image, on a warm paper-cream palette with forest green, terracotta and gold accents. Fonts: Fraunces (headings) and DM Sans (body).

## Features
- Multi-page site with a custom **arch curtain page transition**
- **Vibe-first search** (Sunlit mornings, Quiet street, Pet friendly...) alongside area, type and budget
- Live filtering and sorting, with **shareable filter URLs**
- Property detail pages with an arch gallery and an **interactive monthly payment calculator**
- Favorites saved in the browser, with a Saved page
- "List a property" form with a **live preview card**
- Scroll-reveal animations, animated counters, floating badges
- Responsive layout with a mobile menu
- Custom 404 page

## Pages
`index.html` · `listings.html` · `property.html` · `neighborhoods.html` · `about.html` · `saved.html` · `list.html` · `404.html`

## Structure
├── css/style.css all styles and design tokens
├── js/data.js sample property data
├── js/layout.js shared header, footer, transitions, counters
├── js/main.js cards, favorites, filters, sorting
├── js/detail.js property detail page
├── js/list.js list-a-property live preview
└── images/ favicon


## Run locally
Open the folder in VS Code and use the Live Server extension on `index.html`.

## Notes
All property data and statistics are sample content for demonstration. There is no backend; forms show a confirmation message only.