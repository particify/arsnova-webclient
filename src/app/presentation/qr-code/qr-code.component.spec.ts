import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QrCodeComponent } from './qr-code.component';
import { ThemeService } from '@app/core/theme/theme.service';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { SplitShortIdPipe } from '@app/core/pipes/split-short-id.pipe';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { RoutingService } from '@app/core/services/util/routing.service';
import { ActivatedRouteStub, MockThemeService } from '@testing/test-helpers';

describe('QrCodeComponent', () => {
  let component: QrCodeComponent;
  let fixture: ComponentFixture<QrCodeComponent>;

  const splitShortIdPipe = new SplitShortIdPipe();

  const snapshot = new ActivatedRouteSnapshot();

  snapshot.data = {
    room: {
      id: '1234',
      shortId: '12345678',
      passwordProtected: true,
    },
  };

  const activatedRouteStub = new ActivatedRouteStub(null, null, snapshot);

  const mockApiConfigService = jasmine.createSpyObj(ApiConfigService, [
    'getApiConfig$',
  ]);

  const configWithJoinLink = {
    ui: {
      links: {
        join: 'https://partici.fi/',
      },
    },
  };

  const configWithoutJoinLink = {
    ui: {},
  };

  const mockRoutingService = jasmine.createSpyObj(RoutingService, [
    'getRoomJoinUrl',
    'removeProtocolFromUrl',
  ]);
  mockRoutingService.getRoomJoinUrl
    .withArgs('https://partici.fi/')
    .and.returnValue(
      ('https://partici.fi/' || document.baseURI + 'p/') + '12345678'
    );
  mockRoutingService.getRoomJoinUrl
    .withArgs(undefined)
    .and.returnValue((undefined || document.baseURI + 'p/') + '12345678');
  mockRoutingService.removeProtocolFromUrl
    .withArgs('http://localhost:9876/')
    .and.returnValue('localhost:9876/');
  mockRoutingService.removeProtocolFromUrl
    .withArgs('http://localhost:9876')
    .and.returnValue('localhost:9876');
  mockRoutingService.removeProtocolFromUrl
    .withArgs('https://partici.fi/12345678')
    .and.returnValue('partici.fi/12345678');

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [QrCodeComponent, SplitShortIdPipe],
      providers: [
        {
          provide: SplitShortIdPipe,
          useValue: splitShortIdPipe,
        },
        {
          provide: ApiConfigService,
          useValue: mockApiConfigService,
        },
        {
          provide: ThemeService,
          useClass: MockThemeService,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
        },
        {
          provide: RoutingService,
          useValue: mockRoutingService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    mockApiConfigService.getApiConfig$.and.returnValue(of(configWithJoinLink));
    fixture = TestBed.createComponent(QrCodeComponent);
    component = fixture.componentInstance;
  });

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
    expect(component.url).toBe('http://localhost:9876/p/12345678');
  });

  it('should use correct qr url if config for join link is NOT set', () => {
    mockApiConfigService.getApiConfig$.and.returnValue(
      of(configWithoutJoinLink)
    );
    fixture.detectChanges();
    expect(component.qrUrl).toBe('http://localhost:9876/p/12345678?entry=qr');
  });

  it('should use correct display url if config for join link is NOT set', () => {
    mockApiConfigService.getApiConfig$.and.returnValue(
      of(configWithoutJoinLink)
    );
    fixture.detectChanges();
    expect(component.displayUrl).toBe('localhost:9876');
  });
});
