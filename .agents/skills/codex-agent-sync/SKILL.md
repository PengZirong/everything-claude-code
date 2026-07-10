---
name: codex-agent-sync
description: Use when source agent markdown under `agents/` changes, or when the user says things like "同步 Codex agents", "刷新 Codex 多 agent 包", or "更新 Codex agents 翻译" and wants the ECC Codex pack regenerated or checked for drift.
---

# Codex Agent Sync

## Overview

Keep the ECC source agents and the Codex multi-agent pack aligned. The source
of truth is `agents/*.md`. Generated English configs, Chinese configs, and the
manifest live under `.codex/ecc-multi-agent/`.

## One-line trigger

In Codex, prefer a single short message instead of asking the user to run shell
commands manually. Good trigger examples:

- `同步 Codex agents`
- `刷新 Codex 多 agent 包`
- `更新 Codex agents 翻译并检查漂移`

## When to Use

- An existing file in `agents/` changed
- A new agent was added or removed
- The Codex multi-agent role pack needs regeneration
- Chinese translations need refresh
- You need to confirm whether generated files drifted from the source agents

Do not use this skill for one-off manual edits inside `.codex/ecc-multi-agent/` without updating the source or translation data.

## Model Discovery Policy

Never infer the latest model from the current generator, generated pack, commit
history, or model-name sorting alone.

1. Run `codex --version`.
2. Refresh the online Codex model catalog without exposing its raw instructions:

   ```bash
   codex debug models | node -e 'let raw="";process.stdin.on("data",chunk=>raw+=chunk).on("end",()=>{const data=JSON.parse(raw);const models=Array.isArray(data)?data:data.models;console.log(JSON.stringify(models.filter(model=>model.visibility==="list").map(({slug,description,visibility,supported_in_api,supported_reasoning_levels})=>({slug,description,visibility,supported_in_api,supported_reasoning_levels})),null,2))})'
   ```

   Do not add `--bundled`; the default refreshes the catalog. Never run the raw
   command without the allowlist filter because the catalog also contains
   `base_instructions` and `model_messages`.
3. Read only cache audit metadata and report it:

   ```bash
   node -e 'const fs=require("fs"),os=require("os"),path=require("path");const home=process.env.CODEX_HOME||path.join(os.homedir(),".codex");const {fetched_at,client_version}=JSON.parse(fs.readFileSync(path.join(home,"models_cache.json"),"utf8"));console.log(JSON.stringify({fetched_at,client_version},null,2))'
   ```

   Never print or copy the raw `models_cache.json`. Stop if the refreshed
   catalog or cache metadata cannot be read.
4. Use the `openai-docs` skill to check
   `https://developers.openai.com/api/docs/models` and report whether the
   selected models are public, preview, or unavailable. The refreshed Codex
   catalog is the source of truth for what this installation can select; the
   public docs establish portability for other users.
5. Select only models with `visibility: "list"` and every required reasoning
   level. If the best locally available model is not broadly public, get user
   confirmation before committing it. Never silently fall back.

The currently approved mapping is:

| Source tier | Codex model | Reasoning |
|-------------|-------------|-----------|
| `opus` | `gpt-5.6-sol` | `xhigh` |
| `sonnet` | `gpt-5.6-terra` | `xhigh` |
| `haiku` | `gpt-5.6-luna` | `high` |

When the refreshed catalog changes, update the mapping test first and confirm
it fails before changing the generator.

## Branch Policy

Treat `codex/codex-multi-agent-pack` as a linear Codex patch stack on top of
`upstream/main`. In this repository, `upstream` is the canonical source
repository and `origin` is only the user's fork or push target. Do not use
`origin/main` or local `main` as the synchronization baseline unless the user
explicitly overrides the remote and branch.

`upstream/main` is mandatory for this workflow. Stop instead of falling back to
another branch when any of these checks fail:

- `git remote get-url upstream`
- `git fetch upstream --prune`
- `git rev-parse --verify upstream/main`

When syncing, rebase onto `upstream/main` or rebuild the branch from
`upstream/main` and replay only the Codex patch commits that still belong in the
stack. Do not merge `main` into this branch.

Keep commit style aligned with the existing stack, such as `feat(codex): ...`,
`fix(codex): ...`, and `fix(skills): ...`. If the branch already contains a
merge commit, noisy fork tracking state, or an unexplained large patch stack,
rewrite it back to a short linear stack and update the remote with
`git push --force-with-lease` only when the user asked for push/remote update.

## Rebuild Policy

Rebuild the commit tree instead of doing a plain rebase when the current branch
is not a clean upstream patch stack. Examples:

