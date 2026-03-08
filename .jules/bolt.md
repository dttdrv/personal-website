## 2026-03-08 - [Scroll Progress Bar Optimization]
**Learning:** Animating the `width` property on a scroll progress element on `scroll` event can cause layout thrashing on every frame, leading to reduced performance.
**Action:** Use CSS `transform: scaleX()` and `transform-origin: left` instead of `width` to animate progress bars. This offloads the animation to the GPU and avoids layout recalculation.
