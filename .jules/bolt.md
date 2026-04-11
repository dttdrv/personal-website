## 2024-05-16 - [Frontend Performance: Caching getBoundingClientRect in Animation Loops]
**Learning:** Frequent calls to `getBoundingClientRect()` inside `requestAnimationFrame` loops or scroll handlers (like in `MagneticLetters`, `MobileTouchRepel`, and `ParallaxLayers`) cause significant layout thrashing and forced synchronous layouts, degrading rendering performance.
**Action:** Always pre-calculate and cache document-relative element positions during initialization (`init()`). Update this cache on window resize events and after custom fonts load (using `document.fonts.ready.then()`). During active animations (`animate()`, `update()`, etc.), calculate viewport-relative positions using the cached document coordinates minus the current scroll offset (`window.scrollX` / `window.scrollY`) instead of directly querying the DOM.


## 2024-05-18 - [Frontend Performance: Caching Visibility with IntersectionObserver]
**Learning:** Checking `getBoundingClientRect()` inside high-frequency event handlers like `keydown` or `wheel` (as in `PhotoCarousel.isInView()`) causes layout thrashing, even if the element isn't currently moving.
**Action:** Use an `IntersectionObserver` to track element visibility asynchronously. Store the result in a boolean property (e.g., `this.isVisible`) and return that property in the synchronous bounds check.
