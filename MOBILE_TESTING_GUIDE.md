# Mobile UI Glitch - Testing Guide

## Device Setup

### Test Device Options:
1. **Chrome DevTools** (Recommended for quick testing)
   - Open: `F12` → Click device toolbar icon
   - Select: iPhone 12, iPhone SE, or Pixel 5
   - Test different orientations: Portrait & Landscape

2. **Real Mobile Device**
   - iPhone 12/13/14+
   - Android phone with Chrome/Firefox
   - Tablet (iPad, Android tablet)

### Network Conditions:
- Test on 4G/LTE to simulate real conditions
- Test with DevTools throttling: "Slow 4G"

---

## Test Suite

### Test 1: Sidebar Opening ✓
**Steps:**
1. Navigate to `/chat` page
2. Tap hamburger menu (☰) in top-left
3. Observe sidebar animation

**Expected Results:**
- ✓ Sidebar slides in smoothly from left
- ✓ Overlay (dark tint) covers main content
- ✓ Header remains fully visible and clickable
- ✓ Body scroll is locked (no scroll behind sidebar)
- ✓ Sidebar width is 288px (w-72)

**Pass/Fail:** _____

---

### Test 2: Chat Selection → Auto-Dismiss ✓
**Steps:**
1. With sidebar open, click any chat item
2. Observe sidebar behavior

**Expected Results:**
- ✓ Sidebar slides out immediately (no delay)
- ✓ Selected chat loads and displays
- ✓ Overlay fades away
- ✓ Body scroll is unlocked
- ✓ No invisible overlay remains

**Pass/Fail:** _____

---

### Test 3: New Chat Button → Auto-Dismiss ✓
**Steps:**
1. Open sidebar
2. Click "New Chat" button (blue button at top)
3. Observe behavior

**Expected Results:**
- ✓ Sidebar closes immediately
- ✓ New empty chat loads
- ✓ Overlay removed
- ✓ Header fully interactive

**Pass/Fail:** _____

---

### Test 4: Settings Button → Auto-Dismiss ✓
**Steps:**
1. Open sidebar
2. Click "Settings" button at bottom
3. Verify sidebar closes

**Expected Results:**
- ✓ Sidebar closes when Settings opens
- ✓ Settings modal appears (centered)
- ✓ No multiple overlays
- ✓ Can interact with modal

**Pass/Fail:** _____

---

### Test 5: Overlay Click → Close Sidebar ✓
**Steps:**
1. Open sidebar
2. Click on dark overlay area (to right of sidebar)
3. Verify sidebar closes

**Expected Results:**
- ✓ Sidebar slides out on overlay click
- ✓ Overlay disappears
- ✓ No lag or delay
- ✓ Chat content fully interactive

**Pass/Fail:** _____

---

### Test 6: Close Button (×) → Close Sidebar ✓
**Steps:**
1. Open sidebar
2. Click X button in sidebar header (top-right)
3. Verify sidebar closes

**Expected Results:**
- ✓ Sidebar closes immediately
- ✓ X button was visible and clickable
- ✓ Smooth transition

**Pass/Fail:** _____

---

### Test 7: Header Interactions → Sidebar Stays Open ✓
**Steps:**
1. Open sidebar
2. Try each header interaction:
   - Click theme toggle (Moon/Sun icon)
   - Click settings icon (gear)
   - Click profile avatar
   - Click hamburger menu again

**Expected Results:**
- ✓ Theme toggle works with sidebar open
- ✓ Settings icon is clickable
- ✓ Profile menu appears with sidebar open
- ✓ Hamburger can toggle sidebar closed
- ✓ No z-index issues blocking access
- ✓ Sidebar remains open after header clicks

**Pass/Fail:** _____

---

### Test 8: Hamburger Menu → Toggle Sidebar ✓
**Steps:**
1. Sidebar closed: Click hamburger
2. Observe sidebar opens
3. Click hamburger again
4. Observe sidebar closes

**Expected Results:**
- ✓ First click: Sidebar slides in
- ✓ Second click: Sidebar slides out
- ✓ Smooth animations
- ✓ No animation janks

**Pass/Fail:** _____

---

### Test 9: Landscape Orientation ✓
**Steps:**
1. Open DevTools device toolbar
2. Rotate to landscape (Ctrl+Shift+M on Mac)
3. Test sidebar opening/closing

**Expected Results:**
- ✓ Sidebar still slides from left
- ✓ Overlay covers reduced height content
- ✓ Header stays visible
- ✓ All interactions work
- ✓ No layout breaks

**Pass/Fail:** _____

---

### Test 10: Z-Index Verification ✓
**Steps:**
1. Open sidebar
2. Inspect elements with DevTools Inspector
3. Check z-index values in computed styles

**Expected Results:**
```
Computed z-index values:
- Header:   z-index: 100 ✓
- Sidebar:  z-index: 60  ✓
- Overlay:  z-index: 50  ✓
- Content:  z-index: auto (0) ✓
```

**Pass/Fail:** _____

---

### Test 11: Body Scroll Lock ✓
**Steps:**
1. Open sidebar
2. Try to scroll on the page (behind overlay)
3. Verify page doesn't scroll

