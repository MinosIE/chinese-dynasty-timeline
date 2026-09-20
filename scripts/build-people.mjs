// 由 overview + 各朝代详情的人才，生成可筛选的人物索引 data/people.json
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const overview = JSON.parse(fs.readFileSync(path.join(root, 'data', 'overview.json'), 'utf8'));

// 主题标签（按人物中文名归入特殊集合；role 另给通用标签）
const SETS = {
  '女性': ['妇好', '述律平', '萧太后(承天)', '没藏太后', '花木兰', '李清照', '黄道婆'],
  '思想家': ['孔子', '老子', '孟子', '庄子', '墨子', '韩非', '荀子', '邹衍', '公孙龙', '董仲舒', '朱熹', '王守仁(阳明)'],
  '文学家': ['屈原', '李白', '杜甫', '白居易', '韩愈', '苏轼', '欧阳修', '辛弃疾', '李清照', '陶渊明', '嵇康', '关汉卿', '王实甫', '曹雪芹', '元好问', '李煜', '司马迁', '文天祥'],
  '科学家': ['张衡', '蔡伦', '毕昇', '祖冲之', '沈括', '郭守敬', '宋应星', '徐光启', '黄道婆', '李冰', '李春', '宇文恺', '贾思勰', '郦道元'],
  '医学家': ['华佗', '孙思邈', '李时珍'],
  '艺术家': ['王羲之', '顾恺之', '颜真卿', '赵孟頫'],
  '改革家': ['商鞅', '李悝', '吴起', '王莽', '王安石', '张居正', '康有为', '梁启超', '谭嗣同'],
  '航海·探索': ['郑和', '徐霞客', '玄奘', '马可·波罗']
};
const ROLE_TAG = { '文臣': '政治家', '武将': '军事家' };
const byName = {};
for (const tag in SETS) for (const n of SETS[tag]) (byName[n] = byName[n] || []).push(tag);

const out = [];
for (const o of overview) {
  const f = path.join(root, 'data', 'dynasties', o.id + '.json');
  if (!fs.existsSync(f)) continue;
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const role in (d.talents || {})) {
    for (const p of d.talents[role]) {
      const tags = [];
      if (ROLE_TAG[role]) tags.push(ROLE_TAG[role]);
      for (const tag of (byName[p.n] || [])) if (!tags.includes(tag)) tags.push(tag);
      out.push({ n: p.n, nEn: p.nEn || p.n, note: p.note || '', noteEn: p.noteEn || p.note || '', d: o.id, dn: o.name, dnEn: o.nameEn || o.name, role, tags });
    }
  }
}
fs.writeFileSync(path.join(root, 'data', 'people.json'), JSON.stringify(out) + '\n');
const tagCount = {};
out.forEach(p => p.tags.forEach(tg => tagCount[tg] = (tagCount[tg] || 0) + 1));
console.log('人物索引:', out.length, '｜标签分布:', JSON.stringify(tagCount));
