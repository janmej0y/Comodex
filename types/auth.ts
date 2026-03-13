export enum Role {
  MANAGER = "MANAGER",
  STORE_KEEPER = "STORE_KEEPER"
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthState {
  token: string | null;
  user: User | null;
}

export interface LoginInput {
  email: string;
  password: string;
  role: Role;
}
