## 2024-05-16 - [Frontend Performance: Caching getBoundingClientRect in Animation Loops]
**Learning:** Frequent calls to `getBoundingClientRect()` inside `requestAnimationFrame` loops or scroll handlers (like in `MagneticLetters`, `MobileTouchRepel`, and `ParallaxLayers`) cause significant layout thrashing and forced synchronous layouts, degrading rendering performance.
**Action:** Always pre-calculate and cache document-relative element positions during initialization (`init()`). Update this cache on window resize events and after custom fonts load (using `document.fonts.ready.then()`). During active animations (`animate()`, `update()`, etc.), calculate viewport-relative positions using the cached document coordinates minus the current scroll offset (`window.scrollX` / `window.scrollY`) instead of directly querying the DOM.


## 2026-04-10 - [ScrollProgress Component Layout Thrashing]
**Learning:** Animating layout-inducing properties like `width` during scroll events (e.g., in `ScrollProgress`) causes severe layout thrashing and hurts performance, as the browser has to recalculate layout for each frame.
**Action:** Always prefer GPU-accelerated properties like `transform: scaleX()` with an appropriate `transform-origin` (e.g., `left`) instead of `width` for progressive animations tied to scroll or high-frequency events.
