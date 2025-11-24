export type SeleniumConfig = {
  baseUrl: string;
  browser: 'chrome' | 'firefox' | 'safari' | 'edge';
  headless: boolean;
  timeout: number;
  implicitWait: number;
  windowSize: {
    width: number;
    height: number;
  };
};

function getBaseUrl(): string {
  return process.env.E2E_BASE_URL || 'http://localhost:3000';
}

function getBrowser(): 'chrome' | 'firefox' | 'safari' | 'edge' {
  const browser = process.env.E2E_BROWSER?.toLowerCase();
  if (browser === 'chrome' || browser === 'firefox' || browser === 'safari' || browser === 'edge') {
    return browser;
  }
  return 'chrome';
}

function getHeadless(): boolean {
  return process.env.E2E_HEADLESS === 'true';
}

export const seleniumConfig: SeleniumConfig = {
  baseUrl: getBaseUrl(),
  browser: getBrowser(),
  headless: getHeadless(),
  timeout: 10000,
  implicitWait: 5000,
  windowSize: {
    width: 1280,
    height: 720,
  },
};
