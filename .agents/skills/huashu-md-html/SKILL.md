---
name: huashu-md-html
description: 花叔的「md/html/docx 多向流水线」skill，四个能力 + 两种模式：(1) 用Microsoft markitdown把任意文件（PDF/DOCX/PPTX/XLSX/HTML/图片/音频/YouTube/EPub/ZIP）转成干净的md；(2) 用Pandoc + 4套精挑模板把md加工成出色的html——**兜底模式**（不耗token，pandoc 一键套版）+ **视觉艺术设计师模式**（AI 读懂内容、推荐 3 个差异化方向、为内容定制视觉表达），继承huashu-design的反AI slop审美；(3) 用html-to-markdown + trafilatura把html或URL无损转回md；(4) 用python-docx把md加工成出版社级docx（专业排版+自动嵌图+封面目录页眉页脚，专用于纸质书审校/投稿/出版交付）。落地花叔的「md生产，多端消费」方法论。触发词：md转html、html转md、pdf转md、docx转md、pptx转md、xlsx转md、文件转md、URL转md、文档转md、转markdown、做html、生成html、网页转md、import文档、导入md、导出html、md to html、html to md、any to md、md转docx、md to docx、生成docx、做word文档、出版社审校、投稿、纸质书、出版稿、交付docx、book、出色的html、定制html设计、做个好看的网页、设计师模式、几种风格、推荐设计方向、markitdown、pandoc、python-docx。即使用户只是说「这个PDF变md」「这篇md做成网页」「这个网页存下来」「把这些md做成可投稿的word」「给出版社一份审校稿」「给这个md做个出色的html」「让我看看几种风格」也应触发。
---

# huashu-md-html

> 你不再需要亲手编辑产物。md 是源代码，html / docx 是产物。这个 skill 把多端的最优解打通成一条流水线。

## 四个能力（决策树）

| 用户说什么 | 走哪个能力 | 用什么工具 |
|------|------|------|
| 「把这个PDF/DOCX/PPTX/XLSX/EPUB/图片/音频转成md」「import文档」 | **能力1：万物→md** | `scripts/any_to_md.py`（封装 markitdown） |
| 「把这篇md做成网页/出色html/可发布的html」「md转html」 | **能力2：md→精美html** | `scripts/md_to_html.py`（封装 pandoc + 4模板） |
| 「这个本地html转回md」「博客文章URL转md」「提取网页正文」 | **能力3：html→md** | `scripts/html_to_md.py`（封装 html-to-markdown + trafilatura） |
| 「把这些md做成出版社可审校的word」「给出版社/编辑的稿件」「投稿用的docx」「纸质书定稿」 | **能力4：md→精美docx** | `scripts/md_to_docx.py`（封装 python-docx + 专业排版） |
| 「这个产品页/技术文档URL转md」「带metadata一起拿」 | **能力1：万物→md**（也吃URL） | `scripts/any_to_md.py` |

**决策原则**：
- 能力1产出的md可以直接喂给能力2组成一条龙（如「PDF→精美阅读html」）
- 能力3用于反向归档（如「把已发布的html博客文章存回项目源」）
- **能力4是出版终点**——给人类编辑/出版社审校时用 docx，不要直接给 html 或 md，专业出版生态默认 docx

### URL 场景的进一步分流（2026-05 实测发现）

URL 输入时**两条路径都能跑**，但产出质量差异巨大。Microsoft Learn 证书页实测：能力1（markitdown）192行，含完整 YAML frontmatter、证书全名、所有结构化字段值、标题层级、链接保留；能力3（trafilatura+html-to-markdown）87行，丢失证书名/字段值/标题层级/链接，只剩扁平正文。

| 页面类型 | 走哪个 | 原因 |
|---------|--------|------|
| **结构化页面**：产品详情、技术文档、API doc、证书/课程页、电商商品页 | **能力1**（markitdown） | 保留 metadata、字段值、链接、标题层级——「信息完整版」 |
| **正文类页面**：博客、新闻、Essay、公众号文章、专栏长文 | **能力3**（trafilatura） | 自动去导航/侧栏/相关推荐/广告——「纯阅读版」 |
| **不确定** | **两个都跑一遍对比** | 看哪个产出对你的下游用途更合适 |

判断捷径：

> **URL 包含的内容是「读」的，还是「查」的？**
> 读 → 能力3（去噪）
> 查 → 能力1（保信息）

## 核心审美底线（继承自 huashu-design）

这个skill产出的每一份html都必须符合花叔的审美底线。**违反任一条都重做，不要交付**。

