import type { By, WebDriver, WebElement } from 'selenium-webdriver';
import { until } from 'selenium-webdriver';

const DEFAULT_TIMEOUT = 10000;
export async function waitForElement(
  driver: WebDriver,
  locator: By,
  timeout: number = DEFAULT_TIMEOUT,
): Promise<WebElement> {
  try {
    const element = await driver.wait(until.elementLocated(locator), timeout);
    await driver.wait(until.elementIsVisible(element), timeout);
    return element;
  } catch (error) {
    throw new Error(
      `Element not found with locator ${locator.toString()} within ${timeout}ms: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

export async function clickElement(
  driver: WebDriver,
  locator: By,
  timeout: number = DEFAULT_TIMEOUT,
): Promise<void> {
  try {
    const element = await waitForElement(driver, locator, timeout);
    await driver.executeScript('arguments[0].scrollIntoView(true);', element);
    await driver.sleep(100);
    await element.click();
  } catch (error) {
    throw new Error(
      `Failed to click element with locator ${locator.toString()}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

export async function fillInput(
  driver: WebDriver,
  locator: By,
  value: string,
  timeout: number = DEFAULT_TIMEOUT,
): Promise<void> {
  try {
    const element = await waitForElement(driver, locator, timeout);
    await element.clear();
    await element.sendKeys(value);
  } catch (error) {
    throw new Error(
      `Failed to fill input with locator ${locator.toString()}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

export async function waitForNavigation(
  driver: WebDriver,
  expectedUrl: string,
  timeout: number = DEFAULT_TIMEOUT,
): Promise<void> {
  try {
    await driver.wait(
      async () => {
        const currentUrl = await driver.getCurrentUrl();
        return currentUrl.includes(expectedUrl);
      },
      timeout,
      `Navigation to ${expectedUrl} did not complete within ${timeout}ms`,
    );
    await driver.sleep(500);
  } catch (error) {
    const currentUrl = await driver.getCurrentUrl();
    throw new Error(
      `Navigation timeout: Expected URL containing "${expectedUrl}", but current URL is "${currentUrl}": ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

export async function waitForElementToDisappear(
  driver: WebDriver,
  locator: By,
  timeout: number = DEFAULT_TIMEOUT,
): Promise<void> {
  try {
    await driver.wait(async () => {
      try {
        const elements = await driver.findElements(locator);
        return elements.length === 0;
      } catch {
        return true;
      }
    }, timeout);
  } catch {}
}

export async function getElementText(
  driver: WebDriver,
  locator: By,
  timeout: number = DEFAULT_TIMEOUT,
): Promise<string> {
  const element = await waitForElement(driver, locator, timeout);
  return element.getText();
}
export async function isElementPresent(driver: WebDriver, locator: By): Promise<boolean> {
  try {
    const elements = await driver.findElements(locator);
    return elements.length > 0;
  } catch {
    return false;
  }
}

export async function waitForElementEnabled(
  driver: WebDriver,
  element: WebElement,
  timeout: number = 5000,
): Promise<void> {
  await driver.wait(
    async () => {
      try {
        return await element.isEnabled();
      } catch {
        return false;
      }
    },
    timeout,
    'Element did not become enabled within timeout',
  );
}

export async function waitForElementToAppear(
  driver: WebDriver,
  locator: By,
  timeout: number = 5000,
): Promise<boolean> {
  try {
    await driver.wait(async () => {
      const elements = await driver.findElements(locator);
      return elements.length > 0;
    }, timeout);
    return true;
  } catch {
    return false;
  }
}

export async function waitForElementOpacity(
  driver: WebDriver,
  element: WebElement,
  targetOpacity: number = 1,
  timeout: number = 3000,
): Promise<void> {
  await driver.wait(
    async () => {
      try {
        const opacity = await driver.executeScript(
          'return window.getComputedStyle(arguments[0]).opacity;',
          element,
        );
        return Number.parseFloat(opacity as string) >= targetOpacity;
      } catch {
        return false;
      }
    },
    timeout,
    `Element opacity did not reach ${targetOpacity} within timeout`,
  );
}
