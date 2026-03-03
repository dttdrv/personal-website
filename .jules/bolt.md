## 2024-05-24 - [Cache BoundingClientRect to prevent layout thrashing]
**Learning:** `getBoundingClientRect` causes synchronous layout calculation which triggers layout thrashing if used within an animation loop, significantly reducing FPS. Also, clearing inline transforms before taking measurements avoids accumulated position drift.
**Action:** Always extract bounding rect calculations out of requestAnimationFrame loops (like `MagneticLetters.animate()`, `MobileTouchRepel.updateTargets()`, and `ParallaxLayers.update()`) and cache them during `init` and on window resize.
