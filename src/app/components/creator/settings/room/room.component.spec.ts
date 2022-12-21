import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RoomComponent } from './room.component';
import {
  JsonTranslationLoader,
  MockEventService,
  MockGlobalStorageService,
  MockLangService,
  MockNotificationService,
  MockRouter,
} from '@arsnova/testing/test-helpers';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { RoomService } from '@arsnova/app/services/http/room.service';
import { NO_ERRORS_SCHEMA, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService } from '@arsnova/app/services/util/dialog.service';
import { GlobalStorageService } from '@arsnova/app/services/util/global-storage.service';
import { EventService } from '@arsnova/app/services/util/event.service';
import { LanguageService } from '@arsnova/app/services/util/language.service';
import { FormattingService } from '@arsnova/app/services/http/formatting.service';

@Injectable()
class MockRoomService {}

@Injectable()
class MockDialogService {}

@Injectable()
class MockFormattingService {}

describe('RoomComponent', () => {
  let component: RoomComponent;
  let fixture: ComponentFixture<RoomComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [RoomComponent],
      providers: [
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: RoomService,
          useClass: MockRoomService,
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: DialogService,
          useClass: MockDialogService,
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
        {
          provide: EventService,
          useClass: MockEventService,
        },
        {
          provide: FormattingService,
          useClass: MockFormattingService,
        },
        {
          provide: LanguageService,
          useClass: MockLangService,
        },
      ],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader,
          },
          isolate: true,
        }),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
