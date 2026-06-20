#!/usr/bin/env python3
"""Render a Feishu-style meeting transcript markdown into a self-contained,
publisher-grade HTML (designer-mode · 方向 A · 出版社纪要 + Tufte 边注).

No pandoc, no external CDN. One file in, one file out.
"""
import html
import re
import sys
from pathlib import Path

SPEAKER_RE = re.compile(r"^说话人\s+(\d+)\s+(\d{2}:\d{2}:\d{2})\s*$")
LINK_RE = re.compile(r"\[(.*?)\]\((.*?)\)")

# Restrained, publisher palette — one dot color per speaker (desaturated).
SPEAKER_COLORS = {
    "1": "#C2410C",  # 赤陶橙  (lead)
    "2": "#1F4EA8",  # 墨水蓝
    "3": "#2C5E3F",  # 森林绿
    "4": "#8A6D3B",  # 陶土赭
    "5": "#6B4A7A",  # 静谧紫灰
}
DEFAULT_DOT = "#6B6660"


def clean(text: str) -> str:
    """Undo the escaping Feishu adds (\\-  \\+) then HTML-escape."""
    text = text.replace("\\-", "-").replace("\\+", "+").replace("\\.", ".")
    return html.escape(text)


def parse(md: str):
    lines = md.splitlines()
    title = "会议文字记录"
    subject = time_str = ""
    minutes_label = minutes_url = ""

    i = 0
    # title
    for j, ln in enumerate(lines):
        if ln.startswith("# "):
            title = ln[2:].strip()
            i = j + 1
            break

    # metadata blockquote
    while i < len(lines):
        ln = lines[i]
        if ln.startswith(">"):
            content = ln.lstrip(">").strip()
            if content.startswith("录音主题"):
                subject = content.split("：", 1)[-1].strip()
            elif content.startswith("录音时间"):
                time_str = content.split("：", 1)[-1].strip()
            elif content.startswith("智能纪要"):
                m = LINK_RE.search(content)
                if m:
                    minutes_label, minutes_url = m.group(1), m.group(2)
            i += 1
        elif ln.strip() == "":
            i += 1
            if i < len(lines) and not lines[i].startswith(">"):
                break
        else:
            break

    # turns
    turns = []
    cur = None
    for ln in lines[i:]:
        m = SPEAKER_RE.match(ln)
        if m:
            if cur:
                turns.append(cur)
            cur = {"sp": m.group(1), "ts": m.group(2), "text": []}
        elif cur is not None:
            if ln.strip():
                cur["text"].append(ln.strip())
    if cur:
        turns.append(cur)
    for t in turns:
        t["text"] = " ".join(t["text"]).strip()

    return {
        "title": title,
        "subject": subject,
        "time": time_str,
        "minutes_label": minutes_label,
        "minutes_url": minutes_url,
        "turns": turns,
    }


def render(data: dict) -> str:
    turns = data["turns"]
    counts = {}
    for t in turns:
        counts[t["sp"]] = counts.get(t["sp"], 0) + 1

    # masthead time line: split "2026年...（周三） 14:05 - 15:21 （GMT+08）"
    time_clean = clean(data["time"])

    # speaker legend (ordered by turn count desc)
    legend_items = []
    for sp, n in sorted(counts.items(), key=lambda kv: -kv[1]):
        color = SPEAKER_COLORS.get(sp, DEFAULT_DOT)
        legend_items.append(
            f'<li><span class="dot" style="background:{color}"></span>'
            f'<span class="who">说话人 {sp}</span>'
            f'<span class="n">{n} 段</span></li>'
        )
    legend_html = "\n".join(legend_items)

    # turns
    blocks = []
    prev_sp = None
    for idx, t in enumerate(turns, 1):
        sp, ts, text = t["sp"], t["ts"], clean(t["text"])
        color = SPEAKER_COLORS.get(sp, DEFAULT_DOT)
        same = " same" if sp == prev_sp else ""
        prev_sp = sp
        blocks.append(
            f'''<article class="turn{same}" id="t{idx}" style="--sp:{color}">
  <header class="t-head">
    <span class="speaker"><span class="dot"></span>说话人 {sp}</span>
  </header>
  <a class="ts" href="#t{idx}" aria-label="时间戳 {ts}"><span class="bk">⌜</span>{ts}<span class="bk">⌝</span></a>
  <p class="say">{text}</p>
</article>'''
        )
    turns_html = "\n".join(blocks)

    minutes_link = ""
    if data["minutes_url"]:
        minutes_link = (
            f'<a class="src" href="{html.escape(data["minutes_url"])}" '
            f'target="_blank" rel="noopener">智能纪要原文 ↗</a>'
        )

    total = len(turns)
    title = clean(data["title"])
    subject = clean(data["subject"])

    return TEMPLATE.format(
        title=title,
        subject=subject,
        time_clean=time_clean,
        minutes_link=minutes_link,
        legend_html=legend_html,
        turns_html=turns_html,
        total=total,
        speakers=len(counts),
    )


