const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const legacyTranslations = require('./ecc-agent-translations');

const REPO_ROOT = path.join(__dirname, '..', '..');
const OFFICIAL_ZH_CN_AGENT_DIR = path.join(REPO_ROOT, 'docs', 'zh-CN', 'agents');
const LEGACY_TRANSLATION_FILE = 'scripts/codex/ecc-agent-translations.js';
const TRANSLATION_RESOLUTION_ORDER = [
  'docs/zh-CN/agents/*.md',
  LEGACY_TRANSLATION_FILE,
  'agents/*.md',
];

function extractFrontmatter(content) {
  const clean = content.replace(/^\uFEFF/, '');
  const match = clean.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    throw new Error('Missing frontmatter');
  }

  const frontmatter = {};
  const lines = match[1].split(/\r?\n/);

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex < 0) continue;
    const key = line.slice(0, colonIndex).trim();
    const rawValue = line.slice(colonIndex + 1).trim();

    if (rawValue.startsWith('[')) {
      frontmatter[key] = parseInlineArray(rawValue);
      continue;
    }

    frontmatter[key] = rawValue.replace(/^['"]|['"]$/g, '');
  }

  return {
    frontmatter,
    body: match[2].trim(),
  };
}

function parseInlineArray(rawValue) {
  try {
    return JSON.parse(rawValue);
  } catch (error) {
    const trimmed = rawValue.trim();
    if (!trimmed.endsWith(']')) {
      throw error;
    }

    return trimmed
      .slice(1, -1)
      .split(',')
      .map(value => value.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);
  }
}

function sha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function toRepoRelativePath(filePath, repoRoot = REPO_ROOT) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

function assertSafeAgentName(name) {
  if (typeof name !== 'string' || !/^[a-z][a-z0-9-]*$/.test(name)) {
    throw new Error(`Invalid agent name: ${name}`);
  }
}

function preservePromptDefenseBaseline(englishInstructions, translatedInstructions) {
  const baseline = englishInstructions
    .match(/^## Prompt Defense Baseline\s*\r?\n(?:\s*\r?\n)?(?:- [^\r\n]*(?:\r?\n|$))+/m)?.[0]
    .trim();
  if (!baseline) return translatedInstructions;

  return translatedInstructions.includes(baseline)
    ? translatedInstructions
    : `${baseline}\n\n${translatedInstructions}`;
}

function loadOfficialChineseTranslation(name, repoRoot = REPO_ROOT) {
  assertSafeAgentName(name);
  const officialPath = path.join(repoRoot, 'docs', 'zh-CN', 'agents', `${name}.md`);
  if (!fs.existsSync(officialPath)) {
    return null;
  }

  const officialContent = fs.readFileSync(officialPath, 'utf8');
  const { frontmatter, body } = extractFrontmatter(officialContent);

  return {
    description: frontmatter.description,
    developerInstructions: body,
    translationSource: toRepoRelativePath(officialPath, repoRoot),
    translationSourceType: 'official-doc',
    translationStatus: 'current',
  };
}

function resolveChineseTranslation({
  name,
  sourceHash,
  englishDescription,
  englishInstructions,
  repoRoot = REPO_ROOT,
}) {
  const officialTranslation = loadOfficialChineseTranslation(name, repoRoot);
  if (officialTranslation) {
    return {
      ...officialTranslation,
      description: officialTranslation.description || englishDescription,
      developerInstructions: preservePromptDefenseBaseline(
        englishInstructions,
        officialTranslation.developerInstructions || englishInstructions,
      ),
    };
  }

  const legacyTranslation = legacyTranslations[name];
  if (legacyTranslation) {
    return {
      description: legacyTranslation.description || englishDescription,
      developerInstructions: preservePromptDefenseBaseline(
        englishInstructions,
        legacyTranslation.developerInstructions || englishInstructions,
      ),
      translationSource: LEGACY_TRANSLATION_FILE,
      translationSourceType: 'legacy-js',
      translationStatus: legacyTranslation.sourceSha256 === sourceHash ? 'current' : 'stale',
      translationSourceSha256: legacyTranslation.sourceSha256,
    };
  }

  return {
    description: englishDescription,
    developerInstructions: englishInstructions,
    translationSource: `agents/${name}.md`,
    translationSourceType: 'source-english-fallback',
    translationStatus: 'missing',
  };
}

module.exports = {
  extractFrontmatter,
  LEGACY_TRANSLATION_FILE,
  OFFICIAL_ZH_CN_AGENT_DIR,
  REPO_ROOT,
  resolveChineseTranslation,
  sha256,
  toRepoRelativePath,
  TRANSLATION_RESOLUTION_ORDER,
};
