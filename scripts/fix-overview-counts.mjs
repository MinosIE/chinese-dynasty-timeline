// 从各朝代详情文件重建 counts（emperors/talents/policies）并写回 overview.json。
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const ov = JSON.parse(fs.readFileSync(path.join(root, 'data', 'overview.json'), 'utf8'));
for (const o of ov) {
  const f = path.join(root, 'data', 'dynasties', o.id + '.json');
  if (!fs.existsSync(f)) { console.warn('missing detail:', o.id); continue; }
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  const talents = Object.values(d.talents || {}).reduce((s, a) => s + a.length, 0);
  o.counts = { emperors: (d.emperors || []).length, talents, policies: (d.policies || []).length };
}
fs.writeFileSync(path.join(root, 'data', 'overview.json'), JSON.stringify(ov, null, 2) + '\n', 'utf8');
console.log('counts restored for', ov.length, 'dynasties');
