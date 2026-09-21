# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A **WebSquare (Inswave) source tree** for KRX (Korea Exchange) business systems. Every file is a `.xml` WebSquare *screen* document, normally authored in the WebSquare IDE; here they are edited as source. JavaScript lives inside `<script type="text/javascript"><![CDATA[ ... ]]>` blocks within each XML file.

The XML lives under **`cm/`** (renamed from `src/` on 2026-09-16 so the repo layout mirrors the WebSquare deploy path `/cm/...` that `websquare/config.xml` uses — e.g. `cm/gcc/util.xml` deploys as `/cm/gcc/util.xml`; commit messages and history docs written before that date still say `src/`). It holds these top-level trees: `cm/gcc/` (the modern common library), `cm/pcc/` (KRX business-common), `cm/docs/` (docs + generated API HTML), `cm/udc/`, and `cm/as-is/` (the legacy W-Craft-converted business modules: `cm/as-is/{fil,ins,mgt,stf}`, where `fil` additionally nests the `bnf` and `inf` sub-trees). (Unrelated to today's `cm/` root: the old `src/cm/` folder was the cm module's per-module copy of the gcc library, removed 2026-08-18; `cm/gcc/` is the single canonical library.) Outside `cm/`, **`websquare/`** at the repo root holds the deploy-config reference (`websquare/config.xml` / `config.js` — the `$c` module registry and engine hooks) and the engine bundle under `websquare/engine/` (moved there from `cm/engine` + `cm/websquare` on 2026-09-16). **`conversion/`** at the repo root (moved out of `cm/` on 2026-09-21 because it is tooling rather than deployable XML) holds the conversion tooling (`conversion/tools/` — `convert.py`, `gcc_mapping.py`, `gen_index_transfer.py`), the samples (`conversion/sample-front/`), the rule/guide docs (`conversion/md/`), and the per-module conversions (`conversion/next-krx-lds-*-front/`, `conversion/jsp-front/`). The Python linter is under `tools/wsxml_lint/`; Node/Claude tooling sits at the repo root.

