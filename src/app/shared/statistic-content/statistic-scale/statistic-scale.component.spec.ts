import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { StatisticScaleComponent } from './statistic-scale.component';
import { EventService } from '@app/core/services/util/event.service';
import { ContentService } from '@app/core/services/http/content.service';
import { ThemeService } from '@app/core/theme/theme.service';
import { MockEventService, MockThemeService } from '@testing/test-helpers';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { ContentChoice } from '@app/core/models/content-choice';
import { ContentType } from '@app/core/models/content-type.enum';
import { of } from 'rxjs';
import { LikertScaleService } from '@app/core/services/util/likert-scale.service';
import { RoundStatistics } from '@app/core/models/round-statistics';
import { AnswerStatistics } from '@app/core/models/answer-statistics';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { MockGlobalStorageService } from '@testing/test-helpers';
import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { UserSettings } from '@app/core/models/user-settings';

describe('StatisticScaleComponent', () => {
  let component: StatisticScaleComponent;
  let fixture: ComponentFixture<StatisticScaleComponent>;

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

  const mockLikertScaleService = jasmine.createSpyObj(['getOptionLabels']);
  mockLikertScaleService.getOptionLabels.and.returnValue([
    '5',
    '4',
    '3',
    '2',
    '1',
  ]);

  const mockPresentationService = jasmine.createSpyObj(['getScale']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [getTranslocoModule(), StatisticScaleComponent],
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
          provide: LikertScaleService,
          useValue: mockLikertScaleService,
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
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatisticScaleComponent);
    component = fixture.componentInstance;
    component.content = new ContentChoice(
      'room1234',
      'subject',
      'body',
      [],
      [],
      [],
      false,
      ContentType.SCALE
    );
    component.settings = new UserSettings();
    component.visualizationUnitChanged = new EventEmitter<boolean>();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
