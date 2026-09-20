// 生成 GEO 全量文本：llms-full.txt（中文）/ llms-full-en.txt（英文）
// 把整站结构化数据扁平化为纯文本，便于 AI 搜索引擎整站引用。
import fs from 'fs';

const SITE = 'https://MinosIE.github.io/chinese-dynasty-timeline/';
const overview = JSON.parse(fs.readFileSync('data/overview.json', 'utf8'));
const events = JSON.parse(fs.readFileSync('data/events.json', 'utf8'));
const inventions = JSON.parse(fs.readFileSync('data/inventions.json', 'utf8'));
const records = JSON.parse(fs.readFileSync('data/records.json', 'utf8'));
const systems = JSON.parse(fs.readFileSync('data/systems.json', 'utf8'));
const battles = JSON.parse(fs.readFileSync('data/battles.json', 'utf8'));
const people = JSON.parse(fs.readFileSync('data/people.json', 'utf8'));
const world = JSON.parse(fs.readFileSync('data/world.json', 'utf8'));
const reforms = JSON.parse(fs.readFileSync('data/reforms.json', 'utf8'));
const idioms = JSON.parse(fs.readFileSync('data/idioms.json', 'utf8'));
const culture = JSON.parse(fs.readFileSync('data/culture.json', 'utf8'));
const capitals = JSON.parse(fs.readFileSync('data/capitals.json', 'utf8'));
const currency = JSON.parse(fs.readFileSync('data/currency.json', 'utf8'));
const exchange = JSON.parse(fs.readFileSync('data/exchange.json', 'utf8'));
const archaeo = JSON.parse(fs.readFileSync('data/archaeo.json', 'utf8'));
const unity = JSON.parse(fs.readFileSync('data/unity.json', 'utf8'));
const quotes = JSON.parse(fs.readFileSync('data/quotes.json', 'utf8'));

const nameById = Object.fromEntries(overview.map(o => [o.id, o.name]));
const nameEnById = Object.fromEntries(overview.map(o => [o.id, o.nameEn || o.name]));
const ERA_EN = { '先秦': 'Pre-Qin', '秦汉': 'Qin–Han', '三国两晋南北朝': 'Three Kingdoms & Divisions', '隋唐': 'Sui–Tang', '宋元': 'Song–Yuan', '明清': 'Ming–Qing' };
const ROLE_EN = { '文臣': 'Civil Officials', '武将': 'Generals', '思想·文人': 'Thinkers & Men of Letters', '其他': 'Others' };
const ASPECT_EN = { '政治': 'Politics', '经济': 'Economy', '文化': 'Culture' };
const ASPECT_ORDER = ['政治', '经济', '文化'];
const TAG_EN = { '政治家': 'Statesman', '军事家': 'General', '女性': 'Woman', '思想家': 'Thinker', '文学家': 'Literatus', '科学家': 'Scientist', '医学家': 'Physician', '艺术家': 'Artist', '改革家': 'Reformer', '航海·探索': 'Explorer' };
const TYPE_ZH = { fewer: '以少胜多', unify: '统一兼并', revolt: '农民起义', frontier: '边疆·对外' };
const TYPE_EN = { fewer: 'outnumbered win', unify: 'unification', revolt: 'peasant revolt', frontier: 'frontier/foreign' };

// 中英取值：en 优先取 *En，缺失回退中文
const g = (o, k, lang) => (lang === 'en' ? (o?.[k + 'En'] ?? o?.[k]) : o?.[k]);
const T = (lang, zh, en) => (lang === 'en' ? en : zh);
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
  const out = [`## ${T(lang, '历史大事记', 'Key Events')}`];
  for (const e of events) {
    const dyn = lang === 'en' ? (nameEnById[e.d] || nameById[e.d]) : (nameById[e.d] || e.d);
    out.push(`- ${fmtYear(e.y)} 年：${g(e, 't', lang)}（${dyn}）— ${g(e, 'x', lang)}`);
  }
  return out.join('\n');
}

function buildInventions(lang) {
  const out = [`## ${T(lang, '四大发明', 'Four Great Inventions')}`];
  for (const it of inventions) {
    out.push(`- ${it.emoji || ''} ${g(it, 'name', lang)}（${g(it, 'era', lang)}，${g(it, 'person', lang)}）：${g(it, 'desc', lang)} 世界影响：${g(it, 'world', lang)}`);
  }
  return out.join('\n');
}

