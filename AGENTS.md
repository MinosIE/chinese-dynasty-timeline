# AGENTS.md

> 面向 AI Agent 的项目开发指南。最后更新：2026-09-18 · 适用分支：`main`（GitHub Pages 部署分支）
> 维护约定：改动架构 / 数据字段 / i18n 约定 / 脚本流水线后，必须同步更新本文件对应小节。

## 0. 快速上手（30 秒版）

- **项目一句话**：中国历史朝代科普静态站（夏→清 18 朝），一页看帝王世系 / 人才 / 制度 / 大事记，中英双语、零依赖、零构建。
- **技术栈**：纯静态 HTML + CSS + 原生 JS（无框架 / 无打包 / 无第三方依赖）；Node.js ≥ 20 仅用于构建期 `.mjs` 脚本；数据为 JSON。
- **本地预览**：`python3 -m http.server 8765` → 打开 `http://localhost:8765/`
- **改动数据后必跑**（顺序不可颠倒）：
  ```bash
  node scripts/build-search.mjs     # 重建搜索索引（会重置英文）
  node scripts/build-search-en.mjs  # 补回英文（必须紧跟上一条）
  node scripts/build-records.mjs    # 重建帝王之最（含英文）
  node scripts/build-geo.mjs        # 重建 llms.txt / llms-en.txt / robots.txt / sitemap.xml
  node scripts/build-llms-full.mjs  # 重建 llms-full.txt / llms-full-en.txt（整站全文，供 GEO）
  node scripts/check-i18n.mjs       # 双语完整性校验（缺失即失败）
  ```
