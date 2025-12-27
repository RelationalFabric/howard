import { execSync, spawn } from 'node:child_process'
import { copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

interface SpawnOptions {
  command: string
  args: string[]
}

interface RunConfig {
  branch: string
  batchId: string
  runId: string
  outputDirectory: string
  outputFile: string
}

interface BenchmarkResult {
  name: string
  hz: number
  mean: number
  rme: number
  min: number
  max: number
  p75: number
  p99: number
  p995: number
  p999: number
  sampleCount: number
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

function getArgValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag)
  if (index !== -1 && process.argv[index + 1]) {
    return process.argv[index + 1]
  }
  return undefined
}

function getBranchName(): string {
  const flagValue = getArgValue('--branch')
  if (flagValue)
    return flagValue

  if (process.env.BENCH_BRANCH && process.env.BENCH_BRANCH.length > 0)
    return process.env.BENCH_BRANCH

  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()

    if (branch && branch !== 'HEAD')
      return branch
  } catch {
    // fall back to local
  }

  return 'local'
}

function getBatchId(): string {
  const flagValue = getArgValue('--batch')
  if (flagValue)
    return flagValue

  if (process.env.BENCH_BATCH_ID)
    return process.env.BENCH_BATCH_ID

  // Generate timestamp-based batch ID: YYYYMMDD-HHMMSS
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  return `${year}${month}${day}-${hours}${minutes}${seconds}`
}

function getRunId(): string {
  const flagValue = getArgValue('--run')
  if (flagValue)
    return flagValue

  if (process.env.BENCH_RUN_ID)
    return process.env.BENCH_RUN_ID

  return '1'
}

function sanitizeBranchName(branch: string): string {
  return branch.replace(/[^\w.-]/g, '-')
}

function buildRunConfig(): RunConfig {
  const branch = sanitizeBranchName(getBranchName())
  const batchId = getBatchId()
  const runId = getRunId()
  const outputDirectory = path.resolve('benchmarks', 'results', branch)
  const outputFile = path.resolve(outputDirectory, `${batchId}-run${runId}.json`)

  return { branch, batchId, runId, outputDirectory, outputFile }
}

function buildVitestCommand(outputFile: string): SpawnOptions {
  const vitestBinary = path.resolve('node_modules', 'vitest', 'vitest.mjs')

  return {
    command: process.execPath,
    args: [
      vitestBinary,
      'bench',
      '--config',
      path.resolve('vitest.config.ts'),
      '--outputJson',
      outputFile,
    ],
  }
}

async function runBenchmarks(config: RunConfig): Promise<void> {
  const { command, args } = buildVitestCommand(config.outputFile)

  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      env: {
        ...process.env,
        BENCH_RESULTS_BRANCH: config.branch,
        BENCH_BATCH_ID: config.batchId,
        BENCH_RUN_ID: config.runId,
        VITEST_BENCHMARK_OUTPUT_FILE: config.outputFile,
      },
    })

    child.on('error', (error) => {
      reject(error)
    })

    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`vitest bench exited with code ${code}`))
      }
    })
  })
}

async function findBatchFiles(directory: string, batchId: string): Promise<string[]> {
  try {
    const files = await readdir(directory)
    return files
      .filter(f => f.startsWith(`${batchId}-run`) && f.endsWith('.json'))
      .map(f => path.join(directory, f))
      .sort()
  } catch {
    return []
  }
}

function aggregateBenchmarkResults(results: BenchmarkResult[]): BenchmarkResult {
  if (results.length === 0)
    throw new Error('Cannot aggregate empty results')

  if (results.length === 1)
    return results[0]

  const name = results[0].name
  const n = results.length

  // Use geometric mean for hz (rates) - better for performance metrics
  const hzProduct = results.reduce((acc, r) => acc * r.hz, 1)
  const hz = hzProduct ** (1 / n)

  // Use arithmetic mean for times
  const mean = results.reduce((acc, r) => acc + r.mean, 0) / n
  const median = results.reduce((acc, r) => acc + r.median, 0) / n

  // Use min of mins and max of maxes for range
  const min = Math.min(...results.map(r => r.min))
  const max = Math.max(...results.map(r => r.max))

  // Average percentiles
  const p75 = results.reduce((acc, r) => acc + r.p75, 0) / n
  const p99 = results.reduce((acc, r) => acc + r.p99, 0) / n
  const p995 = results.reduce((acc, r) => acc + r.p995, 0) / n
  const p999 = results.reduce((acc, r) => acc + r.p999, 0) / n

  // Sum sample counts
  const sampleCount = results.reduce((acc, r) => acc + r.sampleCount, 0)

  // RME: use pooled standard error (simplified: average RME)
  const rme = results.reduce((acc, r) => acc + r.rme, 0) / n

  return { name, hz, mean, median, min, max, p75, p99, p995, p999, sampleCount, rme }
}

