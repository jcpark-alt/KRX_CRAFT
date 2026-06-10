# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A **WebSquare (Inswave) source tree** for KRX (Korea Exchange) business systems. Every file is a `.xml` WebSquare *screen* document, normally authored in the WebSquare IDE; here they are edited as source. JavaScript lives inside `<script type="text/javascript"><![CDATA[ ... ]]>` blocks within each XML file.

The XML lives under **`src/`**, which holds four top-level trees: `src/gcc/` (the modern common library), `src/cm/` (the cm module — currently just its own per-module `src/cm/gcc/` copy of the common library), `src/docs/` (docs + generated API HTML), and `src/as-is/` (the legacy W-Craft-converted business modules: `src/as-is/{fil,ins,mgt,stf}`, where `fil` additionally nests the `bnf` and `inf` sub-trees). The Python linter is under `tools/wsxml_lint/`; Node/Claude tooling sits at the repo root.

There is no app build/run step you can invoke from the shell. "Running" a change means deploying the XML into a WebSquare server and opening the screen in a browser; that is outside this repo. Treat your job as editing the JavaScript inside these XML envelopes correctly and consistently. For **static checks**, the repo carries a lint/test toolchain — see [Toolchain & commands](#toolchain--commands) below.

## Toolchain & commands

A lint/test toolchain sits on top of the raw XML. All commands run from the repo root.

> **Authoring/validating a gcc common XML?** Follow [src/docs/gcc_xml_guide.md](src/docs/gcc_xml_guide.md) — the required `<head>` skeleton, JSDoc + `publicInfo` conventions, `wsxml_lint` rule codes, and a pre-PR checklist.

> **Building a single-page HTML tool/doc under `src/docs/`?** Follow [src/docs/DESIGN.md](src/docs/DESIGN.md) — the shared design system (color tokens, typography, layout grid, components, interaction patterns) so tool pages keep a consistent look. Dependency-free, works from `file://`.

### `wsxml_lint` — the primary check for this tree
A Python/lxml linter under `tools/wsxml_lint/` that parses the WebSquare `.xml` pages directly (the only tool that actually inspects this project's source).

- **Run:** `npm run lint:xml` — a **split** of two scripts:
  - `npm run lint:xml:gcc` → `python -m wsxml_lint src/gcc` (strict) → baseline **`11 files, 0 errors, 0 warnings`**.
  - `npm run lint:xml:legacy` → `python -m wsxml_lint src/as-is/ins src/as-is/mgt src/as-is/stf --ignore WS111,WS112,WS113` → baseline **`108 files, 0 errors, 0 warnings`**.
  - Lint a single file: `python -m wsxml_lint src/gcc/win.xml`.
- **Why the split:** `WS111`/`WS112`/`WS113` fire on *every* legacy page (missing `<head>` `@meta_*` / `<w2:layoutInfo>` / `<w2:dataCollection>`) — a systematic W-Craft conversion gap, not defects (~424 warnings). They are ignored for `src/as-is/ins|mgt|stf` so real issues aren't buried, while `src/gcc` stays strict. To see the full legacy baseline, run `python -m wsxml_lint src/as-is/ins src/as-is/mgt src/as-is/stf` (no `--ignore`).
- **Exit code:** 0 when there are **no errors** (warnings are allowed); 1 if any error.
- **Rule codes:** `WS00x` well-formedness · `WS1xx` structure · `WS2xx` references (e.g. **WS201** = a method named in `<w2:publicInfo>` with no definition in the file's CDATA) · `WS4xx` schema (only with `--xsd`). Narrow output with `--select WS201` / `--ignore WS111,WS112`; `--format json` for machine output; `--min-severity warning|error`.
- **Setup:** needs real Python 3.9+ with `lxml` — `pip install ./tools/wsxml_lint` (the Microsoft Store `python.exe` alias is a stub and must be disabled/avoided). Module tests: `pytest` in `tools/wsxml_lint/`.

### ESLint + Jest (Node) — for extracted `.js` only
`package.json` scripts: `npm run lint` / `lint:fix` (ESLint flat config, `eslint.config.js`) and `npm test` / `test:coverage` (Jest).

> **Caveat:** these only see standalone `.js` files. This project's JS lives inside XML CDATA, so there is currently **no `.js` source for them to act on** — `npm run lint` passes trivially and `npm test` reports "no tests found" (`passWithNoTests`). They are wired up for any pure helpers later **extracted** out of the XML into `.js` (tests go under `test/`). For real checks on the XML tree, use `npm run lint:xml`. The ESLint config declares the WebSquare runtime globals (`WebSquare`, `scwin`, `$c`, `$p`, `$w`, `comFunc`).

### CI
`.github/workflows/ci.yml` runs two jobs on push/PR: **Node** (`npm ci` → `lint` → `test:coverage`) and **wsxml-lint** (install the Python tool → `pytest` → strict `python -m wsxml_lint src/gcc` → de-noised `python -m wsxml_lint src/as-is/ins src/as-is/mgt src/as-is/stf --ignore WS111,WS112,WS113`).

### Subagents (`.claude/agents/`, invoke via the Agent tool)
- **`websquare-code-reviewer`** — read-only review of changed WebSquare JS/XML (API correctness, conventions, dangling component/handler ids). Use before committing.
- **`websquare-common-fn-dev`** — write/refactor shared common functions, reuse-first.
- **`websquare-xml-analyzer`** — analyze/generate XML pages; trace where functions or component ids are used.
- **`websquare-test-doc`** — unit tests + JSDoc for common functions.

## File anatomy

Each file is `<w2:type>COMMON</w2:type>`. A fully-formed `<head>` (all `src/gcc/` files; legacy pages have a bare `<head>` — see WS111 above) carries:
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

### `src/gcc/` — the modern common library (`$c.*`)
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

When writing code in `src/gcc/`, **reuse the `$c.*` helpers** instead of reimplementing (e.g. `$c.util.isEmpty(x)` over hand-rolled emptiness checks, `$c.str.*` for string ops, `$c.win.alert`/`$c.win.confirm` for dialogs, `$c.sbm.*` for all server calls). The files already cross-reference this way.

### `src/cm/` — the cm module's per-module common-library copy
Currently just `src/cm/gcc/` — a **per-module copy** of the `src/gcc/` library (9 files) that is an *older / CM-specific variant*, **not** a newer version. When reconciling it with the canonical `src/gcc/`, cherry-pick only genuinely general improvements into `src/gcc/` and keep CM-specific behavior (different backend endpoints/field names, `/cm/main/...` landing pages, etc.) **out** of the shared lib. `src/cm/` is **not** in the CI lint scope.

### `src/as-is/` — converted business modules (legacy style)
The legacy W-Craft-converted screen libraries, grouped under **`src/as-is/`**: `ins`, `mgt`, `stf`, and `fil` (which additionally nests the `bnf` and `inf` sub-trees). Their scripts begin with the marker:
```
/* ★Wcraft guide★
스크립트 수작업 유의사항   ("script manual-work cautions")
*/
```
This marks code produced by the **W-Craft conversion tool** (migrating an older platform — e.g. Gauce/X-Internet — to WebSquare) and flagged for **manual review/fix-up**. Characteristics that differ from `src/gcc/`:
- Legacy naming: `scwin.fn_com_isur`, `scwin.fn_int2han`, `scwin.fn_DelChar`, `scwin.ins_combo_set`, etc.
- Often commented-out legacy API calls left as porting hints (`//frame.SetImgAction(...)`).
- Bare `<head>` with no `@meta_screenId`/`@meta_screenName` (the source of the WS111 warnings) — these are business screens identified by deploy path, not `$c` namespace providers.
- These modules **consume** common namespaces defined *outside this repo*: `$c.stf.*` (1300+ calls), `$c.frame.*`, `$c.ut.*`, `$c.lce.*`, `$c.info.*`, `$c.rpt.*`, `$c.lcd.*` are called but not defined here (`src/gcc` only provides `$c.util/win/str/num/date/data/validate/sbm/hkey`). This repo is a **partial slice** of the full WebSquare project.

Same-named files recur across directories (`common.xml`, `PopupCalendar.xml`, `calendar_fil.xml`, `filing_common.xml`, `ShiftCrossBrowser_ver.2.4.min.xml`, …) — these are **per-module copies**, not shared. A fix in one is not automatically reflected in the others; check whether the same edit is needed in sibling directories.

Rough module focus (from filenames): `src/as-is/stf/` is the largest — securities/listing flows (new listing, ETN/ELW/bond/digital receiving, `list_common*`, `ods`, `marketMaker`); `src/as-is/ins/` and `src/as-is/mgt/` cover related listing/filing and management screens; `src/as-is/fil/` covers filing flows (ELW/ETN/digital/prelist), with its `bnf` (bond filing) and `inf` (issuer/code settings — `creditGradSetting`, `currencySetting`, …) sub-trees.

## Working in this repo

- Edits are surgical changes to JavaScript **inside** CDATA blocks. Preserve the surrounding XML, the JSDoc format, and the file's existing naming generation (modern `$c`/`scwin.camelCase` in `src/gcc/`; match the legacy `fn_*`/`ins_*` style when editing `src/as-is/ins/`, `src/as-is/mgt/`, `src/as-is/stf/`).
- When you add or rename a public function, update that file's `<w2:publicInfo method="...">` list — `npm run lint:xml` flags a declared-but-undefined method as **WS201**.
- Comments, screen names, and descriptions are in **Korean**; keep new user-facing strings and doc text consistent with the file's language.
- Do not introduce build/JS-module syntax (imports, bundler conventions) — these run as inline browser scripts under WebSquare, calling other screens only through the `$c` / `scwin` scopes.
- After editing XML, run `npm run lint:xml` and keep **both halves at 0 warnings** (`src/gcc` strict, `src/as-is/ins|mgt|stf` with the three conversion-gap rules ignored). A new warning there means a real, non-baseline issue — fix it rather than widening `--ignore`.
