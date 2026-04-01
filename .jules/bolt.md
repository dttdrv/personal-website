## 2024-05-16 - [Frontend Performance: Caching getBoundingClientRect in Animation Loops]
**Learning:** Frequent calls to `getBoundingClientRect()` inside `requestAnimationFrame` loops or scroll handlers (like in `MagneticLetters`, `MobileTouchRepel`, and `ParallaxLayers`) cause significant layout thrashing and forced synchronous layouts, degrading rendering performance.
**Action:** Always pre-calculate and cache document-relative element positions during initialization (`init()`). Update this cache on window resize events and after custom fonts load (using `document.fonts.ready.then()`). During active animations (`animate()`, `update()`, etc.), calculate viewport-relative positions using the cached document coordinates minus the current scroll offset (`window.scrollX` / `window.scrollY`) instead of directly querying the DOM.


## 2024-05-16 - [Frontend Performance: Using transform instead of width for progress bars]
**Learning:** Animating properties like `width` or `height` inside a scroll handler or `requestAnimationFrame` causes the browser to constantly recalculate the layout (layout thrashing), which severely degrades scrolling performance, especially on mobile devices.
**Action:** Always prefer animating `transform` (e.g., `transform: scaleX()`) along with an appropriate `transform-origin` (e.g., `left`) instead of layout-inducing properties. The `transform` property is GPU-accelerated and only triggers compositing, skipping layout and paint entirely.
