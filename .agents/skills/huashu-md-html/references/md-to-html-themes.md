# md→html themes — 4套模板的设计哲学与配置详解

> 能力2（md→精美html）的核心设计文档。脚本 `scripts/md_to_html.py` 用 Pandoc + 这4套CSS。

## 总体设计原则

继承自 `huashu-design`：

- **反 AI slop**：不用紫渐变、emoji作图标、圆角+左border accent、SVG画人物
- **配色是出版社品位**：一组克制色 + 单个accent贯穿全场
- **字体有特点**：衬线display + sans body，避免Inter/Roboto打天下
- **一处 120%，其他 80%**：每套模板都有一个签名细节
- **自包含**：单CSS文件，不依赖CDN（除非用户开KaTeX）

## 4套模板速选

| 想做什么 | 选哪个 |
|---------|--------|
| 写一篇深度essay/博客文章 | `article` |
| 做一份技术报告/白皮书/调研 | `report` |
| 把md改成纯阅读模式（公众号回流） | `reading` |
| 做长文档/教程/橙皮书章节（需要导航） | `interactive` |

## 1. article — Tufte 编辑型

### 哲学锚点

- Tufte CSS 启发，但更现代（不离心，居中）
- Pentagram 信息建筑学派的克制
- 衬线为主，et-book / Source Han Serif

### 关键参数

| 项 | 值 |
|----|---|
| 正文字 | et-book / Source Han Serif（衬线） |
| accent | 赤陶橙 #b04a1a |
| 底色 | 象牙白 #fffaf3（暖色调，不刺眼） |
| 行高 | 1.78（中文最舒适区间） |
| 最大宽度 | 720px（单栏黄金宽度） |
| 字号 | 17px（桌面）/ 16px（移动）/ 18px（≥1200px） |

### 签名细节

- h2 上方有一条细水平线（章节分隔的安静方式）
- blockquote 左侧4px赤陶橙竖条 + 浅米底
- hr 用30%宽的细线（不是顶到边的粗黑线）
- 选中文字背景是 oklab 调过的赤陶橙稀释色

### 适合内容

- 1500-5000字的essay
- 思考型/观点型文章
- 单独发布、深度阅读、想读第二遍的内容

### 例子

橙皮书任意章节、花叔的公众号长文、Paul Graham essay 风格内容。

---

## 2. report — 出版社白皮书型

### 哲学锚点

- 信息密度优先，但不堆砌
- 表格友好（这是它的hero element）
- 墨水蓝 + 白底，graphite ink

### 关键参数

| 项 | 值 |
|----|---|
| 正文字 | Inter / IBM Plex Sans（无衬线，干净） |
| accent | 墨水蓝 #1f4ea8 |
| 底色 | 纯白 #ffffff |
| 行高 | 1.7（紧一点，腾空间给数据） |
| 最大宽度 | 820px（要塞表格） |
| 字号 | 16px（桌面）/ 17px（≥1200px） |

### 签名细节

- 表格用2px黑色顶/底线（白皮书风格）
- 偶数行有极淡灰底（提升可读性）
- TOC 双栏布局（节省垂直空间）
- 数字单元格用 `tabular-nums lining-nums` 对齐
- KPI 网格组件（custom class，可在md里用）

### 适合内容

- 技术调研、产品白皮书、benchmark 报告
- 多表格、多数据、需要打印的内容
- 给leadership/客户看的正式文档

### 例子

调研.md（本项目里的调研报告）、AI产品测评、橙皮书的"附录数据"章节。

### 自定义增强：KPI Grid

报告里常需要展示KPI。你可以在md里直接写HTML：

```html
<div class="kpi-grid">
  <div class="kpi">
    <div class="kpi-label">Token压缩</div>
    <div class="kpi-value">80%</div>
    <div class="kpi-delta positive">+74pp vs HTML</div>
  </div>
  <div class="kpi">
    <div class="kpi-label">采用项目</div>
    <div class="kpi-value">60K+</div>
  </div>
</div>
```

CSS会自动给响应式grid+对齐+正负差异色。

---

## 3. reading — Medium 极简阅读型

### 哲学锚点

- 极致克制（每个像素都要 earn its place）
- 单栏窄体、大字号、慷慨留白
- 暖色基调，柔和米色底（不是 Medium 的纯白）
- 中文衬线 display，英文衬线 body

