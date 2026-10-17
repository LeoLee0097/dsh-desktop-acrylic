/**
 * Tokyo Night Acrylic —palettes, skins and the acrylic chrome layer.
 *
 * Implemented the *theme* way: two real skins (Tokyo Night dark / Tokyo Night
 * day) are registered into the built-in theme runtime, so switching themes is
 * the runtime's own preference switch —no attribute juggling, no per-level CSS
 * overrides. Everything else (icons, fonts, acrylic surfaces) follows from the
 * token tables below.
 *
 * Palette source: Tokyo Night by folke —`tokyonight.nvim` night and day
 * variants. Backgrounds are re-expressed as translucent surfaces because the
 * acrylic effect needs alpha, which upstream does not define.
 *
 * Icons: the shell draws icons with `currentColor` (654 occurrences in the
 * shipped bundles) and exposes no icon-specific token, so icons follow the
 * label/brand tokens below automatically —theming a palette themes its icons.
 */

/* ============================== palettes ================================= */

/** Tokyo Night —night (dark). */
export const NIGHT = {
  id: 'night',
  label: '暗色',
  labelEn: 'Dark',
  colorScheme: 'dark',
  bg: '#1a1b26',
  bgTransparent: '#16161e',
  bgDeeper: '#0f1017',
  bgDeepest: '#0b0b12',
  bgHighlight: '#292e42',
  bgRaised: '#343b58',
  fg: '#c0caf5',
  fgMuted: '#a9b1d6',
  fgSoft: '#9aa5ce',
  gutter: '#3b4261',
  comment: '#565f89',
  dark3: '#545c7e',
  dark5: '#737aa2',
  blue: '#7aa2f7',
  blue0: '#3d59a1',
  cyan: '#7dcfff',
  green: '#9ece6a',
  magenta: '#bb9af7',
  orange: '#ff9e64',
  purple: '#9d7cd8',
  red: '#f7768e',
  yellow: '#e0af68'
}

/**
 * Tokyo Night — day (light), softened.
 *
 * The upstream day palette is fairly saturated; on a full-screen light UI that
 * reads as harsh. Every hue here is lightened and desaturated one step, and the
 * text colour stays deliberately dark enough to remain readable on the
 * translucent surfaces above the material field.
 */
export const DAY = {
  id: 'day',
  label: '亮色',
  labelEn: 'Light',
  colorScheme: 'light',
  bg: '#eff1f6',
  bgTransparent: '#eef0f5',
  bgDeeper: '#f6f7fb',
  bgDeepest: '#fbfcfe',
  bgHighlight: '#e5e8f2',
  bgRaised: '#dce0ec',
  fg: '#33477a',
  fgMuted: '#5d6c9c',
  fgSoft: '#4d5b8b',
  gutter: '#d5d9e7',
  comment: '#8b93b8',
  dark3: '#c0c4d8',
  dark5: '#7d84a8',
  blue: '#5b8ede',
  blue0: '#3f6bb5',
  cyan: '#3a8ba8',
  green: '#6f8a55',
  magenta: '#a678e0',
  orange: '#c07a3a',
  purple: '#8f6cc0',
  red: '#e06a8a',
  yellow: '#a08a5e'
}

export const PALETTES = [NIGHT, DAY]

/* ============================== helpers ================================== */

/** `#rrggbb` —`rgba(r, g, b, alpha)`. Throws on malformed input. */
export function rgba(hex, alpha) {
  const match = /^#([0-9a-f]{6})$/i.exec(hex)
  if (match === null) throw new Error(`rgba() needs a #rrggbb colour, got ${hex}`)
  const value = Number.parseInt(match[1], 16)
  const r = (value >> 16) & 0xff
  const g = (value >> 8) & 0xff
  const b = value & 0xff
  const alphaText = String(Math.round(alpha * 1000) / 1000)
  return `rgba(${r}, ${g}, ${b}, ${alphaText})`
}

/** `mix(hue, weight%, over)` —colour interpolation that survives any build step. */
function mix(hex, weight, over) {
  return `color-mix(in srgb, ${hex} ${weight}%, ${over})`
}

/* ========================= acrylic tuning ================================ */

/**
 * Acrylic tuning.
 *
 * `blurPx` is the single knob for the whole effect: the chrome layer and the
 * shell's menu material both read it, so changing one number changes every
 * frosted surface consistently. `noiseOpacity` belongs to the layer itself.
 */
export const ACRYLIC = {
  blurPx: 15,
  // The floating material sits *on top of* the pre-blurred base, so it needs a
  // larger radius than the chrome layer before the effect is visible at all:
  // blurring an already-blurred field changes nothing.
  menuBlurPx: 24,
  // The dim mask behind a modal dialog frosts the whole interface beneath it.
  // It is a single full-viewport convolution, so a moderate radius reads as
  // acrylic without paying for a second menu-grade blur.
  maskBlurPx: 12,
  // The base keeps some structure on purpose -- a fully blurred backdrop gives
  // the floating blur nothing to work with.
  materialBlurPx: 28,
  saturate: '1.1',
  menuSaturate: '1.15',
  noiseOpacity: '0.03'
}

/* ============================ token builders ============================= */

/** Neutral ramp per palette, expressed as "how light" from 00 to 1000. */
function neutralRamp(p) {
  const dark = p.colorScheme === 'dark'
  return dark
    ? {
        '00': p.fg,
        50: p.fg,
        100: p.fgMuted,
        200: p.fgSoft,
        300: p.dark5,
        400: p.dark3,
        500: p.gutter,
        600: '#2f334d',
        700: p.bgHighlight,
        800: '#1f2335',
        850: p.bg,
        900: p.bgTransparent,
        950: '#12131a',
        1000: p.bgDeepest
      }
    : {
        '00': '#ffffff',
        50: p.bgDeepest,
        100: p.bgDeeper,
        200: p.bg,
        300: p.bgHighlight,
        400: p.gutter,
        500: p.dark3,
        600: p.dark5,
        700: p.comment,
        800: p.fgSoft,
        850: p.fgMuted,
        900: p.fg,
        950: mix(p.fg, 80, '#000000'),
        1000: mix(p.fg, 65, '#000000')
      }
}

/** Accent ramps, each derived from the palette's own hue. */
function accentRamps(p) {
  return {
    deepseek: { 50: mix(p.blue, 45, p.fg), 100: mix(p.blue, 30, p.fg), 200: mix(p.blue, 70, p.fg), 300: mix(p.cyan, 60, p.bg), 400: p.blue, 450: p.blue, 500: p.blue, 600: mix(p.blue0, 70, p.bg), 700: mix(p.blue0, 60, p.bg), 800: mix(p.blue, 35, p.bgTransparent), 900: mix(p.blue, 22, p.bgTransparent) },
    blue: { 50: mix(p.blue, 45, p.fg), 75: mix(p.blue, 32, p.fg), 100: mix(p.blue, 24, p.fg), 300: mix(p.blue, 62, p.bg), 400: mix(p.blue, 82, p.bg), 450: p.blue, 500: p.blue, 600: mix(p.blue0, 72, p.bg), 800: mix(p.blue0, 55, p.bgTransparent), 900: mix(p.blue, 30, p.bgTransparent), 950: mix(p.blue, 20, p.bgTransparent), '50p': mix(p.blue, 40, p.fg) },
    green: { 100: mix(p.green, 28, p.fg), 400: mix(p.green, 72, p.bg), 500: p.green, 900: mix(p.green, 32, p.bgTransparent) },
    red: { 50: mix(p.red, 40, p.fg), 100: mix(p.red, 26, p.fg), 400: mix(p.red, 74, p.bg), 500: p.red, 600: mix(p.red, 66, p.bgTransparent), 900: mix(p.red, 32, p.bgTransparent) },
    amber: { 100: mix(p.yellow, 28, p.fg), 400: mix(p.yellow, 82, p.bg), 500: p.orange, 600: p.orange, 900: mix(p.orange, 38, p.bgTransparent) }
  }
}

function buildStaticTokens(p) {
  const tokens = {}
  for (const [step, value] of Object.entries(neutralRamp(p))) {
    tokens[`--dsw-static-neutral-${step}`] = value
    tokens[`--dsw-static-neutral-bluish-${step}`] = value
  }
  for (const [family, ramp] of Object.entries(accentRamps(p))) {
    for (const [step, value] of Object.entries(ramp)) {
      tokens[`--dsw-static-${family}-${step}`] = value
    }
  }
  return tokens
}

/**
 * Surface table: `[token, hue, alpha, floor?]`.
 *
 * The light palette scales every alpha up, but only moderately: it still has to
 * read as glass. Its text is dark, and the window behind it is bright, so
 * translucency costs nothing in contrast there — unlike the dark palette, whose
 * light text must never sit on a light wash.
 *
 * `buildSurfaceTokens` caps every alpha, so a scaled entry can never become
 * fully opaque and silently kill the effect.
 */
