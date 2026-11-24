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
 *   /dark-acrylic/preference GET  -> our recorded skin read back from every
 *                                    profile patch layer
 *   /dark-acrylic/preference PUT  -> splice the `skin:` key into our own
 *                                    entry of every profile's cordis.patch.yml
 *
 * Every route asks the composition's `connection` service for a rejection
 * before it does anything (see `refuseUntrusted`): routes registered through
 * `webServer` are not fenced by the platform automatically, and without that
 * check a page on a domain that resolves to 127.0.0.1 would be same-origin with
 * this server. Bodies are capped at 64 KB and accepted only as JSON.
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
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    // Theme state and the font catalog are live facts about this machine; a
    // cached answer would be wrong as soon as the user switches skins.
    'cache-control': 'no-store',
  })
  res.end(JSON.stringify(payload))
}

/** Route bodies are tiny JSON objects; anything larger is hostile. */
const MAX_BODY_BYTES = 64 * 1024

/** Reject a body that declares, or streams past, more than these routes carry. */
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    let settled = false
    const fail = (status, message) => {
      if (settled) return
      settled = true
      const error = new Error(message)
      error.status = status
      reject(error)
    }
    const declared = Number(req.headers['content-length'])
    if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
      fail(413, `body exceeds ${MAX_BODY_BYTES} bytes`)
      req.destroy()
      return
    }
    req.on('data', (chunk) => {
      if (settled) return
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        fail(413, `body exceeds ${MAX_BODY_BYTES} bytes`)
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      if (settled) return
      settled = true
      resolve(Buffer.concat(chunks).toString('utf8'))
    })
    req.on('error', (error) => fail(400, error instanceof Error ? error.message : String(error)))
  })
}

/** Only JSON bodies: a cross-site form can send text/plain or form-encoded, not this. */
function isJsonBody(req) {
  const type = req.headers['content-type']
  return typeof type === 'string' && type.toLowerCase().startsWith('application/json')
}

/** Status carried by a refused body read, or 400 for anything else. */
function statusOf(error) {
  return error !== null && typeof error === 'object' && typeof error.status === 'number' ? error.status : 400
}

/**
 * Answer an untrusted request and report whether it was refused.
 *
 * Routes registered through `webServer` do **not** inherit the platform's
 * request fence — each route has to ask the composition's `connection` service
 * for a rejection, the way the shipped routes do. That fence checks Host
 * against the listener's loopback/trusted authorities, refuses
 * `sec-fetch-site: cross-site`, and compares Origin with Host. It is what stops
 * a page on an attacker-controlled domain that resolves to 127.0.0.1 from being
 * treated as same-origin (DNS rebinding).
 *
 * A headless profile mounts no connection service; with no browser attached
 * there is nothing to defend against, so the route proceeds.
 */
