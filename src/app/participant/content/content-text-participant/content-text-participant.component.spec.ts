import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ContentTextParticipantComponent } from './content-text-participant.component';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
} from '@angular/router';
import { NotificationService } from '@core/services/util/notification.service';
import { LanguageService } from '@core/services/util/language.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {
  JsonTranslationLoader,
  MockLangService,
  MockNotificationService,
  ActivatedRouteStub,
  MockGlobalStorageService,
  MockRouter,
  MockEventService,
} from '@testing/test-helpers';
import { of } from 'rxjs';
import { GlobalStorageService } from '@core/services/util/global-storage.service';
import { ContentAnswerService } from '@core/services/http/content-answer.service';
import { NO_ERRORS_SCHEMA, EventEmitter } from '@angular/core';
import { ContentText } from '@core/models/content-text';
import { ContentType } from '@core/models/content-type.enum';
import { ContentState } from '@core/models/content-state';
import { EventService } from '@core/services/util/event.service';

describe('ContentTextParticipantComponent', () => {
  let component: ContentTextParticipantComponent;
  let fixture: ComponentFixture<ContentTextParticipantComponent>;

  const mockContentAnswerService = jasmine.createSpyObj(['addAnswerText']);

  const snapshot = new ActivatedRouteSnapshot();

  const params = {
    shortId: '12345678',
    seriesName: 'Quiz',
  };

  snapshot.params = of([params]);

  const activatedRouteStub = new ActivatedRouteStub(null, null, snapshot);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentTextParticipantComponent],
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
          provide: ContentAnswerService,
          useValue: mockContentAnswerService,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: LanguageService,
          useClass: MockLangService,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: EventService,
          useClass: MockEventService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentTextParticipantComponent);
    component = fixture.componentInstance;
    component.content = new ContentText(
      '1234',
      '1',
      '1234',
      'subject',
      'body',
      [],
      ContentType.TEXT,
      new ContentState(1, new Date(), false)
    );
    component.sendEvent = new EventEmitter<string>();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
