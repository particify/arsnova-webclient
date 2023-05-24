import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ContentSortParticipantComponent } from './content-sort-participant.component';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
} from '@angular/router';
import { NotificationService } from '@app/core/services/util/notification.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {
  JsonTranslationLoader,
  MockNotificationService,
  ActivatedRouteStub,
  MockGlobalStorageService,
  MockRouter,
} from '@testing/test-helpers';
import { of } from 'rxjs';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { ContentService } from '@app/core/services/http/content.service';
import { NO_ERRORS_SCHEMA, EventEmitter } from '@angular/core';
import { ContentChoice } from '@app/core/models/content-choice';
import { ContentType } from '@app/core/models/content-type.enum';
import { ContentState } from '@app/core/models/content-state';

describe('ContentSortParticipantComponent', () => {
  let component: ContentSortParticipantComponent;
  let fixture: ComponentFixture<ContentSortParticipantComponent>;

  const mockContentAnswerService = jasmine.createSpyObj([
    'addAnswerChoice',
    'shuffleAnswerOptions',
  ]);

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
      declarations: [ContentSortParticipantComponent],
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
    fixture = TestBed.createComponent(ContentSortParticipantComponent);
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
      ContentType.SORT,
      new ContentState(1, new Date(), false)
    );
    component.sendEvent = new EventEmitter<string>();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
