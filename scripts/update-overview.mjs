// 为概览补充 start/end 年份，并插入辽 / 西夏 / 金
import fs from 'fs';

const OVER = 'data/overview.json';
const SPAN = {
  xia: [-2070, -1600], shang: [-1600, -1046], zhou: [-1046, -256], qin: [-221, -207], han: [-202, 220],
  sanguo: [220, 280], jin: [265, 420], nanbeichao: [420, 589], sui: [581, 618], tang: [618, 907],
  wudai: [907, 960], liao: [916, 1125], song: [960, 1279], xixia: [1038, 1227], jinchao: [1115, 1234],
  yuan: [1271, 1368], ming: [1368, 1644], qing: [1636, 1912]
};
const ORDER = ['xia', 'shang', 'zhou', 'qin', 'han', 'sanguo', 'jin', 'nanbeichao', 'sui', 'tang',
  'wudai', 'liao', 'song', 'xixia', 'jinchao', 'yuan', 'ming', 'qing'];

const ov = JSON.parse(fs.readFileSync(OVER, 'utf8'));

function fromDetail(id) {
  const d = JSON.parse(fs.readFileSync(`data/dynasties/${id}.json`, 'utf8'));
  const talents = Object.values(d.talents).reduce((s, a) => s + a.length, 0);
  const ry = d.emperors.reduce((a, e) => a + (+e.ry || 0), 0);
  const s = SPAN[id];
  return {
    id, name: d.name, years: d.years, era: d.era, capital: d.capital, approx: false,
    start: s[0], end: s[1], duration: ry + '年',
    feature: d.feature, summary: d.summary,
    counts: { emperors: d.emperors.length, talents, policies: d.policies.length }
  };
}

for (const id of ['liao', 'xixia', 'jinchao']) if (!ov.find(o => o.id === id)) ov.push(fromDetail(id));

const byId = Object.fromEntries(ov.map(o => [o.id, o]));
const norm = o => {
  const s = SPAN[o.id];
  return {
    id: o.id, name: o.name, years: o.years, era: o.era, capital: o.capital, approx: !!o.approx,
    start: o.start ?? (s ? s[0] : null), end: o.end ?? (s ? s[1] : null),
    duration: o.duration, feature: o.feature, summary: o.summary, counts: o.counts
  };
};

const out = ORDER.map(id => byId[id]).filter(Boolean).map(norm);
for (const o of ov) if (!ORDER.includes(o.id)) out.push(norm(o));

fs.writeFileSync(OVER, JSON.stringify(out, null, 2) + '\n');
console.log('overview 更新完成，共', out.length, '个朝代（含辽/西夏/金）');
