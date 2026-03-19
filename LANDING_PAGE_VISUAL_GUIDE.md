# Landing Page Visual Guide

## Page Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  NAVIGATION BAR                                                 │
│  [Logo] RewaBank          [Login Button] [Register Button]     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│              HERO SECTION                                       │
│                                                                 │
│          Welcome to RewaBank                                    │
│    Experience modern banking with zero complexity              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│          Why Choose RewaBank?                                   │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ 💰       │  │ 📈       │  │ 🔒       │  │ 💳       │       │
│  │ Instant  │  │ Invest   │  │ Security │  │ Multiple │       │
│  │Transfers │  │ Options  │  │Features  │  │  Cards   │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                 │
│  ┌──────────┐  ┌──────────┐                                    │
│  │ 🔔       │  │ 🎧       │                                    │
│  │Real-time │  │24/7      │                                    │
│  │ Alerts   │  │Support   │                                    │
│  └──────────┘  └──────────┘                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    STATS SECTION (Blue Gradient)               │
│                                                                 │
│        50K+              15+              100%                  │
│     Active Users      Countries         Uptime                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│              Ready to Get Started?                              │
│          Join thousands of satisfied customers today           │
│                                                                 │
│              [CREATE ACCOUNT NOW]                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│               FOOTER (Dark Background)                          │
│  © 2024 RewaBank. All rights reserved.  [Privacy] [Terms] [Contact]
└─────────────────────────────────────────────────────────────────┘
```

## Responsive Behavior

### Desktop View (1024px+)
- Navigation: Full width with logo and buttons spread
- Hero: Large heading (48px), full width
- Features: 6 columns (one card per column)
- Stats: 3 columns
- Spacing: 80px vertical padding
- Grid gap: 24px

### Tablet View (768px - 1023px)
- Navigation: Adjusted spacing
- Hero: Heading 40px
- Features: 3 columns (2 per row)
- Stats: 3 columns
- Spacing: 40px vertical padding
- Grid gap: 24px

### Mobile View (480px - 767px)
- Navigation: Logo and buttons compact
- Hero: Heading 32px
- Features: 2 columns
- Stats: Stacked or 2 per row
- Spacing: 40px vertical padding
- Grid gap: 16px

### Small Mobile View (< 480px)
- Navigation: Logo only (text hidden)
- Hero: Heading 24px
- Features: 1 column (full width)
- Stats: Stacked vertically
- Spacing: 16px vertical padding
- Grid gap: 16px

## Color Palette

```
Primary (Accent)           Hover State
┌──────────────┐           ┌──────────────┐
│              │           │              │
│  #5c6bc0     │  ──────→  │  #3f51b5     │
│              │           │              │
└──────────────┘           └──────────────┘
(Indigo 400)               (Indigo 600)

Light Accent                Background
┌──────────────┐           ┌──────────────┐
│              │           │              │
│ rgba(92,     │           │  #f4f6fb     │
│  107, 192,   │           │              │
│  0.08)       │           │              │
└──────────────┘           └──────────────┘

Card                       Border
┌──────────────┐           ┌──────────────┐
│              │           │              │
│  #ffffff     │           │  #e5e7ef     │
│              │           │              │
└──────────────┘           └──────────────┘

Text Primary               Text Secondary
┌──────────────┐           ┌──────────────┐
│              │           │              │
│  #1a1e2e     │           │  #6b7280     │
│              │           │              │
└──────────────┘           └──────────────┘

Text Muted
┌──────────────┐
│              │
│  #9ca3af     │
│              │
└──────────────┘
```

## Feature Cards

Each feature card contains:
```
┌─────────────────────────┐
│                         │
│        [Icon]           │  56x56px icon in light accent bg
│                         │
│    Feature Title        │  16px, font-weight: 600
│                         │
│   Feature Description   │  13px, muted text
│   text wraps multiple   │  line-height: 1.6
│   lines with good       │
│   readability           │
│                         │
└─────────────────────────┘

Hover State:
- Background gradient to light accent
- Border color changes to accent-border
- Elevation increases (higher shadow)
- Icon scales up slightly (1.1x)
- Card lifts up (translateY -8px)
```

## Interactive Elements

### Buttons

#### Login Button (Outline)
```
┌──────────────┐
│   LOGIN      │  Outline style
└──────────────┘
  Hover:
  - Background: light accent
  - Border: accent-border color
  - Smooth 180ms transition
```

#### Register Button (Filled)
```
┌──────────────┐
│  REGISTER    │  Filled with accent color
└──────────────┘
  Hover:
  - Background: darker accent
  - Shadow elevation
  - Slight upward movement (translateY -2px)
```

#### CTA Button
```
┌──────────────────────────┐
│ CREATE ACCOUNT NOW       │  Large CTA button
└──────────────────────────┘
  Similar to Register button
```

## Typography

### Heading Hierarchy
- **Hero Title**: 48px, bold, gradient text, letter-spacing: -1px
- **Section Titles**: 32px, bold, letter-spacing: -0.5px
- **Feature Title**: 16px, semi-bold
- **Stat Value**: 42px, extra-bold, white text
- **Stat Label**: 14px, medium weight, white text
- **Body Text**: 14-16px, regular, text-secondary color
- **Small Text**: 12-14px, muted color

### Font Family
`'DM Sans', 'Segoe UI', system-ui, sans-serif`

## Spacing System

```
Hero Section:     80px top/bottom padding (desktop)
Features Grid:    60px margin-bottom from title
                  24px gap between cards
                  32px padding per card
Stats Section:    80px top/bottom padding
                  40px gap between stat items
CTA Section:      80px top/bottom padding
                  40px section padding
Footer:           40px padding
```

## Hover Effects & Animations

### Feature Cards
```
Timeline:        180ms ease
Transforms:      
  - translateY(-8px)      // Card lifts
  - scale(1.1) on icon    // Icon grows
Shadow:          Box shadow increases
Border:          Color transitions to accent-border
Background:      Gradient overlay appears
```

### Buttons
```
Timeline:        180ms ease
Hover effects:
  - Background color transition
  - Shadow elevation change
  - Slight translateY (-1px to -2px)
Active:
  - Shadow removed
  - No translation (natural feel)
Disabled:
  - Opacity 0.5
  - Cursor not-allowed
```

## Grid Layouts

### Feature Grid System
```
Desktop (1024px+):      6 equal columns
grid-template-columns: repeat(6, 1fr)

Tablet (768px):         3 equal columns  
grid-template-columns: repeat(3, 1fr)

Mobile (480px):         2 equal columns
grid-template-columns: repeat(2, 1fr)

Small (<480px):         1 full column
grid-template-columns: 1fr
```

### Stats Grid System
```
Desktop/Tablet:         3 equal columns
grid-template-columns: repeat(3, 1fr)

Mobile:                 3 columns (responsive)
                        or 1-3 based on space
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))
```

## Accessibility

- ✅ Semantic HTML structure
- ✅ Adequate color contrast (WCAG AA)
- ✅ Material Icons for visual clarity
- ✅ Focus states on interactive elements
- ✅ Responsive text sizing
- ✅ Proper heading hierarchy
- ✅ Link underlines on hover
- ✅ Readable font sizes (minimum 14px)

## Performance Considerations

- CSS Grid for efficient layout
- Hardware-accelerated transforms (translateY, scale)
- Optimized transitions (180ms)
- OnPush change detection strategy
- No unnecessary DOM mutations
- Responsive images (icons via Material)

---

This visual guide demonstrates the complete layout, styling, and interactive behavior of the landing page.

