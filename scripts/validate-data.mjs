// 校验各朝代帝王在位年份是否按时序排列
import fs from 'fs';

function toNum(tok) {
  tok = tok.replace(/^约/, '').trim();
  if (tok.startsWith('公元')) return +tok.slice(2);
  if (tok.startsWith('前')) return -(+tok.slice(1));
  return +tok;
}
function startYear(rg) {
  const parts = rg.replace(/^约/, '').split(/[–\-~→]/);
  return toNum(parts[0]);
}

const files = fs.readdirSync('data/dynasties');
let issues = 0;
for (const f of files) {
  const d = JSON.parse(fs.readFileSync('data/dynasties/' + f, 'utf8'));
  let prev = -Infinity, prevName = '';
  for (const e of d.emperors) {
    const y = startYear(e.rg);
    if (isNaN(y)) { console.log(`[无法解析] ${d.name} ${e.n} rg=${e.rg}`); continue; }
    if (y < prev) { console.log(`[乱序] ${d.name}: ${prevName}(${prev}) -> ${e.n}(${y})`); issues++; }
    prev = y; prevName = e.n;
  }
}
console.log(`\n共发现 ${issues} 处乱序`);
