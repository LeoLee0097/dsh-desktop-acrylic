// Print the system font catalog the plugin exposes to the browser half.
//
//   node scripts/check-fonts.mjs            # counts + the monospace list
//   node scripts/check-fonts.mjs --all      # also print every family found
//
// Useful when the dropdown looks wrong: if a family is missing here, the
// renderer cannot offer it either.
import { systemFontCatalog } from '../lib/index.js'

const catalog = systemFontCatalog()
console.log(`scanned ${catalog.total} families at ${catalog.scannedAt}`)
console.log(`monospace (${catalog.monospace.length}):`)
for (const family of catalog.monospace) console.log(`  ${family}`)

if (process.argv.includes('--all')) {
  console.log(`\nall families (${catalog.all.length}):`)
  for (const family of catalog.all) console.log(`  ${family}`)
}
