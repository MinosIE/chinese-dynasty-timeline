// 由 data/overview.json 生成 GEO/SEO 配套文件：llms.txt / llms-en.txt / robots.txt / sitemap.xml
import fs from 'fs';

const SITE = 'https://MinosIE.github.io/chinese-dynasty-timeline/';
const overview = JSON.parse(fs.readFileSync('data/overview.json', 'utf8'));
const ERA_EN = { '先秦': 'Pre-Qin', '秦汉': 'Qin–Han', '三国两晋南北朝': 'Three Kingdoms & Divisions', '隋唐': 'Sui–Tang', '宋元': 'Song–Yuan', '明清': 'Ming–Qing' };

/* ---------- 中文 llms.txt ---------- */
const llms = [
  '# 中华王朝 · 千年脉络',
  '',
  '> 一个科普中国历史朝代的静态网页，覆盖从夏到清的主要王朝，含王朝概览、帝王世系、核心人才、制度演变、著名战役、历史人物、文化成就、对外交流、史料考古、世界对比等专题。',
  '',
  '## 数据入口',
  `- [王朝总览](${SITE}data/overview.json)：全部王朝概览（名称、年代、都城、特征、总结、计数）`,
  `- [王朝详情目录](${SITE}data/dynasties/)：每个王朝的完整详情 JSON（帝王世系、人才、政策）`,
  `- [制度演变](${SITE}data/systems.json)｜[改革变法](${SITE}data/reforms.json)｜[著名战役](${SITE}data/battles.json)｜[统一与分裂](${SITE}data/unity.json)`,
  `- [历史人物](${SITE}data/people.json)｜[文化成就](${SITE}data/culture.json)｜[成语典故](${SITE}data/idioms.json)｜[名句名篇](${SITE}data/quotes.json)`,
  `- [都城变迁](${SITE}data/capitals.json)｜[货币演变](${SITE}data/currency.json)｜[对外交流](${SITE}data/exchange.json)｜[史料考古](${SITE}data/archaeo.json)｜[世界对比](${SITE}data/world.json)`,
  `- [全量文本](${SITE}llms-full.txt)：整站结构化数据的纯文本全文（便于 AI 搜索引擎整站引用）`,
  `- [英文索引](${SITE}llms-en.txt)：English version of this index`,
  '',
  '## 各王朝速览',
  ...overview.map(o => `- **${o.name}**（${o.years}，${o.era}，都城${o.capital}）：${o.summary}`),
  ''
].join('\n');
fs.writeFileSync('llms.txt', llms);

/* ---------- 英文 llms-en.txt ---------- */
const llmsEn = [
  '# Chinese Dynasties · A Millennial Saga',
  '',
  '> A lightweight, static educational site on the dynasties of China, from Xia to Qing — with dynasty overviews, imperial lineages, key talents, institutions, famous battles, historical figures, cultural achievements, foreign exchange, archaeology and world comparisons.',
  '',
  '## Data endpoints',
  `- [Dynasty overview](${SITE}data/overview.json): all dynasties (name / years / capital / feature / summary / counts). English text lives in the sibling \`*En\` fields.`,
  `- [Dynasty details](${SITE}data/dynasties/): per-dynasty JSON (emperors, talents, policies, aspects); English text in \`*En\` fields.`,
  `- [Institutions](${SITE}data/systems.json) | [Reforms](${SITE}data/reforms.json) | [Battles](${SITE}data/battles.json) | [Unity & Division](${SITE}data/unity.json)`,
  `- [Figures](${SITE}data/people.json) | [Culture](${SITE}data/culture.json) | [Idioms](${SITE}data/idioms.json) | [Quotes](${SITE}data/quotes.json)`,
  `- [Capitals](${SITE}data/capitals.json) | [Currency](${SITE}data/currency.json) | [Exchange](${SITE}data/exchange.json) | [Archaeology](${SITE}data/archaeo.json) | [World](${SITE}data/world.json)`,
  `- [Full text](${SITE}llms-full-en.txt): full plain-text dump of all structured data (for whole-site LLM citation).`,
  `- [Chinese index](${SITE}llms.txt): 中文索引`,
  '',
  '## Dynasty quick view',
  ...overview.map(o => `- **${o.nameEn || o.name}** (${o.yearsEn || o.years}, ${ERA_EN[o.era] || o.era}, capital ${o.capitalEn || o.capital}): ${o.summaryEn || o.summary}`),
  ''
].join('\n');
fs.writeFileSync('llms-en.txt', llmsEn);

/* ---------- robots.txt / sitemap.xml ---------- */
fs.writeFileSync('robots.txt',
  `User-agent: *\nAllow: /\nSitemap: ${SITE}sitemap.xml\n`);

const DATA_FILES = ['systems', 'reforms', 'battles', 'unity', 'people', 'culture', 'idioms', 'quotes', 'capitals', 'currency', 'exchange', 'archaeo', 'world'];
const urls = [
  `<url><loc>${SITE}</loc><changefreq>monthly</changefreq><priority>1.0</priority></url>`,
  `<url><loc>${SITE}data/overview.json</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`,
  `<url><loc>${SITE}llms.txt</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`,
  `<url><loc>${SITE}llms-en.txt</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`,
  `<url><loc>${SITE}llms-full.txt</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`,
  `<url><loc>${SITE}llms-full-en.txt</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`,
  ...DATA_FILES.map(f => `<url><loc>${SITE}data/${f}.json</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>`),
  ...overview.map(o => `<url><loc>${SITE}data/dynasties/${o.id}.json</loc><changefreq>yearly</changefreq><priority>0.6</priority></url>`)
];
fs.writeFileSync('sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  ${urls.join('\n  ')}\n</urlset>\n`);

console.log(`生成 llms.txt / llms-en.txt / robots.txt / sitemap.xml（覆盖 ${overview.length} 个王朝）`);
