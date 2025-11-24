export type Vehicle = {
  id: string;
  plate: string;
  name: string;
  model?: string;
  year?: number;
  color?: string;
  country: string;
};

export type CreateVehicleRequest = {
  name: string;
  vehicle: {
    plate: string;
    model?: string;
    year?: number;
    color?: string;
    country?: string;
  };
};

export type ActiveVehicle = {
  vehicle: Vehicle;
  company: {
    id: string;
    name: string;
    address: string;
  };
  current_price_cents?: number;
  entrance_date?: string;

  [key: string]: unknown;
};

export type VehicleMetrics = {
  [key: string]: unknown;
};

export type VehicleEntranceRequest = {
  plate: string;
};

export type VehicleExitRequest = {
  plate: string;
  ended_at?: string;
};

export type VehicleExitResponse = {
  vehicle_id: string;
  company_id: string;
  entrance_date: string;
  ended_at: string;
  total_price: number;
  hourly_rate: number;
};

export type CompanyActiveVehicle = {
  vehicle_id: string;
  company_id: string;
  entrance_date: string;
  hourly_rate?: number;
  current_price_cents?: number;
  plate?: string;
};

export type VehicleHistoryRecord = {
  vehicle_id: string;
  company_id: string;
  entrance_date: string;
  ended_at: string | null;
  total_price: number | null;
  hourly_rate: number;
  plate?: string;
};

export type PaginatedResponse<T> = {
  skip: number;
  limit: number;
  total: number;
  data: T[];
};
