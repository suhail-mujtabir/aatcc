# Activities Images Directory

This directory stores all images for the AATCC activities section.

## Directory Structure

```
/public/images/activities/
├── tech-talk-featured.jpg
├── tech-talk-1.jpg
├── tech-talk-2.jpg
├── tech-talk-3.jpg
├── orientation-featured.jpg
├── orientation-1.jpg
├── orientation-2.jpg
├── orientation-3.jpg
├── orientation-4.jpg
├── coding-contest-featured.jpg
├── coding-contest-1.jpg
├── coding-contest-2.jpg
├── coding-contest-3.jpg
├── webdev-workshop-featured.jpg
├── webdev-workshop-1.jpg
├── webdev-workshop-2.jpg
├── webdev-workshop-3.jpg
├── webdev-workshop-4.jpg
├── mobile-workshop-featured.jpg
├── mobile-workshop-1.jpg
├── mobile-workshop-2.jpg
├── mobile-workshop-3.jpg
├── uiux-workshop-featured.jpg
├── uiux-workshop-1.jpg
├── uiux-workshop-2.jpg
├── uiux-workshop-3.jpg
├── uiux-workshop-4.jpg
├── walton-visit-featured.jpg
├── walton-visit-1.jpg
├── walton-visit-2.jpg
├── walton-visit-3.jpg
├── walton-visit-4.jpg
├── walton-visit-5.jpg
├── gp-visit-featured.jpg
├── gp-visit-1.jpg
├── gp-visit-2.jpg
├── gp-visit-3.jpg
├── gp-visit-4.jpg
├── robi-visit-featured.jpg
├── robi-visit-1.jpg
├── robi-visit-2.jpg
├── robi-visit-3.jpg
├── robi-visit-4.jpg
└── robi-visit-5.jpg
```

## Image Specifications

### Featured Images
- **Dimensions**: 1200x675px (16:9 aspect ratio)
- **Format**: JPG or WebP
- **File Size**: < 300KB (optimized)
- **Use**: Main card image and Open Graph sharing

### Gallery Images
- **Dimensions**: 800x450px minimum (16:9 aspect ratio)
- **Format**: JPG or WebP
- **File Size**: < 200KB each (optimized)
- **Use**: Photo gallery on detail pages

## Image Optimization Tips

1. **Compress images** before uploading using tools like:
   - TinyPNG (https://tinypng.com)
   - ImageOptim (Mac)
   - Squoosh (https://squoosh.app)

2. **Use Next.js Image Optimization**:
   - The `<Image>` component from Next.js automatically optimizes images
   - Supports WebP format for better compression
   - Lazy loads images for better performance

3. **Responsive Images**:
   - Next.js automatically generates multiple sizes
   - Serves appropriate size based on device

## Adding New Activity Images

When adding a new activity:

1. Create images following the specifications above
2. Name files consistently: `activity-slug-featured.jpg` and `activity-slug-1.jpg`, etc.
3. Place images in `/public/images/activities/`
4. Update the activity data in `/data/activities.json` with the correct paths
5. Test that images load correctly in both light and dark modes

## Placeholder Images

Until real images are available, you can use placeholder services:

- **Unsplash**: https://source.unsplash.com/1200x675/?technology,event
- **Picsum**: https://picsum.photos/1200/675
- **Placeholder.com**: https://via.placeholder.com/1200x675

Example placeholder URL structure:
```json
"featuredImage": "https://source.unsplash.com/1200x675/?technology,workshop",
```

## Alt Text Best Practices

Always provide descriptive alt text for accessibility:
- Describe what's in the image
- Include relevant keywords naturally
- Keep it concise (under 125 characters)
- Don't start with "Image of" or "Picture of"

Example:
```
Good: "Students learning React Native during mobile app development workshop"
Bad: "Image of workshop"
```

## Copyright & Attribution

Ensure you have rights to use all images:
- Take your own photos at events
- Get permission for photos with identifiable people
- Attribute photographers when required
- Use royalty-free stock photos when needed

## Image Backup

- Keep original high-resolution images in a separate backup
- Store in cloud storage (Google Drive, Dropbox, etc.)
- Maintain organized folders by event date and name
