// Extract every --dsw-static-* token the shell defines, with its default value.
//
// Those are primitives: components that reference them directly (the change
// cards, tiles, deliverable panels in the conversation) never see a skin's alias
// tokens, which is why they stayed neutral grey.
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { appAsar } from './paths.mjs'

const text = readFileSync(appAsar(process.argv[2])).toString('utf8')

const pattern = /--dsw-static-([a-z0-9-]+?)-(\d+|[0-9]{2}|a\d{2})\s*:\s*([^;}]+)[;}]/g
const values = new Map()
let match
while ((match = pattern.exec(text)) !== null) {
  const name = `--dsw-static-${match[1]}-${match[2]}`
  const value = match[3].trim()
  if (!values.has(name)) values.set(name, value)
}

const groups = new Map()
for (const [name, value] of values) {
  const group = /^--dsw-static-([a-z]+)-/.exec(name)[1]
  if (!groups.has(group)) groups.set(group, [])
  groups.get(group).push([name, value])
}

console.log(`共 ${values.size} 个 --dsw-static-* token，分 ${groups.size} 个族\n`)
for (const [group, entries] of [...groups].sort()) {
  console.log(`${group}: ${entries.length}`)
  for (const [name, value] of entries.slice(0, 30)) console.log(`   ${name.padEnd(40)} ${value}`)
  console.log('')
}

// Also count how often each family is *referenced* by component CSS.
console.log('引用次数:')
for (const [group] of [...groups].sort()) {
  let count = 0
  let index = -1
  while ((index = text.indexOf(`var(--dsw-static-${group}-`, index + 1)) >= 0) count += 1
  console.log(`  ${group.padEnd(20)} ${count}`)
}

const out = process.env.DSH_TOKENS_OUT || join(process.cwd(), 'static-tokens.json')
writeFileSync(out, JSON.stringify(Object.fromEntries(values), null, 2), 'utf8')
console.log(`\n已写出 ${out}`)
