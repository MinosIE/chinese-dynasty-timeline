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

const battles = JSON.parse(fs.readFileSync('data/battles.json', 'utf8'));
const nameById = Object.fromEntries(overview.map(o => [o.id, o.name]));
const nameEnById = Object.fromEntries(overview.map(o => [o.id, o.nameEn || o.name]));
for (const b of battles) idx.push({ d: b.d, dn: nameById[b.d] || b.d, dnEn: nameEnById[b.d] || b.d, t: '战役', n: b.n, x: `${b.gen} ${b.x}`, nEn: b.nEn, xEn: `${b.genEn} ${b.xEn}` });

const reforms = JSON.parse(fs.readFileSync('data/reforms.json', 'utf8'));
for (const r of reforms) idx.push({ d: r.d, dn: nameById[r.d] || r.d, dnEn: nameEnById[r.d] || r.d, t: '改革', n: r.n, x: `${r.who} ${r.measures} ${r.result}`, nEn: r.nEn, xEn: `${r.whoEn} ${r.measuresEn} ${r.resultEn}` });

const idioms = JSON.parse(fs.readFileSync('data/idioms.json', 'utf8'));
for (const x of idioms) idx.push({ d: x.d, dn: nameById[x.d] || x.d, dnEn: nameEnById[x.d] || x.d, t: '成语', n: x.n, x: `${x.src} ${x.mean}`, nEn: x.nEn, xEn: `${x.srcEn} ${x.meanEn}` });

const exchange = JSON.parse(fs.readFileSync('data/exchange.json', 'utf8'));
for (const x of exchange) idx.push({ d: x.d, dn: nameById[x.d] || x.d, dnEn: nameEnById[x.d] || x.d, t: '交流', n: x.n, x: `${x.who} ${x.dir} ${x.detail}`, nEn: x.nEn, xEn: `${x.whoEn} ${x.dirEn} ${x.detailEn}` });

const archaeo = JSON.parse(fs.readFileSync('data/archaeo.json', 'utf8'));
for (const x of archaeo) idx.push({ d: x.d, dn: nameById[x.d] || x.d, dnEn: nameEnById[x.d] || x.d, t: '考古', n: x.n, x: `${x.y} ${x.site} ${x.find}`, nEn: x.nEn, xEn: `${x.yEn} ${x.siteEn} ${x.findEn}` });

const quotes = JSON.parse(fs.readFileSync('data/quotes.json', 'utf8'));
for (const x of quotes) idx.push({ d: x.d, dn: nameById[x.d] || x.d, dnEn: nameEnById[x.d] || x.d, t: '名句', n: x.q, x: `${x.author} ${x.src}`, nEn: x.qEn, xEn: `${x.authorEn} ${x.srcEn}` });

fs.writeFileSync('data/search.json', JSON.stringify(idx) + '\n');
console.log(`搜索索引条目: ${idx.length}`);
