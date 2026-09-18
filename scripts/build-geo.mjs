// 由 data/overview.json 生成 GEO/SEO 配套文件：llms.txt / llms-en.txt / robots.txt / sitemap.xml
import fs from 'fs';

const SITE = 'https://MinosIE.github.io/chinese-dynasty-timeline/';
const overview = JSON.parse(fs.readFileSync('data/overview.json', 'utf8'));
const ERA_EN = { '先秦': 'Pre-Qin', '秦汉': 'Qin–Han', '三国两晋南北朝': 'Three Kingdoms & Divisions', '隋唐': 'Sui–Tang', '宋元': 'Song–Yuan', '明清': 'Ming–Qing' };

/* ---------- 中文 llms.txt ---------- */
const llms = [
  '# 中华王朝 · 千年脉络',
  '',
  '> 一个科普中国历史朝代的静态网页，覆盖从夏到清的主要王朝，含每个王朝的概览、帝王世系、核心人才与关键制度。',
  '',
  '## 数据入口',
  `- [王朝总览](${SITE}data/overview.json)：全部王朝概览（名称、年代、都城、特征、总结、计数）`,
  `- [王朝详情目录](${SITE}data/dynasties/)：每个王朝的完整详情 JSON（帝王世系、人才、政策）`,
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
  '> A lightweight, static educational site on the dynasties of China, from Xia to Qing, with each dynasty’s overview, imperial lineage, key talents and pivotal institutions.',
  '',
  '## Data endpoints',
  `- [Dynasty overview](${SITE}data/overview.json): all dynasties (name / years / capital / feature / summary / counts). English text lives in the sibling \`*En\` fields.`,
  `- [Dynasty details](${SITE}data/dynasties/): per-dynasty JSON (emperors, talents, policies, aspects); English text in \`*En\` fields.`,
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

const urls = [
  `<url><loc>${SITE}</loc><changefreq>monthly</changefreq><priority>1.0</priority></url>`,
  `<url><loc>${SITE}data/overview.json</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`,
  `<url><loc>${SITE}llms.txt</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`,
  `<url><loc>${SITE}llms-en.txt</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`,
  `<url><loc>${SITE}llms-full.txt</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`,
  `<url><loc>${SITE}llms-full-en.txt</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`,
  ...overview.map(o => `<url><loc>${SITE}data/dynasties/${o.id}.json</loc><changefreq>yearly</changefreq><priority>0.6</priority></url>`)
];
fs.writeFileSync('sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  ${urls.join('\n  ')}\n</urlset>\n`);

console.log(`生成 llms.txt / llms-en.txt / robots.txt / sitemap.xml（覆盖 ${overview.length} 个王朝）`);
