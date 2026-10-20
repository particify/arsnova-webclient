import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ContentFocusState } from '@app/core/models/events/remote/content-focus-state';
import { FocusEvent } from '@app/core/models/events/remote/focus-event';
import { UserRole } from '@app/core/models/user-roles.enum';
import { RoomSettingsService } from '@app/core/services/http/room-settings.service';
import { RoomService } from '@app/core/services/http/room.service';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { WsConnectorService } from '@app/core/services/websockets/ws-connector.service';
import { RoomFocusModeEnabledByIdGql } from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { NEVER, Subject, throwError } from 'rxjs';
import { FocusModeService } from './focus-mode.service';

describe('FocusModeService', () => {
  let service: FocusModeService;
  let router: jasmine.SpyObj<Router>;
  let roomId$: Subject<string>;
  let roomFocusModeEnabledById: jasmine.SpyObj<RoomFocusModeEnabledByIdGql>;

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    const routingService = jasmine.createSpyObj('RoutingService', [
      'getViewRole',
      'getRoleRoute',
      'getShortId',
    ]);
    routingService.getViewRole.and.returnValue(UserRole.PARTICIPANT);
    routingService.getRoleRoute.and.returnValue('p');
    routingService.getShortId.and.returnValue('12345678');
    const wsConnector = jasmine.createSpyObj('WsConnectorService', [
      'getConnectionState',
    ]);
    wsConnector.getConnectionState.and.returnValue(NEVER);
    const roomService = jasmine.createSpyObj('RoomService', [
      'getCurrentRoomIdStream',
    ]);
    roomId$ = new Subject<string>();
    roomService.getCurrentRoomIdStream.and.returnValue(roomId$);
    roomFocusModeEnabledById = jasmine.createSpyObj(
      'RoomFocusModeEnabledByIdGql',
      ['watch']
    );

    configureTestModule(
      [getTranslocoModule()],
      [
        FocusModeService,
        { provide: Router, useValue: router },
        { provide: RoutingService, useValue: routingService },
        { provide: WsConnectorService, useValue: wsConnector },
        { provide: RoomService, useValue: roomService },
        {
          provide: RoomSettingsService,
          useValue: jasmine.createSpyObj('RoomSettingsService', [
            'getByRoomId',
          ]),
        },
        {
          provide: FeatureFlagService,
          useValue: jasmine.createSpyObj('FeatureFlagService', ['isEnabled']),
        },
        {
          provide: RoomFocusModeEnabledByIdGql,
          useValue: roomFocusModeEnabledById,
        },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', [
            'showAdvanced',
          ]),
        },
      ]
    );
    service = TestBed.inject(FocusModeService);
  });

  it('navigates to the focused content by questionnaire and content id', () => {
    const state = new ContentFocusState('content-1', 4, 'q-1', 'Quiz');

    service['handleStateTransition']([
      undefined,
      new FocusEvent('CONTENTS', state),
    ]);

    expect(router.navigate).toHaveBeenCalledWith([
      'p',
      '12345678',
      'questionnaire',
      'q-1',
      'content-1',
    ]);
  });

  it('keeps the focus mode state readable after its query fails', () => {
    spyOn(console, 'error');
    roomFocusModeEnabledById.watch.and.returnValue({
      valueChanges: throwError(() => new Error('Query failed')),
    } as unknown as ReturnType<RoomFocusModeEnabledByIdGql['watch']>);
    const errorHandler = jasmine.createSpy('error');
    service.getFocusModeEnabled().subscribe({ error: errorHandler });

    roomId$.next('room-1');

    expect(errorHandler).not.toHaveBeenCalled();
    expect(() => service['focusModeEnabled']()).not.toThrow();
    expect(console.error).toHaveBeenCalled();
  });
});
