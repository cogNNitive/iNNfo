#!/usr/bin/env node

import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')
const TRIGGERS_PATH = resolve(PROJECT_ROOT, 'agents', 'triggers.yaml')

// ── Helpers ────────────────────────────────────────────────────────────

function unquote(s) {
  return s.trim().replace(/^["']|["']$/g, '')
}

function loadYaml(path) {
  const raw = readFileSync(path, 'utf-8')
  const skills = []
  let current = null

  for (const line of raw.split('\n')) {
    const trimmed = line.trimEnd()

    // Skip comments and blank lines
    if (trimmed.trim() === '' || trimmed.trimStart().startsWith('#')) continue

    // Top-level list item
    if (/^  - name:/.test(trimmed)) {
      if (current) skills.push(current)
      current = { triggers: [] }
      current.name = unquote(trimmed.replace(/^  - name:\s*/, ''))
      continue
    }

    if (!current) continue

    const kvMatch = trimmed.match(/^    (\w+):\s*(.+)/)
    if (kvMatch) {
      const [, key, val] = kvMatch
      current[key] = unquote(val)
      continue
    }

    // Trigger blocks
    const trigStart = trimmed.match(/^      - type:\s*(\w+)/)
    if (trigStart) {
      const trigger = { type: trigStart[1] }
      current.triggers.push(trigger)
      continue
    }

    // Trigger fields
    const trigField = trimmed.match(/^        (\w+):\s*(.+)/)
    if (trigField && current.triggers.length > 0) {
      const [, key, val] = trigField
      const lastTrig = current.triggers[current.triggers.length - 1]
      if (key === 'values') {
        lastTrig.values = val.replace(/^\[|\]$/g, '').split(',').map(v => unquote(v))
      } else {
        lastTrig[key] = unquote(val)
      }
    }
  }

  if (current) skills.push(current)
  return skills
}

function matchGlob(pattern, text) {
  // Convert glob to anchored-on-word-boundary regex
  // '*' matches any non-whitespace chars (lazy), '**' does same here
  let regexStr = pattern
    .replace(/\*\*/g, '___DLB___')
    .replace(/\*/g, '\\S+?')
    .replace(/___DLB___/g, '\\S+?')
    .replace(/\./g, '\\.')
    .replace(/\?/g, '.')
  // wrap in word boundaries when pattern starts/ends with word chars
  if (/^\w/.test(pattern)) regexStr = '\\b' + regexStr
  if (/\w$/.test(pattern)) regexStr = regexStr + '\\b'
  return new RegExp(regexStr, 'i').test(text)
}

function matchKeywords(values, text) {
  const lower = text.toLowerCase()
  return values.some(v => lower.includes(v.toLowerCase()))
}

function matchDescription(descText, text) {
  const descWords = descText.toLowerCase().split(/\s+/)
  const msgWords = new Set(text.toLowerCase().split(/\s+/))
  const matches = descWords.filter(w => msgWords.has(w))
  // At least 30% of description words must match, minimum 2
  return matches.length >= Math.max(2, Math.floor(descWords.length * 0.3))
}

// ── Main ────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2)

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage:
  node scripts/skill-matcher.mjs <message>
  node scripts/skill-matcher.mjs --stdin      (read message from stdin)
  node scripts/skill-matcher.mjs --list       (list all registered skills)
  node scripts/skill-matcher.mjs --check      (validate triggers.yaml is parseable)

The matcher reads agents/triggers.yaml and returns matching skills as JSON.
    `.trim())
    process.exit(0)
  }

  if (!existsSync(TRIGGERS_PATH)) {
    console.error(`❌ triggers.yaml not found at ${TRIGGERS_PATH}`)
    console.error('   Run `node scripts/skill-matcher.mjs --rebuild` to create it.')
    process.exit(1)
  }

  const skills = loadYaml(TRIGGERS_PATH)

  // --list: just list all skills
  if (args.includes('--list')) {
    console.log(`Registered skills: ${skills.length}`)
    console.log('─'.repeat(60))
    for (const s of skills) {
      const greeting = s.greeting || `🔧 You're using skill: ${s.name} (🔧)`
      console.log(`  ${s.emoji || '🔧'} ${s.name.padEnd(30)} [${s.scope}]`)
      console.log(`     greeting: ${greeting}`)
    }
    process.exit(0)
  }

  // --check: validate YAML is parseable
  if (args.includes('--check')) {
    let ok = true
    for (const s of skills) {
      if (!s.name) { console.error(`❌ Skill missing name`); ok = false }
      if (!s.path) { console.error(`❌ Skill "${s.name}" missing path`); ok = false }
      if (!s.triggers || s.triggers.length === 0) {
        console.error(`⚠️  Skill "${s.name}" has no triggers (will never match)`)
      }
    }
    if (ok) console.log(`✅ triggers.yaml valid — ${skills.length} skills`)
    process.exit(ok ? 0 : 1)
  }

  // Get message
  let message
  if (args.includes('--stdin')) {
    const chunks = []
    const decoder = new TextDecoder()
    const buf = readFileSync(process.stdin.fd)
    message = decoder.decode(buf).trim()
  } else {
    message = args.join(' ')
  }

  if (!message) {
    console.error('❌ No message provided. Pass it as argument or use --stdin.')
    process.exit(1)
  }

  // Match
  const matched = []

  for (const skill of skills) {
    let score = 0
    const reasons = []

    for (const trig of skill.triggers) {
      switch (trig.type) {
        case 'glob': {
          if (matchGlob(trig.pattern, message)) {
            score += 3
            reasons.push(`glob:${trig.pattern}`)
          }
          break
        }
        case 'keyword': {
          if (matchKeywords(trig.values, message)) {
            score += 2
            const found = trig.values.find(v => message.toLowerCase().includes(v.toLowerCase()))
            reasons.push(`keyword:${found}`)
          }
          break
        }
        case 'description': {
          if (matchDescription(trig.text, message)) {
            score += 1
            reasons.push('description')
          }
          break
        }
      }
    }

    if (score > 0) {
      matched.push({
        name: skill.name,
        path: skill.path,
        scope: skill.scope,
        emoji: skill.emoji || '🔧',
        greeting: skill.greeting || `🔧 You're using skill: ${skill.name} (🔧)`,
        score,
        reasons
      })
    }
  }

  // Sort by score descending
  matched.sort((a, b) => b.score - a.score)

  const output = {
    message,
    match_count: matched.length,
    skills: matched
  }

  console.log(JSON.stringify(output, null, 2))
}

main()
