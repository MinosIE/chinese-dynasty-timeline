import fs from 'fs';

const dir = 'data/dynasties';
const ov = JSON.parse(fs.readFileSync('data/overview.json'));
const nameById = Object.fromEntries(ov.map(o => [o.id, o.name]));

const emps = [];
for (const f of fs.readdirSync(dir)) {
  const d = JSON.parse(fs.readFileSync(dir + '/' + f));
  const id = f.replace('.json', '');
  (d.emperors || []).forEach(e => {
    if (typeof e.ry === 'number' && e.ry > 0) {
      emps.push({ name: e.n, ry: e.ry, rg: e.rg, id, dynasty: nameById[id] || d.name });
    }
  });
}

const longest = [...emps].sort((a, b) => b.ry - a.ry).slice(0, 6);
const shortest = [...emps].sort((a, b) => a.ry - b.ry).slice(0, 6);
const mostEmperors = [...ov]
  .sort((a, b) => b.counts.emperors - a.counts.emperors)
  .slice(0, 6)
  .map(o => ({ dynasty: o.name, id: o.id, count: o.counts.emperors }));

const records = { longest, shortest, mostEmperors };
fs.writeFileSync('data/records.json', JSON.stringify(records, null, 2) + '\n');
console.log(`帝王之最: 最长${longest.length} / 最短${shortest.length} / 帝王最多朝代${mostEmperors.length}`);
console.log('在位最长:', longest[0].name, longest[0].ry, '年');
console.log('在位最短:', shortest[0].name, shortest[0].ry, '年');
console.log('帝王最多:', mostEmperors[0].dynasty, mostEmperors[0].count, '位');
