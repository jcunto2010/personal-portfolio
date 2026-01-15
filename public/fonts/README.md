# Fonts Directory

## PP Object Sans & PP Neue Machina

These premium fonts from **Pangram Pangram Foundry** need to be purchased and added here.

### Where to Get the Fonts

1. Visit [Pangram Pangram Foundry](https://pangrampangram.com/)
2. Purchase **PP Object Sans** (for headings)
3. Purchase **PP Neue Machina** (for body text)

### Installation

1. Download the font files (preferably .woff2 and .woff formats)
2. Place them in this directory (`public/fonts/`)
3. Uncomment the `@font-face` declarations in `src/index.css`
4. Update the file paths in the `@font-face` declarations to match your font file names

### Required Font Files

**PP Object Sans:**
- PPObjectSans-Regular.woff2
- PPObjectSans-Regular.woff
- PPObjectSans-Bold.woff2
- PPObjectSans-Bold.woff

**PP Neue Machina:**
- PPNeueMachina-Regular.woff2
- PPNeueMachina-Regular.woff

### Alternative Free Fonts

If you prefer free alternatives while testing:

**Instead of PP Object Sans:**
- Space Grotesk
- Outfit
- Sora

**Instead of PP Neue Machina:**
- DM Sans
- Inter
- Manrope

Update the font-family values in `tailwind.config.js` and `src/index.css` to use these alternatives.

### Note

The site will use system fallback fonts until you add the premium fonts. The fallback is:
- `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