- `git status --short --branch` shows large fork tracking noise such as hundreds
  of commits ahead/behind `origin/...`
- `git log --merges upstream/main..HEAD` shows merge commits
- `git log --oneline upstream/main..HEAD` contains unrelated release, sync,
  version, or upstream history commits
- the branch history cannot be explained as a small set of Codex pack, skill,
  generator, or test commits

Before any destructive rebuild step, protect the current worktree:

1. Run `git status --short --branch`.
2. If there are uncommitted changes, create a backup branch such as
   `backup/codex-agent-sync-YYYYMMDD-HHMM`.
3. Stash all current changes with `git stash push -u -m "codex-agent-sync before rebuild"`
   or make a temporary WIP commit before resetting.
4. Only after the current state is recoverable, reset or recreate the branch
   from `upstream/main`.

When rebuilding, do not mechanically replay every old ahead commit. Cherry-pick
only commits that are current, explainable, and directly related to the Codex
agent pack, this skill, the generator, or the matching tests. Prefer commits
whose subjects match `feat(codex): ...`, `fix(codex): ...`, or
`fix(skills): ...`. If a commit is ambiguous, inspect `git show --stat` and ask
the user before carrying it forward.

## Workflow

1. Run `git status --short --branch` and note whether the worktree is dirty.
2. Verify the canonical upstream baseline with `git remote get-url upstream`,
   `git fetch upstream --prune`, and `git rev-parse --verify upstream/main`.
   Stop if any command fails.
3. Inspect the patch stack:
   - `git rev-list --left-right --count upstream/main...HEAD`
   - `git log --oneline --decorate upstream/main..HEAD`
   - `git log --merges upstream/main..HEAD`
4. If the branch is a clean short patch stack, rebase onto `upstream/main`.
   Otherwise, follow the Rebuild Policy and recreate a short patch stack from
   `upstream/main`.
5. Follow the Model Discovery Policy and record the selected model evidence.
6. Treat `agents/*.md` as the English source of truth.
7. Prefer `docs/zh-CN/agents/*.md` as the primary Chinese translation source
   when an official zh-CN agent doc exists.
8. Use `scripts/codex/ecc-agent-translations.js` only as a fallback for agents
   that do not have an official zh-CN doc yet.
9. If neither source exists, let the generator fall back to the English source
   and inspect `manifest.json` for `translationStatus: "missing"` entries that
   still need zh-CN coverage.
10. Run `node scripts/codex/generate-ecc-multi-agent.js`.
11. Inspect `.codex/ecc-multi-agent/manifest.json` for model mapping,
    translation source, and
    translation status.
12. Run `node tests/codex-multi-agent-pack.test.js`.
13. If the user asked for a broader verification pass, run `npm test`.

## Completion Checks

Do not call the sync complete until both the generated pack and the branch
relationship are verified:

- `git merge-base --is-ancestor upstream/main HEAD` succeeds
- `git rev-list --left-right --count upstream/main...HEAD` has `0` on the left
- `git log --oneline --decorate upstream/main..HEAD` shows only a short,
  explainable Codex patch stack
- generated English and zh-CN config counts match the current `agents/*.md`
  source count
- `codex debug models` lists every selected model and required reasoning level
- `models_cache.json` freshness and official public/preview status are reported
- every manifest model matches the approved source-tier mapping
- `.codex/ecc-multi-agent/manifest.json` has been inspected for translation
  source and status
- `node tests/codex-multi-agent-pack.test.js` passes
- `git status --short --branch` is reported to the user, including whether
  changes are uncommitted or not pushed

## Files

- Source agents: `agents/*.md`
- Official zh-CN docs: `docs/zh-CN/agents/*.md`
- Generator: `scripts/codex/generate-ecc-multi-agent.js`
- Legacy zh-CN fallback: `scripts/codex/ecc-agent-translations.js`
- Generated pack: `.codex/ecc-multi-agent/`
- Canonical sync skill: `skills/codex-agent-sync/SKILL.md`
- Codex skill metadata: `.agents/skills/codex-agent-sync/agents/openai.yaml`

## Rules

- Never hand-edit generated TOML files as the final fix.
- Never claim a model is current without refreshing `codex debug models`.
- Never select hidden models or silently fall back when an approved model is unavailable.
- Keep English output generated from source, not duplicated manually.
- Prefer official zh-CN agent docs over the legacy JS translation map.
- Keep Chinese translations one-to-one with agent names.
- When a role still depends on the legacy JS map, refresh the matching `sourceSha256` there.
- Treat `translationStatus: "missing"` as a follow-up signal to add official or fallback zh-CN coverage.
