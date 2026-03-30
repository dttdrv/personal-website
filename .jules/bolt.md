## 2024-05-16 - [Frontend Performance: Caching getBoundingClientRect in Animation Loops]
**Learning:** Frequent calls to `getBoundingClientRect()` inside `requestAnimationFrame` loops or scroll handlers (like in `MagneticLetters`, `MobileTouchRepel`, and `ParallaxLayers`) cause significant layout thrashing and forced synchronous layouts, degrading rendering performance.
**Action:** Always pre-calculate and cache document-relative element positions during initialization (`init()`). Update this cache on window resize events and after custom fonts load (using `document.fonts.ready.then()`). During active animations (`animate()`, `update()`, etc.), calculate viewport-relative positions using the cached document coordinates minus the current scroll offset (`window.scrollX` / `window.scrollY`) instead of directly querying the DOM.


## 2024-03-30 - [Performance: Use CSS transform instead of width for scroll progress]
**Learning:** Animating `width` triggers layout recalculations (reflows) on every frame. When tied to a high-frequency event like scrolling, this causes layout thrashing and poor performance.
**Action:** Use `transform: scaleX()` with `transform-origin: left` instead of `width` for progress bars. Transforms are handled by the compositor thread and do not trigger layout reflows, ensuring 60fps animations.
