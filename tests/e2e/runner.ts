#!/usr/bin/env tsx

import type { WebDriver } from 'selenium-webdriver';
import { readFileSync } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Builder } from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome';
import { Options as EdgeOptions } from 'selenium-webdriver/edge';
import { Options as FirefoxOptions } from 'selenium-webdriver/firefox';

import { seleniumConfig } from './selenium.config.js';

try {
  const envPath = resolve(process.cwd(), '.env.local');
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const [key, ...rest] = trimmed.split('=');
    if (!key || rest.length === 0) {
      continue;
    }
    const value = rest.join('=').replace(/^(["'])(.*)\1$/, '$2');
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
} catch {}

let driver: WebDriver | null = null;

export async function createDriver(): Promise<WebDriver> {
  const { browser, windowSize, headless } = seleniumConfig;
  let builder = new Builder();

  switch (browser) {
    case 'chrome': {
      const options = new ChromeOptions();
      if (headless) {
        options.addArguments('--headless=new');
      }
      options.addArguments(`--window-size=${windowSize.width},${windowSize.height}`);
      builder = builder.forBrowser('chrome').setChromeOptions(options);
      break;
    }
    case 'firefox': {
      const options = new FirefoxOptions();
      if (headless) {
        options.addArguments('-headless');
      }
      builder = builder.forBrowser('firefox').setFirefoxOptions(options);
      break;
    }
    case 'edge': {
      const options = new EdgeOptions();
      if (headless) {
        options.addArguments('--headless');
      }
      options.addArguments(`--window-size=${windowSize.width},${windowSize.height}`);
      builder = builder.forBrowser('MicrosoftEdge').setEdgeOptions(options);
      break;
    }
    case 'safari': {
      builder = builder.forBrowser('safari');
      break;
    }
    default: {
      builder = builder.forBrowser('chrome');
      break;
    }
  }

  const wd = await builder.build();
  try {
    await wd.manage().window().setRect({ width: windowSize.width, height: windowSize.height });
    await wd.manage().setTimeouts({ implicit: seleniumConfig.implicitWait, pageLoad: seleniumConfig.timeout });
  } catch {}

  return wd;
}

async function walk(dir: string, acc: string[] = []): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, acc);
    } else {
      acc.push(full);
    }
  }
  return acc;
}

async function discoverTests(filter?: string): Promise<string[]> {
  const baseDir = resolve(process.cwd(), 'tests', 'e2e');
  const exists = await stat(baseDir).then(() => true).catch(() => false);
  if (!exists) {
    return [];
  }

  const files = await walk(baseDir);
  let tests = files.filter(f => /\.(test|spec)\.ts$/.test(f));
  if (filter) {
    const f = filter.toLowerCase();
    tests = tests.filter(p => p.toLowerCase().includes(f));
  }
  tests.sort((a, b) => a.localeCompare(b));
  return tests;
}

type TestResult = {
  name: string;
  passed: boolean;
  duration: number; // ms
  error?: string;
};

async function runTest(testFile: string): Promise<TestResult> {
  const start = Date.now();
  const name = testFile.split('/').pop() || testFile;
  try {
    console.log(`\n▶ Running: ${name}`);
    const mod = await import(pathToFileURL(testFile).href);
    const fn = (typeof mod.default === 'function' ? mod.default : mod.run) as undefined | ((d: WebDriver) => Promise<void>);
    if (typeof fn !== 'function') {
      throw new TypeError(`Test '${name}' must export default or run(driver)`);
    }
    await fn(driver!);
    const dur = Date.now() - start;
    console.log(`✔ Passed: ${name} (${(dur / 1000).toFixed(1)}s)`);
    return { name, passed: true, duration: dur };
  } catch (err) {
    const dur = Date.now() - start;
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`✖ Failed: ${name} (${(dur / 1000).toFixed(1)}s)`);
    console.error(`  Error: ${msg}`);
    if (err instanceof Error && err.stack) {
      console.error(err.stack);
    }
    return { name, passed: false, duration: dur, error: msg };
  }
}

async function checkFrontendAlive(urlStr: string): Promise<boolean> {
  try {
    const url = new URL(urlStr);
    const httpMod = url.protocol === 'https:' ? await import('node:https') : await import('node:http');
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('timeout')), 3000);
      const req = httpMod.get(urlStr, () => {
        clearTimeout(timeout);
        resolve();
      });
      req.on('error', (e: unknown) => {
        clearTimeout(timeout);
        reject(e as Error);
      });
    });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const filter = process.argv[2];
  console.log('Starting Selenium E2E tests...');
  if (filter) {
    console.log(`Filter: ${filter}`);
  }

  const apiUrl = process.env.E2E_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  console.log('Configuration:', {
    baseUrl: seleniumConfig.baseUrl,
    browser: seleniumConfig.browser,
    headless: seleniumConfig.headless,
    apiUrl,
  });

  const alive = await checkFrontendAlive(seleniumConfig.baseUrl);
  if (!alive) {
    console.warn('\n⚠️  Frontend não respondeu em', seleniumConfig.baseUrl);
    console.warn('   Garanta que o Next.js está rodando. Ex.: npm run dev\n');
  } else {
    console.log('✓ Frontend acessível\n');
  }

  driver = await createDriver();
  console.log('WebDriver initialized');

  const testFiles = await discoverTests(filter);
  if (testFiles.length === 0) {
    console.log('Nenhum teste encontrado em tests/e2e');
    await driver.quit();
    process.exit(0);
  }

  console.log(`Encontrados ${testFiles.length} arquivo(s) de teste.`);

  const results: TestResult[] = [];
  let hasFailure = false;
  for (const file of testFiles) {
    const res = await runTest(file);
    results.push(res);
    if (!res.passed) {
      hasFailure = true;
      console.log('\n⚠️  Interrompendo na primeira falha.');
      break;
    }
  }

  const passed = results.filter(r => r.passed).length;
  const failed = results.length - passed;
  const totalMs = results.reduce((s, r) => s + r.duration, 0);
  console.log(`\n${'='.repeat(50)}`);
  console.log('Test Summary:');
  console.log(`  Total: ${results.length}`);
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Duration: ${(totalMs / 1000).toFixed(1)}s`);
  console.log('='.repeat(50));

  if (driver) {
    await driver.quit();
    console.log('WebDriver closed');
  }
  process.exit(hasFailure ? 1 : 0);
}

main().catch(async (err) => {
  console.error('Unhandled error:', err);
  if (driver) {
    await driver.quit();
    console.log('WebDriver closed');
  }
  process.exit(1);
});

export function getDriver(): WebDriver | null {
  return driver;
}
