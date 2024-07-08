import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaderboardPageComponent } from './leaderboard-page.component';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { ActivatedRouteStub } from '@testing/test-helpers';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Room } from '@app/core/models/room';
import { ContentGroup } from '@app/core/models/content-group';
import { RoundStatistics } from '@app/core/models/round-statistics';
import { AnswerStatistics } from '@app/core/models/answer-statistics';
import { ContentService } from '@app/core/services/http/content.service';
import { Content } from '@app/core/models/content';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ThemeService } from '@app/core/theme/theme.service';

describe('LeaderboardPageComponent', () => {
  let component: LeaderboardPageComponent;
  let fixture: ComponentFixture<LeaderboardPageComponent>;

  const mockContentGroupService = jasmine.createSpyObj('ContentGroupService', [
    'getCurrentLeaderboard',
  ]);
  mockContentGroupService.getCurrentLeaderboard.and.returnValue(of([]));

  const mockContentService = jasmine.createSpyObj('ContentService', [
    'getAnswersChangedStream',
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
  mockContentService.getAnswersChangedStream.and.returnValue(of(message));

  const snapshot = new ActivatedRouteSnapshot();
  snapshot.params = of([{ seriesName: 'SERIES' }]);
  snapshot.data = {
    room: new Room(),
    contentGroup: new ContentGroup(),
  };
  const activatedRouteStub = new ActivatedRouteStub(
    undefined,
    undefined,
    snapshot
  );

  const themeService = jasmine.createSpyObj(ThemeService, ['getTextColors']);
  themeService.getTextColors.and.returnValue([]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LeaderboardPageComponent,
        getTranslocoModule(),
        BrowserAnimationsModule,
      ],
      providers: [
        {
          provide: ContentGroupService,
          useValue: mockContentGroupService,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
        },
        {
          provide: ContentService,
          useValue: mockContentService,
        },
        {
          provide: ThemeService,
          useValue: themeService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LeaderboardPageComponent);
    component = fixture.componentInstance;
    component.content = new Content();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
