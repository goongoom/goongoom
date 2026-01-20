# AGENTS

## Design Philosophy - Calm Pastel & Paper Aesthetic

Goongoom embraces a calm, tactile, and organized aesthetic inspired by paper notes and post-it arrangements:
- **Calm Pastels**: Soft, soothing colors like electric blue, neon pink, lime, sunset orange, and purple.
- **Paper-Like Textures**: UI elements that feel like physical paper - subtle shadows, slight rotations, and overlapping "post-it" cards.
- **Thoughtful UI**: Clean layouts, generous whitespace, and readable typography that prioritizes clarity over visual noise.
- **Mobile-First**: Touch-friendly interactions (44px minimum targets), responsive layouts, and gesture-based navigation.
- **Tactile Feedback**: Subtle, organic animations that mimic physical movement rather than digital flashes.

## Direct Server Render Strategy (SSR-First)
- Default to Server Components (RSC) for all data fetching and layout structure.
- **Avoid `cacheComponents`**: Prefer standard Server Components and SSR for reliability and simplicity.
- `use client` is reserved for leaf components requiring direct interactivity (e.g., forms, toggles, complex animations).
- Keep it simple: no `loading.tsx`, no `<Suspense>`. Let pages render directly via SSR for the fastest perceived load time.
- Use server actions + `<form action={...}>` for all mutations; avoid client-side form libraries.
- Deduplicate shared reads with React's `cache()` and parallelize independent fetches with `Promise.all`.

## Color System

Use semantic pastel colors to create a calm and inviting atmosphere. These tokens are designed to look like soft, paper-like highlights:
- **Electric Blue** (`bg-electric-blue`, `text-electric-blue`): Primary actions, links, and stable UI elements.
- **Neon Pink** (`bg-neon-pink`, `text-neon-pink`): Friendly accents, playful highlights, and notifications.
- **Lime** (`bg-lime`, `text-lime`): Success states, growth indicators, and confirmations.
- **Sunset Orange** (`bg-sunset-orange`, `text-sunset-orange`): Warm accents, trending content, and gentle alerts.
- **Purple** (`bg-purple`, `text-purple`): Creative features, special details, and organized categories.

All colors support dark mode with optimized contrast (AA/AAA compliant).

**Foreground Text**: Use `-foreground` variants for text on colored backgrounds:
- `text-electric-blue-foreground` (on electric blue)
- `text-neon-pink-foreground` (on neon pink)
- `text-lime-foreground` (on lime)
- `text-sunset-orange-foreground` (on sunset orange)
- `text-purple-foreground` (on purple)

**Color Pairing Recommendations**:
- Electric Blue + Neon Pink: Gentle, balanced combinations
- Lime + Electric Blue: Natural, calm tech feel
- Purple + Sunset Orange: Creative, warm combinations
- Neon Pink + Purple: Organized, artistic pairings

## Gradient System

10 gradients available for cards, buttons, and backgrounds, designed to be used as gentle accents:

**Available Gradients**:
- `sunset`: Warm sunset vibes (sunset-orange → neon-pink) - Featured sections
- `ocean`: Calm ocean waves (electric-blue → deep-azure) - Cool, calm sections
- `forest`: Fresh forest greens (lime → sage) - Success states, growth
- `candy`: Sweet candy pop (neon-pink → purple) - Playful, social elements
- `electric`: Electric energy (electric-blue → purple) - Primary CTAs
- `neon`: Neon lights (neon-pink → sunset-orange) - Notifications
- `cosmic`: Cosmic space (purple → electric-blue) - Premium features
- `tropical`: Tropical paradise (lime → sunset-orange) - Fresh content
- `fire`: Warm fire (sunset-orange → deep-orange) - Trending content
- `aurora`: Northern lights (electric-blue → lime) - Highlights

**Usage Examples**:
```tsx
import { GradientCard } from "@/components/ui/gradient-card";
import { GradientButton } from "@/components/ui/gradient-button";

<GradientCard variant="sunset">
  <h2>Featured Content</h2>
</GradientCard>

<GradientButton variant="electric">
  Click Me
</GradientButton>
```

