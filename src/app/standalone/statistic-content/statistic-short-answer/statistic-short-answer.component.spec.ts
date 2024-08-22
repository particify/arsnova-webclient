import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatisticShortAnswerComponent } from './statistic-short-answer.component';
import { ContentService } from '@app/core/services/http/content.service';
import { of } from 'rxjs';
import { RoundStatistics } from '@app/core/models/round-statistics';
import { AnswerStatistics } from '@app/core/models/answer-statistics';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { ContentShortAnswer } from '@app/core/models/content-short-answer';

describe('StatisticShortAnswerComponent', () => {
  let component: StatisticShortAnswerComponent;
  let fixture: ComponentFixture<StatisticShortAnswerComponent>;

  const mockContentService = jasmine.createSpyObj([
    'getAnswersChangedStream',
    'getAnswer',
    'getAnswersDeleted',
    'banAnswer',
    'getAnswerBanned',
  ]);
  const roundStatistics = new RoundStatistics(1, [], [], 0, 0);
  const stats = new AnswerStatistics();
  stats.contentId = '1234';
  stats.roundStatistics = [roundStatistics];
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
  mockContentService.getAnswerBanned.and.returnValue(of('Test'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatisticShortAnswerComponent, getTranslocoModule()],
      providers: [
        {
          provide: ContentService,
          useValue: mockContentService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(StatisticShortAnswerComponent);
    component = fixture.componentInstance;
    component.content = new ContentShortAnswer();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
