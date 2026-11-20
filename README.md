# Nestora: Property Listing Website

A multi-page property listing website built from scratch with plain HTML, CSS and JavaScript. No frameworks, themes or templates.

**Live site:** https://YOUR-USERNAME.github.io/property-listing-site/

## Design concept: "Arch & Paper"
An editorial, boutique-hotel look. Doorway-shaped arches frame every image, on a warm paper-cream palette with forest green, terracotta and gold accents. Fonts: Fraunces (headings) and DM Sans (body).

## Features
- Custom **arch curtain page transition** and scroll-reveal animations
- **Vibe-first search**: filter by neighborhood, type, price slider, bedrooms, bathrooms and vibe
- Keyword search with instant suggestions, and **shareable filter URLs**
- **Vibe quiz** that gives a home personality and matching homes with a match percentage
- **Compare up to 3 homes** side by side, with the best value highlighted
- **Real interactive map** (Leaflet + OpenStreetMap) with price pins and a price-areas view
- Property detail pages with a gallery, a **day/night toggle** and an **interactive monthly payment calculator**
- Favorites, recently viewed homes and a Saved page
- **List a property** form with photo upload and a live preview card
- **Evening mode** (light/dark/auto) and a **Settings page**: text size, reduced motion and data controls
- Contact page with an FAQ accordion
- Responsive layout, mobile menu and a custom 404 page

## Pages
`index` · `listings` · `property` · `neighborhoods` · `quiz` · `compare` · `saved` · `list` · `settings` · `contact` · `about` · `404`

## Structure
```
├── css/style.css      all styles, one labeled section per feature
├── js/data.js         sample property data
├── js/layout.js       shared header, footer, transitions, compare tray
├── js/theme.js        theme, text size and motion preferences
├── js/main.js         cards, favorites, filters, sorting, search
├── js/detail.js       property detail page
├── js/map.js          Leaflet map and neighborhood strip
├── js/quiz.js · compare.js · list.js · settings.js · recent.js · contact.js
└── images/            favicon
```

## Run locally
Open the folder in VS Code and use the Live Server extension on `index.html`.

## Notes
All property data and statistics are sample content. There is no backend: favorites, settings and submitted listings are stored in the browser with localStorage, and forms only show a confirmation message. The map uses Leaflet and OpenStreetMap tiles from public CDNs.