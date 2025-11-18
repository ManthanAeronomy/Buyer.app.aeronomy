# Authentication Background Video

## Required Files

Place your authentication background video in the `public/videos/` folder:

### Video Files:
- `public/videos/clouds.mp4` (current video file)

### Recommended Specifications:
- **Format**: MP4 (H.264) or WebM
- **Resolution**: 1920x1080 (Full HD) or higher
- **Aspect Ratio**: 16:9 or any landscape format
- **Duration**: 10-30 seconds (will loop automatically)
- **File Size**: Keep under 10MB for faster loading
- **Quality**: Medium to high (since it's a background video)

### Video Content Suggestions:
- Aerial footage of aircraft
- SAF production facilities
- Sustainable energy concepts
- Abstract blue/technology animations
- Professional business environments

### Fallback:
If the video files are not present, the page will show a dark overlay with the text content still visible.

## File Structure:
```
public/
  └── images/
      ├── auth-bg.mp4    (Required)
      ├── auth-bg.webm   (Optional, for better compatibility)
      └── README.md      (This file)
```

## Testing:
After adding your video files:
1. Restart the development server
2. Visit `/sign-in` or `/sign-up`
3. The video should auto-play and loop continuously

