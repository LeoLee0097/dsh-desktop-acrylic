// Build the shippable artifacts from src/.
//
//   src/theme.mjs     → palettes, skins, acrylic chrome CSS, font CSS
//   src/client.tpl.js → the browser half (hand-written, GENERATED header kept)
//   ↓
//   lib/client.js         — the bundle dsh-client-modules serves
//   themes/<skin-id>.json — one canonical file per skin
//
// The script self-checks before writing: it evaluates the generated bundle with
// a stub `window.__ModuleLoader__` and asserts the captured skins, defaults and
// acrylic CSS line up with the source, so a broken build cannot land silently.
//
//   node scripts/build.mjs
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { ACRYLIC, ACRYLIC_ENABLED, DEFAULT_SKIN, FROST_ATTRIBUTE, FROST_SELECTORS, HOST_ATTRIBUTE, HOST_SELECTORS, MONO_FONTS, MONO_FONT_BASES, MONO_FONT_SUFFIXES, NATIVE_SKIN, PANEL_ATTRIBUTE, PANEL_SELECTORS, SKINS, buildBaseCss, buildChromeCss } from '../src/theme.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

const tplPath = join(root, 'src', 'client.tpl.js')
const bundlePath = join(root, 'lib', 'client.js')
const themesDir = join(root, 'themes')

/** Re-indent a multi-line JSON string to sit at the given tab depth. */
function indent(text, tabs) {
  const pad = '\t'.repeat(tabs)
  return text
    .split('\n')
    .map((line, index) => (index === 0 ? line : `${pad}${line}`))
    .join('\n')
}

const chromeCss = buildChromeCss()
const baseCss = buildBaseCss()
const template = readFileSync(tplPath, 'utf8')

const substitutions = [
  ['/*__SKINS__*/ []', indent(JSON.stringify(SKINS, null, 2), 2)],
  ['/*__ACRYLIC__*/ {}', indent(JSON.stringify(ACRYLIC, null, 3), 2)],
  ['/*__ACRYLIC_ENABLED__*/ false', JSON.stringify(ACRYLIC_ENABLED)],
  ['/*__BASE_CSS__*/ ""', JSON.stringify(baseCss)],
  ['/*__CHROME_CSS__*/ ""', JSON.stringify(chromeCss)],
  ['/*__HOST_SELECTORS__*/ []', indent(JSON.stringify(HOST_SELECTORS, null, 2), 2)],
  ['/*__HOST_ATTRIBUTE__*/ "data-dwa-blur"', JSON.stringify(HOST_ATTRIBUTE)],
  ['/*__FROST_SELECTORS__*/ []', indent(JSON.stringify(FROST_SELECTORS, null, 2), 2)],
  ['/*__FROST_ATTRIBUTE__*/ "data-dwa-frost"', JSON.stringify(FROST_ATTRIBUTE)],
  ['/*__PANEL_SELECTORS__*/ []', indent(JSON.stringify(PANEL_SELECTORS, null, 2), 2)],
  ['/*__PANEL_ATTRIBUTE__*/ "data-dwa-panel"', JSON.stringify(PANEL_ATTRIBUTE)],
  ['/*__MONO_FONTS__*/ []', indent(JSON.stringify(MONO_FONTS, null, 2), 2)],
  ['/*__MONO_FONT_BASES__*/ []', indent(JSON.stringify(MONO_FONT_BASES, null, 2), 2)],
  ['/*__MONO_FONT_SUFFIXES__*/ []', indent(JSON.stringify(MONO_FONT_SUFFIXES, null, 2), 2)],
  ['/*__DEFAULT_SKIN__*/ "tokyo-night"', JSON.stringify(DEFAULT_SKIN)],
  ['/*__NATIVE_SKIN__*/ "system"', JSON.stringify(NATIVE_SKIN)]
]

