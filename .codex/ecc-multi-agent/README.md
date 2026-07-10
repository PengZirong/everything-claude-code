# ECC Codex Multi-Agent Pack

This directory contains a generated Codex multi-agent role pack derived from the source agents in [`agents/`](../../agents).

Official references:
- [Codex multi-agent guide](https://developers.openai.com/codex/multi-agent)
- [Codex config reference](https://developers.openai.com/codex/config-reference)

> Model availability: this pack currently targets the GPT-5.6 preview models
> exposed by the refreshed Codex catalog. Verify access with the filtered
> `codex debug models` workflow in the sync skill before installing the pack.

## Files

- `config.en.toml` — English role registry for Codex
- `config.zh-CN.toml` — Chinese role registry for Codex
- `agents/en/*.toml` — English role config files generated from source agent markdown
- `agents/zh-CN/*.toml` — Chinese role config files generated from official docs, legacy translation data, or English fallback
- `manifest.json` — source hashes, runtime mapping, translation source, and translation status

## Regeneration

Run:

```bash
node scripts/codex/generate-ecc-multi-agent.js
```

Chinese translation resolution order:

1. [`docs/zh-CN/agents/*.md`](../../docs/zh-CN/agents)
2. [`scripts/codex/ecc-agent-translations.js`](../../scripts/codex/ecc-agent-translations.js)
3. [`agents/*.md`](../../agents) as an English fallback marked with `translationStatus = "missing"`

When an official zh-CN agent doc exists, update it there first. Keep the legacy JS map only for agents that do not have an official zh-CN file yet.

## Role Inventory

| Role | Source | Model | Reasoning | Sandbox | Zh-CN Source | Translation |
|------|--------|-------|-----------|---------|--------------|-------------|
| `a11y-architect` | [agents/a11y-architect.md](../../agents/a11y-architect.md) | `gpt-5.6-terra` | `xhigh` | `workspace-write` | [agents/a11y-architect.md](../../agents/a11y-architect.md) (`source-english-fallback`) | `missing` |
| `agent-evaluator` | [agents/agent-evaluator.md](../../agents/agent-evaluator.md) | `gpt-5.6-terra` | `xhigh` | `read-only` | [agents/agent-evaluator.md](../../agents/agent-evaluator.md) (`source-english-fallback`) | `missing` |
| `architect` | [agents/architect.md](../../agents/architect.md) | `gpt-5.6-sol` | `xhigh` | `read-only` | [docs/zh-CN/agents/architect.md](../../docs/zh-CN/agents/architect.md) (`official-doc`) | `current` |
| `build-error-resolver` | [agents/build-error-resolver.md](../../agents/build-error-resolver.md) | `gpt-5.6-terra` | `xhigh` | `workspace-write` | [docs/zh-CN/agents/build-error-resolver.md](../../docs/zh-CN/agents/build-error-resolver.md) (`official-doc`) | `current` |
| `chief-of-staff` | [agents/chief-of-staff.md](../../agents/chief-of-staff.md) | `gpt-5.6-terra` | `xhigh` | `workspace-write` | [docs/zh-CN/agents/chief-of-staff.md](../../docs/zh-CN/agents/chief-of-staff.md) (`official-doc`) | `current` |
| `code-architect` | [agents/code-architect.md](../../agents/code-architect.md) | `gpt-5.6-terra` | `xhigh` | `read-only` | [docs/zh-CN/agents/code-architect.md](../../docs/zh-CN/agents/code-architect.md) (`official-doc`) | `current` |
| `code-explorer` | [agents/code-explorer.md](../../agents/code-explorer.md) | `gpt-5.6-terra` | `xhigh` | `read-only` | [docs/zh-CN/agents/code-explorer.md](../../docs/zh-CN/agents/code-explorer.md) (`official-doc`) | `current` |
| `code-reviewer` | [agents/code-reviewer.md](../../agents/code-reviewer.md) | `gpt-5.6-terra` | `xhigh` | `read-only` | [docs/zh-CN/agents/code-reviewer.md](../../docs/zh-CN/agents/code-reviewer.md) (`official-doc`) | `current` |
| `code-simplifier` | [agents/code-simplifier.md](../../agents/code-simplifier.md) | `gpt-5.6-terra` | `xhigh` | `workspace-write` | [docs/zh-CN/agents/code-simplifier.md](../../docs/zh-CN/agents/code-simplifier.md) (`official-doc`) | `current` |
| `comment-analyzer` | [agents/comment-analyzer.md](../../agents/comment-analyzer.md) | `gpt-5.6-luna` | `high` | `read-only` | [docs/zh-CN/agents/comment-analyzer.md](../../docs/zh-CN/agents/comment-analyzer.md) (`official-doc`) | `current` |
| `conversation-analyzer` | [agents/conversation-analyzer.md](../../agents/conversation-analyzer.md) | `gpt-5.6-luna` | `high` | `read-only` | [docs/zh-CN/agents/conversation-analyzer.md](../../docs/zh-CN/agents/conversation-analyzer.md) (`official-doc`) | `current` |
| `cpp-build-resolver` | [agents/cpp-build-resolver.md](../../agents/cpp-build-resolver.md) | `gpt-5.6-terra` | `xhigh` | `workspace-write` | [docs/zh-CN/agents/cpp-build-resolver.md](../../docs/zh-CN/agents/cpp-build-resolver.md) (`official-doc`) | `current` |
| `cpp-reviewer` | [agents/cpp-reviewer.md](../../agents/cpp-reviewer.md) | `gpt-5.6-terra` | `xhigh` | `read-only` | [docs/zh-CN/agents/cpp-reviewer.md](../../docs/zh-CN/agents/cpp-reviewer.md) (`official-doc`) | `current` |
| `csharp-reviewer` | [agents/csharp-reviewer.md](../../agents/csharp-reviewer.md) | `gpt-5.6-terra` | `xhigh` | `read-only` | [docs/zh-CN/agents/csharp-reviewer.md](../../docs/zh-CN/agents/csharp-reviewer.md) (`official-doc`) | `current` |
| `dart-build-resolver` | [agents/dart-build-resolver.md](../../agents/dart-build-resolver.md) | `gpt-5.6-terra` | `xhigh` | `workspace-write` | [docs/zh-CN/agents/dart-build-resolver.md](../../docs/zh-CN/agents/dart-build-resolver.md) (`official-doc`) | `current` |
| `database-reviewer` | [agents/database-reviewer.md](../../agents/database-reviewer.md) | `gpt-5.6-terra` | `xhigh` | `read-only` | [docs/zh-CN/agents/database-reviewer.md](../../docs/zh-CN/agents/database-reviewer.md) (`official-doc`) | `current` |
| `django-build-resolver` | [agents/django-build-resolver.md](../../agents/django-build-resolver.md) | `gpt-5.6-terra` | `xhigh` | `workspace-write` | [agents/django-build-resolver.md](../../agents/django-build-resolver.md) (`source-english-fallback`) | `missing` |
| `django-reviewer` | [agents/django-reviewer.md](../../agents/django-reviewer.md) | `gpt-5.6-terra` | `xhigh` | `read-only` | [agents/django-reviewer.md](../../agents/django-reviewer.md) (`source-english-fallback`) | `missing` |
| `doc-updater` | [agents/doc-updater.md](../../agents/doc-updater.md) | `gpt-5.6-luna` | `high` | `workspace-write` | [docs/zh-CN/agents/doc-updater.md](../../docs/zh-CN/agents/doc-updater.md) (`official-doc`) | `current` |
| `docs-lookup` | [agents/docs-lookup.md](../../agents/docs-lookup.md) | `gpt-5.6-luna` | `high` | `read-only` | [docs/zh-CN/agents/docs-lookup.md](../../docs/zh-CN/agents/docs-lookup.md) (`official-doc`) | `current` |
| `e2e-runner` | [agents/e2e-runner.md](../../agents/e2e-runner.md) | `gpt-5.6-terra` | `xhigh` | `workspace-write` | [docs/zh-CN/agents/e2e-runner.md](../../docs/zh-CN/agents/e2e-runner.md) (`official-doc`) | `current` |
| `fastapi-reviewer` | [agents/fastapi-reviewer.md](../../agents/fastapi-reviewer.md) | `gpt-5.6-terra` | `xhigh` | `read-only` | [agents/fastapi-reviewer.md](../../agents/fastapi-reviewer.md) (`source-english-fallback`) | `missing` |
| `flutter-reviewer` | [agents/flutter-reviewer.md](../../agents/flutter-reviewer.md) | `gpt-5.6-terra` | `xhigh` | `read-only` | [docs/zh-CN/agents/flutter-reviewer.md](../../docs/zh-CN/agents/flutter-reviewer.md) (`official-doc`) | `current` |
| `fsharp-reviewer` | [agents/fsharp-reviewer.md](../../agents/fsharp-reviewer.md) | `gpt-5.6-terra` | `xhigh` | `read-only` | [agents/fsharp-reviewer.md](../../agents/fsharp-reviewer.md) (`source-english-fallback`) | `missing` |
| `gan-evaluator` | [agents/gan-evaluator.md](../../agents/gan-evaluator.md) | `gpt-5.6-terra` | `xhigh` | `workspace-write` | [docs/zh-CN/agents/gan-evaluator.md](../../docs/zh-CN/agents/gan-evaluator.md) (`official-doc`) | `current` |
| `gan-generator` | [agents/gan-generator.md](../../agents/gan-generator.md) | `gpt-5.6-terra` | `xhigh` | `workspace-write` | [docs/zh-CN/agents/gan-generator.md](../../docs/zh-CN/agents/gan-generator.md) (`official-doc`) | `current` |
| `gan-planner` | [agents/gan-planner.md](../../agents/gan-planner.md) | `gpt-5.6-terra` | `xhigh` | `workspace-write` | [docs/zh-CN/agents/gan-planner.md](../../docs/zh-CN/agents/gan-planner.md) (`official-doc`) | `current` |
| `go-build-resolver` | [agents/go-build-resolver.md](../../agents/go-build-resolver.md) | `gpt-5.6-terra` | `xhigh` | `workspace-write` | [docs/zh-CN/agents/go-build-resolver.md](../../docs/zh-CN/agents/go-build-resolver.md) (`official-doc`) | `current` |
| `go-reviewer` | [agents/go-reviewer.md](../../agents/go-reviewer.md) | `gpt-5.6-terra` | `xhigh` | `read-only` | [docs/zh-CN/agents/go-reviewer.md](../../docs/zh-CN/agents/go-reviewer.md) (`official-doc`) | `current` |
| `harmonyos-app-resolver` | [agents/harmonyos-app-resolver.md](../../agents/harmonyos-app-resolver.md) | `gpt-5.6-terra` | `xhigh` | `workspace-write` | [agents/harmonyos-app-resolver.md](../../agents/harmonyos-app-resolver.md) (`source-english-fallback`) | `missing` |
| `harness-optimizer` | [agents/harness-optimizer.md](../../agents/harness-optimizer.md) | `gpt-5.6-terra` | `xhigh` | `workspace-write` | [docs/zh-CN/agents/harness-optimizer.md](../../docs/zh-CN/agents/harness-optimizer.md) (`official-doc`) | `current` |
| `healthcare-reviewer` | [agents/healthcare-reviewer.md](../../agents/healthcare-reviewer.md) | `gpt-5.6-sol` | `xhigh` | `read-only` | [docs/zh-CN/agents/healthcare-reviewer.md](../../docs/zh-CN/agents/healthcare-reviewer.md) (`official-doc`) | `current` |
| `homelab-architect` | [agents/homelab-architect.md](../../agents/homelab-architect.md) | `gpt-5.6-terra` | `xhigh` | `read-only` | [agents/homelab-architect.md](../../agents/homelab-architect.md) (`source-english-fallback`) | `missing` |
| `java-build-resolver` | [agents/java-build-resolver.md](../../agents/java-build-resolver.md) | `gpt-5.6-terra` | `xhigh` | `workspace-write` | [docs/zh-CN/agents/java-build-resolver.md](../../docs/zh-CN/agents/java-build-resolver.md) (`official-doc`) | `current` |
| `java-reviewer` | [agents/java-reviewer.md](../../agents/java-reviewer.md) | `gpt-5.6-terra` | `xhigh` | `read-only` | [docs/zh-CN/agents/java-reviewer.md](../../docs/zh-CN/agents/java-reviewer.md) (`official-doc`) | `current` |
| `kotlin-build-resolver` | [agents/kotlin-build-resolver.md](../../agents/kotlin-build-resolver.md) | `gpt-5.6-terra` | `xhigh` | `workspace-write` | [docs/zh-CN/agents/kotlin-build-resolver.md](../../docs/zh-CN/agents/kotlin-build-resolver.md) (`official-doc`) | `current` |
| `kotlin-reviewer` | [agents/kotlin-reviewer.md](../../agents/kotlin-reviewer.md) | `gpt-5.6-terra` | `xhigh` | `read-only` | [docs/zh-CN/agents/kotlin-reviewer.md](../../docs/zh-CN/agents/kotlin-reviewer.md) (`official-doc`) | `current` |
| `loop-operator` | [agents/loop-operator.md](../../agents/loop-operator.md) | `gpt-5.6-terra` | `xhigh` | `workspace-write` | [docs/zh-CN/agents/loop-operator.md](../../docs/zh-CN/agents/loop-operator.md) (`official-doc`) | `current` |
| `marketing-agent` | [agents/marketing-agent.md](../../agents/marketing-agent.md) | `gpt-5.6-terra` | `xhigh` | `read-only` | [agents/marketing-agent.md](../../agents/marketing-agent.md) (`source-english-fallback`) | `missing` |
| `mle-reviewer` | [agents/mle-reviewer.md](../../agents/mle-reviewer.md) | `gpt-5.6-terra` | `xhigh` | `read-only` | [agents/mle-reviewer.md](../../agents/mle-reviewer.md) (`source-english-fallback`) | `missing` |
| `network-architect` | [agents/network-architect.md](../../agents/network-architect.md) | `gpt-5.6-terra` | `xhigh` | `read-only` | [agents/network-architect.md](../../agents/network-architect.md) (`source-english-fallback`) | `missing` |
| `network-config-reviewer` | [agents/network-config-reviewer.md](../../agents/network-config-reviewer.md) | `gpt-5.6-terra` | `xhigh` | `read-only` | [agents/network-config-reviewer.md](../../agents/network-config-reviewer.md) (`source-english-fallback`) | `missing` |
| `network-troubleshooter` | [agents/network-troubleshooter.md](../../agents/network-troubleshooter.md) | `gpt-5.6-terra` | `xhigh` | `read-only` | [agents/network-troubleshooter.md](../../agents/network-troubleshooter.md) (`source-english-fallback`) | `missing` |
| `opensource-forker` | [agents/opensource-forker.md](../../agents/opensource-forker.md) | `gpt-5.6-luna` | `high` | `workspace-write` | [docs/zh-CN/agents/opensource-forker.md](../../docs/zh-CN/agents/opensource-forker.md) (`official-doc`) | `current` |
| `opensource-packager` | [agents/opensource-packager.md](../../agents/opensource-packager.md) | `gpt-5.6-luna` | `high` | `workspace-write` | [docs/zh-CN/agents/opensource-packager.md](../../docs/zh-CN/agents/opensource-packager.md) (`official-doc`) | `current` |
| `opensource-sanitizer` | [agents/opensource-sanitizer.md](../../agents/opensource-sanitizer.md) | `gpt-5.6-terra` | `xhigh` | `read-only` | [docs/zh-CN/agents/opensource-sanitizer.md](../../docs/zh-CN/agents/opensource-sanitizer.md) (`official-doc`) | `current` |
| `performance-optimizer` | [agents/performance-optimizer.md](../../agents/performance-optimizer.md) | `gpt-5.6-terra` | `xhigh` | `workspace-write` | [docs/zh-CN/agents/performance-optimizer.md](../../docs/zh-CN/agents/performance-optimizer.md) (`official-doc`) | `current` |
| `php-reviewer` | [agents/php-reviewer.md](../../agents/php-reviewer.md) | `gpt-5.6-terra` | `xhigh` | `read-only` | [agents/php-reviewer.md](../../agents/php-reviewer.md) (`source-english-fallback`) | `missing` |
| `planner` | [agents/planner.md](../../agents/planner.md) | `gpt-5.6-sol` | `xhigh` | `read-only` | [docs/zh-CN/agents/planner.md](../../docs/zh-CN/agents/planner.md) (`official-doc`) | `current` |
| `pr-test-analyzer` | [agents/pr-test-analyzer.md](../../agents/pr-test-analyzer.md) | `gpt-5.6-terra` | `xhigh` | `read-only` | [docs/zh-CN/agents/pr-test-analyzer.md](../../docs/zh-CN/agents/pr-test-analyzer.md) (`official-doc`) | `current` |
| `python-reviewer` | [agents/python-reviewer.md](../../agents/python-reviewer.md) | `gpt-5.6-terra` | `xhigh` | `read-only` | [docs/zh-CN/agents/python-reviewer.md](../../docs/zh-CN/agents/python-reviewer.md) (`official-doc`) | `current` |
| `pytorch-build-resolver` | [agents/pytorch-build-resolver.md](../../agents/pytorch-build-resolver.md) | `gpt-5.6-terra` | `xhigh` | `workspace-write` | [docs/zh-CN/agents/pytorch-build-resolver.md](../../docs/zh-CN/agents/pytorch-build-resolver.md) (`official-doc`) | `current` |
| `react-build-resolver` | [agents/react-build-resolver.md](../../agents/react-build-resolver.md) | `gpt-5.6-terra` | `xhigh` | `workspace-write` | [agents/react-build-resolver.md](../../agents/react-build-resolver.md) (`source-english-fallback`) | `missing` |
| `react-reviewer` | [agents/react-reviewer.md](../../agents/react-reviewer.md) | `gpt-5.6-terra` | `xhigh` | `read-only` | [agents/react-reviewer.md](../../agents/react-reviewer.md) (`source-english-fallback`) | `missing` |
| `refactor-cleaner` | [agents/refactor-cleaner.md](../../agents/refactor-cleaner.md) | `gpt-5.6-terra` | `xhigh` | `workspace-write` | [docs/zh-CN/agents/refactor-cleaner.md](../../docs/zh-CN/agents/refactor-cleaner.md) (`official-doc`) | `current` |
| `rust-build-resolver` | [agents/rust-build-resolver.md](../../agents/rust-build-resolver.md) | `gpt-5.6-terra` | `xhigh` | `workspace-write` | [docs/zh-CN/agents/rust-build-resolver.md](../../docs/zh-CN/agents/rust-build-resolver.md) (`official-doc`) | `current` |
| `rust-reviewer` | [agents/rust-reviewer.md](../../agents/rust-reviewer.md) | `gpt-5.6-terra` | `xhigh` | `read-only` | [docs/zh-CN/agents/rust-reviewer.md](../../docs/zh-CN/agents/rust-reviewer.md) (`official-doc`) | `current` |
| `security-reviewer` | [agents/security-reviewer.md](../../agents/security-reviewer.md) | `gpt-5.6-terra` | `xhigh` | `read-only` | [docs/zh-CN/agents/security-reviewer.md](../../docs/zh-CN/agents/security-reviewer.md) (`official-doc`) | `current` |
| `seo-specialist` | [agents/seo-specialist.md](../../agents/seo-specialist.md) | `gpt-5.6-terra` | `xhigh` | `read-only` | [docs/zh-CN/agents/seo-specialist.md](../../docs/zh-CN/agents/seo-specialist.md) (`official-doc`) | `current` |
| `silent-failure-hunter` | [agents/silent-failure-hunter.md](../../agents/silent-failure-hunter.md) | `gpt-5.6-terra` | `xhigh` | `read-only` | [docs/zh-CN/agents/silent-failure-hunter.md](../../docs/zh-CN/agents/silent-failure-hunter.md) (`official-doc`) | `current` |
| `spec-miner` | [agents/spec-miner.md](../../agents/spec-miner.md) | `gpt-5.6-sol` | `xhigh` | `workspace-write` | [agents/spec-miner.md](../../agents/spec-miner.md) (`source-english-fallback`) | `missing` |
| `swift-build-resolver` | [agents/swift-build-resolver.md](../../agents/swift-build-resolver.md) | `gpt-5.6-terra` | `xhigh` | `workspace-write` | [agents/swift-build-resolver.md](../../agents/swift-build-resolver.md) (`source-english-fallback`) | `missing` |
| `swift-reviewer` | [agents/swift-reviewer.md](../../agents/swift-reviewer.md) | `gpt-5.6-terra` | `xhigh` | `read-only` | [agents/swift-reviewer.md](../../agents/swift-reviewer.md) (`source-english-fallback`) | `missing` |
| `tdd-guide` | [agents/tdd-guide.md](../../agents/tdd-guide.md) | `gpt-5.6-terra` | `xhigh` | `workspace-write` | [docs/zh-CN/agents/tdd-guide.md](../../docs/zh-CN/agents/tdd-guide.md) (`official-doc`) | `current` |
| `type-design-analyzer` | [agents/type-design-analyzer.md](../../agents/type-design-analyzer.md) | `gpt-5.6-terra` | `xhigh` | `read-only` | [docs/zh-CN/agents/type-design-analyzer.md](../../docs/zh-CN/agents/type-design-analyzer.md) (`official-doc`) | `current` |
| `typescript-reviewer` | [agents/typescript-reviewer.md](../../agents/typescript-reviewer.md) | `gpt-5.6-terra` | `xhigh` | `read-only` | [docs/zh-CN/agents/typescript-reviewer.md](../../docs/zh-CN/agents/typescript-reviewer.md) (`official-doc`) | `current` |
| `vue-reviewer` | [agents/vue-reviewer.md](../../agents/vue-reviewer.md) | `gpt-5.6-terra` | `xhigh` | `read-only` | [agents/vue-reviewer.md](../../agents/vue-reviewer.md) (`source-english-fallback`) | `missing` |
