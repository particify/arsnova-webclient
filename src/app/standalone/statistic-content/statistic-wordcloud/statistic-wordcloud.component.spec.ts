import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { StatisticWordcloudComponent } from './statistic-wordcloud.component';
import { ContentService } from '@app/core/services/http/content.service';
import { ThemeService } from '@app/core/theme/theme.service';
import { MockThemeService } from '@testing/test-helpers';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { ContentType } from '@app/core/models/content-type.enum';
import { of } from 'rxjs';
import { RoundStatistics } from '@app/core/models/round-statistics';
import { AnswerStatistics } from '@app/core/models/answer-statistics';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ContentWordcloud } from '@app/core/models/content-wordcloud';
import { PresentationService } from '@app/core/services/util/presentation.service';

describe('StatisticWordcloudComponent', () => {
  let component: StatisticWordcloudComponent;
  let fixture: ComponentFixture<StatisticWordcloudComponent>;

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

  const presentationService = jasmine.createSpyObj(PresentationService, [
    'getWordcloudVisualizationChanged',
    'updateWordcloudVisualization',
  ]);
  presentationService.getWordcloudVisualizationChanged.and.returnValue(
    of(true)
  );

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [getTranslocoModule(), StatisticWordcloudComponent],
      providers: [
        {
          provide: ContentService,
          useValue: mockContentService,
        },
        {
          provide: ThemeService,
          useClass: MockThemeService,
        },
        { provide: PresentationService, useValue: presentationService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatisticWordcloudComponent);
    component = fixture.componentInstance;
    component.content = new ContentWordcloud(
      'room1234',
      'subject',
      'body',
      [],
      ContentType.WORDCLOUD
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
