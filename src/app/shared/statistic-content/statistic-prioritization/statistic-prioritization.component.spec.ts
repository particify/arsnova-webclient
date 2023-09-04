import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnswerStatistics } from '@app/core/models/answer-statistics';
import { ContentService } from '@app/core/services/http/content.service';
import { EventService } from '@app/core/services/util/event.service';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { ContentPrioritization } from '@app/core/models/content-prioritization';
import { ContentType } from '@app/core/models/content-type.enum';
import {
  JsonTranslationLoader,
  MockEventService,
  MockGlobalStorageService,
  MockThemeService,
} from '@testing/test-helpers';
import { ThemeService } from '@app/core/theme/theme.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { StatisticPrioritizationComponent } from './statistic-prioritization.component';
import { PrioritizationRoundStatistics } from '@app/core/models/round-statistics';
import { ContentPresentationState } from '@app/core/models/events/content-presentation-state';
import { PresentationStepPosition } from '@app/core/models/events/presentation-step-position.enum';
import { Content } from '@app/core/models/content';

describe('StatisticPrioritizationComponent', () => {
  let component: StatisticPrioritizationComponent;
  let fixture: ComponentFixture<StatisticPrioritizationComponent>;

  const mockContentService = jasmine.createSpyObj([
    'getAnswersChangedStream',
    'getAnswer',
    'getAnswersDeleted',
  ]);
  const roundStatistics = new PrioritizationRoundStatistics();
  roundStatistics.abstentionCount = 0;
  roundStatistics.answerCount = 0;
  roundStatistics.assignedPoints = [];
  roundStatistics.round = 1;
  const stats = new AnswerStatistics();
  (stats.contentId = '1234'), (stats.roundStatistics = [roundStatistics]);
  const body = {
    payload: {
      stats: stats,
    },
  };
  const message = {
    body: JSON.stringify(body),
  };
  mockContentService.getAnswer.and.returnValue(of(stats));
  mockContentService.getAnswersChangedStream.and.returnValue(of(message));
  const contentState = new ContentPresentationState(
    PresentationStepPosition.START,
    0,
    new Content()
  );
  mockContentService.getAnswersDeleted.and.returnValue(of(contentState));

  const mockPresentationService = jasmine.createSpyObj('PresentationService', [
    'getScale',
  ]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StatisticPrioritizationComponent],
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
          provide: EventService,
          useClass: MockEventService,
        },
        {
          provide: ContentService,
          useValue: mockContentService,
        },
        {
          provide: ThemeService,
          useClass: MockThemeService,
        },
        {
          provide: PresentationService,
          useValue: mockPresentationService,
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(StatisticPrioritizationComponent);
    component = fixture.componentInstance;
    component.content = new ContentPrioritization(
      'room1234',
      'subject',
      'body',
      [],
      [],
      ContentType.PRIORITIZATION,
      0
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
