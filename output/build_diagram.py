# -*- coding: utf-8 -*-
"""Generate 出货流程总览 (Shipment Process Overview) flowchart SVG."""

CANVAS_W = 1640
CANVAS_H = 1020

# ---- column geometry ----
LX = 52
COL_W = 288
GAP = 30
COLS = [LX + i * (COL_W + GAP) for i in range(5)]   # x of each of 5 columns
RIGHT = COLS[4] + COL_W                               # 1612
# merged content cells (cols 1-2  and  cols 3-4)
A_X = COLS[1]
A_W = COL_W + GAP + COL_W                             # 606
B_X = COLS[3]
B_W = COL_W + GAP + COL_W

LABEL_X = 12
LABEL_W = 32

# ---- vertical bands ----
TITLE_Y   = 58
FLOW_Y    = 110
STAGE_Y, STAGE_H   = 168, 132
PANEL_Y, PANEL_H   = 316, 200
TP_Y,    TP_H      = 530, 94
S1_Y,    S1_H      = 638, 154
S2_Y,    S2_H      = 806, 194

L = []  # output lines


def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def char_w(ch, fs):
    o = ord(ch)
    if o > 0x2E7F or ch in '，。、；：？！（）【】「」“”…—·':
        return fs                      # full-width
    return fs * 0.56                   # half-width / ascii


def wrap(text, max_w, fs):
    lines, cur, w = [], '', 0.0
    for ch in text:
        if ch == '\n':
            lines.append(cur); cur, w = '', 0.0; continue
        cwid = char_w(ch, fs)
        if w + cwid > max_w and cur:
            lines.append(cur); cur, w = ch, cwid
        else:
            cur += ch; w += cwid
    if cur:
        lines.append(cur)
    return lines


def block(x, y, items, fs, lh, color, max_w, weight='400'):
    """Emit a list of (already wrapped) text items, return next y."""
    cy = y
    for it in items:
        for ln in wrap(it, max_w, fs):
            L.append(f'<text x="{x}" y="{cy:.0f}" font-size="{fs}" fill="{color}" '
                     f'font-weight="{weight}">{esc(ln)}</text>')
            cy += lh
    return cy


def rrect(x, y, w, h, rx, fill, stroke, sw=1.5, filt=None):
    f = f' filter="{filt}"' if filt else ''
    L.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" ry="{rx}" '
             f'fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{f}/>')


# ===================== HEADER =====================
L.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {CANVAS_W} {CANVAS_H}" '
         f'width="{CANVAS_W}" height="{CANVAS_H}">')
L.append('<style>text{font-family:"WenQuanYi Zen Hei","Helvetica Neue",Arial,'
         '"PingFang SC","Microsoft YaHei",sans-serif;}</style>')
L.append('<defs>')
# stage gradients
grads = [
    ('g1', '#5b9bd5', '#3f7fc0'),   # blue
    ('g2', '#2f5fa6', '#244b85'),   # dark blue
    ('g3', '#1f3a6b', '#152a4f'),   # navy
    ('g4', '#34a866', '#268a50'),   # green
    ('g5', '#9b5cc0', '#7e44a6'),   # purple
]
for gid, c0, c1 in grads:
    L.append(f'<linearGradient id="{gid}" x1="0" y1="0" x2="0" y2="1">'
             f'<stop offset="0" stop-color="{c0}"/>'
             f'<stop offset="1" stop-color="{c1}"/></linearGradient>')
L.append('<marker id="ar" markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto">'
         '<polygon points="0 0,10 4,0 8" fill="#7a8699"/></marker>')
L.append('<marker id="arg" markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto">'
         '<polygon points="0 0,10 4,0 8" fill="#34a866"/></marker>')
L.append('<filter id="sh" x="-20%" y="-20%" width="140%" height="140%">'
         '<feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#1f2937" flood-opacity="0.18"/></filter>')
L.append('</defs>')

# background
L.append(f'<rect width="{CANVAS_W}" height="{CANVAS_H}" fill="#ffffff"/>')

