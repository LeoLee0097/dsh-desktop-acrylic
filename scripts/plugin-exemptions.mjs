// Which installed plugins would the running DSH deny, and what exemptions are
// needed? The peer comparison uses the runtime's own package versions, read from
// the shipped manifest inside the application bundle (not the DSH version for
// every peer — cordis and schemastery carry their own versions).
//
//   node plugin-exemptions.mjs [--write] [profileDir]
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { appAsar, profileDir } from './paths.mjs'

const profile = profileDir()
const asar = appAsar()
const write = process.argv.includes('--write')

// ---- runtime package versions ------------------------------------------------
const asarText = readFileSync(asar).toString('utf8')
const sharedIndex = asarText.indexOf('"sharedPackages"')
const sharedSeg = asarText.slice(sharedIndex, sharedIndex + 60000)
const runtimeVersions = new Map()
{
  const re = /"name":\s*"(@deepseek-ai\/[^"]+|cordis|schemastery)",\s*"version":\s*"([^"]+)"/g
  let m
  while ((m = re.exec(sharedSeg)) !== null) runtimeVersions.set(m[1], m[2])
}
// cordis / schemastery live in the profile too; keep whatever the manifest says
for (const name of ['@deepseek-ai/cordis', '@deepseek-ai/schemastery']) {
  const p = join(profile, 'node_modules', name, 'package.json')
  if (existsSync(p)) runtimeVersions.set(name, JSON.parse(readFileSync(p, 'utf8')).version)
}
const dshVersion = runtimeVersions.get('@deepseek-ai/dsh') || '0.2.0-rc.1'

// ---- compact semver ---------------------------------------------------------
const parse = (value) => {
  const m = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/.exec(String(value).trim())
  if (m === null) return null
  return { major: +m[1], minor: +m[2], patch: +m[3], pre: m[4] ? m[4].split('.') : [], raw: String(value).trim() }
}
const comparePre = (a, b) => {
  if (a.length === 0 && b.length === 0) return 0
  if (a.length === 0) return 1
  if (b.length === 0) return -1
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    const x = a[i]
    const y = b[i]
    if (x === undefined) return -1
    if (y === undefined) return 1
    const nx = /^\d+$/.test(x)
    const ny = /^\d+$/.test(y)
    if (nx && ny) {
      if (+x !== +y) return +x < +y ? -1 : 1
    } else if (nx !== ny) {
      return nx ? -1 : 1
    } else if (x !== y) {
      return x < y ? -1 : 1
    }
  }
  return 0
}
const compare = (a, b) => a.major - b.major || a.minor - b.minor || a.patch - b.patch || comparePre(a.pre, b.pre)
const satisfiesComparator = (version, comparator) => {
  const m = /^(>=|<=|>|<|=|\^|~)?\s*(.+)$/.exec(comparator.trim())
  if (m === null) return false
  const op = m[1] || '='
  const target = parse(m[2])
  if (target === null) return false
  const cmp = compare(version, target)
  switch (op) {
    case '>=':
      return cmp >= 0
    case '<=':
      return cmp <= 0
    case '>':
      return cmp > 0
    case '<':
      return cmp < 0
    case '=':
      return cmp === 0
    case '~':
      return cmp >= 0 && version.major === target.major && version.minor === target.minor
    case '^': {
      if (cmp < 0) return false
      if (target.major > 0) return version.major === target.major
      if (target.minor > 0) return version.major === 0 && version.minor === target.minor
      return version.major === 0 && version.minor === 0 && version.patch === target.patch
    }
    default:
      return false
  }
}
const satisfies = (versionString, range) => {
  const version = parse(versionString)
  if (version === null) return false
  return String(range)
    .split('||')
    .some((alternative) => {
      const comparators = alternative.trim().split(/\s+/).filter(Boolean)
      if (comparators.length === 0) return false
      if (!comparators.every((c) => satisfiesComparator(version, c))) return false
      if (version.pre.length === 0) return true
      return comparators.some((c) => {
        const t = parse((/^([><=^~]*)\s*(.+)$/.exec(c.trim()) || [])[2] || '')
        return t !== null && t.pre.length > 0 && t.major === version.major && t.minor === version.minor && t.patch === version.patch
      })
    })
}