function refuseUntrusted(ctx, req, res) {
  // cordis 4.1 resolves services through a proxy that throws
  // `cannot get property "connection" without inject` for any service the
  // plugin did not declare — and this plugin only requires `webServer`. The
  // non-strict getter reads the store without that requirement, which is what
  // the proxy itself falls back to. An absent service means a headless
  // composition with no browser attached, so there is nothing to fence.
  let connection
  try {
    connection = ctx.get('connection', false)
  } catch {
    connection = undefined
  }
  if (connection === undefined || connection === null || typeof connection.requestRejection !== 'function') {
    return false
  }
  // The platform's authority comparison only understands http(s) origins. The
  // desktop window runs on `dsh-app://app` and reaches these routes through the
  // app's protocol handler, so an `Origin` of that shape is neither cross-site
  // nor something the fence can evaluate — asking it would refuse the plugin's
  // own calls. Web pages always present an http(s) origin (or `null`, where the
  // platform's `sec-fetch-site` check decides first), so the fence still covers
  // every browser-reachable case, DNS rebinding included.
  const origin = req.headers.origin
  if (typeof origin === 'string' && !/^https?:/i.test(origin)) return false
  let rejection
  try {
    rejection = connection.requestRejection(req)
  } catch {
    rejection = 403
  }
  if (rejection === undefined || rejection === null) return false
  // A future platform version may hand back a richer value; a status code is
  // the only thing that can be written here either way.
  const status = typeof rejection === 'number' && Number.isFinite(rejection) ? rejection : 403
  res.statusCode = status
  res.end()
  return true
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

/* -------------------------- acrylic skin layer --------------------------- */

/**
 * Where this plugin records its own skin: its entry in the profile's patch
 * layer (`cordis.patch.yml`). 0.2.2 closed the shell's preference to
 * `light | dark | system` and keeps it in the user settings document, so a
 * third-party id written to `ui-theme` is rejected on the next boot; the skin
 * is recorded under our own loader entry instead, where no schema validates it
 * and the composed tree still replays it.
 */

/**
 * Splice `skin: <value>` into our own loader entry of a patch layer,
 * preserving everything else byte for byte. Appends the entry when it is
 * missing (an empty `[]` layer becomes a one-entry list).
 * Returns the new text, or null when the structure is unrecognised.
 */
/**
 * Drop a `ui-theme` preference this plugin's older builds wrote.
 *
 * 0.2.2 validates that key against `light | dark | system`, so a skin id left
 * there fails validation on every boot. Only values outside the enum are
 * removed — a real native choice stays untouched.
 */
export function stripStalePreference(source) {
  const lines = source.split('\n')
  const native = new Set(['light', 'dark', 'system'])
  let start = -1
  let indent = ''
  for (let i = 0; i < lines.length; i += 1) {
    const match = /^(\s*)- id: ui-theme\s*$/.exec(lines[i])
    if (match !== null) {
      start = i
      indent = match[1]
      break
    }
  }
  if (start < 0) return source
  const nextRe = new RegExp(`^${indent}- id:`)
  for (let i = start + 1; i < lines.length; i += 1) {
    if (nextRe.test(lines[i])) break
    const match = /^(\s*)preference:\s*([^\s#]+)/.exec(lines[i])
    if (match === null) continue
    if (native.has(match[2])) return source
    lines.splice(i, 1)
    return lines.join('\n')
  }
  return source
}

export function setPatchPreference(source, value) {
  const stripped = stripStalePreference(source)
  const lines = stripped.split('\n')
  const entryRe = /^(\s*)- id: dark-acrylic\s*$/
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
    `${indent}- id: dark-acrylic`,
    `${indent}  name: "dsh-desktop-acrylic"`,
    `${indent}  config:`,
    `${indent}    skin: ${value}`
  ]
  if (start < 0) {
    // No entry yet: append one to the top-level list. An empty layer
    // (`[]` or whitespace) simply becomes the entry list; anything that is
    // not a list at all is left alone.
    const trimmed = stripped.trim()
    if (trimmed === '' || trimmed === '[]') return `${block.join('\n')}\n`
    if (!/^\s*- id:/m.test(stripped)) return null
    const out = stripped.replace(/\s+$/, '').split('\n')
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
  const prefRe = /^(\s*)skin:.*$/
  for (let i = start + 1; i < end; i += 1) {
    const match = prefRe.exec(lines[i])
    if (match !== null) {
      lines[i] = `${match[1]}skin: ${value}`
      return lines.join('\n')
    }
  }
  // No skin key yet: insert right after the block's `config:` line.
  for (let i = start + 1; i < end; i += 1) {
    if (/^\s*config:\s*$/.test(lines[i])) {
      lines.splice(i + 1, 0, `${indent}    skin: ${value}`)
      return lines.join('\n')
    }
  }
  return null
}

/** Extract our recorded `skin:` value from a patch layer, or null. */
export function readLayerPreference(source) {
  const lines = source.split('\n')
  const entryRe = /^(\s*)- id: dark-acrylic\s*$/
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
    const match = /^\s*skin:\s*([^\s#]+)/.exec(lines[i])
    if (match !== null) return match[1]
  }
  return null
}

/** Recorded skin values found across all profile patch layers. */
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
      if (refuseUntrusted(ctx, req, res)) return
      if (req.method === 'GET') {
        json(res, 200, readDurableState() ?? {})
        return
      }
      if (req.method === 'PUT') {
        if (!isJsonBody(req)) {
          json(res, 415, { ok: false, error: 'content-type must be application/json' })
          return
        }
        try {
          const parsed = JSON.parse(await readBody(req))
          if (typeof parsed !== 'object' || parsed === null) throw new Error('bad body')
          writeDurableState(parsed)
          json(res, 200, { ok: true })
        } catch (error) {
          json(res, statusOf(error), {
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
      if (refuseUntrusted(ctx, req, res)) return
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
      if (refuseUntrusted(ctx, req, res)) return
      if (req.method === 'GET') {
        // Read back the skin stored in every profile patch
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
      if (!isJsonBody(req)) {
        json(res, 415, { ok: false, error: 'content-type must be application/json' })
        return
      }
      try {
        const parsed = JSON.parse(await readBody(req))
        const value = parsed !== null && typeof parsed === 'object' && typeof parsed.preference === 'string'
          ? parsed.preference
          : ''
        // The value is spliced into YAML, so the alphabet is the defence: no
        // space, colon, quote or newline can reach the patch layer.
        if (!/^[a-z0-9-]+$/.test(value)) throw new Error('bad preference')
        const { written, errors } = persistPreferenceAcrossProfiles(value)
        json(res, 200, { ok: true, changed: written, errors })
      } catch (error) {
        json(res, statusOf(error), { ok: false, error: error instanceof Error ? error.message : String(error) })
      }
    },
  })
  ctx.effect(() => () => {
    disposeState()
    disposeFonts()
    disposePreference()
  }, 'dsh-desktop-acrylic: host routes')
}
