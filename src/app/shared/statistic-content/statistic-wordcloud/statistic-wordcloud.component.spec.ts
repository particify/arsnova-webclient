import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { StatisticWordcloudComponent } from './statistic-wordcloud.component';
import { EventService } from '@core/services/util/event.service';
import { ContentService } from '@core/services/http/content.service';
import { ThemeService } from '@core/theme/theme.service';
import {
  JsonTranslationLoader,
  MockEventService,
  MockThemeService,
} from '@testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ContentChoice } from '@core/models/content-choice';
import { ContentType } from '@core/models/content-type.enum';
import { ContentState } from '@core/models/content-state';
import { of } from 'rxjs';
import { RoundStatistics } from '@core/models/round-statistics';
import { AnswerStatistics } from '@core/models/answer-statistics';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('StatisticWordcloudComponent', () => {
  let component: StatisticWordcloudComponent;
  let fixture: ComponentFixture<StatisticWordcloudComponent>;

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

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [StatisticWordcloudComponent],
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
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatisticWordcloudComponent);
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
      ContentType.WORDCLOUD,
      new ContentState(1, new Date(), false)
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
