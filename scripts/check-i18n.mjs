// 校验中英双语数据完整性：报告缺失的 *En 字段。
// 用法：node scripts/check-i18n.mjs   （有缺失时退出码为 1）
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const missing = [];
const miss = (file, where, field) => missing.push(`${file} :: ${where} :: 缺少 ${field}`);

const need = (file, obj, where, fields) => {
  if (!obj || typeof obj !== 'object') return;
  for (const f of fields) {
    const base = f.replace(/En$/, '');
    // 仅当原字段有内容（非空）时才要求对应 En
    if (obj[base] != null && obj[base] !== '' && (obj[f] == null || obj[f] === '')) miss(file, where, f);
  }
};

/* 概览 */
const overview = read('data/overview.json');
overview.forEach(o => need('overview.json', o, o.id, ['nameEn', 'yearsEn', 'capitalEn', 'durationEn', 'featureEn', 'summaryEn']));

/* 各朝详情 */
for (const f of fs.readdirSync(path.join(root, 'data/dynasties')).filter(x => x.endsWith('.json'))) {
  const p = `data/dynasties/${f}`;
  const d = read(p);
  need(p, d, d.id, ['nameEn', 'yearsEn', 'capitalEn', 'featureEn', 'summaryEn']);
  (d.emperors || []).forEach((e, i) => need(p, e, `${d.id}.emperors[${i}] ${e.n}`, ['nEn', 'tEn', 'rgEn', 'ghEn', 'mtEn', 'shEn', 'noteEn']));
  for (const role in (d.talents || {})) {
    (d.talents[role] || []).forEach((t, i) => { if (t && typeof t === 'object') need(p, t, `${d.id}.talents.${role}[${i}] ${t.n}`, ['nEn', 'noteEn']); });
  }
  if (Array.isArray(d.policies) && d.policies.length) {
    if (!Array.isArray(d.policiesEn) || d.policiesEn.length !== d.policies.length) miss(p, d.id, `policiesEn(长度应为 ${d.policies.length})`);
  }
  if (d.aspects) {
    for (const k in d.aspects) {
      const en = d.aspectsEn && d.aspectsEn[k];
      if (!Array.isArray(en) || en.length !== d.aspects[k].length) miss(p, `${d.id}.aspects.${k}`, `aspectsEn[${k}](长度应为 ${d.aspects[k].length})`);
    }
  }
}

/* 大事记 */
read('data/events.json').forEach((e, i) => need('data/events.json', e, `events[${i}] ${e.t}`, ['tEn', 'xEn']));

/* 四大发明 */
read('data/inventions.json').forEach((v, i) => need('data/inventions.json', v, `inventions[${i}] ${v.id}`, ['nameEn', 'eraEn', 'personEn', 'descEn', 'worldEn', 'dynastyLabelEn']));

/* 帝王之最 */
const rec = read('data/records.json');
for (const kind of ['longest', 'shortest', 'mostEmperors']) {
  (rec[kind] || []).forEach((it, i) => need('data/records.json', it, `${kind}[${i}] ${it.name || it.dynasty}`, ['nameEn', 'rgEn', 'dynastyEn']));
}

if (missing.length) {
  console.error(`✗ 发现 ${missing.length} 处英文缺失：`);
  missing.forEach(m => console.error('  - ' + m));
  process.exit(1);
}
console.log('✓ 双语数据完整：overview / 18 朝详情 / events / inventions / records 均无缺失');