async function aggregateBatchResults(config: RunConfig): Promise<void> {
  const batchFiles = await findBatchFiles(config.outputDirectory, config.batchId)

  if (batchFiles.length === 0) {
    console.log('⚠️  No batch files found to aggregate')
    return
  }

  if (batchFiles.length === 1) {
    // Single run - just copy to latest.json
    const latestPath = path.join(config.outputDirectory, 'latest.json')
    await copyFile(batchFiles[0], latestPath)
    console.log(`📋 Single run - copied to latest.json`)
    return
  }

  console.log(`🔄 Aggregating ${batchFiles.length} runs from batch ${config.batchId}...`)

  // Load all results
  const allResults: BenchmarkOutput[] = []
  for (const file of batchFiles) {
    const content = await readFile(file, 'utf8')
    allResults.push(JSON.parse(content) as BenchmarkOutput)
  }

  // Group benchmarks by name across all runs
  const benchmarksByName = new Map<string, BenchmarkResult[]>()

  for (const result of allResults) {
    for (const file of result.files) {
      for (const group of file.groups) {
        for (const benchmark of group.benchmarks) {
          const existing = benchmarksByName.get(benchmark.name) ?? []
          existing.push(benchmark)
          benchmarksByName.set(benchmark.name, existing)
        }
      }
    }
  }

  // Aggregate each benchmark
  const aggregatedBenchmarks: BenchmarkResult[] = []
  for (const [name, results] of benchmarksByName) {
    try {
      aggregatedBenchmarks.push(aggregateBenchmarkResults(results))
    } catch (error) {
      console.warn(`⚠️  Failed to aggregate ${name}:`, error)
    }
  }

  // Sort benchmarks by name for deterministic output ordering
  aggregatedBenchmarks.sort((a, b) => a.name.localeCompare(b.name))

  // Build aggregated output structure
  const aggregatedOutput: BenchmarkOutput = {
    files: [
      {
        filepath: 'aggregated',
        groups: [
          {
            fullName: `Aggregated from ${batchFiles.length} runs (batch: ${config.batchId})`,
            benchmarks: aggregatedBenchmarks,
          },
        ],
      },
    ],
  }

  // Write aggregated results
  const latestPath = path.join(config.outputDirectory, 'latest.json')
  await writeFile(latestPath, `${JSON.stringify(aggregatedOutput, null, 2)}\n`, 'utf8')

  console.log(`✅ Aggregated ${aggregatedBenchmarks.length} benchmarks from ${batchFiles.length} runs`)
}

async function generateReport(): Promise<void> {
  console.log('\n📊 Generating benchmark comparison report...')

  await new Promise<void>((resolve, reject) => {
    const reportScript = path.resolve('benchmarks', 'harness', 'generate-report.ts')
    const child = spawn(process.execPath, ['--import', 'tsx', reportScript], {
      stdio: 'inherit',
    })

    child.on('error', (error) => {
      reject(error)
    })

    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Report generation exited with code ${code}`))
      }
    })
  })
}

function isAggregateOnly(): boolean {
  return process.env.BENCH_AGGREGATE_ONLY === 'true' || process.argv.includes('--aggregate-only')
}

async function run(): Promise<void> {
  const config = buildRunConfig()

  console.log(`📈 Benchmark Run Configuration`)
  console.log(`   Branch:  ${config.branch}`)
  console.log(`   Batch:   ${config.batchId}`)
  console.log(`   Run:     ${config.runId}`)

  await mkdir(config.outputDirectory, { recursive: true })

  if (isAggregateOnly()) {
    console.log(`\n🔄 Aggregate-only mode - skipping benchmark execution`)
  } else {
    await runBenchmarks(config)
    console.log(`\n✅ Results saved to: ${config.outputFile}`)
  }

  // Aggregate batch results if multiple runs exist
  await aggregateBatchResults(config)

  // Regenerate comparison report after recording
  await generateReport()
}

run().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
