"""API 모델 -> 단일 자가완결 index.html.

좌측 사이드바(모듈/메서드 목록 + 검색) + 우측 본문(메서드 명세)의 2단 레이아웃.
외부 의존성 없이 동작하도록 CSS 를 인라인한다(브라우저에서 더블클릭으로 열림).
"""

from __future__ import annotations

import html

from .model import ApiModule


def _esc(s: str) -> str:
    return html.escape(s or "", quote=True)


def _multiline(s: str) -> str:
    return _esc(s).replace("\n", "<br>")


def _mid(mod: str, name: str) -> str:
    return f"m-{mod}-{name}"


def _render_method(mod: ApiModule, m) -> str:
    search = _esc((m.name + " " + m.qualified + " " + m.description).lower())
    parts = [f'<article class="method" id="{_mid(mod.name, m.name)}" data-search="{search}">']

    dep = ""
    if m.deprecated is not None:
        dep = ' <span class="badge dep">deprecated</span>'
    parts.append(f'<h3><code class="sig">{_esc(mod.namespace)}.{_esc(m.signature)}</code>{dep}</h3>')

    if m.deprecated:
        parts.append(f'<p class="dep-note">⚠ {_multiline(m.deprecated)}</p>')
    if m.description:
        parts.append(f'<p class="desc">{_multiline(m.description)}</p>')

    if m.params:
        rows = "".join(
            f"<tr><td><code>{_esc(p.type)}</code></td>"
            f"<td><code>{_esc(p.name)}</code></td>"
            f"<td>{_multiline(p.desc)}</td></tr>"
            for p in m.params
        )
        parts.append(
            '<table class="params"><thead><tr>'
            "<th>타입</th><th>이름</th><th>설명</th>"
            f"</tr></thead><tbody>{rows}</tbody></table>"
        )

    if m.returns:
        rtype = f'<code>{_esc(m.returns.type)}</code> ' if m.returns.type else ""
        parts.append(f'<p class="ret"><span class="lbl">반환</span> {rtype}{_multiline(m.returns.desc)}</p>')

    if m.exception:
        parts.append(f'<p class="exc"><span class="lbl">예외</span> {_multiline(m.exception)}</p>')

    if m.example:
        parts.append(f'<pre class="example"><code>{_esc(m.example)}</code></pre>')

    parts.append("</article>")
    return "\n".join(parts)


def _render_module(mod: ApiModule) -> str:
    head = [f'<section class="module" id="mod-{_esc(mod.name)}">']
    head.append('<header class="mod-head">')
    head.append(f"<h2>{_esc(mod.title)} <span class=\"ns\">{_esc(mod.namespace)}</span></h2>")
    if mod.desc:
        head.append(f'<p class="mod-desc">{_esc(mod.desc)}</p>')
    head.append(f'<p class="mod-file">{_esc(mod.file)} · {len(mod.methods)}개 메서드</p>')
    head.append("</header>")
    if mod.note:
        head.append(f'<p class="note">{_esc(mod.note)}</p>')
    body = [_render_method(mod, m) for m in mod.methods]
    head.append("\n".join(body))
    head.append("</section>")
    return "\n".join(head)


def _render_sidebar(modules: list[ApiModule]) -> str:
    items = []
    for mod in modules:
        links = "".join(
            f'<li><a data-mod="{_esc(mod.name)}" data-target="{_mid(mod.name, m.name)}" '
            f'href="#{_mid(mod.name, m.name)}">{_esc(m.name)}</a></li>'
            for m in mod.methods
        )
        count = len(mod.methods)
        items.append(
            f'<li class="nav-mod" data-mod="{_esc(mod.name)}">'
            f'<a class="nav-mod-link" data-mod="{_esc(mod.name)}" href="#mod-{_esc(mod.name)}">'
            f'{_esc(mod.name)} <span class="cnt">{count}</span></a>'
            f"<ul>{links}</ul></li>"
        )
    return '<ul class="nav">' + "".join(items) + "</ul>"


def render_site(modules: list[ApiModule], title: str = "gcc API 문서") -> str:
    total = sum(len(m.methods) for m in modules)
    nonempty = sum(1 for m in modules if m.methods)
    sidebar = _render_sidebar(modules)
    main = "\n".join(_render_module(m) for m in modules)
    return _TEMPLATE.format(
        title=_esc(title),
        css=_CSS,
        js=_JS,
        sidebar=sidebar,
        main=main,
        summary=f"{nonempty}개 모듈 · {total}개 공개 메서드",
    )


