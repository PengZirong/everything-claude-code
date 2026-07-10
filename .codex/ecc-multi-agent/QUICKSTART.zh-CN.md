# ECC Codex agents 快速更新与使用说明

这份说明面向维护这套转换包的人。你可以用它快速刷新
`.codex/ecc-multi-agent/` 里的生成结果，并把这些 agents 接入 Codex。

> **Note:** 这套 pack 当前使用 Codex 模型目录中的 GPT-5.6 预览模型：
> `gpt-5.6-sol`、`gpt-5.6-terra` 和 `gpt-5.6-luna`。安装前必须通过
> sync skill 的过滤命令确认当前账号可见这些模型；不会静默回退。

## 文件位置

这套转换包全部放在新增目录里，不依赖修改仓库原有的 tracked 配置文件。

- 源 agents：`agents/*.md`
- 官方中文 agents：`docs/zh-CN/agents/*.md`
- 旧版中文兜底：`scripts/codex/ecc-agent-translations.js`
- 生成脚本：`scripts/codex/generate-ecc-multi-agent.js`
- 生成结果：`.codex/ecc-multi-agent/`
- 同步 skill 规范源：`skills/codex-agent-sync/SKILL.md`
- Codex skill 镜像：`.agents/skills/codex-agent-sync/SKILL.md`

## 一句话触发

如果你在 Codex 里想快速更新这套包，优先直接发一句话，让 Codex 命中
`codex-agent-sync` skill，而不是手动敲命令。

可直接使用这些一句话：

- `同步 Codex agents`
- `刷新 Codex 多 agent 包`
- `更新 Codex agents 翻译并检查漂移`

这条一句话会走的实际流程是：

1. 用过滤后的 `codex debug models` 在线刷新并核对可用模型。
2. 检查 `agents/*.md` 是否变化。
3. 优先从 `docs/zh-CN/agents/*.md` 读取官方中文。
4. 如果某个 agent 还没有官方中文，再回退到 `scripts/codex/ecc-agent-translations.js`。
5. 如果两边都没有，就暂时回退到英文源，并在 `manifest.json` 里标记为 `translationStatus: "missing"`。
6. 运行生成脚本刷新 `.codex/ecc-multi-agent/`。
7. 运行快速测试确认转换包没有漂移。

## 快速更新

当 `agents/*.md` 有新增、删除或内容调整时，最简单的方式是先在 Codex
里发送上一节的一句话。只有在你需要手动调试时，再按下面步骤执行。

1. 如果英文源 agent 变了，先更新
   `docs/zh-CN/agents/*.md` 里的官方中文版本。
2. 如果某个 role 还没有官方 zh-CN 文件，再更新
   `scripts/codex/ecc-agent-translations.js` 里对应条目的中文描述、
   `developerInstructions` 和 `sourceSha256`。
3. 在仓库根目录运行：

   ```bash
   node scripts/codex/generate-ecc-multi-agent.js
   ```

4. 检查 `.codex/ecc-multi-agent/manifest.json`，确认每个 agent 的
   `translationSource` 和 `translationStatus` 符合预期。
5. 运行快速校验：

   ```bash
   node tests/codex-multi-agent-pack.test.js
   ```

如果你还想做仓库级回归，再运行 `npm test`。

## 在 Codex 中使用这些 agents

Codex 多 agent 角色定义需要写进实际生效的 Codex 配置文件。这套转换包已
经帮你准备好可直接复制的片段。

### 1. 选择语言版本

根据你想让 Codex 显示的 agent 描述语言，选择其中一个文件：

- 英文版：`.codex/ecc-multi-agent/config.en.toml`
- 中文版：`.codex/ecc-multi-agent/config.zh-CN.toml`

这两个文件都包含：

- `[features] multi_agent = true`
- `[agents]` 的线程和深度设置
- 每个 `[agents.<name>]` 的 `description`
- 指向独立 role TOML 的 `config_file`

### 2. 先复制 role 文件

`config.en.toml` 和 `config.zh-CN.toml` 里的 `config_file` 是给别人复制后直接可用的
相对路径，默认指向 `.codex/agents/*.toml`。所以先把对应语言的 role TOML 复制到 `.codex/agents/`。

- 英文配置：把 `.codex/ecc-multi-agent/agents/en/*.toml` 复制到 `.codex/agents/`
- 中文配置：把 `.codex/ecc-multi-agent/agents/zh-CN/*.toml` 复制到 `.codex/agents/`

### 3. 再合并到你的 Codex 配置

把你选中的配置片段合并到你真正使用的 Codex 配置文件中。通常是：

- 项目级：`.codex/config.toml`
- 或用户级：`~/.codex/config.toml`

保持 `config_file` 路径不变即可。这里的路径是按终端用户的 `.codex/` 目录布局写的，
例如：

```toml
[agents."planner"]
description = "实现规划代理，适用于复杂功能、重构和多阶段任务拆解。"
config_file = "agents/planner.toml"
```

### 4. 理解 role 文件的职责

每个 role TOML 都只负责 Codex agent 运行时参数，不重复维护 agent 名称和
注册入口。

- 英文 role 文件：`.codex/ecc-multi-agent/agents/en/*.toml`
- 中文 role 文件：`.codex/ecc-multi-agent/agents/zh-CN/*.toml`

每个文件包含：

- `model`
- `model_reasoning_effort`
- `sandbox_mode`
- `developer_instructions`

英文版 `developer_instructions` 直接来自 `agents/*.md` 的正文。中文版优先使用
官方 `docs/zh-CN/agents/*.md`，缺失时才回退到旧版映射；如果两者都缺失，
会暂时复用英文正文并在 manifest 里标记为 `missing`。

## 推荐使用方式

如果你想尽量减少与上游仓库的冲突，优先采用下面的方式。

1. 不修改仓库已有 tracked 文件。
2. 把 `config.en.toml` 或 `config.zh-CN.toml` 作为参考，合并到你自己的
   用户级 Codex 配置。
3. 保持 `.codex/ecc-multi-agent/`、`scripts/codex/` 和专用 skill 作为独立
   新增目录维护。

这样你后续拉取上游仓库时，只需要处理这几个新增路径。

## 常见检查点

在你准备提交或重新生成之前，先确认下面几项。

- `manifest.json` 中的 `sourceAgentCount` 等于当前 `agents/*.md` 数量
- 当前 Codex 目录可见 `gpt-5.6-sol`、`gpt-5.6-terra` 和 `gpt-5.6-luna`
- 官方已覆盖的 role 使用 `docs/zh-CN/agents/*.md`
- 没有官方 zh-CN 的 role 才回退到 `scripts/codex/ecc-agent-translations.js`
- `translationStatus: "missing"` 的条目已被识别并准备后续补齐
- 英文和中文目录下的 role 文件数量一致
- `node tests/codex-multi-agent-pack.test.js` 通过

## Next steps

如果你后面还要继续扩展这套转换包，优先做两件事。

1. 把新的 agent 先加到 `agents/`，优先补 `docs/zh-CN/agents/`，必要时再补旧版兜底映射。
2. 使用 `codex-agent-sync` skill 作为后续同步这套包的固定入口。