function surfaceTable(p) {
  const dark = p.colorScheme === 'dark'
  const k = dark ? 1 : 3
  // The surfaces that sit over the material field get explicit per-scheme
  // alphas. The dark palette keeps them near the floor so the field still shows
  // through (it was 0.10 before the readability work; 0.32–0.48 is the middle);
  // the light palette is untouched.
  const field = (darkAlpha, lightAlpha) => (dark ? darkAlpha : lightAlpha)
  return [
    // The canvas, base layer and sidebar carry the effect: they are the big
    // surfaces, and low alpha is what makes them read as glass.
    ['--dsw-alias-bg-base', p.bgTransparent, field(0.34, 0.1 * k)],
    ['--dsw-alias-bg-layer-1', p.bgDeeper, field(0.32, 0.08 * k)],
    ['--dsw-alias-bg-layer-2', p.bgHighlight, field(0.40, 0.18 * k)],
    ['--dsw-alias-bg-layer-3', p.bgRaised, field(0.48, 0.24 * k)],
    ['--dsw-alias-bg-overlay', p.bg, 0.6 * k, 0.6],
    // Sidebar tone. The light palette shares the canvas hue *and* alpha, so the
    // sidebar and the content area render as one continuous surface with no
    // vertical tone step (the seam across the column). The dark palette keeps
    // its slightly deeper column — that separation was confirmed as desirable.
    ['--dsw-specific-sidebar-fill', dark ? p.bgDeeper : p.bgTransparent, field(0.32, 0.1 * k)],
    ['--dsw-specific-sidebar-nav-item-hover', p.bgHighlight, 0.28 * k, 0.2],
    ['--dsw-specific-sidebar-nav-item-active', p.bgHighlight, 0.44 * k, 0.34],
    ['--dsw-specific-input-major', p.bgTransparent, field(0.40, 0.26 * k), 0.2],
    ['--dsw-specific-login-input', p.bgTransparent, field(0.40, 0.26 * k), 0.2],
    ['--dsw-specific-selector', p.bgHighlight, 0.46 * k, 0.36],
    ['--dsw-specific-bubble', p.bgHighlight, 0.34 * k, 0.26],
    ['--dsw-specific-bubble-highlight', p.bgRaised, 0.42 * k, 0.32],
    ['--dsw-alias-bg-module-platform', p.bgHighlight, 0.34 * k],
    ['--dsw-alias-bg-multi-select', p.bgHighlight, 0.34 * k],
    ['--dsw-alias-bg-skeleton', p.bgRaised, 0.08 * k, 0.05],
    ['--dsw-alias-markdown-code-block', p.bgDeeper, field(0.46, 0.44 * k), 0.34],
    ['--dsw-alias-markdown-code-block-banner', p.bgHighlight, 0.44 * k, 0.32],
    ['--dsw-alias-markdown-code-segment-selected', p.bgHighlight, 0.44 * k, 0.32],
    ['--dsw-alias-markdown-code-segment-unselected', p.bgDeeper, 0.44 * k, 0.34],
    ['--dsw-alias-markdown-citation', p.bgHighlight, 0.44 * k, 0.32],
    ['--dsw-alias-markdown-inline-code', p.bgHighlight, field(0.46, 0.44 * k), 0.32],
    ['--dsw-alias-markdown-placeholder', p.bgHighlight, 0.44 * k, 0.32],
    ['--dsw-alias-markdown-tag', p.bgHighlight, 0.44 * k, 0.32],
    ['--dsw-alias-button-elevated-fill', p.bgHighlight, 0.4 * k, 0.3],
    ['--dsw-alias-button-primary-dimmed', p.bgHighlight, 0.42 * k, 0.3],
    ['--dsw-alias-button-floating-fill', p.bgHighlight, 0.5 * k, 0.4],
    ['--dsw-alias-button-floating-hover', p.gutter, 0.56 * k, 0.44],
    ['--dsw-alias-button-ghost-active-fill', p.bgHighlight, 0.4 * k, 0.3],
    ['--dsw-alias-button-ghost-active-hover', p.bgHighlight, 0.52 * k, 0.4],
    ['--dsw-alias-state-business-tertiary', p.bgHighlight, 0.4 * k, 0.3],
    ['--dsw-alias-state-success-tertiary', p.bgHighlight, 0.4 * k, 0.3],
    ['--dsw-alias-state-warn-tertiary', p.bgHighlight, 0.4 * k, 0.3],
    // The card library asks for an error *surface* too; without it the bridged
    // token would dangle and the card would fall back to its own default.
    ['--dsw-alias-state-error-tertiary', p.bgHighlight, 0.4 * k, 0.3],
    ['--dsw-alias-interactive-bg-hover', p.bgHighlight, 0.3 * k, 0.22],
    ['--dsw-alias-interactive-bg-active', p.gutter, 0.4 * k, 0.3],
    ['--dsw-alias-interactive-bg-hover-solid', p.bgHighlight, 0.52 * k, 0.4],
    ['--dsw-alias-scrollbar-bg-l1', p.bgHighlight, 0.34 * k, 0.24],
    ['--dsw-alias-scrollbar-bg-l2', p.bgHighlight, 0.44 * k, 0.32],
    ['--dsw-alias-scrollbar-hover-l1', p.gutter, 0.54 * k, 0.4],
    ['--dsw-alias-scrollbar-hover-l2', p.gutter, 0.54 * k, 0.4],
    // floating surfaces keep a readability floor
    ['--dsw-specific-menu', p.bg, 0.62 * k, 0.62],
    ['--dsw-specific-tip', p.bg, 0.56 * k, 0.56],
    ['--dsw-alias-toast-bg', p.bg, 0.74 * k, 0.7],
    ['--dsw-alias-tooltip-bg', p.bgHighlight, 0.8 * k, 0.76],
    ['--dsw-alias-bg-mask-1', p.bgDeepest, 0.5, 0.5],
    ['--dsw-alias-bg-mask-2', p.bgDeepest, 0.2, 0.2],
    ['--dsw-alias-bg-mask-3', p.bgDeepest, 0.48, 0.48]
  ]
}

/** Highest alpha any surface may reach — above this the glass reads as solid. */
const MAX_SURFACE_ALPHA = 0.85

/**
 * Translucency policy for surface alphas.
 *
 * Two guarantees, deliberately kept apart:
 *
 *  1. **Normal path** — `--dwa-root-base` and `--dwa-canvas-base` paint first,
 *     so a surface is composited onto a dark ground and text lands around
 *     10:1. That ground is what actually carries readability, and it is why the
 *     surface alphas can stay modest.
 *  2. **Degraded path** — if only the tokens apply (stylesheet not mounted, a
 *     theme reset mid-flight), the surface is all that is left over the white
 *     window fill. It cannot reach AA there, but it must not read as an empty
 *     hole: `MIN_SURFACE_CONTRAST` (2.5:1) and `MIN_SURFACE_ALPHA` (0.42) stop
 *     that, where the original 0.08–0.10 sat at 1.1–1.4:1.
 *
 * The first design overshot in the other direction: solving every surface for
 * 4.5:1 *on its own* pushed the canvas to 0.73 and made the interface solid.
 * The numbers here are the retreat from that.
 */
export const MIN_SURFACE_CONTRAST = 1.6
export const MIN_SURFACE_ALPHA = 0.32
export const MIN_COMPOSED_CONTRAST = 7

/** Tokens that dim or decorate instead of holding text. */
const NON_TEXT_SURFACES = [/^--dsw-alias-bg-mask-/, /^--dsw-alias-bg-skeleton$/]

const WHITE = { r: 255, g: 255, b: 255 }

/** `#rrggbb` to channel values; `null` for anything else. */
function hexToRgb(hex) {
  const match = /^#([0-9a-f]{6})$/i.exec(hex.trim())
  if (match === null) return null
  const value = parseInt(match[1], 16)
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 }
}

