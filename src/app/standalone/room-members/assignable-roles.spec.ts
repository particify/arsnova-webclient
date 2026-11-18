import { TestBed } from '@angular/core/testing';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';
import { RoomRole } from '@gql/generated/graphql';
import {
  ASSIGNABLE_ROLE_PROVIDERS,
  AssignableRoleProvider,
  AssignableRolesService,
} from './assignable-roles';

describe('AssignableRolesService', () => {
  function setUp(providers: AssignableRoleProvider[], enabled: string[]) {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: FeatureFlagService,
          useValue: { isEnabled: (f: string) => enabled.includes(f) },
        },
        ...providers.map((p) => ({
          provide: ASSIGNABLE_ROLE_PROVIDERS,
          useValue: p,
          multi: true,
        })),
      ],
    });
    return TestBed.inject(AssignableRolesService);
  }

  it('offers moderator on its own', () => {
    expect(setUp([], []).getRoles()).toEqual([RoomRole.Moderator]);
  });

  it('adds the roles of enabled providers in role order', () => {
    const service = setUp(
      [{ id: 'editor', roles: [RoomRole.Editor] }],
      ['extension-editor']
    );

    expect(service.getRoles()).toEqual([RoomRole.Moderator, RoomRole.Editor]);
  });

  it('ignores providers whose feature flag is off', () => {
    const service = setUp([{ id: 'editor', roles: [RoomRole.Editor] }], []);

    expect(service.getRoles()).toEqual([RoomRole.Moderator]);
  });

  it('never offers the owner role', () => {
    const service = setUp(
      [{ id: 'owner', roles: [RoomRole.Owner] }],
      ['extension-owner']
    );

    expect(service.getRoles()).toEqual([RoomRole.Moderator]);
  });
});
