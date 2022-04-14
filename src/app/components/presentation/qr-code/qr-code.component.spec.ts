import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QrCodeComponent } from './qr-code.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {
  JsonTranslationLoader,
  MockEventService,
  MockMatDialog, MockMatDialogData, MockMatDialogRef,
  MockNotificationService, MockThemeService
} from '@arsnova/testing/test-helpers';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EventService } from '@arsnova/app/services/util/event.service';
import { ThemeService } from '@arsnova/theme/theme.service';
import { ApiConfigService } from '@arsnova/app/services/http/api-config.service';
import { SplitShortIdPipe } from '@arsnova/app/pipes/split-short-id.pipe';
import { of } from 'rxjs';

class MockApiConfigService {
  getApiConfig$() {
    return of({ui: {}});
  }
}

describe('QrCodeComponent', () => {
  let component: QrCodeComponent;
  let fixture: ComponentFixture<QrCodeComponent>;

  const splitShortIdPipe = new SplitShortIdPipe();

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
        }
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
