export enum AuthenticationProviderType {
  ANONYMOUS = 'ANONYMOUS',
  USERNAME_PASSWORD = 'USERNAME_PASSWORD',
  SSO = 'SSO'
}

export enum AuthenticationProviderRole {
  MODERATOR = 'MODERATOR',
  PARTICIPANT = 'PARTICIPANT'
}

export interface AuthenticationProvider {
  id: string;
  title: string;
  type: AuthenticationProviderType;
  order: number;
  allowedRoles: AuthenticationProviderRole[];
}

export interface Feature {
  enabled: boolean;
}

export interface UiConfig {
  [configName: string]: any;
}

export class ApiConfig {
  constructor(
    public authenticationProviders: AuthenticationProvider[],
    public features: { [featureName: string]: Feature },
    public ui: UiConfig) {
  }
}
