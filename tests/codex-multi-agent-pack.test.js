/**
 * Tests for the generated ECC Codex multi-agent pack.
 *
 * Run with: node tests/codex-multi-agent-pack.test.js
 */

const assert = require('assert');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const {
  extractFrontmatter,
  resolveChineseTranslation,
  sha256,
  TRANSLATION_RESOLUTION_ORDER,
} = require('../scripts/codex/load-ecc-agent-translation');

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${err.message}`);
    return false;
  }
}

const repoRoot = path.join(__dirname, '..');
const sourceAgentsDir = path.join(repoRoot, 'agents');
const packDir = path.join(repoRoot, '.codex', 'ecc-multi-agent');
const englishConfigPath = path.join(packDir, 'config.en.toml');
const chineseConfigPath = path.join(packDir, 'config.zh-CN.toml');
const manifestPath = path.join(packDir, 'manifest.json');
const readmePath = path.join(packDir, 'README.md');
const quickstartPath = path.join(packDir, 'QUICKSTART.zh-CN.md');
const englishRoleDir = path.join(packDir, 'agents', 'en');
const chineseRoleDir = path.join(packDir, 'agents', 'zh-CN');
const generatorPath = path.join(repoRoot, 'scripts', 'codex', 'generate-ecc-multi-agent.js');
const rootSkillDir = path.join(repoRoot, 'skills', 'codex-agent-sync');
const agentsSkillDir = path.join(repoRoot, '.agents', 'skills', 'codex-agent-sync');

const expectedModels = {
  opus: { model: 'gpt-5.6-sol', modelReasoningEffort: 'xhigh' },
  sonnet: { model: 'gpt-5.6-terra', modelReasoningEffort: 'xhigh' },
  haiku: { model: 'gpt-5.6-luna', modelReasoningEffort: 'high' },
};

function extractPromptDefenseBaseline(body) {
  return body
    .match(/^## Prompt Defense Baseline\s*\r?\n(?:\s*\r?\n)?(?:- [^\r\n]*(?:\r?\n|$))+/m)?.[0]
    .trim() || '';
}

function snapshotDirectory(directory, root = directory, snapshot = {}) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      snapshotDirectory(entryPath, root, snapshot);
    } else {
      snapshot[path.relative(root, entryPath)] = sha256(fs.readFileSync(entryPath));
    }
  }
  return snapshot;
}

let passed = 0;
let failed = 0;

if (
  test('pack includes English and Chinese config fragments', () => {
    assert.ok(fs.existsSync(englishConfigPath), 'Expected English config fragment at `.codex/ecc-multi-agent/config.en.toml`');
    assert.ok(fs.existsSync(chineseConfigPath), 'Expected Chinese config fragment at `.codex/ecc-multi-agent/config.zh-CN.toml`');
    assert.ok(fs.existsSync(readmePath), 'Expected generated pack README');

    const englishConfig = fs.readFileSync(englishConfigPath, 'utf8');
    const chineseConfig = fs.readFileSync(chineseConfigPath, 'utf8');
    const readme = fs.readFileSync(readmePath, 'utf8');

    assert.ok(
      /\[features\][\s\S]*multi_agent\s*=\s*true/m.test(englishConfig),
      'Expected English config fragment to enable `features.multi_agent`',
    );
    assert.ok(
      /\[features\][\s\S]*multi_agent\s*=\s*true/m.test(chineseConfig),
      'Expected Chinese config fragment to enable `features.multi_agent`',
    );
    assert.ok(
      englishConfig.includes('config_file = "agents/architect.toml"'),
      'Expected English config fragment to use copy-ready `agents/*.toml` paths',
    );
    assert.ok(
      chineseConfig.includes('config_file = "agents/architect.toml"'),
      'Expected Chinese config fragment to use copy-ready `agents/*.toml` paths',
    );
    assert.ok(
      !englishConfig.includes('config_file = "ecc-multi-agent/agents/en/architect.toml"'),
      'Expected English config fragment to avoid repository-specific `ecc-multi-agent/` paths',
    );
    assert.ok(
      !chineseConfig.includes('config_file = "ecc-multi-agent/agents/zh-CN/architect.toml"'),
      'Expected Chinese config fragment to avoid repository-specific `ecc-multi-agent/` paths',
    );
    assert.ok(
      readme.includes('GPT-5.6') && readme.includes('preview'),
      'Expected README to warn about GPT-5.6 preview availability',
    );
  })
)
  passed++;
else failed++;

if (
  test('pack exports one English and one Chinese role file for every source agent', () => {
    assert.ok(fs.existsSync(manifestPath), 'Expected generated manifest at `.codex/ecc-multi-agent/manifest.json`');

    const sourceAgents = fs
      .readdirSync(sourceAgentsDir)
      .filter(file => file.endsWith('.md'))
      .sort();
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    assert.deepStrictEqual(
      manifest.translationSources,
      TRANSLATION_RESOLUTION_ORDER,
      'Expected manifest to record the official-doc -> legacy-js -> English fallback translation order',
    );

    assert.strictEqual(
      manifest.agents.length,
      sourceAgents.length,
      'Expected manifest to include every source agent markdown file',
    );

    const expectedRoleFiles = sourceAgents.map(file => `${path.basename(file, '.md')}.toml`);
    const englishRoleFiles = fs.readdirSync(englishRoleDir).filter(file => file.endsWith('.toml')).sort();
    const chineseRoleFiles = fs.readdirSync(chineseRoleDir).filter(file => file.endsWith('.toml')).sort();
    assert.deepStrictEqual(englishRoleFiles, expectedRoleFiles, 'Expected no stale English role configs');
    assert.deepStrictEqual(chineseRoleFiles, expectedRoleFiles, 'Expected no stale Chinese role configs');

    const manifestByName = Object.fromEntries(manifest.agents.map(agent => [agent.name, agent]));

    for (const sourceFile of sourceAgents) {
      const roleFile = `${path.basename(sourceFile, '.md')}.toml`;
      const englishRolePath = path.join(englishRoleDir, roleFile);
      const chineseRolePath = path.join(chineseRoleDir, roleFile);
      const sourcePath = path.join(sourceAgentsDir, sourceFile);
      assert.ok(fs.existsSync(englishRolePath), `Missing English role config: ${roleFile}`);
      assert.ok(fs.existsSync(chineseRolePath), `Missing Chinese role config: ${roleFile}`);

      const englishRole = fs.readFileSync(englishRolePath, 'utf8');
      const chineseRole = fs.readFileSync(chineseRolePath, 'utf8');
      const sourceMarkdown = fs.readFileSync(sourcePath, 'utf8');
      const { frontmatter, body } = extractFrontmatter(sourceMarkdown);
      const expectedName = path.basename(sourceFile, '.md');
      const sourceHash = sha256(sourceMarkdown);
      const expectedDescription = frontmatter.description;
      const expectedModel = expectedModels[frontmatter.model];
      assert.ok(expectedModel, `Unsupported source model for ${expectedName}: ${frontmatter.model}`);
      const expectedRuntime = {
        ...expectedModel,
        sandboxMode: (frontmatter.tools || []).some(tool => tool === 'Write' || tool === 'Edit')
          ? 'workspace-write'
          : 'read-only',
      };
      const expectedTranslation = resolveChineseTranslation({
        name: expectedName,
        sourceHash,
        englishDescription: expectedDescription,
        englishInstructions: body,
        repoRoot,
      });
      const chineseDeveloperInstructions = expectedTranslation.developerInstructions;
      const promptDefenseBaseline = extractPromptDefenseBaseline(body);
      const manifestAgent = manifestByName[expectedName];

      assert.strictEqual(frontmatter.name, expectedName, `Expected source name to match filename for ${expectedName}`);
      assert.deepStrictEqual(
        {
          sourceSha256: manifestAgent.sourceSha256,
          model: manifestAgent.model,
          modelReasoningEffort: manifestAgent.modelReasoningEffort,
          sandboxMode: manifestAgent.sandboxMode,
        },
        { sourceSha256: sourceHash, ...expectedRuntime },
        `Expected manifest runtime fields to match source agent ${expectedName}`,
      );

      assert.ok(
        englishRole.includes(`name = "${expectedName}"`),
        `Expected English role config to define name = "${expectedName}"`,
      );
      assert.ok(
        englishRole.includes("developer_instructions = '''"),
        `Expected English role config to use TOML literal multiline strings for ${expectedName}`,
      );
      assert.ok(
        chineseRole.includes("developer_instructions = '''"),
        `Expected Chinese role config to use TOML literal multiline strings for ${expectedName}`,
      );
      assert.ok(
        chineseRole.includes(`name = "${expectedName}"`),
        `Expected Chinese role config to define name = "${expectedName}"`,
      );
      for (const role of [englishRole, chineseRole]) {
        assert.ok(role.includes(`# Source SHA256: ${sourceHash}`), `Expected current source hash for ${expectedName}`);
        assert.ok(role.includes(`model = "${expectedRuntime.model}"`), `Expected current model for ${expectedName}`);
        assert.ok(
          role.includes(`model_reasoning_effort = "${expectedRuntime.modelReasoningEffort}"`),
          `Expected current reasoning effort for ${expectedName}`,
        );
        assert.ok(
          role.includes(`sandbox_mode = "${expectedRuntime.sandboxMode}"`),
          `Expected current sandbox mode for ${expectedName}`,
        );
      }
      const englishDescriptionMatch = englishRole.match(/^description = ("(?:[^"\\]|\\.)*")$/m);
      const chineseDescriptionMatch = chineseRole.match(/^description = ("(?:[^"\\]|\\.)*")$/m);

      assert.ok(
        englishDescriptionMatch && JSON.parse(englishDescriptionMatch[1]).trim().length > 0,
        `Expected English role config to define a non-empty description for ${expectedName}`,
      );
      assert.ok(
        chineseDescriptionMatch && JSON.parse(chineseDescriptionMatch[1]).trim().length > 0,
        `Expected Chinese role config to define a non-empty description for ${expectedName}`,
      );
      assert.strictEqual(
        JSON.parse(englishDescriptionMatch[1]),
        expectedDescription,
        `Expected English role config to reuse source agent description for ${expectedName}`,
      );
      assert.strictEqual(
        JSON.parse(chineseDescriptionMatch[1]),
        expectedTranslation.description,
        `Expected Chinese role config to use the resolved zh-CN description for ${expectedName}`,
      );
      if (expectedTranslation.translationSourceType !== 'source-english-fallback') {
        assert.ok(
          /[\u4e00-\u9fff]/.test(chineseDeveloperInstructions),
          `Expected zh-CN instructions to contain Chinese text for ${expectedName}`,
        );
      }
      assert.ok(
        chineseRole.includes(chineseDeveloperInstructions),
        `Expected Chinese role config to use the resolved developer instructions for ${expectedName}`,
      );
      if (promptDefenseBaseline) {
        assert.ok(
          chineseRole.includes(promptDefenseBaseline),
          `Expected Chinese role config to retain the source prompt-defense baseline for ${expectedName}`,
        );
        if (expectedTranslation.translationSourceType !== 'source-english-fallback') {
          const followingEnglishLine = body
            .slice(body.indexOf(promptDefenseBaseline) + promptDefenseBaseline.length)
            .trimStart()
            .split(/\r?\n/, 1)[0];
          assert.ok(
            !chineseRole.includes(`${promptDefenseBaseline}\n\n${followingEnglishLine}`),
            `Expected Chinese role config not to duplicate the English persona for ${expectedName}`,
          );
        }
      }
      assert.ok(
        chineseRole.includes(`# Translation status: ${expectedTranslation.translationStatus}`),
        `Expected Chinese role config to annotate translation status for ${expectedName}`,
      );
      assert.ok(
        chineseRole.includes(
          `# Translation source: ${expectedTranslation.translationSource} (${expectedTranslation.translationSourceType})`,
        ),
        `Expected Chinese role config to annotate translation source for ${expectedName}`,
      );
    }

    const staleTranslations = manifest.agents.filter(agent => agent.translationStatus === 'stale');
    assert.deepStrictEqual(
      staleTranslations,
      [],
      `Expected no stale legacy translations, found stale entries: ${staleTranslations
        .map(agent => agent.name)
        .join(', ')}`,
    );

    const expectedMissingTranslations = sourceAgents
      .map(sourceFile => {
        const sourcePath = path.join(sourceAgentsDir, sourceFile);
        const sourceMarkdown = fs.readFileSync(sourcePath, 'utf8');
        const { frontmatter, body } = extractFrontmatter(sourceMarkdown);
        const name = path.basename(sourceFile, '.md');
        const translation = resolveChineseTranslation({
          name,
          sourceHash: sha256(sourceMarkdown),
          englishDescription: frontmatter.description,
          englishInstructions: body,
          repoRoot,
        });

        return translation.translationStatus === 'missing' ? name : null;
      })
      .filter(Boolean)
      .sort();
    const manifestMissingTranslations = manifest.agents
      .filter(agent => agent.translationStatus === 'missing')
      .map(agent => agent.name)
      .sort();

    assert.deepStrictEqual(
      manifestMissingTranslations,
      expectedMissingTranslations,
      'Expected manifest missing translations to match the source-English fallback set',
    );

    assert.deepStrictEqual(
      {
        architect: {
          model: manifestByName.architect.model,
          effort: manifestByName.architect.modelReasoningEffort,
        },
        buildErrorResolver: {
          model: manifestByName['build-error-resolver'].model,
          effort: manifestByName['build-error-resolver'].modelReasoningEffort,
        },
        docUpdater: {
          model: manifestByName['doc-updater'].model,
          effort: manifestByName['doc-updater'].modelReasoningEffort,
        },
      },
      {
        architect: { model: 'gpt-5.6-sol', effort: 'xhigh' },
        buildErrorResolver: { model: 'gpt-5.6-terra', effort: 'xhigh' },
        docUpdater: { model: 'gpt-5.6-luna', effort: 'high' },
      },
      'Expected opus/sonnet/haiku source models to map to the requested Codex models and reasoning levels',
    );
  })
)
  passed++;
else failed++;

if (
  test('pack ships a dedicated sync skill for future updates', () => {
    const rootSkillPath = path.join(rootSkillDir, 'SKILL.md');
    const agentSkillPath = path.join(agentsSkillDir, 'SKILL.md');
    const openaiPath = path.join(agentsSkillDir, 'agents', 'openai.yaml');

    assert.ok(fs.existsSync(rootSkillPath), 'Expected canonical skill at `skills/codex-agent-sync/SKILL.md`');
    assert.ok(fs.existsSync(agentSkillPath), 'Expected Codex skill at `.agents/skills/codex-agent-sync/SKILL.md`');
    assert.ok(fs.existsSync(openaiPath), 'Expected `.agents/skills/codex-agent-sync/agents/openai.yaml`');

    const canonicalSkill = fs.readFileSync(rootSkillPath, 'utf8');
    const codexSkill = fs.readFileSync(agentSkillPath, 'utf8');
    assert.strictEqual(codexSkill, canonicalSkill, 'Expected Codex skill mirror to match the canonical skill');
    for (const requiredText of [
      'models_cache.json',
      'fetched_at',
      'codex debug models | node',
      'base_instructions',
      'developers.openai.com/api/docs/models',
      'gpt-5.6-sol',
      'gpt-5.6-terra',
      'gpt-5.6-luna',
    ]) {
      assert.ok(canonicalSkill.includes(requiredText), `Expected sync skill to document ${requiredText}`);
    }
  })
)
  passed++;
else failed++;

if (
  test('translation lookup rejects unsafe agent names', () => {
    assert.throws(
      () => resolveChineseTranslation({
        name: '../../../../outside',
        sourceHash: 'unused',
        englishDescription: 'unused',
        englishInstructions: 'unused',
        repoRoot,
      }),
      /Invalid agent name/,
    );
  })
)
  passed++;
else failed++;

if (
  test('generated pack exactly matches a fresh regeneration', () => {
    const before = snapshotDirectory(packDir);
    execFileSync(process.execPath, [generatorPath], { cwd: repoRoot, stdio: 'pipe' });
    assert.deepStrictEqual(snapshotDirectory(packDir), before, 'Expected generated pack to have no byte-level drift');
  })
)
  passed++;
else failed++;

if (
  test('invalid source models fail before replacing generated roles', () => {
    const invalidSourcePath = path.join(sourceAgentsDir, 'model-validation-test.md');
    const before = snapshotDirectory(packDir);
    fs.writeFileSync(
      invalidSourcePath,
      '---\nname: model-validation-test\ndescription: invalid model fixture\ntools: [Read]\nmodel: unknown\n---\n\nFixture.\n',
    );
    try {
      assert.throws(
        () => execFileSync(process.execPath, [generatorPath], { cwd: repoRoot, stdio: 'pipe' }),
        /Unsupported source model/,
      );
      assert.deepStrictEqual(
        snapshotDirectory(packDir),
        before,
        'Expected validation failure to preserve the previous generated pack',
      );
    } finally {
      fs.rmSync(invalidSourcePath, { force: true });
      execFileSync(process.execPath, [generatorPath], { cwd: repoRoot, stdio: 'pipe' });
    }
  })
)
  passed++;
else failed++;

if (
  test('regeneration removes stale role configs', () => {
    const staleRolePath = path.join(englishRoleDir, '__stale__.toml');
    fs.writeFileSync(staleRolePath, 'stale\n');
    try {
      execFileSync(process.execPath, [generatorPath], { cwd: repoRoot, stdio: 'pipe' });
      assert.ok(!fs.existsSync(staleRolePath), 'Expected regeneration to remove stale role config');
    } finally {
      fs.rmSync(staleRolePath, { force: true });
    }
  })
)
  passed++;
else failed++;

if (
  test('pack includes a Chinese quickstart for refresh and Codex usage', () => {
    assert.ok(fs.existsSync(quickstartPath), 'Expected quickstart at `.codex/ecc-multi-agent/QUICKSTART.zh-CN.md`');
    const quickstart = fs.readFileSync(quickstartPath, 'utf8');
    assert.ok(
      quickstart.includes('在 Codex 中使用这些 agents'),
      'Expected quickstart to explain how to use the generated agents in Codex',
    );
    assert.ok(
      quickstart.includes('快速更新'),
      'Expected quickstart to include a refresh/update section',
    );
    assert.ok(
      quickstart.includes('一句话触发'),
      'Expected quickstart to explain the one-line Codex trigger flow',
    );
    assert.ok(
      quickstart.includes('同步 Codex agents'),
      'Expected quickstart to include an example one-line Codex prompt',
    );
    assert.ok(
      quickstart.includes('docs/zh-CN/agents/*.md'),
      'Expected quickstart to document the official zh-CN translation directory',
    );
    assert.ok(
      quickstart.includes('config_file = "agents/planner.toml"'),
      'Expected quickstart to document copy-ready `agents/*.toml` config paths',
    );
    assert.ok(
      quickstart.includes('把对应语言的 role TOML 复制到 `.codex/agents/`'),
      'Expected quickstart to explain how copied role files map to `config_file` paths',
    );
    for (const model of ['gpt-5.6-sol', 'gpt-5.6-terra', 'gpt-5.6-luna']) {
      assert.ok(quickstart.includes(model), `Expected quickstart to document ${model}`);
    }
    assert.ok(quickstart.includes('预览'), 'Expected quickstart to warn about GPT-5.6 preview access');
  })
)
  passed++;
else failed++;

console.log(`\nPassed: ${passed}`);
console.log(`Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
