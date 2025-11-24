export type ProfileType = 'driver' | 'organization';

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token_type: 'bearer';
  access_token: string;
};

export type CustomerSignupRequest = {
  customer: {
    first_name: string;
    last_name: string;
    birth_date: string;
  };
  user: {
    email: string;
    password: string;
  };
};

export type OrganizationSignupRequest = {
  organization: {
    name: string;
    register_code: string;
    state_id: string;
  };
  user: {
    email: string;
    password: string;
  };
};

export type ApiError = {
  kind?: string;
  detail: Array<{
    loc: Array<string | number>;
    msg: string;
    type: string;
  }>;
};

export type CustomerInfo = {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
};

export type OrganizationInfo = {
  id: string;
  user_id: string;
  name: string;
  register_code: string;
  state_id: string;
};

export type UserInfo = {
  id: string;
  email: string;
  is_admin: boolean;
  customer: CustomerInfo | null;
  organization: OrganizationInfo | null;
};