TEMPLATE = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<style>
  :root {{
    --paper:#FAFAF7; --paper-2:#F3F1EA;
    --ink:#1A1A1A; --ink-soft:#3C3A36; --ink-mute:#74706A;
    --rule:#E3DFD5; --rule-soft:#ECE9E1;
    --accent:#C2410C;
    --serif: "Source Han Serif SC","Noto Serif CJK SC","Songti SC",STSong,"Times New Roman",serif;
    --sans: "PingFang SC","Hiragino Sans GB","Microsoft YaHei",system-ui,-apple-system,"Helvetica Neue",sans-serif;
    --mono: "JetBrains Mono","SF Mono",ui-monospace,Menlo,Consolas,monospace;
    --measure: 720px;
    --margin-w: 152px;
  }}
  @media (prefers-color-scheme: dark) {{
    :root {{
      --paper:#1C1A16; --paper-2:#23211C;
      --ink:#ECE7DC; --ink-soft:#CFC9BC; --ink-mute:#8F897C;
      --rule:#36322B; --rule-soft:#2B2823;
      --accent:#E2683B;
    }}
  }}
  * {{ box-sizing:border-box; }}
  html {{ -webkit-text-size-adjust:100%; }}
  body {{
    margin:0; background:var(--paper); color:var(--ink);
    font-family:var(--serif); font-size:18px; line-height:1.85;
    -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility;
  }}
  /* reading progress — the one functional accent */
  #bar {{ position:fixed; top:0; left:0; height:2px; width:0;
    background:var(--accent); z-index:50; transition:width .08s linear; }}

  .wrap {{ max-width:calc(var(--measure) + var(--margin-w) + 48px);
    margin:0 auto; padding:0 24px; }}

  /* ---- masthead ---- */
  header.masthead {{ padding:88px 0 0; max-width:var(--measure); }}
  .eyebrow {{ font-family:var(--sans); font-size:.72rem; letter-spacing:.28em;
    text-transform:uppercase; color:var(--accent); font-weight:600; margin:0 0 18px; }}
  h1.title {{ font-size:2.55rem; line-height:1.28; font-weight:700; margin:0;
    letter-spacing:.005em; }}
  .meta {{ margin:22px 0 0; font-family:var(--sans); font-size:.92rem;
    color:var(--ink-mute); line-height:1.7; }}
  .meta .lab {{ color:var(--ink-soft); }}
  .meta .src {{ color:var(--accent); text-decoration:none;
    border-bottom:1px solid color-mix(in srgb,var(--accent) 35%, transparent); }}
  .meta .src:hover {{ border-bottom-color:var(--accent); }}
  /* 30%-width signature hairline */
  .sig-rule {{ width:30%; min-width:120px; height:1px; background:var(--accent);
    border:0; margin:30px 0 0; }}

  /* ---- speaker legend ---- */
  .legend {{ margin:34px 0 0; padding:18px 0 0; border-top:1px solid var(--rule); }}
  .legend .cap {{ font-family:var(--sans); font-size:.7rem; letter-spacing:.22em;
    text-transform:uppercase; color:var(--ink-mute); margin:0 0 12px; }}
  .legend ul {{ list-style:none; margin:0; padding:0; display:flex; flex-wrap:wrap;
    gap:8px 26px; }}
  .legend li {{ display:flex; align-items:baseline; gap:9px; font-family:var(--sans);
    font-size:.9rem; }}
  .legend .dot {{ width:9px; height:9px; border-radius:50%; flex:0 0 auto;
    transform:translateY(1px); }}
  .legend .who {{ color:var(--ink-soft); }}
  .legend .n {{ color:var(--ink-mute); font-variant-numeric:tabular-nums;
    font-size:.82rem; }}
  .summ {{ font-family:var(--sans); font-size:.78rem; color:var(--ink-mute);
    margin:14px 0 0; font-variant-numeric:tabular-nums; }}

  /* ---- transcript ---- */
  main {{ margin:56px 0 0; padding-bottom:140px; }}
  .turn {{ position:relative; max-width:var(--measure);
    padding:26px 0 26px; border-top:1px solid var(--rule-soft); }}
  .turn:first-child {{ border-top:1px solid var(--rule); }}
  /* tighten when same speaker keeps talking */
  .turn.same {{ border-top:1px dashed var(--rule-soft); padding-top:18px; }}
  .turn.same .speaker {{ opacity:.55; }}

  .t-head {{ margin:0 0 7px; }}
  .speaker {{ display:inline-flex; align-items:center; gap:8px;
    font-family:var(--sans); font-size:.76rem; font-weight:600;
    letter-spacing:.14em; text-transform:uppercase; color:var(--ink-soft); }}
  .speaker .dot {{ width:8px; height:8px; border-radius:50%; background:var(--sp); }}

  .say {{ margin:0; color:var(--ink); }}
  /* lead the eye to speaker 1 (the chair) ever so slightly */
  .turn .say {{ text-wrap:pretty; }}

  /* Tufte sidenote timestamp, right margin on wide screens */
  .ts {{ position:absolute; top:26px; left:calc(var(--measure) + 28px);
    width:calc(var(--margin-w) - 28px);
    font-family:var(--mono); font-size:.74rem; line-height:1.6;
    color:var(--ink-mute); text-decoration:none; letter-spacing:.02em;
    font-variant-numeric:tabular-nums; white-space:nowrap; }}
  .turn.same .ts {{ top:18px; }}
  .ts .bk {{ color:var(--sp); opacity:.8; padding:0 1px; }}
  .ts:hover {{ color:var(--accent); }}
  .turn:target {{ }}
  .turn:target .say {{ box-shadow:-14px 0 0 -11px var(--accent); padding-left:14px;
    margin-left:-14px; transition:padding .2s; }}

  /* ---- footer ---- */
  footer {{ max-width:var(--measure); margin:0; padding:30px 0 80px;
    border-top:1px solid var(--rule); font-family:var(--sans);
    font-size:.78rem; color:var(--ink-mute); }}
  footer .end {{ letter-spacing:.2em; text-transform:uppercase; }}

  /* ---- responsive: collapse the margin ---- */
  @media (max-width: 920px) {{
    :root {{ --margin-w:0px; }}
    body {{ font-size:17px; }}
    header.masthead {{ padding-top:60px; }}
    h1.title {{ font-size:2.05rem; }}
    .ts {{ position:static; display:inline-block; width:auto;
      margin:0 0 8px; padding:0; top:auto; left:auto; }}
    .t-head {{ display:flex; align-items:baseline; gap:14px; flex-wrap:wrap; }}
    .turn.same .ts {{ top:auto; }}
  }}
  @media (max-width: 480px) {{
    body {{ font-size:16px; }}
    .wrap {{ padding:0 18px; }}
    h1.title {{ font-size:1.7rem; }}
  }}
  @media print {{
    #bar {{ display:none; }}
    body {{ background:#fff; font-size:11pt; }}
    .ts {{ color:#555; }}
  }}
</style>
</head>
<body>
<div id="bar"></div>
<div class="wrap">

  <header class="masthead">
    <p class="eyebrow">录音文字记录</p>
    <h1 class="title">{title}</h1>
    <div class="meta">
      <div><span class="lab">议题</span>　{subject}</div>
      <div><span class="lab">时间</span>　{time_clean}</div>
      <div style="margin-top:6px">{minutes_link}</div>
    </div>
    <hr class="sig-rule">
    <div class="legend">
      <p class="cap">参会发言人</p>
      <ul>
{legend_html}
      </ul>
      <p class="summ">共 {total} 段发言 · {speakers} 位发言人 · 时间戳点击可定位</p>
    </div>
  </header>

  <main>
{turns_html}
  </main>

  <footer>
    <p class="end">— 记录完 —</p>
    <p>由 huashu-md-html · 设计师模式生成 · md 为源，html 为产物</p>
  </footer>

</div>
<script>
  // reading progress bar
  var bar = document.getElementById('bar');
  function upd(){{
    var h = document.documentElement;
    var sc = h.scrollTop || document.body.scrollTop;
    var max = (h.scrollHeight - h.clientHeight) || 1;
    bar.style.width = (sc / max * 100) + '%';
  }}
  document.addEventListener('scroll', upd, {{passive:true}});
  upd();
</script>
</body>
</html>
"""


def main():
    src = Path(sys.argv[1])
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else src.with_suffix(".html")
    data = parse(src.read_text(encoding="utf-8"))
    out.write_text(render(data), encoding="utf-8")
    print(f"OK  {len(data['turns'])} turns -> {out}")


if __name__ == "__main__":
    main()
