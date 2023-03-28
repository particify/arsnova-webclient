import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ContentChoiceParticipantComponent } from './content-choice-participant.component';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
} from '@angular/router';
import { NotificationService } from '@core/services/util/notification.service';
import { LanguageService } from '@core/services/util/language.service';
import { JsonTranslationLoader, MockLangService } from '@testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {
  ActivatedRouteStub,
  MockGlobalStorageService,
  MockRouter,
} from '@testing/test-helpers';
import { of } from 'rxjs';
import { GlobalStorageService } from '@core/services/util/global-storage.service';
import { ContentAnswerService } from '@core/services/http/content-answer.service';
import { MockNotificationService } from '@testing/test-helpers';
import { ContentService } from '@core/services/http/content.service';
import { ContentChoice } from '@core/models/content-choice';
import { ContentType } from '@core/models/content-type.enum';
import { ContentState } from '@core/models/content-state';
import { NO_ERRORS_SCHEMA, EventEmitter } from '@angular/core';

describe('ContentChoiceParticipantComponent', () => {
  let component: ContentChoiceParticipantComponent;
  let fixture: ComponentFixture<ContentChoiceParticipantComponent>;

  const mockContentAnswerService = jasmine.createSpyObj(['addAnswerChoice']);

  const mockContentService = jasmine.createSpyObj(['getCorrectChoiceIndexes']);

  const snapshot = new ActivatedRouteSnapshot();

  const params = {
    shortId: '12345678',
    seriesName: 'Quiz',
  };

  snapshot.params = of([params]);

  const activatedRouteStub = new ActivatedRouteStub(null, null, snapshot);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentChoiceParticipantComponent],
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
          provide: ContentService,
          useValue: mockContentService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentChoiceParticipantComponent);
    component = fixture.componentInstance;
    component.content = new ContentChoice(
      '1234',
      '1',
      '1234',
      'subject',
      'body',
      [],
      [],
      [],
      false,
      ContentType.CHOICE,
      new ContentState(1, new Date(), false)
    );
    component.sendEvent = new EventEmitter<string>();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
