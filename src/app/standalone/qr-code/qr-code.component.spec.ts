import { ComponentFixture, waitForAsync } from '@angular/core/testing';

import { QrCodeComponent } from './qr-code.component';
import { ThemeService } from '@app/core/theme/theme.service';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { of } from 'rxjs';
import { RoutingService } from '@app/core/services/util/routing.service';
import {
  MockFeatureFlagService,
  MockThemeService,
} from '@testing/test-helpers';
import { RoomService } from '@app/core/services/http/room.service';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import { RoomSummary, RoomSummaryStats } from '@app/core/models/room-summary';
import { ExtensionPointModule } from '@projects/extension-point/src/public-api';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';
import { Room } from '@app/core/models/room';
import { configureTestModule } from '@testing/test.setup';
import { ActivatedRouteSnapshot } from '@angular/router';

describe('QrCodeComponent', () => {
  let component: QrCodeComponent;
  let fixture: ComponentFixture<QrCodeComponent>;

  const mockApiConfigService = jasmine.createSpyObj(ApiConfigService, [
    'getApiConfig$',
  ]);

  const configWithJoinLink = {
    ui: {
      links: {
        join: {
          url: 'https://partici.fi/',
        },
      },
    },
  };

  const configWithoutJoinLink = {
    ui: {
      links: {},
    },
  };

  const roomSummary = new RoomSummary();
  roomSummary.stats = new RoomSummaryStats();
  roomSummary.stats.roomUserCount = 0;

  const currentRoomMessage = {
    body: '{ "UserCountChanged": { "userCount": 42 } }',
  };

  const mockRoomService = jasmine.createSpyObj(RoomService, [
    'getRoomSummaries',
    'getCurrentRoomsMessageStream',
  ]);
  mockRoomService.getRoomSummaries.and.returnValue(of(roomSummary));
  mockRoomService.getCurrentRoomsMessageStream.and.returnValue(
    of(currentRoomMessage)
  );
  const mockFocusModeService = jasmine.createSpyObj('FocusModeSercice', [
    'updateOverviewState',
  ]);

  const snapshot = new ActivatedRouteSnapshot();
  snapshot.params = { ['shortId']: '12345678' };
  snapshot.data = {};

  let routingService: RoutingService;

  beforeEach(waitForAsync(() => {
    const testBed = configureTestModule(
      [QrCodeComponent, ExtensionPointModule],
      [
        {
          provide: ApiConfigService,
          useValue: mockApiConfigService,
        },
        {
          provide: ThemeService,
          useClass: MockThemeService,
        },
        RoutingService,
        {
          provide: RoomService,
          useValue: mockRoomService,
        },
        {
          provide: FocusModeService,
          useValue: mockFocusModeService,
        },
        {
          provide: FeatureFlagService,
          useClass: MockFeatureFlagService,
        },
      ]
    );
    testBed.compileComponents();
    mockApiConfigService.getApiConfig$.and.returnValue(of(configWithJoinLink));
    fixture = testBed.createComponent(QrCodeComponent);
    component = fixture.componentInstance;
    routingService = testBed.inject(RoutingService);
    routingService.getRoomUrlData(snapshot);
    component.room = new Room();
  }));

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should use correct url if config for join link is set', () => {
    mockApiConfigService.getApiConfig$.and.returnValue(of(configWithJoinLink));
    fixture.detectChanges();
    expect(component.url).toBe('https://partici.fi/12345678');
  });

  it('should use correct display url if config for join link is set', () => {
    mockApiConfigService.getApiConfig$.and.returnValue(of(configWithJoinLink));
    fixture.detectChanges();
    expect(component.displayUrl).toBe('partici.fi/12345678');
  });

  it('should use correct qr url if config for join link is set', () => {
    mockApiConfigService.getApiConfig$.and.returnValue(of(configWithJoinLink));
    fixture.detectChanges();
    expect(component.qrUrl).toBe('https://partici.fi/12345678?entry=qr');
  });

  it('should use correct url if config for join link is NOT set', () => {
    mockApiConfigService.getApiConfig$.and.returnValue(
      of(configWithoutJoinLink)
    );
    fixture.detectChanges();
    expect(component.url).toBe(`${window.location.href}p/12345678`);
  });

  it('should use correct qr url if config for join link is NOT set', () => {
    mockApiConfigService.getApiConfig$.and.returnValue(
      of(configWithoutJoinLink)
    );
    fixture.detectChanges();
    expect(component.qrUrl).toBe(`${window.location.href}p/12345678?entry=qr`);
  });

  it('should use correct display url if config for join link is NOT set', () => {
    mockApiConfigService.getApiConfig$.and.returnValue(
      of(configWithoutJoinLink)
    );
    fixture.detectChanges();
    expect(component.displayUrl).toBe(
      routingService.removeProtocolFromUrl(window.location.href)
    );
  });
});
