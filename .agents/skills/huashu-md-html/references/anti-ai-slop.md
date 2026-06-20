# 反 AI slop — huashu-md-html 的审美底线

> 这是从 `huashu-design` 继承并适配到「文档场景」的反slop清单。每一条违反都是品牌识别度的稀释。

## 什么是 AI slop？

**AI slop = AI 训练语料里最常见的"视觉最大公约数"。**

紫渐变、emoji 图标、圆角卡片+左 border accent、SVG 画人物、深蓝底——这些东西不是因为它们丑，而是因为**它们是 AI 默认模式下的产物**，不携带任何品牌信息。

文档场景的 AI slop 就是：每个 AI 工具的默认 markdown 渲染器都长得一样——白底、Helvetica、淡蓝链接、emoji 当 list 标记、紫色系统消息。**用户读到这种页面，认不出谁的作品。**

## 文档场景的 7 条硬禁令

### 1. 紫色渐变 background 永远不要

| 不要 | 原因 |
|------|------|
| `linear-gradient(135deg, #667eea, #764ba2)` | 训练语料里"科技感"的万能公式 |
| 任何 hsl 紫色到蓝色的过渡 | SaaS/AI/web3 落地页烂大街 |
| 渐变 button、渐变 nav bar、渐变 callout | 视觉廉价感的源头 |

**例外**：用户明确要求紫渐变（罕见），或品牌本身就用（Linear 某些场景）。

### 2. Emoji 作为系统图标永远不要

❌ 这种排版：

```markdown
✨ **核心要点**
🔥 **关键发现**
💡 **思考**
⚡️ **行动项**
```

✅ 这样：

```markdown
**核心要点**
**关键发现**
**思考**
**行动项**
```

或用细微的字体样式（小型大写、斜体）做语义区分。

emoji 作为内容（文章里偶尔出现一个 ☕️ 表达情绪）OK；emoji 作为结构性图标永远不要。

### 3. 圆角卡片 + 左 border accent 烂大街组合

❌ 这种 callout：

```css
.callout {
  border-radius: 12px;
  border-left: 4px solid #blue;
  background: #f0f4ff;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
```

是 2020-2024 Material/Tailwind 时期产物，已经成了视觉噪音。

✅ 用这种代替：

- 简单的 `<blockquote>` 配上极简风（左侧 3px 实线，无阴影）
- 不同 callout 类型用字体级差区分（小标题用 small-caps）
- 或者干脆用细的水平分隔线代替框

我们 4 套模板里的 blockquote 都遵守这条。

### 4. 深蓝底 #0D1117 永远不要

GitHub dark mode 美学的烂大街复制。**所有 AI 生成的 dark theme 默认都是这个色**——撞衫到名字都一样。

✅ 用这些：
- `#15181f`（report dark）— 中性偏冷
- `#1c1a16`（article dark）— 暖中性
- `#15130f`（reading dark）— 更暖
- `#1a1916`（interactive dark）— 中性偏暖

每个都和 #0D1117 不同，但都是"低饱和、暗调中性"。

### 5. 赛博霓虹（neon-green/cyan/magenta on black）

属于游戏UI风，不是阅读体验。

| 不要 | 用什么代替 |
|------|----------|
| `#00ff00` 霓虹绿 on 黑 | 静谧的森林绿 `#2c5e3f`（interactive） |
| `#00ffff` 霓虹蓝 on 黑 | 墨水蓝 `#1f4ea8`（report） |
| `#ff00ff` 霓虹紫 on 黑 | 永远不用 |

### 6. Inter / Roboto / Arial 大字号 display

不是说不能用 Inter（report 模板就用了 Inter 做 body），是说：

❌ **正文用 Inter，标题也用 Inter** → 看不出"有设计"还是"demo页"

✅ 正文 Inter / 标题用 serif 或不同字重的 sans → 字体级差是设计

我们的 4 套模板都遵守这条：要么标题/正文不同字族，要么不同字重 + 不同字号倍数 + 不同字距。

### 7. SVG 画人物/物体 imagery

AI 画的 SVG 人物永远五官错位、比例诡异。文档场景里基本不需要画人物——但万一遇到要"配图"：

✅ 顺序：
1. 用真图（Wikimedia/Met/Unsplash/AI生成图片如 `nano-banana-pro`）
2. 用 placeholder 灰块 + 文字标签（"产品图待补"）
3. 删掉这个图位

