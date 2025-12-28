/**
 * Benchmark Report Generator
 *
 * Reads benchmark results from main and develop branches and generates
 * a comparative markdown report for documentation.
 */

import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

interface BenchmarkResult {
  id: string
  name: string
  rank: number
  hz: number
  mean: number
  rme: number
  samples: unknown[]
  sampleCount: number
  min: number
  max: number
  p75: number
  p99: number
  p995: number
  p999: number
  median: number
}

interface BenchmarkGroup {
  fullName: string
  benchmarks: BenchmarkResult[]
}

interface BenchmarkFile {
  filepath: string
  groups: BenchmarkGroup[]
}

interface BenchmarkOutput {
  files: BenchmarkFile[]
}

interface BranchResults {
  branch: string
  timestamp: string | undefined
  data: BenchmarkOutput | undefined
}

async function loadBranchResults(branch: string): Promise<BranchResults> {
  const resultsPath = path.resolve('benchmarks', 'results', branch, 'latest.json')

  try {
    const content = await readFile(resultsPath, 'utf8')
    const data = JSON.parse(content) as BenchmarkOutput

    // Try to get file modification time as timestamp
    const { stat } = await import('node:fs/promises')
    const stats = await stat(resultsPath)
    const timestamp = stats.mtime.toISOString().split('T')[0]

    return { branch, timestamp, data }
  } catch {
    return { branch, timestamp: undefined, data: undefined }
  }
}

function formatHz(hz: number): string {
  if (hz >= 1_000_000) {
    return `${(hz / 1_000_000).toFixed(2)}M`
  }
  if (hz >= 1_000) {
    return `${(hz / 1_000).toFixed(1)}K`
  }
  return hz.toFixed(0)
}

function formatRme(rme: number): string {
  return `±${rme.toFixed(2)}%`
}

function calculateDelta(current: number, baseline: number): string {
  if (baseline === 0)
    return 'N/A'
  const delta = ((current - baseline) / baseline) * 100
  const sign = delta >= 0 ? '+' : ''
  return `${sign}${delta.toFixed(1)}%`
}

function getDeltaEmoji(current: number, baseline: number): string {
  if (baseline === 0)
    return ''
  const delta = ((current - baseline) / baseline) * 100
  if (delta > 5)
    return '🚀'
  if (delta < -5)
    return '⚠️'
  return '≈'
}

function generateComparisonTable(
  mainResults: Map<string, BenchmarkResult>,
  developResults: Map<string, BenchmarkResult>,
): string {
  const allBenchmarks = new Set([...mainResults.keys(), ...developResults.keys()])
  const sortedBenchmarks = Array.from(allBenchmarks).sort()

  if (sortedBenchmarks.length === 0) {
    return '*No benchmark data available*'
  }

  const lines: string[] = [
    '| Benchmark | main (ops/sec) | develop (ops/sec) | Δ | Status |',
    '| :--- | ---: | ---: | ---: | :---: |',
  ]

  for (const name of sortedBenchmarks) {
    const main = mainResults.get(name)
    const develop = developResults.get(name)

    const mainHz = main ? formatHz(main.hz) : '—'
    const developHz = develop ? formatHz(develop.hz) : '—'

    let delta = '—'
    let emoji = ''

    if (main && develop) {
      delta = calculateDelta(develop.hz, main.hz)
      emoji = getDeltaEmoji(develop.hz, main.hz)
    } else if (develop && !main) {
      delta = 'new'
      emoji = '✨'
    } else if (main && !develop) {
      delta = 'removed'
      emoji = '🗑️'
    }

    lines.push(`| ${name} | ${mainHz} | ${developHz} | ${delta} | ${emoji} |`)
  }

  return lines.join('\n')
}

function generateDetailedTable(
  results: Map<string, BenchmarkResult>,
  branch: string,
): string {
  if (results.size === 0) {
    return `*No benchmark data available for ${branch}*`
  }

  const sorted = Array.from(results.values()).sort((a, b) => b.hz - a.hz)

  const lines: string[] = [
    '| Benchmark | ops/sec | mean (ms) | ±RME | p99 (ms) | samples |',
    '| :--- | ---: | ---: | ---: | ---: | ---: |',
  ]

  for (const result of sorted) {
    lines.push(
      `| ${result.name} | ${formatHz(result.hz)} | ${(result.mean * 1000).toFixed(4)} | ${formatRme(result.rme)} | ${(result.p99 * 1000).toFixed(4)} | ${result.sampleCount.toLocaleString()} |`,
    )
  }

  return lines.join('\n')
}

