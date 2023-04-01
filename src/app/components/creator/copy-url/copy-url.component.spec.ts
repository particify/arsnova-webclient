import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import {
  JsonTranslationLoader,
  MockNotificationService,
} from '@arsnova/testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { CopyUrlComponent } from './copy-url.component';

describe('CopyRoomUrlComponent', () => {
  let component: CopyUrlComponent;
  let fixture: ComponentFixture<CopyUrlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CopyUrlComponent],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader,
          },
          isolate: true,
        }),
      ],
      providers: [
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CopyUrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
