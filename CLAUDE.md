# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A **WebSquare (Inswave) source tree** for KRX (Korea Exchange) business systems. Every file is a `.xml` WebSquare *screen* document — there is no build, lint, test, or package tooling. Files are normally authored in the WebSquare IDE; here they are edited as source. JavaScript lives inside `<script type="text/javascript"><![CDATA[ ... ]]>` blocks within each XML file.

There is no compile/run step you can invoke from the shell. "Running" a change means deploying the XML into a WebSquare server and opening the screen in a browser; that is outside this repo. Treat your job as editing the JavaScript inside these XML envelopes correctly and consistently.

## File anatomy

Each file is `<w2:type>COMMON</w2:type>` and has a `<head>` with:
- `meta_screenId` — the namespace the file registers, e.g. `meta_screenId="$c.util"`.
- `meta_screenName` / `meta_desc` — Korean description of the file's purpose.
- `<w2:publicInfo method="scwin.a,scwin.b,...">` — the **explicit public API**. Only functions listed here are exposed externally. Functions defined but not listed are effectively private to the file.
- A single `<script>` CDATA block containing all the JavaScript.

### Naming & visibility conventions (follow these)
- Functions are defined as `scwin.functionName = function () { ... }`.
- Within a file, a public `scwin.foo` is registered under that file's namespace and called from elsewhere as `$c.<ns>.foo()` (e.g. `$c.util.isEmpty`, `$c.str.getByteLength`). The `$c` object is the cross-file common-library accessor; `scwin` is the current screen's scope.
- A leading double underscore (`scwin.__foo`) marks an **internal helper**: it is `@hidden Y` in JSDoc and omitted from `publicInfo`. Public wrappers (`scwin.foo`, `@hidden N`, listed in `publicInfo`) typically delegate to a `__foo` implementation.
- Every function carries a JSDoc block with `@method`, `@name`, `@description`, `@param`, `@returns`, `@hidden Y|N`, `@example`. Keep this format when adding functions, and **keep `publicInfo` in sync** when you add/remove a public function.

## Architecture: two generations of code

This tree mixes a modern shared library with older converted business code. The distinction matters for how you write and reuse code.

### `gcc/` — the modern common library (`$c.*`)
The actively maintained core (most recent edits). Each file is one namespace under `$c`, fully JSDoc'd by "Inswave Systems", and they call each other through `$c`:

| File | Namespace | Responsibility |
|------|-----------|----------------|
| `util.xml` | `$c.util` | Component control, type checks (`isEmpty`/`isArray`/`isJSON`), file & Excel up/download, clipboard, timers |
| `win.xml` | `$c.win` | Business-screen control: auth, popups, alerts/confirm, navigation, i18n/language, history |
| `str.xml` | `$c.str` | String formatting/validation (SSN, phone, email, byte-length, escaping) |
| `num.xml` | `$c.num` | Number helpers |
| `date.xml` | `$c.date` | Date helpers |
| `data.xml` | `$c.data` | Common codes & messages, DataCollection control, global/screen data transfer, validation |
| `validate.xml` | `$c.validate` | Business-screen validation |
| `sbm.xml` | `$c.sbm` | **Server communication** — submit/workflow/dynamic calls; defines `CONTEXT_PATH`, `SERVICE_URL`, async/JSON defaults, `MESSAGE_CODE` (E/S/W/I) |
| `hkey.xml` | `$c.hkey` | Keyboard shortcuts |
| `ext.xml` | `$c.data`* | External-solution integration |

When writing code in `gcc/`, **reuse the `$c.*` helpers** instead of reimplementing (e.g. `$c.util.isEmpty(x)` over hand-rolled emptiness checks, `$c.str.*` for string ops, `$c.win.alert`/`$c.win.confirm` for dialogs, `$c.sbm.*` for all server calls). The files already cross-reference this way.

### `ins/`, `mgt/`, `stf/` — converted business modules (legacy style)
Three separate KRX business systems' screen libraries. Their scripts begin with the marker:
```
/* ★Wcraft guide★
스크립트 수작업 유의사항   ("script manual-work cautions")
*/
```
This marks code produced by the **W-Craft conversion tool** (migrating an older platform — e.g. Gauce/X-Internet — to WebSquare) and flagged for **manual review/fix-up**. Characteristics that differ from `gcc/`:
- Legacy naming: `scwin.fn_com_isur`, `scwin.fn_int2han`, `scwin.fn_DelChar`, `scwin.ins_combo_set`, etc.
- Often commented-out legacy API calls left as porting hints (`//frame.SetImgAction(...)`).
- These modules also consume the common library (`$c.stf.*`, `$c.frame.*` appear in their code).

Same-named files recur across directories (`common.xml`, `PopupCalendar.xml`, `calendar_fil.xml`, `filing_common.xml`, `ShiftCrossBrowser_ver.2.4.min.xml`, …) — these are **per-module copies**, not shared. A fix in one is not automatically reflected in the others; check whether the same edit is needed in sibling directories.

Rough module focus (from filenames): `stf/` is the largest — securities/listing flows (new listing, ETN/ELW/bond/digital receiving, `list_common*`, `ods`, `marketMaker`); `ins/` and `mgt/` cover related listing/filing and management screens.

## Working in this repo

- Edits are surgical changes to JavaScript **inside** CDATA blocks. Preserve the surrounding XML, the JSDoc format, and the file's existing naming generation (modern `$c`/`scwin.camelCase` in `gcc/`; match the legacy `fn_*`/`ins_*` style when editing `ins`/`mgt`/`stf`).
- When you add or rename a public function, update that file's `<w2:publicInfo method="...">` list.
- Comments, screen names, and descriptions are in **Korean**; keep new user-facing strings and doc text consistent with the file's language.
- Do not introduce build/JS-module syntax (imports, bundler conventions) — these run as inline browser scripts under WebSquare, calling other screens only through the `$c` / `scwin` scopes.