| 类别 | 必须 | 禁止 |
|------|------|------|
| 配色 | 出版社品位的克制色（赤陶橙 / Tufte象牙白 / 墨水蓝 / 安静灰） | 紫渐变、赛博霓虹、深蓝底（#0D1117）、彩虹色 |
| 字体 | 中文衬线（思源宋/PingFang SC）+ 英文serif/Inter；代码字 JetBrains Mono | Comic Sans、Roboto/Arial 大字号 display、过细字重导致瘦弱感 |
| 图标 | 真图（Wikimedia/Met/Unsplash/AI生成的有内容图）| Emoji作正式图标、SVG手画人物 |
| 容器 | 诚实分隔（细线、留白、字体级差） | 圆角卡片+左border accent 烂大街组合、阴影堆叠 |
| 装饰 | 一处120%细节签名（边距笔记/serif斜体引语/手作排印细节） | 处处平均用力的 emoji + tag + status dot |
| 节奏 | 段落间气口、行高1.75-1.85（中文）、最大宽度680-820px | 顶到边的密集排版、行高1.4以下、>900px宽体（眼动疲劳） |

详细规则见 `references/anti-ai-slop.md`。

## Junior Designer 工作流

收到「转换/美化/导入」类任务时，**不要直接执行**。先问：

1. **能力是哪个**？三选一（用决策树自检）
2. **来源/去向**？文件路径 / URL / 字符串？输出到哪？
3. **能力2专属问**：模板选哪个？（article默认 / report / reading / interactive）
4. **特殊需求**？（图片处理：保留相对路径 还是 base64嵌入？语言：中文版/英文版？）

回答清楚再动手。不要默认猜，错了用户返工成本远大于多问一句。

## 能力1：万物 → md（`scripts/any_to_md.py`）

