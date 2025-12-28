# Dark Mode Color Scheme

## Color Palette Implementation

This document describes the comprehensive dark mode color scheme implemented across the entire application.

### Color Definitions

| Element | Color Name | Hex Code | Usage |
|---------|-----------|----------|-------|
| **Main Background** | Deep Charcoal | `#131314` | Primary background for main content areas |
| **Sidebar/Panels** | Raisin Black | `#1E1E1E` | Sidebar, dropdown menus, secondary panels |
| **Primary Text** | Off-White | `#E3E3E3` | Main text content, headings |
| **Secondary Text** | Steel Gray | `#C4C7C5` | Secondary text, placeholders, descriptions |
| **Accent (Blue)** | Google Blue | `#8AB4F8` | Links, hover states, focus rings, selections |
| **Surface (Hover)** | Graphite | `#333537` | Hover states, borders, separators |

### Implementation Details

#### CSS Variables (globals.css)
```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: #131314;      /* Deep Charcoal */
    --foreground: #E3E3E3;      /* Off-White */
    --sidebar: #1E1E1E;         /* Raisin Black */
    --text-secondary: #C4C7C5;  /* Steel Gray */
    --accent-blue: #8AB4F8;     /* Google Blue */
    --surface-hover: #333537;   /* Graphite */
  }
}
```

#### Tailwind Config
Extended color palette in `tailwind.config.ts`:
```typescript
dark: {
  bg: '#131314',           // Main background
  sidebar: '#1E1E1E',      // Sidebar background
  text: '#E3E3E3',         // Primary text
  'text-secondary': '#C4C7C5', // Secondary text
  accent: '#8AB4F8',       // Accent color
  hover: '#333537',        // Hover states
}
```

### Component-Specific Applications

#### Main Layout
- Background: `#131314` (Deep Charcoal)
- Sidebar: `#1E1E1E` (Raisin Black)
- Text: `#E3E3E3` (Off-White)

#### Chat Interface
- Message containers: `#131314` background
- AI response background: `#131314` with slight transparency
- Input area: Transparent with `#333537` borders
- Hover states: `#333537` (Graphite)

#### Dropdown Menus
- Background: `#1E1E1E` (Raisin Black)
- Hover: `#333537` (Graphite)
- Text: `#E3E3E3` (Off-White)
- Borders: `#333537` (Graphite)

#### Buttons & Interactive Elements
- Primary buttons: `#8AB4F8` (Google Blue) background
- Button text: `#131314` (inverted for contrast)
- Hover: Lighter shade of accent (`#a3c4fa`)
- Focus rings: `#8AB4F8` (Google Blue)

#### Scrollbars
- Track: `#1E1E1E` (Raisin Black)
- Thumb: `#333537` (Graphite)
- Thumb hover: `#8AB4F8` (Google Blue)

#### Text Selection
- Background: `#8AB4F8` (Google Blue)
- Text: `#131314` (Deep Charcoal - inverted for readability)

### Files Modified

1. **app/globals.css**
   - Updated CSS variables
   - Updated scrollbar styles
   - Added accent color rules
   - Updated modal backgrounds

2. **tailwind.config.ts**
   - Extended color palette with dark theme colors

3. **Components:**
   - `components/ChatHistoryDropdown.tsx`
   - `components/Layout/MainLayout.tsx`
   - `app/chat/ChatClientPage.tsx`
   - `app/page.tsx`
   - `app/layout.tsx`
   - `app/terms/page.tsx`
   - `app/privacy/page.tsx`
   - `app/shared/[id]/page.tsx`
   - `app/help/page.tsx`
   - `app/admin/feedback/page.tsx`
   - `app/chat/page.tsx`

### Color Mapping (Old → New)

| Old Color | New Color | Purpose |
|-----------|-----------|---------|
| `#0a0a0a` / `#0E2F29` | `#131314` | Main background |
| `#16423C` | `#1E1E1E` | Secondary backgrounds |
| `gray-900` / `gray-800` | `#1E1E1E` | Panel backgrounds |
| `gray-700` | `#333537` | Hover states |
| `white` | `#E3E3E3` | Primary text |
| `gray-300` / `gray-400` | `#C4C7C5` | Secondary text |
| Generic blue | `#8AB4F8` | Accent color |

### Accessibility Considerations

- **Contrast Ratios:**
  - Primary text (#E3E3E3) on background (#131314): ~13.5:1 (AAA)
  - Secondary text (#C4C7C5) on background (#131314): ~11:1 (AAA)
  - Accent (#8AB4F8) on background (#131314): ~9.5:1 (AAA)

- **Focus Indicators:** All interactive elements use visible `#8AB4F8` focus rings
- **Hover States:** Consistent `#333537` hover background provides clear visual feedback
- **Text Hierarchy:** Clear distinction between primary and secondary text colors

### Testing Checklist

- [x] Main chat interface displays correctly
- [x] Sidebar and navigation render with proper colors
- [x] Dropdown menus use correct backgrounds and hover states
- [x] Text is readable across all components
- [x] Scrollbars styled consistently
- [x] Focus states visible and accessible
- [x] Buttons display accent color correctly
- [x] Build completes without errors
- [ ] Test in production environment
- [ ] User acceptance testing

### Notes

- All color changes are applied via Tailwind classes for consistency
- CSS variables used for theme switching
- No hardcoded colors remain in components
- All colors follow the specified design system
