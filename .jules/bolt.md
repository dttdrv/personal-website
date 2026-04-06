## 2024-05-16 - [Frontend Performance: Caching getBoundingClientRect in Animation Loops]
**Learning:** Frequent calls to `getBoundingClientRect()` inside `requestAnimationFrame` loops or scroll handlers (like in `MagneticLetters`, `MobileTouchRepel`, and `ParallaxLayers`) cause significant layout thrashing and forced synchronous layouts, degrading rendering performance.
**Action:** Always pre-calculate and cache document-relative element positions during initialization (`init()`). Update this cache on window resize events and after custom fonts load (using `document.fonts.ready.then()`). During active animations (`animate()`, `update()`, etc.), calculate viewport-relative positions using the cached document coordinates minus the current scroll offset (`window.scrollX` / `window.scrollY`) instead of directly querying the DOM.


## 2024-05-16 - [Frontend Performance: GPU-Accelerated Scroll Progress Bars]
**Learning:** Animating layout-inducing CSS properties like `width` on scroll progress bars triggers layout thrashing and forced reflows on every frame, which can significantly degrade scroll performance.
**Action:** Always implement scroll progress bars (and similar animated UI elements) using GPU-accelerated properties. Use `transform: scaleX()` along with `transform-origin: left`, maintaining a constant `width: 100%`.
