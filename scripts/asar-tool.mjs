// Minimal Electron-ASAR reader: list / grep / extract, no dependencies.
// Usage:
//   node asar-tool.mjs list  <asar> <substr>
//   node asar-tool.mjs grep  <asar> <regexSource> [maxHits] [maxFiles]
//   node asar-tool.mjs extract <asar> <innerPath> <outFile>
import fs from 'node:fs';

function readHeader(file) {
  const fd = fs.openSync(file, 'r');
  const head = Buffer.alloc(16);
  fs.readSync(fd, head, 0, 16, 0);
  const headerSize = head.readUInt32LE(4); // pickle payload size
  const jsonLen = head.readUInt32LE(12);
  const jsonBuf = Buffer.alloc(jsonLen);
  fs.readSync(fd, jsonBuf, 0, jsonLen, 16);
  fs.closeSync(fd);
  const dataStart = 8 + headerSize;
  return { tree: JSON.parse(jsonBuf.toString('utf8')), dataStart };
}

function walk(node, prefix, out) {
  for (const [name, entry] of Object.entries(node.files || {})) {
    const p = prefix ? `${prefix}/${name}` : name;
    if (entry.files) walk(entry, p, out);
    else if (entry.unpacked) out.push({ path: p, unpacked: true, size: entry.size });
    else out.push({ path: p, offset: Number(entry.offset), size: entry.size });
  }
  return out;
}

const [cmd, asar, a1, a2, a3] = process.argv.slice(2);
const USAGE = [
  'usage:',
  '  node asar-tool.mjs list    <asar> [substring]',
  '  node asar-tool.mjs grep    <asar> <regexSource> [maxHits] [maxFiles]',
  '  node asar-tool.mjs extract <asar> <innerPath> <outFile>',
  '',
  'example: node asar-tool.mjs grep app.asar "role: \\"dialog\\""',
].join('\n');
if (!['list', 'grep', 'extract'].includes(cmd) || !asar) {
  console.error(USAGE);
  process.exit(64);
}
if (!fs.existsSync(asar)) {
  console.error(`no such asar: ${asar}`);
  process.exit(66);
}
const { tree, dataStart } = readHeader(asar);
const entries = walk(tree, '', []);

if (cmd === 'list') {
  const needle = (a1 || '').toLowerCase();
  for (const e of entries) if (e.path.toLowerCase().includes(needle)) console.log(`${e.size}\t${e.path}`);
} else if (cmd === 'grep') {
  const re = new RegExp(a1, 'g');
  const maxHits = Number(a2 || 20);
  const maxFiles = Number(a3 || 40);
  const fd = fs.openSync(asar, 'r');
  let hits = 0;
  let files = 0;
  for (const e of entries) {
    if (hits >= maxHits || files >= maxFiles) break;
    if (e.unpacked || !e.size || e.size > 40 * 1024 * 1024) continue;
    if (!/\.(js|mjs|cjs|css|html|json|ts)$/i.test(e.path)) continue;
    const buf = Buffer.alloc(e.size);
    fs.readSync(fd, buf, 0, e.size, dataStart + e.offset);
    const text = buf.toString('utf8');
    let m;
    let local = 0;
    re.lastIndex = 0;
    while ((m = re.exec(text)) !== null) {
      const s = Math.max(0, m.index - 160);
      const snippet = text.slice(s, m.index + 220).replace(/\s+/g, ' ');
      console.log(`\n### ${e.path} @${m.index}\n${snippet}`);
      hits++;
      local++;
      if (hits >= maxHits) break;
      if (m[0].length === 0) re.lastIndex++;
    }
    if (local > 0) files++;
  }
  fs.closeSync(fd);
  console.log(`\n[${hits} hit(s) in ${files} file(s)]`);
} else if (cmd === 'extract') {
  const target = entries.find((e) => e.path === a1);
  if (!target) {
    console.error(`not found: ${a1}`);
    process.exit(1);
  }
  if (target.unpacked) {
    console.error('entry is unpacked; read it from app.asar.unpacked');
    process.exit(2);
  }
  const fd = fs.openSync(asar, 'r');
  const buf = Buffer.alloc(target.size);
  fs.readSync(fd, buf, 0, target.size, dataStart + target.offset);
  fs.closeSync(fd);
  fs.writeFileSync(a2, buf);
  console.log(`wrote ${a2} (${target.size} bytes)`);
} else {
  console.error('usage: list|grep|extract ...');
  process.exit(64);
}
