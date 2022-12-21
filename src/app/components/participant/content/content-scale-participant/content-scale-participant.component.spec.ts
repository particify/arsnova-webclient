import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ContentScaleParticipantComponent } from './content-scale-participant.component';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
} from '@angular/router';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import { LanguageService } from '@arsnova/app/services/util/language.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {
  JsonTranslationLoader,
  MockLangService,
  MockNotificationService,
  ActivatedRouteStub,
  MockGlobalStorageService,
  MockRouter,
} from '@arsnova/testing/test-helpers';
import { of } from 'rxjs';
import { GlobalStorageService } from '@arsnova/app/services/util/global-storage.service';
import { ContentAnswerService } from '@arsnova/app/services/http/content-answer.service';
import { ContentService } from '@arsnova/app/services/http/content.service';
import { NO_ERRORS_SCHEMA, EventEmitter } from '@angular/core';
import { LikertScaleService } from '@arsnova/app/services/util/likert-scale.service';
import { ContentScale } from '@arsnova/app/models/content-scale';
import { LikertScaleTemplate } from '@arsnova/app/models/likert-scale-template.enum';

describe('ContentScaleParticipantComponent', () => {
  let component: ContentScaleParticipantComponent;
  let fixture: ComponentFixture<ContentScaleParticipantComponent>;

  const mockContentAnswerService = jasmine.createSpyObj(['addAnswerChoice']);

  const mockContentService = jasmine.createSpyObj(['getCorrectChoiceIndexes']);

  const mockLikertScaleService = jasmine.createSpyObj(['getOptionLabels']);
  mockLikertScaleService.getOptionLabels.and.returnValue([]);

  const snapshot = new ActivatedRouteSnapshot();

  const params = {
    shortId: '12345678',
    seriesName: 'Quiz',
  };

  snapshot.params = of([params]);

  const activatedRouteStub = new ActivatedRouteStub(null, null, snapshot);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentScaleParticipantComponent],
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
        {
          provide: LikertScaleService,
          useValue: mockLikertScaleService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentScaleParticipantComponent);
    component = fixture.componentInstance;
    component.content = new ContentScale(LikertScaleTemplate.AGREEMENT, 5);
    component.sendEvent = new EventEmitter<string>();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