// ---- check every dependency -------------------------------------------------
const manifest = JSON.parse(readFileSync(join(profile, 'package.json'), 'utf8'))
const bundles = new Set(manifest.dsh.profile.bundles)
const names = Object.keys(manifest.dependencies).filter((n) => !/^(file:|link:|workspace:)/.test(manifest.dependencies[n]))

const rows = []
for (const name of names) {
  const pkgPath = join(profile, 'node_modules', name, 'package.json')
  if (!existsSync(pkgPath)) {
    rows.push({ name, version: null, enabled: bundles.has(name), mismatches: ['(未安装)'] })
    continue
  }
  const meta = JSON.parse(readFileSync(pkgPath, 'utf8'))
  const peers = meta.peerDependencies || {}
  const mismatches = []
  const unknown = []
  for (const [key, range] of Object.entries(peers)) {
    const provided = runtimeVersions.get(key)
    if (provided === undefined) {
      // The shared-package manifest is a curated subset: several packages the
      // runtime bundles internally (dsh-client-store, dsh-client-ui-primitives)
      // are absent from it even though the shipped client code requires them.
      // Absence therefore means "no version to compare against", not "missing" —
      // flagging it would invent incompatibilities that the runtime does not.
      if (key.startsWith('@deepseek-ai/')) unknown.push(`${key.replace('@deepseek-ai/', '')}@${range}`)
      continue
    }
    if (!satisfies(provided, range)) mismatches.push(`${key.replace('@deepseek-ai/', '')}@${range} → 运行时 ${provided}`)
  }
  rows.push({ name, version: meta.version, enabled: bundles.has(name), mismatches, unknown })
}

console.log(`DSH 运行时 ${dshVersion} · cordis ${runtimeVersions.get('@deepseek-ai/cordis')} · schemastery ${runtimeVersions.get('@deepseek-ai/schemastery')}`)
console.log(`依赖 ${names.length} 个 · 启用名单 ${bundles.size} 条\n`)
for (const row of rows) {
  const status = row.version === null ? '缺失' : row.mismatches.length === 0 ? '兼容' : '需豁免'
  console.log(`${status.padEnd(5)} ${(row.enabled ? '启用' : '未启用').padEnd(4)} ${row.name.padEnd(30)} ${String(row.version).padEnd(11)} ${row.mismatches.length === 0 ? '' : row.mismatches.length + ' 项'}`)
  for (const line of row.mismatches) console.log(`        ${line}`)
  if (row.unknown !== undefined && row.unknown.length > 0) {
    console.log(`        （未在共享清单中、仅随运行时打包：${row.unknown.join(', ')}）`)
  }
}

const exemptions = {}
for (const row of rows) {
  if (row.version !== null && row.mismatches.length > 0) exemptions[`${row.name}@${row.version}`] = [dshVersion]
}
console.log('\n豁免记录（package@version → 运行时版本）:')
console.log(JSON.stringify(exemptions, null, 2))

if (write) {
  const target = join(profile, 'compatibility.json')
  // `compatibility.json` decides which plugins the runtime accepts, so an
  // overwrite is not a harmless edit: keep the previous copy, and report the
  // difference instead of silently replacing the file.
  if (existsSync(target)) {
    const previous = readFileSync(target, 'utf8')
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backup = `${target}.bak-${stamp}`
    writeFileSync(backup, previous, { encoding: 'utf8', mode: 0o600 })
    let before = {}
    try {
      before = JSON.parse(previous)
    } catch {
      console.log('警告：现有 compatibility.json 不是合法 JSON，按空对象比较')
    }
    const added = Object.keys(exemptions).filter((key) => !(key in before))
    const dropped = Object.keys(before).filter((key) => !(key in exemptions))
    console.log(`\n上一份已备份：${backup}`)
    console.log(`  新增 ${added.length} 条${added.length > 0 ? '：' + added.join('、') : ''}`)
    console.log(`  移除 ${dropped.length} 条${dropped.length > 0 ? '：' + dropped.join('、') : ''}`)
  }
  writeFileSync(target, JSON.stringify(exemptions, undefined, 2) + '\n', { encoding: 'utf8', mode: 0o600 })
  const readBack = JSON.parse(readFileSync(target, 'utf8'))
  console.log('\n已写入 compatibility.json；回读一致:', JSON.stringify(readBack) === JSON.stringify(exemptions))
  console.log('文件大小:', readFileSync(target).length, 'bytes')
}
