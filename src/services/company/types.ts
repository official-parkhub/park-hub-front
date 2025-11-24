export type Country = 'BR';

export type BaseCitySchema = {
  name: string;
  identification_code: string | null;
  country: Country;
};

export type OrganizationSchema = {
  id: string;
  user_id: string;
  name: string;
  register_code: string;
  state_id: string;
  state: {
    id: string;
    name: string;
    country: Country;
    iso2_code: string;
  };
};

export type BaseParkingPriceSchema = {
  start_hour: number;
  end_hour: number;
  price_cents: number;
  is_discount: boolean;
  week_day: number;
};

export type BaseParkingExceptionSchema = {
  start_hour: number;
  end_hour: number;
  description: string;
  price_cents: number;
  exception_date: string;
};

export type TodayParkingPrice = {
  id: string;
  start_hour: number;
  end_hour: number;
  price_cents: number;
  is_discount: boolean;
  description: string | null;
  exception_date: string | null;
  reference_date: string;
};

export type Company = {
  id: string;
  name: string;
  postal_code: string;
  register_code: string;
  address: string;
  description: string | null;
  is_covered: boolean;
  has_camera: boolean;
  total_spots: number;
  has_charging_station: boolean;
  city: BaseCitySchema;
  organization_id: string;
  organization: OrganizationSchema;
  parking_prices: BaseParkingPriceSchema[];
  parking_exceptions: BaseParkingExceptionSchema[];
  today_parking_price?: TodayParkingPrice | null;
};

export type CompanyImage = {
  id: string;
  url: string;
  is_primary: boolean;
};

export type CompanyListResponse = {
  skip: number;
  limit: number;
  total: number;
  data: Company[];
};

export type PriceReference = {
  current_price_cents?: number;
  current_price_formatted?: string;
  weekly_prices?: BaseParkingPriceSchema[];
  exceptions?: BaseParkingExceptionSchema[];
};

export type CreateParkingPriceRequest = {
  week_day: number;
  start_hour: number;
  end_hour: number;
  price_cents: number;
  is_discount: boolean;
};

export type CreateParkingPriceExceptionRequest = {
  exception_date: string;
  start_hour: number;
  end_hour: number;
  price_cents: number;
  is_discount: boolean;
  description?: string | null;
};

export type CreateCompanyRequest = {
  name: string;
  postal_code: string;
  register_code: string;
  address: string;
  description?: string | null;
  is_covered: boolean;
  has_camera: boolean;
  total_spots: number;
  has_charging_station: boolean;
  city_id: string;
};
