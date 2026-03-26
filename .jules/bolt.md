## 2024-05-16 - [Frontend Performance: Caching getBoundingClientRect in Animation Loops]
**Learning:** Frequent calls to `getBoundingClientRect()` inside `requestAnimationFrame` loops or scroll handlers (like in `MagneticLetters`, `MobileTouchRepel`, and `ParallaxLayers`) cause significant layout thrashing and forced synchronous layouts, degrading rendering performance.
**Action:** Always pre-calculate and cache document-relative element positions during initialization (`init()`). Update this cache on window resize events and after custom fonts load (using `document.fonts.ready.then()`). During active animations (`animate()`, `update()`, etc.), calculate viewport-relative positions using the cached document coordinates minus the current scroll offset (`window.scrollX` / `window.scrollY`) instead of directly querying the DOM.


## 2024-05-17 - [Frontend Performance: Caching Window Dimensions]
**Learning:** Accessing `window.innerHeight` and `window.innerWidth` in high-frequency animation loops (like `requestAnimationFrame` or `mousemove` handlers) causes overhead.
**Action:** Cache these window dimensions during initialization or on resize events, and use the cached values inside animation loops to prevent layout thrashing and improve frame rates.
