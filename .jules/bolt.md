
## 2026-03-04 - [scroll progress rendering optimization]
**Learning:** mutating `width` for the scroll progress bar was triggering a layout/paint on every scroll event, which blocked the main thread.
**Action:** always use `transform: scaleX()` and `requestAnimationFrame` for scroll-bound animations to keep them on the compositor thread.
