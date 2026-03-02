
## 2025-02-14 - Layout Thrashing in Animation Loops
**Learning:** `getBoundingClientRect()` inside a `requestAnimationFrame` loop or touch event handler causes severe layout thrashing (forced synchronous layout), significantly degrading performance, especially on mobile devices where `MobileTouchRepel` runs.
**Action:** Always cache document-relative coordinates (`baseLeft`, `baseTop`) on initialization and resize events, and compute viewport-relative positions during animation frames using `window.scrollX` and `window.scrollY`.
