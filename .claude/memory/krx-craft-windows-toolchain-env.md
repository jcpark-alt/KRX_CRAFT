---
name: krx-craft-windows-toolchain-env
description: Windows env quirks for running the KRX_CRAFT toolchain (git/python not on the tool-shell PATH; Store python alias disabled)
metadata: 
  node_type: memory
  type: reference
  originSessionId: 668974ca-a8f1-4156-a6e2-5052a9a99557
---

Running the KRX_CRAFT lint/test toolchain on this Windows machine requires prepending tool dirs to `$env:Path` **in each PowerShell command**, because the harness tool-shell inherits a stale PATH that lacks them (even though they are in the persistent user PATH).

- **Git:** `C:\Program Files\Git\cmd` — not on the tool-shell PATH. Prepend it: `$env:Path = "C:\Program Files\Git\cmd;" + $env:Path`.
- **Python 3.12 (real):** `%LOCALAPPDATA%\Programs\Python\Python312` (+ `\Scripts`). The Microsoft Store `python.exe`/`python3.exe` aliases were **disabled** (renamed to `*.disabled` under `%LOCALAPPDATA%\Microsoft\WindowsApps`). Prepend: `$env:Path = "$py;$py\Scripts;" + $env:Path`.
- **Korean output:** set `$env:PYTHONUTF8 = "1"` so `wsxml_lint` messages (Korean) aren't mojibake.
- **Install the Python linter:** `pip install "./tools/wsxml_lint[test]"` (quote the `[test]` extra so it isn't shell-glob-expanded) → gets `wsxml_lint` + lxml + pytest.

Toolchain commands themselves (npm scripts, split lint, CI mirror) are documented in the repo's CLAUDE.md — don't duplicate them here. Related: [[krx-craft-github-ci]].
