import { Injectable, InjectionToken, inject } from '@angular/core';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';
import { RoomRole } from '@gql/generated/graphql';

/**
 * Further roles an owner may assign to room members, besides moderator. Provided with
 * `multi: true`, and like an extension enabled only while the feature flag `extension-<id>` is.
 */
export interface AssignableRoleProvider {
  id: string;
  roles: RoomRole[];
}

export const ASSIGNABLE_ROLE_PROVIDERS = new InjectionToken<
  AssignableRoleProvider[]
>('ASSIGNABLE_ROLE_PROVIDERS');

const ROLE_ORDER = [RoomRole.Moderator, RoomRole.Editor];

/** The roles offered when inviting members or changing their role, lowest first. */
@Injectable({ providedIn: 'root' })
export class AssignableRolesService {
  private readonly featureFlagService = inject(FeatureFlagService);
  private readonly providers =
    inject(ASSIGNABLE_ROLE_PROVIDERS, { optional: true }) ?? [];

  /** Evaluated on each call, since feature flag overrides arrive with the API config. */
  getRoles(): RoomRole[] {
    const extra = this.providers
      .filter((p) => this.featureFlagService.isEnabled('extension-' + p.id))
      .flatMap((p) => p.roles);
    return ROLE_ORDER.filter(
      (role) => role === RoomRole.Moderator || extra.includes(role)
    );
  }
}
