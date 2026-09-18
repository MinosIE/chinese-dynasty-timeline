# 中华王朝时间轴 · 产品需求文档（PRD）

> 版本：v1.5　|　日期：2026-09-18　|　状态：JSON 化 + 按需加载 + 明暗主题 + 三维内容 + 帝王分级 + 搜索 + GEO

---

## 1. 产品定位

一个**轻量、零依赖、纯静态**的中国历史朝代科普站点。以「时间轴 + 可折叠卡片」的形式，把从夏到清的主要朝代、帝王世系、核心人才与关键制度浓缩在一页之内，帮助普通读者在 5 分钟内建立「三千年王朝脉络」的框架性认知。

- **Slogan**：中华王朝 · 千年脉络
- **一句话**：一张网页，看懂三千年权力、制度与文明的流转。

## 2. 目标用户

| 用户 | 诉求 |
| --- | --- |
| 中学生 / 历史初学者 | 快速建立朝代顺序与关键人物框架 |
| 家长 / 老师 | 给孩子讲历史的入门级可视化素材 |
| 普通国人 | 对「上下五千年」有朴素兴趣但缺乏系统梳理 |
| AI 搜索 / 生成式引擎 | 可结构化抓取的朝代知识（见 §9 GEO） |

## 3. 核心价值

- **一页看全**：把分散的朝代信息整合为单一可滚动时间轴。
- **按需加载**：首页仅加载概览，点开某朝代才拉取该朝详情，首屏更快。
- **可深可浅**：卡片默认折叠为概览，展开即见帝王世系 / 人才 / 制度。
- **明暗双主题**：白天白底、夜间深色，跟随系统并可手动切换。
- **可被 AI 理解**：结构化 JSON 数据 + JSON-LD + llms.txt，利于生成式引擎引用。
- **免费可分享**：部署在 GitHub Pages，任何人都可访问、转发。

## 4. 功能需求

### 4.1 已上线（当前版本）

- **F1 朝代时间轴**：按时间顺序排列节点，左侧彩线串联。
- **F2 大时代筛选**：全部 / 先秦 / 秦汉 / 三国两晋南北朝 / 隋唐 / 宋元 / 明清。
- **F3 概览卡片**：默认展示朝代名、年代、都城、存续年数、特征、一句话总结及「帝王/人才/制度」计数。
- **F4 按需加载详情**：点击卡片才 `fetch` 该朝 `data/dynasties/<id>.json`，带加载态并缓存，二次展开不重复请求。
- **F5 帝王分级高亮**：「千古一帝」（秦始皇、汉武帝、唐太宗、康熙）以深红描金卡片 + 👑 + 标签突显；约 27 位代表性名君以金色卡片 + ★ + 「名君」标签区分。
- **F6 明暗主题**：CSS 变量驱动的 light/dark 双主题，右上角切换，`localStorage` 记忆，首访跟随系统。
- **F7 响应式 & 动效**：移动端适配；`IntersectionObserver` 滚动入场；尊重 `prefers-reduced-motion`。
- **F8 科普免责与图例**：页脚标注数据性质、名君图例与「上下五千年」说明。
- **F9 三维内容**：每个朝代详情含「政治 / 经济 / 文化」三方面要点。
- **F10 搜索**：按朝代 / 帝王 / 人物 / 制度 / 发明检索，点击结果跳转到对应朝代。
- **F11 四大发明专版**：独立板块展示四大发明的朝代、代表人物与世界影响。
- **F12 分享封面图**：Open Graph / Twitter 分享缩略图（1200×630）。
- **F13 无障碍**：卡片展开与称号说明支持键盘（Enter / 空格 / 聚焦）与触屏点击。

### 4.2 规划中（Roadmap / v2+）

- **F14** 顶部朝代存续时长可视化（甘特 / 条形）。
- **F15** 单朝代分享卡片 / 海报导出。
- **F16** 大事件时间标注（安史之乱、靖康之变等）。
- **F17** 多语言（繁体 / 英文）切换。
- **F18** 朝代疆域缩略图 / 关系图谱。

## 5. 信息架构

```
Hero（标题 + KPI：王朝数 / 年数 / 帝王与人才）
  └─ 大时代 Tab 筛选
       └─ 时间轴卡片（概览）── 点击展开 ──→ 按需加载 data/dynasties/<id>.json
            └─ 详情：帝王世系 / 核心人才 / 政策制度 / 总结
  └─ 页脚（图例 + 免责声明）
```

