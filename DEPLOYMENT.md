# Deployment Guide for jonathancuntodiaz.com

This guide provides detailed instructions for deploying your portfolio website to various hosting platforms and configuring your custom domain.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Vercel Deployment](#vercel-deployment)
3. [Netlify Deployment](#netlify-deployment)
4. [GitHub Pages Deployment](#github-pages-deployment)
5. [Custom Domain Configuration](#custom-domain-configuration)
6. [Email Service Setup](#email-service-setup)

## Prerequisites

- Your portfolio built and tested locally
- Git repository (GitHub, GitLab, or Bitbucket)
- Custom domain: jonathancuntodiaz.com

## Vercel Deployment (Recommended)

Vercel offers the best experience for React/Vite applications with automatic deployments.

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

From your project directory:

```bash
vercel
```

Follow the prompts:
- Set up and deploy? Yes
- Which scope? Your account
- Link to existing project? No
- Project name? personal_portfolio
- Directory? ./
- Want to override settings? No

### Step 4: Deploy to Production

```bash
vercel --prod
```

### Step 5: Add Custom Domain

1. Go to your project dashboard on Vercel
2. Navigate to "Settings" → "Domains"
3. Add `jonathancuntodiaz.com` and `www.jonathancuntodiaz.com`
4. Vercel will provide DNS configuration (see Custom Domain Configuration section)

### Automatic Deployments

Connect your GitHub repository to Vercel:
1. Go to Vercel dashboard
2. Import your Git repository
3. Configure build settings (already set in vercel.json)
4. Every push to main branch will trigger a deployment

## Netlify Deployment

### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

### Step 2: Login to Netlify

```bash
netlify login
```

### Step 3: Initialize

```bash
netlify init
```

Follow the prompts to create a new site.

### Step 4: Deploy

```bash
netlify deploy --prod
```

### Step 5: Add Custom Domain

1. Go to Site settings → Domain management
2. Add custom domain: jonathancuntodiaz.com
3. Follow Netlify's DNS configuration instructions

### Continuous Deployment

Link your Git repository:
1. Go to Site settings → Build & deploy
2. Link to Git repository
3. Set build command: `npm run build`
4. Set publish directory: `dist`

## GitHub Pages Deployment

### Step 1: Update Vite Configuration

Create or update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/personal_portfolio/', // Replace with your repo name
})
```

### Step 2: Install gh-pages

```bash
npm install -D gh-pages
```

### Step 3: Add Deploy Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

### Step 4: Deploy

```bash
npm run deploy
```

### Step 5: Configure GitHub Pages

1. Go to repository Settings → Pages
2. Source: Deploy from a branch
3. Branch: gh-pages, root
4. Save

### Custom Domain with GitHub Pages

1. Create a `CNAME` file in the `public/` directory:
```
jonathancuntodiaz.com
```

2. Configure DNS (see Custom Domain Configuration section)

## Custom Domain Configuration

### DNS Settings for jonathancuntodiaz.com

#### For Vercel:

Add these DNS records at your domain registrar:

**Root Domain (jonathancuntodiaz.com):**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

**WWW Subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

#### For Netlify:

**Root Domain:**
```
Type: A
Name: @
Value: 75.2.60.5
TTL: 3600
```

**WWW Subdomain:**
```
Type: CNAME
Name: www
Value: [your-site-name].netlify.app
TTL: 3600
```

#### For GitHub Pages:

**Root Domain:**
```
Type: A
Name: @
Value: 185.199.108.153
TTL: 3600

Type: A
Name: @
Value: 185.199.109.153
TTL: 3600

Type: A
Name: @
Value: 185.199.110.153
TTL: 3600

Type: A
Name: @
Value: 185.199.111.153
TTL: 3600
```

**WWW Subdomain:**
```
Type: CNAME
Name: www
Value: [your-username].github.io
TTL: 3600
```

### SSL Certificate

All three platforms (Vercel, Netlify, GitHub Pages) provide free SSL certificates automatically. After configuring your custom domain, SSL will be provisioned within a few minutes to a few hours.

## Email Service Setup

To make the contact form functional, integrate with an email service:

### Option 1: EmailJS (Recommended for simplicity)

1. Sign up at [EmailJS](https://www.emailjs.com/)
2. Create an email service
3. Create an email template
4. Get your credentials:
   - Service ID
   - Template ID
   - Public Key

5. Create `.env.local`:
```
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

6. Install EmailJS:
```bash
npm install @emailjs/browser
```

7. Update `src/components/Contact.tsx`:
```typescript
import emailjs from '@emailjs/browser';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (validateForm()) {
    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          from_name: formData.name,
          from_email: formData.email,
          subject: formData.subject,
          message: formData.message,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
      
      alert('Thank you for your message! I will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      alert('Failed to send message. Please try again.');
    }
  }
};
```

### Option 2: Formspree

1. Sign up at [Formspree](https://formspree.io/)
2. Create a new form
3. Get your form endpoint

4. Create `.env.local`:
```
VITE_FORMSPREE_ENDPOINT=your_endpoint
```

5. Update form action in `src/components/Contact.tsx`:
```typescript
<form
  onSubmit={handleSubmit}
  action={import.meta.env.VITE_FORMSPREE_ENDPOINT}
  method="POST"
>
```

### Option 3: Netlify Forms (if using Netlify)

1. Add to your form tag:
```typescript
<form
  name="contact"
  method="POST"
  data-netlify="true"
  onSubmit={handleSubmit}
>
  <input type="hidden" name="form-name" value="contact" />
  {/* rest of form */}
</form>
```

2. Forms will appear in your Netlify dashboard

## Environment Variables

For production deployment, add environment variables in your hosting platform:

### Vercel:
1. Go to Project Settings → Environment Variables
2. Add your variables

### Netlify:
1. Go to Site settings → Build & deploy → Environment
2. Add your variables

### GitHub Pages:
Use GitHub Secrets and GitHub Actions to inject environment variables during build.

## Post-Deployment Checklist

- [ ] Website loads correctly at your domain
- [ ] All sections display properly
- [ ] Contact form works (test with your email)
- [ ] Social media links point to correct profiles
- [ ] Mobile responsiveness verified
- [ ] SSL certificate is active (https://)
- [ ] SEO meta tags are correct
- [ ] All images load properly
- [ ] Navigation links work smoothly

## Monitoring and Analytics

### Google Analytics (Optional)

1. Create a Google Analytics account
2. Get your tracking ID
3. Add to `.env.local`:
```
VITE_GA_TRACKING_ID=your_tracking_id
```

4. Install analytics:
```bash
npm install react-ga4
```

5. Add to `src/main.tsx`:
```typescript
import ReactGA from 'react-ga4';

if (import.meta.env.VITE_GA_TRACKING_ID) {
  ReactGA.initialize(import.meta.env.VITE_GA_TRACKING_ID);
}
```

## Troubleshooting

### Build Fails
- Check Node version (should be 18+)
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run build`

### Domain Not Working
- DNS changes can take 24-48 hours to propagate
- Verify DNS records with: `dig jonathancuntodiaz.com`
- Check nameservers are pointing to your hosting provider

### SSL Certificate Not Issued
- Wait up to 24 hours
- Verify DNS is correctly configured
- Ensure domain ownership is verified

## Support

For issues specific to hosting platforms:
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

---

Good luck with your deployment! 🚀