# logo (slanted bars, top-right)
for i in range(4):
    lx = 1556 + i * 13
    L.append(f'<path d="M {lx} 30 L {lx+22} 30 L {lx+12} 70 L {lx-10} 70 Z" fill="#3a4a7a" opacity="{0.55+i*0.12:.2f}"/>')

# title
L.append(f'<text x="60" y="{TITLE_Y}" font-size="36" font-weight="700" fill="#1f3a6b">出货流程总览</text>')
# flow summary line
L.append(f'<text x="62" y="{FLOW_Y}" font-size="21" font-weight="700" fill="#243b6b">'
         'CS下单销货指令　→　OPS出库指令　→　测试厂出货信息回传　→　爬取物流签收</text>')

# ===================== CALLOUT (points to stage 4) =====================
cb_x, cb_y, cb_w, cb_h = 1006, 12, 460, 104
rrect(cb_x, cb_y, cb_w, cb_h, 10, '#ffffff', '#34a866', 1.8)
ctext = ('erp-auto 每天 0 点自动给季丰发送"未结案回执"邮件'
         '（ERP系统中状态：OPS已通知测试厂 - 测试厂未出货）')
block(cb_x + 16, cb_y + 30, [ctext], 14, 19, '#1f2937', cb_w - 32, '600')
# arrow down to stage 4 header
s4_cx = COLS[3] + COL_W / 2
L.append(f'<path d="M {s4_cx:.0f} {cb_y+cb_h} L {s4_cx:.0f} {STAGE_Y-4}" stroke="#34a866" '
         f'stroke-width="2.2" fill="none" marker-end="url(#arg)"/>')

# ===================== STAGE BOXES =====================
stages = [
    ('g1', 'CS下达销货指令', ['销货通知单', '寄售调拨通知单']),
    ('g2', 'OPS出库指令', ['佳欣 · 创建 ERP 出库单']),
    ('g3', 'OPS复审 ➡ 转发季丰', ['佳欣 · 今日销货通知邮件']),
    ('g4', '测试厂出货 · 回传', ['测试厂　季丰']),
    ('g5', '客户已签收', ['爬虫抓取　IT 泽鹏']),
]
for i, (gid, title, subs) in enumerate(stages):
    x = COLS[i]
    cx = x + COL_W / 2
    rrect(x, STAGE_Y, COL_W, STAGE_H, 14, f'url(#{gid})', 'none', 0, 'url(#sh)')
    L.append(f'<text x="{cx:.0f}" y="{STAGE_Y+54}" font-size="20" font-weight="700" '
             f'fill="#ffffff" text-anchor="middle">{esc(title)}</text>')
    sy = STAGE_Y + 84
    for s in subs:
        L.append(f'<text x="{cx:.0f}" y="{sy}" font-size="14" fill="#e7eefb" '
                 f'text-anchor="middle">{esc(s)}</text>')
        sy += 22

# arrows between stages
ay = STAGE_Y + 66
for i in range(4):
    x0 = COLS[i] + COL_W + 3
    x1 = COLS[i + 1] - 3
    L.append(f'<line x1="{x0}" y1="{ay}" x2="{x1}" y2="{ay}" stroke="#7a8699" '
             f'stroke-width="2.4" marker-end="url(#ar)"/>')