_CSS = """
* { box-sizing: border-box; }
body { margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Malgun Gothic',sans-serif;
       color:#1f2933; background:#fff; line-height:1.6; }
code { font-family:'SFMono-Regular',Consolas,'Liberation Mono',monospace; font-size:.9em; }
.layout { display:flex; min-height:100vh; }
.sidebar { width:280px; flex:0 0 280px; border-right:1px solid #e4e7eb; background:#f7f9fc;
           height:100vh; position:sticky; top:0; overflow-y:auto; padding:16px 0; }
.brand { padding:0 18px 12px; }
.brand h1 { font-size:16px; margin:0 0 4px; }
.brand .sub { font-size:12px; color:#7b8794; }
.search { margin:8px 14px 12px; }
.search input { width:100%; padding:8px 10px; border:1px solid #cbd2d9; border-radius:6px; font-size:13px; }
.nav { list-style:none; margin:0; padding:0; }
.nav-mod > .nav-mod-link { display:flex; justify-content:space-between; align-items:center;
    padding:6px 18px; font-weight:600; color:#243b53; text-decoration:none; font-size:13px; }
.nav-mod > .nav-mod-link:hover { background:#e9eef5; }
.nav-mod .cnt { background:#d9e2ec; color:#486581; border-radius:10px; font-size:11px; padding:0 7px; }
.nav-mod ul { list-style:none; margin:0 0 6px; padding:0; display:none; }
.nav-mod.open ul { display:block; }
.nav-mod-link.active { background:#dbe7f3; color:#102a43; }
.nav-mod ul a { display:block; padding:3px 18px 3px 30px; font-size:12px; color:#627d98; text-decoration:none;
                white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.nav-mod ul a:hover { color:#102a43; background:#eef2f7; }
.content { flex:1 1 auto; padding:28px 40px; max-width:960px; }
.content > h1 { font-size:24px; margin:0 0 2px; }
.content > .summary { color:#7b8794; margin:0 0 28px; font-size:13px; }
.module { margin-bottom:48px; }
.mod-head { border-bottom:2px solid #102a43; padding-bottom:8px; margin-bottom:20px; }
.mod-head h2 { margin:0; font-size:20px; }
.mod-head .ns { font-size:13px; color:#829ab1; font-weight:400; margin-left:6px; }
.mod-desc { margin:6px 0 2px; color:#486581; font-size:14px; }
.mod-file { margin:2px 0 0; font-size:12px; color:#9aa5b1; }
.note { color:#9aa5b1; font-style:italic; }
.method { border:1px solid #e4e7eb; border-radius:8px; padding:16px 18px; margin-bottom:16px; background:#fff; }
.method h3 { margin:0 0 8px; font-size:15px; }
.sig { background:#102a43; color:#e0fcff; padding:3px 8px; border-radius:5px; display:inline-block; }
.desc { margin:6px 0 12px; white-space:normal; }
.badge { font-size:11px; padding:1px 7px; border-radius:10px; vertical-align:middle; }
.badge.dep { background:#fce8e6; color:#a61b1b; }
.dep-note { color:#a61b1b; font-size:13px; margin:0 0 10px; }
table.params { border-collapse:collapse; width:100%; margin:0 0 12px; font-size:13px; }
table.params th, table.params td { border:1px solid #e4e7eb; padding:6px 10px; text-align:left; vertical-align:top; }
table.params th { background:#f0f4f8; color:#486581; font-weight:600; }
.ret, .exc { margin:6px 0; font-size:14px; }
.lbl { display:inline-block; min-width:40px; font-weight:600; color:#486581; }
pre.example { background:#f5f7fa; border:1px solid #e4e7eb; border-left:3px solid #2bb0ed;
    border-radius:6px; padding:12px 14px; overflow:auto; margin:10px 0 0; }
pre.example code { color:#243b53; white-space:pre; }
"""

_JS = """
const box = document.getElementById('search');
const modules = Array.prototype.slice.call(document.querySelectorAll('.module'));
const navItems = Array.prototype.slice.call(document.querySelectorAll('.nav-mod'));
const navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-mod-link'));
const modName = id => id.replace(/^mod-/, '');
let active = modules.length ? modName(modules[0].id) : null;

// 사이드바에서 파일을 고르면 콘텐츠에 그 모듈만 보인다(나머지는 숨김).
function showOnly(name) {
  modules.forEach(sec => { sec.style.display = (modName(sec.id) === name) ? '' : 'none'; });
  document.querySelectorAll('.method').forEach(m => { m.style.display = ''; });
  navLinks.forEach(a => a.classList.toggle('active', a.dataset.mod === name));
  navItems.forEach(li => li.classList.toggle('open', li.dataset.mod === name));
}

// 검색은 모든 모듈을 가로질러 매칭 메서드만 보여준다.
function runSearch(v) {
  modules.forEach(sec => {
    let any = false;
    sec.querySelectorAll('.method').forEach(m => {
      const hit = m.dataset.search.indexOf(v) !== -1;
      m.style.display = hit ? '' : 'none';
      if (hit) any = true;
    });
    sec.style.display = any ? '' : 'none';
  });
  navLinks.forEach(a => a.classList.remove('active'));
}

const nav = document.querySelector('.nav');
if (nav) nav.addEventListener('click', e => {
  const a = e.target.closest('a[data-mod]');
  if (!a) return;
  e.preventDefault();
  active = a.dataset.mod;
  if (box) box.value = '';
  showOnly(active);
  const tgt = a.dataset.target;
  if (tgt) { const el = document.getElementById(tgt); if (el) el.scrollIntoView({ block: 'start' }); }
  else { window.scrollTo(0, 0); }
});

if (box) box.addEventListener('input', () => {
  const v = box.value.trim().toLowerCase();
  if (v) runSearch(v); else showOnly(active);
});

if (active) showOnly(active);   // 초기 화면: 첫 모듈만 표시
"""

_TEMPLATE = """<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<style>{css}</style>
</head>
<body>
<div class="layout">
<aside class="sidebar">
  <div class="brand"><h1>{title}</h1><div class="sub">{summary}</div></div>
  <div class="search"><input id="search" type="search" placeholder="메서드 검색..." autocomplete="off"></div>
  {sidebar}
</aside>
<main class="content">
  <h1>{title}</h1>
  <p class="summary">{summary}</p>
  {main}
</main>
</div>
<script>{js}</script>
</body>
</html>
"""
