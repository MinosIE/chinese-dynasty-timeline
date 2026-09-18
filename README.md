# 中华王朝 · 千年脉络

<div align="center">

一个零依赖、纯静态的中国历史朝代科普网页 · From Xia to Qing, 18 dynasties on one page.

[![GitHub Stars](https://img.shields.io/github/stars/MinosIE/chinese-dynasty-timeline?style=flat&logo=github)](https://github.com/MinosIE/chinese-dynasty-timeline)
[![GitHub Forks](https://img.shields.io/github/forks/MinosIE/chinese-dynasty-timeline?style=flat&logo=github)](https://github.com/MinosIE/chinese-dynasty-timeline/fork)
[![CI](https://img.shields.io/github/actions/workflow/status/MinosIE/chinese-dynasty-timeline/ci.yml?label=CI)](https://github.com/MinosIE/chinese-dynasty-timeline/actions)
[![Last Commit](https://img.shields.io/github/last-commit/MinosIE/chinese-dynasty-timeline)](https://github.com/MinosIE/chinese-dynasty-timeline/commits/main)
[![License](https://img.shields.io/github/license/MinosIE/chinese-dynasty-timeline)](LICENSE)

**[🚀 在线访问 Live Demo](https://MinosIE.github.io/chinese-dynasty-timeline/)**

</div>

![预览图 Preview](https://MinosIE.github.io/chinese-dynasty-timeline/og-cover.png)

> 一页建立「三千年王朝脉络」：概览、帝王世系、核心人才、关键制度，以及「政治 · 经济 · 文化」三维内容。支持明暗双主题、搜索、存续可视化、四大发明、历史大事记与「帝王之最」。零依赖、纯静态，可直接部署到 GitHub Pages 等任意静态托管。

## 📑 目录 / Contents

- [功能 Features](#功能-features)
- [为什么做这个 Why](#为什么做这个-why)
- [在线访问 Live](#在线访问-live)
- [目录结构 Structure](#目录结构-structure)
- [本地预览 Local Preview](#本地预览-local-preview)
- [修改数据后 After Editing Data](#修改数据后-after-editing-data)
- [部署 Deploy](#部署-deploy)
- [许可证 License](#许可证-license)
- [English](#english)

## 功能 Features

- **朝代时间轴**：18 个王朝（含辽、西夏、金），按大时代（上古/先秦/秦汉…）筛选，点击卡片展开详情（首次展开才加载该朝 JSON）。
- **帝王分级**：「千古一帝」（秦始皇、汉武帝、唐太宗、康熙）深红描金卡片；代表性名君金色卡片；悬停标签可看获称理由。
- **三维内容**：每个朝代详情含「政治 / 经济 / 文化」要点。
- **存续一览**：按年代比例的时间跨度条，直观对比各朝长短。
- **四大发明**：造纸、印刷、火药、指南针的朝代、人物与世界影响，可跳转对应朝代。
- **历史大事记**：关键事件时间线，可跳转对应朝代。
- **帝王之最**：在位最长 / 最短、帝王数量最多的朝代。
- **搜索**：按朝代 / 帝王 / 人物 / 制度 / 发明检索并跳转。
- **明暗主题**：右上角切换，记忆偏好，首访跟随系统。
- **中英双语**：左上角一键切换中 / 英（主题切换在右上角），文案与数据全量双语；`?lang=en` 可直达英文。
- **GEO / SEO**：JSON-LD、llms.txt / llms-en.txt、hreflang、robots.txt、sitemap.xml、Open Graph 分享图。

## 为什么做这个 Why

历史课本里的朝代往往是一长串名字，难有「脉络感」。本项目把夏→清 18 朝压缩进一张网页：用时间轴建立时序、用三维内容建立理解、用搜索与跳转建立检索。零依赖、零构建，打开即看，也方便二次开发与教学使用。

## 在线访问 Live

https://MinosIE.github.io/chinese-dynasty-timeline/

## 目录结构 Structure

```
index.html               结构与逻辑（含 SEO/GEO meta）
styles.css               样式（CSS 变量 + 明暗主题）
favicon.svg              站点图标
og-cover.png             分享封面图（1200×630）
data/overview.json       全部王朝概览
data/dynasties/*.json    18 个王朝详情
data/inventions.json     四大发明
data/events.json         历史大事记
data/records.json        帝王之最
data/search.json         搜索索引
llms.txt                 给 LLM 的站点索引（中文）
llms-en.txt              给 LLM 的站点索引（英文）
robots.txt               爬虫规则
sitemap.xml              站点地图
scripts/build-geo.mjs     生成 GEO 文件（llms.txt / llms-en.txt / sitemap.xml）
scripts/build-search.mjs   生成搜索索引
scripts/build-search-en.mjs 为搜索索引增量补充英文
scripts/check-i18n.mjs     校验中英双语数据完整性
scripts/build-records.mjs 生成帝王之最
scripts/validate-data.mjs 校验帝王年份排序
assets/og-source.html      封面图源文件
```

## 本地预览 Local Preview

```bash
python3 -m http.server 8765
# 打开 http://localhost:8765/
```

## 修改数据后 After Editing Data

数据变更后，重新生成派生文件：

```bash
node scripts/build-search.mjs     # 改了王朝/帝王/人才/制度/发明后
node scripts/build-search-en.mjs  # 接着为搜索索引补充英文
node scripts/build-records.mjs    # 改了帝王世系后
node scripts/build-geo.mjs        # 改了概览/新增朝代后
node scripts/check-i18n.mjs       # 校验双语数据完整性（有缺失会报错退出）
```

每个王朝详情在 `data/dynasties/<id>.json`，字段：

```json
{
  "id": "han",
  "name": "汉",
  "years": "前202–220",
  "era": "秦汉",
  "capital": "长安 / 洛阳",
  "feature": "…",
  "summary": "…",
  "emperors": [{ "n": "汉高祖(刘邦)", "rg": "前202–前195", "ry": 7, "note": "…" }],
  "talents": { "文臣": ["萧何"], "武将": ["韩信"] },
  "policies": ["休养生息", "独尊儒术"],
  "aspects": { "政治": ["…"], "经济": ["…"], "文化": ["…"] }
}
```

> 所有展示型文案均附同名 `*En` 英文字段（`nameEn` / `yearsEn` / `summaryEn` / `noteEn` …）；`policiesEn` 为并行数组、`aspectsEn` 为并行对象。英文缺失时英文页自动回退中文。

## 部署 Deploy（GitHub Pages）

1. 仓库 `Settings → Pages → Source: Deploy from a branch → main / (root) → Save`
2. 等待 1–2 分钟即可在 `https://<user>.github.io/chinese-dynasty-timeline/` 访问。

## 许可证 License

基于 [MIT License](LICENSE) 开源 · © 2026 MinosIE。欢迎 Star、Fork 与二次创作。

---

## English

# Chinese Dynasties · A Timeline of Three Millennia

A zero-dependency, static website that visualizes Chinese imperial history from the **Xia to the Qing dynasty** (18 dynasties, including Liao, Western Xia and Jin). Build the "three-millennia context" on a single page: overview, emperors, notable figures, key institutions, and a **Politics · Economy · Culture** tri-axis — with dark/light themes, full-text search, longevity comparison, the Four Great Inventions, a historical events timeline, and "Emperor Records".

**Features**
- Dynasty timeline with era filters and on-demand detail loading
- Emperor tiers (legendary rulers highlighted in gold/crimson)
- Politics / Economy / Culture breakdown per dynasty
- Longevity comparison bars
- Four Great Inventions (paper, printing, gunpowder, compass)
- Historical events timeline
- "Emperor Records" (longest / shortest reign, most emperors)
- Full-text search across dynasties, emperors, people, institutions, inventions
- Light / Dark theme + fully bilingual (中文 / English, `?lang=en`)
- SEO / GEO ready: JSON-LD, llms.txt, hreflang, sitemap.xml, Open Graph

👉 **[Live Demo](https://MinosIE.github.io/chinese-dynasty-timeline/?lang=en)**

This project is released under the [MIT License](LICENSE).
