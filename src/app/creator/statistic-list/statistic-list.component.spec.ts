import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { StatisticListComponent } from './statistic-list.component';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
} from '@angular/router';
import {
  MockGlobalStorageService,
  ActivatedRouteStub,
  JsonTranslationLoader,
  MockLangService,
  MockRouter,
  MockNotificationService,
} from '@testing/test-helpers';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { LanguageService } from '@app/core/services/util/language.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { of } from 'rxjs';
import { ContentGroup } from '@app/core/models/content-group';
import { A11yRenderedBodyPipe } from '@app/core/pipes/a11y-rendered-body.pipe';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('StatisticListComponent', () => {
  let component: StatisticListComponent;
  let fixture: ComponentFixture<StatisticListComponent>;

  const mockContentService = jasmine.createSpyObj([
    'getContentsByIds',
    'getSupportedContents',
    'getAnswer',
    'showDeleteAllAnswersDialog',
  ]);
  mockContentService.getContentsByIds.and.returnValue(of({}));
  mockContentService.getSupportedContents.and.returnValue([]);

  const mockContentAnswerService = jasmine.createSpyObj(['getAnswers']);
  mockContentAnswerService.getAnswers.and.returnValue(of([]));

  const snapshot = new ActivatedRouteSnapshot();
  snapshot.params = {
    shortId: '12345678',
  };
  const activatedRouteStub = new ActivatedRouteStub(null, null, snapshot);

  const a11yRenderedBodyPipe = new A11yRenderedBodyPipe();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [StatisticListComponent, A11yRenderedBodyPipe],
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
          provide: ContentService,
          useValue: mockContentService,
        },
        {
          provide: ContentAnswerService,
          useValue: mockContentAnswerService,
        },
        {
          provide: Router,
          useClass: MockRouter,
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
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: A11yRenderedBodyPipe,
          useValue: a11yRenderedBodyPipe,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatisticListComponent);
    component = fixture.componentInstance;
    component.contentGroup = new ContentGroup();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
