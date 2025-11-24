import type { WebDriver } from 'selenium-webdriver';
import type { TestUser } from '../helpers/userFactory.js';

import { cnpj } from 'cpf-cnpj-validator';
import { By, until } from 'selenium-webdriver';

import { navigateToLogin } from '../helpers/navigation.js';
import { Selectors } from '../helpers/selectors.js';
import {
  clickElement,
  fillInput,
  isElementPresent,
  waitForElement,
  waitForElementEnabled,
  waitForElementOpacity,
  waitForElementToAppear,
  waitForNavigation,
} from '../helpers/testHelpers.js';
import { createTestUser } from '../helpers/userFactory.js';

import { seleniumConfig } from '../selenium.config.js';

async function performOrganizationLogin(
  driver: WebDriver,
  email: string,
  password: string,
): Promise<void> {
  await waitForElement(driver, Selectors.loginEmailInput, 10000);

  console.log('Selecting organization profile type');
  await clickElement(driver, Selectors.profileTypeOrganization);

  await waitForElement(driver, Selectors.loginEmailInput, 2000);

  console.log(`Filling email: ${email}`);
  await fillInput(driver, Selectors.loginEmailInput, email);

  console.log('Filling password');
  await fillInput(driver, Selectors.loginPasswordInput, password);

  console.log('Waiting for submit button...');
  const submitButton = await waitForElement(driver, Selectors.loginSubmitButton, 10000);

  if (!(await submitButton.isEnabled())) {
    await waitForElementEnabled(driver, submitButton, 3000);
  }

  await driver.executeScript(
    'arguments[0].scrollIntoView({ behavior: "auto", block: "center" });',
    submitButton,
  );

  await driver.wait(until.elementIsVisible(submitButton), 2000);

  console.log('Clicking submit button...');

  try {
    await submitButton.click();
  } catch {
    await driver.executeScript('arguments[0].click();', submitButton);
  }

  console.log('Submit button clicked');
}

function generateTestCompanyName(): string {
  return `Estacionamento Teste ${Date.now()}`;
}

function generateTestCNPJ(): string {
  return cnpj.format(cnpj.generate());
}

