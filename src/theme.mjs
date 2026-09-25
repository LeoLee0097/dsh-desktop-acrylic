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

/** Tokyo Night —day (light). */
export const DAY = {
  id: 'day',
  label: '亮色',
  labelEn: 'Light',
  colorScheme: 'light',
  bg: '#e1e2e7',
  bgTransparent: '#d5d8e3',
  bgDeeper: '#e9eaf0',
  bgDeepest: '#f2f3f7',
  bgHighlight: '#c4c8da',
  bgRaised: '#b7bdd4',
  fg: '#3760bf',
  fgMuted: '#6172b0',
  fgSoft: '#4c5a91',
  gutter: '#a8aecb',
  comment: '#848cb5',
  dark3: '#8990b3',
  dark5: '#68709a',
  blue: '#2e7de9',
  blue0: '#1f4b99',
  cyan: '#007197',
  green: '#587539',
  magenta: '#9854f1',
  orange: '#b15c00',
  purple: '#7847bd',
  red: '#f52a65',
  yellow: '#8c6c3e'
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
 * Surface table: `[token, hue, alpha, floor?]`. The light palette scales every
 * alpha up slightly —over a bright backdrop, low alpha costs contrast.
 */
function surfaceTable(p) {
  const dark = p.colorScheme === 'dark'
  const k = dark ? 1 : 9
  return [
    // Readability first: the canvas, the base layer and the sidebar stay close
    // to opaque. Text contrast must not depend on whatever the window happens
    // to paint behind the page —only floating surfaces are allowed to be
    // genuinely see-through.
    ['--dsw-alias-bg-base', p.bgTransparent, 0.1 * k],
    ['--dsw-alias-bg-layer-1', p.bgDeeper, 0.08 * k],
    ['--dsw-alias-bg-layer-2', p.bgHighlight, 0.18 * k],
    ['--dsw-alias-bg-layer-3', p.bgRaised, 0.24 * k],
    ['--dsw-alias-bg-overlay', p.bg, 0.72 * k, 0.6],
    ['--dsw-specific-sidebar-fill', p.bgDeeper, 0.1 * k],
    ['--dsw-specific-sidebar-nav-item-hover', p.bgHighlight, 0.28 * k, 0.2],
    ['--dsw-specific-sidebar-nav-item-active', p.bgHighlight, 0.44 * k, 0.34],
    ['--dsw-specific-input-major', p.bgTransparent, 0.26 * k, 0.2],
    ['--dsw-specific-login-input', p.bgTransparent, 0.26 * k, 0.2],
    ['--dsw-specific-selector', p.bgHighlight, 0.46 * k, 0.36],
    ['--dsw-specific-bubble', p.bgHighlight, 0.34 * k, 0.26],
    ['--dsw-specific-bubble-highlight', p.bgRaised, 0.42 * k, 0.32],
    ['--dsw-alias-bg-module-platform', p.bgHighlight, 0.34 * k],
    ['--dsw-alias-bg-multi-select', p.bgHighlight, 0.34 * k],
    ['--dsw-alias-bg-skeleton', p.bgRaised, 0.08 * k, 0.05],
    ['--dsw-alias-markdown-code-block', p.bgDeeper, 0.44 * k, 0.34],
    ['--dsw-alias-markdown-code-block-banner', p.bgHighlight, 0.44 * k, 0.32],
    ['--dsw-alias-markdown-code-segment-selected', p.bgHighlight, 0.44 * k, 0.32],
    ['--dsw-alias-markdown-code-segment-unselected', p.bgDeeper, 0.44 * k, 0.34],
    ['--dsw-alias-markdown-citation', p.bgHighlight, 0.44 * k, 0.32],
    ['--dsw-alias-markdown-inline-code', p.bgHighlight, 0.44 * k, 0.32],
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

function buildSurfaceTokens(p) {
  const tokens = {}
  for (const [token, hex, alpha, floor] of surfaceTable(p)) {
    const minimum = typeof floor === 'number' ? floor : 0.02
    tokens[token] = rgba(hex, Math.max(alpha, minimum))
  }
  return tokens
}

/**
 * Everything fixed per palette: borders, labels, brand, states, syntax colours
 * and the window-material / menu-material knobs.
 */
function buildFixedTokens(p) {
  const dark = p.colorScheme === 'dark'
  return {
    // Opaque page base for the LIGHT palette only: dark text needs a known
    // ground. The dark palette stays truly transparent so the effect is real.
    '--dwa-root-base': dark ? 'transparent' : p.bg,
    // Frosted panel spec for dialogs: 25% transparency, 30px blur.
    '--dwa-panel-fill': rgba(p.bgTransparent, 0.75),
    '--dwa-panel-blur': '30px',
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

/* ============================ acrylic layer ============================== */

/**
 * Container blur layer switch —deliberately OFF.
 *
 * Two-point correlation across builds: v0.3.0 (layer on) —text unreadable,
 * v0.3.2 (layer off, 0 bytes of chrome CSS) —everything fine, v0.3.3 (layer on)
 * —text unreadable again. The layer is therefore the culprit, not the tokens.
 *
 * Why it cannot simply be patched: the shell's own menu material puts the blur
 * on a `::before` of a container **it owns and positions** (`position: relative`
 * + `isolation: isolate`). Our containers are the shell's layout columns, and
 * we can neither add `position: relative` (that would re-anchor their absolutely
 * positioned children) nor rely on them being positioned —an absolutely
 * positioned pseudo-element inside a static container escapes to the nearest
 * positioned ancestor, spans the viewport, and ends up frosting the interface
 * itself instead of sitting behind it.
 *
 * The safe, native path stays: every skin ships
 * `--dsw-menu-backdrop-filter` (blur = `ACRYLIC.blurPx`), which the shell applies
 * to its own menu/popover material. Menus keep their frost; nothing else is
 * touched.
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
 * it. So the sidebar gets a *static* frosted texture instead: a soft top-down
 * sheen, fine grain, and a one-pixel inner highlight, all derived from the
 * active palette's own label colour.
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

/** Dialogs that qualify for the frosted-panel treatment. */
export const PANEL_SELECTORS = ['[role="dialog"]', 'dialog']

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
    "}"
  ].join('\n')
}
export function buildFrostCss() {
  const arm = ':root[data-dwa-theme]'
  const target = `${arm} [${FROST_ATTRIBUTE}]`
  return [
    `${target} {`,
    "  background-image:",
    "    linear-gradient(180deg,",
    "      color-mix(in srgb, var(--dsw-alias-label-primary) 7%, transparent),",
    "      transparent 45%),",
    "    radial-gradient(color-mix(in srgb, var(--dsw-alias-label-primary) 9%, transparent) 0.5px, transparent 0.5px);",
    "  background-size: auto, 3px 3px;",
    "  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--dsw-alias-label-primary) 8%, transparent);",
    "}"
  ].join('\n')
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
    "}"
  ].join('\n')
  return [
    `${arm} {`,
    "  background: var(--dwa-root-base, transparent);",
    "}",
    layer(NIGHT, ''),
    layer(DAY, ':not([data-ds-dark-theme])')
  ].join('\n')
}

/** Soft multi-hue field used as the material base for one palette. */
function materialStack(p) {
  const strength = p.colorScheme === 'dark' ? 30 : 22
  const stop = (hue, weight, x, y, size) =>
    `radial-gradient(${size}% ${size}% at ${x}% ${y}%, color-mix(in srgb, ${hue} ${weight}%, transparent), transparent 70%)`
  return [
    stop(p.blue, strength, 18, 22, 45),
    stop(p.magenta, Math.round(strength * 0.8), 82, 18, 40),
    stop(p.cyan, Math.round(strength * 0.65), 68, 88, 50),
    `linear-gradient(160deg, ${p.bg}, ${p.bgTransparent} 55%, ${p.bgDeepest})`
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
    `${layer} {`,
    "    -webkit-backdrop-filter: none;",
    "    backdrop-filter: none;",
    "  }",
    "}",
    // Surfaces that cannot be blurred at all get the static frosted texture.
    buildFrostCss(),
    // Dialogs get a real frosted panel (25% transparency + 30px blur).
    buildPanelCss()
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
