import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { StatisticSortComponent } from './statistic-sort.component';
import { EventService } from '@app/core/services/util/event.service';
import { ContentService } from '@app/core/services/http/content.service';
import { ThemeService } from '@app/core/theme/theme.service';
import {
  JsonTranslationLoader,
  MockEventService,
  MockThemeService,
} from '@testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ContentChoice } from '@app/core/models/content-choice';
import { ContentType } from '@app/core/models/content-type.enum';
import { ContentState } from '@app/core/models/content-state';
import { of } from 'rxjs';
import { RoundStatistics } from '@app/core/models/round-statistics';
import { AnswerStatistics } from '@app/core/models/answer-statistics';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';

describe('StatisticSortComponent', () => {
  let component: StatisticSortComponent;
  let fixture: ComponentFixture<StatisticSortComponent>;

  const mockContentService = jasmine.createSpyObj([
    'getAnswersChangedStream',
    'getAnswer',
  ]);
  const roundStatistics = new RoundStatistics();
  roundStatistics.abstentionCount = 0;
  roundStatistics.answerCount = 0;
  roundStatistics.combinatedCounts = [];
  roundStatistics.independentCounts = [];
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

  const mockPresentationService = jasmine.createSpyObj(['getScale']);

  const mockContentAnswerService = jasmine.createSpyObj([
    'shuffleAnswerOptions',
  ]);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [StatisticSortComponent],
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
          provide: ContentAnswerService,
          useValue: mockContentAnswerService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatisticSortComponent);
    component = fixture.componentInstance;
    component.content = new ContentChoice(
      '1234',
      '0',
      'room1234',
      'subject',
      'body',
      [],
      [],
      [],
      false,
      ContentType.SORT,
      new ContentState(1, new Date(), false)
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
