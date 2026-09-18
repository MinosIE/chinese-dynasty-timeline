// 依据已翻译的朝代详情 / 概览 / 发明数据，自动给 data/search.json 的每条加 nEn / xEn / dnEn。
// 不改动原有字段与顺序，仅增量补充英文。
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const dir = path.join(root, 'data', 'dynasties');

// 1) 朝代详情映射
const emperorMap = {};   // d -> { n: {nEn, noteEn} }
const talentMap = {};    // d -> { n: {nEn, noteEn} }
const policyMap = {};    // d -> { zh: en }
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.json')) continue;
  const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const id = d.id;
  emperorMap[id] = {};
  talentMap[id] = {};
  policyMap[id] = {};
  (d.emperors || []).forEach(e => { emperorMap[id][e.n] = { nEn: e.nEn || e.n, noteEn: e.noteEn || '' }; });
  Object.values(d.talents || {}).forEach(arr => arr.forEach(p => { talentMap[id][p.n] = { nEn: p.nEn || p.n, noteEn: p.noteEn || '' }; }));
  (d.policies || []).forEach((zh, i) => { policyMap[id][zh] = (d.policiesEn && d.policiesEn[i]) || zh; });
}

// 2) 概览映射
const overview = JSON.parse(fs.readFileSync(path.join(root, 'data', 'overview.json'), 'utf8'));
const ovById = {};
overview.forEach(o => { ovById[o.id] = o; });

// 3) 发明映射
const inv = JSON.parse(fs.readFileSync(path.join(root, 'data', 'inventions.json'), 'utf8'));
const invByName = {};
inv.forEach(v => { invByName[v.name] = v; });

// 4) 处理 search.json
const search = JSON.parse(fs.readFileSync(path.join(root, 'data', 'search.json'), 'utf8'));
let miss = 0;
const out = search.map(it => {
  const r = { ...it };
  const d = it.d;
  if (it.t === '朝代') {
    const o = ovById[d];
    r.nEn = o ? o.nameEn : it.n;
    r.dnEn = o ? o.nameEn : it.dn;
    r.xEn = o ? `${o.featureEn} ${o.summaryEn}` : it.x;
  } else if (it.t === '帝王') {
    const m = (emperorMap[d] || {})[it.n];
    if (m) { r.nEn = m.nEn; r.xEn = m.noteEn; r.dnEn = (ovById[d] || {}).nameEn || it.dn; }
    else { miss++; r.nEn = it.n; r.xEn = it.x; r.dnEn = it.dn; }
  } else if (it.t === '制度') {
    const en = (policyMap[d] || {})[it.n] || it.n;
    r.nEn = en; r.xEn = en; r.dnEn = (ovById[d] || {}).nameEn || it.dn;
  } else if (it.t === '发明') {
    const v = invByName[it.n];
    if (v) {
      r.nEn = v.nameEn;
      r.dnEn = v.dynastyLabelEn || it.dn;
      r.xEn = `${v.eraEn} ${v.personEn}. ${v.descEn} ${v.worldEn}`.trim();
    } else { miss++; r.nEn = it.n; r.xEn = it.x; r.dnEn = it.dn; }
  } else { // 文臣 / 武将 / 思想·文人 / 其他
    const m = (talentMap[d] || {})[it.n];
    if (m) { r.nEn = m.nEn; r.xEn = m.noteEn; r.dnEn = (ovById[d] || {}).nameEn || it.dn; }
    else { miss++; r.nEn = it.n; r.xEn = it.x; r.dnEn = it.dn; }
  }
  return r;
});

fs.writeFileSync(path.join(root, 'data', 'search.json'), JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log(`search.json entries: ${out.length}, unmatched: ${miss}`);
