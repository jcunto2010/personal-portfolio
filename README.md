# Jonathan Cunto Diaz - Personal Portfolio

A modern, responsive personal portfolio website built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

- ⚡ Built with Vite for lightning-fast development
- 💎 React 18 with TypeScript for type safety
- 🎨 Styled with Tailwind CSS for modern, responsive design
- 📱 Fully responsive across all devices
- ♿ Accessible with semantic HTML and ARIA labels
- 🎭 Smooth animations and transitions
- 📧 Contact form with validation
- 🔗 Social media integration

## 📂 Project Structure

```
personal_portfolio/
├── public/
│   └── assets/
│       └── projects/        # Project screenshots
├── src/
│   ├── components/
│   │   ├── Header.tsx      # Navigation header
│   │   ├── Hero.tsx        # Hero section
│   │   ├── Skills.tsx      # Skills showcase
│   │   ├── Projects.tsx    # Projects portfolio
│   │   ├── Experience.tsx  # Work experience
│   │   ├── Contact.tsx     # Contact form
│   │   └── Footer.tsx      # Footer
│   ├── data/
│   │   ├── projects.ts     # Project data
│   │   ├── skills.ts       # Skills data
│   │   └── experience.ts   # Experience data
│   ├── App.tsx             # Main app component
│   ├── index.css           # Global styles
│   └── main.tsx            # App entry point
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

## 🛠️ Technologies Used

- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Icons** - Icon library

## 📦 Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd personal_portfolio
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:5173`

## 🏗️ Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 🚢 Deployment

This portfolio is configured for easy deployment to multiple platforms:

### Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. For production deployment:
```bash
vercel --prod
```

4. Configure your custom domain `jonathancuntodiaz.com` in the Vercel dashboard.

### Netlify

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Deploy:
```bash
netlify deploy
```

3. For production deployment:
```bash
netlify deploy --prod
```

4. Configure your custom domain in the Netlify dashboard.

### GitHub Pages

1. Update `vite.config.ts` to include your repository base:
```typescript
export default defineConfig({
  base: '/your-repo-name/',
  // ...
})
```

2. Install gh-pages:
```bash
npm install -D gh-pages
```

3. Add to `package.json`:
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

4. Deploy:
```bash
npm run deploy
```

## 🎨 Customization

### Update Personal Information

1. **Hero Section**: Edit `src/components/Hero.tsx`
2. **Skills**: Modify `src/data/skills.ts`
3. **Projects**: Update `src/data/projects.ts` and add images to `public/assets/projects/`
4. **Experience**: Edit `src/data/experience.ts`
5. **Contact Info**: Update `src/components/Contact.tsx` and `src/components/Footer.tsx`

### Add Your Project Images

Place your project screenshots in `public/assets/projects/` and update the image paths in `src/data/projects.ts`.

### Update Colors

Modify the color scheme in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom colors
      },
    },
  },
}
```

### Social Media Links

Update social media URLs in:
- `src/components/Hero.tsx`
- `src/components/Footer.tsx`
- `src/components/Contact.tsx`

## 📧 Contact Form Integration

The contact form is ready for integration with services like:

- **EmailJS**: Free email service for static sites
- **Formspree**: Simple form backend
- **Netlify Forms**: Built-in form handling (if using Netlify)

Update the `handleSubmit` function in `src/components/Contact.tsx` with your chosen service.

## 🌐 Custom Domain Setup

### For Vercel:

1. Go to your project settings
2. Navigate to "Domains"
3. Add `jonathancuntodiaz.com`
4. Update your DNS records:
   - Type: CNAME
   - Name: www
   - Value: cname.vercel-dns.com
   - Type: A
   - Name: @
   - Value: 76.76.21.21

### For Netlify:

1. Go to your site settings
2. Navigate to "Domain management"
3. Add your custom domain
4. Follow Netlify's DNS configuration instructions

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Jonathan Cunto Diaz**

- Website: [jonathancuntodiaz.com](https://jonathancuntodiaz.com)
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourusername)

## 🙏 Acknowledgments

- Design inspiration from various portfolio websites
- Icons from [React Icons](https://react-icons.github.io/react-icons/)
- Fonts from [Google Fonts](https://fonts.google.com/)

---

Made with ❤️ by Jonathan Cunto Diaz
