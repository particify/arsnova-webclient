import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QrCodeComponent } from './qr-code.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {
  JsonTranslationLoader,
  MockEventService,
  MockMatDialog,
  MockMatDialogData,
  MockMatDialogRef,
  MockNotificationService,
  MockThemeService,
  ActivatedRouteStub
} from '@arsnova/testing/test-helpers';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { EventService } from '@arsnova/app/services/util/event.service';
import { ThemeService } from '@arsnova/theme/theme.service';
import { ApiConfigService } from '@arsnova/app/services/http/api-config.service';
import { SplitShortIdPipe } from '@arsnova/app/pipes/split-short-id.pipe';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';

class MockApiConfigService {
  getApiConfig$() {
    return of({ui: {}});
  }
}

describe('QrCodeComponent', () => {
  let component: QrCodeComponent;
  let fixture: ComponentFixture<QrCodeComponent>;

  const splitShortIdPipe = new SplitShortIdPipe();

  const snapshot = new ActivatedRouteSnapshot();

  snapshot.data = {
    room: {
      id: '1234',
      shortId: '12345678',
      passwordProtected: true
    }
  }

  const activatedRouteStub = new ActivatedRouteStub(null, null, snapshot);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        QrCodeComponent,
        SplitShortIdPipe
      ],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader
          },
          isolate: true
        })
      ],
      providers: [
        {
          provide: SplitShortIdPipe,
          useValue: splitShortIdPipe
        },
        {
          provide: ApiConfigService,
          useClass: MockApiConfigService
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService
        },
        {
          provide: MatDialog,
          useClass: MockMatDialog
        },
        {
          provide: EventService,
          useClass: MockEventService
        },
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef
        },
        {
          provide: ThemeService,
          useClass: MockThemeService
        },
        {
          provide: MAT_DIALOG_DATA,
          useClass: MockMatDialogData
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub
        }
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    })
    .compileComponents();
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
