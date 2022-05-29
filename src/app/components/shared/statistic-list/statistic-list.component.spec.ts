import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { StatisticListComponent } from './statistic-list.component';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import {
  MockGlobalStorageService,
  ActivatedRouteStub,
  JsonTranslationLoader,
  MockLangService,
  MockRouter,
  MockNotificationService
} from '@arsnova/testing/test-helpers';
import { GlobalStorageService } from '@arsnova/app/services/util/global-storage.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ContentService } from '@arsnova/app/services/http/content.service';
import { ContentAnswerService } from '@arsnova/app/services/http/content-answer.service';
import { LanguageService } from '@arsnova/app/services/util/language.service';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import { of } from 'rxjs';
import { ContentGroup } from '@arsnova/app/models/content-group';

describe('StatisticListComponent', () => {
  let component: StatisticListComponent;
  let fixture: ComponentFixture<StatisticListComponent>;

  const mockContentService = jasmine.createSpyObj(['getContentsByIds', 'getSupportedContents', 'getAnswer', 'showDeleteAllAnswersDialog']);
  mockContentService.getContentsByIds.and.returnValue(of({}));
  mockContentService.getSupportedContents.and.returnValue([]);

  const mockContentAnswerService = jasmine.createSpyObj(['getAnswers']);
  mockContentAnswerService.getAnswers.and.returnValue(of([]));

  const snapshot = new ActivatedRouteSnapshot();
  snapshot.params = {
    shortId: '12345678'
  }
  const activatedRouteStub = new ActivatedRouteStub(null, null, snapshot);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StatisticListComponent ],
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
          provide: ContentService,
          useValue: mockContentService
        },
        {
          provide: ContentAnswerService,
          useValue: mockContentAnswerService
        },
        {
          provide: Router,
          useClass: MockRouter
        },
        {
          provide: LanguageService,
          useClass: MockLangService
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService
        }
      ]
    })
    .compileComponents();
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
