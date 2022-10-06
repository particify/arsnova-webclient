import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnswerStatistics } from '@arsnova/app/models/answer-statistics';
import { ContentService } from '@arsnova/app/services/http/content.service';
import { EventService } from '@arsnova/app/services/util/event.service';
import { GlobalStorageService } from '@arsnova/app/services/util/global-storage.service';
import { PresentationService } from '@arsnova/app/services/util/presentation.service';
import { ContentPriorization } from '@arsnova/app/models/content-priorization';
import { ContentState } from '@arsnova/app/models/content-state';
import { ContentType } from '@arsnova/app/models/content-type.enum';
import {
  JsonTranslationLoader,
  MockEventService,
  MockGlobalStorageService,
  MockThemeService
} from '@arsnova/testing/test-helpers';
import { ThemeService } from '@arsnova/theme/theme.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { StatisticPriorizationComponent } from './statistic-priorization.component';
import { PriorizationRoundStatistics } from '@arsnova/app/models/round-statistics';

describe('StatisticPriorizationComponent', () => {
  let component: StatisticPriorizationComponent;
  let fixture: ComponentFixture<StatisticPriorizationComponent>;

  const mockContentService = jasmine.createSpyObj(['getAnswersChangedStream', 'getAnswer']);
  const roundStatistics = new PriorizationRoundStatistics();
  roundStatistics.abstentionCount = 0;
  roundStatistics.answerCount = 0;
  roundStatistics.assignedPoints = [];
  roundStatistics.round = 1;
  const stats = new AnswerStatistics();
  stats.contentId = '1234',
  stats.roundStatistics = [roundStatistics];
  const body = {
    payload: {
      stats: stats
    }
  }
  const message = {
    body: JSON.stringify(body)
  }
  mockContentService.getAnswer.and.returnValue(of(stats));
  mockContentService.getAnswersChangedStream.and.returnValue(of(message));

  const mockPresentationService = jasmine.createSpyObj(['getScale']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatisticPriorizationComponent ],
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
          provide: PresentationService,
          useValue: mockPresentationService
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService
        }
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatisticPriorizationComponent);
    component = fixture.componentInstance;
    component.content = new ContentPriorization('1234', '0', 'room1234', 'subject', 'body', [], [], ContentType.PRIORIZATION, new ContentState(1, new Date(), false), 0);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
