personal website

research, software and contact info, with live figures that run in the browser.

static html, css and javascript modules; no build step and no dependencies.
the home page is set in Instrument Serif and Inter, with its pictures printed in halftone by Paper Shaders (`home/plates.js`); it lives in `index.html` and `home/`. the PhoneCode privacy and terms pages keep `styles.css`.

theme and language follow your system settings automatically.

browsers keep the css and javascript for hours, so after changing any of it run `node scripts/stamp.mjs`, which puts a fresh `?v=` on every url; the tests fail until you do.

tests: `node tests/portfolio-validation.mjs && node tests/phonecode-report.mjs`

live at dttdrv.xyz
