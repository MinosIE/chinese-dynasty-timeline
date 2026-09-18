import fs from 'fs';

const dir = 'data/dynasties';
const ov = JSON.parse(fs.readFileSync('data/overview.json'));
const nameById = Object.fromEntries(ov.map(o => [o.id, o.name]));
const nameEnById = Object.fromEntries(ov.map(o => [o.id, o.nameEn || o.name]));

// 存疑 / 约数 判定：rg 含「约」，或 note 含「岁余/不足/存疑/待考/传说/争议」
const isApprox = e => /约/.test(e.rg || '') || /岁余|不足|存疑|待考|传说|争议/.test(e.note || '');

const emps = [];
for (const f of fs.readdirSync(dir)) {
  const d = JSON.parse(fs.readFileSync(dir + '/' + f));
  const id = f.replace('.json', '');
  (d.emperors || []).forEach(e => {
    if (typeof e.ry === 'number' && e.ry > 0) {
      const item = {
        name: e.n, nameEn: e.nEn || e.n, ry: e.ry,
        rg: e.rg, rgEn: e.rgEn || e.rg,
        id, dynasty: nameById[id] || d.name, dynastyEn: nameEnById[id] || d.nameEn || d.name
      };
      // 更细的在位时长（仅短在位者提供）：rd=日，rm=月
      if (e.rd != null) item.rd = e.rd;
      if (e.rm != null) item.rm = e.rm;
      if (isApprox(e)) item.approx = true;
      emps.push(item);
    }
  });
}

// 统一折算为「月」用于排序：日 → 月，月 → 月，年 → ×12
const monthsOf = x => (x.rd != null ? x.rd / 30 : (x.rm != null ? x.rm : x.ry * 12));

// 在位最长：按年降序；同年时信史（非约）优先
const longest = [...emps]
  .sort((a, b) => b.ry - a.ry || (a.approx ? 1 : 0) - (b.approx ? 1 : 0))
  .slice(0, 6);

// 在位最短：按月升序（有月/日精度者更靠前）
const shortest = [...emps]
  .sort((a, b) => monthsOf(a) - monthsOf(b) || String(a.name).localeCompare(String(b.name)))
  .slice(0, 6);

const mostEmperors = [...ov]
  .sort((a, b) => b.counts.emperors - a.counts.emperors)
  .slice(0, 6)
  .map(o => ({ dynasty: o.name, dynastyEn: o.nameEn || o.name, id: o.id, count: o.counts.emperors }));

const records = { longest, shortest, mostEmperors };
fs.writeFileSync('data/records.json', JSON.stringify(records, null, 2) + '\n');
console.log(`帝王之最: 最长${longest.length} / 最短${shortest.length} / 帝王最多朝代${mostEmperors.length}`);
console.log('在位最长:', longest.map(x => `${x.name}${x.approx ? '(约)' : ''}${x.ry}年`).join(' / '));
console.log('在位最短:', shortest.map(x => `${x.name}${x.rd != null ? x.rd + '日' : x.rm != null ? x.rm + '月' : '约1年'}`).join(' / '));
console.log('帝王最多:', mostEmperors[0].dynasty, mostEmperors[0].count, '位');