❌ 永远不要：
- 用 SVG 手画一个简笔画人
- 用 emoji 大字号代替 illustration
- 用纯色块 + Bezier 曲线"暗示"图

## 5 条软原则（情境判断）

### 8. 一处 120%，其他 80%

文档里一定要有一个**值得截图**的细节签名：
- article 的 hr 用 30% 宽细线
- report 的 KPI grid 数字大字号 + 极细 grid 线
- reading 的 hr 用 "·   ·   ·" 三点居中
- interactive 的 sidebar TOC 上面有"目录"小型大写标签

每套模板都有自己的"那一处"。**不要每个地方都精致——会变成均匀平淡。**

### 9. 配色用 spec 里已有的

不要凭空发明色。每套模板的 `theme.css` 顶部有 CSS 变量定义所有色——所有自定义元素也只能从这些变量取色。

❌ 突然加一个 `color: #333` — 不在 spec 里
✅ `color: var(--color-ink)` — 用 spec

### 10. 链接颜色不要太抢戏

文档场景里链接很多。如果每个链接都鲜艳一下，整页就花了。

✅ reading 模板的处理：链接颜色用 ink（=正文色），下划线用 accent — 既能识别又不抢戏
✅ article/report/interactive：链接用 accent 但稍微调暗 + 极细下划线

❌ 不要：bright blue + bold

### 11. 阴影克制

文档不需要阴影。表格不需要阴影。引用块不需要阴影。代码块不需要阴影。

唯一可能的阴影场景：图片的极细投影（`box-shadow: 0 1px 2px rgba(0,0,0,0.04)`）让图片"贴在纸上"。

不要堆叠阴影、模糊半径>10px的阴影、彩色阴影。

### 12. 装饰性 icon 永远不需要

文档里看到这种：

```markdown
🚀 **能力**：超快速度
✨ **特性**：非常优秀
🎯 **目标**：很重要
```

每个标题都配 emoji，是"不够专业就用 emoji 凑"的病。

我们 4 套模板的 SKILL.md 里都没有装饰性 emoji（除了 SKILL.md frontmatter 的触发词列表）。

## 反例隔离（演示反 slop 时）

如果你的文档**就是要演示什么是 slop**（比如本文档），不要让整页变 slop。用诚实的 bad-sample 容器隔离：

```html
<div class="bad-sample">
  <span class="bad-tag">反例 · 不要这样做</span>
  <!-- 反例内容 -->
</div>
```

```css
.bad-sample {
  border: 1px dashed var(--color-rule-strong);
  padding: 1em;
  margin: 1em 0;
  position: relative;
  opacity: 0.7;
}
.bad-tag {
  position: absolute;
  top: -0.6em;
  left: 1em;
  font-size: 0.75em;
  background: var(--color-paper);
  padding: 0 0.4em;
  color: var(--color-ink-mute);
}
```

这种容器明确告诉读者"这是反例"，反例服务于叙事而不是污染主调。

## 检查表（每次输出 html 前过一遍）

- [ ] 没有紫渐变
- [ ] 没有 emoji 作系统图标
- [ ] 没有圆角卡片+左 border 烂组合
- [ ] dark mode 底色不是 #0D1117
- [ ] 没有霓虹色
- [ ] 标题/正文不是同一个 sans 字体
- [ ] 没有 SVG 手画人物
- [ ] 链接不抢戏
- [ ] 阴影克制（≤1层，blur ≤ 4px）
- [ ] 没有装饰性 emoji
- [ ] 配色全部用 CSS 变量（不凭空发明色）
- [ ] 至少有一处 "120% 细节"

## 与 huashu-design 的关系

`huashu-design` 是设计哲学的源头（含 20 种风格、设计方向顾问、品牌资产协议、动画/演示/原型守则）。

`huashu-md-html` 是它在"文档场景"的窄域应用：

- 不做品牌资产协议（文档场景用户极少传 logo/产品图）
- 不做设计方向顾问（用 4 套预定义模板替代）
- 反 AI slop 哲学**完整继承**
- 排版底线**完整继承**

如果你做的是动画/原型/演示/品牌设计——回到 `huashu-design`。

如果你做的是文档/报告/文章/书籍——用本 skill。
