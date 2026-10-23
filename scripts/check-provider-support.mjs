// For every plugin that currently needs a version exemption, ask the registry
// whether a newer release already declares support for the running DSH.
//   node check-provider-support.mjs [runtimeVersion] [profileDir]
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { profileDir, runtimeVersion } from './paths.mjs'

/**
 * The runtime version to test peer ranges against: an explicit one first, then
 * the shipped bundle's own manifest. A hardcoded default would go stale the
 * moment DSH updates.
 */
function resolveRuntime() {
  const given = process.argv[2] || process.env.DSH_RUNTIME_VERSION
  if (given) return given
  const detected = runtimeVersion()
  if (detected !== null) return detected
  console.error('无法确定 DSH 运行时版本：请传入（node check-provider-support.mjs 0.2.1-rc.2）或设置 DSH_RUNTIME_VERSION。')
  process.exit(64)
}


const profile = profileDir(process.argv[3])
const runtime = resolveRuntime()
const manifest = JSON.parse(readFileSync(join(profile, 'package.json'), 'utf8'))
const names = Object.keys(manifest.dependencies).filter((n) => !/^(file:|link:|workspace:)/.test(manifest.dependencies[n]))

// Same compact range test the exemption scanner uses.
const parse = (v) => {
  const m = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/.exec(String(v).trim())
  return m === null ? null : { M: +m[1], m: +m[2], p: +m[3], pre: m[4] ? m[4].split('.') : [] }
}
const cmpPre = (a, b) => {
  if (!a.length && !b.length) return 0
  if (!a.length) return 1
  if (!b.length) return -1
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    const x = a[i]
    const y = b[i]
    if (x === undefined) return -1
    if (y === undefined) return 1
    const nx = /^\d+$/.test(x)
    const ny = /^\d+$/.test(y)
    if (nx && ny) { if (+x !== +y) return +x < +y ? -1 : 1 }
    else if (nx !== ny) return nx ? -1 : 1
    else if (x !== y) return x < y ? -1 : 1
  }
  return 0
}
const cmp = (a, b) => a.M - b.M || a.m - b.m || a.p - b.p || cmpPre(a.pre, b.pre)
const sat = (version, range) => {
  const V = parse(version)
  if (V === null) return false
  return String(range).split('||').some((alt) => {
    const cs = alt.trim().split(/\s+/).filter(Boolean)
    if (cs.length === 0) return false
    if (!cs.every((c) => {
      const m = /^(>=|<=|>|<|=|\^|~)?\s*(.+)$/.exec(c)
      const op = m[1] || '='
      const T = parse(m[2])
      if (T === null) return false
      const k = cmp(V, T)
      if (op === '>=') return k >= 0
      if (op === '<=') return k <= 0
      if (op === '>') return k > 0
      if (op === '<') return k < 0
      if (op === '=') return k === 0
      if (op === '~') return k >= 0 && V.M === T.M && V.m === T.m
      if (op === '^') {
        if (k < 0) return false
        if (T.M > 0) return V.M === T.M
        if (T.m > 0) return V.M === 0 && V.m === T.m
        return V.M === 0 && V.m === 0 && V.p === T.p
      }
      return false
    })) return false
    if (!V.pre.length) return true
    return cs.some((c) => {
      const T = parse((/^([><=^~]*)\s*(.+)$/.exec(c.trim()) || [])[2] || '')
      return T !== null && T.pre.length > 0 && T.M === V.M && T.m === V.m && T.p === V.p
    })
  })
}

async function latest(name) {
  const res = await fetch(`https://registry.npmjs.org/${name.replace('/', '%2F')}`, { headers: { accept: 'application/vnd.npm.install-v1+json' } })
  if (!res.ok) return null
  const body = await res.json()
  const version = body['dist-tags'] && body['dist-tags'].latest
  if (!version) return null
  const meta = await fetch(`https://registry.npmjs.org/${name.replace('/', '%2F')}/${version}`)
  const full = await meta.json()
  return { version, peers: full.peerDependencies || {} }
}

for (const name of names) {
  let installed = null
  try { installed = JSON.parse(readFileSync(join(profile, 'node_modules', name, 'package.json'), 'utf8')) } catch { continue }
  const peers = installed.peerDependencies || {}
  const dshPeers = Object.entries(peers).filter(([k]) => k.startsWith('@deepseek-ai/'))
  const bad = dshPeers.filter(([, range]) => !sat(runtime, range))
  if (bad.length === 0) continue

  const info = await latest(name)
  const verdict = info === null
    ? '(取不到注册表信息)'
    : info.version === installed.version
      ? '已是最新版本，仍在等待提供方适配'
      : (Object.entries(info.peers).some(([k, r]) => k.startsWith('@deepseek-ai/') && sat(runtime, r)) ? `最新 ${info.version} 已声明支持 ${runtime} → 建议更新` : `最新 ${info.version} 仍未声明支持 ${runtime}`)
  console.log(`${name.padEnd(32)} 已装 ${String(installed.version).padEnd(10)} 注册表最新 ${String(info === null ? '?' : info.version).padEnd(10)} ${verdict}`)
}