export default async function parkingManagementTest(driver: WebDriver): Promise<void> {
  const { baseUrl: _baseUrl } = seleniumConfig;

  console.log('Step 1: Authenticating as organization...');

  let testUser: TestUser;

  try {
    console.log('Creating test organization user via API...');
    testUser = await createTestUser('organization');
    console.log(`✓ Created test organization user: ${testUser.email}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(
      `Failed to create test organization user: ${errorMessage}\n` +
        `Certifique-se de que a API backend está rodando e acessível.`,
    );
  }

  try {
    await navigateToLogin(driver);
    console.log('✓ Navigated to login page');
  } catch (error) {
    throw new Error(
      `Failed to navigate to login page: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  try {
    await performOrganizationLogin(driver, testUser.email, testUser.password);
    console.log('✓ Login form submitted');
  } catch (error) {
    throw new Error(
      `Failed to perform login: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  try {
    await waitForNavigation(driver, '/manager-dashboard', 15000);

    const currentUrl = await driver.getCurrentUrl();
    if (!currentUrl.includes('/manager-dashboard')) {
      throw new Error(`Expected URL to contain '/manager-dashboard', but got '${currentUrl}'`);
    }

    console.log('✓ Organization authenticated and redirected to /manager-dashboard');
  } catch (error) {
    const currentUrl = await driver.getCurrentUrl();
    throw new Error(
      `Failed to validate login redirection. Expected '/manager-dashboard', but current URL is '${currentUrl}': ` +
        `${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  console.log('\nStep 2: Validating dashboard loaded...');

  try {
    await waitForElement(driver, By.id('main-content'), 10000);

    console.log('✓ Dashboard page loaded');

    const listPresent = await isElementPresent(driver, Selectors.companyList);
    const emptyMessagePresent = await isElementPresent(
      driver,
      By.xpath(
        '//*[contains(text(), "não possui empresas") or contains(text(), "não possui estacionamentos")]',
      ),
    );

    if (listPresent) {
      console.log('✓ Company list container found');

      const cards = await driver.findElements(Selectors.companyCard);
      console.log(`Found ${cards.length} company card(s) in list`);
    } else if (emptyMessagePresent) {
      console.log('✓ Empty state message found');
    } else {
      console.log('✓ Dashboard loaded (proceeding to create company)');
    }
  } catch (error) {
    throw new Error(
      `Failed to validate dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

    console.log('\nStep 3: Opening company creation form...');

  try {
    console.log('Waiting for create company FAB...');

    let fabButton;

    try {
      fabButton = await waitForElement(driver, Selectors.createCompanyFAB, 10000);
      console.log('✓ Create company FAB found');
    } catch {
      console.log('Primary selector failed, using alternative...');
      fabButton = await waitForElement(
        driver,
        By.xpath('//button[contains(@class, "fixed") and contains(@class, "bottom-6")]'),
        5000,
      );
      console.log('✓ FAB found (alternative selector)');
    }

    await driver.wait(until.elementIsVisible(fabButton), 5000);
    await waitForElementOpacity(driver, fabButton, 1, 3000);

    console.log(
      `FAB status - Displayed: ${await fabButton.isDisplayed()}, Enabled: ${await fabButton.isEnabled()}`,
    );

    if (!(await fabButton.isEnabled())) {
      await waitForElementEnabled(driver, fabButton, 3000);
    }

    console.log('Clicking create company FAB...');

    try {
      await fabButton.click();
    } catch {
      await driver.executeScript('arguments[0].click();', fabButton);
    }

    console.log('✓ FAB clicked');
    console.log('Waiting for form to open...');

    const formOpen =
      (await waitForElementToAppear(driver, Selectors.companyNameInput, 5000)) ||
      (await waitForElementToAppear(driver, Selectors.companyFormDialog, 3000)) ||
      (await waitForElementToAppear(driver, Selectors.companyFormSheet, 3000)) ||
      (await waitForElementToAppear(driver, By.css('[role="dialog"]'), 3000));

    if (!formOpen) {
      throw new Error('Company form did not open after clicking FAB.');
    }

    console.log('✓ Company form opened successfully');
  } catch (error) {
    throw new Error(
      `Failed to open company form: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  console.log('\nStep 4: Filling required fields...');

  const testCompanyName = generateTestCompanyName();
  const testCNPJ = generateTestCNPJ();
  const testPostalCode = '70000-000';
  const testAddress = 'Rua Teste, 123';

  try {
    console.log(`Filling company name: ${testCompanyName}`);
    await fillInput(driver, Selectors.companyNameInput, testCompanyName);

    console.log(`Filling postal code: ${testPostalCode}`);
    await fillInput(driver, Selectors.companyPostalCodeInput, testPostalCode);

    console.log(`Filling CNPJ: ${testCNPJ}`);
    await fillInput(driver, Selectors.companyRegisterCodeInput, testCNPJ);

    console.log(`Filling address: ${testAddress}`);
    await fillInput(driver, Selectors.companyAddressInput, testAddress);

    console.log('✓ Required fields filled');
  } catch (error) {
    throw new Error(
      `Failed to fill required fields: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  console.log('\nStep 5: Filling optional fields and selecting city...');

  try {
    console.log('Waiting for city select...');

    const citySelect = await waitForElement(driver, Selectors.companyCitySelect, 10000);

    await driver.wait(
      async () => {
        const options = await citySelect.findElements(By.css('option'));
        return options.length > 1;
      },
      5000,
      'City select did not load options within timeout',
    );

    const options = await citySelect.findElements(By.css('option'));

    if (options.length > 1) {
      await options[1]!.click();

      await driver.wait(async () => {
        const value = await citySelect.getAttribute('value');
        return value !== '' && value !== null;
      }, 2000);

      console.log('✓ City selected');
    }

    if (await isElementPresent(driver, Selectors.companySpotsInput)) {
      console.log('Filling total spots: 50');
      await fillInput(driver, Selectors.companySpotsInput, '50');
    }

    if (await isElementPresent(driver, Selectors.companyDescriptionInput)) {
      console.log('Filling description...');
      const descInput = await driver.findElement(Selectors.companyDescriptionInput);
      await descInput.clear();
      await descInput.sendKeys('Estacionamento de teste criado via E2E');
      console.log('✓ Description filled');
    }
  } catch (error) {
    throw new Error(
      `Failed to fill optional fields: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  console.log('\nStep 6: Submitting company creation form...');

  try {
    const submitButton = await waitForElement(driver, Selectors.companyFormSubmitButton, 10000);

    console.log('✓ Submit button found');

    if (!(await submitButton.isEnabled())) {
      await waitForElementEnabled(driver, submitButton, 5000);
    }

    await driver.executeScript(
      'arguments[0].scrollIntoView({ behavior: "auto", block: "center" });',
      submitButton,
    );

    await driver.wait(until.elementIsVisible(submitButton), 2000);

    console.log('Clicking submit button...');

    try {
      await submitButton.click();
    } catch {
      await driver.executeScript('arguments[0].click();', submitButton);
    }

    console.log('✓ Form submitted');

    console.log('Waiting for form to close...');

    let formElement: any;

    try {
      formElement = await driver.findElement(Selectors.companyFormDialog);
    } catch {
      try {
        formElement = await driver.findElement(Selectors.companyFormSheet);
      } catch {
        console.log('✓ Form already closed');
      }
    }

    if (formElement) {
      await driver.wait(until.stalenessOf(formElement), 8000);
      console.log('✓ Form closed successfully');
    }
  } catch (error) {
    throw new Error(
      `Failed to submit form: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  console.log('\nStep 7: Validating company creation...');

  try {
    await waitForNavigation(driver, '/parking/', 10000);

    const currentUrl = await driver.getCurrentUrl();

    if (!currentUrl.includes('/parking/')) {
      throw new Error(`Expected URL to contain '/parking/', but got '${currentUrl}'`);
    }

    const urlMatch = currentUrl.match(/\/parking\/([^/]+)/);
    const companyId = urlMatch ? urlMatch[1] : 'unknown';

    console.log(`✓ Company created successfully: ${currentUrl}`);
    console.log(`✓ Company ID: ${companyId}`);
  } catch (error) {
    const currentUrl = await driver.getCurrentUrl();

    throw new Error(
      `Failed to validate company creation. Current URL: '${currentUrl}'. ` +
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  console.log('\n✓ All parking management tests passed successfully');
}