/** WCAG 2.x relative luminance. */
function relativeLuminance({ r, g, b }) {
  const channel = (v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/** WCAG contrast ratio between two opaque colours. */
export function contrastRatio(a, b) {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/** Source-over compositing of `colour` at `alpha` onto an opaque backdrop. */
export function compositeOver(colour, alpha, backdrop) {
  return {
    r: Math.round(colour.r * alpha + backdrop.r * (1 - alpha)),
    g: Math.round(colour.g * alpha + backdrop.g * (1 - alpha)),
    b: Math.round(colour.b * alpha + backdrop.b * (1 - alpha))
  }
}

/**
 * Smallest alpha (2-decimal) at which this colour stops reading as an empty hole
 * over a white backdrop. This is the degraded-path floor, not an AA claim.
 */
function surfaceFloorAlpha(colour, textColour) {
  for (let alpha = MIN_SURFACE_ALPHA; alpha <= 1; alpha += 0.01) {
    if (contrastRatio(textColour, compositeOver(colour, alpha, WHITE)) >= MIN_SURFACE_CONTRAST) {
      return Number(alpha.toFixed(2))
    }
  }
  return 1
}

function buildSurfaceTokens(p) {
  const tokens = {}
  const textColour = hexToRgb(p.fg)
  for (const [token, hex, alpha, floor] of surfaceTable(p)) {
    const tableValue = Math.min(MAX_SURFACE_ALPHA, Math.max(alpha, typeof floor === 'number' ? floor : 0.02))
    const exempt = NON_TEXT_SURFACES.some((pattern) => pattern.test(token))
    const colour = hexToRgb(hex)
    // The table value is the design. The floor only applies where the value
    // would read as an empty hole over a bare white window — the light palette's
    // 0.24 already measures 8.9:1 there and must keep its own number.
    const isHole =
      !exempt &&
      colour !== null &&
      textColour !== null &&
      contrastRatio(textColour, compositeOver(colour, tableValue, WHITE)) < MIN_SURFACE_CONTRAST
    const value = isHole ? Math.max(tableValue, MIN_SURFACE_ALPHA) : tableValue
    tokens[token] = rgba(hex, value)
  }
  return tokens
}

/**
 * Everything fixed per palette: borders, labels, brand, states, syntax colours
 * and the window-material / menu-material knobs.
 */
/**
 * Complete bridge for the card library (tiny-vue / genui).
 *
 * The library declares its own palette on `:root` and maps ~250
 * `--tv-color-*` names onto it, so every name we do not provide falls back to
 * the library default (white card body in light, neutral greys in dark).
 * These entries are generated from the names the installed library actually
 * reads and point at our alias tokens, so both skins stay in sync.
 */
const TV_BRIDGE_EXTRA = {
  '--tv-color-act-danger-bg': 'var(--dsw-alias-state-error-tertiary)',
  '--tv-color-act-danger-bg-active': 'var(--dsw-alias-state-error-tertiary)',
  '--tv-color-act-danger-bg-hover': 'var(--dsw-alias-state-error-tertiary)',
  '--tv-color-act-danger-bg-light': 'var(--dsw-alias-state-error-tertiary)',
  '--tv-color-act-danger-bg-light-active': 'var(--dsw-alias-state-error-tertiary)',
  '--tv-color-act-danger-bg-light-hover': 'var(--dsw-alias-state-error-tertiary)',
  '--tv-color-act-danger-border': 'var(--dsw-alias-state-error-primary)',
  '--tv-color-act-danger-border-active': 'var(--dsw-alias-state-error-primary)',
  '--tv-color-act-danger-border-active-1': 'var(--dsw-alias-state-error-primary)',
  '--tv-color-act-danger-border-hover': 'var(--dsw-alias-state-error-primary)',
  '--tv-color-act-danger-border-hover-1': 'var(--dsw-alias-state-error-primary)',
  '--tv-color-act-danger-border-light': 'var(--dsw-alias-state-error-primary)',
  '--tv-color-act-danger-border-light-active': 'var(--dsw-alias-state-error-primary)',
  '--tv-color-act-danger-border-light-hover': 'var(--dsw-alias-state-error-primary)',
  '--tv-color-act-danger-plain-text-hover': 'var(--dsw-alias-state-error-primary)',
  '--tv-color-act-danger-text': 'var(--dsw-alias-state-error-primary)',
  '--tv-color-act-danger-text-active': 'var(--dsw-alias-state-error-primary)',
  '--tv-color-act-danger-text-hover': 'var(--dsw-alias-state-error-primary)',
  '--tv-color-act-danger-text-white': 'var(--dsw-alias-state-error-primary)',
  '--tv-color-act-danger-text-white-active': 'var(--dsw-alias-state-error-primary)',
  '--tv-color-act-danger-text-white-hover': 'var(--dsw-alias-state-error-primary)',
  '--tv-color-act-info-bg': 'var(--dsw-alias-label-primary)',
  '--tv-color-act-info-bg-active': 'var(--dsw-alias-label-primary)',
  '--tv-color-act-info-bg-hover': 'var(--dsw-alias-label-primary)',
  '--tv-color-act-info-bg-light': 'var(--dsw-alias-label-primary)',
  '--tv-color-act-info-bg-light-active': 'var(--dsw-alias-label-primary)',
  '--tv-color-act-info-bg-light-hover': 'var(--dsw-alias-label-primary)',
  '--tv-color-act-info-border': 'var(--dsw-alias-label-primary)',
  '--tv-color-act-info-border-active': 'var(--dsw-alias-label-primary)',
  '--tv-color-act-info-border-active-1': 'var(--dsw-alias-label-primary)',
  '--tv-color-act-info-border-hover': 'var(--dsw-alias-label-primary)',
  '--tv-color-act-info-border-hover-1': 'var(--dsw-alias-label-primary)',
  '--tv-color-act-info-border-light': 'var(--dsw-alias-label-primary)',
  '--tv-color-act-info-border-light-active': 'var(--dsw-alias-label-primary)',
  '--tv-color-act-info-border-light-hover': 'var(--dsw-alias-label-primary)',
  '--tv-color-act-info-plain-text-hover': 'var(--dsw-alias-label-primary)',
  '--tv-color-act-info-text': 'var(--dsw-alias-label-primary)',
  '--tv-color-act-info-text-active': 'var(--dsw-alias-label-primary)',
  '--tv-color-act-info-text-hover': 'var(--dsw-alias-label-primary)',
  '--tv-color-act-info-text-white': 'var(--dsw-alias-label-primary)',
  '--tv-color-act-info-text-white-active': 'var(--dsw-alias-label-primary)',
  '--tv-color-act-info-text-white-hover': 'var(--dsw-alias-label-primary)',
  '--tv-color-act-primary-bg': 'var(--dsw-alias-bg-layer-2)',
  '--tv-color-act-primary-bg-active': 'var(--dsw-alias-bg-layer-2)',
  '--tv-color-act-primary-bg-hover': 'var(--dsw-alias-bg-layer-2)',
  '--tv-color-act-primary-bg-white': 'var(--dsw-alias-bg-layer-1)',
  '--tv-color-act-primary-bg-white-active': 'var(--dsw-alias-bg-layer-1)',
  '--tv-color-act-primary-bg-white-hover': 'var(--dsw-alias-bg-layer-1)',
  '--tv-color-act-primary-border': 'var(--dsw-alias-brand-primary)',
  '--tv-color-act-primary-border-active': 'var(--dsw-alias-brand-primary)',
  '--tv-color-act-primary-border-hover': 'var(--dsw-alias-brand-primary)',
  '--tv-color-act-primary-border-light': 'var(--dsw-alias-brand-primary)',
  '--tv-color-act-primary-border-light-active': 'var(--dsw-alias-brand-primary)',
  '--tv-color-act-primary-border-light-active-1': 'var(--dsw-alias-brand-primary)',
  '--tv-color-act-primary-border-light-hover': 'var(--dsw-alias-brand-primary)',
  '--tv-color-act-primary-border-light-hover-1': 'var(--dsw-alias-brand-primary)',
  '--tv-color-act-primary-plain-text-hover': 'var(--dsw-alias-brand-primary)',
  '--tv-color-act-primary-text': 'var(--dsw-alias-brand-primary)',
  '--tv-color-act-primary-text-active': 'var(--dsw-alias-brand-primary)',
  '--tv-color-act-primary-text-hover': 'var(--dsw-alias-brand-primary)',
  '--tv-color-act-primary-text-inverse-tint': 'var(--dsw-alias-brand-primary)',
  '--tv-color-act-primary-text-inverse-tint-active': 'var(--dsw-alias-brand-primary)',
  '--tv-color-act-primary-text-inverse-tint-hover': 'var(--dsw-alias-brand-primary)',
  '--tv-color-act-success-bg': 'var(--dsw-alias-state-success-tertiary)',
  '--tv-color-act-success-bg-active': 'var(--dsw-alias-state-success-tertiary)',
  '--tv-color-act-success-bg-hover': 'var(--dsw-alias-state-success-tertiary)',
  '--tv-color-act-success-bg-light': 'var(--dsw-alias-state-success-tertiary)',
  '--tv-color-act-success-bg-light-active': 'var(--dsw-alias-state-success-tertiary)',
  '--tv-color-act-success-bg-light-hover': 'var(--dsw-alias-state-success-tertiary)',
  '--tv-color-act-success-border': 'var(--dsw-alias-state-success-primary)',
  '--tv-color-act-success-border-active': 'var(--dsw-alias-state-success-primary)',
  '--tv-color-act-success-border-active-1': 'var(--dsw-alias-state-success-primary)',
  '--tv-color-act-success-border-hover': 'var(--dsw-alias-state-success-primary)',
  '--tv-color-act-success-border-hover-1': 'var(--dsw-alias-state-success-primary)',
  '--tv-color-act-success-border-light': 'var(--dsw-alias-state-success-primary)',
  '--tv-color-act-success-border-light-active': 'var(--dsw-alias-state-success-primary)',
  '--tv-color-act-success-border-light-hover': 'var(--dsw-alias-state-success-primary)',
  '--tv-color-act-success-plain-text-hover': 'var(--dsw-alias-state-success-primary)',
  '--tv-color-act-success-text': 'var(--dsw-alias-state-success-primary)',
  '--tv-color-act-success-text-active': 'var(--dsw-alias-state-success-primary)',
  '--tv-color-act-success-text-hover': 'var(--dsw-alias-state-success-primary)',
  '--tv-color-act-success-text-white': 'var(--dsw-alias-state-success-primary)',
  '--tv-color-act-success-text-white-active': 'var(--dsw-alias-state-success-primary)',
  '--tv-color-act-success-text-white-hover': 'var(--dsw-alias-state-success-primary)',
  '--tv-color-act-warning-bg': 'var(--dsw-alias-state-warn-tertiary)',
  '--tv-color-act-warning-bg-active': 'var(--dsw-alias-state-warn-tertiary)',
  '--tv-color-act-warning-bg-hover': 'var(--dsw-alias-state-warn-tertiary)',
  '--tv-color-act-warning-bg-light': 'var(--dsw-alias-state-warn-tertiary)',
  '--tv-color-act-warning-bg-light-active': 'var(--dsw-alias-state-warn-tertiary)',
  '--tv-color-act-warning-bg-light-hover': 'var(--dsw-alias-state-warn-tertiary)',
  '--tv-color-act-warning-border': 'var(--dsw-alias-state-warn-primary)',
  '--tv-color-act-warning-border-active': 'var(--dsw-alias-state-warn-primary)',
  '--tv-color-act-warning-border-active-1': 'var(--dsw-alias-state-warn-primary)',
  '--tv-color-act-warning-border-hover': 'var(--dsw-alias-state-warn-primary)',
  '--tv-color-act-warning-border-hover-1': 'var(--dsw-alias-state-warn-primary)',
  '--tv-color-act-warning-border-light': 'var(--dsw-alias-state-warn-primary)',
  '--tv-color-act-warning-border-light-active': 'var(--dsw-alias-state-warn-primary)',
  '--tv-color-act-warning-border-light-hover': 'var(--dsw-alias-state-warn-primary)',
  '--tv-color-act-warning-plain-text-hover': 'var(--dsw-alias-state-warn-primary)',
  '--tv-color-act-warning-text': 'var(--dsw-alias-state-warn-primary)',
  '--tv-color-act-warning-text-active': 'var(--dsw-alias-state-warn-primary)',
  '--tv-color-act-warning-text-hover': 'var(--dsw-alias-state-warn-primary)',
  '--tv-color-act-warning-text-white': 'var(--dsw-alias-state-warn-primary)',
  '--tv-color-act-warning-text-white-active': 'var(--dsw-alias-state-warn-primary)',
  '--tv-color-act-warning-text-white-hover': 'var(--dsw-alias-state-warn-primary)',
  '--tv-color-bg-5': 'var(--dsw-alias-bg-layer-3)',
  '--tv-color-bg-5-active': 'var(--dsw-alias-bg-layer-3)',
  '--tv-color-bg-active-control-1': 'var(--dsw-specific-input-major)',
  '--tv-color-bg-active-primary-1': 'var(--dsw-alias-interactive-bg-hover-accent)',
  '--tv-color-bg-dark': 'var(--dsw-alias-bg-layer-3)',
  '--tv-color-bg-dark-1': 'var(--dsw-alias-bg-layer-3)',
  '--tv-color-bg-disabled-control': 'var(--dsw-specific-input-major)',
  '--tv-color-bg-disabled-control-active': 'var(--dsw-specific-input-major)',
  '--tv-color-bg-disabled-control-checked': 'var(--dsw-specific-input-major)',
  '--tv-color-bg-disabled-control-unactive': 'var(--dsw-specific-input-major)',
  '--tv-color-bg-hover-primary': 'var(--dsw-alias-interactive-bg-hover)',
  '--tv-color-bg-hover-secondary': 'var(--dsw-alias-interactive-bg-hover)',
  '--tv-color-bg-inverse': 'var(--dsw-alias-bg-layer-3)',
  '--tv-color-bg-inverse-disabled': 'var(--dsw-alias-bg-layer-3)',
  '--tv-color-bg-inverse-tint-1': 'var(--dsw-alias-bg-layer-3)',
  '--tv-color-bg-mask-block': 'var(--dsw-alias-bg-mask-1)',
  '--tv-color-bg-scrollbar-track': 'var(--dsw-alias-bg-layer-2)',
  '--tv-color-border-1': 'var(--dsw-alias-border-l2)',
  '--tv-color-border-active': 'var(--dsw-alias-brand-primary)',
  '--tv-color-border-active-control': 'var(--dsw-alias-border-l2)',
  '--tv-color-border-container': 'var(--dsw-alias-border-l2)',
  '--tv-color-border-container-active': 'var(--dsw-alias-border-l2)',
  '--tv-color-border-container-hover': 'var(--dsw-alias-border-l2)',
  '--tv-color-border-disabled': 'var(--dsw-alias-border-l1)',
  '--tv-color-border-ghost': 'var(--dsw-alias-border-l1)',
  '--tv-color-border-ghost-active': 'var(--dsw-alias-border-l1)',
  '--tv-color-border-inverse-tint': 'var(--dsw-alias-border-l3)',
  '--tv-color-border-secondary': 'var(--dsw-alias-border-l2)',
  '--tv-color-border-secondary-hover': 'var(--dsw-alias-border-l2)',
  '--tv-color-error-bg-1': 'var(--dsw-alias-state-error-tertiary)',
  '--tv-color-error-border': 'var(--dsw-alias-state-error-primary)',
  '--tv-color-error-border-1': 'var(--dsw-alias-state-error-primary)',
  '--tv-color-error-border-light': 'var(--dsw-alias-state-error-primary)',
  '--tv-color-error-icon': 'var(--dsw-alias-state-error-primary)',
  '--tv-color-error-text-primary': 'var(--dsw-alias-state-error-primary)',
  '--tv-color-icon-checked-disabled': 'var(--dsw-alias-label-dimmed)',
  '--tv-color-icon-control-disabled': 'var(--dsw-alias-label-dimmed)',
  '--tv-color-icon-inverse': 'var(--dsw-alias-brand-text)',
  '--tv-color-icon-inverse-tint': 'var(--dsw-alias-brand-text)',
  '--tv-color-icon-link': 'var(--dsw-alias-brand-primary)',
  '--tv-color-icon-warn-secondary': 'var(--dsw-alias-state-warn-primary)',
  '--tv-color-icon-white': 'var(--dsw-alias-label-secondary)',
  '--tv-color-info-bg': 'var(--dsw-alias-bg-layer-2)',
  '--tv-color-info-bg-1': 'var(--dsw-alias-bg-layer-2)',
  '--tv-color-info-bg-light': 'var(--dsw-alias-bg-layer-2)',
  '--tv-color-info-border': 'var(--dsw-alias-state-business-primary)',
  '--tv-color-info-border-1': 'var(--dsw-alias-state-business-primary)',
  '--tv-color-info-border-light': 'var(--dsw-alias-state-business-primary)',
  '--tv-color-info-icon': 'var(--dsw-alias-state-business-primary)',
  '--tv-color-info-text': 'var(--dsw-alias-state-business-primary)',
  '--tv-color-info-text-1': 'var(--dsw-alias-state-business-primary)',
  '--tv-color-info-text-primary': 'var(--dsw-alias-state-business-primary)',
  '--tv-color-no-data-border': 'var(--dsw-alias-border-l1)',
  '--tv-color-no-data-brand': 'var(--dsw-alias-brand-primary)',
  '--tv-color-no-data-gary-1': 'var(--dsw-alias-label-tertiary)',
  '--tv-color-no-data-gary-2': 'var(--dsw-alias-label-tertiary)',
  '--tv-color-plain-text-hover': 'var(--dsw-alias-label-primary)',
  '--tv-color-success-bg-1': 'var(--dsw-alias-state-success-tertiary)',
  '--tv-color-success-bg-light': 'var(--dsw-alias-state-success-tertiary)',
  '--tv-color-success-border': 'var(--dsw-alias-state-success-primary)',
  '--tv-color-success-border-1': 'var(--dsw-alias-state-success-primary)',
  '--tv-color-success-border-light': 'var(--dsw-alias-state-success-primary)',
  '--tv-color-success-icon': 'var(--dsw-alias-state-success-primary)',
  '--tv-color-success-text': 'var(--dsw-alias-state-success-primary)',
  '--tv-color-success-text-primary': 'var(--dsw-alias-state-success-primary)',
  '--tv-color-text-active-1': 'var(--dsw-alias-brand-primary)',
  '--tv-color-text-active-2': 'var(--dsw-alias-brand-primary)',
  '--tv-color-text-active-3': 'var(--dsw-alias-brand-primary)',
  '--tv-color-text-darbg': 'var(--dsw-alias-label-primary)',
  '--tv-color-text-hover': 'var(--dsw-alias-label-primary)',
  '--tv-color-text-inverse': 'var(--dsw-alias-brand-text)',
  '--tv-color-text-inverse-active': 'var(--dsw-alias-brand-text)',
  '--tv-color-text-inverse-black': 'var(--dsw-alias-brand-text)',
  '--tv-color-text-inverse-tint': 'var(--dsw-alias-brand-text)',
  '--tv-color-text-link-hover': 'var(--dsw-alias-brand-primary)',
  '--tv-color-text-white': 'var(--dsw-alias-brand-text)',
  '--tv-color-warn-bg-1': 'var(--dsw-alias-state-warn-tertiary)',
  '--tv-color-warn-bg-light': 'var(--dsw-alias-state-warn-tertiary)',
  '--tv-color-warn-border': 'var(--dsw-alias-state-warn-primary)',
  '--tv-color-warn-border-1': 'var(--dsw-alias-state-warn-primary)',
  '--tv-color-warn-border-light': 'var(--dsw-alias-state-warn-primary)',
  '--tv-color-warn-icon': 'var(--dsw-alias-state-warn-primary)',
  '--tv-color-warn-text': 'var(--dsw-alias-state-warn-primary)',
  '--tv-color-warn-text-primary': 'var(--dsw-alias-state-warn-primary)',
}

function buildFixedTokens(p) {
  const dark = p.colorScheme === 'dark'
  return {
    // Page base. The DARK palette used to keep this `transparent`, on the theory
    // that light text survives any backdrop; in practice the backdrop is the
    // plain white window fill, so "transparent" meant "washed out". It is now a
    // near-opaque ground: 4% of the window may show through, but no surface can
    // be fully transparent any more.
    '--dwa-root-base': dark ? rgba(p.bg, 0.84) : `color-mix(in srgb, ${p.bg} 55%, transparent)`,
    // Fail-safe canvas. The material used to live only on `body::before`, so if
    // that pseudo-element ever failed to paint (a stacking-context change, a
    // recomposition that replaced the node, a filter that was dropped), the page
    // had *nothing* behind it and the whole interface showed through — the
    // intermittent "fully transparent" symptom. The same field is therefore
    // painted on `body` itself as well, over a near-opaque base, so the worst
    // case is a plainer canvas rather than an invisible one.
    '--dwa-canvas-base': dark ? `color-mix(in srgb, ${p.bg} 72%, transparent)` : `color-mix(in srgb, ${p.bg} 55%, transparent)`,
    // Frosted panel spec for dialogs: 25% transparency, 30px blur.
    '--dwa-panel-fill': rgba(p.bgTransparent, 0.75),
    '--dwa-panel-blur': '30px',
    // Frosted dim-mask spec: the overlay behind an open modal blurs whatever
    // of the interface shows through it. Radius follows the ACRYLIC knob.
    '--dwa-mask-blur': `${ACRYLIC.maskBlurPx}px`,
    // Native widgets cannot be translucent: the select popup is an OS-level
    // surface, so option rows need a solid colour from the palette.
    '--dwa-menu-solid': dark ? p.bg : p.bgDeepest,
    // tiny-vue (the genui card library) ships its own palette — #fafafa
    // surfaces, gray text, white table cells — which is why cards and their
    // tables ignored the theme entirely. Bridging the *global* `--tv-color-*`
    // family fixes every tiny-vue component at once (Card, Grid/table, Tag…),
    // because each component token is declared as `var(--tv-color-…)`.
    // Values reference our own alias tokens, so both skins stay in sync.
    '--tv-color-text': 'var(--dsw-alias-label-primary)',
    '--tv-color-text-important': 'var(--dsw-alias-label-primary)',
    '--tv-color-text-control': 'var(--dsw-alias-label-primary)',
    '--tv-color-text-secondary': 'var(--dsw-alias-label-secondary)',
    '--tv-color-text-weaken': 'var(--dsw-alias-label-tertiary)',
    '--tv-color-text-placeholder': 'var(--dsw-alias-label-tertiary)',
    '--tv-color-text-disabled': 'var(--dsw-alias-label-dimmed)',
    '--tv-color-text-active': 'var(--dsw-alias-brand-primary)',
    '--tv-color-text-link': 'var(--dsw-alias-brand-primary)',
    '--tv-color-icon': 'var(--dsw-alias-label-secondary)',
    '--tv-color-bg-1': 'var(--dsw-alias-bg-layer-1)',
    '--tv-color-bg-2': 'var(--dsw-alias-bg-layer-2)',
    '--tv-color-bg-3': 'var(--dsw-alias-bg-layer-2)',
    '--tv-color-bg-gray-1': 'var(--dsw-alias-bg-layer-2)',
    '--tv-color-bg-header': 'var(--dsw-alias-bg-layer-3)',
    '--tv-color-bg-hover': 'var(--dsw-alias-interactive-bg-hover)',
    '--tv-color-bg-hover-1': 'var(--dsw-alias-interactive-bg-hover)',
    '--tv-color-bg-active-emphasize-light': 'var(--dsw-alias-interactive-bg-hover-accent)',
    '--tv-color-border': 'var(--dsw-alias-border-l2)',
    '--tv-color-border-divider': 'var(--dsw-alias-border-l1)',
    '--tv-color-border-divider-short': 'var(--dsw-alias-border-l1)',
    '--tv-color-error-text': 'var(--dsw-alias-state-error-primary)',
    // Surfaces the cards actually fill with. In tiny-vue own mapping
    // --tv-color-bg is the card body (white in light, neutral grey in dark)
    // and bg-secondary is the lighter nested surface; both are used far more
    // often than bg-1/2/3, which is why the cards ignored the theme.
    '--tv-color-bg': 'var(--dsw-alias-bg-layer-2)',
    '--tv-color-bg-secondary': 'var(--dsw-alias-bg-layer-1)',
    '--tv-color-bg-primary': 'var(--dsw-alias-bg-layer-2)',
    '--tv-color-bg-control': 'var(--dsw-specific-input-major)',
    '--tv-color-bg-control-unactive': 'var(--dsw-specific-input-major)',
    '--tv-color-bg-container-hover': 'var(--dsw-alias-bg-layer-3)',
    '--tv-color-bg-hover-2': 'var(--dsw-alias-interactive-bg-hover)',
    '--tv-color-bg-hover-3': 'var(--dsw-alias-interactive-bg-hover)',
    '--tv-color-bg-hover-4': 'var(--dsw-alias-interactive-bg-hover)',
    '--tv-color-bg-active': 'var(--dsw-alias-bg-layer-3)',
    '--tv-color-bg-active-secondary': 'var(--dsw-alias-bg-layer-2)',
    '--tv-color-bg-active-primary': 'var(--dsw-alias-brand-primary)',
    '--tv-color-bg-active-control': 'var(--dsw-alias-brand-primary)',
    '--tv-color-bg-active-emphasize': 'var(--dsw-alias-interactive-bg-hover-accent)',
    '--tv-color-bg-active-emphasize-1': 'var(--dsw-alias-interactive-bg-hover-accent)',
    '--tv-color-bg-gray-2': 'var(--dsw-alias-bg-layer-3)',
    '--tv-color-bg-4': 'var(--dsw-alias-bg-layer-3)',
    '--tv-color-bg-disabled': 'var(--dsw-alias-bg-layer-2)',
    '--tv-color-bg-mask': 'var(--dsw-alias-bg-mask-1)',
    '--tv-color-bg-scrollbar-thumb': 'var(--dsw-alias-scrollbar-bg-l1)',
    '--tv-color-bg-scrollbar-thumb-hover': 'var(--dsw-alias-scrollbar-bg-l2)',
    '--tv-color-bg-scrollbar-thumb-active': 'var(--dsw-alias-scrollbar-bg-l2)',
    '--tv-color-bg-progressbar': 'var(--dsw-alias-state-success-primary)',
    '--tv-color-bg-active-dark': 'var(--dsw-alias-bg-layer-3)',
    '--tv-color-bg-hover-dark': 'var(--dsw-alias-bg-layer-3)',
    '--tv-color-text-link-1': 'var(--dsw-alias-brand-primary)',
    '--tv-color-text-link-1-hover': 'var(--dsw-alias-brand-primary)',
    '--tv-color-icon-hover': 'var(--dsw-alias-label-primary)',
    '--tv-color-icon-active': 'var(--dsw-alias-brand-primary)',
    '--tv-color-icon-disabled': 'var(--dsw-alias-label-dimmed)',
    '--tv-color-icon-control': 'var(--dsw-alias-label-secondary)',
    '--tv-color-icon-control-active': 'var(--dsw-alias-brand-primary)',
    '--tv-color-border-hover': 'var(--dsw-alias-border-l3)',
    '--tv-color-border-focus': 'var(--dsw-alias-brand-primary)',
    '--tv-color-success-bg': 'var(--dsw-alias-state-success-tertiary)',
    '--tv-color-warn-bg': 'var(--dsw-alias-state-warn-tertiary)',
    '--tv-color-error-bg': 'var(--dsw-alias-state-error-tertiary)',
    '--tv-color-error-bg-light': 'var(--dsw-alias-state-error-tertiary)',
    ...TV_BRIDGE_EXTRA,
    // The shell paints this over a real window material: dark wash on night,
    // bright wash on day. On Windows the main window has no material, so this
    // only matters if the desktop side ever enables one.
    '--dsw-desktop-window-tint': `color-mix(in srgb, ${dark ? p.bgDeepest : '#ffffff'} 26%, transparent)`,
    '--dsw-menu-backdrop-filter': `blur(${ACRYLIC.menuBlurPx}px) saturate(${ACRYLIC.menuSaturate})`,
    '--dsw-alias-border-l1': rgba(p.dark3, dark ? 0.2 : 0.26),
    '--dsw-alias-border-l2': rgba(p.dark3, dark ? 0.34 : 0.4),
    '--dsw-alias-border-l3': rgba(p.dark3, dark ? 0.46 : 0.52),
    '--dsw-alias-border-l4': rgba(p.dark3, dark ? 0.6 : 0.66),
    '--dsw-alias-label-primary': p.fg,
    '--dsw-alias-label-secondary': p.fgMuted,
    '--dsw-alias-label-tertiary': p.fgSoft,
    '--dsw-alias-label-caption': p.dark5,
    '--dsw-alias-label-dimmed': p.comment,
    '--dsw-alias-brand-primary': p.blue,
    '--dsw-alias-brand-text': dark ? p.bg : '#ffffff',
    '--dsw-alias-button-primary-fill': p.blue,
    '--dsw-alias-button-primary-hover': dark ? p.cyan : mix(p.blue, 85, '#ffffff'),
    '--dsw-alias-button-ghost-active-border': p.gutter,
    '--dsw-alias-state-business-primary': p.blue,
    '--dsw-alias-state-error-primary': p.red,
    '--dsw-alias-state-error-secondary': p.red,
    '--dsw-alias-state-success-primary': p.green,
    '--dsw-alias-state-success-secondary': p.green,
    '--dsw-alias-state-warn-label': p.yellow,
    '--dsw-alias-state-warn-primary': p.yellow,
    '--dsw-alias-state-warn-secondary': p.yellow,
    '--dsw-alias-interactive-bg-hover-accent': rgba(p.blue, 0.14),
    '--dsw-alias-interactive-bg-hover-danger': rgba(p.red, 0.14),
    '--dsw-alias-separator-primary': rgba(p.blue, 0.5),
    '--shiki-foreground': p.fg,
    '--shiki-background': rgba(p.bgDeeper, dark ? 0.44 : 0.6),
    '--shiki-token-constant': p.orange,
    '--shiki-token-string': p.green,
    '--shiki-token-comment': p.comment,
    '--shiki-token-keyword': p.magenta,
    '--shiki-token-parameter': p.red,
    '--shiki-token-function': p.blue,
    '--shiki-token-string-expression': p.green,
    '--shiki-token-punctuation': p.fgMuted,
    '--shiki-token-link': p.blue,
    '--shiki-token-inserted': p.green,
    '--shiki-token-deleted': p.red,
    '--shiki-token-changed': p.yellow
  }
}

/* =============================== skins =================================== */

/** Stable skin ids: the night palette keeps the short id, day gets a suffix. */
function skinId(palette) {
  return palette.id === 'night' ? 'tokyo-night' : `tokyo-night-${palette.id}`
}

/** The two selectable themes, in picker order. */
export const SKINS = PALETTES.map((p) => ({
  id: skinId(p),
  name: `Tokyo Night ${p.label}`,
  colorScheme: p.colorScheme,
  tokens: {
    ...buildStaticTokens(p),
    ...buildSurfaceTokens(p),
    ...buildFixedTokens(p)
  }
}))

/** Theme applied when the user has not chosen yet. */
export const DEFAULT_SKIN = SKINS[0].id

/** Sentinel for "follow the shell's built-in appearance". */
export const NATIVE_SKIN = 'system'

/**
 * Monospace families offered by the font dropdowns.
 *
 * The list is deliberately mono-only and platform-spanning: these are the faces
 * a terminal-adjacent UI actually wants, and they are either shipped with the
 * OS or already common in developer setups. A missing family is harmless — the
 * override always appends the default stack, so an uninstalled name simply
 * falls through to the next entry.
 */
export const MONO_FONTS = [
  'JetBrains Mono',
  'Fira Code',
  'Cascadia Code',
  'Source Code Pro',
  'IBM Plex Mono',
  'Roboto Mono',
  'Ubuntu Mono',
  'SF Mono',
  'Menlo',
  'Consolas',
  'Liberation Mono',
  'DejaVu Sans Mono',
  'Courier New'
]

/**
 * Candidate base names for renderer-side font detection.
 *
 * The browser cannot list installed fonts, but it can answer "is this family
 * available?" for a *given* name — so the renderer probes a catalog of names it
 * knows about. Wider than MONO_FONTS on purpose: CJK monospace faces and the
 * families that ship Nerd Font / Powerline builds are the ones people use.
 */
export const MONO_FONT_BASES = [
  'Cascadia Code',
  'Cascadia Mono',
  'JetBrains Mono',
  'JetBrainsMono',
  'Fira Code',
  'FiraCode',
  'Fira Mono',
  'Source Code Pro',
  'IBM Plex Mono',
  'Roboto Mono',
  'Ubuntu Mono',
  'UbuntuMono',
  'Hack',
  'Inconsolata',
  'Victor Mono',
  'Iosevka',
  'Iosevka Term',
  'Terminus',
  'Maple Mono',
  'Maple Mono CN',
  'Sarasa Mono SC',
  'Sarasa Mono TC',
  'Sarasa Fixed SC',
  'LXGW WenKai Mono',
  'Noto Sans Mono',
  'Noto Sans Mono CJK SC',
  'Anonymous Pro',
  'Cousine',
  'PT Mono',
  'Space Mono',
  'Input Mono',
  'Menlo',
  'SF Mono',
  'Consolas',
  'Lucida Console',
  'Courier New',
  'DejaVu Sans Mono',
  'Liberation Mono',
  'Bitstream Vera Sans Mono',
  'Monaco',
  'Andale Mono'
]

/**
 * Suffixes that turn a base into a patched build. Nerd Fonts and Powerline
 * shipments rename the family, so each variant has to be probed as its own name.
 */
export const MONO_FONT_SUFFIXES = ['', ' NF', ' NFM', ' Nerd Font', ' Nerd Font Mono', ' PL']

/* ============================ acrylic layer ============================== */

/**
 * Master switch for the acrylic layer (blur + textures).
 *
 * History worth keeping: an earlier build blurred the shell's layout columns
 * directly, which (a) made the columns containing blocks for their
 * `position: fixed` window controls — the controls re-anchored and vanished —
 * and (b) escaped the viewport when a column was static, frosting the entire
 * interface including its text. Both are now prevented at runtime rather than
 * by disabling the feature: see HOST_SELECTORS / armBlurHosts.
 */
export const ACRYLIC_ENABLED = true

/** Candidate containers the runtime probes for the blur layer. */
export const HOST_SELECTORS = [
  '[class$="_sidebarCol"]',
  '[class$="_centerCol"]',
  '[class$="_dock"]',
  '[class$="_topbar"]',
  '[class$="_header"]'
]

/** Attribute the runtime sets on the containers that qualify. */
export const HOST_ATTRIBUTE = 'data-dwa-blur'

/**
 * Imitation frost.
 *
 * Real frost is a blur of whatever lies behind a surface — which the sidebar
 * cannot have: it sits at the window edge, there is nothing behind it but our
 * own pre-blurred base, and the container itself cannot be filtered without
 * re-anchoring the absolutely / fixed positioned children the shell puts inside
 * it. So the sidebar gets a *static* texture instead: fine grain, derived from
 * the active palette's own label colour.
 *
 * The grain is deliberately uniform. An earlier version also painted a top-down
 * sheen and a one-pixel inner highlight; because they were applied to the
 * sidebar column only, they drew a hard edge at the column's top and made the
 * chrome look discontinuous next to the title bar — in both the expanded and the
 * collapsed state.
 *
 * It is painted as `background-image` on the element itself — no filter, no
 * pseudo-element, no positioning — so it cannot disturb layout or stacking.
 */
export const FROST_ATTRIBUTE = 'data-dwa-frost'

/** Containers that receive the imitation frost texture. */
export const FROST_SELECTORS = [
  '[class$="_sidebarCol"]',
  '[class$="_sidebar"]',
  '[class$="_sider"]',
  '[class$="_drawer"]'
]

/** Attribute the runtime sets on dialogs that become frosted panels. */
export const PANEL_ATTRIBUTE = 'data-dwa-panel'

/**
 * Attribute for static dialogs: the blur goes on the element itself, since a
 * pseudo-element inside a static box has no containing block to sit in.
 */
export const PANEL_FLAT_ATTRIBUTE = 'data-dwa-panel-flat'

/** Attribute the runtime sets on the dim mask behind an open dialog. */
export const MASK_ATTRIBUTE = 'data-dwa-mask'

/**
 * Dialogs that qualify for the frosted-panel treatment.
 *
 * The shell's settings window is a portal whose overlay is `role="presentation"`
 * and whose panel carries `role="dialog" aria-modal="true"` plus
 * `data-shortcut-modal="settings"`. The plain role selector already matches it,
 * but the two extra selectors keep working if the shell ever drops the role or
 * moves the modal marker (0.2.1 renamed things once already).
 */
export const PANEL_SELECTORS = [
  '[role="dialog"]',
  'dialog',
  '[aria-modal="true"]',
  '[data-shortcut-modal]'
]

/**
 * Frosted panel CSS for dialogs (the settings window among them).
 *
 * Spec: the panel itself runs at 25% transparency over a 30px blur. It is built
 * the way the shell builds its own menu material — an isolated stacking context
 * plus an absolutely positioned `::before` that carries the `backdrop-filter`,
 * never a filter on the surface itself, so no `position: fixed` child is
 * re-anchored. The runtime only arms panels that are already positioned, since
 * the layer needs a containing block to sit in.
 */
export function buildPanelCss() {
  const arm = ':root[data-dwa-theme]'
  const panel = `${arm} [${PANEL_ATTRIBUTE}]`
  return [
    `${panel} {`,
    "  isolation: isolate;",
    "  background-color: var(--dwa-panel-fill) !important;",
    "}",
    `${panel}::before {`,
    '  content: "";',
    "  position: absolute;",
    "  inset: 0;",
    "  z-index: -1;",
    "  pointer-events: none;",
    "  border-radius: inherit;",
    "  -webkit-backdrop-filter: blur(var(--dwa-panel-blur, 30px)) saturate(1.1);",
    "  backdrop-filter: blur(var(--dwa-panel-blur, 30px)) saturate(1.1);",
    "}",
    // Fallback for a dialog that is not positioned: a `::before` would have no
    // containing block, so the blur goes on the element itself. The runtime only
    // takes this path when the dialog has no `position: fixed` or `absolute`
    // descendants: a filter on the element makes it the containing block for all
    // of them, and a static dialog is never anyone's containing block — so any
    // anchored descendant re-anchors into the box and gets clipped (half-shown
    // toolbars, cut-off buttons).
    `${arm} [${PANEL_FLAT_ATTRIBUTE}] {`,
    "  background-color: var(--dwa-panel-fill) !important;",
    "  -webkit-backdrop-filter: blur(var(--dwa-panel-blur, 30px)) saturate(1.1);",
    "  backdrop-filter: blur(var(--dwa-panel-blur, 30px)) saturate(1.1);",
    "}"
  ].join('\n')
}

/**
 * Card sizing and overflow.
 *
 * The card library fixes a card's width through a *class*, not through its
 * container:
 *
 *   .tiny-card.tiny-card--large-width { width: var(--tv-Card-large-width) }
 *
 * and `--tv-Card-large-width` is declared on `.tiny-card` itself as
 * `calc(var(--tv-size-base, 4px) * 144)` = 576px. A schema that omits the
 * library's `auto-width` property therefore renders a 576px card inside a wider
 * column — the "card fills only half the row" symptom — and a wide table inside
 * it has nowhere to scroll.
 *
 * Neither problem can be fixed through the token bridge: the library declares
 * the width variables on the card element, and an element's own declaration
 * beats anything inherited from `body`. A rule targeting the classes does win
 * on specificity, so the sizing is neutralised here for every card, whatever
 * the generator emitted.
 */
export const CARD_CSS_ENABLED = true

export function buildCardCss() {
  if (!CARD_CSS_ENABLED) return ''
  const arm = ':root[data-dwa-theme]'
  const widths = ['large', 'medium', 'small', 'mini']
    .map((size) => `${arm} .tiny-card.tiny-card--${size}-width`)
    .join(',\n')
  return [
    `${widths} {`,
    "  width: auto;",
    "  max-width: 100%;",
    "}",
    // Deliberately no `overflow` here. An earlier revision put
    // `overflow-x: auto` on the card body so wide tables could scroll, and that
    // is the wrong place for a scrollport: the card body hosts absolutely
    // positioned children, and a scroll container gives those a zero-height
    // viewport, so the card rendered empty. `min-width: 0` keeps the flex
    // shrink behaviour (the reason the rule existed) without taking ownership
    // of the box; the table itself already scrolls inside the library.
    `${arm} .tiny-card .tiny-card__body {`,
    "  min-width: 0;",
    "}"
  ].join('\n')
}

/**
 * Frosted dim mask behind open dialogs (the settings window among them).
 *
 * When a modal opens, the shell paints a mask over the page to dim it. The
 * mask is a viewport-sized leaf: it owns no positioned descendants except
 * (sometimes) the dialog itself, whose geometry a re-anchor cannot change
 * because the mask spans the viewport. So — unlike the chrome columns — the
 * blur can go on the element itself. Native `<dialog>` elements expose their
 * backdrop as the `::backdrop` pseudo-element, which gets the same rule.
 */
export function buildMaskCss() {
  const arm = ':root[data-dwa-theme]'
  const blur = `blur(var(--dwa-mask-blur, ${ACRYLIC.maskBlurPx}px)) saturate(1.1)`
  return [
    `${arm} [${MASK_ATTRIBUTE}] {`,
    `  -webkit-backdrop-filter: ${blur};`,
    `  backdrop-filter: ${blur};`,
    "}",
    `${arm} dialog[${PANEL_ATTRIBUTE}]::backdrop,`,
    `${arm} dialog[${PANEL_FLAT_ATTRIBUTE}]::backdrop {`,
    `  -webkit-backdrop-filter: ${blur};`,
    `  backdrop-filter: ${blur};`,
    "}"
  ].join('\n')
}
/**
 * Static grain for surfaces that cannot be blurred.
 *
 * Uniform on purpose: a directional sheen or an inner highlight would only
 * exist on this one column, which makes the chrome look discontinuous against
 * the title bar above it (and when the sidebar is collapsed, even more so).
 * A uniform grain has no edges, so it reads as the same material everywhere.
 *
 * The strength is per palette, because the perception is not symmetric: a light
 * grain over a dark base reads far stronger than a dark grain over a light base.
 * The light palette therefore needs roughly twice the mix to show the same
 * amount of texture.
 */
export function buildFrostCss() {
  const arm = ':root[data-dwa-theme]'
  const grain = (p) => {
    const strength = p.colorScheme === 'dark' ? 6 : 14
    const scope = p.colorScheme === 'dark' ? '[data-ds-dark-theme]' : ':not([data-ds-dark-theme])'
    return [
      `${arm} body${scope} [${FROST_ATTRIBUTE}] {`,
      "  background-image: radial-gradient(",
      `    color-mix(in srgb, var(--dsw-alias-label-primary) ${strength}%, transparent) 0.5px,`,
      "    transparent 0.5px);",
      "  background-size: 3px 3px;",
      "}"
    ].join('\n')
  }
  return [grain(NIGHT), grain(DAY)].join('\n')
}

/**
 * Page base CSS — always mounted while one of our themes is active.
 *
 * Two jobs:
 *
 *  1. It paints the palette's own colour on the root element for the LIGHT
 *     palette, so dark text always has a known ground. The dark palette leaves
 *     the root transparent (its text is light and survives any backdrop).
 *
 *  2. It lays down the **material base**: a soft, pre-blurred gradient built
 *     from the palette's accent hues, sitting behind every surface. This is what
 *     makes the acrylic readable at all. On Windows the main window has no
 *     native material, so blurring "what is behind" would blur a flat colour and
 *     produce nothing; with a textured base underneath, every translucent
 *     surface (and every menu material) has something real to frost.
 */
export function buildBaseCss() {
  const arm = ':root[data-dwa-theme]'
  const layer = (palette, suffix) => [
    `${arm} body${suffix}::before {`,
    '  content: "";',
    "  position: fixed;",
    "  inset: -15%;",
    "  z-index: -2;",
    "  pointer-events: none;",
    `  background:\n    ${materialStack(palette)};`,
    `  filter: blur(${ACRYLIC.materialBlurPx}px) saturate(1.2);`,
    "}",
    // The same field on `body` itself: this is the fail-safe that keeps the
    // interface visible even when the pseudo-element above does not paint.
    `${arm} body${suffix} {`,
    "  background-color: var(--dwa-canvas-base, var(--dwa-root-base, #16161e));",
    `  background-image:\n    ${materialStack(palette)};`,
    "  background-attachment: fixed;",
    "}"
  ].join('\n')
  return [
    `${arm} {`,
    "  background: var(--dwa-root-base, #16161e);",
    "}",
    // Native widgets — the font dropdowns, their option list, scrollbars — follow
    // `color-scheme`. Without this the select popup stays light even on the dark
    // theme, which is exactly the "the dropdown ignores the theme" symptom.
    `${arm} {`,
    "  color-scheme: dark;",
    "}",
    `${arm} body:not([data-ds-dark-theme]) {`,
    "  color-scheme: light;",
    "}",
    // Card sizing and overflow are independent of the acrylic layer, so they live
    // in the always-mounted base rather than in the chrome stylesheet.
    buildCardCss(),

    layer(NIGHT, ''),
    layer(DAY, ':not([data-ds-dark-theme])')
  ].join('\n')
}

/**
 * Strength of the accent hues in the material field, per scheme.
 *
 * Raised from 30/24 when the surfaces went opaque enough to mute the field: a
 * surface at ~0.5 alpha halves the hue variation behind it, so the field has to
 * be about twice as strong to still read as "a background". The ceiling is
 * readability — see the worst-case measurement in the README.
 */
export const MATERIAL_STRENGTH = { dark: 38, light: 30 }

/** Soft multi-hue field used as the material base for one palette. */
function materialStack(p) {
  // The light palette keeps a gentler field: a vivid wash over a bright base
  // looks loud rather than soft.
  const strength = p.colorScheme === 'dark' ? MATERIAL_STRENGTH.dark : MATERIAL_STRENGTH.light
  const stop = (hue, weight, x, y, size) =>
    `radial-gradient(${size}% ${size}% at ${x}% ${y}%, color-mix(in srgb, ${hue} ${weight}%, transparent), transparent 70%)`
  // The base gradient carries a hint of the accent hue so the field reads as a
  // colour sweep rather than a flat panel even where the spots are weak.
  const baseTint = `color-mix(in srgb, ${p.blue} 10%, ${p.bg})`
  return [
    stop(p.blue, strength, 18, 22, 55),
    stop(p.magenta, Math.round(strength * 0.8), 82, 18, 50),
    stop(p.cyan, Math.round(strength * 0.65), 68, 88, 60),
    `linear-gradient(160deg, ${p.bg}, ${baseTint} 58%, ${p.bgDeepest})`
  ].join(',\n    ')
}

/**
 * Acrylic chrome CSS: sidebars, top bars and their like get a *sibling layer*
 * that blurs what is behind them.
 *
 * The layer is a `::before` pseudo-element on an isolated stacking context, not
 * a filter on the container itself: `backdrop-filter` on a container makes it a
 * containing block for its `position: fixed` descendants, which re-anchors the
 * window controls (sidebar toggle, new-session button) and makes them vanish.
 * This mirrors how the shell's own menu material is built.
 *
 * Floating surfaces need no rule here —they blur through
 * `--dsw-menu-backdrop-filter`, which every skin sets as a token.
 */
/**
 * The card library's palette, as a stylesheet rule.
 *
 * The live probe shows the cards are plain light-DOM elements that compute the
 * library's own dark-palette value even though <body> carries our token inline:
 * a class rule between body and the card wins the cascade. Declaring the same
 * variables on the card elements themselves (a selector more specific than any
 * of the library's class rules) beats that, and the values still inherit down to
 * the card's children.
 */
export const TINY_BRIDGE_ENABLED = true

export function buildTinyBridgeCss() {
  // The card library injects its palette through a <style> whose selector is the
  // card root's id (#dsh-genui-card-N). That is specificity 1,0,0, so a plain
  // class rule loses no matter how specific — only !important (or an inline
  // declaration) wins. The declarations below therefore carry !important and
  // target the id pattern as well as the readable class names.
  if (!TINY_BRIDGE_ENABLED) return ''
  const curated = {
    '--tv-color-bg': 'var(--dsw-alias-bg-layer-2)',
    '--tv-color-bg-secondary': 'var(--dsw-alias-bg-layer-1)',
    '--tv-color-bg-primary': 'var(--dsw-alias-bg-layer-3)',
    '--tv-color-bg-header': 'var(--dsw-alias-bg-layer-3)',
    '--tv-color-bg-2': 'var(--dsw-alias-bg-layer-2)',
    '--tv-color-bg-3': 'var(--dsw-alias-bg-layer-2)',
    '--tv-color-bg-4': 'var(--dsw-alias-bg-layer-3)',
    '--tv-color-bg-gray-1': 'var(--dsw-alias-bg-layer-2)',
    '--tv-color-bg-gray-2': 'var(--dsw-alias-bg-layer-3)',
    '--tv-color-text': 'var(--dsw-alias-label-primary)',
    '--tv-color-text-secondary': 'var(--dsw-alias-label-secondary)',
    '--tv-color-text-placeholder': 'var(--dsw-alias-label-tertiary)',
    '--tv-color-border': 'var(--dsw-alias-border-l2)',
    '--tv-color-border-divider': 'var(--dsw-alias-border-l1)',
    '--tv-color-border-container': 'var(--dsw-alias-border-l2)'
  }
  const selectors = [
    ':root[data-dwa-theme] [id^="dsh-genui-card-"]',
    ':root[data-dwa-theme] body [class*="tiny-card"]',
    ':root[data-dwa-theme] body [class*="tiny-"]'
  ].join(',\n')
  const lines = [selectors + ' {']
  for (const [name, value] of Object.entries({ ...TV_BRIDGE_EXTRA, ...curated })) {
    lines.push(`  ${name}: ${value} !important;`)
  }
  lines.push('}')
  return lines.join('\n')
}

export function buildChromeCss() {
  if (!ACRYLIC_ENABLED) return ''
  const blur = `blur(${ACRYLIC.blurPx}px) saturate(${ACRYLIC.saturate})`
  const arm = ':root[data-dwa-theme]'
  const host = `${arm} [${HOST_ATTRIBUTE}]`
  const layer = `${arm} [${HOST_ATTRIBUTE}]::before`
  return [
    // The attribute is set by the runtime, and only on containers that are
    // already positioned. Isolating those keeps the -1 layer inside the
    // container's own stacking context: above its background, below its
    // content -- exactly how the shell builds its own menu material.
    `${host} {`,
    "  isolation: isolate;",
    "}",
    `${layer} {`,
    '  content: "";',
    "  position: absolute;",
    "  inset: 0;",
    "  z-index: -1;",
    "  pointer-events: none;",
    "  border-radius: inherit;",
    `  -webkit-backdrop-filter: ${blur};`,
    `  backdrop-filter: ${blur};`,
    "}",
    // Grain sits *behind* content: a negative-z fixed layer inside the root
    // stacking context, never above the interface.
    `${arm} body::after {`,    '  content: "";',
    "  position: fixed;",
    "  inset: 0;",
    "  pointer-events: none;",
    "  z-index: -1;",
    `  opacity: ${ACRYLIC.noiseOpacity};`,
    "  background-image: radial-gradient(rgba(255, 255, 255, 0.9) 0.5px, transparent 0.5px);",
    "  background-size: 3px 3px;",
    "}",
    "@media (prefers-reduced-transparency: reduce) {",
    `${layer},`,
    `${arm} [${MASK_ATTRIBUTE}],`,
    `${arm} dialog[${PANEL_ATTRIBUTE}]::backdrop,`,
    `${arm} dialog[${PANEL_FLAT_ATTRIBUTE}]::backdrop {`,
    "    -webkit-backdrop-filter: none;",
    "    backdrop-filter: none;",
    "  }",
    "}",
    // Surfaces that cannot be blurred at all get the static frosted texture.
    buildFrostCss(),
    // Dialogs get a real frosted panel (25% transparency + 30px blur).
    buildPanelCss(),
    // The dim mask behind an open dialog frosts the interface beneath it.
    buildMaskCss()
  ].join("\n")
}

/**
 * Global font override CSS. The shell reads `--dsw-font-family` from <body>, and
 * a user-supplied family is applied there with `!important` —that is what beats
 * the runtime's own non-important inline declaration on the same element.
 *
 * The fallback stack is written out literally: a declaration like
 * `--dsw-font-family: X, var(--dsw-font-family)` would reference itself, which
 * CSS treats as a cycle and drops —killing every `font:` shorthand that reads
 * the variable, and with it most of the interface's typography.
 *
 * @param {string} family - CSS font-family list (sanitised here).
 * @param {string} codeFamily - optional code font list.
 */
export function buildFontCss(family, codeFamily) {
  const clean = typeof family === 'string' ? family.replace(/[";{}]/g, '').trim() : ''
  if (clean.length === 0) return ''
  const code = typeof codeFamily === 'string' ? codeFamily.replace(/[";{}]/g, '').trim() : ''
  const uiFallback = '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif'
  const codeFallback = '"SF Mono", "JetBrains Mono", Consolas, "Liberation Mono", monospace'
  const lines = [`  --dsw-font-family: ${clean}, ${uiFallback} !important;`]
  if (code.length > 0) lines.push(`  --ds-font-family-code: ${code}, ${codeFallback} !important;`)
  return `:root[data-dwa-theme] body {\n${lines.join('\n')}\n}`
}
