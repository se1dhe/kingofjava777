# KINGOFJAVA777 — Design System (Master)

## Brand Identity

**Streamer:** KINGOFJAVA777 (Stepan, Armenia)
**Game:** Lineage 2 (PvP, private servers)
**Community:** ~142K+ followers across platforms
**Brand values:** Gaming excellence, community, dark medieval aesthetic with modern tech

---

## Visual Design

### Color Palette — "Obsidian & Gold"

Dark cinematic foundation inspired by Shortcast, enhanced with gaming edge:

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-void` | `#08090C` | Deep background, main canvas |
| `--bg-dark` | `#0F1115` | Secondary background |
| `--bg-panel` | `#161921` | Card/panel surfaces |
| `--bg-raised` | `#1E2128` | Elevated elements |
| `--gold-primary` | `#D4AF37` | Primary accent (Lineage2 gold) |
| `--gold-light` | `#E8C582` | Champagne gold, highlights |
| `--gold-glow` | `rgba(212, 175, 55, 0.15)` | Glow effects |
| `--text-primary` | `#F5F3EE` | Ivory white, main text |
| `--text-secondary` | `#A8AFB8` | Muted text |
| `--text-muted` | `#6B7280` | Labels, metadata |
| `--border-subtle` | `rgba(212, 175, 55, 0.12)` | Gold-tinted borders |
| `--border-strong` | `rgba(212, 175, 55, 0.25)` | Active borders |
| `--accent-red` | `#C41E3A` | LIVE indicator, alerts |
| `--accent-blue` | `#4A90E2` | Links, interactive |
| `--shadow-gold` | `0 0 20px rgba(212, 175, 55, 0.2)` | Gold glow shadow |

### Typography — "Gaming Cinematic"

**Headings:** Russo One (Google Fonts)
- Gaming, bold, medieval strength
- Use for: H1, H2, hero titles, section headers
- Letter-spacing: 0.02em for cinematic feel

**Body:** Inter (Google Fonts)
- Clean, readable, modern
- Use for: paragraphs, descriptions, UI text
- Weights: 300 (light), 400 (regular), 500 (medium), 600 (semibold)

**Monospace:** JetBrains Mono (Google Fonts)
- Technical data, timecodes, stats
- Use for: viewer counts, timestamps, code-like elements

**Scale:**
- Hero: clamp(3rem, 8vw, 6rem)
- H1: clamp(2.5rem, 6vw, 4rem)
- H2: clamp(2rem, 5vw, 3rem)
- H3: 1.5rem
- Body: 1rem (16px)
- Small: 0.875rem (14px)
- Caption: 0.75rem (12px)

### Spacing System

8px base unit:
- `--space-xs`: 4px
- `--space-sm`: 8px
- `--space-md`: 16px
- `--space-lg`: 24px
- `--space-xl`: 32px
- `--space-2xl`: 48px
- `--space-3xl`: 64px
- `--space-4xl`: 96px

### Border Radius

- `--radius-sm`: 6px (buttons, inputs)
- `--radius-md`: 12px (cards)
- `--radius-lg`: 20px (panels, modals)
- `--radius-xl`: 32px (hero elements)
- `--radius-full`: 9999px (pills, avatars)

---

## Effects & Animations

### Particle System

**Background particles:** Floating golden dust motes
- Count: 50-80 particles
- Size: 2-6px
- Color: `--gold-light` with 0.3-0.6 opacity
- Movement: Slow drift upward with slight horizontal sway
- Speed: 20-40s per particle cycle
- Implementation: Canvas-based for performance

**Interactive particles:** On hover/click
- Burst effect on CTA buttons
- Trail effect on cursor movement (subtle)
- Implementation: CSS animations + JS event listeners

### Glow Effects

**Text glow:** Hero titles
```css
text-shadow: 
  0 0 10px rgba(212, 175, 55, 0.5),
  0 0 20px rgba(212, 175, 55, 0.3),
  0 0 30px rgba(212, 175, 55, 0.2);
```

**Box glow:** Cards, buttons on hover
```css
box-shadow: 
  0 0 20px rgba(212, 175, 55, 0.3),
  0 0 40px rgba(212, 175, 55, 0.15),
  inset 0 0 20px rgba(212, 175, 55, 0.1);
```

**Border glow:** Active elements
```css
border: 1px solid var(--gold-primary);
box-shadow: 0 0 10px var(--gold-glow);
```

### Motion Graphics

**Scroll animations:** Fade-in + slide-up on scroll
- Trigger: Intersection Observer
- Duration: 600ms
- Easing: cubic-bezier(0.16, 1, 0.3, 1) (expo-out)
- Stagger: 100ms between elements

**Hover transitions:** Smooth scale + glow
- Duration: 200ms
- Easing: ease-out
- Transform: scale(1.02) + glow increase

**Page load:** Staggered entrance
- Hero title: 0ms delay, fade + slide from bottom
- Subtitle: 200ms delay
- CTA buttons: 400ms delay
- Background particles: start immediately

### Reduced Motion

Respect `prefers-reduced-motion: reduce`:
- Disable particle animations
- Replace scroll animations with instant display
- Keep only essential transitions (hover states)
- Duration: 0ms or minimal (100ms)

---

## Components

### Buttons

**Primary (CTA):**
- Background: `--gold-primary`
- Text: `--bg-void`
- Padding: 12px 32px
- Border-radius: `--radius-sm`
- Font: Russo One, uppercase, letter-spacing 0.05em
- Hover: scale(1.05) + `--shadow-gold`
- Active: scale(0.98)

**Secondary:**
- Background: transparent
- Border: 2px solid `--gold-primary`
- Text: `--gold-primary`
- Hover: background `--gold-glow`

