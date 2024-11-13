import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaderboardPageComponent } from './leaderboard-page.component';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ContentGroup } from '@app/core/models/content-group';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { ThemeService } from '@app/core/theme/theme.service';
import { Room } from '@app/core/models/room';

describe('LeaderboardPageComponent', () => {
  let component: LeaderboardPageComponent;
  let fixture: ComponentFixture<LeaderboardPageComponent>;

  const mockContentGroupService = jasmine.createSpyObj('ContentGroupService', [
    'getByRoomIdAndName',
    'getLeaderboard',
  ]);
  mockContentGroupService.getByRoomIdAndName.and.returnValue(
    of(new ContentGroup())
  );
  mockContentGroupService.getLeaderboard.and.returnValue(of([]));

  const themeService = jasmine.createSpyObj(ThemeService, ['getTextColors']);
  themeService.getTextColors.and.returnValue([]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaderboardPageComponent, getTranslocoModule()],
      providers: [
        {
          provide: ContentGroupService,
          useValue: mockContentGroupService,
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
    component.room = new Room();
    component.contentGroup = new ContentGroup();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
