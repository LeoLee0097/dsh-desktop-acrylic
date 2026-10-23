// Compare the tokens the app actually references against the ones a skin sets.
//
// Anything the app reads but our skin does not provide keeps the shell's own
// default — for the dark theme that is a neutral grey, which is exactly what the
// screenshots show in the conversation area and the cards.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { REPO_ROOT, appAsar } from './paths.mjs'

const asar = readFileSync(appAsar(process.argv[2])).toString('utf8')
const skin = JSON.parse(readFileSync(join(REPO_ROOT, 'themes', 'tokyo-night.json'), 'utf8'))

const referenced = new Map()
const pattern = /--(dsw|tv)-[a-z0-9-]+/g
let match
while ((match = pattern.exec(asar)) !== null) {
  const name = match[0]
  if (!referenced.has(name)) referenced.set(name, 0)
  referenced.set(name, referenced.get(name) + 1)
}

const ours = new Set(Object.keys(skin.tokens))
console.log(`应用引用的 --dsw-*/--tv-* 变量: ${referenced.size}`)
console.log(`皮肤提供的 token: ${ours.size}`)

const missing = [...referenced.entries()]
  .filter(([name]) => !ours.has(name))
  .sort((a, b) => b[1] - a[1])

console.log(`\n应用引用但皮肤没提供的: ${missing.length}`)
for (const [name, count] of missing.slice(0, 60)) {
  const isSurface = /bg|layer|fill|surface|card|panel|container/.test(name)
  console.log(`  ${isSurface ? '*' : ' '} ${name.padEnd(52)} ${String(count).padStart(5)} 次`)
}

// Also list the bg-family names we DO provide, for contrast.
const provided = [...ours].filter((name) => /bg|layer|fill/.test(name))
console.log(`\n皮肤提供的背景类 token: ${provided.length}`)
