/**
 * dsh-desktop-acrylic — host half.
 *
 * Holds the durable state so choices survive DSH Desktop's per-launch
 * loopback port (where the browser origin — and therefore localStorage — is
 * not stable). The same pattern the catppuccin theme plugin uses: exact
 * webServer routes, state written atomically to $DSH_HOME.
 *
 *   /dark-acrylic/state      GET -> the stored state, {} when never written
 *   /dark-acrylic/state      PUT -> writes the JSON body as-is
 *   /dark-acrylic/fonts      GET -> installed font catalog (host scan)
 *   /dark-acrylic/preference GET  -> ui-theme preference read back from every
 *                                    profile patch layer
 *   /dark-acrylic/preference PUT  -> splice the ui-theme `preference:` key
 *                                    into every profile's cordis.patch.yml
 *
 * The desktop window is a `dsh-app://app` origin and does keep localStorage, so
 * the browser flag remains the instant layer; the state file is the durable
 * one. Without a live webServer (headless profiles) the half stays inert.
 */
import { mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'

export const name = 'dsh-desktop-acrylic'

/** `webServer` is a hard inject dependency: no server, no route, no state. */
export const inject = ['webServer']

const STATE_PATH = '/dark-acrylic/state'
const STATE_FILENAME = 'dark-acrylic-state.json'
const FONTS_PATH = '/dark-acrylic/fonts'
const PREFERENCE_PATH = '/dark-acrylic/preference'

function dshHome() {
  return process.env.DSH_HOME || join(homedir(), '.dsh')
}

function stateFilePath() {
  return join(dshHome(), STATE_FILENAME)
}

/** Read the durable state; absent or unparseable means none yet. */
function readDurableState() {
  try {
    const parsed = JSON.parse(readFileSync(stateFilePath(), 'utf8'))
    if (typeof parsed !== 'object' || parsed === null) return null
    return parsed
  } catch {
    return null
  }
}

/** Write atomically: temp file + rename over the target (mode 0600). */
function writeDurableState(state) {
  const path = stateFilePath()
  mkdirSync(dirname(path), { recursive: true })
  const tmp = `${path}.tmp`
  writeFileSync(tmp, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 })
  renameSync(tmp, path)
}

function json(res, status, payload) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(payload))
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

/* ------------------------------ system fonts ----------------------------- */

/** Exposed for scripts/check-fonts.mjs; the route uses the same cache. */
export function systemFontCatalog() {
  return systemFonts()
}

/**
 * Where installed fonts live, per platform. Only the usual locations are
 * scanned: system-wide plus the per-user directory.
 */
