// Check the profile's third-party plugins against the registry.
//
//   node check-plugin-updates.mjs <profileDir> [registry]
//
// Prints installed vs latest for every dependency that comes from a registry
// (file:, link: and workspace specs are skipped) and writes update-plan.json.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { profileDir } from './paths.mjs'

const profile = profileDir(process.argv[2])
const preferred = process.argv[3] || 'https://registry.npmjs.org'
const fallbacks = ['https://registry.npmjs.org', 'https://registry.npmmirror.com']

const manifest = JSON.parse(readFileSync(join(profile, 'package.json'), 'utf8'))
const deps = manifest.dependencies || {}
const names = Object.keys(deps).filter((name) => !/^(file:|link:|workspace:)/.test(deps[name]))

function installedVersion(name) {
  const path = join(profile, 'node_modules', name, 'package.json')
  if (!existsSync(path)) return null
  try {
    const meta = JSON.parse(readFileSync(path, 'utf8'))
    return { version: meta.version, peers: meta.peerDependencies || {}, dsh: meta.dsh ? true : false }
  } catch {
    return null
  }
}

async function latestOf(name) {
  const registries = [preferred, ...fallbacks.filter((r) => r !== preferred)]
  let lastError = 'unknown'
  for (const registry of registries) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 20000)
      const response = await fetch(`${registry}/${name.replace('/', '%2F')}`, {
        signal: controller.signal,
        headers: { accept: 'application/vnd.npm.install-v1+json' }
      })
      clearTimeout(timer)
      if (!response.ok) {
        lastError = `HTTP ${response.status}`
        continue
      }
      const body = await response.json()
      const latest = body['dist-tags'] && body['dist-tags'].latest
      if (!latest) {
        lastError = 'no dist-tags.latest'
        continue
      }
      const published = body.time && body.time[latest] ? body.time[latest].slice(0, 10) : ''
      return { latest, published, registry }
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error)
    }
  }
  return { error: lastError }
}

const rows = []
for (const name of names) {
  const local = installedVersion(name)
  const remote = await latestOf(name)
  rows.push({
    name,
    declared: deps[name],
    installed: local ? local.version : null,
    peers: local ? local.peers : {},
    latest: remote.latest || null,
    published: remote.published || '',
    registry: remote.registry || '',
    error: remote.error || '',
    outdated: Boolean(local && remote.latest && local.version !== remote.latest)
  })
  const flag = rows[rows.length - 1].outdated ? 'OUTDATED' : 'ok'
  console.log(
    `${flag.padEnd(9)} ${name.padEnd(30)} installed ${String(rows[rows.length - 1].installed).padEnd(12)} latest ${String(
      rows[rows.length - 1].latest
    ).padEnd(12)} ${rows[rows.length - 1].published}${rows[rows.length - 1].error ? '  err=' + rows[rows.length - 1].error : ''}`
  )
}

writeFileSync(join(process.cwd(), 'update-plan.json'), JSON.stringify(rows, null, 2), 'utf8')
console.log(`\n共 ${rows.length} 个来自注册表的插件，其中 ${rows.filter((r) => r.outdated).length} 个有新版本`)
