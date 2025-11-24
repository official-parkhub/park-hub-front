import type { WebDriver } from 'selenium-webdriver';
import type { TestUser } from '../helpers/userFactory.js';
import { navigateToLogin } from '../helpers/navigation.js';
import { Selectors } from '../helpers/selectors.js';
import {
  clickElement,
  fillInput,
  waitForElement,
  waitForNavigation,
} from '../helpers/testHelpers.js';
import { createTestUser } from '../helpers/userFactory.js';
import { seleniumConfig } from '../selenium.config.js';

async function performLogin(
  driver: WebDriver,
  email: string,
  password: string,
  profileType: 'driver' | 'organization',
): Promise<void> {
  await waitForElement(driver, Selectors.loginEmailInput, 10000);
  await driver.sleep(500);

  console.log(`Selecting profile type: ${profileType}`);

  if (profileType === 'driver') {
    await clickElement(driver, Selectors.profileTypeDriver);
  } else {
    await clickElement(driver, Selectors.profileTypeOrganization);
  }

  await driver.sleep(300);

  console.log(`Filling email: ${email}`);

  await fillInput(driver, Selectors.loginEmailInput, email);

  await driver.sleep(200);

  console.log('Filling password');

  await fillInput(driver, Selectors.loginPasswordInput, password);

  await driver.sleep(300);

  console.log('Waiting for submit button...');

  let submitButton;

  try {
    submitButton = await waitForElement(driver, Selectors.loginSubmitButton, 10000);
  } catch (error) {
    const { By } = await import('selenium-webdriver');

    try {
      submitButton = await waitForElement(driver, By.css('form button[type="submit"]'), 5000);
    } catch {
      throw new Error(
        `Could not find submit button. Tried: ${Selectors.loginSubmitButton.toString()}. ` +
          `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  const isEnabled = await submitButton.isEnabled();

  if (!isEnabled) {
    await driver.sleep(1000);

    const stillDisabled = await submitButton.isEnabled();

    if (!stillDisabled) {
      const buttonText = await submitButton.getText().catch(() => 'N/A');
      throw new Error(
        `Submit button is disabled. Button text: "${buttonText}". ` +
          `Form may be in loading state, invalid, or button may be outside viewport.`,
      );
    }
  }

  await driver.executeScript(
    'arguments[0].scrollIntoView({ behavior: "smooth", block: "center" });',
    submitButton,
  );

  await driver.sleep(300);

  console.log('Clicking submit button...');

  try {
    await submitButton.click();
  } catch {
    console.log('Regular click failed, trying JavaScript click...');
    await driver.executeScript('arguments[0].click();', submitButton);
  }
  console.log('Submit button clicked');
}

export default async function loginTest(driver: WebDriver): Promise<void> {
  const { baseUrl } = seleniumConfig;

  console.log('Testing login as driver...');

  let testUser: TestUser;

  try {
    console.log('Creating test driver user via API...');
    testUser = await createTestUser('driver');
    console.log(`✓ Created test driver user: ${testUser.email}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`✗ Failed to create test driver user: ${errorMessage}`);
    throw new Error(
      `Failed to create test driver user: ${errorMessage}\n` +
        `Certifique-se de que:\n` +
        `1. A API backend está rodando e acessível\n` +
        `2. A variável de ambiente NEXT_PUBLIC_API_URL ou E2E_API_URL está configurada\n` +
        `3. A URL da API está correta no arquivo .env.local`,
    );
  }

  try {
    await navigateToLogin(driver);
    console.log('Navigated to login page');
  } catch (error) {
    throw new Error(
      `Failed to navigate to login page: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  try {
    await performLogin(driver, testUser.email, testUser.password, 'driver');
    console.log('Submitted login form as driver');
  } catch (error) {
    throw new Error(
      `Failed to perform login as driver: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  try {
    await waitForNavigation(driver, '/home', 15000);

    const currentUrl = await driver.getCurrentUrl();

    if (!currentUrl.includes('/home')) {
      throw new Error(`Expected URL to contain '/home', but got '${currentUrl}'`);
    }
    console.log('✓ Driver login successful - redirected to /home');
  } catch (error) {
    const currentUrl = await driver.getCurrentUrl();
    throw new Error(
      `Failed to validate driver login redirection. Expected '/home', but current URL is '${currentUrl}': ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  console.log('\nTesting login as organization...');

  try {
    await driver.get(`${baseUrl}/login`);
    await waitForNavigation(driver, '/login', 10000);
    console.log('Navigated back to login page');
  } catch (error) {
    throw new Error(
      `Failed to navigate back to login page: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  let orgUser: TestUser;
  try {
    console.log('Creating test organization user via API...');
    orgUser = await createTestUser('organization');
    console.log(`✓ Created test organization user: ${orgUser.email}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`✗ Failed to create test organization user: ${errorMessage}`);
    throw new Error(
      `Failed to create test organization user: ${errorMessage}\n` +
        `Certifique-se de que:\n` +
        `1. A API backend está rodando e acessível\n` +
        `2. A variável de ambiente NEXT_PUBLIC_API_URL ou E2E_API_URL está configurada\n` +
        `3. A URL da API está correta no arquivo .env.local`,
    );
  }

  try {
    await performLogin(driver, orgUser.email, orgUser.password, 'organization');
    console.log('Submitted login form as organization');
  } catch (error) {
    throw new Error(
      `Failed to perform login as organization: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  try {
    await waitForNavigation(driver, '/manager-dashboard', 15000);

    const currentUrl = await driver.getCurrentUrl();
    if (!currentUrl.includes('/manager-dashboard')) {
      throw new Error(`Expected URL to contain '/manager-dashboard', but got '${currentUrl}'`);
    }
    console.log('✓ Organization login successful - redirected to /manager-dashboard');
  } catch (error) {
    const currentUrl = await driver.getCurrentUrl();
    throw new Error(
      `Failed to validate organization login redirection. Expected '/manager-dashboard', but current URL is '${currentUrl}': ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  console.log('\n✓ All login tests passed successfully');
}