let bundle = template
for (const [marker, replacement] of substitutions) {
  if (!bundle.includes(marker)) throw new Error(`build: placeholder ${marker} not found in src/client.tpl.js`)
  bundle = bundle.replace(marker, replacement)
}
for (const marker of ['__SKINS__', '__ACRYLIC__', '__ACRYLIC_ENABLED__', '__BASE_CSS__', '__CHROME_CSS__', '__HOST_SELECTORS__', '__HOST_ATTRIBUTE__', '__FROST_SELECTORS__', '__FROST_ATTRIBUTE__', '__PANEL_SELECTORS__', '__PANEL_ATTRIBUTE__', '__MONO_FONTS__', '__MONO_FONT_BASES__', '__MONO_FONT_SUFFIXES__', '__DEFAULT_SKIN__', '__NATIVE_SKIN__']) {
  if (bundle.includes(`/*${marker}*/`)) throw new Error(`build: placeholder ${marker} survived substitution`)
}

/* ------------------------------ self-check ------------------------------- */

let captured = null
globalThis.window = {
  __ModuleLoader__: {
    load: ({ factory }) => {
      captured = factory((name) => {
        if (name === 'react') return {}
        // defineStore is only invoked from apply(), never at load time.
        if (name === '@deepseek-ai/dsh-client-store') return { defineStore: (spec) => spec }
        throw new Error(`build: unexpected require(${name}) at load time`)
      })
    }
  }
}

new Function(bundle)()

if (captured === null) throw new Error('build: bundle did not register itself')
if (!Array.isArray(captured.SKINS) || captured.SKINS.length !== SKINS.length) {
  throw new Error('build: skin count mismatch')
}
for (const [index, skin] of SKINS.entries()) {
  if (captured.SKINS[index].id !== skin.id) throw new Error(`build: skin #${index} id mismatch`)
  if (captured.SKINS[index].colorScheme !== skin.colorScheme) {
    throw new Error(`build: skin ${skin.id} colour scheme mismatch`)
  }
}
if (captured.DEFAULT_SKIN !== DEFAULT_SKIN) throw new Error('build: default skin mismatch')
if (captured.NATIVE_SKIN !== NATIVE_SKIN) throw new Error('build: native sentinel mismatch')
if (typeof captured.BASE_CSS !== 'string' || !captured.BASE_CSS.includes('--dwa-root-base')) {
  throw new Error('build: base CSS must paint the opaque page base')
}
if (captured.ACRYLIC_ENABLED !== ACRYLIC_ENABLED) throw new Error('build: acrylic stage flag mismatch')
if (ACRYLIC_ENABLED) {
  if (typeof captured.CHROME_CSS !== 'string' || !captured.CHROME_CSS.includes('backdrop-filter')) {
    throw new Error('build: chrome CSS missing or without a backdrop-filter')
  }
  if (!captured.CHROME_CSS.includes(`[${HOST_ATTRIBUTE}]::before`)) {
    throw new Error('build: chrome CSS must blur through the runtime-set host attribute')
  }
  // Guard the v0.1.2 / v0.3.0 regressions: no bare container rule may carry a
  // filter (that re-anchors fixed chrome), and nothing may be positioned by us.
  const containerNames = ['_sidebarCol', '_centerCol', '_dock', '_topbar', '_header']
  for (const rule of captured.CHROME_CSS.split('}')) {
    const brace = rule.indexOf('{')
    if (brace < 0) continue
    const selector = rule.slice(0, brace)
    const body = rule.slice(brace + 1)
    const hitsContainer = containerNames.some((name) => selector.includes(`[class$="${name}"]`))
    if (hitsContainer && (body.includes('backdrop-filter') || body.includes('position'))) {
      throw new Error(`build: chrome CSS targets a container directly (${selector.trim().split('\n')[0]})`)
    }
  }
  if (!captured.CHROME_CSS.includes("[" + PANEL_ATTRIBUTE + "]::before")) {
    throw new Error('build: chrome CSS must frost dialogs through the panel attribute')
  }
  if (!captured.CHROME_CSS.includes('--dwa-panel-fill')) {
    throw new Error('build: panel fill token missing from the panel rules')
  }
  if (!Number.isFinite(Number(captured.SKINS[0].tokens['--dwa-panel-blur'].replace('px', '')))) {
    throw new Error('build: panel blur token is not a pixel value')
  }
  if (!Array.isArray(captured.MONO_FONT_BASES) || captured.MONO_FONT_BASES.length < 20) {
    throw new Error('build: font probe catalog missing from the bundle')
  }
  if (!Array.isArray(captured.MONO_FONTS) || captured.MONO_FONTS.length < 5) {
    throw new Error('build: monospace font catalog missing from the bundle')
  }
  if (!Array.isArray(captured.HOST_SELECTORS) || captured.HOST_SELECTORS.length === 0) {
    throw new Error('build: host selector list is empty')
  }
}
if (typeof captured.apply !== 'function') throw new Error('build: bundle exports no apply()')
if (!Array.isArray(captured.inject)) throw new Error('build: bundle exports no inject list')