function buildRecords(lang) {
  const out = [`## ${T(lang, '帝王之最', 'Notable Rulers')}`];
  out.push('', `### ${T(lang, '在位最长', 'Longest Reigns')}`);
  for (const x of records.longest) {
    out.push(`- ${g(x, 'name', lang)}（${g(x, 'dynasty', lang)}，${g(x, 'rg', lang)}，约 ${x.ry} 年）`);
  }
  out.push('', `### ${T(lang, '在位最短', 'Shortest Reigns')}`);
  for (const x of records.shortest) {
    const dur = x.rd != null ? `${x.rd} 日` : x.rm != null ? `${x.rm} 月` : '约 1 年';
    out.push(`- ${g(x, 'name', lang)}（${g(x, 'dynasty', lang)}，${dur}）`);
  }
  out.push('', `### ${T(lang, '帝王最多的朝代', 'Most Rulers by Dynasty')}`);
  for (const x of records.mostEmperors) {
    out.push(`- ${g(x, 'dynasty', lang)}：${x.count} 位`);
  }
  return out.join('\n');
}

function buildSystems(lang) {
  const out = [`## ${T(lang, '制度演变', 'Institutions Through the Ages')}`];
  for (const th of systems) {
    out.push('', `### ${g(th, 'title', lang)}`);
    for (const s of th.stages) out.push(`- ${g(s, 'k', lang)}：${g(s, 'n', lang)}（${g(s, 'x', lang)}）`);
  }
  return out.join('\n');
}

function buildReforms(lang) {
  const out = [`## ${T(lang, '改革与变法', 'Reforms & Reformers')}`];
  for (const r of reforms) {
    out.push(`- ${fmtYear(r.y)}：${g(r, 'n', lang)}（${T(lang, '主持', 'sponsor')} ${g(r, 'who', lang)}）— ${T(lang, '措施', 'measures')}：${g(r, 'measures', lang)}；${T(lang, '结果', 'outcome')}：${g(r, 'result', lang)}`);
  }
  return out.join('\n');
}

function buildBattles(lang) {
  const out = [`## ${T(lang, '著名战役', 'Famous Battles')}`];
  for (const b of battles) {
    const ty = T(lang, TYPE_ZH[b.type], TYPE_EN[b.type]);
    const dn = lang === 'en' ? (nameEnById[b.d] || b.d) : (nameById[b.d] || b.d);
    out.push(`- ${fmtYear(b.y)}：${g(b, 'n', lang)}（${ty}，${dn}）— ${T(lang, '主将', 'commanders')} ${g(b, 'gen', lang)}；${g(b, 'x', lang)}`);
  }
  return out.join('\n');
}

function buildUnity(lang) {
  const out = [`## ${T(lang, '统一与分裂', 'Unity & Division')}`];
  for (const u of unity) {
    const kind = T(lang, u.kind === 'unify' ? '大一统' : '大分裂', u.kind === 'unify' ? 'unified' : 'divided');
    out.push(`- ${g(u, 'n', lang)}（${fmtYear(u.from)}–${fmtYear(u.to)}，${kind}）：${g(u, 'note', lang)}`);
  }
  return out.join('\n');
}

function buildPeople(lang) {
  const out = [`## ${T(lang, '历史人物', 'Historical Figures')}`];
  let cur = null;
  for (const p of people) {
    const dn = lang === 'en' ? (p.dnEn || p.dn) : p.dn;
    if (dn !== cur) { out.push('', `### ${dn}`); cur = dn; }
    const tags = p.tags.length ? `［${p.tags.map(tg => T(lang, tg, TAG_EN[tg] || tg)).join('/')}］` : '';
    out.push(`- ${g(p, 'n', lang)}（${g(p, 'note', lang)}）${tags}`);
  }
  return out.join('\n');
}

function buildCulture(lang) {
  const out = [`## ${T(lang, '文化成就', 'Cultural Achievements')}`];
  out.push('', `### ${T(lang, '文学体裁演变', 'Evolution of Literary Genres')}`);
  for (const s of culture.genres) out.push(`- ${g(s, 'k', lang)}：${g(s, 'n', lang)}（${g(s, 'rep', lang)} · ${g(s, 'work', lang)}）`);
  for (const sec of culture.sections) {
    out.push('', `### ${g(sec, 'title', lang)}`);
    out.push('- ' + sec.items.map(it => `${g(it, 'n', lang)}（${g(it, 'note', lang)}）`).join('；'));
  }
  return out.join('\n');
}

