// 由 overview + 各朝代详情 + 发明，生成前端搜索索引 data/search.json
import fs from 'fs';

const overview = JSON.parse(fs.readFileSync('data/overview.json', 'utf8'));
const inv = JSON.parse(fs.readFileSync('data/inventions.json', 'utf8'));
const idx = [];

for (const o of overview) {
  idx.push({ d: o.id, dn: o.name, t: '朝代', n: o.name, x: `${o.years} ${o.era} ${o.capital} ${o.feature}` });
  const det = JSON.parse(fs.readFileSync(`data/dynasties/${o.id}.json`, 'utf8'));
  for (const e of det.emperors) idx.push({ d: o.id, dn: o.name, t: '帝王', n: e.n, x: `在位${e.rg}（${e.ry}年） ${e.note || ''}` });
  for (const role in det.talents) for (const p of det.talents[role]) idx.push({ d: o.id, dn: o.name, t: role, n: p.n, x: p.note || '' });
  for (const p of det.policies) idx.push({ d: o.id, dn: o.name, t: '制度', n: p, x: '' });
}

for (const v of inv) idx.push({ d: v.dynastyId, dn: v.dynastyLabel, t: '发明', n: v.name, x: `${v.era} ${v.person} ${v.desc}` });

fs.writeFileSync('data/search.json', JSON.stringify(idx) + '\n');
console.log(`搜索索引条目: ${idx.length}`);
