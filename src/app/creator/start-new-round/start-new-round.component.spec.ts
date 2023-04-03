import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Content } from '@app/core/models/content';
import { ContentState } from '@app/core/models/content-state';
import { ContentType } from '@app/core/models/content-type.enum';
import { ContentService } from '@app/core/services/http/content.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import {
  JsonTranslationLoader,
  MockMatDialog,
  MockNotificationService,
} from '@testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { StartNewRoundComponent } from './start-new-round.component';

describe('StartNewRoundComponent', () => {
  let component: StartNewRoundComponent;
  let fixture: ComponentFixture<StartNewRoundComponent>;

  const contentService = jasmine.createSpyObj('ContentService', [
    'patchContent',
  ]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StartNewRoundComponent],
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
      providers: [
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: ContentService,
          useValue: contentService,
        },
        {
          provide: MatDialog,
          useClass: MockMatDialog,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StartNewRoundComponent);
    component = fixture.componentInstance;
    component.content = new Content(
      'id',
      'rev',
      'roomId',
      'subject',
      'body',
      [],
      ContentType.BINARY,
      {},
      new ContentState(1, new Date(), false)
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