**Best Practices**:
- Use gradients sparingly for emphasis (1-2 per screen)
- Prefer solid colors for text-heavy content
- Gradients auto-adjust for dark mode

## Animation System

15 animation variants for smooth, delightful micro-interactions:

**Available Animations**:
- `fadeIn`, `fadeOut`: Opacity transitions
- `slideUp`, `slideDown`, `slideLeft`, `slideRight`: Directional slides
- `slideUpFade`, `slideDownFade`: Combined slide + fade
- `scaleIn`, `scaleOut`: Scale transitions
- `bounce`: Bouncy spring effect
- `pulse`: Subtle pulsing
- `shimmer`: Loading shimmer effect
- `wiggle`: Playful shake
- `pop`: Delightful pop-in

**Durations**: `fast` (150ms), `normal` (250ms), `slow` (400ms)
**Easings**: `ease-out`, `ease-in-out`, `spring` (bouncy)

**Usage Examples**:
```tsx
import { AnimatedButton } from "@/components/ui/animated-button";
import { AnimatedCard } from "@/components/ui/animated-card";

<AnimatedButton animation="pop" duration="normal" easing="spring">
  Click Me
</AnimatedButton>

<AnimatedCard animation="slideUpFade" delay={100}>
  <p>Content</p>
</AnimatedCard>
```

**Performance Guidelines**:
- All animations are GPU-accelerated (transform, opacity only)
- Respects `prefers-reduced-motion` for accessibility
- Use staggered delays for list animations: `delay={index * 50}`
- Target 60fps for smooth interactions

## Component Guidelines

**Vibrant Components**:
- `<GradientCard>`: Cards with gradient backgrounds (10 variants)
- `<GradientButton>`: Buttons with gradient backgrounds (10 variants)
- `<AnimatedButton>`: Buttons with entrance animations (15 variants)
- `<AnimatedCard>`: Cards with entrance animations (15 variants)
- `<VibrantBadge>`: Badges with vibrant colors (5 colors)

**When to Use Animated Components**:
- Use for primary CTAs and important interactive elements
- Apply to cards in lists/grids for staggered reveals
- Add to modals/dialogs for smooth entrances
- Avoid on static content or text-heavy sections

**Touch Target Sizing**:
- Minimum 44px × 44px for all interactive elements
- Use `min-h-11` (44px) for buttons
- Add padding to increase touch area: `p-3` or `p-4`

**Mobile-First Responsive Design**:
- Design for mobile (375px) first, then scale up
- Use responsive utilities: `text-sm md:text-base lg:text-lg`
- Stack on mobile, grid on desktop: `flex flex-col md:grid md:grid-cols-2`

## Development Principles

**Layout & Sizing**:
- Use `h-full` and `flex-1` for full-height layouts
- NEVER use `h-screen`, `100vh`, `100dvh`, or `min-h-screen`
- Root layout stays minimal, children use `flex-1` as needed
- This ensures proper behavior with iOS safe areas and dynamic viewports

**Tailwind Primitives Only**:
- Use Tailwind utility classes exclusively
- NO arbitrary values: Avoid `[#ff0000]`, `[32px]`, `[1.5rem]`
- Use design tokens: `bg-electric-blue`, `text-neon-pink`, `rounded-lg`
- If you need a custom value, add it to `tailwind.config.ts`

**Server Components Default**:
- Default to Server Components for all pages and layouts
- Use `"use client"` only for interactive components (buttons, forms, animations)
- Keep client components small and focused (leaf components)

**Performance Best Practices**:
- Deduplicate shared reads with `cache()` from React
- Parallelize independent fetches with `Promise.all()`
- Use server actions for mutations: `<form action={serverAction}>`
- Avoid client-side form libraries (React Hook Form, Formik)

## UI Kit Usage
- Prefer `components/ui` primitives for surfaces, fields, alerts, empty states, and skeletons.

## Avatars
- User avatars must come from Clerk `imageUrl`. Only use dicebear for anonymous users.
