# design tokens — 排版底线（4套模板共享）

> 这是 huashu-md-html 所有模板必须遵守的视觉底线。每个 theme.css 都基于这套 token 设计，但有自己的 accent 和气质偏好。

## 字体堆栈

### 中文字（serif，文学/出版气质）

```css
--font-serif-zh: "Source Han Serif SC", "Songti SC", "Noto Serif CJK SC", "Source Han Serif", serif;
```

`article` / `reading` / `interactive` 用这个。

### 中文字（sans，技术/报告气质）

```css
--font-sans-zh: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
```

`report` 用这个。

### 英文字（serif，editorial）

```css
--font-serif-en: "et-book", "Source Serif Pro", "Iowan Old Style", "Palatino Linotype", Georgia, serif;
```

`article` 用这个（et-book 是 Tufte CSS 的字体）。

### 英文字（serif，reading-focused）

```css
--font-body-en: "Charter", "Iowan Old Style", "Apple Garamond", Georgia, serif;
```

`reading` 用这个（Charter 是 macOS 内置阅读字体）。

### 英文字（sans）

```css
--font-sans-en: "Inter", "IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif;
```

`report` / `interactive` 的正文用这个。

### 代码字

```css
--font-mono: "JetBrains Mono", "SF Mono", "Fira Code", "IBM Plex Mono", Menlo, Consolas, monospace;
```

所有模板共用。`JetBrains Mono` 字体设计针对代码可读性优化，连字（ligatures）开启。

## 字号

| 用法 | 值 |
|------|---|
| 桌面默认 | 16-17px |
| 移动默认 | 16px |
| 大屏（≥1200px） | 17-18px |
| 阅读模式（reading） | 19px / 17px / 20px |

设置在 `html { font-size: ... }` 上，所有 em 单位自动缩放。

## 行高

| 模板 | 行高 |
|------|------|
| article | 1.78 |
| report | 1.7 |
| reading | 1.85 |
| interactive | 1.8 |

中文需要更大的行高，因为字符更密；英文1.6就够。我们都偏向中文文档，用1.7-1.85区间。

## 最大宽度

| 模板 | 主体宽 | 图片宽 |
|------|------|------|
| article | 720px | 920px |
| report | 820px | 1100px |
| reading | 680px | 1100px（full模式） |
| interactive | 780px | 100% |

**为什么是这些值**：
- 单栏阅读黄金宽度是 60-75 个英文字符宽（约 30-40 个中文字符）
- 720px @ 17px 字号 ≈ 42 个中文字符 / 65 个英文字符——舒适区间
- 报告需要塞表格，所以放宽到820px
- reading 故意做窄到 680px，强迫沉浸

## 颜色

### article — 赤陶橙 + 象牙白

```css
--color-paper: #fffaf3;     /* 暖底 */
--color-ink: #1a1a1a;
--color-accent: #b04a1a;    /* terracotta */
```

### report — 墨水蓝 + 纯白

```css
--color-paper: #ffffff;
--color-ink: #14181f;
--color-accent: #1f4ea8;    /* ink blue */
```

### reading — 暖橙 + 暖米

```css
--color-paper: #fbfaf7;
--color-ink: #2a2a2a;
--color-accent: #c75a30;    /* warm orange */
```

### interactive — 森林绿 + 米白

```css
--color-paper: #fbfaf6;
--color-ink: #1f201d;
--color-accent: #2c5e3f;    /* forest green */
```

## 暗色模式

每套模板都有 `@media (prefers-color-scheme: dark)` 切换。

**暗模式底色禁用**：
- ❌ #0D1117（GitHub dark）— AI slop 之王
- ❌ #000000 纯黑 — 对比度太硬
- ❌ #1a1a2e 紫调暗 — 廉价游戏UI感

**暗模式底色用**：
- ✅ #15-1c 区间的暖中性色（带2-5度色温）
- ✅ 配合稍微调亮的 accent（避免深底配深 accent）

## 间距节奏

```css
--rhythm: 1em - 1.6em;
```

段落间距用 em，让字号缩放时间距按比例变化。

## 标题层级

| 标题 | 字号倍数 | 用法 |
|------|---------|------|
| h1 | 1.9-2.1em | 文档标题，每篇1次 |
| h2 | 1.4-1.6em | 主章节 |
| h3 | 1.15-1.3em | 子章节 |
| h4 | 1.02-1.08em | 段落标题 |
| h5 | 0.85-1em | 小型分类 |
| h6 | 0.78-0.92em | 元信息 |

## 中文排版细节

### 标点挤压（Optical kerning）

未来浏览器会原生支持 `text-spacing-trim`，目前各模板都用了：

```css
text-wrap: pretty;           /* 智能换行（避免悬挂标点）*/
hanging-punctuation: first allow-end last;  /* 标点悬挂 */
```

### 引号

花叔偏好「」，所有模板的字体stack都包含能正确渲染「」的中文字体（思源宋/PingFang）。

### 中英文之间

**不加空格**（盘古之白禁用）。这是花叔明确写过的偏好。

```html
<p>md是这个时代的源代码。</p>
<!-- 不写成： <p>md 是这个时代的源代码。</p> -->
```

### 数字与字母

数字用 `font-variant-numeric: oldstyle-nums` 让数字与中文字体协调（article 模板）；
表格里用 `tabular-nums lining-nums` 让数字对齐（report 模板）。

## 特殊元素

### 代码块底色

```
浅模式：#F6F8FA 系（Apple-像素灰）/ #F4EEDD（暖象牙）/ #F0ECE3（reading暖底）
深模式：#1F2428（中性）/ #25221C（暖深）/ #2A2C25（更暖）
```

不要 `#0D1117`。

### 引用块

```css
border-left: 3-4px solid var(--color-accent);
background: var(--color-paper-soft);
font-style: italic;
```

不要：背景渐变、左border + 圆角卡片、emoji icon 装饰。

### 表格

- thead 顶部 2px 黑线（出版社标志）
- thead 底部 1px
- tbody 行底 1px 浅灰
- 末行 2px 黑线
- 数字列右对齐（`<td class="num">`）

## 黑名单（所有模板永不使用）

| 元素 | 原因 |
|------|------|
| 紫色渐变 background | AI slop 之王 |
| Comic Sans 字体 | 视觉灾难 |
| `#0D1117` 深蓝底 | GitHub dark mode 烂大街 |
| 赛博霓虹（neon-green/cyan/magenta） | 游戏UI风，不是阅读体验 |
| Roboto/Arial 大字号 display | 看不出"有设计"还是"demo页" |
| Emoji 作为正式 icon | 训练语料里"凑数"信号 |
| 圆角卡片 + 左 4px border accent | 2020-2024 Material 烂大街组合 |
| SVG 手画人物/物体 imagery | AI 画的人物永远比例诡异 |
| 阴影堆叠（multiple box-shadow） | 廉价感 |
| 行高 < 1.5 的中文 | 阅读疲劳 |
| 顶到边的密集排版 | 没有气口的设计=没有设计 |

## 加新模板的清单

1. `templates/<name>/theme.css` — 复用上面的 CSS 变量结构
2. 选定 accent（一个，不超过两个）
3. 行高、最大宽度、字号确定
4. 暗模式底色避开禁用清单
5. 在 `scripts/md_to_html.py` 的 `VALID_THEMES` 加上名字
6. 在 `references/md-to-html-themes.md` 加哲学说明
7. 用本项目"md生产html消费"的草稿做端到端测试，截图对比其他模板

最后那一步是质量保证——能跟现有4套放一起不打架，才说明设计成立。
