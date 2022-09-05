import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { StatisticTextComponent } from './statistic-text.component';
import { EventService } from '@arsnova/app/services/util/event.service';
import { ContentService } from '@arsnova/app/services/http/content.service';
import { ThemeService } from '@arsnova/theme/theme.service';
import { JsonTranslationLoader, MockEventService, MockThemeService } from '@arsnova/testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ContentType } from '@arsnova/app/models/content-type.enum';
import { ContentState } from '@arsnova/app/models/content-state';
import { of } from 'rxjs';
import { RoundStatistics } from '@arsnova/app/models/round-statistics';
import { AnswerStatistics } from '@arsnova/app/models/answer-statistics';
import { ContentAnswerService } from '@arsnova/app/services/http/content-answer.service';
import { ContentText } from '@arsnova/app/models/content-text';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('StatisticTextComponent', () => {
  let component: StatisticTextComponent;
  let fixture: ComponentFixture<StatisticTextComponent>;

  const mockContentService = jasmine.createSpyObj(['getTextAnswerCreatedStream', 'getAnswers']);
  const roundStatistics = new RoundStatistics();
  roundStatistics.abstentionCount = 0;
  roundStatistics.answerCount = 0;
  roundStatistics.combinatedCounts = [];
  roundStatistics.independentCounts = [];
  roundStatistics.round = 1;
  const stats = new AnswerStatistics();
  stats.contentId = '1234',
  stats.roundStatistics = [roundStatistics];
  const body = {
    payload: {
      id: '1234',
      body: 'body'
    }
  }
  const message = {
    body: JSON.stringify(body)
  }
  mockContentService.getAnswers.and.returnValue(of(stats));
  mockContentService.getTextAnswerCreatedStream.and.returnValue(of(message));

  const mockContentAnswerService = jasmine.createSpyObj(['getAnswers']);
  mockContentAnswerService.getAnswers.and.returnValue(of([]));

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StatisticTextComponent ],
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
          provide: EventService,
          useClass: MockEventService
        },
        {
          provide: ContentService,
          useValue: mockContentService
        },
        {
          provide: ThemeService,
          useClass: MockThemeService
        },
        {
          provide: ContentAnswerService,
          useValue: mockContentAnswerService
        }
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatisticTextComponent);
    component = fixture.componentInstance;
    component.content = new ContentText('1234', '0', 'room1234', 'subject', 'body', [], ContentType.TEXT, new ContentState(1, new Date(), false));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