**Ghost:**
- Background: transparent
- Text: `--text-secondary`
- Hover: text `--gold-light`, background `rgba(255,255,255,0.05)`

### Cards

**Video card:**
- Background: `--bg-panel`
- Border: 1px solid `--border-subtle`
- Border-radius: `--radius-md`
- Padding: 0 (thumbnail is full-width)
- Hover: border `--border-strong` + `--shadow-gold`
- Thumbnail aspect ratio: 16:9
- Title: Russo One, 1.125rem
- Metadata: Inter, 0.875rem, `--text-muted`

**Social link card:**
- Background: `--bg-panel`
- Border: 1px solid `--border-subtle`
- Border-radius: `--radius-md`
- Padding: 20px
- Icon: 32px, `--gold-primary`
- Hover: translate Y -4px + glow

### Navigation

**Header:**
- Position: fixed, top
- Background: `rgba(8, 9, 12, 0.8)` + backdrop-filter: blur(12px)
- Border-bottom: 1px solid `--border-subtle`
- Height: 64px
- Logo: left, Russo One, `--gold-primary`
- Nav links: center, Inter medium
- Language picker: right, dropdown

**Mobile nav:**
- Hamburger menu
- Slide-in from right
- Background: `--bg-dark`
- Full-height overlay

### Video Player

**Embedded player (YouTube/TikTok):**
- Aspect ratio: 16:9
- Border-radius: `--radius-lg`
- Border: 2px solid `--border-subtle`
- Box-shadow: `--shadow-gold`
- Controls: native platform controls
- Lazy load: use loading="lazy" on iframe

**Stream player (hero):**
- Full-width, max-height: 600px
- Aspect ratio: 16:9
- Overlay: "LIVE" badge when streaming
- Fallback: thumbnail with play button when offline

---

## Layout

### Breakpoints

- Mobile: 375px (default)
- Tablet: 768px
- Desktop: 1024px
- Wide: 1440px

### Grid System

**Container:**
- Max-width: 1280px
- Padding: 20px (mobile), 40px (tablet+)
- Centered with margin: 0 auto

**Grid:**
- Columns: 12
- Gap: 24px
- Mobile: 1 column
- Tablet: 2-3 columns
- Desktop: 3-4 columns

### Page Structure

1. **Hero section:** Stream player (full-width), title overlay, CTA
2. **About section:** Bio, stats, community info
3. **Videos section:** Grid of YouTube/TikTok videos
4. **Social section:** Grid of social media links
5. **Footer:** Copyright, links, language selector

---

## Accessibility

### Contrast Ratios

- Primary text on background: 12.5:1 (AAA)
- Secondary text on background: 7.2:1 (AA Large, AAA)
- Gold accent on dark: 4.8:1 (AA)
- Always test with color blindness simulators

### Focus States

- Visible focus ring: 2px solid `--gold-primary`
- Offset: 2px
- All interactive elements must have focus indicators

### Keyboard Navigation

- Tab order matches visual order
- All functionality available via keyboard
- Skip links for main content
- Escape closes modals/menus

### Screen Readers

- All images have alt text
- Icons have aria-labels
- Video players have captions/subtitles
- Language switcher announces current language

---

## Localization

### Languages

1. **Russian (ru)** — Primary (streamer's language)
2. **English (en)** — International audience
3. **Armenian (am)** — Streamer's origin

### Implementation

- JSON locale files: `locales/{ru,en,am}.json`
- Language picker in header
- Persist selection in localStorage
- Default: Russian
- Fallback: English

### Content Strategy

- UI labels: fully translated
- Video titles: original language (no translation)
- Descriptions: translated if short, original if long
- Social media: platform names stay original

---

## Performance

### Image Optimization

- Format: WebP with JPEG fallback
- Lazy loading: all below-fold images
- Responsive: srcset for different screen sizes
- Compression: quality 80-85

### Animation Performance

- Use transform/opacity only (no layout thrashing)
- requestAnimationFrame for JS animations
- Canvas for particle system (GPU-accelerated)
- Will-change: transform on animated elements
- Limit concurrent animations to 3-5

### Bundle Size

- Inline critical CSS
- Defer non-critical JS
- Preload fonts (Russo One, Inter)
- No heavy frameworks (vanilla JS)

### Core Web Vitals Targets

- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1

---

## Anti-Patterns (Avoid)

- ❌ Minimalist design (too sparse for gaming brand)
- ❌ Static assets (no animations = boring)
- ❌ Emoji as icons (use SVG: Lucide/Heroicons)
- ❌ Neon cyberpunk (too sci-fi, not medieval)
- ❌ Bright colors (brand is dark cinematic)
- ❌ Sans-serif only (need Russo One for gaming feel)
- ❌ Hover-only interactions (must work on touch)
- ❌ Instant state changes (always transition 150-300ms)
- ❌ Gray-on-gray text (contrast issues)
- ❌ Horizontal scroll on mobile (layout failure)

---

## Implementation Checklist

- [ ] Dark background (#08090C) applied
- [ ] Gold accents (#D4AF37) used consistently
- [ ] Russo One for headings
- [ ] Inter for body text
- [ ] Particle system active (canvas-based)
- [ ] Glow effects on hover
- [ ] Scroll animations (fade + slide)
- [ ] Responsive (375px → 1440px)
- [ ] Language switcher (RU/EN/AM)
- [ ] Video players embedded (YouTube, TikTok)
- [ ] Stream player in hero
- [ ] Social links grid
- [ ] Accessibility (contrast, focus, keyboard)
- [ ] Performance (lazy load, optimized images)
- [ ] Reduced motion support
