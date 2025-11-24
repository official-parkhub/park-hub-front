import { By } from 'selenium-webdriver';

export const Selectors = {
  loginEmailInput: By.css(
    'input#username, input[name="username"], input[type="text"][placeholder*="email" i], input[type="email"]',
  ),
  loginPasswordInput: By.css('input[type="password"]'),
  loginSubmitButton: By.xpath(
    '//form//button[@type="submit"] | //button[@type="submit" and (contains(text(), "Entrar") or contains(text(), "Entrar como") or contains(text(), "Login"))]',
  ),
  profileTypeDriver: By.xpath('//button[@aria-label="Motorista" or contains(text(), "Motorista")]'),
  profileTypeOrganization: By.xpath(
    '//button[@aria-label="Organização" or contains(text(), "Organização")]',
  ),
  loginLink: By.xpath(
    '//a[contains(@href, "/login") or contains(text(), "Entrar") or contains(text(), "Login")]',
  ),
  accessSystemButton: By.xpath(
    '//a[contains(text(), "Acessar Sistema") or contains(@aria-label, "Acessar")]',
  ),
  comecarAgoraButton: By.xpath(
    '//a[contains(text(), "Começar Agora") or contains(@aria-label, "Começar") or contains(@aria-label, "Entrar no sistema") or contains(@aria-label, "Entrar no sistema ParkHub")]',
  ),
  vehiclesLink: By.xpath('//a[contains(@href, "/vehicles") or contains(text(), "Veículos")]'),
  homeLink: By.xpath(
    '//a[contains(@href, "/home") or contains(text(), "Home") or contains(text(), "Início")]',
  ),
  managerDashboardLink: By.xpath(
    '//a[contains(@href, "/manager-dashboard") or contains(text(), "Dashboard")]',
  ),
  addVehicleButton: By.xpath(
    '//button[contains(text(), "Adicionar") or contains(text(), "Novo") or contains(@aria-label, "adicionar") or contains(@aria-label, "novo")]',
  ),
  vehicleFormDialog: By.css('[role="dialog"], [data-state="open"]'),
  vehicleFormSheet: By.css('[role="dialog"][data-sheet], [data-state="open"]'),
  vehiclePlateInput: By.css(
    'input#plate, input[name="plate"], input[id="plate"], input[placeholder*="placa" i]',
  ),
  vehicleNameInput: By.css(
    'input#name, input[name="name"], input[id="name"], input[placeholder*="apelido" i]',
  ),
  vehicleModelInput: By.css(
    'input#model, input[name="model"], input[id="model"], input[placeholder*="modelo" i]',
  ),
  vehicleYearInput: By.css(
    'input#year, input[name="year"], input[id="year"], input[type="number"][placeholder*="ano" i]',
  ),
  vehicleColorInput: By.css(
    'input#color, input[name="color"], input[id="color"], input[placeholder*="cor" i]',
  ),
  vehicleFormSubmitButton: By.xpath(
    '//form//button[@type="submit" or contains(text(), "Salvar") or contains(text(), "Adicionar")]',
  ),
  vehicleList: By.css('[role="list"][aria-label*="veículos" i], [role="list"]'),
  vehicleCard: By.css('[aria-label*="Veículo" i], [role="listitem"]'),
  vehicleCardPlate: By.xpath('.//*[contains(text(), "")]'),
  parkingLotList: By.css('[role="list"][aria-label*="estacionamentos" i], [role="list"]'),
  parkingLotCard: By.css(
    'article[role="button"][aria-label^="Estacionamento"], article[aria-label*="Estacionamento"]',
  ),
  parkingLotCardName: By.xpath('.//h3[contains(@class, "font-semibold")]'),
  parkingLotCardAddress: By.xpath('.//p[contains(@aria-label, "Endereço")]'),
  parkingLotCardSpots: By.xpath('.//span[contains(@aria-label, "Total de vagas")]'),
  createCompanyFAB: By.xpath(
    '//button[@aria-label="Criar nova empresa" or contains(@aria-label, "Criar")]',
  ),
  companyList: By.css('[role="list"][aria-label*="estacionamentos" i], [role="list"]'),
  companyCard: By.css(
    'article[role="button"][aria-label^="Estacionamento"], article[aria-label*="Estacionamento"]',
  ),
  companyFormDialog: By.css('[role="dialog"], [data-state="open"]'),
  companyFormSheet: By.css('[role="dialog"][data-sheet], [data-state="open"]'),
  companyNameInput: By.css('input#name, input[name="name"], input[id="name"]'),
  companyPostalCodeInput: By.css(
    'input#postal_code, input[name="postal_code"], input[id="postal_code"]',
  ),
  companyRegisterCodeInput: By.css(
    'input#register_code, input[name="register_code"], input[id="register_code"]',
  ),
  companyAddressInput: By.css('input#address, input[name="address"], input[id="address"]'),
  companyDescriptionInput: By.css('textarea#description, textarea[name="description"]'),
  companyCitySelect: By.css('select#city_id, select[name="city_id"]'),
  companySpotsInput: By.css('input#total_spots, input[name="total_spots"], input[type="number"]'),
  companyIsCoveredCheckbox: By.css(
    'input#is_covered, input[name="is_covered"], input[type="checkbox"][aria-label*="coberto" i]',
  ),
  companyHasCameraCheckbox: By.css(
    'input#has_camera, input[name="has_camera"], input[type="checkbox"][aria-label*="câmera" i]',
  ),
  companyHasChargingCheckbox: By.css(
    'input#has_charging_station, input[name="has_charging_station"], input[type="checkbox"][aria-label*="carregamento" i]',
  ),
  companyFormSubmitButton: By.xpath(
    '//form//button[@type="submit" or contains(text(), "Criar") or contains(text(), "Salvar")]',
  ),
  registerEntranceButton: By.xpath(
    '//button[contains(text(), "Registrar Entrada") or contains(@aria-label, "Registrar entrada")]',
  ),
  registerExitButton: By.xpath(
    '//button[contains(text(), "Registrar Saída") or contains(@aria-label, "Registrar saída")]',
  ),
  vehicleEntranceFormDialog: By.css('[role="dialog"], [data-state="open"]'),
  vehicleEntranceFormSheet: By.css('[role="dialog"][data-sheet], [data-state="open"]'),
  vehicleEntrancePlateInput: By.css(
    'input#plate, input[name="plate"], input[placeholder*="placa" i]',
  ),
  vehicleEntranceSubmitButton: By.xpath(
    '//form//button[@type="submit" or contains(text(), "Registrar Entrada")]',
  ),
  activeVehiclesList: By.css('[role="list"][aria-label*="veículos ativos" i], [role="list"]'),
  activeVehicleCard: By.css('[role="listitem"]'),
  activeVehiclePlate: By.xpath('.//h4[contains(@class, "font-semibold")]'),
  activeVehicleExitButton: By.xpath(
    './/button[contains(text(), "Registrar Saída") or contains(@aria-label, "Registrar saída")]',
  ),
  vehicleExitFormDialog: By.css('[role="dialog"], [data-state="open"]'),
  vehicleExitFormSheet: By.css('[role="dialog"][data-sheet], [data-state="open"]'),
  vehicleExitPlateInput: By.css('input#plate, input[name="plate"], input[placeholder*="placa" i]'),
  vehicleExitDateInput: By.css('input#exit-date, input[name="date"], input[type="date"]'),
  vehicleExitTimeInput: By.css('input#exit-time, input[name="time"], input[type="time"]'),
  vehicleExitSubmitButton: By.xpath(
    '//form//button[@type="submit" or contains(text(), "Registrar Saída")]',
  ),
  loadingIndicator: By.css(
    '[role="status"][aria-label*="Carregando" i], [aria-label*="Loading" i]',
  ),
  errorMessage: By.css('[role="alert"], .text-destructive, [aria-live="polite"]'),
  successMessage: By.css('[role="alert"][class*="success"], .text-green'),
};
