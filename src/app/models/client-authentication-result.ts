import { ClientAuthentication } from './client-authentication';

export enum AuthenticationStatus {
  SUCCESS = 'SUCCESS',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACTIVATION_PENDING = 'ACTIVATION_PENDING'
}

export class ClientAuthenticationResult {
  constructor(
    public authentication: ClientAuthentication | null,
    public status: AuthenticationStatus = AuthenticationStatus.SUCCESS
  ) {
  }
}
