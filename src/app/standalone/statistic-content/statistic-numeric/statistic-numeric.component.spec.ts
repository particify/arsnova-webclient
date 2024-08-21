import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { StatisticNumericComponent } from './statistic-numeric.component';
import { EventService } from '@app/core/services/util/event.service';
import { ContentService } from '@app/core/services/http/content.service';
import { ThemeService } from '@app/core/theme/theme.service';
import {
  MockEventService,
  MockThemeService,
  MockGlobalStorageService,
} from '@testing/test-helpers';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { ContentType } from '@app/core/models/content-type.enum';
import { of } from 'rxjs';
import { NumericRoundStatistics } from '@app/core/models/round-statistics';
import { AnswerStatistics } from '@app/core/models/answer-statistics';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { UserSettings } from '@app/core/models/user-settings';
import { ContentNumeric } from '@app/core/models/content-numeric';
import { ContentState } from '@app/core/models/content-state';

interface AnswerGroup {
  groupStart: number;
  groupEnd: number;
  count: number;
}

describe('StatisticNumericComponent', () => {
  let component: StatisticNumericComponent;
  let fixture: ComponentFixture<StatisticNumericComponent>;

  const mockContentService = jasmine.createSpyObj([
    'getAnswersChangedStream',
    'getAnswer',
    'getAnswersDeleted',
  ]);
  const defaultRoundStatistics = new NumericRoundStatistics(
    1,
    [],
    [],
    0,
    0,
    [],
    0,
    0,
    0,
    0,
    0,
    0,
    0
  );
  const defaultStats = new AnswerStatistics();
  defaultStats.contentId = '1234';
  defaultStats.roundStatistics = [defaultRoundStatistics];
  const body = {
    payload: {
      stats: defaultStats,
    },
  };
  const message = {
    body: JSON.stringify(body),
  };
  mockContentService.getAnswer.and.returnValue(of(defaultStats));
  mockContentService.getAnswersChangedStream.and.returnValue(of(message));
  mockContentService.getAnswersDeleted.and.returnValue(of({}));

  const mockPresentationService = jasmine.createSpyObj('PresentationService', [
    'getScale',
    'updateContentGroup',
  ]);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [getTranslocoModule(), StatisticNumericComponent],
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
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatisticNumericComponent);
    component = fixture.componentInstance;
    component.content = new ContentNumeric(
      'room1234',
      'subject',
      'body',
      [],
      ContentType.CHOICE
    );
    component.content.state = new ContentState(1, new Date(), true);
    component.settings = new UserSettings();
    component.visualizationUnitChanged = new EventEmitter<boolean>();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should group answers correctly: 1 to 10', () => {
    const roundStatistics = new NumericRoundStatistics(
      1,
      [1, 1, 2, 1, 1],
      [],
      0,
      0,
      [3, 4, 5, 6, 7],
      0,
      0,
      0,
      0,
      0,
      0,
      0
    );
    const stats = new AnswerStatistics();
    stats.contentId = '1234';
    stats.roundStatistics = [roundStatistics];
    component.content.minNumber = 1;
    component.content.maxNumber = 10;
    const groupedData: AnswerGroup[] = [
      { groupStart: 1, groupEnd: 1, count: 0 },
      { groupStart: 2, groupEnd: 2, count: 0 },
      { groupStart: 3, groupEnd: 3, count: 1 },
      { groupStart: 4, groupEnd: 4, count: 1 },
      { groupStart: 5, groupEnd: 5, count: 2 },
      { groupStart: 6, groupEnd: 6, count: 1 },
      { groupStart: 7, groupEnd: 7, count: 1 },
      { groupStart: 8, groupEnd: 8, count: 0 },
      { groupStart: 9, groupEnd: 9, count: 0 },
      { groupStart: 10, groupEnd: 10, count: 0 },
    ];
    fixture.detectChanges();
    component.init(stats);
    expect(component.data[0]).toEqual(groupedData);
  });

  it('should group answers correctly: 0 to 10', () => {
    const roundStatistics = new NumericRoundStatistics(
      1,
      [1, 1, 2, 1, 1],
      [],
      0,
      0,
      [3, 4, 5, 6, 7],
      0,
      0,
      0,
      0,
      0,
      0,
      0
    );
    const stats = new AnswerStatistics();
    stats.contentId = '1234';
    stats.roundStatistics = [roundStatistics];
    component.content.minNumber = 0;
    component.content.maxNumber = 10;
    const groupedData: AnswerGroup[] = [
      { groupStart: 0, groupEnd: 0, count: 0 },
      { groupStart: 1, groupEnd: 1, count: 0 },
      { groupStart: 2, groupEnd: 2, count: 0 },
      { groupStart: 3, groupEnd: 3, count: 1 },
      { groupStart: 4, groupEnd: 4, count: 1 },
      { groupStart: 5, groupEnd: 5, count: 2 },
      { groupStart: 6, groupEnd: 6, count: 1 },
      { groupStart: 7, groupEnd: 7, count: 1 },
      { groupStart: 8, groupEnd: 8, count: 0 },
      { groupStart: 9, groupEnd: 9, count: 0 },
      { groupStart: 10, groupEnd: 10, count: 0 },
    ];
    fixture.detectChanges();
    component.init(stats);
    expect(component.data[0]).toEqual(groupedData);
  });

  it('should group answers correctly: -5 to 5', () => {
    const roundStatistics = new NumericRoundStatistics(
      1,
      [1, 1, 2, 1, 1],
      [],
      0,
      0,
      [-3, -1, 0, 1, 3],
      0,
      0,
      0,
      0,
      0,
      0,
      0
    );
    const stats = new AnswerStatistics();
    stats.contentId = '1234';
    stats.roundStatistics = [roundStatistics];
    component.content.minNumber = -5;
    component.content.maxNumber = 5;
    const groupedData: AnswerGroup[] = [
      { groupStart: -5, groupEnd: -5, count: 0 },
      { groupStart: -4, groupEnd: -4, count: 0 },
      { groupStart: -3, groupEnd: -3, count: 1 },
      { groupStart: -2, groupEnd: -2, count: 0 },
      { groupStart: -1, groupEnd: -1, count: 1 },
      { groupStart: 0, groupEnd: 0, count: 2 },
      { groupStart: 1, groupEnd: 1, count: 1 },
      { groupStart: 2, groupEnd: 2, count: 0 },
      { groupStart: 3, groupEnd: 3, count: 1 },
      { groupStart: 4, groupEnd: 4, count: 0 },
      { groupStart: 5, groupEnd: 5, count: 0 },
    ];
    fixture.detectChanges();
    component.init(stats);
    expect(component.data[0]).toEqual(groupedData);
  });

  it('should group answers correctly: 1 to 20', () => {
    const roundStatistics = new NumericRoundStatistics(
      1,
      [1, 1, 2, 1, 1, 1],
      [],
      0,
      0,
      [3, 4, 5, 6, 7, 13],
      0,
      0,
      0,
      0,
      0,
      0,
      0
    );
    const stats = new AnswerStatistics();
    stats.contentId = '1234';
    stats.roundStatistics = [roundStatistics];
    mockContentService.getAnswer.and.returnValue(of(stats));
    component.content.minNumber = 1;
    component.content.maxNumber = 20;
    const groupedData: AnswerGroup[] = [
      { groupStart: 0, groupEnd: 1, count: 0 },
      { groupStart: 2, groupEnd: 3, count: 1 },
      { groupStart: 4, groupEnd: 5, count: 3 },
      { groupStart: 6, groupEnd: 7, count: 2 },
      { groupStart: 8, groupEnd: 9, count: 0 },
      { groupStart: 10, groupEnd: 11, count: 0 },
      { groupStart: 12, groupEnd: 13, count: 1 },
      { groupStart: 14, groupEnd: 15, count: 0 },
      { groupStart: 16, groupEnd: 17, count: 0 },
      { groupStart: 18, groupEnd: 19, count: 0 },
      { groupStart: 20, groupEnd: 21, count: 0 },
    ];
    fixture.detectChanges();
    component.init(stats);
    expect(component.data[0]).toEqual(groupedData);
  });

  it('should group answers correctly: 1 to 50', () => {
    const roundStatistics = new NumericRoundStatistics(
      1,
      [1, 1, 2, 1, 3],
      [],
      0,
      0,
      [25, 28, 30, 31, 42],
      0,
      0,
      0,
      0,
      0,
      0,
      0
    );
    const stats = new AnswerStatistics();
    stats.contentId = '1234';
    stats.roundStatistics = [roundStatistics];
    mockContentService.getAnswer.and.returnValue(of(stats));
    component.content.minNumber = 1;
    component.content.maxNumber = 50;
    const groupedData: AnswerGroup[] = [
      { groupStart: 0, groupEnd: 9, count: 0 },
      { groupStart: 10, groupEnd: 19, count: 0 },
      { groupStart: 20, groupEnd: 29, count: 2 },
      { groupStart: 30, groupEnd: 39, count: 3 },
      { groupStart: 40, groupEnd: 49, count: 3 },
      { groupStart: 50, groupEnd: 59, count: 0 },
    ];
    fixture.detectChanges();
    component.init(stats);
    expect(component.data[0]).toEqual(groupedData);
  });

  it('should group answers correctly: -1 to 50', () => {
    const roundStatistics = new NumericRoundStatistics(
      1,
      [1, 1, 2, 1, 3],
      [],
      0,
      0,
      [25, 28, 30, 31, 42],
      0,
      0,
      0,
      0,
      0,
      0,
      0
    );
    const stats = new AnswerStatistics();
    stats.contentId = '1234';
    stats.roundStatistics = [roundStatistics];
    mockContentService.getAnswer.and.returnValue(of(stats));
    component.content.minNumber = -1;
    component.content.maxNumber = 50;
    const groupedData: AnswerGroup[] = [
      { groupStart: -10, groupEnd: -1, count: 0 },
      { groupStart: 0, groupEnd: 9, count: 0 },
      { groupStart: 10, groupEnd: 19, count: 0 },
      { groupStart: 20, groupEnd: 29, count: 2 },
      { groupStart: 30, groupEnd: 39, count: 3 },
      { groupStart: 40, groupEnd: 49, count: 3 },
      { groupStart: 50, groupEnd: 59, count: 0 },
    ];
    fixture.detectChanges();
    component.init(stats);
    expect(component.data[0]).toEqual(groupedData);
  });

  it('should group answers correctly: 1 to 49', () => {
    const roundStatistics = new NumericRoundStatistics(
      1,
      [1, 1, 2, 1, 3],
      [],
      0,
      0,
      [25, 28, 30, 31, 42],
      0,
      0,
      0,
      0,
      0,
      0,
      0
    );
    const stats = new AnswerStatistics();
    stats.contentId = '1234';
    stats.roundStatistics = [roundStatistics];
    mockContentService.getAnswer.and.returnValue(of(stats));
    component.content.minNumber = 1;
    component.content.maxNumber = 49;
    const groupedData: AnswerGroup[] = [
      { groupStart: 0, groupEnd: 9, count: 0 },
      { groupStart: 10, groupEnd: 19, count: 0 },
      { groupStart: 20, groupEnd: 29, count: 2 },
      { groupStart: 30, groupEnd: 39, count: 3 },
      { groupStart: 40, groupEnd: 49, count: 3 },
    ];
    fixture.detectChanges();
    component.init(stats);
    expect(component.data[0]).toEqual(groupedData);
  });

  it('should group answers correctly: -1 to 49', () => {
    const roundStatistics = new NumericRoundStatistics(
      1,
      [1, 1, 2, 1, 3],
      [],
      0,
      0,
      [25, 28, 30, 31, 42],
      0,
      0,
      0,
      0,
      0,
      0,
      0
    );
    const stats = new AnswerStatistics();
    stats.contentId = '1234';
    stats.roundStatistics = [roundStatistics];
    mockContentService.getAnswer.and.returnValue(of(stats));
    component.content.minNumber = -1;
    component.content.maxNumber = 49;
    const groupedData: AnswerGroup[] = [
      { groupStart: -10, groupEnd: -1, count: 0 },
      { groupStart: 0, groupEnd: 9, count: 0 },
      { groupStart: 10, groupEnd: 19, count: 0 },
      { groupStart: 20, groupEnd: 29, count: 2 },
      { groupStart: 30, groupEnd: 39, count: 3 },
      { groupStart: 40, groupEnd: 49, count: 3 },
    ];
    fixture.detectChanges();
    component.init(stats);
    expect(component.data[0]).toEqual(groupedData);
  });

  it('should group answers correctly: 0 to 179', () => {
    const roundStatistics = new NumericRoundStatistics(
      1,
      [1, 1, 2, 1, 3],
      [],
      0,
      0,
      [25, 28, 30, 31, 42],
      0,
      0,
      0,
      0,
      0,
      0,
      0
    );
    const stats = new AnswerStatistics();
    stats.contentId = '1234';
    stats.roundStatistics = [roundStatistics];
    mockContentService.getAnswer.and.returnValue(of(stats));
    component.content.minNumber = 0;
    component.content.maxNumber = 179;
    const groupedData: AnswerGroup[] = [
      { groupStart: 0, groupEnd: 19, count: 0 },
      { groupStart: 20, groupEnd: 39, count: 5 },
      { groupStart: 40, groupEnd: 59, count: 3 },
      { groupStart: 60, groupEnd: 79, count: 0 },
      { groupStart: 80, groupEnd: 99, count: 0 },
      { groupStart: 100, groupEnd: 119, count: 0 },
      { groupStart: 120, groupEnd: 139, count: 0 },
      { groupStart: 140, groupEnd: 159, count: 0 },
      { groupStart: 160, groupEnd: 179, count: 0 },
    ];
    fixture.detectChanges();
    component.init(stats);
    expect(component.data[0]).toEqual(groupedData);
  });

  it('should group answers correctly: 1800 to 2000', () => {
    const roundStatistics = new NumericRoundStatistics(
      1,
      [1, 1, 2, 1, 3, 5, 1, 1],
      [],
      0,
      0,
      [1855, 1871, 1902, 1919, 1940, 1942, 1979, 1980],
      0,
      0,
      0,
      0,
      0,
      0,
      0
    );
    const stats = new AnswerStatistics();
    stats.contentId = '1234';
    stats.roundStatistics = [roundStatistics];
    mockContentService.getAnswer.and.returnValue(of(stats));
    component.content.minNumber = 1800;
    component.content.maxNumber = 2000;
    const groupedData: AnswerGroup[] = [
      { groupStart: 1800, groupEnd: 1819, count: 0 },
      { groupStart: 1820, groupEnd: 1839, count: 0 },
      { groupStart: 1840, groupEnd: 1859, count: 1 },
      { groupStart: 1860, groupEnd: 1879, count: 1 },
      { groupStart: 1880, groupEnd: 1899, count: 0 },
      { groupStart: 1900, groupEnd: 1919, count: 3 },
      { groupStart: 1920, groupEnd: 1939, count: 0 },
      { groupStart: 1940, groupEnd: 1959, count: 8 },
      { groupStart: 1960, groupEnd: 1979, count: 1 },
      { groupStart: 1980, groupEnd: 1999, count: 1 },
      { groupStart: 2000, groupEnd: 2019, count: 0 },
    ];
    fixture.detectChanges();
    component.init(stats);
    expect(component.data[0]).toEqual(groupedData);
  });

  it('should group answers correctly: 0 to 1000000', () => {
    const roundStatistics = new NumericRoundStatistics(
      1,
      [1, 1, 2, 1, 3, 5, 1, 1],
      [],
      0,
      0,
      [98, 15000, 89999, 150000, 170000, 800000, 875666, 875777],
      0,
      0,
      0,
      0,
      0,
      0,
      0
    );
    const stats = new AnswerStatistics();
    stats.contentId = '1234';
    stats.roundStatistics = [roundStatistics];
    mockContentService.getAnswer.and.returnValue(of(stats));
    component.content.minNumber = 0;
    component.content.maxNumber = 1000000;
    const groupedData: AnswerGroup[] = [
      { groupStart: 0, groupEnd: 99999, count: 4 },
      { groupStart: 100000, groupEnd: 199999, count: 4 },
      { groupStart: 200000, groupEnd: 299999, count: 0 },
      { groupStart: 300000, groupEnd: 399999, count: 0 },
      { groupStart: 400000, groupEnd: 499999, count: 0 },
      { groupStart: 500000, groupEnd: 599999, count: 0 },
      { groupStart: 600000, groupEnd: 699999, count: 0 },
      { groupStart: 700000, groupEnd: 799999, count: 0 },
      { groupStart: 800000, groupEnd: 899999, count: 7 },
      { groupStart: 900000, groupEnd: 999999, count: 0 },
      { groupStart: 1000000, groupEnd: 1099999, count: 0 },
    ];
    fixture.detectChanges();
    component.init(stats);
    expect(component.data[0]).toEqual(groupedData);
  });

  it('should group answers correctly: -1000000 to 1000000', () => {
    const roundStatistics = new NumericRoundStatistics(
      1,
      [1, 1, 2, 1, 3, 5, 1, 1],
      [],
      0,
      0,
      [-999999, -142000, 0, 150000, 170000, 800000, 875666, 875777],
      0,
      0,
      0,
      0,
      0,
      0,
      0
    );
    const stats = new AnswerStatistics();
    stats.contentId = '1234';
    stats.roundStatistics = [roundStatistics];
    mockContentService.getAnswer.and.returnValue(of(stats));
    component.content.minNumber = -1000000;
    component.content.maxNumber = 1000000;
    const groupedData: AnswerGroup[] = [
      { groupStart: -1000000, groupEnd: -800001, count: 1 },
      { groupStart: -800000, groupEnd: -600001, count: 0 },
      { groupStart: -600000, groupEnd: -400001, count: 0 },
      { groupStart: -400000, groupEnd: -200001, count: 0 },
      { groupStart: -200000, groupEnd: -1, count: 1 },
      { groupStart: 0, groupEnd: 199999, count: 6 },
      { groupStart: 200000, groupEnd: 399999, count: 0 },
      { groupStart: 400000, groupEnd: 599999, count: 0 },
      { groupStart: 600000, groupEnd: 799999, count: 0 },
      { groupStart: 800000, groupEnd: 999999, count: 7 },
      { groupStart: 1000000, groupEnd: 1199999, count: 0 },
    ];
    fixture.detectChanges();
    component.init(stats);
    expect(component.data[0]).toEqual(groupedData);
  });
});
