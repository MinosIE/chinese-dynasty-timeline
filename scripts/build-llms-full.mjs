// 生成 GEO 全量文本：llms-full.txt（中文）/ llms-full-en.txt（英文）
// 把整站结构化数据扁平化为纯文本，便于 AI 搜索引擎整站引用。
import fs from 'fs';

const SITE = 'https://MinosIE.github.io/chinese-dynasty-timeline/';
const overview = JSON.parse(fs.readFileSync('data/overview.json', 'utf8'));
const events = JSON.parse(fs.readFileSync('data/events.json', 'utf8'));
const inventions = JSON.parse(fs.readFileSync('data/inventions.json', 'utf8'));
const records = JSON.parse(fs.readFileSync('data/records.json', 'utf8'));

const nameById = Object.fromEntries(overview.map(o => [o.id, o.name]));
const nameEnById = Object.fromEntries(overview.map(o => [o.id, o.nameEn || o.name]));
const ERA_EN = { '先秦': 'Pre-Qin', '秦汉': 'Qin–Han', '三国两晋南北朝': 'Three Kingdoms & Divisions', '隋唐': 'Sui–Tang', '宋元': 'Song–Yuan', '明清': 'Ming–Qing' };
const ROLE_EN = { '文臣': 'Civil Officials', '武将': 'Generals', '思想·文人': 'Thinkers & Men of Letters', '其他': 'Others' };
const ASPECT_EN = { '政治': 'Politics', '经济': 'Economy', '文化': 'Culture' };
const ASPECT_ORDER = ['政治', '经济', '文化'];

// 中英取值：en 优先取 *En，缺失回退中文
const g = (o, k, lang) => (lang === 'en' ? (o?.[k + 'En'] ?? o?.[k]) : o?.[k]);
const fmtYear = y => (typeof y === 'number' ? (y < 0 ? '前' + (-y) : String(y)) : y);

function buildDynasty(d, lang) {
  const name = g(d, 'name', lang);
  const years = g(d, 'years', lang);
  const era = lang === 'en' ? (ERA_EN[d.era] || d.era) : d.era;
  const capital = g(d, 'capital', lang);
  const out = [];
  out.push(`## ${name}（${years}）`);
  out.push(`- 大时代：${era}`);
  out.push(`- 都城：${capital}`);
  out.push(`- 特征：${g(d, 'feature', lang) || ''}`);
  out.push(`- 总结：${g(d, 'summary', lang) || ''}`);

  if (d.emperors?.length) {
    out.push('', '### 帝王');
    for (const e of d.emperors) {
      const n = g(e, 'n', lang);
      const t = g(e, 't', lang);
      const rg = g(e, 'rg', lang);
      const ry = e.ry;
      let s = `- ${n}`;
      if (t) s += `（${t}）`;
      s += `：${rg}，在位约 ${ry} 年`;
      const mt = g(e, 'mt', lang), sh = g(e, 'sh', lang);
      if (mt) s += `，庙号 ${mt}`;
      if (sh) s += `，谥号 ${sh}`;
      const note = g(e, 'note', lang);
      if (note) s += `。${note}`;
      out.push(s);
    }
  }

  if (d.talents && Object.keys(d.talents).length) {
    out.push('', '### 人才');
    for (const role of Object.keys(d.talents)) {
      const roleName = lang === 'en' ? (ROLE_EN[role] || role) : role;
      const list = d.talents[role].map(p => {
        const n = g(p, 'n', lang);
        const note = g(p, 'note', lang);
        return note ? `${n}（${note}）` : n;
      }).join('；');
      out.push(`- ${roleName}：${list}`);
    }
  }

  if (d.policies?.length) {
    out.push('', '### 制度');
    d.policies.forEach((p, i) => {
      const pe = (d.policiesEn && d.policiesEn[i]) || p;
      out.push(`- ${lang === 'en' ? pe : p}`);
    });
  }

  if (d.aspects) {
    out.push('', '### 三维（政治 · 经济 · 文化）');
    for (const k of ASPECT_ORDER) {
      if (!d.aspects[k]) continue;
      const label = lang === 'en' ? (ASPECT_EN[k] || k) : k;
      const arr = lang === 'en' ? (d.aspectsEn?.[k] || d.aspects[k]) : d.aspects[k];
      out.push(`- ${label}：` + arr.join('；'));
    }
  }
  return out.join('\n');
}

function buildEvents(lang) {
  const out = ['## 历史大事记'];
  for (const e of events) {
    const dyn = lang === 'en' ? (nameEnById[e.d] || nameById[e.d]) : (nameById[e.d] || e.d);
    out.push(`- ${fmtYear(e.y)} 年：${g(e, 't', lang)}（${dyn}）— ${g(e, 'x', lang)}`);
  }
  return out.join('\n');
}

function buildInventions(lang) {
  const out = ['## 四大发明'];
  for (const it of inventions) {
    out.push(`- ${it.emoji || ''} ${g(it, 'name', lang)}（${g(it, 'era', lang)}，${g(it, 'person', lang)}）：${g(it, 'desc', lang)} 世界影响：${g(it, 'world', lang)}`);
  }
  return out.join('\n');
}

function buildRecords(lang) {
  const out = ['## 帝王之最'];
  out.push('', '### 在位最长');
  for (const x of records.longest) {
    out.push(`- ${g(x, 'name', lang)}（${g(x, 'dynasty', lang)}，${g(x, 'rg', lang)}，约 ${x.ry} 年）`);
  }
  out.push('', '### 在位最短');
  for (const x of records.shortest) {
    const dur = x.rd != null ? `${x.rd} 日` : x.rm != null ? `${x.rm} 月` : '约 1 年';
    out.push(`- ${g(x, 'name', lang)}（${g(x, 'dynasty', lang)}，${dur}）`);
  }
  out.push('', '### 帝王最多的朝代');
  for (const x of records.mostEmperors) {
    out.push(`- ${g(x, 'dynasty', lang)}：${x.count} 位`);
  }
  return out.join('\n');
}

function build(lang) {
  const head = lang === 'en'
    ? ['# Chinese Dynasties · A Timeline of Three Millennia', '',
       '> A static, zero-dependency educational site on Chinese imperial history from the Xia to the Qing dynasty (18 dynasties). Full plain-text dump of all structured data for LLM ingestion.', '',
       `Source: ${SITE}`, '']
    : ['# 中华王朝 · 千年脉络', '',
       '> 一个零依赖、纯静态的中国历史朝代科普网页，覆盖夏到清 18 朝。以下为全部结构化数据的纯文本全文，便于 AI 搜索引擎整站引用。', '',
       `数据来源：${SITE}`, ''];

  const dynastySec = ['## 各王朝详情', ''];
  for (const o of overview) {
    const d = JSON.parse(fs.readFileSync(`data/dynasties/${o.id}.json`, 'utf8'));
    dynastySec.push(buildDynasty(d, lang), '');
  }
  return [
    ...head,
    ...dynastySec,
    buildEvents(lang), '',
    buildInventions(lang), '',
    buildRecords(lang), ''
  ].join('\n');
}

fs.writeFileSync('llms-full.txt', build('zh'));
fs.writeFileSync('llms-full-en.txt', build('en'));
console.log(`生成 llms-full.txt / llms-full-en.txt（覆盖 ${overview.length} 个王朝、${events.length} 条大事记、${inventions.length} 项发明）`);
