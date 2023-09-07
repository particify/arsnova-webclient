import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { StatisticTextComponent } from './statistic-text.component';
import { EventService } from '@app/core/services/util/event.service';
import { ContentService } from '@app/core/services/http/content.service';
import { ThemeService } from '@app/core/theme/theme.service';
import { MockEventService, MockThemeService } from '@testing/test-helpers';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { ContentType } from '@app/core/models/content-type.enum';
import { ContentState } from '@app/core/models/content-state';
import { of } from 'rxjs';
import { RoundStatistics } from '@app/core/models/round-statistics';
import { AnswerStatistics } from '@app/core/models/answer-statistics';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Content } from '@app/core/models/content';

describe('StatisticTextComponent', () => {
  let component: StatisticTextComponent;
  let fixture: ComponentFixture<StatisticTextComponent>;

  const mockContentService = jasmine.createSpyObj([
    'getTextAnswerCreatedStream',
    'getAnswers',
    'getAnswersDeleted',
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
      id: '1234',
      body: 'body',
    },
  };
  const message = {
    body: JSON.stringify(body),
  };
  mockContentService.getAnswers.and.returnValue(of(stats));
  mockContentService.getTextAnswerCreatedStream.and.returnValue(of(message));
  mockContentService.getAnswersDeleted.and.returnValue(of({}));

  const mockContentAnswerService = jasmine.createSpyObj(['getAnswers']);
  mockContentAnswerService.getAnswers.and.returnValue(of([]));

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [StatisticTextComponent],
      imports: [getTranslocoModule()],
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
          provide: ContentAnswerService,
          useValue: mockContentAnswerService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatisticTextComponent);
    component = fixture.componentInstance;
    component.content = new Content(
      'room1234',
      'subject',
      'body',
      [],
      ContentType.TEXT,
      {}
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
