import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import { RoomComponent } from '@app/creator/settings/room/room.component';
import { DialogService } from '@app/core/services/util/dialog.service';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import {
  DeleteRoomGql,
  RoomByShortIdDocument,
  RoomByShortIdGql,
  RoomByShortIdQuery,
  UpdateRoomDetailsGql,
  UpdateRoomFocusModeGql,
} from '@gql/generated/graphql';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { MockRouter } from '@testing/test-helpers';
import { configureTestModule } from '@testing/test.setup';
import { Apollo } from 'apollo-angular';
import { of } from 'rxjs';

const ROOM_ID = '11111111-2222-3333-4444-555555555555';
const SHORT_ID = '12345678';

const room = (focusModeEnabled: boolean) => ({
  __typename: 'Room' as const,
  id: ROOM_ID,
  shortId: SHORT_ID,
  name: 'Test room',
  description: 'A description',
  descriptionRendered: '<p>A description</p>',
  language: 'en',
  focusModeEnabled: focusModeEnabled,
});

describe('RoomComponent', () => {
  let fixture: ComponentFixture<RoomComponent>;
  let component: RoomComponent;
  let cache: Apollo['client']['cache'];

  beforeEach(async () => {
    const notificationService = jasmine.createSpyObj('NotificationService', [
      'showAdvanced',
    ]);
    const dialogService = jasmine.createSpyObj('DialogService', [
      'openDeleteDialog',
    ]);
    const formattingService = jasmine.createSpyObj('FormattingService', [
      'containsTextAnImage',
    ]);
    const focusModeService = jasmine.createSpyObj('FocusModeService', [
      'updateOverviewState',
    ]);

    configureTestModule(
      [getTranslocoModule()],
      [
        { provide: FocusModeService, useValue: focusModeService },
        { provide: NotificationService, useValue: notificationService },
        { provide: DialogService, useValue: dialogService },
        { provide: FormattingService, useValue: formattingService },
        { provide: Router, useClass: MockRouter },
        { provide: DeleteRoomGql, useValue: { mutate: () => of({}) } },
        { provide: UpdateRoomFocusModeGql, useValue: { mutate: () => of({}) } },
        {
          provide: RoomByShortIdGql,
          useValue: {
            fetch: () => of({ data: { roomByShortId: room(false) } }),
          },
        },
        {
          provide: UpdateRoomDetailsGql,
          useFactory: (apollo: Apollo) => ({
            mutate: (options: {
              update?: (cache: Apollo['client']['cache']) => void;
            }) => {
              options.update?.(apollo.client.cache);
              return of({ data: {} });
            },
          }),
          deps: [Apollo],
        },
      ]
    );
    TestBed.overrideComponent(RoomComponent, { set: { template: '' } });
    await TestBed.compileComponents();

    cache = TestBed.inject(Apollo).client.cache;
    fixture = TestBed.createComponent(RoomComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('roomId', ROOM_ID);
    fixture.componentRef.setInput('shortId', SHORT_ID);
    fixture.detectChanges();
  });

  const readCachedRoom = () =>
    (
      cache.readQuery({
        query: RoomByShortIdDocument,
        variables: { shortId: SHORT_ID },
      }) as RoomByShortIdQuery | null
    )?.roomByShortId;

  describe('saveChanges', () => {
    beforeEach(() => {
      cache.writeQuery({
        query: RoomByShortIdDocument,
        variables: { shortId: SHORT_ID },
        data: { roomByShortId: room(true) },
      });
    });

    it('should not revert the focus mode state', () => {
      component.saveChanges();
      expect(readCachedRoom()?.focusModeEnabled).toBeTrue();
    });

    it('should still write the edited fields', () => {
      component.name.set('A new name');
      component.saveChanges();
      expect(readCachedRoom()?.name).toBe('A new name');
    });
  });
});
