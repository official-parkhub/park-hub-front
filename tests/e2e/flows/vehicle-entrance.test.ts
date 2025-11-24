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
import { createTestUser, getApiUrl } from '../helpers/userFactory.js';
import { seleniumConfig } from '../selenium.config.js';

async function getAuthToken(driver: WebDriver): Promise<string> {
  const token = await driver.executeScript(`
    return sessionStorage.getItem('parkhub_access_token');
  `);
  if (!token || typeof token !== 'string') {
    throw new Error(
      'Token de autenticação não encontrado. Usuário pode não estar autenticado. Verifique se o login foi realizado com sucesso.',
    );
  }
  return token;
}

function convertDayToAPI(jsDay: number): number {
  if (jsDay === 0) {
    return 6;
  }
  return jsDay - 1;
}

async function createParkingPrice(companyId: string, driver: WebDriver): Promise<void> {
  const apiUrl = getApiUrl();
  const token = await getAuthToken(driver);
  const now = new Date();
  const currentDay = convertDayToAPI(now.getDay());
  const nextDayDate = new Date(now);
  nextDayDate.setDate(nextDayDate.getDate() + 1);
  const nextDay = convertDayToAPI(nextDayDate.getDay());
  const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  const createPrice = async (weekDay: number, dayName: string) => {
    const priceData = {
      week_day: weekDay,
      start_hour: 0,
      end_hour: 23,
      price_cents: 500,
      is_discount: false,
    };

    console.log(
      `Creating price for ${dayName} (week_day=${weekDay}), covering entire day (00:00-23:59)`,
    );

    const response = await fetch(`${apiUrl}/api/core/company/${companyId}/price/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(priceData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Erro ao criar preço';

      try {
        const error = JSON.parse(errorText);
        errorMessage = error.detail?.[0]?.msg || errorMessage;
      } catch {
        errorMessage = `Erro ao criar preço (${response.status}): ${errorText}`;
      }

      throw new Error(errorMessage);
    }

    console.log(`✓ Parking price created for ${dayName} (week_day=${weekDay})`);
  };

  try {
    const currentDayName = dayNames[currentDay];
    if (!currentDayName) {
      throw new Error(`Invalid day index: ${currentDay}`);
    }

    await createPrice(currentDay, currentDayName);

    if (currentDay !== nextDay) {
      const nextDayName = dayNames[nextDay];
      if (!nextDayName) {
        throw new Error(`Invalid day index: ${nextDay}`);
      }

      await createPrice(nextDay, nextDayName);
    }

    console.log('✓ All parking prices created successfully');
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create parking price: ${error.message}`);
    }
    throw new Error('Failed to create parking price: Unknown error');
  }
}

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

async function createParkingLot(driver: WebDriver): Promise<string> {
  const { baseUrl } = seleniumConfig;
  await driver.get(`${baseUrl}/manager-dashboard`);
  await waitForElement(driver, By.id('main-content'), 10000);

  const fabButton = await waitForElement(driver, Selectors.createCompanyFAB, 10000);
  await driver.wait(until.elementIsVisible(fabButton), 5000);
  await waitForElementOpacity(driver, fabButton, 1, 3000);

  try {
    await fabButton.click();
  } catch {
    await driver.executeScript('arguments[0].click();', fabButton);
  }

  await waitForElementToAppear(driver, Selectors.companyNameInput, 5000);

  const timestamp = Date.now();
  const testCompanyName = `Estacionamento Teste ${timestamp}`;
  const testCNPJ = cnpj.format(cnpj.generate());
  const testPostalCode = '70000-000';
  const testAddress = 'Rua Teste, 123';

  await fillInput(driver, Selectors.companyNameInput, testCompanyName);
  await fillInput(driver, Selectors.companyPostalCodeInput, testPostalCode);
  await fillInput(driver, Selectors.companyRegisterCodeInput, testCNPJ);
  await fillInput(driver, Selectors.companyAddressInput, testAddress);

  const citySelect = await waitForElement(driver, Selectors.companyCitySelect, 10000);
  await driver.wait(async () => {
    const options = await citySelect.findElements(By.css('option'));
    return options.length > 1;
  }, 5000);

  const options = await citySelect.findElements(By.css('option'));
  if (options.length < 2) {
    throw new Error('No city options available in select');
  }

  await options[1]!.click();
  await driver.wait(async () => {
    const value = await citySelect.getAttribute('value');
    return value !== '' && value !== null;
  }, 2000);

  if (await isElementPresent(driver, Selectors.companySpotsInput)) {
    await fillInput(driver, Selectors.companySpotsInput, '50');
  }

  const submitButton = await waitForElement(driver, Selectors.companyFormSubmitButton, 10000);
  if (!(await submitButton.isEnabled())) {
    await waitForElementEnabled(driver, submitButton, 5000);
  }

  await driver.executeScript(
    'arguments[0].scrollIntoView({ behavior: "auto", block: "center" });',
    submitButton,
  );

  await driver.wait(until.elementIsVisible(submitButton), 2000);

  try {
    await submitButton.click();
  } catch {
    await driver.executeScript('arguments[0].click();', submitButton);
  }

  let formElement;
  try {
    formElement = await driver.findElement(Selectors.companyFormDialog);
  } catch {
    try {
      formElement = await driver.findElement(Selectors.companyFormSheet);
    } catch {}
  }

  if (formElement) {
    await driver.wait(until.stalenessOf(formElement), 8000);
  }

  await waitForNavigation(driver, '/parking/', 10000);
  const currentUrl = await driver.getCurrentUrl();
  const urlMatch = currentUrl.match(/\/parking\/([^/]+)/);

  if (!urlMatch || !urlMatch[1]) {
    throw new Error(`Could not extract company ID from URL: ${currentUrl}`);
  }

  return urlMatch[1];
}