封装 [microsoft/markitdown](https://github.com/microsoft/markitdown) v0.1.5+，一份Python脚本兼容20+种格式。

### 调用

```bash
# 基本：自动按扩展名识别
python scripts/any_to_md.py input.pdf
python scripts/any_to_md.py input.docx -o output.md
python scripts/any_to_md.py "https://www.youtube.com/watch?v=xxx"

# 结构化网页/产品页/技术文档（保留 metadata + 标题层级 + 链接）
python scripts/any_to_md.py "https://learn.microsoft.com/en-us/credentials/certifications/modern-desktop/" -o cert.md

# 启用LLM图片描述（需要OPENAI_API_KEY环境变量）
python scripts/any_to_md.py photo.jpg --llm-describe
```

### 支持的格式

PDF、DOCX、PPTX、XLSX、XLS、HTML、CSV、JSON、XML、图片（EXIF/可选LLM描述）、音频（可选语音转写）、YouTube URL（自动抓字幕）、**普通网页URL**（带 YAML frontmatter）、EPub、ZIP（递归解包）、Outlook邮件（.msg）。

### 已知坑（写在脚本输出里提醒用户）

- 扫描PDF不做OCR，需要挂LLM client或Azure Doc Intelligence
- 复杂表格（合并单元格/嵌套）会丢失语义
- PPTX只保留文本+备注，动画排版完全丢
- 输出**为LLM消费设计**，给人读还要再过一道排版

依赖：`pip install 'markitdown[all]'`（自动检测，缺失时提示安装）。

完整cookbook见 `references/markitdown-cookbook.md`。

## 能力2：md → 精美html（`scripts/md_to_html.py`）

封装 [Pandoc](https://pandoc.org/) + 4套精挑模板，覆盖花叔写作场景全部需求。

### 调用

```bash
# 默认：article模板（Tufte风，适合essay/博客）
python scripts/md_to_html.py article.md

# 选模板
python scripts/md_to_html.py report.md --theme report      # 宽体多表格，适合技术报告/白皮书
python scripts/md_to_html.py article.md --theme reading    # Medium极简，适合公众号转接
python scripts/md_to_html.py book.md --theme interactive   # 折叠目录+SVG图，适合长文/橙皮书

# 输出位置
python scripts/md_to_html.py input.md -o out.html

# 图片处理
python scripts/md_to_html.py input.md --inline-images      # base64嵌入（自包含单文件）
python scripts/md_to_html.py input.md --copy-images        # 拷贝到output目录（默认保持相对路径）
```

### 4套模板速览

| 模板 | 哲学锚点 | 适合场景 |
|------|---------|---------|
| **article** | Tufte CSS启发，Pentagram式信息建筑 | essay、博客、深度阅读、独立文章 |
| **report** | 出版社白皮书风，多表格密度型 | 技术报告、调研、白皮书、产品文档 |
| **reading** | Medium风极简，单栏窄体大字 | 公众号转接、纯阅读、轻量分发 |
| **interactive** | 长文档导航型，折叠+目录+边栏 | 橙皮书章节、技术书籍、长教程 |

每个模板都是**自包含单CSS**，HTML打开即可用，不依赖外部CDN。

### 依赖

- `brew install pandoc`（必装，二进制）
- 脚本启动时自动检查`which pandoc`，缺失则提示安装命令

完整cookbook见 `references/md-to-html-themes.md`。

### 两种模式 · 兜底 vs 视觉设计师

能力 2 有两条路径——

| 模式 | 是否耗 token | 何时用 |
|------|------|------|
| **兜底**（4 主题套版） | ❌ 不耗 | 已知主题、要快、不挑细节——`md_to_html.py --theme xxx` 一条命令出活 |
| **设计师模式**（AI 介入定制） | ✅ 耗 | 让 AI 读懂内容、推荐 3 个设计方向、定制视觉表达 |

兜底模式跑 pandoc 二进制，5 秒出结果，全程不联网不耗 token——这是**默认行为**。
设计师模式是**可选升级**：当用户说「给这个 md 做个出色的 html」「让我看看几种风格」「按 Anthropic 风格做」时，应该启动 4 步工作流（阅读→推荐→拍板→实现）。

完整方法论 + 流派池 + 评审清单见 `references/visual-designer-mode.md`。
**参考实现**：`examples/readme.html`——用设计师模式 · 方向 C（Anthropic 暖色科技）做的活样本。

## 能力3：html → md（`scripts/html_to_md.py`）

封装 [html-to-markdown](https://github.com/Goldziher/html-to-markdown)（Rust底层，150-280MB/s）+ [trafilatura](https://github.com/adbar/trafilatura)（URL场景的正文提取）。

**最适合的场景**：博客文章、新闻报道、Essay、公众号长文——任何「正文是产品、其他都是噪声」的页面。能力3 会扔掉导航/侧栏/相关推荐/广告，只留正文。

**不适合的场景**：产品页、技术文档、API doc、电商商品页这类**结构化页面**——能力3 会丢字段值/链接/层级。这种走能力1（markitdown）。

### 调用

```bash
# 本地HTML文件（直接走 html-to-markdown）
python scripts/html_to_md.py input.html

# 博客/新闻URL（自动跑trafilatura提取正文，去除导航/广告/侧栏）
python scripts/html_to_md.py "https://example.com/article"

# URL但你想要原始HTML不要正文提取
python scripts/html_to_md.py "https://example.com/data" --no-extract

# 精细控制
python scripts/html_to_md.py input.html --bullets="-" --heading-style=atx --strip="script,style,nav,footer"

# 输出
python scripts/html_to_md.py input.html -o output.md
```

### 引擎选择

| 输入类型 | 默认引擎 | 何时切换 |
|---------|---------|---------|
| 本地HTML / 已清洁的HTML | `html-to-markdown` | 速度快、自动净化 |
| 博客/新闻 URL | `trafilatura` 提取正文 → `html-to-markdown` 转换 | 自动启动，去除噪声 |
| 结构化URL（产品页/文档/证书页） | **改用能力1（markitdown）** | trafilatura 会丢字段值，markitdown 保留 metadata 和层级 |
| 需精细控制（heading/bullets风格） | `markdownify`（opt-in，`--engine=markdownify`） | 用户明确要求时 |

依赖：`pip install html-to-markdown trafilatura markdownify`。

完整cookbook见 `references/html-to-md-cookbook.md`。

## 能力4：md → 精美docx（`scripts/md_to_docx.py`）

封装 [python-docx](https://github.com/python-openxml/python-docx) + 出版社级排版预设，专为「给人类编辑/出版社审校/投稿/纸质书定稿」场景设计。

**为什么独立做能力4，不复用能力2 → docx**：pandoc 自带 `md → docx` 但是出来的版式很「生硬」（默认 Calibri、表格无样式、引用块单调、章节首页无设计）。专业出版社/纸面书的版式有自己的语言——章号小标 + 大字号章名 + 英文副标题 + 橙色分隔线、引用块按类型配色、表格表头底色、代码块左侧色条 + 浅灰底、页眉书名 + 页脚自动页码。能力4 把这些预设都内置了，**单文件或一整本书都能一条命令生成**。

### 调用

```bash
# 单 md 文件 → docx（默认从 md 同级目录找图片）
python3 scripts/md_to_docx.py article.md
python3 scripts/md_to_docx.py article.md -o article.docx
python3 scripts/md_to_docx.py article.md --images-dir ./images

# 多 md 文件合并（普通模式，不加封面/目录）
python3 scripts/md_to_docx.py ch01.md ch02.md ch03.md -o combined.docx

# 完整书模式（自动加封面 + 目录 + 页眉页脚 + 章节分页）
python3 scripts/md_to_docx.py ch*.md postscript.md appendix.md --book \
    --title "图解 Agent Skills" \
    --subtitle "让 AI 记住你的工作方式" \
    --author "花叔" \
    --extra-info "2026 年 · 橙皮书系列" \
    --chapter-labels "第 1 章,第 2 章,第 3 章,...,后记,附录" \
    --images-dir ./images \
    -o book.docx

# 页面规格切换
python3 scripts/md_to_docx.py article.md --page-size a4   # A4 报告
python3 scripts/md_to_docx.py book.md --page-size book    # 大 32 开（默认，纸质书规格）
```

### 内置排版预设

| 元素 | 预设 |
|------|------|
| 页面规格 | 大 32 开（176×240 mm）或 A4 |
| 中文字体 | 思源宋体 CN（回退 Songti SC / PingFang SC） |
| 英文字体 | Georgia（衬线） |
| 代码字体 | JetBrains Mono（回退 Menlo） |
| 章标题（H1） | 24pt 黑色加粗 + 橙色底分隔线 + 上方章号小标 |
| 节标题（H2） | 17pt 黑色加粗 |
| 小节（H3） | 13.5pt 橙色加粗 |
| 行距 | 1.6（中文舒适） |
| 引用块 | 按 emoji 自动配色：💡 琥珀 / ✅ 青色 / ⚠️ 玫红 / 普通 暖橙 |
| 代码块 | 浅灰底（F5F5F0）+ 橙色左 16pt 色边 |
| 表格 | 表头底色 + 浅灰边框 + 居中对齐 |
| 配图 | 居中嵌入 + 灰色斜体图说 + 最大宽 5.8 英寸 |
| 页眉 | 右对齐小字号书名（斜体灰色） |
| 页脚 | 居中自动页码 |

### 图片自动嵌入

支持两种 md 图片语法：

```markdown
# 内联式：相对路径或绝对路径
![图说](images/cover.png)

# 引用式（适合长书）：在文末定义路径
![图 1-1 · 数据曲线][fig-1-1]

[fig-1-1]: images/ch01-fig01.png "数据曲线 · 女娲37天1.8万star"
```

引用式还支持「按 ref 名约定路径」——如果 ref 是 `fig-1-1` 形态但没有定义对应路径，会自动到 `--images-dir` 找 `ch01-fig01.png`。这个约定让长书（很多章节、几十张图）写起来不用手动维护引用映射。

### 依赖

```bash
python3 -m pip install python-docx Pillow
```

脚本启动时自动检测，缺失时给出明确安装命令。

完整 cookbook 见 `references/md-to-docx-cookbook.md`。

## 排版底线（所有模板共享）

详见 `references/design-tokens.md`，关键参数：

```
正文字体（中文）  PingFang SC, Source Han Serif, Noto Serif CJK
正文字体（英文）  Inter, IBM Plex Sans, et-book
代码字体         JetBrains Mono, Fira Code
行高（中文）     1.75 - 1.85
行高（英文）     1.6
字号（桌面）     17 - 18px
字号（移动）     16px
最大宽度（文章）  680 - 720px
最大宽度（报告）  760 - 820px
段间距           1em - 1.2em
代码块底色       #F6F8FA（浅模式）/ #1F2428（深模式）
引用块           左4px色条 + 浅灰底
标题层级         h1 2em / h2 1.6em / h3 1.3em
```

**禁用清单**：紫渐变、赛博霓虹、#0D1117深蓝底、Comic Sans、emoji作正式图标。

## 一条龙工作流（典型场景）

```bash
# 场景1：PDF白皮书 → 精美阅读html
python scripts/any_to_md.py whitepaper.pdf -o whitepaper.md
python scripts/md_to_html.py whitepaper.md --theme report -o whitepaper.html

# 场景2：YouTube视频 → 文章博客
python scripts/any_to_md.py "https://youtube.com/watch?v=xxx" -o video.md
# 编辑video.md...
python scripts/md_to_html.py video.md --theme article -o blog.html

# 场景3：归档已发布的博客文章 → 项目源文件（能力3）
python scripts/html_to_md.py "https://example.com/blog/article" -o article.md

# 场景4：抓产品页/技术文档 → 完整结构化md（能力1）
python scripts/any_to_md.py "https://learn.microsoft.com/en-us/some-doc" -o doc.md

# 场景5：橙皮书章节 → 多模板对比
python scripts/md_to_html.py chapter.md --theme article -o ch-article.html
python scripts/md_to_html.py chapter.md --theme interactive -o ch-interactive.html
# 浏览器对比，选效果好的

# 场景6：URL不确定走哪条路 → 两个都跑对比
python scripts/any_to_md.py "https://example.com/page" -o page-markitdown.md
python scripts/html_to_md.py "https://example.com/page" -o page-trafilatura.md
# 看哪个对你下游用途更合适

# 场景7：整本橙皮书 md → 出版社审校 docx（能力4）
python scripts/md_to_docx.py md-v2/ch*.md md-v2/postscript.md md-v2/appendix.md --book \
    --title "图解 Agent Skills" \
    --subtitle "让 AI 记住你的工作方式" \
    --author "花叔" \
    --images-dir ./images-v2 \
    -o 图解Agent-Skills_出版社审校版.docx
# 158 页 · 9 章 + 后记 + 附录 + 57 张配图 · 直接给出版社编辑审

# 场景8：从 PDF 论文/报告 → docx 投稿（能力1 → 能力4）
python scripts/any_to_md.py paper.pdf -o paper.md
# 编辑 paper.md 修正格式...
python scripts/md_to_docx.py paper.md --page-size a4 -o paper.docx
```

## 异常处理

| 场景 | 处理 |
|------|------|
| markitdown未安装 | 脚本检测后提示`pip install 'markitdown[all]'`，不静默失败 |
| pandoc未安装 | 脚本检测后提示`brew install pandoc`，给出官方下载地址 |
| 输入文件不存在 | 立即报错，不假装继续 |
| URL请求失败（能力1的YouTube/能力3的URL） | 降级提示：检查网络/VPN/CDN |
| 转换出空内容 | 报警：可能是扫描PDF或图片密集型文档，提示用 `--llm-describe` |
| 输出html渲染异常 | 检查pandoc版本（建议≥3.0）、检查模板文件完整性 |
| python-docx未安装 | 脚本检测后提示`python3 -m pip install python-docx Pillow` |
| docx 里图片显示不出 | 检查 `--images-dir` 路径，或 ref 名 `fig-N-X` 是否对应 `chNN-figNN.png` 文件命名 |

## References路由

| 任务 | 读 |
|------|-----|
| markitdown各文件类型最佳实践 | `references/markitdown-cookbook.md` |
| html→md三种场景下的工具组合 | `references/html-to-md-cookbook.md` |
| 4套html模板的设计哲学+CSS详解 | `references/md-to-html-themes.md` |
| ⭐ 视觉艺术设计师模式（兜底 vs 定制 · 何时升级到 AI 介入） | `references/visual-designer-mode.md` |
| md→docx 完整 cookbook（含书籍模式 / 单文件 / 投稿场景） | `references/md-to-docx-cookbook.md` |
| 排版底线参数（字体/行高/宽度） | `references/design-tokens.md` |
| 反AI slop底线（继承自huashu-design） | `references/anti-ai-slop.md` |

## 核心提醒

- **四个能力各有边界**：能力1输入端、能力2 html输出、能力3反向归档、能力4 docx 出版终点。决策错了会绕远路。
- **md是源**，无论从哪来要回到哪——md是这个流水线的中心。
- **html产出必反slop**：紫渐变、emoji图标、SVG画人物——一律不要。审美底线见 `references/anti-ai-slop.md`。
- **URL输入双路径**：结构化页面用能力1（保metadata+层级+链接），博客类用能力3（去导航+只留正文）。判断捷径——内容是「读的」走3，是「查的」走1。
- **docx 是给人的，不是给 LLM 的**：给出版社/编辑/投稿系统就用能力4。能力2 的 html 适合自己看、网上分享，不适合编辑改稿。
- **Junior先问，再做**：模板选哪个、图片要不要嵌入、是否要LLM描述图片、单文件还是书籍模式——一次问清，不要边做边猜。
- **依赖外部工具**：markitdown（pip）、pandoc（brew）、html-to-markdown（pip）、python-docx（pip）。脚本启动时自检，缺失明确提示。
- **Python环境陷阱**：macOS 上 `pip` 和 `python3` 可能指向不同 Python 版本（实测踩过：`pip` 是 3.11、`python3` 是 3.14）。安装依赖必须用 `python3 -m pip install ...`，不要直接 `pip install`。
