import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { StatisticScaleComponent } from './statistic-scale.component';
import { ContentService } from '@app/core/services/http/content.service';
import { ThemeService } from '@app/core/theme/theme.service';
import {
  ActivatedRouteStub,
  MockGlobalStorageService,
  MockThemeService,
} from '@testing/test-helpers';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { ContentChoice } from '@app/core/models/content-choice';
import { ContentType } from '@app/core/models/content-type.enum';
import { of } from 'rxjs';
import { LikertScaleService } from '@app/core/services/util/likert-scale.service';
import { RoundStatistics } from '@app/core/models/round-statistics';
import { AnswerStatistics } from '@app/core/models/answer-statistics';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { UserSettings } from '@app/core/models/user-settings';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { Room } from '@app/core/models/room';
import { LanguageService } from '@app/core/services/util/language.service';

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

  const mockFormattingService = jasmine.createSpyObj(['postString']);
  mockFormattingService.postString.and.returnValue(of('rendered'));

  const snapshot = new ActivatedRouteSnapshot();

  snapshot.data = {
    room: new Room('1234', 'shortId', 'abbreviation', 'name', 'description'),
  };

  const activatedRouteStub = new ActivatedRouteStub(
    undefined,
    undefined,
    snapshot
  );

  const mockLangService = jasmine.createSpyObj(LanguageService, [
    'ensureValidLang',
  ]);
  mockLangService.ensureValidLang.and.returnValue(true);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [getTranslocoModule(), StatisticScaleComponent],
      providers: [
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
        {
          provide: FormattingService,
          useValue: mockFormattingService,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
        },
        {
          provide: LanguageService,
          useValue: mockLangService,
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
