# AGENTS

## Design Philosophy - Apple Human Interface Guidelines

Goongoom follows Apple's Human Interface Guidelines, embracing clarity, deference, and depth:
- **Clarity**: Content is the focus. Typography is legible, icons are precise, and UI elements are purposeful.
- **Deference**: The UI defers to content. Minimal chrome, subtle borders, and restrained color usage.
- **Depth**: Visual layers provide hierarchy through soft shadows and subtle elevation.
- **Mobile-First**: Touch-friendly interactions (44px minimum targets), responsive layouts, and gesture-based navigation.
- **Refined Motion**: Smooth, physics-based animations that feel responsive and natural.

## Direct Server Render Strategy (SSR-First)
- Default to Server Components (RSC) for all data fetching and layout structure.
- `use client` is reserved for leaf components requiring direct interactivity (e.g., forms, toggles, complex animations).
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

**Best Practices**:
- Use gradients sparingly for emphasis (1-2 per screen)
- Prefer solid colors for text-heavy content
- Gradients auto-adjust for dark mode

## Animation System

Animation utility classes are available in `globals.css` for micro-interactions:

**Available Classes**:
- `animate-fade-in`, `animate-fade-out`: Opacity transitions
- `animate-slide-up`, `animate-slide-down`, `animate-slide-left`, `animate-slide-right`: Directional slides
- `animate-slide-up-fade`, `animate-slide-down-fade`: Combined slide + fade
- `animate-scale-in`, `animate-scale-out`: Scale transitions
- `animate-bounce`: Bouncy spring effect
- `animate-pulse`: Subtle pulsing
- `animate-shimmer`: Loading shimmer effect
- `animate-wiggle`: Playful shake
- `animate-pop`: Delightful pop-in

**Usage**: Apply directly to elements via className:
```tsx
<Card className="animate-slide-up-fade">
  <p>Content</p>
</Card>
```

**Performance Guidelines**:
- All animations are GPU-accelerated (transform, opacity only)
- Respects `prefers-reduced-motion` for accessibility
- Target 60fps for smooth interactions

## Component Guidelines

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

## ETC
- Use Bun.

---

# Ultracite Code Standards

This project uses **Ultracite**, a zero-config preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: `bun x ultracite fix`
- **Check for issues**: `bun x ultracite check`
- **Diagnose setup**: `bun x ultracite doctor`

Biome (the underlying engine) provides robust linting and formatting. Most issues are automatically fixable.

---

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

### Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility:
  - Provide meaningful alt text for images
  - Use proper heading hierarchy
  - Add labels for form inputs
  - Include keyboard event handlers alongside mouse events
  - Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles

### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

### Security

- Add `rel="noopener"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Don't use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)
- Use proper image components (e.g., Next.js `<Image>`) over `<img>` tags

### Framework-Specific Guidance

**Next.js:**
- Use Next.js `<Image>` component for images
- Use `next/head` or App Router metadata API for head elements
- Use Server Components for async data fetching instead of async Client Components

**React 19+:**
- Use ref as a prop instead of `React.forwardRef`

**Solid/Svelte/Vue/Qwik:**
- Use `class` and `for` attributes (not `className` or `htmlFor`)

---

## Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting

## When Biome Can't Help

Biome's linter will catch most issues automatically. Focus your attention on:

1. **Business logic correctness** - Biome can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Component structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **User experience** - Accessibility, performance, and usability considerations
6. **Documentation** - Add comments for complex logic, but prefer self-documenting code

---

Most formatting and common issues are automatically fixed by Biome. Run `bun x ultracite fix` before committing to ensure compliance.
