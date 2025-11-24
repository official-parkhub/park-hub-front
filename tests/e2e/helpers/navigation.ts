import type { WebDriver } from 'selenium-webdriver';
import { By } from 'selenium-webdriver';
import { seleniumConfig } from '../selenium.config.js';
import { Selectors } from './selectors.js';
import {
  waitForElement as waitForElementHelper,
  waitForNavigation as waitForNavigationHelper,
} from './testHelpers.js';

export async function navigateToLogin(driver: WebDriver): Promise<void> {
  const { baseUrl } = seleniumConfig;

  await driver.get(baseUrl);
  await waitForElementHelper(driver, By.id('main-content'), 10000);
  await driver.sleep(1000);

  try {
    const comecarButton = await waitForElementHelper(driver, Selectors.comecarAgoraButton, 5000);

    await comecarButton.click();
    console.log('Clicked "Começar Agora" button');
  } catch {
    try {
      const accessButton = await waitForElementHelper(driver, Selectors.accessSystemButton, 5000);

      await accessButton.click();
      console.log('Clicked "Acessar Sistema" button');
    } catch {
      try {
        const loginLink = await waitForElementHelper(driver, Selectors.loginLink, 5000);
        await loginLink.click();

        console.log('Clicked login link');
      } catch {
        console.log('All buttons failed, navigating directly to login');
        const loginRoute = '/login';
        await driver.get(`${baseUrl}${loginRoute}`);
      }
    }
  }

  await waitForNavigationHelper(driver, '/login', 10000);
}
export async function navigateToHome(driver: WebDriver): Promise<void> {
  const { baseUrl } = seleniumConfig;

  try {
    const homeLink = await waitForElementHelper(driver, Selectors.homeLink, 5000);
    await homeLink.click();
    await waitForNavigationHelper(driver, '/home', 10000);
  } catch {
    await driver.get(`${baseUrl}/home`);
    await waitForNavigationHelper(driver, '/home', 10000);
  }
}

export async function navigateToVehicles(driver: WebDriver): Promise<void> {
  const { baseUrl } = seleniumConfig;
  try {
    const vehiclesLink = await waitForElementHelper(driver, Selectors.vehiclesLink, 5000);
    await vehiclesLink.click();
    await waitForNavigationHelper(driver, '/vehicles', 10000);
  } catch {
    await driver.get(`${baseUrl}/vehicles`);
    await waitForNavigationHelper(driver, '/vehicles', 10000);
  }
}

export async function navigateToManagerDashboard(driver: WebDriver): Promise<void> {
  const { baseUrl } = seleniumConfig;
  try {
    const dashboardLink = await waitForElementHelper(driver, Selectors.managerDashboardLink, 5000);
    await dashboardLink.click();
    await waitForNavigationHelper(driver, '/manager-dashboard', 10000);
  } catch {
    await driver.get(`${baseUrl}/manager-dashboard`);
    await waitForNavigationHelper(driver, '/manager-dashboard', 10000);
  }
}