/* --------------------------- token validation ---------------------------- */

/**
 * Every token value must be self-contained and well-formed. One malformed value
 * can poison the whole inline style block the runtime applies to <body>, which
 * takes the interface's colours — and therefore its text — with it. So the build
 * refuses to emit a skin whose values are not in this conservative grammar.
 */
const VALUE_PATTERNS = [
  /^#[0-9a-f]{6}$/i,
  /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*[0-9.]+\s*)?\)$/i,
  /^color-mix\(in srgb,[^;{}]*\)$/i,
  /^blur\([0-9.]+px\) saturate\([0-9.]+\)$/,
  /^[0-9.]+px$/,
  // Bridge tokens may reference our own alias tokens; anything else is rejected.
  /^var\(--dsw-[a-z0-9-]+\)$/,
  /^transparent$/
]

const badTokens = []
for (const skin of SKINS) {
  for (const [token, value] of Object.entries(skin.tokens)) {
    const text = String(value)
    // A `var()` is only acceptable when it points at one of our own alias
    // tokens: a dangling reference would invalidate the whole inline block.
    const varOk = !text.includes('var(') || /^var\(--dsw-[a-z0-9-]+\)$/.test(text)
    const ok = text.length > 0 && !/[;{}]/.test(text) && varOk && VALUE_PATTERNS.some((re) => re.test(text))
    if (!ok) badTokens.push(`${skin.id} ${token} = ${text}`)
  }
}
if (badTokens.length > 0) {
  console.error('build: refusing to emit malformed token values:')
  for (const line of badTokens) console.error(`  ${line}`)
  process.exit(1)
}

const baseArmRule = /:root\[data-dwa-theme\]\s*\{[^}]*background:\s*var\(--dwa-root-base/
if (!baseArmRule.test(baseCss)) {
  throw new Error('build: base CSS must paint an opaque page base on :root')
}

/* -------------------------------- outputs -------------------------------- */

mkdirSync(dirname(bundlePath), { recursive: true })
mkdirSync(themesDir, { recursive: true })
writeFileSync(bundlePath, bundle)

const written = new Set()
for (const skin of SKINS) {
  const file = `${skin.id}.json`
  written.add(file)
  writeFileSync(join(themesDir, file), `${JSON.stringify(skin, null, 2)}\n`)
}

// Drop theme files that no longer correspond to a skin.
const removed = []
for (const entry of readdirSync(themesDir)) {
  if (entry.endsWith('.json') && !written.has(entry)) {
    rmSync(join(themesDir, entry))
    removed.push(entry)
  }
}

console.log(`built lib/client.js (${bundle.length} bytes)`)
console.log(`built ${written.size} theme file(s): ${[...written].join(', ')}`)
if (removed.length > 0) console.log(`removed stale theme file(s): ${removed.join(', ')}`)
for (const skin of SKINS) {
  console.log(
    `  ${skin.id.padEnd(16)} ${skin.colorScheme.padEnd(5)} ${String(Object.keys(skin.tokens).length).padStart(3)} tokens  bg-base ${skin.tokens['--dsw-alias-bg-base']}`
  )
}
