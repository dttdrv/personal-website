## 2024-05-15 - [Scroll Progress Thrashing]
**Learning:** Using `width` for the `.scroll-progress` bar causes layout thrashing because it triggers a layout recalculation on every frame during scrolling.
**Action:** Use `transform: scaleX` instead, as it only triggers compositing, which is hardware-accelerated and much more performant.