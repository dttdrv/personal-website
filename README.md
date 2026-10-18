personal website

research, software and contact info, with live figures that run in the browser.

static html, css and javascript modules; no build step and no dependencies.
every page is set in Inter and shares `home/home.css`; pictures are printed in halftone by Paper Shaders (`home/plates.js`).

theme and language follow your system settings automatically.

browsers keep the css and javascript for hours, so after changing any of it run `node scripts/stamp.mjs`, which puts a fresh `?v=` on every url; the tests fail until you do.

tests: `node tests/portfolio-validation.mjs && node tests/phonecode-report.mjs`

live at dttdrv.xyz