## 6. 数据规范

- **唯一数据源**：`data/overview.json`（概览）+ `data/dynasties/*.json`（各朝详情）。
- **概览字段**：`id,name,years,era,capital,approx,duration,feature,summary,counts{emperors,talents,policies}`。
- **详情字段**：`id,name,years,era,capital,feature,summary,emperors[],talents{},policies[],aspects{政治,经济,文化}`。
- **帝王字段**：`n(名号),t(代际),rg(在位),ry(年数),gh(年号),mt(庙号),sh(谥号),note(备注)`。
- 修改数据后运行 `node scripts/build-geo.mjs` 重新生成 GEO 文件。

## 7. 内容准确性规范（科普红线）

- 页面明确标注「数据为科普概览，细节以权威史料为准」。
- 传说 / 半信史（夏、商部分君主）标注 `approx` 与「信史待考」。
- 并存政权（三国、南北朝等）不简单相加年数，注明「以下年数不相加」。
- 仅作中性历史陈述，不做政治定性。
- 数据可溯源（引用《史记》《资治通鉴》等）。

## 8. 技术架构

- **纯静态、零构建**：无需打包，直接部署。
- **样式**：`styles.css`（CSS 变量 + `[data-theme="dark"]` 暗色覆盖）。
- **脚本**：`index.html` 内联原生 JS；无第三方依赖、无 CDN（原生 `fetch` + `IntersectionObserver`）。
- **HTML**：仅保留 SEO/GEO 的 `<head>` 元信息与语义结构。
- **部署**：GitHub Pages（main 分支根目录）。

```
index.html               # 结构与逻辑（含 SEO/GEO meta）
styles.css               # 样式（明暗主题）
favicon.svg              # 站点图标
og-cover.png             # 分享封面图（1200×630）
data/overview.json       # 全部王朝概览
data/dynasties/*.json    # 15 个王朝详情
data/inventions.json     # 四大发明
data/search.json         # 搜索索引
llms.txt                 # 给 LLM 的站点索引
robots.txt               # 爬虫规则
sitemap.xml              # 站点地图
scripts/build-geo.mjs    # 生成 GEO 文件
scripts/build-search.mjs # 生成搜索索引
scripts/validate-data.mjs# 校验帝王年份排序
assets/og-source.html    # 封面图源文件
```

## 9. GEO（生成式引擎优化）

- **JSON-LD**：运行时由概览注入 schema.org `ItemList`，含每个王朝名称/年代/都城/概述。
- **llms.txt**：站点说明 + 各王朝速览 + 数据入口，便于 LLM 直接引用。
- **robots.txt / sitemap.xml**：放行抓取并声明页面与数据文件。
- **元信息**：`description`、`keywords`、`canonical`、Open Graph、Twitter Card。
- **结构化数据源**：概览/详情均为规范 JSON，机器可直接消费。

## 10. 验收标准

- [x] 桌面 / 移动端布局正常，无横向滚动。
- [x] 概览默认渲染 15 个王朝，计数与 KPI 正确。
- [x] 点击卡片才请求对应 `data/dynasties/<id>.json`（Network 可见），并有加载态。
- [x] 名君高亮生效，普通帝王正常。
- [x] 明暗主题切换正常且记忆偏好。
- [x] JSON-LD 注入 `ItemList`（15 项），无控制台报错。
- [x] `prefers-reduced-motion` 下无动画且内容可见。
- [ ] 部署后公网可访问（Pages 待启用）。

## 11. 部署（GitHub Pages）

- **仓库**：`github.com/MinosIE/chinese-dynasty-timeline`
- **分支**：`main`；根目录 `index.html`
- **启用**：仓库 `Settings → Pages → Source: Deploy from a branch → main / (root)` → Save
- **访问地址**：`https://MinosIE.github.io/chinese-dynasty-timeline/`

## 12. 迭代路线图

| 版本 | 内容 |
| --- | --- |
| v1.0 | MVP 上线（单文件） |
| v1.1 | 名君高亮区分 |
| v1.2（当前） | 数据 JSON 化 + 按需加载 + 明暗主题 + GEO |
| v2.0 | 搜索 + 存续时长可视化 + 大事件标注 |
| v3.0 | 多语言 + 社区共建数据 + 互动测验 |
