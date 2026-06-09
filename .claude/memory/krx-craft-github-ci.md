---
name: krx-craft-github-ci
description: "KRX_CRAFT GitHub remote, commit identity, and how to check CI status without gh/token"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 668974ca-a8f1-4156-a6e2-5052a9a99557
---

The project is connected to **https://github.com/jcpark-alt/KRX_CRAFT** (public, default branch `main`).

- **Commit identity** (repo-local config, not global): `jcpark-alt` / `claude_wai_01@inswave.com`.
- **No `gh` CLI and no GitHub token** are available here. Pushing works via Git Credential Manager (`credential.helper=manager`), but API writes (e.g. dispatching a workflow run) can't be done from the shell.
- **Check CI status read-only** via the public Actions API (repo is public, so no auth needed):
  `https://api.github.com/repos/jcpark-alt/KRX_CRAFT/actions/runs` → `.workflow_runs[].status` / `.conclusion`; per-job detail via each run's `jobs_url`.
- CI triggers on push, PR, and **`workflow_dispatch`** (manual "Run workflow" button). The README has a live CI badge.

Env needed to run git in commands: see [[krx-craft-windows-toolchain-env]].
