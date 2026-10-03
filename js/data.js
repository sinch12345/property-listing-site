/* ===== Sample property data =====
   palette = [sky top, sky bottom, ground/accent]
   image   = leave null for now; in a later step you can put "images/home1.jpg" here */

const PROPERTIES = [
  {
    id: 1, title: "The Sunroom Villa", location: "Lakeside", type: "Villa",
    price: 785000, beds: 4, baths: 3, area: 2400,
    vibes: ["Sunlit mornings", "Great for hosting"],
    palette: ["#F3D9A4", "#E2B866", "#1F3D2F"], added: "2026-09-28", image: null
  },
  {
    id: 2, title: "Corner Loft on Baker Lane", location: "Old Town", type: "Apartment",
    price: 320000, beds: 2, baths: 1, area: 980,
    vibes: ["Work-from-home ready", "Quiet street"],
    palette: ["#DDE5D8", "#9DB8A6", "#C8553D"], added: "2026-09-25", image: null
  },
  {
    id: 3, title: "Hilltop Garden House", location: "Hillcrest", type: "Townhouse",
    price: 540000, beds: 3, baths: 2, area: 1750,
    vibes: ["Pet friendly", "Quiet street"],
    palette: ["#F0DDB0", "#EBC9BC", "#1F3D2F"], added: "2026-09-22", image: null
  },
  {
    id: 4, title: "Harbour Light Studio", location: "Harbour", type: "Studio",
    price: 185000, beds: 1, baths: 1, area: 520,
    vibes: ["Sunlit mornings", "Work-from-home ready"],
    palette: ["#CFDCD3", "#F3D9A4", "#C8553D"], added: "2026-09-20", image: null
  },
  {
    id: 5, title: "Lantern Court Townhouse", location: "Old Town", type: "Townhouse",
    price: 465000, beds: 3, baths: 2, area: 1500,
    vibes: ["Great for hosting", "Pet friendly"],
    palette: ["#EBC9BC", "#E2B866", "#1F3D2F"], added: "2026-09-15", image: null
  },
  {
    id: 6, title: "Willow Water Apartment", location: "Lakeside", type: "Apartment",
    price: 255000, beds: 2, baths: 2, area: 880,
    vibes: ["Quiet street", "Sunlit mornings"],
    palette: ["#CFDCD3", "#9DB8A6", "#1F3D2F"], added: "2026-09-10", image: null
  },
  {
    id: 7, title: "The Ridge Estate", location: "Hillcrest", type: "Villa",
    price: 1250000, beds: 5, baths: 4, area: 3800,
    vibes: ["Great for hosting", "Pet friendly"],
    palette: ["#F3D9A4", "#C8553D", "#1F3D2F"], added: "2026-09-05", image: null
  },
  {
    id: 8, title: "Mariner's Rest", location: "Harbour", type: "Apartment",
    price: 395000, beds: 2, baths: 2, area: 1100,
    vibes: ["Sunlit mornings", "Great for hosting"],
    palette: ["#DDE5D8", "#E2B866", "#C8553D"], added: "2026-08-30", image: null
  }
];


/* ===== Listings submitted through the "List a property" form ===== */
try {
  const mine = JSON.parse(localStorage.getItem('nestora_user_listings') || '[]');
  mine.forEach(p => {
    p.image = (p.photos && p.photos[0]) || null;   // cover photo for the cards
    PROPERTIES.push(p);
  });
} catch (e) { /* storage blocked: ignore */ }