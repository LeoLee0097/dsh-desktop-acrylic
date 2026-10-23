// Encoding tripwire: U+FFFD in a source file means a write went through GBK.
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { REPO_ROOT } from './paths.mjs'

// Discovered rather than listed: a new script or theme is covered the moment
// it exists, which is the whole point of a tripwire.
const roots = ['src', 'scripts', 'themes', 'lib']
const files = []
for (const root of roots) {
  for (const name of readdirSync(join(REPO_ROOT, root))) {
    if (/\.(mjs|js|json)$/.test(name)) files.push(join(root, name))
  }
}
for (const name of ['README.md', 'README.en.md', 'package.json']) files.push(name)
let bad = 0
for (const file of files) {
  const text = readFileSync(join(REPO_ROOT, file), 'utf8')
  const hits = (text.match(/\uFFFD/g) || []).length
  const bom = text.charCodeAt(0) === 0xfeff
  console.log(`${hits === 0 && !bom ? 'ok  ' : 'BAD '} ${file}  uFFFD=${hits}  bom=${bom}`)
  if (hits > 0 || bom) bad++
}
const tpl = readFileSync(join(REPO_ROOT, 'src', 'client.tpl.js'), 'utf8')
console.log(`ellipsis present in client.tpl.js: ${tpl.includes('\u2026')}`)
process.exit(bad === 0 ? 0 : 1)
