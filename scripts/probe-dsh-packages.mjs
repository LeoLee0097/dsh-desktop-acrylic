// Confirm the shipped versions of the packages this plugin peers on, in the
// current DSH build. Reads the whole manifest region, not a truncated slice.
import { readFileSync } from 'node:fs'
import { appAsar } from './paths.mjs'

const t = readFileSync(appAsar(process.argv[2])).toString('utf8')
const start = t.indexOf('"sharedPackages"')
const seg = t.slice(start, start + 400000)

const map = new Map()
const re = /"name":\s*"([^"]+)",\s*"version":\s*"([^"]+)"/g
let m
while ((m = re.exec(seg)) !== null) {
  if (!map.has(m[1])) map.set(m[1], m[2])
}

console.log('清单条目数（去重）:', map.size)
const wanted = [
  '@deepseek-ai/cordis',
  '@deepseek-ai/schemastery',
  '@deepseek-ai/dsh',
  '@deepseek-ai/dsh-client-store',
  '@deepseek-ai/dsh-client-locale',
  '@deepseek-ai/dsh-client-ui-theme',
  '@deepseek-ai/dsh-client-ui-settings-general',
  '@deepseek-ai/dsh-client-ui-primitives'
]
for (const key of wanted) console.log('  ' + key.padEnd(46), map.get(key) || '(不在清单中)')
