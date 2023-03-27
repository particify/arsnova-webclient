import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import {
  JsonTranslationLoader,
  MockNotificationService,
} from '@arsnova/testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { CopyRoomUrlComponent } from './copy-room-url.component';

describe('CopyRoomUrlComponent', () => {
  let component: CopyRoomUrlComponent;
  let fixture: ComponentFixture<CopyRoomUrlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CopyRoomUrlComponent],
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

    fixture = TestBed.createComponent(CopyRoomUrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
