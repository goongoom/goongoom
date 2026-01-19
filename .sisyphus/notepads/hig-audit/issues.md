# Apple HIG Violations & Desktop UX Issues

## 1. Touch Target Sizing Violations (< 44px on mobile)

### CRITICAL: Button Component Default Sizes
**Location**: `components/ui/button.tsx`
- **Issue**: Default button size is `h-9` (36px) on mobile, `h-8` (32px) on desktop
  - Line 19: `default: "h-9 px-[calc(--spacing(3)-1px)] sm:h-8"`
  - Line 28: `sm: "h-8 gap-1.5 px-[calc(--spacing(2.5)-1px)] sm:h-7"` (32px → 28px)
  - Line 30: `xs: "h-7 gap-1 rounded-md px-[calc(--spacing(2)-1px)] text-sm before:rounded-[calc(var(--radius-md)-1px)] sm:h-6 sm:text-xs"` (28px → 24px)
- **HIG Requirement**: Minimum 44px touch target
- **Impact**: ALL buttons using default/sm/xs sizes violate HIG
- **Files Affected**: 
  - `components/auth/auth-buttons.tsx` (lines 28, 33 - nav buttons use `size="sm"`)
  - `app/[username]/page.tsx` (line 235 - login button uses `size="sm"`)
  - `components/theme-toggle.tsx` (line 31, 43 - uses `size="icon-sm"`)

### CRITICAL: Toggle Component Sizes
**Location**: `components/ui/toggle.tsx`
- **Issue**: All sizes below 44px on mobile
  - Line 17: `default: "h-9 min-w-9 px-[calc(--spacing(2)-1px)] sm:h-8 sm:min-w-8"` (36px)
  - Line 19: `sm: "h-8 min-w-8 px-[calc(--spacing(1.5)-1px)] sm:h-7 sm:min-w-7"` (32px)
- **Impact**: All toggle buttons violate HIG

### CRITICAL: Global Navigation Logo
**Location**: `components/layout/global-nav.tsx`
- **Issue**: Logo container is `h-8 w-8` (32px × 32px) - line 16
- **Impact**: Primary navigation element is not touch-friendly

### Menu/Dropdown Items
**Location**: `components/ui/menu.tsx`
- **Issue**: Menu items use `min-h-8` (32px) on mobile, `min-h-7` (28px) on desktop
  - Line 75: MenuItem base class
  - Line 99: MenuCheckboxItem
  - Line 154: MenuRadioItem
  - Line 238: MenuSub
- **Impact**: All dropdown menu interactions violate HIG

### Select/Combobox/Autocomplete Items
**Location**: Multiple files
- **Issue**: Dropdown items use `min-h-8` (32px) on mobile
  - `components/ui/select.tsx` (line 27, 115)
  - `components/ui/combobox.tsx` (line 184)
  - `components/ui/autocomplete.tsx` (line 118)
- **Impact**: Form field dropdowns not touch-friendly

### Sidebar Components
**Location**: `components/ui/sidebar.tsx`
- **Issue**: Multiple undersized interactive elements
  - Line 413: SidebarGroupLabel `h-8` (32px)
  - Line 497: SidebarMenuButton default `h-8` (32px)
  - Line 499: SidebarMenuButton sm `h-7` (28px)
  - Line 630: SidebarMenuSkeleton `h-8` (32px)
  - Line 695: SidebarMenuSubButton `h-7` (28px)

### Table Headers
**Location**: `components/ui/table.tsx`
- **Issue**: Table headers `h-10` (40px) - line 79
- **Note**: Close to 44px but still below minimum

### Small Padding Issues
**Location**: Multiple files
- **Issue**: Interactive elements with `p-1` (4px) or `p-2` (8px) padding reduce effective touch area
  - `components/ui/toolbar.tsx` (line 11): `p-1`
  - `components/ui/frame.tsx` (line 9): `p-1`
  - `components/ui/sidebar.tsx` (lines 241, 343, 354, 398): `p-2`
  - Menu/Select/Combobox items with `py-1` (4px vertical padding)

---

## 2. Desktop UX Issues

