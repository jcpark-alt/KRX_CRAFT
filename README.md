# KRX_CRAFT

[![CI](https://github.com/jcpark-alt/KRX_CRAFT/actions/workflows/ci.yml/badge.svg)](https://github.com/jcpark-alt/KRX_CRAFT/actions/workflows/ci.yml)

WebSquare (Inswave RIA) source tree for KRX (Korea Exchange) business systems. The
JavaScript lives inside `<script><![CDATA[ ... ]]>` blocks in `.xml` screen pages.

## Layout

| Path | What |
|------|------|
| `src/gcc/` | Modern common library — one `$c.*` namespace per file (`$c.util`, `$c.win`, `$c.str`, …) |
| `src/as-is/ins/`, `src/as-is/mgt/`, `src/as-is/stf/` | W-Craft-converted business modules (legacy style) |
| `tools/wsxml_lint/` | Python/lxml linter for the WebSquare XML pages |
| `.claude/agents/` | Project subagents for WebSquare review / dev / analysis / docs |

## Commands

```bash
npm run lint:xml      # WebSquare XML lint (gcc strict + legacy de-noised)
npm run lint          # ESLint (standalone .js only)
npm run test:wsxml    # install wsxml_lint[test] + run its pytest suite
npm run ci            # full local mirror of CI: lint → jest → wsxml tests → lint:xml
```

`wsxml_lint` needs Python 3.9+ with `lxml` (`pip install ./tools/wsxml_lint`).

## CI

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on push, PR, and manual
dispatch — a **Node** job (ESLint + Jest) and a **WebSquare XML lint** job
(`wsxml_lint` unit tests + strict `src/gcc` lint + de-noised legacy lint).

See [CLAUDE.md](CLAUDE.md) for architecture, conventions, and toolchain details.
