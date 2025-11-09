#!/usr/bin/env tsx
/**
 * Generate an index of all ADRs for documentation
 */

import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

interface ADR {
  number: number
  slug: string
  title: string
  date: string
  status: string
  filename: string
}

async function parseADR(filename: string, content: string): Promise<ADR | null> {
  const lines = content.split('\n')
  
  // Extract number and title from first heading
  const titleLine = lines.find(line => line.startsWith('# '))
  if (!titleLine) return null
  
  const match = titleLine.match(/^# (\d+)\.\s+(.+)$/)
  if (!match) return null
  
  const [, numberStr, title] = match
  const number = parseInt(numberStr, 10)
  
  // Extract date
  const dateLine = lines.find(line => line.startsWith('Date:'))
  const date = dateLine?.replace('Date:', '').trim() || 'Unknown'
  
  // Extract status
  const statusIndex = lines.findIndex(line => line === '## Status')
  const status = statusIndex >= 0 ? lines[statusIndex + 2]?.trim() || 'Unknown' : 'Unknown'
  
  // Generate slug from title
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  
  return { number, slug, title, date, status, filename }
}

async function generateIndex() {
  const adrsDir = join(process.cwd(), 'docs', 'adrs')
  const files = await readdir(adrsDir)
  
  const adrFiles = files
    .filter(f => f.match(/^\d{4}-.+\.md$/))
    .sort()
  
  const adrs: ADR[] = []
  
  for (const filename of adrFiles) {
    const content = await readFile(join(adrsDir, filename), 'utf-8')
    const adr = await parseADR(filename, content)
    if (adr) {
      adrs.push(adr)
    }
  }
  
  // Generate markdown index
  const indexContent = `# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for Howard.

## ADR Index

${adrs.map(adr => 
  `- [ADR-${String(adr.number).padStart(4, '0')}: ${adr.title}](${adr.filename}) - ${adr.status} (${adr.date})`
).join('\n')}

## About ADRs

Architecture Decision Records document significant architectural decisions made in this project. Each ADR describes:

- The context and problem being addressed
- The decision that was made
- The consequences of that decision

ADRs are numbered sequentially and are immutable once accepted. If a decision is reversed, a new ADR is created that supersedes the old one.

## Creating ADRs

To create a new ADR:

\`\`\`bash
cd docs/adrs && npx adr new "Title of Decision"
\`\`\`

Then run:

\`\`\`bash
npm run build:adr
\`\`\`

This will generate the table of contents and update this index.
`
  
  await writeFile(join(adrsDir, 'README.md'), indexContent)
  
  console.log(`✓ Generated ADR index with ${adrs.length} records`)
}

generateIndex().catch(error => {
  console.error('Failed to generate ADR index:', error)
  process.exit(1)
})

