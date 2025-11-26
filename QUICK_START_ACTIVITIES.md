# 🚀 Quick Start Guide - Activities Section

## Start the Development Server
```bash
npm run dev
```

## View the Pages

### Main Activities Page
```
http://localhost:3000/activities
```

### Example Detail Pages
```
http://localhost:3000/activities/events/tech-talk-ai-ml
http://localhost:3000/activities/workshop/full-stack-web-development-bootcamp
http://localhost:3000/activities/industrial-visit/walton-manufacturing-plant-tour
```

## Test the Features

1. **Tab Filtering** - Click "Events", "Workshop", "Industrial Visit", or "All Activities"
2. **Card Hover** - Hover over any activity card to see lift animation
3. **Dark Mode** - Toggle theme and verify everything looks good
4. **Responsive** - Resize browser or open DevTools mobile view
5. **Navigation** - Click any card → view details → use breadcrumbs/back button

## File Structure

```
├── app/
│   └── activities/
│       ├── page.tsx                        # Main listing page
│       └── [category]/
│           └── [slug]/
│               ├── page.tsx                # Detail page (server)
│               └── ActivityDetailClient.tsx # Detail page (client)
├── components/
│   └── activities/
│       ├── ActivityCard.tsx                # Card component
│       └── ActivityTabs.tsx                # Tab navigation
├── data/
│   └── activities.json                     # Activities data
├── types/
│   └── activities.ts                       # TypeScript types
└── public/
    └── images/
        └── activities/
            └── README.md                   # Image guidelines
```

## Add New Activity

Edit `/data/activities.json`:

```json
{
  "id": "new-activity-2024",
  "category": "events",
  "slug": "new-activity-slug",
  "title": "New Activity Title",
  "date": "2024-12-15",
  "excerpt": "Short description for the card",
  "description": "Full detailed description...",
  "featuredImage": "https://images.unsplash.com/photo-xyz",
  "gallery": ["image1-url", "image2-url"],
  "location": "AUST Campus",
  "organizer": "AATCC Team"
}
```

Save and refresh - it appears automatically!

## Replace Placeholder Images

1. Add real photos to `/public/images/activities/`
2. Update paths in `activities.json`:
   ```json
   "featuredImage": "/images/activities/my-event.jpg"
   ```
3. See `/public/images/activities/README.md` for image specs

## Troubleshooting

### Images not loading?
- Restart dev server: `npm run dev`
- Check `next.config.ts` has Unsplash in `remotePatterns`

### TypeScript error on import?
- Press `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
- This is a cache issue, code works fine

### Dark mode not working?
- Check if ThemeContext is set up in your app
- Component uses `dark:` classes throughout

## Production Build

```bash
npm run build
npm start
```

Static pages generated at build time for optimal performance!

---

**Everything is ready to go! 🎉**

See `ACTIVITIES_IMPLEMENTATION.md` for detailed documentation.
