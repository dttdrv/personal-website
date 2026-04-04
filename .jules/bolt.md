## 2024-05-16 - [Frontend Performance: Caching getBoundingClientRect in Animation Loops]
**Learning:** Frequent calls to `getBoundingClientRect()` inside `requestAnimationFrame` loops or scroll handlers (like in `MagneticLetters`, `MobileTouchRepel`, and `ParallaxLayers`) cause significant layout thrashing and forced synchronous layouts, degrading rendering performance.
**Action:** Always pre-calculate and cache document-relative element positions during initialization (`init()`). Update this cache on window resize events and after custom fonts load (using `document.fonts.ready.then()`). During active animations (`animate()`, `update()`, etc.), calculate viewport-relative positions using the cached document coordinates minus the current scroll offset (`window.scrollX` / `window.scrollY`) instead of directly querying the DOM.

## 2026-04-04 - [Frontend Performance: Avoid layout-inducing properties in scroll handlers]
**Learning:** Animating layout-inducing properties like `width` or `height` inside scroll handlers (e.g., `ScrollProgress.update()`) causes severe layout thrashing and continuous repaints.
**Action:** Always prefer GPU-accelerated CSS properties like `transform: scaleX()` or `transform: translate()` combined with an appropriate `transform-origin` to achieve the same visual effect without triggering synchronous layout recalculations.
