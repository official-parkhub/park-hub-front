export type State = {
  id: string;
  name: string;
  iso2_code: string;
  country: 'BR';
};

export type StateListResponse = State[];

export type City = {
  id: string;
  name: string;
  identification_code: string | null;
  country: 'BR';
  state: {
    name: string;
    country: 'BR';
    iso2_code: string;
  };
};

export type CityListResponse = City[];