function extractBenchmarks(data: BenchmarkOutput | undefined): Map<string, BenchmarkResult> {
  const results = new Map<string, BenchmarkResult>()

  if (!data?.files)
    return results

  for (const file of data.files) {
    for (const group of file.groups) {
      for (const benchmark of group.benchmarks) {
        results.set(benchmark.name, benchmark)
      }
    }
  }

  return results
}

async function generateReport(): Promise<void> {
  const [mainBranch, developBranch] = await Promise.all([
    loadBranchResults('main'),
    loadBranchResults('develop'),
  ])

  const mainResults = extractBenchmarks(mainBranch.data)
  const developResults = extractBenchmarks(developBranch.data)

  const hasMain = mainResults.size > 0
  const hasDevelop = developResults.size > 0

  const summaryNotes: string[] = []
  if (!hasMain && !hasDevelop) {
    summaryNotes.push('> ⚠️ No benchmark data available. Run `npm run bench:record -- --branch main` and `npm run bench:record -- --branch develop` to generate baselines.')
  }
  if (hasMain && !hasDevelop) {
    summaryNotes.push('> ℹ️ Only `main` branch results available. Run `npm run bench:record -- --branch develop` to enable comparison.')
  }
  if (!hasMain && hasDevelop) {
    summaryNotes.push('> ℹ️ Only `develop` branch results available. Run `npm run bench:record -- --branch main` to enable comparison.')
  }

  const summarySection = summaryNotes.length > 0
    ? `${summaryNotes.join('\n')}\n\n`
    : ''

  const report = `# Benchmark Report

This report compares benchmark results between the \`main\` and \`develop\` branches.
Results are automatically updated when benchmarks are recorded for either branch.

## Quick Summary

${summarySection}| Branch | Last Updated | Status |
| :--- | :--- | :--- |
| main | ${mainBranch.timestamp ?? '—'} | ${hasMain ? '✅ Available' : '❌ Missing'} |
| develop | ${developBranch.timestamp ?? '—'} | ${hasDevelop ? '✅ Available' : '❌ Missing'} |

## Branch Comparison

${generateComparisonTable(mainResults, developResults)}

### Legend

- 🚀 **Improvement**: >5% faster than baseline
- ⚠️ **Regression**: >5% slower than baseline
- ≈ **Stable**: Within ±5% of baseline
- ✨ **New**: Benchmark added in this branch
- 🗑️ **Removed**: Benchmark removed in this branch

## Detailed Results

### main Branch

${generateDetailedTable(mainResults, 'main')}

### develop Branch

${generateDetailedTable(developResults, 'develop')}

## How to Update

### Automatic (CI)

Benchmarks run automatically when changes are pushed to \`main\` or \`develop\`.
Results are submitted via PR from \`bench/*\` branches to \`develop\`.

### Manual (Local)

\`\`\`bash
# Record benchmarks for main branch
git checkout main
npm run bench:record -- --branch main

# Record benchmarks for develop branch
git checkout develop
npm run bench:record -- --branch develop

# Regenerate this report only
npm run bench:report
\`\`\`

## Notes

- All measurements in operations per second (higher is better)
- RME = Relative Margin of Error (lower is more stable)
- p99 = 99th percentile latency
- Results updated via \`bench/*\` branches → PR to \`develop\`
`

  const outputPath = path.resolve('docs', 'benchmarks', 'comparison.md')
  await writeFile(outputPath, report, 'utf8')

  console.log(`✅ Benchmark report generated: ${outputPath}`)

  if (hasMain && hasDevelop) {
    const regressions = Array.from(developResults.entries()).filter(([name, develop]) => {
      const main = mainResults.get(name)
      if (!main)
        return false
      const delta = ((develop.hz - main.hz) / main.hz) * 100
      return delta < -5
    })

    if (regressions.length > 0) {
      console.warn(`⚠️  ${regressions.length} potential regression(s) detected:`)
      for (const [name] of regressions) {
        const main = mainResults.get(name)!
        const develop = developResults.get(name)!
        const delta = ((develop.hz - main.hz) / main.hz) * 100
        console.warn(`   - ${name}: ${delta.toFixed(1)}%`)
      }
    }
  }
}

generateReport().catch((error) => {
  console.error('Failed to generate benchmark report:', error)
  process.exitCode = 1
})
