// Pictures printed by Paper Shaders: photographs as coarse blue halftone, and dithered moving shapes where no photograph fits.
// Without WebGL the photographs stay as they are and the shapes keep a flat colour.
import { ShaderMount } from './vendor/paper-0.0.81/shader-mount.js';
import { halftoneDotsFragmentShader, HalftoneDotsTypes, HalftoneDotsGrids } from './vendor/paper-0.0.81/shaders/halftone-dots.js';
import { ditheringFragmentShader, DitheringShapes, DitheringTypes } from './vendor/paper-0.0.81/shaders/dithering.js';
import { getShaderColorFromString } from './vendor/paper-0.0.81/get-shader-color-from-string.js';

const SIZING = { u_fit: 2, u_scale: 1, u_rotation: 0, u_offsetX: 0, u_offsetY: 0, u_originX: 0.5, u_originY: 0.5, u_worldWidth: 0, u_worldHeight: 0 };
// css pixels between dot centres while pointed at; at rest a print sets its own coarse pitch
const FINE = 4;

const dark = matchMedia('(prefers-color-scheme: dark)');
const token = name => getShaderColorFromString(getComputedStyle(document.documentElement).getPropertyValue(name).trim());

// the shader counts rows of dots along the drawn image's height: rows = mix(300, 7, size^0.7) / 2 for classic dots
function sizeFor(print, img, pitch) {
  const { width, height } = print.getBoundingClientRect();
  const fit = print.dataset.fit === 'contain' ? Math.min : Math.max;
  const drawn = img.naturalHeight * fit(width / img.naturalWidth, height / img.naturalHeight);
  const span = Math.min(300, Math.max(7, 2 * drawn / pitch));
  return ((300 - span) / 293) ** (1 / 0.7);
}

function halftone(print, still) {
  const img = print.querySelector('img');
  const rest = Number(print.dataset.pitch);
  return img.decode().then(() => {
    // a photograph flips in the dark so light parts still print as dots; a line drawing keeps its lines as the dots
    const colours = () => ({ u_colorFront: token('--accent'), u_colorBack: token('--paper'), u_inverted: dark.matches && !('drawing' in print.dataset) });
    const mount = new ShaderMount(print, halftoneDotsFragmentShader, {
      ...SIZING, u_fit: print.dataset.fit === 'contain' ? 1 : 2, ...colours(), u_image: img, u_size: sizeFor(print, img, rest),
      u_type: HalftoneDotsTypes.classic, u_grid: HalftoneDotsGrids.hex, u_radius: 1.25, u_contrast: Number(print.dataset.contrast ?? 0.45),
      u_originalColors: false, u_grainMixer: 0, u_grainOverlay: 0, u_grainSize: 0.5,
    });
    print.classList.add('printed');
    dark.addEventListener('change', () => mount.setUniforms(colours()));

    // pointing at a picture closes up its dots until the photograph shows through
    let pitch = rest, target = rest, frame = 0;
    new ResizeObserver(() => mount.setUniforms({ u_size: sizeFor(print, img, pitch) })).observe(print);
    const step = () => {
      pitch += (target - pitch) * 0.14;
      if (Math.abs(target - pitch) < 0.02) pitch = target;
      mount.setUniforms({ u_size: sizeFor(print, img, pitch) });
      frame = pitch === target ? 0 : requestAnimationFrame(step);
    };
    const toward = value => () => {
      target = value;
      if (still) { pitch = value; step(); } else if (!frame) frame = requestAnimationFrame(step);
    };
    print.addEventListener('pointerenter', toward(FINE));
    print.addEventListener('pointerleave', toward(rest));
  });
}

// where no photograph fits, a moving shape is dithered in the same blue on the same paper
function dither(print, still) {
  const colours = () => ({ u_colorFront: token('--accent'), u_colorBack: token('--paper') });
  const mount = new ShaderMount(print, ditheringFragmentShader, {
    ...SIZING, u_fit: 0, ...colours(), u_shape: DitheringShapes[print.dataset.shape], u_type: DitheringTypes['4x4'], u_pxSize: 3,
  }, undefined, still ? 0 : 0.3, 9000);
  print.classList.add('printed');
  dark.addEventListener('change', () => mount.setUniforms(colours()));
}

export function print(el, still) {
  try {
    return Promise.resolve(el.dataset.shader === 'halftone' ? halftone(el, still) : dither(el, still)).catch(() => {});
  } catch { /* no WebGL 2: the picture or the flat colour stands as it is */ }
}
