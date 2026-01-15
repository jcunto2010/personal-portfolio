# Quick Start Guide

Get your portfolio website up and running in minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git (optional, for version control)

## Installation

1. Install dependencies:
```bash
npm install
```

## Development

Start the development server:
```bash
npm run dev
```

The site will be available at `http://localhost:5173`

## Customization Checklist

Before deploying, update the following with your personal information:

### 1. Personal Information

**File: `src/components/Hero.tsx`**
- Update your name
- Update your title/role
- Update your description/tagline
- Update social media links (GitHub, LinkedIn)

**File: `src/components/Contact.tsx`**
- Update email address
- Update phone number
- Update location
- Update social media links

**File: `src/components/Footer.tsx`**
- Update social media links
- Verify copyright year

### 2. Skills

**File: `src/data/skills.ts`**
- Add/remove technologies you know
- Organize by categories (Languages, Frameworks, Tools)
- Import icons from `react-icons/si` for technology logos

### 3. Projects

**File: `src/data/projects.ts`**
- Add your actual projects
- Update project descriptions
- Add GitHub repository URLs
- Add live demo URLs
- Upload project screenshots to `public/assets/projects/`
- Update image paths to match your screenshots

**Tip:** For project images, use:
- Format: JPG or PNG
- Recommended size: 800x600px or 16:9 aspect ratio
- Optimize images for web

### 4. Experience

**File: `src/data/experience.ts`**
- Add your work experience
- Update job titles and companies
- Update employment dates
- Add key achievements
- List technologies used in each role

### 5. Meta Tags & SEO

**File: `index.html`**
- Update the page title
- Update meta description
- Update Open Graph tags
- Add favicon (replace `/vite.svg`)

### 6. Domain & Contact

**File: `README.md` and `DEPLOYMENT.md`**
- Update all references to your domain
- Update contact information
- Update social media usernames

## Build for Production

Create an optimized production build:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

## Deploy

Choose your preferred hosting platform:

### Quick Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Quick Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Project Structure

```
src/
├── components/       # React components for each section
│   ├── Header.tsx   # Navigation
│   ├── Hero.tsx     # Landing section
│   ├── Skills.tsx   # Skills showcase
│   ├── Projects.tsx # Project portfolio
│   ├── Experience.tsx # Work history
│   ├── Contact.tsx  # Contact form
│   └── Footer.tsx   # Footer
├── data/            # Data files (edit these!)
│   ├── skills.ts    # Your skills
│   ├── projects.ts  # Your projects
│   └── experience.ts # Your experience
├── App.tsx          # Main app
├── index.css        # Tailwind styles
└── main.tsx         # Entry point
```

## Tips for Customization

### Changing Colors

Edit `tailwind.config.js` to change the color scheme:
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your colors here
      },
    },
  },
}
```

### Adding Icons

All icons come from `react-icons`. Browse available icons at:
https://react-icons.github.io/react-icons/

Import and use:
```typescript
import { FaIcon } from 'react-icons/fa'
```

### Email Service Integration

To make the contact form functional, see the "Email Service Setup" section in [DEPLOYMENT.md](DEPLOYMENT.md).

Popular options:
- EmailJS (recommended for beginners)
- Formspree
- Netlify Forms (if using Netlify)

## Troubleshooting

### Port already in use
If port 5173 is in use, Vite will automatically use the next available port.

### Build errors
- Clear cache: `rm -rf node_modules dist && npm install`
- Check Node version: `node --version` (should be 18+)
- Check for TypeScript errors: `npx tsc --noEmit`

### Tailwind classes not working
- Restart dev server: `Ctrl+C` then `npm run dev`
- Check `tailwind.config.js` content paths

## Next Steps

1. ✅ Customize all content with your information
2. ✅ Add your project screenshots
3. ✅ Test contact form
4. ✅ Test on mobile devices
5. ✅ Build and preview
6. ✅ Deploy to your hosting platform
7. ✅ Configure custom domain
8. ✅ Set up email service
9. ✅ Add analytics (optional)

## Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Vite Documentation](https://vitejs.dev)
- [React Icons](https://react-icons.github.io/react-icons/)

## Support

If you encounter issues:
1. Check the documentation files (README.md, DEPLOYMENT.md)
2. Review Vite and React documentation
3. Check browser console for errors
4. Verify Node.js version is 18+

---

Happy coding! 🚀
