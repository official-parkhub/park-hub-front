import type { WebDriver } from 'selenium-webdriver';
import type { TestUser } from '../helpers/userFactory.js';
import { until } from 'selenium-webdriver';
import { navigateToLogin, navigateToVehicles } from '../helpers/navigation.js';
import { Selectors } from '../helpers/selectors.js';
import {
  clickElement,
  fillInput,
  isElementPresent,
  waitForElement,
  waitForNavigation,
} from '../helpers/testHelpers.js';
import { createTestUser } from '../helpers/userFactory.js';
import { seleniumConfig } from '../selenium.config.js';

async function performDriverLogin(
  driver: WebDriver,
  email: string,
  password: string,
): Promise<void> {
  await waitForElement(driver, Selectors.loginEmailInput, 10000);
  await driver.sleep(500);
  console.log('Selecting driver profile type');

  await clickElement(driver, Selectors.profileTypeDriver);
  await driver.sleep(300);
  console.log(`Filling email: ${email}`);

  await fillInput(driver, Selectors.loginEmailInput, email);
  await driver.sleep(200);
  console.log('Filling password');

  await fillInput(driver, Selectors.loginPasswordInput, password);
  await driver.sleep(300);
  console.log('Waiting for submit button...');

  const submitButton = await waitForElement(driver, Selectors.loginSubmitButton, 10000);
  const isEnabled = await submitButton.isEnabled();

  if (!isEnabled) {
    await driver.sleep(1000);
    const stillDisabled = await submitButton.isEnabled();
    if (!stillDisabled) {
      throw new Error('Submit button is disabled');
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
    await driver.executeScript('arguments[0].click();', submitButton);
  }
  console.log('Submit button clicked');
}

function generateTestPlate(): string {
  const timestamp = Date.now().toString().slice(-6);
  return `TEST${timestamp}`;
}

export default async function vehicleRegistrationTest(driver: WebDriver): Promise<void> {
  const { baseUrl: _baseUrl } = seleniumConfig;
  console.log('Step 1: Authenticating as driver...');

  let testUser: TestUser;
  try {
    console.log('Creating test driver user via API...');
    testUser = await createTestUser('driver');
    console.log(`✓ Created test driver user: ${testUser.email}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(
      `Failed to create test driver user: ${errorMessage}\n` +
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
    await performDriverLogin(driver, testUser.email, testUser.password);
    console.log('✓ Login form submitted');
  } catch (error) {
    throw new Error(
      `Failed to perform login: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  try {
    await waitForNavigation(driver, '/home', 15000);
    const currentUrl = await driver.getCurrentUrl();
    if (!currentUrl.includes('/home')) {
      throw new Error(`Expected URL to contain '/home', but got '${currentUrl}'`);
    }
    console.log('✓ Driver authenticated and redirected to /home');
  } catch (error) {
    const currentUrl = await driver.getCurrentUrl();
    throw new Error(
      `Failed to validate login redirection. Expected '/home', but current URL is '${currentUrl}': ` +
        `${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  console.log('\nStep 2: Navigating to vehicles page...');
  try {
    await navigateToVehicles(driver);
    console.log('✓ Navigated to vehicles page');
    await driver.sleep(1000);
  } catch (error) {
    throw new Error(
      `Failed to navigate to vehicles page: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  console.log('\nStep 3: Opening vehicle registration form...');
  try {
    await waitForElement(driver, Selectors.addVehicleButton, 10000);
    console.log('✓ Add vehicle button found');

    const addButton = await driver.findElement(Selectors.addVehicleButton);

    await driver.executeScript(
      'arguments[0].scrollIntoView({ behavior: "smooth", block: "center" });',
      addButton,
    );

    await driver.sleep(300);
    console.log('Clicking add vehicle button...');
    try {
      await addButton.click();
    } catch {
      await driver.executeScript('arguments[0].click();', addButton);
    }

    await driver.sleep(1000);
    const formOpen =
      (await isElementPresent(driver, Selectors.vehicleFormDialog)) ||
      (await isElementPresent(driver, Selectors.vehicleFormSheet));

    if (!formOpen) {
      throw new Error('Vehicle form did not open after clicking add button');
    }
    console.log('✓ Vehicle form opened');
  } catch (error) {
    throw new Error(
      `Failed to open vehicle form: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  console.log('\nStep 4: Filling required fields...');
  const testPlate = generateTestPlate();
  const testName = 'Veículo de Teste';
  try {
    console.log(`Filling plate: ${testPlate}`);
    await waitForElement(driver, Selectors.vehiclePlateInput, 5000);
    await fillInput(driver, Selectors.vehiclePlateInput, testPlate);
    await driver.sleep(200);

    console.log('✓ Plate filled');
    console.log(`Filling name: ${testName}`);

    await waitForElement(driver, Selectors.vehicleNameInput, 5000);
    await fillInput(driver, Selectors.vehicleNameInput, testName);
    await driver.sleep(200);

    console.log('✓ Name filled');
  } catch (error) {
    throw new Error(
      `Failed to fill required fields: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  console.log('\nStep 5: Filling optional fields...');
  try {
    const modelPresent = await isElementPresent(driver, Selectors.vehicleModelInput);
    if (modelPresent) {
      console.log('Filling model: Test Model');
      await fillInput(driver, Selectors.vehicleModelInput, 'Test Model');
      await driver.sleep(200);
      console.log('✓ Model filled');
    } else {
      console.log('  (Model field not found, skipping...)');
    }
    
    const yearPresent = await isElementPresent(driver, Selectors.vehicleYearInput);
    if (yearPresent) {
      console.log('Filling year: 2020');
      await fillInput(driver, Selectors.vehicleYearInput, '2020');
      await driver.sleep(200);
      console.log('✓ Year filled');
    } else {
      console.log('  (Year field not found, skipping...)');
    }

    const colorPresent = await isElementPresent(driver, Selectors.vehicleColorInput);
    if (colorPresent) {
      console.log('Filling color: Branco');
      await fillInput(driver, Selectors.vehicleColorInput, 'Branco');
      await driver.sleep(200);
      console.log('✓ Color filled');
    } else {
      console.log('  (Color field not found, skipping...)');
    }
  } catch (error) {
    console.log(
      `  (Warning: Some optional fields may not be available: ${error instanceof Error ? error.message : 'Unknown error'})`,
    );
  }

  console.log('\nStep 6: Submitting vehicle registration form...');
  try {
    await waitForElement(driver, Selectors.vehicleFormSubmitButton, 5000);

    const submitButton = await driver.findElement(Selectors.vehicleFormSubmitButton);
    const isEnabled = await submitButton.isEnabled();
    if (!isEnabled) {
      await driver.sleep(1000);
      const stillDisabled = await submitButton.isEnabled();
      if (!stillDisabled) {
        throw new Error('Submit button is disabled');
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
      await driver.executeScript('arguments[0].click();', submitButton);
    }

    console.log('✓ Form submitted');
    console.log('Waiting for form to close...');
    try {
      let formElement;
      try {
        formElement = await driver.findElement(Selectors.vehicleFormDialog);
      } catch {
        try {
          formElement = await driver.findElement(Selectors.vehicleFormSheet);
        } catch {
          console.log('✓ Form already closed');
        }
      }

      if (formElement) {
        try {
          await driver.wait(until.stalenessOf(formElement), 3000);
          console.log('✓ Form closed successfully');
        } catch {
          const errorPresent = await isElementPresent(driver, Selectors.errorMessage);
          if (errorPresent) {
            const errorElement = await driver.findElement(Selectors.errorMessage);
            const errorText = await errorElement.getText();
            throw new Error(`Form submission failed with error: ${errorText}`);
          }
          throw new Error('Form did not close after submission within expected time.');
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Form did not close')) {
        const errorPresent = await isElementPresent(driver, Selectors.errorMessage);
        if (errorPresent) {
          const errorElement = await driver.findElement(Selectors.errorMessage);
          const errorText = await errorElement.getText();
          throw new Error(`Form submission failed with error: ${errorText}`);
        }
      }

      throw error;
    }
  } catch (error) {
    throw new Error(
      `Failed to submit form: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  console.log('\nStep 7: Validating vehicle appears in list...');
  try {
    await waitForElement(driver, Selectors.vehicleList, 10000);
    console.log('✓ Vehicle list found');
    console.log('Scrolling to vehicle list container...');

    const listContainer = await driver.findElement(Selectors.vehicleList);

    await driver.executeScript(
      'arguments[0].scrollIntoView({ behavior: "smooth", block: "start" });',
      listContainer,
    );

    await driver.sleep(800);
    let cards = await driver.findElements(Selectors.vehicleCard);
    console.log(`Found ${cards.length} vehicle card(s) in list`);

    if (cards.length === 0) {
      throw new Error('No vehicles found in list. Vehicle may not have been created successfully.');
    }

    console.log('Scrolling through vehicle cards to ensure all are visible...');
    for (let i = 0; i < Math.min(cards.length, 5); i++) {
      try {
        const card = cards[i];
        if (!card) {
          continue;
        }
        await driver.executeScript(
          'arguments[0].scrollIntoView({ behavior: "auto", block: "center" });',
          card,
        );
        await driver.sleep(150);
      } catch {
        continue;
      }
    }

    cards = await driver.findElements(Selectors.vehicleCard);
    console.log(`After scrolling, found ${cards.length} vehicle card(s)`);
    let vehicleFound = false;
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      if (!card) {
        continue;
      }
      try {
        await driver.executeScript(
          'arguments[0].scrollIntoView({ behavior: "auto", block: "center" });',
          card,
        );

        await driver.sleep(100);
        const cardText = await card.getText();
        if (cardText.includes(testPlate)) {
          vehicleFound = true;
          console.log(`✓ Vehicle with plate "${testPlate}" found in list (card ${i + 1})`);
          break;
        }
      } catch {
        continue;
      }
    }

    if (!vehicleFound) {
      console.log('Vehicle not found in visible cards, scrolling to bottom of list...');
      await driver.executeScript('window.scrollTo(0, document.body.scrollHeight);');
      await driver.sleep(800);
      cards = await driver.findElements(Selectors.vehicleCard);
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        if (!card) {
          continue;
        }
        try {
          await driver.executeScript(
            'arguments[0].scrollIntoView({ behavior: "auto", block: "center" });',
            card,
          );
          await driver.sleep(100);
          const cardText = await card.getText();
          if (cardText.includes(testPlate)) {
            vehicleFound = true;
            console.log(
              `✓ Vehicle with plate "${testPlate}" found after scrolling to bottom (card ${i + 1})`,
            );
            break;
          }
        } catch {
          continue;
        }
      }
    }

    if (!vehicleFound) {
      const allCardsText: string[] = [];
      for (let i = 0; i < Math.min(cards.length, 5); i++) {
        try {
          const card = cards[i];
          if (!card) {
            continue;
          }

          await driver.executeScript(
            'arguments[0].scrollIntoView({ behavior: "smooth", block: "center" });',
            card,
          );

          await driver.sleep(200);
          const text = await card.getText();
          allCardsText.push(text.substring(0, 100));
        } catch {
          allCardsText.push('(could not read)');
        }
      }

      throw new Error(
        `Vehicle with plate "${testPlate}" not found in list. ` +
          `Found ${cards.length} vehicle(s). ` +
          `First few card texts: ${allCardsText.join(' | ')}`,
      );
    }

    console.log('✓ Vehicle registration validated successfully');
  } catch (error) {
    throw new Error(
      `Failed to validate vehicle in list: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  console.log('\n✓ All vehicle registration tests passed successfully');
}
