## 2024-05-16 - [Frontend Performance: Caching getBoundingClientRect in Animation Loops]
**Learning:** Frequent calls to `getBoundingClientRect()` inside `requestAnimationFrame` loops or scroll handlers (like in `MagneticLetters`, `MobileTouchRepel`, and `ParallaxLayers`) cause significant layout thrashing and forced synchronous layouts, degrading rendering performance.
**Action:** Always pre-calculate and cache document-relative element positions during initialization (`init()`). Update this cache on window resize events and after custom fonts load (using `document.fonts.ready.then()`). During active animations (`animate()`, `update()`, etc.), calculate viewport-relative positions using the cached document coordinates minus the current scroll offset (`window.scrollX` / `window.scrollY`) instead of directly querying the DOM.


## 2025-02-15 - [CSS Performance: Transform instead of Width for scroll indicators]
**Learning:** Updating the `width` property on an element during high-frequency events (like scroll) triggers expensive layout calculations and repaints, leading to jank.
**Action:** Use `transform: scaleX(0)` with `transform-origin: left` instead. When updating the progress, modify the `transform` property to `scaleX(value)` where `value` is between 0 and 1. This offloads the work to the GPU via composition and avoids layout thrashing.
