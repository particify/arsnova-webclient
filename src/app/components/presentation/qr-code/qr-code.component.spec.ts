import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QrCodeComponent } from './qr-code.component';
import {
  MockThemeService,
  ActivatedRouteStub,
} from '@arsnova/testing/test-helpers';
import { ThemeService } from '@arsnova/theme/theme.service';
import { ApiConfigService } from '@arsnova/app/services/http/api-config.service';
import { SplitShortIdPipe } from '@arsnova/app/pipes/split-short-id.pipe';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { RoutingService } from '@arsnova/app/services/util/routing.service';

class MockApiConfigService {
  getApiConfig$() {
    return of({ ui: {} });
  }
}

class MockRoutingService {}

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
          useClass: MockApiConfigService,
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
          useClass: MockRoutingService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QrCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
