import { execSync, spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

interface SpawnOptions {
  command: string
  args: string[]
}

function getBranchName(): string {
  const branchFlagIndex = process.argv.indexOf('--branch')
  if (branchFlagIndex !== -1) {
    const branchFlagValue = process.argv[branchFlagIndex + 1]
    if (branchFlagValue) {
      return branchFlagValue
    }
  }

  if (process.env.BENCH_BRANCH && process.env.BENCH_BRANCH.length > 0) {
    return process.env.BENCH_BRANCH
  }

  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()

    if (branch && branch !== 'HEAD') {
      return branch
    }
  } catch {
    // fall back to local
  }

  return 'local'
}

function sanitizeBranchName(branch: string): string {
  return branch.replace(/[^\w.-]/g, '-')
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

async function runBenchmarks(branch: string, outputFile: string): Promise<void> {
  const { command, args } = buildVitestCommand(outputFile)

  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      env: {
        ...process.env,
        BENCH_RESULTS_BRANCH: branch,
        VITEST_BENCHMARK_OUTPUT_FILE: outputFile,
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

async function run(): Promise<void> {
  const branch = sanitizeBranchName(getBranchName())
  const outputDirectory = path.resolve('benchmarks', 'results', branch)
  const outputFile = path.resolve(outputDirectory, 'latest.json')

  console.log(`📈 Recording benchmarks for branch: ${branch}`)

  await mkdir(outputDirectory, { recursive: true })
  await runBenchmarks(branch, outputFile)

  console.log(`\n✅ Results saved to: ${outputFile}`)

  // Regenerate comparison report after recording
  await generateReport()
}

run().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
