export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  roles?: string[];
}

export interface AuthUser extends User {
  token?: string;
  refreshToken?: string;
}