/**
 * dsh-desktop-acrylic — host half.
 *
 * Holds the durable enable/disable flag so the choice survives DSH Desktop's
 * per-launch loopback port (where the browser origin — and therefore
 * localStorage — is not stable). The same pattern the catppuccin theme plugin
 * uses: one exact webServer route, written atomically to $DSH_HOME.
 *
 *   /dark-acrylic/state (GET) -> the stored state, or {} when never written
 *   /dark-acrylic/state (PUT) -> writes the JSON body as-is
 *
 * The desktop window is a `dsh-app://app` origin and does keep localStorage, so
 * the browser flag remains the instant layer; this file is the durable one.
 * Without a live webServer (headless profiles) the half stays inert.
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
  ctx.effect(() => () => {
    disposeState()
    disposeFonts()
  }, 'dsh-desktop-acrylic: host routes')
}