# ===================== OPERATION PANELS =====================
head_colors = ['#2f6cb5', '#27508f', '#1b315e', '#2a8f5a', '#8a48b0']
panels = [
    ('提交', [('ERP 中销货通知单、寄售调拨通知单等单据', '400', '#374151')]),
    ('录入信息', [
        ('出货数量 · 封装 · BIN · 测试程序', '400', '#374151'),
        ('提货方式 · 要求发货日 · 收件人/电话/地址', '400', '#374151'),
        ('发送当日邮件 ➡ 佳欣邮箱（可撤审）', '700', '#27508f'),
    ]),
    ('OPS复审后指令 → 季丰', [
        ('佳欣复审系统自动发送当日需销货的邮件记录邮件，附件添加出库单 PDF、产品标签等文件后，邮件发给测试厂。', '400', '#374151'),
    ]),
    ('季丰回复"结案回执" → 我方', [
        ('回复邮件正文：实际发货日期、快递单号、实际发货数量', '400', '#374151'),
        ('回复邮件附件：已发货订单对应的箱单 excel', '400', '#374151'),
    ]),
    ('系统自动', [
        ('按【出库单号】抓取季丰未结案回执邮件的实际发货日期、快递单号、实际发货数量。', '400', '#374151'),
        ('按【快递单号】抓取物流信息', '400', '#374151'),
    ]),
]
for i, (head, items) in enumerate(panels):
    x = COLS[i]
    rrect(x, PANEL_Y, COL_W, PANEL_H, 10, '#f6f8fb', '#dde3ec', 1.2)
    L.append(f'<text x="{x+16}" y="{PANEL_Y+28}" font-size="15" font-weight="700" '
             f'fill="{head_colors[i]}">{esc(head)}</text>')
    cy = PANEL_Y + 54
    for txt, wt, col in items:
        for ln in wrap(txt, COL_W - 28, 12.5):
            L.append(f'<text x="{x+16}" y="{cy:.0f}" font-size="12.5" fill="{col}" '
                     f'font-weight="{wt}">{esc(ln)}</text>')
            cy += 18
        cy += 3

# ===================== ROW LABEL BAND =====================
def vlabel(cy, text, color):
    rrect(LABEL_X, cy, LABEL_W, 0, 6, 'none', 'none', 0)  # noop placeholder
    yy = 0
    # draw vertically stacked characters centered in band

def row_label(y, h, chars, color):
    n = len(chars)
    step = 30
    start = y + h / 2 - (n - 1) * step / 2
    for j, ch in enumerate(chars):
        L.append(f'<text x="{LABEL_X+LABEL_W/2:.0f}" y="{start+j*step:.0f}" font-size="19" '
                 f'font-weight="700" fill="{color}" text-anchor="middle">{esc(ch)}</text>')

row_label(TP_Y, TP_H, '时间点', '#5a6675')
row_label(S1_Y, S1_H, '系统1', '#d35400')
row_label(S2_Y, S2_H, '系统2', '#c0392b')

# ===================== 时间点 ROW =====================
tp = [
    ['常规操作（截止 16:00）', '特殊操作（截止 16:30）', '超急件特殊通道（截止次日上午 10:00）'],
    ['16:30 - 18:00'],
    ['16:30 - 18:00'],
    ['CS下单销货通知 N+2 天', '上午 9:30 前反馈'],
    ['CS下单销货通知 N+4 天', '中午 12:00 前完成爬取 + 数据上传'],
]
for i, items in enumerate(tp):
    x = COLS[i]
    rrect(x, TP_Y, COL_W, TP_H, 8, '#eaf1fa', '#c5d6ec', 1.2)
    cy = TP_Y + 32
    for it in items:
        for ln in wrap(it, COL_W - 24, 13):
            L.append(f'<text x="{x+14}" y="{cy:.0f}" font-size="13" fill="#27405f">{esc(ln)}</text>')
            cy += 19

# ===================== 系统1 ROW =====================
# label cell
rrect(COLS[0], S1_Y, COL_W, S1_H, 10, '#fdeede', '#e8902a', 1.5)
lc_cx = COLS[0] + COL_W / 2
L.append(f'<text x="{lc_cx:.0f}" y="{S1_Y+54}" font-size="20" font-weight="700" '
         f'fill="#c0392b" text-anchor="middle">自动邮件提醒</text>')
L.append(f'<text x="{lc_cx:.0f}" y="{S1_Y+84}" font-size="17" font-weight="700" '
         f'fill="#c0392b" text-anchor="middle">【日报】销货通知未出货</text>')
L.append(f'<text x="{lc_cx:.0f}" y="{S1_Y+110}" font-size="15" fill="#9a4a18" '
         f'text-anchor="middle">（暂用名）</text>')
