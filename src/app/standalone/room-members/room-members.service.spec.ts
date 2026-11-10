import { TestBed } from '@angular/core/testing';
import { DialogService } from '@app/core/services/util/dialog.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import {
  GrantRoomRoleGql,
  RevokeRoomRoleGql,
  RoomManagingMembersByRoomIdGql,
  RoomRole,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { of } from 'rxjs';
import { member } from './member-list/member-list.component.spec';
import { RoomMembersService } from './room-members.service';

describe('RoomMembersService', () => {
  let service: RoomMembersService;
  let grant: jasmine.SpyObj<GrantRoomRoleGql>;
  let dialogService: jasmine.SpyObj<DialogService>;
  let membersByRoomId: jasmine.SpyObj<RoomManagingMembersByRoomIdGql>;

  beforeEach(() => {
    grant = jasmine.createSpyObj('GrantRoomRoleGql', ['mutate']);
    grant.mutate.and.returnValue(of({ data: { grantRoomRole: {} } }) as never);
    dialogService = jasmine.createSpyObj('DialogService', ['openDeleteDialog']);
    dialogService.openDeleteDialog.and.returnValue({
      afterClosed: () => of(true),
    } as never);
    membersByRoomId = jasmine.createSpyObj('RoomManagingMembersByRoomIdGql', [
      'watch',
    ]);
    membersByRoomId.watch.and.returnValue({
      valueChanges: of({
        dataState: 'complete',
        data: {
          roomManagingMembersByRoomId: [
            member('tutor@example.com', RoomRole.Moderator),
            member('owner@example.com', RoomRole.Owner),
          ],
        },
      }),
    } as never);
    configureTestModule(
      [getTranslocoModule()],
      [
        { provide: GrantRoomRoleGql, useValue: grant },
        {
          provide: RevokeRoomRoleGql,
          useValue: jasmine.createSpyObj('RevokeRoomRoleGql', ['mutate']),
        },
        {
          provide: RoomManagingMembersByRoomIdGql,
          useValue: membersByRoomId,
        },
        { provide: DialogService, useValue: dialogService },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', [
            'showAdvanced',
          ]),
        },
      ]
    );
    service = TestBed.inject(RoomMembersService);
  });

  it('lists the owner first', (done) => {
    service.watchMembers('room-1').subscribe((members) => {
      expect(members?.map((m) => m.role)).toEqual([
        RoomRole.Owner,
        RoomRole.Moderator,
      ]);
      done();
    });
  });

  it('changes a role by granting the new one, which replaces the old', () => {
    const tutor = member('tutor@example.com', RoomRole.Moderator);

    service.changeRole('room-1', tutor, RoomRole.Editor);

    expect(grant.mutate).toHaveBeenCalledOnceWith({
      variables: {
        roomId: 'room-1',
        userId: 'id-tutor@example.com',
        role: RoomRole.Editor,
      },
    });
  });

  it('confirms before removing access', () => {
    const tutor = member('tutor@example.com', RoomRole.Moderator);

    service.remove('room-1', tutor).subscribe();

    expect(dialogService.openDeleteDialog).toHaveBeenCalledOnceWith(
      'room-moderator',
      'share.really-delete-user-rights',
      'tutor@example.com',
      'dialog.remove',
      jasmine.any(Function)
    );
  });

  it('reports a removal only once the confirmation has closed after revoking', () => {
    const tutor = member('tutor@example.com', RoomRole.Moderator);
    const revoke = TestBed.inject(RevokeRoomRoleGql) as unknown as {
      mutate: jasmine.Spy;
    };
    revoke.mutate.and.returnValue(of({ data: { revokeRoomRole: {} } }));
    dialogService.openDeleteDialog.and.callFake(
      (_id, _body, _element, _label, confirm) => {
        confirm?.().subscribe();
        return { afterClosed: () => of('dialog.remove') } as never;
      }
    );
    const removed = jasmine.createSpy('removed');

    service.remove('room-1', tutor).subscribe(removed);

    expect(revoke.mutate).toHaveBeenCalledOnceWith({
      variables: { roomId: 'room-1', userId: 'id-tutor@example.com' },
    });
    expect(removed).toHaveBeenCalled();
  });

  it('reports nothing when the confirmation is cancelled', () => {
    const tutor = member('tutor@example.com', RoomRole.Moderator);
    dialogService.openDeleteDialog.and.returnValue({
      afterClosed: () => of(undefined),
    } as never);
    const removed = jasmine.createSpy('removed');

    service.remove('room-1', tutor).subscribe(removed);

    expect(removed).not.toHaveBeenCalled();
  });
});
