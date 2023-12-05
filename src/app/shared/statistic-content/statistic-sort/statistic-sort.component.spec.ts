import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { StatisticSortComponent } from './statistic-sort.component';
import { EventService } from '@app/core/services/util/event.service';
import { ContentService } from '@app/core/services/http/content.service';
import { ThemeService } from '@app/core/theme/theme.service';
import { MockEventService, MockThemeService } from '@testing/test-helpers';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { ContentChoice } from '@app/core/models/content-choice';
import { ContentType } from '@app/core/models/content-type.enum';
import { of } from 'rxjs';
import { RoundStatistics } from '@app/core/models/round-statistics';
import { AnswerStatistics } from '@app/core/models/answer-statistics';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';

describe('StatisticSortComponent', () => {
  let component: StatisticSortComponent;
  let fixture: ComponentFixture<StatisticSortComponent>;

  const mockContentService = jasmine.createSpyObj([
    'getAnswersChangedStream',
    'getAnswer',
    'getAnswersDeleted',
  ]);
  const roundStatistics = new RoundStatistics(1, [], [], 0, 0);
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
  mockContentService.getAnswersDeleted.and.returnValue(of({}));

  const mockPresentationService = jasmine.createSpyObj(['getScale']);

  const mockContentAnswerService = jasmine.createSpyObj([
    'shuffleAnswerOptions',
  ]);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [StatisticSortComponent],
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
      'room1234',
      'subject',
      'body',
      [],
      [],
      [1, 2, 3, 4],
      false,
      ContentType.SORT
    );
    component.visualizationUnitChanged = new EventEmitter<boolean>();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get correct top answer combinations if there are no correct answers', () => {
    const combinations = [
      {
        count: 3,
        selectedChoiceIndexes: [4, 3, 2, 1],
      },
      {
        count: 4,
        selectedChoiceIndexes: [1, 2, 4, 3],
      },
      {
        count: 5,
        selectedChoiceIndexes: [1, 3, 4, 2],
      },
      {
        count: 6,
        selectedChoiceIndexes: [1, 3, 2, 4],
      },
      {
        count: 2,
        selectedChoiceIndexes: [1, 4, 3, 2],
      },
      {
        count: 2,
        selectedChoiceIndexes: [1, 4, 2, 3],
      },
    ];
    const topCombinations = component.getTopCombinations(combinations);
    const correctTopCombinations = [
      {
        count: 6,
        selectedChoiceIndexes: [1, 3, 2, 4],
      },
      {
        count: 5,
        selectedChoiceIndexes: [1, 3, 4, 2],
      },
      {
        count: 4,
        selectedChoiceIndexes: [1, 2, 4, 3],
      },
      {
        count: 3,
        selectedChoiceIndexes: [4, 3, 2, 1],
      },
      {
        count: 4,
        selectedChoiceIndexes: [],
      },
    ];
    expect(topCombinations).toEqual(correctTopCombinations);
  });

  it('should get correct top answer combinations including correct one if there are correct answers even if they are sorted out', () => {
    const combinations = [
      {
        count: 3,
        selectedChoiceIndexes: [4, 3, 2, 1],
      },
      {
        count: 4,
        selectedChoiceIndexes: [1, 2, 4, 3],
      },
      {
        count: 5,
        selectedChoiceIndexes: [1, 3, 4, 2],
      },
      {
        count: 6,
        selectedChoiceIndexes: [1, 3, 2, 4],
      },
      {
        count: 2,
        selectedChoiceIndexes: [1, 2, 3, 4],
      },
      {
        count: 2,
        selectedChoiceIndexes: [1, 4, 2, 3],
      },
    ];
    const topCombinations = component.getTopCombinations(combinations);
    const correctTopCombinations = [
      {
        count: 6,
        selectedChoiceIndexes: [1, 3, 2, 4],
      },
      {
        count: 5,
        selectedChoiceIndexes: [1, 3, 4, 2],
      },
      {
        count: 4,
        selectedChoiceIndexes: [1, 2, 4, 3],
      },
      {
        count: 2,
        selectedChoiceIndexes: [1, 2, 3, 4],
      },
      {
        count: 5,
        selectedChoiceIndexes: [],
      },
    ];
    expect(topCombinations).toEqual(correctTopCombinations);
  });

  it('should get correct top answer combinations including correct one at its original position if there are correct answers if they are not sorted out', () => {
    const combinations = [
      {
        count: 3,
        selectedChoiceIndexes: [4, 3, 2, 1],
      },
      {
        count: 4,
        selectedChoiceIndexes: [1, 2, 3, 4],
      },
      {
        count: 5,
        selectedChoiceIndexes: [1, 3, 4, 2],
      },
      {
        count: 6,
        selectedChoiceIndexes: [1, 3, 2, 4],
      },
      {
        count: 2,
        selectedChoiceIndexes: [1, 2, 4, 3],
      },
      {
        count: 2,
        selectedChoiceIndexes: [1, 4, 2, 3],
      },
    ];
    const topCombinations = component.getTopCombinations(combinations);
    const correctTopCombinations = [
      {
        count: 6,
        selectedChoiceIndexes: [1, 3, 2, 4],
      },
      {
        count: 5,
        selectedChoiceIndexes: [1, 3, 4, 2],
      },
      {
        count: 4,
        selectedChoiceIndexes: [1, 2, 3, 4],
      },
      {
        count: 3,
        selectedChoiceIndexes: [4, 3, 2, 1],
      },
      {
        count: 4,
        selectedChoiceIndexes: [],
      },
    ];
    expect(topCombinations).toEqual(correctTopCombinations);
  });
});
