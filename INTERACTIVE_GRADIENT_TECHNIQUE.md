# Interactive Gradient Text Effect - Implementation Guide

## ✨ What We Built
An interactive text gradient effect that:
- Shows gradient **inside the letters** (using `background-clip: text`)
- Follows mouse cursor on hover (radial gradient centered at cursor position)
- Pulses with animation when not hovering
- Text remains visible at all times

## 🔑 Key Implementation Details

### Critical CSS Properties (in this exact order):

```typescript
style={{
  backgroundImage: 'radial-gradient(...)', // or linear-gradient
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  color: 'transparent',
}}
```

### Essential Requirements:

1. **`inline-block` display**: MUST be set in className or style
   - Without this, gradient shows as a full block
   - `display: block` also works, but not default `display: inline`

2. **`backgroundImage` not `background`**: Use specific property for better browser support

3. **Both `color: transparent` AND `WebkitTextFillColor: transparent`**: Needed for cross-browser compatibility

4. **TypeScript**: Cast style as `React.CSSProperties` to avoid type errors

### Mouse Tracking Implementation:

```typescript
const [isHovering, setIsHovering] = useState(false)
const [gradientPosition, setGradientPosition] = useState({ x: 50, y: 50 })
const titleRef = useRef<HTMLHeadingElement>(null)

const handleMouseMove = (e: React.MouseEvent<HTMLHeadingElement>) => {
  if (!titleRef.current) return
  
  const rect = titleRef.current.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * 100
  const y = ((e.clientY - rect.top) / rect.height) * 100
  
  setGradientPosition({ x, y })
}
```

### Gradient Configuration:

**On Hover (Mouse Tracking):**
```typescript
backgroundImage: `radial-gradient(circle 1000px at ${x}% ${y}%, #60a5fa, #a78bfa, #ec4899, #06b6d4, #60a5fa)`
```

**Idle (Pulsing):**
```typescript
backgroundImage: 'linear-gradient(90deg, #60a5fa, #a78bfa, #ec4899, #06b6d4, #60a5fa)',
backgroundSize: '200% 100%',
// Animation: gradientPulse 2s ease-in-out infinite
```

### Animation Keyframes:

```css
@keyframes gradientPulse {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
```

## 🎨 Color Palette Used

Only bright, vibrant colors to ensure text visibility:
- `#60a5fa` - Bright blue
- `#a78bfa` - Bright purple
- `#ec4899` - Bright pink
- `#06b6d4` - Bright cyan

**Important**: Avoid dark colors or the text will become invisible in certain gradient positions!

## ⚠️ Common Pitfalls

1. ❌ Forgetting `inline-block` - gradient shows as full block
2. ❌ Using `background` instead of `backgroundImage` - inconsistent rendering
3. ❌ Small gradient radius - creates invisible text areas
4. ❌ Dark colors in gradient - makes text hard/impossible to see
5. ❌ Missing `color: transparent` - text may show with system color

## ✅ Complete Working Example

```tsx
<h2 
  ref={titleRef}
  onMouseMove={handleMouseMove}
  onMouseEnter={() => setIsHovering(true)}
  onMouseLeave={() => setIsHovering(false)}
  className={`font-bold cursor-pointer inline-block ${
    isHovering ? '' : 'animate-gradient-pulse'
  }`}
  style={{
    ...(isHovering
      ? {
          backgroundImage: `radial-gradient(circle 1000px at ${gradientPosition.x}% ${gradientPosition.y}%, #60a5fa, #a78bfa, #ec4899, #06b6d4, #60a5fa)`,
        }
      : {
          backgroundImage: 'linear-gradient(90deg, #60a5fa, #a78bfa, #ec4899, #06b6d4, #60a5fa)',
          backgroundSize: '200% 100%',
        }),
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    color: 'transparent',
  } as React.CSSProperties}
>
  Your Text Here
</h2>
```

## 📝 Notes

- Gradient size (1000px) can be adjusted based on text size
- Animation duration (2s) can be customized
- Mouse tracking calculates percentage position relative to element bounds
- Works on any text element (h1, h2, p, span, etc.)

## 🔄 Reusability

This technique can be applied to:
- Headings and titles
- Call-to-action text
- Navigation items
- Buttons (text part)
- Any text element where you want interactive gradient effects

---

Created for: Jonathan Cunto Diaz Portfolio
Effect Applied To: "Frontend Developer" title in Hero section
