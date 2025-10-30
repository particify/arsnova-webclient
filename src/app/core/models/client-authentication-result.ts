import { AuthenticatedUser } from './authenticated-user';

export enum AuthenticationStatus {
  SUCCESS = 'SUCCESS',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACTIVATION_PENDING = 'ACTIVATION_PENDING',
}

export class ClientAuthenticationResult {
  constructor(
    public authentication?: AuthenticatedUser,
    public status: AuthenticationStatus = AuthenticationStatus.SUCCESS
  ) {}
}