function generateTestPlate(): string {
  const timestamp = Date.now().toString().slice(-6);
  return `ENT${timestamp}`;
}

export default async function vehicleEntranceTest(driver: WebDriver): Promise<void> {
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

  console.log('\nStep 2: Creating parking lot for testing...');
  let companyId: string;
  try {
    companyId = await createParkingLot(driver);
    console.log(`✓ Parking lot created with ID: ${companyId}`);
    console.log(`✓ Navigated to parking details: /parking/${companyId}`);
  } catch (error) {
    throw new Error(
      `Failed to create parking lot: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  console.log('\nStep 2.5: Creating parking prices for the parking lot...');
  try {
    await createParkingPrice(companyId, driver);
    console.log('✓ Parking prices created (R$ 5,00 per hour for current day and next day)');
  } catch (error) {
    throw new Error(
      `Failed to create parking price: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  console.log('\nStep 3: Waiting for parking details page to load...');
  try {
    await waitForElement(driver, By.id('main-content'), 10000);
    console.log('✓ Main content loaded');
    console.log('Waiting for company data to load...');
    await driver.wait(
      async () => {
        const hasCompanyData = await isElementPresent(
          driver,
          By.xpath('//*[contains(text(), "Estacionamento") or contains(text(), "Vagas")]'),
        );

        return hasCompanyData;
      },
      15000,
      'Company data did not load within timeout',
    );

    console.log('Scrolling to find Vehicle Management Section...');
    await driver.executeScript('window.scrollTo(0, document.body.scrollHeight / 2);');
    await driver.sleep(1000);
    console.log('Waiting for Vehicle Management Section to appear...');

    let managementSectionPresent = false;
    managementSectionPresent = await waitForElementToAppear(
      driver,
      By.xpath('//*[contains(text(), "Gerenciamento de Veículos")]'),
      5000,
    );

    if (!managementSectionPresent) {
      console.log('Title not found, looking for management buttons...');
      managementSectionPresent = await waitForElementToAppear(
        driver,
        By.xpath(
          '//button[contains(text(), "Registrar Entrada") or contains(text(), "Registrar Saída")]',
        ),
        5000,
      );
    }

    if (!managementSectionPresent) {
      console.log('Scrolling more to find management section...');
      await driver.executeScript('window.scrollTo(0, document.body.scrollHeight);');
      await driver.sleep(1000);

      managementSectionPresent = await waitForElementToAppear(
        driver,
        By.xpath(
          '//button[contains(text(), "Registrar Entrada") or contains(text(), "Registrar Saída")]',
        ),
        5000,
      );
    }

    if (!managementSectionPresent) {
      throw new Error(
        'Vehicle Management Section not found. User may not have permission to manage this parking lot or page did not load correctly.',
      );
    }
    console.log('✓ Vehicle Management Section found');
  } catch (error) {
    throw new Error(
      `Failed to load parking details page: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  console.log('\nStep 4: Opening vehicle entrance form...');
  try {
    console.log('Waiting for register entrance button...');
    let entranceButton;
    let found = false;
    for (let i = 0; i < 5; i++) {
      try {
        entranceButton = await waitForElement(driver, Selectors.registerEntranceButton, 3000);
        found = true;
        break;
      } catch {
        await driver.executeScript('window.scrollBy(0, 500);');
        await driver.sleep(500);
      }
    }

    if (!found || !entranceButton) {
      try {
        entranceButton = await driver.findElement(
          By.xpath('//button[contains(text(), "Entrada")]'),
        );
        found = true;
      } catch {
        throw new Error(
          'Register entrance button not found. Vehicle Management Section may not be visible or user may not have permission.',
        );
      }
    }

    console.log('✓ Register entrance button found');
    if (!(await entranceButton.isEnabled())) {
      await waitForElementEnabled(driver, entranceButton, 3000);
    }

    await driver.executeScript(
      'arguments[0].scrollIntoView({ behavior: "auto", block: "center" });',
      entranceButton,
    );

    await driver.wait(until.elementIsVisible(entranceButton), 2000);
    console.log('Clicking register entrance button...');
    try {
      await entranceButton.click();
    } catch {
      await driver.executeScript('arguments[0].click();', entranceButton);
    }

    console.log('Waiting for entrance form to open...');
    const formOpen =
      (await waitForElementToAppear(driver, Selectors.vehicleEntrancePlateInput, 5000)) ||
      (await waitForElementToAppear(driver, Selectors.vehicleEntranceFormDialog, 3000)) ||
      (await waitForElementToAppear(driver, Selectors.vehicleEntranceFormSheet, 3000));

    if (!formOpen) {
      throw new Error('Vehicle entrance form did not open after clicking button');
    }
    console.log('✓ Vehicle entrance form opened');
  } catch (error) {
    throw new Error(
      `Failed to open entrance form: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  console.log('\nStep 5: Filling vehicle entrance form...');
  const testPlate = generateTestPlate();
  try {
    console.log(`Filling plate: ${testPlate}`);
    await fillInput(driver, Selectors.vehicleEntrancePlateInput, testPlate);
    console.log('✓ Plate filled');
  } catch (error) {
    throw new Error(
      `Failed to fill entrance form: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  console.log('\nStep 6: Submitting vehicle entrance form...');
  try {
    console.log('Waiting for submit button...');
    const submitButton = await waitForElement(driver, Selectors.vehicleEntranceSubmitButton, 10000);
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
    let formClosed = false;
    try {
      let formElement;
      try {
        formElement = await driver.findElement(Selectors.vehicleEntranceFormDialog);
      } catch {
        try {
          formElement = await driver.findElement(Selectors.vehicleEntranceFormSheet);
        } catch {
          formClosed = true;
        }
      }

      if (formElement && !formClosed) {
        try {
          await driver.wait(until.stalenessOf(formElement), 5000);
          formClosed = true;
        } catch {
          try {
            const isDisplayed = await formElement.isDisplayed();
            if (!isDisplayed) {
              formClosed = true;
            }
          } catch {
            formClosed = true;
          }
        }
      }
    } catch {
      formClosed = true;
    }

    if (!formClosed) {
      try {
        await driver.wait(
          async () => {
            try {
              await driver.findElement(Selectors.vehicleEntrancePlateInput);
              return false;
            } catch {
              return true;
            }
          },
          5000,
          'Form input did not disappear',
        );
        formClosed = true;
      } catch {}
    }

    if (!formClosed) {
      const errorPresent = await isElementPresent(driver, Selectors.errorMessage);

      if (errorPresent) {
        const errorElement = await driver.findElement(Selectors.errorMessage);
        const errorText = await errorElement.getText();
        throw new Error(`Form submission failed with error: ${errorText}`);
      }
    }

    if (!formClosed) {
      await driver.sleep(1000);
      const stillPresent = await isElementPresent(driver, Selectors.vehicleEntrancePlateInput);
      if (stillPresent) {
        throw new Error(
          'Form did not close after submission. It may still be processing or there may be an error.',
        );
      }
    }

    console.log('✓ Form closed successfully');
  } catch (error) {
    throw new Error(
      `Failed to submit entrance form: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  console.log('\nStep 7: Validating vehicle appears in active vehicles list...');

  try {
    console.log('Waiting for active vehicles list...');
    await waitForElement(driver, Selectors.activeVehiclesList, 10000);
    console.log('✓ Active vehicles list found');
    console.log(`Waiting for vehicle with plate "${testPlate}" to appear in list...`);
    let vehicleFound = false;
    for (let i = 0; i < 10; i++) {
      const cards = await driver.findElements(Selectors.activeVehicleCard);
      for (const card of cards) {
        try {
          const plateElement = await card.findElement(Selectors.activeVehiclePlate);
          const plateText = await plateElement.getText();
          if (plateText.includes(testPlate)) {
            vehicleFound = true;
            console.log(`✓ Vehicle with plate "${testPlate}" found in active vehicles list`);
            break;
          }
        } catch {
          continue;
        }
      }
      if (vehicleFound) {
        break;
      }
      await driver.sleep(500);
    }

    if (!vehicleFound) {
      const cards = await driver.findElements(Selectors.activeVehicleCard);
      const allPlates: string[] = [];
      for (const card of cards) {
        try {
          const plateElement = await card.findElement(Selectors.activeVehiclePlate);
          const plateText = await plateElement.getText();
          allPlates.push(plateText);
        } catch {
          allPlates.push('(could not read)');
        }
      }

      throw new Error(
        `Vehicle with plate "${testPlate}" not found in active vehicles list. ` +
          `Found ${cards.length} vehicle(s). ` +
          `Plates found: ${allPlates.join(', ')}`,
      );
    }
    console.log('✓ Vehicle entrance validated successfully');
  } catch (error) {
    throw new Error(
      `Failed to validate vehicle in active list: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
  console.log('\n✓ All vehicle entrance tests passed successfully');
}
