# html→md cookbook — 三种场景下的工具选择

> 这个 cookbook 是能力3（html→md）的实战参考。脚本 `scripts/html_to_md.py` 包装了下面的引擎选择逻辑。

## 引擎概览

| 引擎 | 速度 | 控制粒度 | 何时选 |
|------|------|---------|--------|
| **html-to-markdown** (Goldziher) | 150-280 MB/s（Rust底层） | 中等 | **默认**——速度快、自动净化、适合大多数场景 |
| **markdownify** (matthewwithanm) | 慢（纯Python） | 高（heading style/bullets/strip 全可调） | 需要精细控制输出格式时 |
| **trafilatura** | 中等 | 自动正文提取 | URL输入的前置——去除导航/广告/侧栏 |

## 安装

```bash
pip install html-to-markdown trafilatura markdownify
```

## 三种典型场景

### 场景1：本地 HTML 文件（已清洁）

```bash
python scripts/html_to_md.py article.html -o article.md
```

默认引擎 `html-to-markdown`。返回的 markdown 已经过自动 HTML 净化（去script/style）。

适合：保存好的网页、已经清洗过的HTML、邮件HTML、导出的飞书/Notion HTML。

### 场景2：野生 URL（带噪声）

```bash
python scripts/html_to_md.py "https://example.com/article" -o article.md
```

脚本自动启动 `trafilatura.fetch_url + extract`，提取主体内容（去nav/aside/footer/广告），再喂给 `html-to-markdown`。

适合：博客文章、新闻报道、技术文档、官方公告。

**何时跳过 trafilatura**：

```bash
# 不要正文提取，保留全部HTML
python scripts/html_to_md.py "https://example.com/data" --no-extract
```

适合：已经是"纯内容"页面（如GitHub raw、自己控制的HTML、API返回的clean HTML）。

### 场景3：精细控制输出格式

```bash
python scripts/html_to_md.py article.html \
  --engine markdownify \
  --heading-style=atx \
  --bullets="-" \
  --strip="script,style,nav,footer,aside,iframe,form" \
  -o article.md
```

`markdownify` 的可配置项：

| 选项 | 含义 | 推荐 |
|------|------|------|
| `--heading-style` | atx (`#`) / atx_closed / setext (`===`) / underlined | `atx`（最通用） |
| `--bullets` | `-` / `*` / `+` | `-`（花生偏好） |
| `--strip` | 强制移除的tag列表 | `script,style,nav,footer,aside,iframe,form` |

适合：要把转换结果喂回花生的写作系统，或后续要被审校agent检查的md。

## 输出结构

`html-to-markdown` 引擎的返回是结构化的：

```python
from html_to_markdown import convert
result = convert(html)

result.content        # markdown正文（脚本输出的就是这个）
result.metadata       # 字典，含title/links/headings
result.tables         # 结构化表格列表
result.images         # 图片引用列表
result.warnings       # 转换警告
```

如果需要metadata（比如批量抓取），可以直接调用底层API（不通过本脚本）。

## 引擎对比示例

输入：

```html
<h1>Hello</h1>
<p>This is a <strong>test</strong>.</p>
<ul><li>One</li><li>Two</li></ul>
```

`html-to-markdown` 输出：

```markdown
# Hello

This is a **test**.

* One
* Two
```

`markdownify --bullets="-" --heading-style=atx` 输出：

```markdown
# Hello

This is a **test**.

- One
- Two
```

风格差别在 bullets 字符上。生产环境推荐统一用 `-`。

## 中文页面常见问题

### 编码问题

URL 抓取时如果出现乱码：

```bash
# 默认 User-Agent + utf-8 解码（脚本已实现）
# 如果对方服务器用 GBK/GB2312：
python scripts/html_to_md.py "https://example.cn/page" --user-agent "Mozilla/5.0"
# 然后用 iconv 重编码（如必要）
```

### 段落合并

trafilatura 的默认提取模式可能合并段落。如果你需要保留每个 `<p>` 的独立性：

```python
# 修改 scripts/html_to_md.py 的 trafilatura_extract 函数
trafilatura.extract(html, output_format='html', favor_recall=True)
```

`favor_recall=True` 会保留更多结构，代价是带回更多噪声。

## URL 抓取的反爬虫

某些网站（公众号/知乎/小红书）会反爬。本skill不内置反爬绕过——硬性原则：

- 不绕过 paywall
- 不绕过反爬虫机制
- 不爬需要登录才能看的内容

如果你需要这类内容，建议：

1. 浏览器手动打开 → 复制源HTML → 保存本地 → 用本skill的本地HTML分支
2. 用 `agent-browser` skill（基于 Playwright）真正打开页面再提取

## 何时降级到 markitdown 的 HTML 转换

`markitdown` 也支持HTML输入（能力1）。两者区别：

| 场景 | 用什么 |
|------|--------|
| 干净的本地 HTML | 能力3（`html_to_md.py`）——更精准的格式还原 |
| 野生URL（要去噪） | 能力3 + trafilatura |
| 复杂HTML（带表格/嵌套结构）| 能力3 |
| HTML 在 ZIP 包里 / EPUB 里嵌套出现 | 能力1（markitdown 自动递归） |

简单说：单文件HTML/URL → 能力3；多格式混合包 → 能力1。

## 工作流闭环

```bash
# 把已发布的公众号文章存回项目源
python scripts/html_to_md.py "https://mp.weixin.qq.com/s/xxx" -o archive.md
# 重新编辑 archive.md，再走能力2 输出新版本
python scripts/md_to_html.py archive.md --theme article -o new.html

# 把朋友发的网页链接转成 md 笔记
python scripts/html_to_md.py "https://blog.example.com/article" -o note.md
```