function buildCapitals(lang) {
  const out = [`## ${T(lang, '都城变迁', 'Dynastic Capitals')}`];
  for (const c of capitals) {
    const dn = lang === 'en' ? (nameEnById[c.d] || c.d) : (nameById[c.d] || c.d);
    out.push(`- ${dn}：${g(c, 'n', lang)} — ${g(c, 'note', lang)}`);
  }
  return out.join('\n');
}

function buildCurrency(lang) {
  const out = [`## ${T(lang, '货币演变', 'Evolution of Currency')}`];
  for (const s of currency) out.push(`- ${g(s, 'k', lang)}：${g(s, 'n', lang)}（${g(s, 'x', lang)}）`);
  return out.join('\n');
}

function buildExchange(lang) {
  const out = [`## ${T(lang, '对外交流', 'Foreign Exchange')}`];
  for (const x of exchange) out.push(`- ${fmtYear(x.y)}：${g(x, 'n', lang)}（${g(x, 'who', lang)}，${g(x, 'dir', lang)}）— ${g(x, 'detail', lang)}`);
  return out.join('\n');
}

function buildArchaeo(lang) {
  const out = [`## ${T(lang, '史料与考古', 'History & Archaeology')}`];
  for (const x of archaeo) out.push(`- ${g(x, 'n', lang)}（${g(x, 'y', lang)}，${g(x, 'site', lang)}）：${g(x, 'find', lang)}。${g(x, 'value', lang)}`);
  return out.join('\n');
}

function buildIdioms(lang) {
  const out = [`## ${T(lang, '成语典故', 'Classic Idioms')}`];
  for (const x of idioms) out.push(`- ${g(x, 'n', lang)}：${g(x, 'src', lang)} — ${g(x, 'mean', lang)}`);
  return out.join('\n');
}

function buildQuotes(lang) {
  const out = [`## ${T(lang, '名句名篇', 'Famous Quotes')}`];
  for (const x of quotes) out.push(`- “${g(x, 'q', lang)}” — ${g(x, 'author', lang)} ${g(x, 'src', lang)}`);
  return out.join('\n');
}

function buildWorld(lang) {
  const out = [`## ${T(lang, '世界对比', 'China & the World')}`];
  for (const w of world) out.push(`- ${g(w, 'cn', lang)}（${g(w, 'period', lang)}） ↔ ${g(w, 'world', lang)}：${g(w, 'x', lang)}`);
  return out.join('\n');
}

function build(lang) {
  const n = overview.length;
  const head = lang === 'en'
    ? ['# Chinese Dynasties · A Timeline of Three Millennia', '',
       `> A static, zero-dependency educational site on Chinese imperial history, from the Xia to the Qing dynasty (${n} dynasties & transitional periods). Full plain-text dump of all structured data for LLM ingestion.`, '',
       `Source: ${SITE}`, '']
    : ['# 中华王朝 · 千年脉络', '',
       `> 一个零依赖、纯静态的中国历史朝代科普网页，覆盖夏到清共 ${n} 个朝代与过渡时期。以下为全部结构化数据的纯文本全文，便于 AI 搜索引擎整站引用。`, '',
       `数据来源：${SITE}`, ''];

  const dynastySec = ['## 各王朝详情', ''];
  for (const o of overview) {
    const d = JSON.parse(fs.readFileSync(`data/dynasties/${o.id}.json`, 'utf8'));
    dynastySec.push(buildDynasty(d, lang), '');
  }
  return [
    ...head,
    ...dynastySec,
    buildSystems(lang), '',
    buildReforms(lang), '',
    buildBattles(lang), '',
    buildUnity(lang), '',
    buildPeople(lang), '',
    buildCulture(lang), '',
    buildCapitals(lang), '',
    buildCurrency(lang), '',
    buildExchange(lang), '',
    buildArchaeo(lang), '',
    buildIdioms(lang), '',
    buildQuotes(lang), '',
    buildWorld(lang), '',
    buildEvents(lang), '',
    buildInventions(lang), '',
    buildRecords(lang), ''
  ].join('\n');
}

fs.writeFileSync('llms-full.txt', build('zh'));
fs.writeFileSync('llms-full-en.txt', build('en'));
console.log(`生成 llms-full.txt / llms-full-en.txt（覆盖 ${overview.length} 个王朝、制度${systems.length}、改革${reforms.length}、战役${battles.length}、人物${people.length}、成语${idioms.length}、考古${archaeo.length}、名句${quotes.length} 等）`);
