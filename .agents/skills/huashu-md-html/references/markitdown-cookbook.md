# markitdown cookbook — 各文件类型的转换最佳实践

> 这个 cookbook 是能力1（万物→md）的实战参考。脚本 `scripts/any_to_md.py` 包装了下面所有用法。

## 安装

```bash
# 推荐：一次到位
pip install 'markitdown[all]'

# 可选 extras（按需选）
# pdf docx pptx xlsx xls outlook audio-transcription youtube-transcription az-doc-intel
pip install 'markitdown[pdf,docx,pptx,xlsx]'
```

需要 Python ≥ 3.10。

## 各类型 cookbook

### PDF

```bash
python scripts/any_to_md.py file.pdf -o out.md
```

**适用场景**：原生PDF（含可选文本层）。

**坑与降级**：
- 扫描PDF（图片PDF）→ 默认输出几乎为空，必须挂 LLM 或 Azure Document Intelligence
- 复杂表格（合并单元格、嵌套）→ 单元格语义可能丢失
- 带图表/图片的PDF → 图片不会被OCR，只保留文件名

**降级路径**：
```bash
# 挂 LLM 描述图片（要 OPENAI_API_KEY）
python scripts/any_to_md.py file.pdf --llm-describe

# 挂 Azure Document Intelligence（高保真扫描件）
python scripts/any_to_md.py file.pdf \
  --azure-doc-intel "https://xxx.cognitiveservices.azure.com/"
```

### DOCX

```bash
python scripts/any_to_md.py document.docx -o out.md
```

**质量**：对纯文本/标准排版的Word文档接近无损。Heading 1/2/3 能正确映射成 `#` `##` `###`。

**坑**：
- 文本框、SmartArt、复杂浮动布局 → 会被扁平化或丢失
- 修订标记、批注 → 默认不保留
- 嵌入的图片 → 提取出文件名占位，不内嵌

### PPTX

```bash
python scripts/any_to_md.py deck.pptx -o out.md
```

**输出结构**：每张幻灯片 = 一个 `## Slide N` 段落，包含文字 + speaker notes。

**坑**：
- 动画、过渡、布局完全丢失
- 图表数据丢失（只保留chart的标题）
- 用作"AI消化PPT内容"OK，用作"还原幻灯片"则不够

### XLSX / XLS

```bash
python scripts/any_to_md.py spreadsheet.xlsx -o out.md
```

**输出**：每个worksheet 转成 markdown table。

**坑**：
- 公式不会被evaluate，只看cell的当前值
- 合并单元格 → 拆开
- 数据透视表、图表 → 丢失

**替代**：复杂Excel分析用 `xlsx` skill 或 pandas 直接处理，这里只用于"提取干净文本喂AI"。

### HTML

```bash
python scripts/any_to_md.py page.html -o out.md
```

**质量**：对简单HTML（带article/section/p/h1-6/ul/ol）很好。复杂页面（带nav/aside/广告）会保留所有HTML结构产生噪声。

**推荐**：HTML转md优先用**能力3**（`html_to_md.py`），它有 trafilatura 做正文提取，自动去噪。

### 图片（jpg/png/gif）

```bash
# 不挂LLM：只提取EXIF和文件名
python scripts/any_to_md.py photo.jpg

# 挂LLM：让模型描述图片内容
python scripts/any_to_md.py photo.jpg --llm-describe
```

需要 `OPENAI_API_KEY` 和 `pip install openai`。

### 音频（mp3/wav/m4a）

```bash
# 需要先装 audio-transcription extra
pip install 'markitdown[audio-transcription]'

python scripts/any_to_md.py recording.mp3 -o transcript.md
```

底层用 `pydub` + `speech_recognition`，离线可用，但准确度随音质变化大。

**替代方案**：花叔的工作流里更高质量的方案是 `huashu-subtitle` skill（豆包Audio API），准确度更高，特别是中文长音频。

### YouTube URL

```bash
# 需要先装 youtube-transcription extra
pip install 'markitdown[youtube-transcription]'

python scripts/any_to_md.py "https://www.youtube.com/watch?v=xxx" -o video.md
```

会自动抓取YouTube字幕（如有）。**没有字幕的视频会失败**，需要降级到 `gemini-video` skill。

### EPub

```bash
python scripts/any_to_md.py book.epub -o book.md
```

按章节切分输出，每章一个 H1/H2。封面图、文内插图丢失。

### ZIP

```bash
python scripts/any_to_md.py archive.zip -o archive.md
```

**行为**：递归解包，每个内部文件按其类型转md，按目录结构组织。

### Outlook .msg

```bash
pip install 'markitdown[outlook]'
python scripts/any_to_md.py email.msg -o email.md
```

提取主题/发件人/收件人/正文/附件名。附件本身不会被转换。

## 一条龙工作流

```bash
# PDF白皮书 → md → 精美阅读html
python scripts/any_to_md.py whitepaper.pdf -o wp.md
python scripts/md_to_html.py wp.md --theme report -o wp.html

# YouTube视频 → md脚本 → 文章博客
python scripts/any_to_md.py "https://youtube.com/watch?v=xxx" -o talk.md
# 编辑 talk.md，改写成文章...
python scripts/md_to_html.py talk.md --theme article -o blog.html
```

## 何时不用 markitdown

| 任务 | 用什么 |
|------|--------|
| 需要保留布局精度（不只是文本） | 直接用 PDF reader / docx 库 / pptx skill |
| 需要OCR扫描件 | 挂 LLM 或 Azure DocIntel；或专门 OCR 工具（Tesseract/PaddleOCR） |
| 需要分析数据（不是提取文本） | xlsx skill 或 pandas |
| 中文音视频转写 | `huashu-subtitle`（豆包API）或 `gemini-video` |
| HTML 网页（带噪声） | 直接用本skill的能力3（`html_to_md.py`） |

## 已知的版本变化

- v0.1.5（2026-02-20）：内存内转换、PDF表格对齐改善、插件架构开放
- v0.1.x 之前：表格还原差，建议升级到最新

```bash
# 检查当前版本
pip show markitdown | grep Version

# 升级
pip install -U 'markitdown[all]'
```