### Missing Hover States
**Status**: ✅ GOOD - Most components have hover states
- Buttons: `[:hover,[data-pressed]]:bg-primary/90`
- Links: `hover:text-foreground`
- Cards: `hover:bg-accent/50`
- Menu items: `hover:bg-accent`
- Table rows: `hover:bg-muted/72`

**Missing hover states found**:
- Footer links in `app/page.tsx` (line 116): Only `transition-colors`, no explicit hover state defined
  - Should add `hover:text-foreground` or similar

### Keyboard Accessibility
**Status**: ✅ EXCELLENT - Comprehensive focus-visible states
- All interactive components have `focus-visible:ring-2 focus-visible:ring-ring`
- Proper focus offset: `focus-visible:ring-offset-1 focus-visible:ring-offset-background`
- Consistent across buttons, inputs, toggles, checkboxes, radio buttons
- Tab order appears natural (no custom tabIndex except sidebar overlay at -1)

### Responsive Layout Issues
**Status**: ✅ GOOD - Mobile-first approach implemented
- Proper responsive patterns: `sm:h-8`, `md:grid-cols-2`, etc.
- Mobile-first sizing with desktop overrides
- Flexible layouts using `flex-col sm:flex-row`

**Potential issues**:
- Some components scale DOWN on desktop (e.g., `h-9 sm:h-8`) which is backwards
  - Buttons should be larger on desktop, not smaller
  - This affects: Button, Toggle, Tabs, Sidebar components

### Desktop-Specific Concerns
1. **Icon-only buttons lack visible labels on desktop**:
   - `components/theme-toggle.tsx`: Icon-only button (has aria-label ✅)
   - `components/questions/share-instagram-button.tsx`: Icon-only button (has aria-label ✅)
   - `app/[username]/page.tsx` (line 205-213): Social link buttons (has aria-label ✅)

2. **Coarse pointer detection**:
   - Components use `pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11` to expand touch targets
   - This is GOOD but doesn't fix the base size issue on mobile

---

## 3. Contrast & Accessibility

**Status**: Not audited in this pass (requires color analysis)
- Need to check contrast ratios for:
  - `text-muted-foreground` on various backgrounds
  - `text-xs` small text readability
  - Badge colors
  - Gradient text overlays

---

## 4. Summary of Critical Issues

### High Priority (HIG Violations)
1. **Button default size**: 36px → needs to be 44px on mobile
2. **Toggle default size**: 36px → needs to be 44px on mobile
3. **Menu/dropdown items**: 32px → needs to be 44px on mobile
4. **Global nav logo**: 32px → needs to be 44px on mobile
5. **Sidebar interactive elements**: 28-32px → needs to be 44px on mobile

### Medium Priority (UX Issues)
1. **Backwards responsive sizing**: Components shrink on desktop instead of growing
2. **Footer links**: Missing explicit hover state
3. **Table headers**: 40px (close but below 44px)

### Low Priority (Best Practices)
1. **Small padding**: `p-1`, `p-2` on interactive containers
2. **Text size**: `text-xs` may be too small for accessibility

---

## 5. Recommended Fixes

### Immediate Actions
1. Update Button component default sizes:
   - Mobile: `h-11` (44px) minimum
   - Desktop: Can stay same or larger
   - Remove `sm:h-8` downsizing

2. Update Toggle component sizes:
   - Mobile: `h-11 min-w-11` (44px)
   - Desktop: Can stay same or larger

3. Update Menu/Select/Combobox item heights:
   - Mobile: `min-h-11` (44px)
   - Desktop: Can stay same or larger

4. Update Global Nav logo:
   - Mobile: `h-11 w-11` (44px)
   - Desktop: Can stay same or larger

5. Update Sidebar interactive elements:
   - Mobile: `h-11` (44px) minimum
   - Desktop: Can stay same or larger

### Design System Changes
1. Establish minimum touch target constant: `MIN_TOUCH_TARGET = 44px`
2. Update all size variants to respect this minimum on mobile
3. Reverse responsive pattern: grow on desktop, don't shrink
4. Add explicit hover states to all interactive elements
5. Audit and fix contrast ratios for all text/background combinations