There is no app build/run step you can invoke from the shell. "Running" a change means deploying the XML into a WebSquare server and opening the screen in a browser; that is outside this repo. Treat your job as editing the JavaScript inside these XML envelopes correctly and consistently. For **static checks**, the repo carries a lint/test toolchain — see [Toolchain & commands](#toolchain--commands) below.

## Toolchain & commands

A lint/test toolchain sits on top of the raw XML. All commands run from the repo root.

> **Authoring/validating a gcc common XML?** Follow [cm/docs/gcc_xml_guide.md](cm/docs/gcc_xml_guide.md) — the required `<head>` skeleton, JSDoc + `publicInfo` conventions, `wsxml_lint` rule codes, and a pre-PR checklist.

> **Building a single-page HTML tool/doc under `cm/docs/`?** Follow [cm/docs/DESIGN.md](cm/docs/DESIGN.md) — the shared design system (color tokens, typography, layout grid, components, interaction patterns) so tool pages keep a consistent look. Dependency-free, works from `file://`.

> **Regenerating the gcc API docs (`cm/docs/api/gcc/index.html`)?** Follow [cm/docs/gcc_api_docgen.md](cm/docs/gcc_api_docgen.md) — how `npm run docs:gcc` (the `wsxml_lint.docgen` pipeline) extracts `publicInfo`-listed `scwin.*` functions + their JSDoc and renders the single self-contained HTML. Never hand-edit the generated file.

> **Regenerating the gcc transfer-mapping doc (`cm/docs/api/gcc/index_transfer.html`)?** Follow [cm/docs/gcc_index_transfer_docgen.md](cm/docs/gcc_index_transfer_docgen.md) — `npm run docs:transfer` (`conversion/tools/gen_index_transfer.py`) aggregates the fil/ins/mgt `index_transfer.html` `DATA` arrays (the SOT, via `gcc_mapping.py`) + a `CONV_RULES` constant into the combined HTML. Edit the module `DATA` (not this generated file), then regenerate.

### `wsxml_lint` — the primary check for this tree
A Python/lxml linter under `tools/wsxml_lint/` that parses the WebSquare `.xml` pages directly (the only tool that actually inspects this project's source).

- **Run:** `npm run lint:xml` — a **split** of two scripts:
  - `npm run lint:xml:gcc` → `python -m wsxml_lint cm/gcc` (strict) → baseline **`13 files, 0 errors, 0 warnings`**.
  - `npm run lint:xml:legacy` → `python -m wsxml_lint cm/as-is/ins cm/as-is/mgt cm/as-is/stf cm/as-is/fil --ignore WS111,WS112,WS113` → baseline **`227 files, 0 errors, 0 warnings`**.
  - Lint a single file: `python -m wsxml_lint cm/gcc/win.xml`.
- **Why the split:** `WS111`/`WS112`/`WS113` fire on *every* legacy page (missing `<head>` `@meta_*` / `<w2:layoutInfo>` / `<w2:dataCollection>`) — a systematic W-Craft conversion gap, not defects (~424 warnings). They are ignored for `cm/as-is/ins|mgt|stf|fil` so real issues aren't buried, while `cm/gcc` stays strict. To see the full legacy baseline, run `python -m wsxml_lint cm/as-is/ins cm/as-is/mgt cm/as-is/stf cm/as-is/fil` (no `--ignore`).
- **Exit code:** 0 when there are **no errors** (warnings are allowed); 1 if any error.
- **Rule codes:** `WS00x` well-formedness · `WS1xx` structure · `WS2xx` references (e.g. **WS201** = a method named in `<w2:publicInfo>` with no definition in the file's CDATA) · `WS4xx` schema (only with `--xsd`). Narrow output with `--select WS201` / `--ignore WS111,WS112`; `--format json` for machine output; `--min-severity warning|error`.
- **Setup:** needs real Python 3.9+ with `lxml` — `pip install ./tools/wsxml_lint` (the Microsoft Store `python.exe` alias is a stub and must be disabled/avoided). Module tests: `pytest` in `tools/wsxml_lint/`.

### ESLint + Jest (Node) — for extracted `.js` only
`package.json` scripts: `npm run lint` / `lint:fix` (ESLint flat config, `eslint.config.js`) and `npm test` / `test:coverage` (Jest).

> **Caveat:** these only see standalone `.js` files. This project's JS lives inside XML CDATA, so there is currently **no `.js` source for them to act on** — `npm run lint` passes trivially and `npm test` reports "no tests found" (`passWithNoTests`). They are wired up for any pure helpers later **extracted** out of the XML into `.js` (tests go under `test/`). For real checks on the XML tree, use `npm run lint:xml`. The ESLint config declares the WebSquare runtime globals (`WebSquare`, `scwin`, `$c`, `$p`, `$w`, `comFunc`).

### CI
`.github/workflows/ci.yml` runs two jobs on push/PR: **Node** (`npm ci` → `lint` → `test:coverage`) and **wsxml-lint** (install the Python tool → `pytest` → strict `python -m wsxml_lint cm/gcc` → de-noised `python -m wsxml_lint cm/as-is/ins cm/as-is/mgt cm/as-is/stf cm/as-is/fil --ignore WS111,WS112,WS113`).

### Subagents (`.claude/agents/`, invoke via the Agent tool)
- **`websquare-code-reviewer`** — read-only review of changed WebSquare JS/XML (API correctness, conventions, dangling component/handler ids). Use before committing.
- **`websquare-common-fn-dev`** — write/refactor shared common functions, reuse-first.
- **`websquare-xml-analyzer`** — analyze/generate XML pages; trace where functions or component ids are used.
- **`websquare-test-doc`** — unit tests + JSDoc for common functions.

## File anatomy

Each file is `<w2:type>COMMON</w2:type>`. A fully-formed `<head>` (all `cm/gcc/` files; legacy pages have a bare `<head>` — see WS111 above) carries:
- `meta_screenId` — the namespace the file registers, e.g. `meta_screenId="$c.util"`.
- `meta_screenName` / `meta_desc` — Korean description of the file's purpose.
- `<w2:publicInfo method="scwin.a,scwin.b,...">` — the **explicit public API**. Only functions listed here are exposed externally. Functions defined but not listed are effectively private to the file.
- A single `<script>` CDATA block containing all the JavaScript.

### Naming & visibility conventions (follow these)
- Functions are defined as `scwin.functionName = function () { ... }`.
- Within a file, a public `scwin.foo` is registered under that file's namespace and called from elsewhere as `$c.<ns>.foo()` (e.g. `$c.util.isEmpty`, `$c.str.getByteLength`). The `$c` object is the cross-file common-library accessor; `scwin` is the current screen's scope.
- A leading underscore marks an **internal helper**: `@hidden Y` in JSDoc and **never listed in `publicInfo`** (not exposed outside the file). Two prefixes: `scwin._foo` for helpers whose body uses `$p` or `$c`, `scwin.__foo` for pure helpers that use neither. Public wrappers (`scwin.foo`, `@hidden N`, listed in `publicInfo`) typically delegate to a `_foo`/`__foo` implementation, called as `scwin._foo()` within the file (never `$c.<ns>._foo`). **Exception — engine hooks:** `$c` functions that the WebSquare config (`websquare/config.js` / `config.xml`) references by name are exempt from the rule: they keep their `_`/`__` prefix but must stay listed in `publicInfo` (`@hidden N`), because the engine only exposes `publicInfo` methods on `$c.<ns>` (currently `$c.sbm.__preSubmitFunction`/`__callbackSubmitFunction`/`__submitErrorHandler` and `$c.win._errorHandler`); rename them only together with the config files. A helper whose body needs the calling screen's `$p` should not be a `_` helper at all: fold it into the public function so the build injects `$p` (precedent: `$c.data.getParameter`, whose wrapper/`_getParameter` split was removed), and never pass `$p` explicitly at call sites.
- Every function carries a JSDoc block with `@method`, `@name`, `@description`, `@param`, `@returns`, `@hidden Y|N`, `@example`. Keep this format when adding functions, and **keep `publicInfo` in sync** when you add/remove a public function.

## Architecture: two generations of code

This tree mixes a modern shared library with older converted business code. The distinction matters for how you write and reuse code.

### `cm/gcc/` — the modern common library (`$c.*`)
The actively maintained core (most recent edits). Each file is one namespace under `$c`, fully JSDoc'd by "Inswave Systems", and they call each other through `$c`:

| File | Namespace | Responsibility |
|------|-----------|----------------|
| `util.xml` | `$c.util` | Component control, type checks (`isEmpty`/`isArray`/`isJSON`), file & Excel up/download, clipboard, timers |
| `win.xml` | `$c.win` | Business-screen control: auth, popups, alerts/confirm, navigation, i18n/language, history |
| `exception.xml` | `$c.exception` | Screen try/catch error handling (`handleError`) + error reporting hook (`reportError`, inactive until `ERROR_REPORT_INFO.URL` is set) |
| `str.xml` | `$c.str` | String formatting/validation (SSN, phone, email, byte-length, escaping) |
| `num.xml` | `$c.num` | Number helpers |
| `date.xml` | `$c.date` | Date helpers |
| `data.xml` | `$c.data` | Common codes & messages, DataCollection control, global/screen data transfer, validation |
| `validate.xml` | `$c.validate` | Business-screen validation |
| `sbm.xml` | `$c.sbm` | **Server communication** — submit/workflow/dynamic calls; defines `CONTEXT_PATH`, `SERVICE_URL`, async/JSON defaults, `MESSAGE_CODE` (E/S/W/I) |
| `hkey.xml` | `$c.hkey` | Keyboard shortcuts |
| `ext.xml` | `$c.ext` | External-solution integration (SBChart) |
| `cert.xml` | `$c.cert` | **Public-certificate (Initech INISAFE Sign + Raon TransKey) integration** — module init, keypad z-index fix, keypad-use toggle, `auth()` wrapper. Vendor scripts are loaded **statically only** as `<engine><module>` entries in `websquare/config.xml`/`config.js` (crosswebex6.js uses `document.write` at load, so never inject it dynamically; the engine loads modules async so that `document.write` is ignored — `initech-shell-guard.js`, loaded first in the vendor group, captures and replays it right after each vendor script and also keeps the native `Promise` against bluebird); `$c.cert` is itself registered there too |

When writing code in `cm/gcc/`, **reuse the `$c.*` helpers** instead of reimplementing (e.g. `$c.util.isEmpty(x)` over hand-rolled emptiness checks, `$c.str.*` for string ops, `$c.win.alert`/`$c.win.confirm` for dialogs, `$c.sbm.*` for all server calls). The files already cross-reference this way.

### `cm/as-is/` — converted business modules (legacy style)
The legacy W-Craft-converted screen libraries, grouped under **`cm/as-is/`**: `ins`, `mgt`, `stf`, and `fil` (which additionally nests the `bnf` and `inf` sub-trees). Their scripts begin with the marker:
```
/* ★Wcraft guide★
스크립트 수작업 유의사항   ("script manual-work cautions")
*/
```
This marks code produced by the **W-Craft conversion tool** (migrating an older platform — e.g. Gauce/X-Internet — to WebSquare) and flagged for **manual review/fix-up**. Characteristics that differ from `cm/gcc/`:
- Legacy naming: `scwin.fn_com_isur`, `scwin.fn_int2han`, `scwin.fn_DelChar`, `scwin.ins_combo_set`, etc.
- Often commented-out legacy API calls left as porting hints (`//frame.SetImgAction(...)`).
- Bare `<head>` with no `@meta_screenId`/`@meta_screenName` (the source of the WS111 warnings) — these are business screens identified by deploy path, not `$c` namespace providers.
- These modules **consume** common namespaces defined *outside this repo*: `$c.stf.*` (1300+ calls), `$c.frame.*`, `$c.ut.*`, `$c.lce.*`, `$c.info.*`, `$c.rpt.*`, `$c.lcd.*` are called but not defined here (`cm/gcc` only provides `$c.util/win/exception/str/num/date/data/validate/sbm/hkey`). This repo is a **partial slice** of the full WebSquare project.

Same-named files recur across directories (`common.xml`, `PopupCalendar.xml`, `calendar_fil.xml`, `filing_common.xml`, `ShiftCrossBrowser_ver.2.4.min.xml`, …) — these are **per-module copies**, not shared. A fix in one is not automatically reflected in the others; check whether the same edit is needed in sibling directories.

Rough module focus (from filenames): `cm/as-is/stf/` is the largest — securities/listing flows (new listing, ETN/ELW/bond/digital receiving, `list_common*`, `ods`, `marketMaker`); `cm/as-is/ins/` and `cm/as-is/mgt/` cover related listing/filing and management screens; `cm/as-is/fil/` covers filing flows (ELW/ETN/digital/prelist), with its `bnf` (bond filing) and `inf` (issuer/code settings — `creditGradSetting`, `currencySetting`, …) sub-trees.

## Working in this repo

- Edits are surgical changes to JavaScript **inside** CDATA blocks. Preserve the surrounding XML, the JSDoc format, and the file's existing naming generation (modern `$c`/`scwin.camelCase` in `cm/gcc/`; match the legacy `fn_*`/`ins_*` style when editing `cm/as-is/ins/`, `cm/as-is/mgt/`, `cm/as-is/stf/`, `cm/as-is/fil/`).
- When you add or rename a public function, update that file's `<w2:publicInfo method="...">` list — `npm run lint:xml` flags a declared-but-undefined method as **WS201**. **For `cm/gcc/` changes, also regenerate the API docs** with `npm run docs:gcc` — the committed `cm/docs/api/gcc/index.html` is generated from `publicInfo` + JSDoc and goes stale otherwise (see [cm/docs/gcc_api_docgen.md](cm/docs/gcc_api_docgen.md)).
- Comments, screen names, and descriptions are in **Korean**; keep new user-facing strings and doc text consistent with the file's language.
- Do not introduce build/JS-module syntax (imports, bundler conventions) — these run as inline browser scripts under WebSquare, calling other screens only through the `$c` / `scwin` scopes.
- After editing XML, run `npm run lint:xml` and keep **both halves at 0 warnings** (`cm/gcc` strict, `cm/as-is/ins|mgt|stf|fil` with the three conversion-gap rules ignored). A new warning there means a real, non-baseline issue — fix it rather than widening `--ignore`.