### 关键参数

| 项 | 值 |
|----|---|
| 正文字 | Charter / Iowan Old Style / 思源宋（衬线） |
| display字 | Source Han Serif / Iowan Old Style（标题用） |
| accent | 暖橙 #c75a30 |
| 底色 | 暖米 #fbfaf7 |
| 行高 | 1.85（最舒缓的阅读节奏） |
| 最大宽度 | 680px（最窄，最沉浸） |
| 字号 | 19px（桌面）/ 17px（移动）/ 20px（≥1400px） |

### 签名细节

- hr 是三个点的居中分隔（不是横线）
- 第一段字号比正文大 12%
- blockquote 左侧3px暖橙条 + 衬线斜体
- 链接默认黑色，下划线是暖橙 — 不抢内容
- TOC 默认极简（只在需要时上下用细线分隔）

### 适合内容

- 公众号回流（已发布的文章变本地阅读版）
- 不需要装饰的纯阅读
- 给老板/客户邮件附件用的"看一眼版"
- 任何"想让读者沉浸"的场景

### 例子

把"md生产html消费"这篇文章用 reading 模板渲染，比公众号还好读。

---

## 4. interactive — 长文导航型

### 哲学锚点

- 长文档需要侧边栏导航
- 折叠节（`<details>`）让长内容可收纳
- 桌面：左侧固定TOC + 右侧主内容
- 手机：TOC在顶部，可折叠

### 关键参数

| 项 | 值 |
|----|---|
| 正文字 | Inter + 思源宋（混排） |
| accent | 森林绿 #2c5e3f（去饱和） |
| 底色 | 米白 #fbfaf6 |
| 行高 | 1.8 |
| 主内容宽 | 780px |
| 侧边栏宽 | 280px |
| 字号 | 16px / 17px |

### 签名细节

- 大屏幕（≥1024px）：grid布局，左TOC sticky 跟随滚动
- TOC 用 `::before` 加上"目录"的小标题
- `<details>` 折叠节可点击，summary 前有可旋转的小三角
- h2 自动 scroll-margin-top（避免被sticky header遮）
- 代码块是深底（与文档浅底形成对比，长文档里代码更显眼）

### 适合内容

- 橙皮书长章节、教程、技术参考手册
- 5000字+ 的深度文档
- 需要在多个章节间跳转
- 想配合 `<details>` 收纳"补充阅读"的场景

### 启用方法

```bash
python scripts/md_to_html.py book-chapter.md --theme interactive
# TOC 自动启用，因为 interactive 默认 should_emit_toc=True
```

如果你想让某段内容可折叠，在md里直接写HTML：

```markdown
<details>
<summary>展开看完整数据</summary>

这里是详细数据，可能很长，默认折叠起来。

| 项 | 值 |
|----|---|
| ... | ... |

</details>
```

Pandoc 会保留这段HTML原样，CSS 会自动美化。

---

## 跨模板共享的排版底线

详见 `references/design-tokens.md`，关键是：

- 中英文混排时不加空格（盘古之白禁用，花生偏好）
- 「」引号 + 不过度使用
- 加粗只用于真正的关键句（约10处/文）
- 破折号（——）≤2处/文
- 代码字 JetBrains Mono（其他系列字 fallback）
- 语法高亮用 Pandoc 内置 pygments（不引入JS高亮库）

## 何时该自定义而非用4套

如果你的需求是：

- **演示文稿**（slides）→ 用 `huashu-slides` skill，不是这个
- **PDF**（不是 HTML）→ 用 `huashu-md-to-pdf` 或 `huashu-book-pdf`
- **微信公众号富文本**（不是HTML）→ 用 `huashu-publish` 流程（editor.huasheng.ai）
- **完全自定义视觉**（一次性艺术品）→ 用 `huashu-design`，从设计哲学开始

这4套模板针对的是"反复用、稳定、能打"的文档场景。视觉创作不在范围内。

## 添加第5套模板

如果你想加新模板，结构是：

```
templates/<name>/
├── theme.css         # 必需
└── template.html5    # 可选（pandoc模板，不写就用默认standalone）
```

然后在 `scripts/md_to_html.py` 的 `VALID_THEMES` 元组里加 `<name>`，更新 SKILL.md 的决策树即可。