- **改代码前必读**：[§3 AI Agent 开发指导](#3-ai-agent-开发指导-最高优先级)（尤其 3.2 禁止项 与 3.3 联动表）。

---

## 1. 项目全局认知

### 1.1 项目目标与定位

| 项 | 内容 |
|---|---|
| 定位 | 轻量、零依赖、纯静态的中国历史朝代科普站 |
| 用户 | 中学生 / 家长老师 / 普通读者；以及 AI 搜索引擎（GEO） |
| 核心价值 | 一页建立「三千年王朝脉络」；结构化 JSON + JSON-LD + llms.txt 利于机器引用 |
| 非目标 | 不做学术考据、不做后端 / 账号 / 数据库、不引入构建工具 |

### 1.2 整体架构（目录地图）

```
index.html              # 唯一页面：DOM 结构 + 全部内联 JS（约 670 行，见 3.2）
styles.css              # 全部样式：CSS 变量 + [data-theme="dark"] 覆盖（约 310 行）
.nojekyll               # 空文件：跳过 GitHub Pages 的 Jekyll 处理（勿删）
favicon.svg             # 站点图标
og-cover.jpg            # 分享封面 1200×630（JPEG 压缩，约 50KB）
assets/og-source.html   # 封面图 HTML 源文件（手工截图用，不参与构建）
data/
  overview.json         # ★源：18 朝概览 + start/end + counts（驱动 JS-LD / KPI / 存续图）
  dynasties/*.json      # ★源：18 朝详情（帝王 / 人才 / 制度 / 三维）
  events.json           # ★源：大事记（32 条）
  inventions.json       # ★源：四大发明
  records.json          # ⚙派生：帝王之最（build-records.mjs 生成，勿手改）
  search.json           # ⚙派生：搜索索引 467 条（build-search*.mjs 生成，勿手改）
scripts/                # Node ESM 构建期脚本（见 1.4 表）
.github/workflows/ci.yml# CI：重生成派生文件 + 校验一致性
llms.txt / llms-en.txt  # ⚙派生：GEO 索引（build-geo.mjs 生成）
llms-full.txt / llms-full-en.txt  # ⚙派生：GEO 全文（build-llms-full.mjs 生成，整站结构化数据纯文本）
robots.txt / sitemap.xml# ⚙派生：build-geo.mjs 生成
PRD.md / README.md      # 产品需求 / 使用说明（人类文档，勿与 AGENTS.md 重复维护）
```

★源 = 手工维护的唯一事实来源；⚙派生 = 由脚本生成，禁止手改（会被覆盖）。

### 1.3 技术栈与关键机制

| 项 | 说明 |
|---|---|
| 语言 / 运行 | 浏览器原生 ES2020+；`fetch` + `IntersectionObserver` + `ResizeObserver` + SVG（无 polyfill） |
| 样式 | CSS 自定义属性；主题靠 `document.documentElement[data-theme]` 切换，`--surface/--text/--brand` 等在 `:root` 与 `[data-theme="dark"]` 双份定义 |
| 主题决定顺序 | `localStorage.theme` → `prefers-color-scheme`（head 内联脚本先跑，避免闪烁） |
| 语言决定顺序 | URL `?lang=` → `localStorage.lang` → `navigator.language`（head 内联脚本；`?lang=en` 会写回 localStorage） |
| 数据加载 | 首屏只取 `data/overview.json`；点开某朝代才 `fetch data/dynasties/<id>.json` 并缓存进 `cache[id]` |
| 部署 | GitHub Pages，`main` 分支根目录，地址 `https://MinosIE.github.io/chinese-dynasty-timeline/` |

### 1.4 核心模块职责

| 模块 | 路径 | 负责 | 不负责 |
|---|---|---|---|
| 页面与逻辑 | `index.html` | DOM 结构、I18N 词表、全部渲染与交互函数 | 具体数值内容（全在 `data/`） |
| 样式 | `styles.css` | 布局、主题变量、组件样式 | 任何内容 / 文案 |
| 概览数据 | `data/overview.json` | 朝代表、年代、`start/end`、`counts` | 帝王明细（在详情文件） |
| 详情数据 | `data/dynasties/*.json` | 帝王世系 / 人才 / 制度 / 三维 | 页面结构 |
| 派生生成 | `scripts/build-*.mjs` | 由源数据生成 `search/records/geo` 派生文件 | 修订源数据内容 |
| 校验 | `scripts/check-i18n.mjs`、`scripts/validate-data.mjs` | 双语完整性 / 帝王年份时序 | 自动修复数据 |
| CI | `.github/workflows/ci.yml` | 重生成 + 校验 + 派生文件一致性 | 部署（Pages 由仓库设置负责） |

### 1.5 数据流 / 关键链路

```
页面加载
  └─ init()
       ├─ fetch data/overview.json ──→ overview[]
       ├─ renderKpis() / renderTabs() / render() / renderSpan()   ← 依赖 overview
       ├─ injectJsonLd()                                          ← 运行时注入 ItemList
       ├─ fetch inventions.json → renderInventions()
       ├─ fetch events.json     → renderEvents() → drawEvTimeline()  ← SVG 连线
       ├─ fetch records.json    → renderRecords()
       └─ location.hash `#<dynastyId>` → switchModule('m-timeline') + 自动展开该朝

点击朝代卡（.chead）
  └─ loadDetail(id) ── cache[id]? ──→ fetch data/dynasties/<id>.json → cache → buildDetail()

切换语言 setLang(next)
  └─ applyStaticLang()（data-i18n 静态节点）+ rerenderTranslatable()（KPI/Tabs/时间轴/存续/发明/大事记/帝王之最）

搜索
  └─ ensureSearch() → fetch data/search.json → runSearch(q) → 点击结果 jumpToDynasty()
```

### 1.6 关键设计原则（真实约束）

1. **文案一律走 i18n**：静态节点用 `data-i18n="key"` + `t('key')`；数据字段用 `L(o,'k')`（en 模式取 `k+'En'`）。**禁止在 HTML/JS 里硬编码可见文案或数字**。
2. **数据双语成对**：任何展示型字段必须同时有中文与 `*En` 版本（缺失会被 `check-i18n.mjs` 判失败）。
3. **派生文件不可手改**：`data/search.json`、`data/records.json`、`llms*.txt`、`robots.txt`、`sitemap.xml` 均由脚本生成。
4. **零依赖**：不新增 npm 包、不加 CDN、不引入构建步骤（Page 直接部署根目录）。
5. **颜色只走 CSS 变量**：新增配色加入 `:root` 与暗色两处，勿在组件里写死十六进制（`index.html` 中的 `ERA_COLORS` 等为数据驱动图例色，属例外）。

---

## 2. 开发规则

### 2.1 代码组织

- 页面结构、文案、逻辑**全部**在 `index.html`（无外链 JS 文件）。新增渲染逻辑：写 `renderXxx()` 顶层函数，在 `init()` 与 `rerenderTranslatable()` 两处按需挂接。
- 样式全部在 `styles.css`，按 `/* 分区名 */` 注释归位（现有分区见文件内 `/* hero */`…`/* 返回顶部 */`）。
- 一次性 / 数据处理脚本放 `scripts/*.mjs`，用 ESM + `node:fs`。

### 2.2 命名规范

| 对象 | 约定 | 示例 |
|---|---|---|
| 数据字段（中文） | 全拼/缩写短名 | `n`(名号) `t`(代际) `rg`(在位) `ry`(年数) `gh/mt/sh`(年号/庙号/谥号) `note` |
| 英文副本 | 原字段名 + `En` | `nEn` `rgEn` `noteEn` `policiesEn` `aspectsEn` |
| 搜索索引字段 | `d/dn/t/n/x` + `nEn/xEn/dnEn` | 见 `scripts/build-search-en.mjs` |
| DOM id | 语义化小驼峰 / 短横线 | `evList`、`searchResults`、`m-timeline` |
| JS 函数 | 动词开头小驼峰 | `renderKpis` `buildDetail` `loadDetail` `drawEvTimeline` `switchModule` |
| i18n key | 小驼峰，zh/en 词表键必须完全一致 | `kpiYearsV`、`entry.events.d` |

### 2.3 文件结构约定（`index.html`）

顺序固定，勿随意移动：`<head>`（SEO/GEO meta + hreflang + 两个防闪烁内联脚本）→ `.wrap`（hero → 搜索 → 吸顶导航 `#modNav` → 各 `.module` 区块 → 页脚）→ `<script>`（`I18N` 词表 → 常量 → 工具函数 `t()`/`L()` → 各渲染函数 → 搜索 → `init()` 调用）。

### 2.4 模块拆分原则

- 出现第 2 处同类渲染逻辑 → 抽 `renderXxx(list)` 顶层函数。
- 需要被 `rerenderTranslatable()` 复用的数据 → 用**模块级 `let`** 缓存（现有：`invData`/`evData`/`recData`/`searchIndex`/`cache`）。
- 单文件 670 行已接近上限；**新增大型模块前先与用户确认是否拆分**（拆分需引入 `<script type="module">`，会改变现有零构建约定）。

### 2.5 数据模型规范

- 源字段结构（以 `han.json` 为准）：
  - 详情顶层：`id,name,nameEn,years,yearsEn,era,capital,capitalEn,feature,featureEn,summary,summaryEn,emperors,talents,policies,policiesEn,aspects,aspectsEn`
  - 帝王：`n,nEn,t,tEn,rg,rgEn,ry,mt,mtEn,sh,shEn,note,noteEn`（`ry` 为整数年）
  - 短在位精度（可选，仅在有明确史料时补）：`rd`（天数）/ `rm`（月数）；供「帝王之最 · 在位最短」与详情页显示真实时长，展示一律带「约」
  - ⚠️ `ry` 是「纪年包含年数」口径（如汉高祖 前202–前195 跨度 7，`ry=8`），与 `rg` 跨度天然可能差 1（全站 58 处，**不是错误**）。补 `rd`/`rm` 必须按**真实起止月**独立计算，**不可用 `ry` 推算**
  - 人才：`talents[role][] = {n,nEn,note,noteEn}`，`role ∈ 文臣|武将|思想·文人|其他`
  - 制度：`policies[]` 与 `policiesEn[]` **等长并行**；三维：`aspects{政治,经济,文化}` 与 `aspectsEn` **同键等长**
  - 概览：`id,name,nameEn,years,yearsEn,era,capital,capitalEn,approx,start,end,duration,durationEn,feature,featureEn,summary,summaryEn,counts{emperors,talents,policies}`
  - 大事记：`{y,t,tEn,d,x,xEn}`（`y` 负数=公元前，`d`=朝代 id）
  - 发明：`{id,name,nameEn,emoji,era,eraEn,dynastyLabel,dynastyLabelEn,dynastyId,person,personEn,desc,descEn,world,worldEn}`
- `era` 取值为 `先秦|秦汉|三国两晋南北朝|隋唐|宋元|明清`，同时是 `ERA_COLORS` / `I18N.era` 的键；**新增 era 必须同时更新** `index.html` 的 `ERAS`、`ERA_COLORS`、`I18N.zh.era`、`I18N.en.era` 与 `renderEvents` 里的 `ORDER`。

### 2.6 错误处理

- 数据请求用 `try/catch` 包裹并降级：详情失败渲染 `t('loadFail')`；`ensureSearch` 失败置空数组（见 1.5 链路对应函数）。
- 无全局错误上报；**禁止** `console.error` 作为唯一处理手段。

### 2.7 日志规范

- 浏览器侧：默认静默，问题用 DevTools 排查。保持控制台零 error/warn（当前为 0，回归时勿引入）。
- 脚本侧：`console.log` 输出统计摘要（如 `build-geo.mjs` 打印生成文件与朝代数），失败用 `console.error` + `process.exit(1)`（见 `check-i18n.mjs`）。

### 2.8 测试要求

- 本项目**无测试框架**。等价校验手段：
  - `node scripts/check-i18n.mjs` — 双语数据完整性（**必须通过**）
  - `node scripts/validate-data.mjs` — 帝王年份时序（**信息性**，见 3.7）
  - `node scripts/build-*.mjs` 后 `git diff --exit-code -- data llms.txt llms-en.txt llms-full.txt llms-full-en.txt robots.txt sitemap.xml` — 派生文件一致性
- 改动了渲染逻辑 → 用浏览器实际打开对应模块确认（本项目配置了 chrome-devtools MCP 可用于截图 / 控制台检查）。

---

## 3. AI Agent 开发指导 ★最高优先级★

### 3.1 改动前必须了解

1. 数据属于**源**还是**派生**（1.2 表）。改派生文件 = 白改。
2. 该字段是否出现在页面上 → 若是，必须有 `*En` 版本。
3. 改动是否触及 `index.html` 中以**中文名为键**的常量（见 3.3）：这些用 `Set`/对象字面量按中文原文匹配，改数据里的名字会静默失配。
4. 本次改动是否需要重跑派生流水线（0 节命令）。

### 3.2 禁止随意修改（含原因）

| 禁止项 | 原因 |
|---|---|
| **运行 `scripts/update-overview.mjs`** | 它会用白名单 `norm()` 重建 `overview.json`，**丢弃 `nameEn/yearsEn/capitalEn/durationEn/featureEn/summaryEn`**（已验证）。若确需运行，先改造该脚本使其保留 `*En`。 |
| 单独运行 `build-search.mjs` 后提交 | 它会**重置** `search.json` 丢掉英文；必须紧接着 `build-search-en.mjs`。 |
| 手改 `data/search.json` / `data/records.json` / `llms*.txt` / `robots.txt` / `sitemap.xml` | ⚙派生文件，下次生成即被覆盖。 |
| 手改 `og-cover.jpg` | 由 `assets/og-source.html` 截图产出；改图请改源文件后导出为 JPEG 以控制体积。 |
| 在 `index.html` 里硬编码可见文案 / 数字 | 会绕过 i18n，导致英文模式出现中文（如历史 bug「约4000」，见 3.4）。 |
| 引入 npm 依赖 / CDN / 构建工具 | 违背零依赖零构建约定，会破坏 Pages 直接部署。 |
| 删除 `data/dynasties/<id>.json` 而不同步删 `overview.json` 条目 | `build-search.mjs` 会按 `overview` 逐个读详情文件，缺文件直接抛错。 |

### 3.3 强依赖关系（改动联动表）

**单点改动**

| 改什么 | 只改这里 |
|---|---|
| 主题色 / 间距 / 圆角 | `styles.css` 的 `:root` 与 `[data-theme="dark"]`（两处一起） |
| 界面文案 / 按钮 | `index.html` 的 `I18N.zh` 与 `I18N.en`（**两处一起**） |
| 朝代表 / 年代 / counts | `data/overview.json` + `data/dynasties/<id>.json` |

**跨文件改动（漏一处即出错）**

| 场景 | 必须同改 | 漏掉的后果 |
|---|---|---|
| **新增 / 删改一个朝代** | ① `data/dynasties/<id>.json`（含 `*En`）② `data/overview.json`（含 `*En`，且 `counts` 必须存在）③ 跑 build-search → build-search-en → build-records → build-geo ④ 若为并存政权，检查 `scripts/update-overview.mjs` 的 `SPAN/ORDER`（仅作参考，勿运行） | `overview` 缺条目→该朝不显示；缺 `counts`→`renderKpis()` 抛 `Cannot read properties of undefined (reading 'emperors')`（**真实发生过**） |
| **改某帝王的 `n`（名号）** | ① 详情数据 ② `index.html` 的 `STAR` / `LEGEND`（按中文名匹配）③ 详情里的 `LEGEND_DYNASTIES` 不受影响 ④ 重跑 `build-records.mjs`（帝王之最）与 `build-search*.mjs` | 名君高亮失效、帝王之最英文名不同步 |
| **给某帝王补短在位精度 `rd` / `rm`** | ① 详情数据 ② 重跑 `build-records.mjs` | 帝王之最「在位最短」仍按整数年并列，排名退化为数组顺序 |
| **新增一个人才角色** | ① 数据 `talents[新role]` ② `index.html` 的 `ROLE_EN` 与 `ROLE_COLORS`（否则英文显示中文键 / 无色） | 英文模式角色名回落为中文；圆点无色 |
| **新增一个 `aspects` 维度** | ① 数据 `aspects` + `aspectsEn` ② `index.html` 的 `ASPECT_EN`、`ASPECT_ORDER`、`ASPECT_COLORS` | 维度不渲染或被过滤掉 |
| **新增 era（大时代）** | ① `index.html` 的 `ERAS`、`ERA_COLORS`、`I18N.zh.era`、`I18N.en.era`、`renderEvents` 的 `ORDER`（共 5 处）② 详情/概览数据的 `era` 值 | Tab 与大事记分组缺该时代 |
| **改数据字段名 / 增加新展示字段** | ① 数据（中 + `En`）② `index.html` 取词处 `L(o,'k')` ③ `scripts/check-i18n.mjs` 的字段白名单 ④ 若进搜索：`scripts/build-search.mjs` + `build-search-en.mjs` 映射 | `check-i18n` 漏检或误报；英文缺失静默回落中文 |
| **改 `data/overview.json`** | 必须重跑 `build-geo.mjs`（llms/sitemap 依赖它）与 `build-records.mjs`（`counts.emperors`） | CI 的 `git diff --exit-code` 失败 |

### 3.4 常见错误模式（真实踩坑）

| 现象 | 根因 | 正确做法 |
|---|---|---|
| 首屏报 `Cannot read properties of undefined (reading 'emperors')`（`renderKpis`） | `overview.json` 条目缺 `counts`（重写数据时被丢） | 保证每条 overview 有 `counts{emperors,talents,policies}`；可用 `scripts/fix-overview-counts.mjs` 从详情重建 |
| 英文模式混入中文数字/文案 | 硬编码，未走 `t()`/`L()` | 数字与文案都进 `I18N`（如 `kpiYearsV`） |
| 中文模式出现英文标签（"Civil Officials"/"Politics"） | 无条件使用 `ROLE_EN[role]` / `ASPECT_EN[k]` | 必须 `lang==='en' ? EN : 中文键` |
| `records.json` 英文被清空 | 运行 `build-records.mjs` 而脚本未产出 `*En` | 脚本已支持产出 `nameEn/rgEn/dynastyEn`；改字段时同步维护 |
| 帝王之最「在位最短」6 人全显示「1 年」 | `ry` 是整数年，12 位短在位者并列，取前 6 = 数组顺序 | 短在位者补 `rd`/`rm`，榜单按 `monthsOf()`（`rd/30` → `rm` → `ry×12`）排序 |
| 帝王之最把传说纪年排在信史之前却无说明 | 夏商周多带「约」年，与信史混排 | 条目带 `approx`（`rg` 含「约」或 `note` 含「岁余/不足/存疑/待考/传说/争议」）→ 渲染「约」徽标 + 卡片脚注 |
| 大事记连线穿过卡片文字 / 与年份标签重叠 | 走线未落在标签高度带或未走行间隙 | 连线节点取 `.ev-year` 中心；换行在「上行卡片底 + 下行卡片顶」之间走；年份标签 `z-index:2` 压线，箭头须从标签**右缘**起画（否则被标签遮住） |
| 大事记连线顺序倒序 | 行方向交替时按 DOM 顺序取值 | 每行一律按 x 升序（时间正序）；行间连接只做「右→左」一次（见 `drawEvTimeline`） |
| CI 失败在 `git diff --exit-code` | 改了源数据但没重跑派生脚本 | 按 0 节顺序重跑全部 `build-*.mjs` 后再提交 |

### 3.5 推荐开发流程

1. **定位**：改的是源数据、派生文件、还是 `index.html` 逻辑？对照 1.2 / 3.3。
2. **改动**：遵循 2.2–2.5；一切可见文案走 i18n。
3. **生成**：若触及 `overview.json` / `dynasties/*.json` / `inventions.json` → 跑 0 节流水线。
4. **校验**：`node scripts/check-i18n.mjs` 必须通过；必要时浏览器实开对应模块。
5. **提交**：小改动（样式 / 文案 / 颜色 / 位置微调）可直接 commit + push（本项目已授权自动部署）；结构性改动先向用户确认方案。
6. **同步文档**：架构 / 字段 / 约定变化 → 更新本文件对应小节与第 6 节。

### 3.6 Debug 排查顺序

1. **控制台**：项目要求零 error/warn，任何报错优先看 `index.html` 行号与调用栈（渲染函数集中在 300–600 行）。
2. **数据**：`fetch` 是否 404 / JSON 是否合法（`node -e "JSON.parse(require('fs').readFileSync('<f>','utf8'))"`）。
3. **派生链路**：先跑 `check-i18n.mjs`，再跑对应 `build-*.mjs` 看是否覆盖了你手改的内容。
4. **布局**：CSS 变量在 `:root` 与暗色两处是否都定义了；`styles.css` 分区注释定位。
5. **交互**：模块显示依赖 `.module.active`（`switchModule`）；懒加载依赖 `container.dataset.loaded` 与 `cache[id]`。

### 3.7 如何避免破坏已有功能（回归清单）

- [ ] `node scripts/check-i18n.mjs` 通过（英文无缺失）。
- [ ] 重跑全部 `build-*.mjs` 后 `git diff --exit-code -- data llms.txt llms-en.txt llms-full.txt llms-full-en.txt robots.txt sitemap.xml` 为空。
- [ ] 浏览器控制台**零** error / warn。
- [ ] 中英双语各看一遍：措辞无残留、数字单位正确（`约4000` / `~4000`）。
- [ ] 明暗主题切换正常，`localStorage` 记忆生效。
- [ ] 6 个模块（概览 / 朝代时间轴 / 存续一览 / 四大发明 / 大事记 / 帝王之最）均可切换且渲染。
- [ ] 点朝代卡可懒加载详情；`#<id>` 深链可直达并展开。
- [ ] 关于 `validate-data.mjs`：三国（魏/蜀/吴）与南北朝（宋齐梁陈/北魏等）按政权分组列出，会报 3 处「乱序」，**属正常**，不要为此改数据。

---

## 4. 文档索引

| 文档 | 路径 | 用途 | 重要度 | 何时查看 |
|---|---|---|---|---|
| 本文件 | `AGENTS.md` | Agent 改本仓库的操作手册 | 🔴必读 | 每次改动前 |
| 产品需求 | `PRD.md` | 功能清单（F1–F24）、数据规范、验收标准、路线图 | 🟡常用 | 改功能 / 定方案 / 查路线图 |
| 使用说明 | `README.md` | 功能概览、目录结构、构建命令、字段示例 | 🟡常用 | 上手 / 对外说明 |
| GEO 索引 | `llms.txt`、`llms-en.txt`、`llms-full.txt`、`llms-full-en.txt` | 给 LLM 的站点索引（⚙派生） | 🟢参考 | 调整 GEO 输出时（改 `build-geo.mjs` / `build-llms-full.mjs`） |
| 站点地图 | `sitemap.xml`、`robots.txt` | 爬虫（⚙派生） | 🟢参考 | 同上 |
| 封面源 | `assets/og-source.html` | 分享图源文件 | 🟢参考 | 重做分享图时 |

**快捷路由**

- 架构 / 目录职责 → 本文件 §1.2、§1.4
- 数据字段 / 新增朝代 → 本文件 §2.5；`PRD.md` §6
- 构建 / 派生流水线 → 本文件 §0、§1.4
- 部署 / 环境 → `README.md`「部署」；`PRD.md` §11
- 业务规则 / 功能范围 → `PRD.md` §4
- GEO / SEO → `PRD.md` §9；`scripts/build-geo.mjs`

---

## 5. 当前项目状态

### 5.1 已完成

18 朝数据（含辽/西夏/金）· 模块化布局（概览首页 + 吸顶导航 + 6 分区）· 按需加载详情 · 帝王分级高亮（👑千古一帝 / ★名君）· 明暗主题 · 搜索（467 条，含英文）· 存续一览 · 四大发明 · 历史大事记（横向蛇形时间线，年份为节点 + 末端箭头）· 帝王之最 · 中英双语（含 `?lang=en`）· 双语 GEO（llms / hreflang / og:locale:alternate）· JSON-LD · CI · 可见度与体验优化（README 优化 + MIT LICENSE · GEO 全文 llms-full · sitemap 全文入口 · 移动端 KPI 与帝王之最单列 · og-cover 压缩为 JPEG · .gitignore · F20 单朝代分享卡片（Canvas 导出 PNG，零依赖））。

### 5.2 开发中

无。

### 5.3 未完成计划（见 `PRD.md` §4.2）

F21 繁体中文（zh-Hant）· F22 疆域缩略图 / 关系图谱 · F23 世界史横向对照 · F24 人物卡片。

### 5.4 技术债务

| 位置 | 问题 | 影响 |
|---|---|---|
| `scripts/update-overview.mjs` | 与新数据模型不兼容：`norm()` 白名单会丢弃全部 `*En` | **高危陷阱**，运行即破坏 overview 英文 |
| `scripts/fix-overview-counts.mjs` | 一次性修复脚本残留 | 冗余；可删除或并入 `validate-data.mjs` |
| `index.html` | 单文件 670 行内联 JS，无模块化、无测试 | 大改动风险高，diff 噪声大 |
| `og-cover.png`→`og-cover.jpg` | 已由 PNG(730KB) 转 JPEG(约 50KB) | 分享图加载已优化（已解决） |
| 仓库根 | 已新增 `.gitignore` | 已解决（忽略本地截图 / 临时文件） |
| `scripts/validate-data.mjs` | 不阻断（三国/南北朝分组列出致误报） | 只能人工判读 |
| `data/dynasties/*.json` | 长在位帝王仍只有整数年 `ry`（年粒度误差 < 2%，故未补）；`ry ≤ 3` 的 37 位中已补 33 位 `rd`/`rm`，余 4 位（商外丙、周武王、周釐王、周悼王）无月份史料 | 「在位最长」仍是年粒度；「最短」已到月 / 日 |
| `data/dynasties/*.json` | `ry`（纪年包含年数）与 `rg` 跨度有 58 处差 1，属口径差异而非错误；明英宗两次在位已改为 `1435–1449 / 1457–1464` | 若按 `rg` 跨度重算 `ry` 会连锁改变存续年数 / KPI，风险高 |

### 5.5 已知问题

无已知线上问题。控制台当前零 error / warn。

### 5.6 后续规划

以 `PRD.md` §4.2（F20–F24）与 §12 为准。

---

## 6. 变更记录（本文件）

- 2026-09-18：首次生成。基于当日仓库快照（`main` @ `d5a205f`）梳理架构、数据模型、i18n 约定、派生流水线、CI 与真实踩坑清单。
- 2026-09-18：帝王之最改为「月/日」精度口径（新增可选字段 `rd`/`rm`、`approx` 存疑标记、卡片口径脚注）；补充 §2.5 字段、§3.3/§3.4 联动与踩坑、§5.4 技术债。
- 2026-09-18：按通行年表补齐 `ry ≤ 3` 的短在位者精度（37 位中 33 位）；详情页同步显示月 / 日；修正明英宗两次在位的 `rg`；新增 `ry` 口径警告（§2.5）。
