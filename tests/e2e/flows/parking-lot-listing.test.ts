import type { WebDriver } from 'selenium-webdriver';
import type { TestUser } from '../helpers/userFactory.js';
import { navigateToLogin } from '../helpers/navigation.js';
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

export default async function parkingLotListingTest(driver: WebDriver): Promise<void> {
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

  console.log('\nStep 2: Waiting for parking lot list to load...');

  try {
    await waitForElement(driver, Selectors.parkingLotList, 15000);
    console.log('✓ Parking lot list container found');
    await driver.sleep(2000);
  } catch (error) {
    throw new Error(
      `Failed to find parking lot list container: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  console.log('\nStep 3: Validating parking lots are displayed...');

  try {
    const cards = await driver.findElements(Selectors.parkingLotCard);
    const cardCount = cards.length;
    console.log(`Found ${cardCount} parking lot card(s)`);
    if (cardCount === 0) {
      const emptyMessage = await isElementPresent(driver, Selectors.parkingLotList);
      if (emptyMessage) {
        throw new Error(
          'No parking lots found in the list. ' +
            'This may be expected if there are no parking lots in the database, ' +
            'but the test requires at least one parking lot to validate the listing functionality.',
        );
      } else {
        throw new Error(
          'No parking lot cards found. List may still be loading or there may be an error.',
        );
      }
    }
    console.log(`✓ Found ${cardCount} parking lot(s) in the list`);
  } catch (error) {
    throw new Error(
      `Failed to validate parking lots: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  console.log('\nStep 4: Validating parking lot information...');

  try {
    const cards = await driver.findElements(Selectors.parkingLotCard);

    if (cards.length === 0) {
      throw new Error('No parking lot cards found to validate');
    }

    const firstCard = cards[0];

    if (!firstCard) {
      throw new Error('First card is undefined');
    }

    let cardName: string;

    try {
      const nameElement = await firstCard.findElement(Selectors.parkingLotCardName);
      cardName = await nameElement.getText();
      console.log(`✓ Parking lot name: "${cardName}"`);
      if (!cardName || cardName.trim().length === 0) {
        throw new Error('Parking lot name is empty');
      }
    } catch (error) {
      throw new Error(
        `Failed to get parking lot name: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    let cardAddress: string;
    try {
      const addressElement = await firstCard.findElement(Selectors.parkingLotCardAddress);

      cardAddress = await addressElement.getText();
      console.log(`✓ Parking lot address: "${cardAddress}"`);

      if (!cardAddress || cardAddress.trim().length === 0) {
        throw new Error('Parking lot address is empty');
      }
    } catch (error) {
      throw new Error(
        `Failed to get parking lot address: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    try {
      const spotsElement = await firstCard.findElement(Selectors.parkingLotCardSpots);
      const spotsText = await spotsElement.getText();

      console.log(`✓ Parking lot spots info: "${spotsText}"`);
    } catch {
      console.log('  (Spots information not found, continuing...)');
    }
    console.log('✓ All basic information validated');
  } catch (error) {
    throw new Error(
      `Failed to validate parking lot information: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  console.log('\nStep 5: Validating parking lot card interaction...');

  try {
    const cards = await driver.findElements(Selectors.parkingLotCard);

    if (cards.length === 0) {
      throw new Error('No parking lot cards found to click');
    }

    const firstCard = cards[0];

    if (!firstCard) {
      throw new Error('First card is undefined');
    }

    await driver.executeScript(
      'arguments[0].scrollIntoView({ behavior: "smooth", block: "center" });',
      firstCard,
    );

    await driver.sleep(500);

    const cardLabel = await firstCard.getAttribute('aria-label');
    console.log(`Clicking on: ${cardLabel}`);
    try {
      await firstCard.click();
    } catch {
      console.log('Regular click failed, trying JavaScript click...');
      await driver.executeScript('arguments[0].click();', firstCard);
    }

    console.log('✓ Parking lot card clicked');
    await waitForNavigation(driver, '/parking/', 10000);

    const currentUrl = await driver.getCurrentUrl();

    if (!currentUrl.includes('/parking/')) {
      throw new Error(`Expected URL to contain '/parking/', but got '${currentUrl}'`);
    }

    console.log(`✓ Navigated to parking lot details: ${currentUrl}`);
  } catch (error) {
    const currentUrl = await driver.getCurrentUrl();
    throw new Error(
      `Failed to validate parking lot card interaction. Current URL: '${currentUrl}'. ` +
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
  console.log('\n✓ All parking lot listing tests passed successfully');
}
