/**
 * Path resolution for the maintenance scripts in this directory.
 *
 * Every tool here used to carry the absolute paths of the machine it was written
 * on, which makes a checkout on another machine useless. They resolve through
 * this module instead:
 *
 *   REPO_ROOT            this repository (parent of `scripts/`)
 *   profileDir([dir])    the DSH profile; `DSH_PROFILE_DIR`, or `~/.dsh/profiles/<DSH_PROFILE>`
 *   appAsar([path])      the shipped `app.asar`; `DSH_APP_ASAR`, or a known install root
 *   runtimeVersion()     the DSH version the bundle declares, or null
 *
 * Nothing here downloads, patches or writes: these are the read-only entry points
 * the tools share. A missing install is reported with what to pass, never guessed.
 */
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, isAbsolute, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** This repository: `<repo>/scripts/paths.mjs` → `<repo>`. */
export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** DSH's own directory: `DSH_HOME`, else `~/.dsh`. */
function dshHome() {
  return process.env.DSH_HOME ? resolve(process.env.DSH_HOME) : join(homedir(), '.dsh')
}

/**
 * The desktop profile holding `package.json`, `node_modules` and
 * `compatibility.json`.
 *
 * DSH sets both names, and they are not interchangeable: `DSH_PROFILE_DIR` is a
 * directory, while `DSH_PROFILE` is a profile *name* (`desktop`). Resolving the
 * name as if it were a path silently points at `<cwd>/desktop`, so the two are
 * handled separately.
 *
 * @param {string} [explicit] - a path passed on the command line, which wins.
 */
export function profileDir(explicit) {
  const given = explicit || process.env.DSH_PROFILE_DIR
  if (given) return resolve(given)
  const named = process.env.DSH_PROFILE
  if (named) return resolve(isAbsolute(named) ? named : join(dshHome(), 'profiles', named))
  return join(dshHome(), 'profiles', 'desktop')
}

/**
 * Candidate install roots, most likely first. Only `resources/app.asar` varies
 * by platform; the directory names are the ones the desktop app ships with.
 */
function asarCandidates() {
  const candidates = []
  if (process.platform === 'win32') {
    const local = process.env.LOCALAPPDATA
    const programFiles = process.env.ProgramFiles
    if (process.env.USERPROFILE) candidates.push(join(process.env.USERPROFILE, 'DSHDesktop', 'resources', 'app.asar'))
    if (local) {
      candidates.push(join(local, 'Programs', 'DSH Desktop', 'resources', 'app.asar'))
      candidates.push(join(local, 'Programs', 'dsh-desktop', 'resources', 'app.asar'))
    }
    if (programFiles) candidates.push(join(programFiles, 'DSH Desktop', 'resources', 'app.asar'))
  } else if (process.platform === 'darwin') {
    candidates.push('/Applications/DSH Desktop.app/Contents/Resources/app.asar')
    candidates.push(join(homedir(), 'Applications', 'DSH Desktop.app', 'Contents', 'Resources', 'app.asar'))
  } else {
    candidates.push('/opt/DSH Desktop/resources/app.asar')
    candidates.push('/usr/lib/dsh-desktop/resources/app.asar')
  }
  return candidates
}

/**
 * The shipped application bundle, which is where the shell's own CSS, token
 * defaults and bundled package versions live.
 *
 * @param {string} [explicit] - a path passed on the command line, which wins
 *   over `DSH_APP_ASAR` and over the install roots.
 * @returns {string} an existing path.
 */
export function appAsar(explicit) {
  const given = explicit || process.env.DSH_APP_ASAR
  if (given) {
    const resolved = resolve(given)
    if (!existsSync(resolved)) {
      throw new Error(`app.asar not found at ${resolved} (from ${explicit ? 'the command line' : 'DSH_APP_ASAR'})`)
    }
    return resolved
  }
  for (const candidate of asarCandidates()) {
    if (existsSync(candidate)) return candidate
  }
  throw new Error(
    [
      'cannot find the DSH application bundle.',
      'Pass its path, e.g. `node scripts/<tool>.mjs "C:/path/to/resources/app.asar"`,',
      'or set DSH_APP_ASAR. Tried:',
      ...asarCandidates().map((candidate) => `  ${candidate}`)
    ].join('\n')
  )
}

/**
 * The DSH runtime version the bundle declares in its `sharedPackages` manifest.
 *
 * That manifest is a curated subset, so an absent package is "no version to
 * compare against" rather than "missing" — callers must not read absence as
 * incompatibility.
 *
 * @returns {string | null} the version, or null when the bundle is unavailable
 *   or does not declare it.
 */
export function runtimeVersion() {
  try {
    const text = readFileSync(appAsar()).toString('utf8')
    const start = text.indexOf('"sharedPackages"')
    if (start < 0) return null
    const match = /"name":\s*"@deepseek-ai\/dsh",\s*"version":\s*"([^"]+)"/.exec(text.slice(start, start + 400000))
    return match === null ? null : match[1]
  } catch {
    return null
  }
}
