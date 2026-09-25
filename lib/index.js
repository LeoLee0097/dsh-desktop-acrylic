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
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'

export const name = 'dsh-desktop-acrylic'

/** `webServer` is a hard inject dependency: no server, no route, no state. */
export const inject = ['webServer']

const STATE_PATH = '/dark-acrylic/state'
const STATE_FILENAME = 'dark-acrylic-state.json'

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

/** Cordis entry: register the state route and release it on teardown. */
export function apply(ctx) {
  const webServer = ctx.get('webServer')
  if (webServer === undefined) return
  const dispose = webServer.register({
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
  ctx.effect(() => () => {
    dispose()
  }, 'dsh-desktop-acrylic: state route')
}
