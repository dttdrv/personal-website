## 2024-05-16 - [Frontend Performance: Caching getBoundingClientRect in Animation Loops]
**Learning:** Frequent calls to `getBoundingClientRect()` inside `requestAnimationFrame` loops or scroll handlers (like in `MagneticLetters`, `MobileTouchRepel`, and `ParallaxLayers`) cause significant layout thrashing and forced synchronous layouts, degrading rendering performance.
**Action:** Always pre-calculate and cache document-relative element positions during initialization (`init()`). Update this cache on window resize events and after custom fonts load (using `document.fonts.ready.then()`). During active animations (`animate()`, `update()`, etc.), calculate viewport-relative positions using the cached document coordinates minus the current scroll offset (`window.scrollX` / `window.scrollY`) instead of directly querying the DOM.

## 2024-05-17 - [Frontend Performance: Animate GPU-accelerated properties]
**Learning:** Animating `width` (as seen in the scroll progress bar) forces the browser to recalculate layout and repaint on every frame, which can cause significant jank and layout thrashing.
**Action:** Replace `width` animations with `transform: scaleX()` and set the appropriate `transform-origin`. `transform` properties run on the compositor thread, enabling hardware acceleration and bypassing main thread layout calculations, resulting in a much smoother 60fps experience.
