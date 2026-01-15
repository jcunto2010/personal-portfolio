# How to Add Screenshots to Your Portfolio

## 📁 Where to Place Images

Create the following folder structure and add your screenshots:

```
public/
  assets/
    projects/
      reservo/
        - reservo-hero-center.png (or .jpg)
        - reservo-hero-left.png
        - reservo-hero-right.png
        - reservo-home.png
        - reservo-chat.png
        - reservo-bookings.png
        - reservo-profile.png
      emprendia/
        - emprendia-hero.png
        - emprendia-1.png
        - emprendia-2.png
        - emprendia-3.png
        - emprendia-4.png
        - emprendia-5.png
        - emprendia-6.png
      xmotics/
        - xmotics-hero.png
        - xmotics-1.png
        - xmotics-2.png
        - xmotics-3.png
      startupconnect/
        - startupconnect-hero-center.png
        - startupconnect-hero-left.png
        - startupconnect-hero-right.png
```

## 📐 Recommended Image Sizes

### Phone Mockups (Hero Section)
- **Aspect Ratio:** 9:19.5 (portrait)
- **Recommended Size:** 1080x2340px (or similar 9:19.5 ratio)
- **Format:** PNG or JPG
- **File Size:** Keep under 500KB each for fast loading

### Desktop/Laptop Screenshots (Hero)
- **Aspect Ratio:** 16:9
- **Recommended Size:** 1920x1080px
- **Format:** PNG or JPG
- **File Size:** Keep under 800KB

### Grid Screenshots (App Screens Section)
- **Aspect Ratio:** 9:16 (portrait for mobile apps)
- **Recommended Size:** 720x1280px
- **Format:** PNG or JPG
- **File Size:** Keep under 300KB each

## 🔧 How to Update the Code

### 1. Reservo.AI - Hero Phone Mockups

Replace the placeholder divs in `src/components/project-sections/ProjectReservo.tsx`:

**Find this (around line 199):**
```tsx
{/* Screenshot placeholder */}
<div className="w-full h-full bg-gradient-to-br from-violet-950/30 to-slate-950 flex items-center justify-center">
  <div className="text-center p-4">
    <FaMobileAlt className="text-5xl md:text-6xl text-violet-500/50 mx-auto mb-4" />
    <p className="text-violet-300/60 text-sm font-medium">Main Screen</p>
    <p className="text-violet-400/30 text-xs mt-1">Screenshot Coming Soon</p>
  </div>
</div>
```

**Replace with:**
```tsx
<img 
  src="/assets/projects/reservo/reservo-hero-center.png" 
  alt="Reservo.AI Main Screen"
  className="w-full h-full object-cover"
/>
```

Do the same for the left and right phone mockups (use `reservo-hero-left.png` and `reservo-hero-right.png`).

### 2. Reservo.AI - App Screens Grid

**Find this (around line 375):**
```tsx
<div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center">
  <div className="text-center">
    <FaMobileAlt className="text-2xl text-violet-500/30 mx-auto mb-2" />
    <p className="text-violet-400/40 text-xs font-medium">{screen}</p>
  </div>
</div>
```

**Replace with:**
```tsx
<img 
  src={`/assets/projects/reservo/reservo-${screen.toLowerCase().replace(' ', '-')}.png`}
  alt={`Reservo.AI ${screen} Screen`}
  className="w-full h-full object-cover"
/>
```

Or create an array mapping:
```tsx
const screenImages = {
  'Home': '/assets/projects/reservo/reservo-home.png',
  'AI Chat': '/assets/projects/reservo/reservo-chat.png',
  'Bookings': '/assets/projects/reservo/reservo-bookings.png',
  'Profile': '/assets/projects/reservo/reservo-profile.png'
};
```

Then use:
```tsx
<img 
  src={screenImages[screen]}
  alt={`Reservo.AI ${screen} Screen`}
  className="w-full h-full object-cover"
/>
```

### 3. EmprendIA - Hero Laptop Screenshot

**Find this (around line 156):**
```tsx
{/* Screenshot placeholder */}
<div className="aspect-[16/9] bg-gradient-to-br from-slate-900 via-orange-950/20 to-slate-900 flex items-center justify-center">
  <div className="text-center p-8">
    <FaDesktop className="text-5xl md:text-6xl text-orange-500/50 mx-auto mb-4" />
    <p className="text-orange-300/60 text-sm font-medium">Dashboard</p>
    <p className="text-orange-400/30 text-sm mt-2">Screenshot Coming Soon</p>
  </div>
</div>
```

**Replace with:**
```tsx
<img 
  src="/assets/projects/emprendia/emprendia-hero.png" 
  alt="EmprendIA Dashboard"
  className="w-full h-full object-cover"
/>
```

### 4. EmprendIA - Infinite Scroll Gallery

Check the gallery section and replace placeholders with your images.

### 5. Xmotics - Hero Screenshot

Similar to EmprendIA, replace the placeholder with your website screenshot.

### 6. StartupConnect - Hero Phone Mockups

Same pattern as Reservo.AI - replace the three phone mockup placeholders.

## 💡 Tips

1. **Optimize Images:** Use tools like [TinyPNG](https://tinypng.com/) or [Squoosh](https://squoosh.app/) to compress images before adding them.

2. **Naming Convention:** Use lowercase with hyphens (e.g., `reservo-hero-center.png`)

3. **Test Locally:** After adding images, run `npm run dev` to test that they load correctly.

4. **Fallback:** If an image doesn't load, the placeholder will show. Make sure file paths are correct.

5. **Git:** Don't forget to commit your images to the repository!

## 🚀 Quick Start

1. Create the folder structure in `public/assets/projects/`
2. Add your optimized screenshots
3. Update the code in each project section file
4. Test locally
5. Commit and push!

Need help with a specific section? Let me know which project you want to start with!
