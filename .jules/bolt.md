## 2024-05-16 - [Frontend Performance: Caching getBoundingClientRect in Animation Loops]
**Learning:** Frequent calls to `getBoundingClientRect()` inside `requestAnimationFrame` loops or scroll handlers (like in `MagneticLetters`, `MobileTouchRepel`, and `ParallaxLayers`) cause significant layout thrashing and forced synchronous layouts, degrading rendering performance.
**Action:** Always pre-calculate and cache document-relative element positions during initialization (`init()`). Update this cache on window resize events and after custom fonts load (using `document.fonts.ready.then()`). During active animations (`animate()`, `update()`, etc.), calculate viewport-relative positions using the cached document coordinates minus the current scroll offset (`window.scrollX` / `window.scrollY`) instead of directly querying the DOM.


## 2024-03-27 - [PhotoCarousel Performance Issue]
**Learning:** Found a performance bottleneck in `script.js` where `PhotoCarousel.isInView()` was calling `getBoundingClientRect()` synchronously on every keydown event. This caused layout thrashing and reduced responsiveness.
**Action:** Replaced the synchronous `getBoundingClientRect()` call with a cached `isVisible` property updated by an `IntersectionObserver`. This eliminates synchronous layout calculations during high-frequency events.