**Expected Results:**
- ✓ Page doesn't scroll with sidebar open
- ✓ No layout shift when sidebar closes
- ✓ `document.body.style.overflow === 'hidden'`
- ✓ `document.body.style.position === 'fixed'`
- ✓ Scroll position restored when sidebar closes

**Pass/Fail:** _____

---

### Test 12: Rapid Interactions ✓
**Steps:**
1. Rapidly open/close sidebar
2. Quickly select multiple chats
3. Open sidebar while chat is loading

**Expected Results:**
- ✓ No janky animations
- ✓ No overlay duplication
- ✓ No stuck overlay after closing
- ✓ Smooth transitions throughout
- ✓ No memory leaks/stuck intervals

**Pass/Fail:** _____

---

### Test 13: Profile Menu Interaction ✓
**Steps:**
1. Open sidebar
2. Click profile avatar (top-right)
3. Profile menu should appear
4. Click outside menu to close

**Expected Results:**
- ✓ Profile menu appears on top
- ✓ Menu is z-index 100 (above sidebar)
- ✓ Can close menu by clicking outside
- ✓ Sidebar can be closed independently

**Pass/Fail:** _____

---

### Test 14: Mobile to Desktop Transition ✓
**Steps:**
1. Start on mobile (< 1024px)
2. Open DevTools and resize to desktop (> 1024px)
3. Verify sidebar behavior changes

**Expected Results:**
- ✓ On mobile: Sidebar fixed, slides from left
- ✓ On desktop: Sidebar relative, always visible
- ✓ No overlay on desktop
- ✓ Responsive breakpoint works at 1024px

**Pass/Fail:** _____

---

## Issues to Watch For

### ❌ Regression Issues:
- Invisible overlay blocking interactions
- Sidebar not closing after chat selection
- Body scrolling locked after sidebar closes
- Header icons unreachable with sidebar open
- Z-index stacking issues causing layering problems
- Layout shift when opening/closing sidebar
- Animations feeling janky or slow

### ⚠️ Performance Considerations:
- Overlay re-renders should be minimal
- Z-index changes shouldn't cause repaints
- Scroll lock shouldn't cause 60fps drops
- Memory usage stable during repeated open/close

---

## Test Results Summary

| Test # | Test Name | Pass | Fail | Notes |
|--------|-----------|------|------|-------|
| 1 | Sidebar Opening | ☐ | ☐ | |
| 2 | Chat Selection | ☐ | ☐ | |
| 3 | New Chat Button | ☐ | ☐ | |
| 4 | Settings Button | ☐ | ☐ | |
| 5 | Overlay Click | ☐ | ☐ | |
| 6 | Close Button | ☐ | ☐ | |
| 7 | Header Interactions | ☐ | ☐ | |
| 8 | Hamburger Toggle | ☐ | ☐ | |
| 9 | Landscape Orientation | ☐ | ☐ | |
| 10 | Z-Index Verification | ☐ | ☐ | |
| 11 | Body Scroll Lock | ☐ | ☐ | |
| 12 | Rapid Interactions | ☐ | ☐ | |
| 13 | Profile Menu | ☐ | ☐ | |
| 14 | Responsive Transition | ☐ | ☐ | |

**Overall Result:** _____ / 14 Tests Passed

---

## DevTools Console Commands

Run these in DevTools console to verify the fixes:

```javascript
// Check body scroll lock styles
console.log({
  overflow: getComputedStyle(document.body).overflow,
  position: getComputedStyle(document.body).position,
  width: getComputedStyle(document.body).width
});

// Check z-index hierarchy
const elements = {
  header: document.querySelector('header').style.zIndex,
  sidebar: document.querySelector('aside')?.style.zIndex,
  overlay: document.querySelector('[role="button"][aria-label*="Close sidebar overlay"]')?.style.zIndex
};
console.log('Z-Index Values:', elements);

// Check CSS variable
console.log('Header Height Variable:', getComputedStyle(document.documentElement).getPropertyValue('--app-header-height'));

// Verify header height
const headerHeight = document.querySelector('header').getBoundingClientRect().height;
console.log('Actual Header Height:', headerHeight, 'px');
```

---

## Deployment Checklist

Before deploying to production:

- [ ] All 14 tests pass on mobile
- [ ] All 14 tests pass on tablet
- [ ] No console errors in DevTools
- [ ] No performance regressions
- [ ] Z-index values confirmed correct
- [ ] Body scroll lock working properly
- [ ] No layout shifts observed
- [ ] Theme toggle works with sidebar open
- [ ] Settings accessible with sidebar open
- [ ] Profile menu works correctly
- [ ] Tested on real devices (not just DevTools)
- [ ] Tested on slow 4G network
- [ ] Tested rapid interactions
- [ ] Code review completed
- [ ] Browser compatibility verified

---

## Rollback Plan

If issues occur after deployment:

1. Revert `components/Layout/MainLayout.tsx` to previous version
2. Changes were minimal and isolated to:
   - Z-index values (lines 343, 353)
   - Body scroll lock effect (lines 92-107)
3. No database or API changes
4. Can safely rollback without data loss

---

## Contact & Support

For issues during testing:
- Check console for errors: `F12` → Console tab
- Verify correct file was deployed: Check line numbers match
- Test in incognito mode to eliminate cache issues
- Try different mobile devices to isolate device-specific issues