# content A
rrect(A_X, S1_Y, A_W, S1_H, 10, '#fff7ec', '#f0b35a', 1.4)
cy = block(A_X + 16, S1_Y + 30, [
    '1、每天三次邮件自动推送（凌晨 0 点、下午 2 点、下午 4:30）',
    '2、邮件中需要体现的销货单核心信息：',
], 13, 19, '#4a3520', A_W - 32)
for b in ['CS已下单销货通知 - OPS未通知测试厂', 'OPS已通知测试厂 - 测试厂未出货',
          '测试厂已出货 - 客户未签收', '测试厂已出货 - 客户已签收']:
    L.append(f'<text x="{A_X+30}" y="{cy:.0f}" font-size="13" fill="#4a3520">• {esc(b)}</text>')
    cy += 19
# content B
rrect(B_X, S1_Y, B_W, S1_H, 10, '#fff7ec', '#f0b35a', 1.4)
L.append(f'<text x="{B_X+16}" y="{S1_Y+30}" font-size="14" font-weight="700" '
         f'fill="#0e7490">待确认事项：</text>')
block(B_X + 16, S1_Y + 52, [
    'CS_SalesDelivery_UnShipInfo_V 需要增加的数据',
    '1、测试厂返回邮件中快递信息的爬取',
    '2、快递物流送达信息的爬取',
    '3、View 中需要增加寄售调拨通知单的数据',
    '4、历史已发货数据',
], 13, 19, '#4a3520', B_W - 32)

# ===================== 系统2 ROW =====================
rrect(COLS[0], S2_Y, COL_W, S2_H, 10, '#fdf6cf', '#e0b800', 1.5)
L.append(f'<text x="{lc_cx:.0f}" y="{S2_Y+58}" font-size="20" font-weight="700" '
         f'fill="#c0392b" text-anchor="middle">便捷销货出库</text>')
L.append(f'<text x="{lc_cx:.0f}" y="{S2_Y+88}" font-size="15" fill="#9a4a18" '
         f'text-anchor="middle">（暂用名）</text>')
L.append(f'<text x="{lc_cx:.0f}" y="{S2_Y+122}" font-size="14" font-weight="700" '
         f'fill="#c0392b" text-anchor="middle">http://10.100.10.35:5901</text>')
# content A
rrect(A_X, S2_Y, A_W, S2_H, 10, '#fffdf0', '#e8c84a', 1.4)
block(A_X + 16, S2_Y + 28, [
    '1、每天下午 4:30 佳欣在平台中操作输入出货数量、封装、Bin 别、测试程序、发货备注、提货方式、要求发货日、收件人/电话/地址',
    '2、佳欣点击提交后，后台调用 ERP API 同步创建出库单。若有个别已审批单据需要调整，可以撤回审批。',
    '3、点击【发送今日邮件】，信息包含今天需要通知测试厂的销货通知（含重审后的单据）➡ 佳欣邮箱复审 ➡ 复审通过后，添加附件转发给测试厂。',
    '注意：上述过程中，佳欣收到系统自动邮件后【不可以】修改邮件正文。',
    '母子公司的调货是否自动化？',
], 12.5, 17, '#3f3416', A_W - 32)
# content B
rrect(B_X, S2_Y, B_W, S2_H, 10, '#fffdf0', '#e8c84a', 1.4)
L.append(f'<text x="{B_X+16}" y="{S2_Y+26}" font-size="14" font-weight="700" '
         f'fill="#0e7490">待确认事项：</text>')
block(B_X + 16, S2_Y + 48, [
    '1、便捷销货出库平台的撤审功能，能否同步撤销 ERP 系统对应单据？API 建的单是"已审核"还是"草稿"？决定撤审是反审核还是删除？',
    '2、增加寄售调拨通知单的数据',
    '3、回复我司哪个邮箱？季丰回填正文还是附件？实际发货数量 < 通知数量 → 余量自动滚回明天未结案？自提--季丰发货后并入当日结案？',
    '4、物流单号和轨迹信息导入 ERP？箱单 excel 存哪？',
], 12.5, 17, '#3f3416', B_W - 32)

L.append('</svg>')

with open('/home/user/Skill/output/shipment-flow.svg', 'w', encoding='utf-8') as f:
    f.write('\n'.join(L))
print('SVG written:', len(L), 'lines')