function fontDirectories() {
  if (process.platform === 'win32') {
    return [
      join(process.env.WINDIR || 'C:\\Windows', 'Fonts'),
      join(process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local'), 'Microsoft', 'Windows', 'Fonts'),
    ]
  }
  if (process.platform === 'darwin') {
    return ['/System/Library/Fonts', '/Library/Fonts', join(homedir(), 'Library', 'Fonts')]
  }
  return ['/usr/share/fonts', '/usr/local/share/fonts', join(homedir(), '.local', 'share', 'fonts'), join(homedir(), '.fonts')]
}

/** Recursively collect font files (bounded depth; font trees are shallow). */
function collectFontFiles(directory, depth = 2, found = []) {
  if (depth < 0) return found
  let entries = []
  try {
    entries = readdirSync(directory, { withFileTypes: true })
  } catch {
    return found
  }
  for (const entry of entries) {
    const full = join(directory, entry.name)
    if (entry.isDirectory()) collectFontFiles(full, depth - 1, found)
    else if (/\.(ttf|otf|ttc|otc)$/i.test(entry.name)) found.push(full)
  }
  return found
}

/** Decode one `name` table string record into a JS string. */
function decodeNameString(buffer, platformId, offset, length) {
  // Platform 3 (Windows) and 0 (Unicode) store UTF-16BE; the rest is latin-ish.
  if (platformId === 3 || platformId === 0) {
    let out = ''
    for (let i = 0; i + 1 < length; i += 2) out += String.fromCharCode(buffer.readUInt16BE(offset + i))
    return out
  }
  return buffer.toString('latin1', offset, offset + length)
}

/**
 * Read a font's family name and its fixed-pitch flag straight out of the binary.
 *
 * Family comes from the `name` table (typographic family preferred, else
 * family), the monospace flag from `post.isFixedPitch` — the format's own
 * answer to "is this a monospace face", so patched variants (Nerd Font, PL…)
 * are classified correctly instead of by guessing from the file name.
 *
 * @returns {{family: string, fixed: boolean}|null}
 */
function readFontMeta(buffer) {
  try {
    let tableOffset = 0
    if (buffer.toString('ascii', 0, 4) === 'ttcf') {
      if (buffer.readUInt32BE(8) === 0) return null
      tableOffset = buffer.readUInt32BE(12) // first font in the collection
    }
    const numTables = buffer.readUInt16BE(tableOffset + 4)
    let nameOffset = 0
    let postOffset = 0
    for (let i = 0; i < numTables; i += 1) {
      const record = tableOffset + 12 + i * 16
      const tag = buffer.toString('ascii', record, record + 4)
      if (tag === 'name') nameOffset = buffer.readUInt32BE(record + 8)
      else if (tag === 'post') postOffset = buffer.readUInt32BE(record + 8)
    }
    if (nameOffset === 0) return null

    const count = buffer.readUInt16BE(nameOffset + 2)
    const stringOffset = nameOffset + buffer.readUInt16BE(nameOffset + 4)
    let family = ''
    let typographic = ''
    for (let i = 0; i < count; i += 1) {
      const record = nameOffset + 6 + i * 12
      const platformId = buffer.readUInt16BE(record)
      const nameId = buffer.readUInt16BE(record + 6)
      const length = buffer.readUInt16BE(record + 8)
      const offset = stringOffset + buffer.readUInt16BE(record + 10)
      if (nameId === 16 && typographic.length === 0) family = decodeNameString(buffer, platformId, offset, length)
      else if (nameId === 1 && family.length === 0) family = decodeNameString(buffer, platformId, offset, length)
      if (family.length > 0 && platformId === 3) typographic = family
    }
    if (family.length === 0) return null

    let fixed = false
    if (postOffset > 0 && postOffset + 16 <= buffer.length) {
      fixed = buffer.readUInt32BE(postOffset + 12) === 1
    }
    return { family: family.trim(), fixed }
  } catch {
    return null
  }
}

/** Cached font catalog: scanning a font directory is not a per-request job. */
let fontCache = null

/* ---------------------- ui-theme preference layer ------------------------ */

/**
 * Where the shell persists the user's theme preference: the profile's own
 * patch layer (`cordis.patch.yml`), the same file its native theme picker
 * writes. The runtime keeps the effective preference in memory only, so
 * client-tree re-initializations drop it — unless the layer carries it.
 * Later native choices rewrite the same key, so writing it here fixes the
 * reset at its root without touching theme-picking freedom.
 */

/**
 * Splice `preference: <value>` into the `ui-theme` block of a patch layer,
 * preserving everything else byte for byte. Appends the block when no
 * `ui-theme` entry exists (an empty `[]` layer becomes a one-entry list).
 * Returns the new text, or null when the structure is unrecognised.
 */
export function setPatchPreference(source, value) {
  const lines = source.split('\n')
  const entryRe = /^(\s*)- id: ui-theme\s*$/
  let start = -1
  let indent = ''
  for (let i = 0; i < lines.length; i += 1) {
    const match = entryRe.exec(lines[i])
    if (match !== null) {
      start = i
      indent = match[1]
      break
    }
  }
  const block = [
    `${indent}- id: ui-theme`,
    `${indent}  name: "@deepseek-ai/dsh-client-ui-theme"`,
    `${indent}  config:`,
    `${indent}    preference: ${value}`
  ]
  if (start < 0) {
    // No ui-theme entry: append one to the top-level list. An empty layer
    // (`[]` or whitespace) simply becomes the entry list; anything that is
    // not a list at all is left alone.
    const trimmed = source.trim()
    if (trimmed === '' || trimmed === '[]') return `${block.join('\n')}\n`
    if (!/^\s*- id:/m.test(source)) return null
    const out = source.replace(/\s+$/, '').split('\n')
    out.push(...block)
    return `${out.join('\n')}\n`
  }
  // The block ends at the next `- id:` with the same indent (or EOF).
  let end = lines.length
  const nextRe = new RegExp(`^${indent}- id:`)
  for (let i = start + 1; i < lines.length; i += 1) {
    if (nextRe.test(lines[i])) {
      end = i
      break
    }
  }
  const prefRe = /^(\s*)preference:.*$/
  for (let i = start + 1; i < end; i += 1) {
    const match = prefRe.exec(lines[i])
    if (match !== null) {
      lines[i] = `${match[1]}preference: ${value}`
      return lines.join('\n')
    }
  }
  // No preference key yet: insert right after the block's `config:` line.
  for (let i = start + 1; i < end; i += 1) {
    if (/^\s*config:\s*$/.test(lines[i])) {
      lines.splice(i + 1, 0, `${indent}    preference: ${value}`)
      return lines.join('\n')
    }
  }
  return null
}

/** Extract the ui-theme `preference:` value from a patch layer, or null. */
export function readLayerPreference(source) {
  const lines = source.split('\n')
  const entryRe = /^(\s*)- id: ui-theme\s*$/
  let start = -1
  let indent = ''
  for (let i = 0; i < lines.length; i += 1) {
    const match = entryRe.exec(lines[i])
    if (match !== null) {
      start = i
      indent = match[1]
      break
    }
  }
  if (start < 0) return null
  const nextRe = new RegExp(`^${indent}- id:`)
  for (let i = start + 1; i < lines.length; i += 1) {
    if (nextRe.test(lines[i])) break
    const match = /^\s*preference:\s*([^\s#]+)/.exec(lines[i])
    if (match !== null) return match[1]
  }
  return null
}

/** ui-theme preference values found across all profile patch layers. */
function readPreferenceAcrossProfiles() {
  const profilesDir = join(dshHome(), 'profiles')
  let entries = []
  try {
    entries = readdirSync(profilesDir, { withFileTypes: true })
  } catch {
    return { ok: false, values: [] }
  }
  const values = []
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    try {
      const source = readFileSync(join(profilesDir, entry.name, 'cordis.patch.yml'), 'utf8')
      const value = readLayerPreference(source)
      if (value !== null && !values.includes(value)) values.push(value)
    } catch {
      // profile without a patch layer — nothing to read
    }
  }
  return { ok: true, values }
}

/**
 * Write the preference into every profile patch layer that exists. Later
 * native choices rewrite the same key, so this only ever seeds/updates the
 * value; it cannot lock the user in.
 */
function persistPreferenceAcrossProfiles(value) {
  const profilesDir = join(dshHome(), 'profiles')
  let entries = []
  try {
    entries = readdirSync(profilesDir, { withFileTypes: true })
  } catch {
    return { written: [], errors: ['profiles directory unavailable'] }
  }
  const written = []
  const errors = []
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const patchFile = join(profilesDir, entry.name, 'cordis.patch.yml')
    let source = null
    try {
      source = readFileSync(patchFile, 'utf8')
    } catch {
      continue // profile without a patch layer — nothing to update
    }
    let next = null
    try {
      next = setPatchPreference(source, value)
    } catch (error) {
      errors.push(`${entry.name}: ${error instanceof Error ? error.message : String(error)}`)
      continue
    }
    if (next === null) {
      errors.push(`${entry.name}: unrecognised patch structure`)
      continue
    }
    if (next === source) {
      written.push(entry.name) // already equal — counted, not rewritten
      continue
    }
    try {
      const tmp = `${patchFile}.tmp`
      writeFileSync(tmp, next, { mode: 0o600 })
      renameSync(tmp, patchFile)
      written.push(entry.name)
    } catch (error) {
      errors.push(`${entry.name}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  return { written, errors }
}

function systemFonts() {
  if (fontCache !== null) return fontCache
  const families = new Set()
  const fixedFamilies = new Set()
  for (const directory of fontDirectories()) {
    for (const file of collectFontFiles(directory)) {
      let meta = null
      try {
        meta = readFontMeta(readFileSync(file))
      } catch {
        meta = null
      }
      if (meta === null || meta.family.length === 0) continue
      families.add(meta.family)
      if (meta.fixed) fixedFamilies.add(meta.family)
    }
  }
  const all = [...families].sort((a, b) => a.localeCompare(b))
  const fixed = all.filter((family) => fixedFamilies.has(family))
  fontCache = {
    scannedAt: new Date().toISOString(),
    total: all.length,
    // The dropdown only wants monospace faces; the full list is kept for
    // debugging and because some patched families report an unreliable flag.
    monospace: fixed,
    all,
  }
  return fontCache
}

/** Cordis entry: register the state route and release it on teardown. */
export function apply(ctx) {
  const webServer = ctx.get('webServer')
  if (webServer === undefined) return
  const disposeState = webServer.register({
    kind: 'exact',
    path: STATE_PATH,
    handler: async (req, res) => {
      if (req.method === 'GET') {
        json(res, 200, readDurableState() ?? {})
        return
      }
      if (req.method === 'PUT') {
        try {
          const parsed = JSON.parse(await readBody(req))
          if (typeof parsed !== 'object' || parsed === null) throw new Error('bad body')
          writeDurableState(parsed)
          json(res, 200, { ok: true })
        } catch (error) {
          json(res, 400, {
            ok: false,
            error: error instanceof Error ? error.message : String(error),
          })
        }
        return
      }
      json(res, 405, { ok: false, error: 'method not allowed' })
    },
  })
  const disposeFonts = webServer.register({
    kind: 'exact',
    path: FONTS_PATH,
    handler: (req, res) => {
      if (req.method !== 'GET') {
        json(res, 405, { ok: false, error: 'method not allowed' })
        return
      }
      json(res, 200, systemFonts())
    },
  })
  const disposePreference = webServer.register({
    kind: 'exact',
    path: PREFERENCE_PATH,
    handler: async (req, res) => {
      if (req.method === 'GET') {
        // Read back the ui-theme preference stored in every profile patch
        // layer. The client uses this to tell a genuine native `system` pick
        // (the shell persists it here) apart from a silent runtime reset
        // (the shell never touches this file).
        json(res, 200, readPreferenceAcrossProfiles())
        return
      }
      if (req.method !== 'PUT') {
        json(res, 405, { ok: false, error: 'method not allowed' })
        return
      }
      try {
        const parsed = JSON.parse(await readBody(req))
        const value = parsed !== null && typeof parsed === 'object' && typeof parsed.preference === 'string'
          ? parsed.preference
          : ''
        if (!/^[a-z0-9-]+$/.test(value)) throw new Error('bad preference')
        const { written, errors } = persistPreferenceAcrossProfiles(value)
        json(res, 200, { ok: true, changed: written, errors })
      } catch (error) {
        json(res, 400, { ok: false, error: error instanceof Error ? error.message : String(error) })
      }
    },
  })
  ctx.effect(() => () => {
    disposeState()
    disposeFonts()
    disposePreference()
  }, 'dsh-desktop-acrylic: host routes')
}
