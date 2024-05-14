import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaderboardPageComponent } from './leaderboard-page.component';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { ActivatedRouteStub } from '@testing/test-helpers';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Room } from '@app/core/models/room';
import { ContentGroup } from '@app/core/models/content-group';
import { getTranslocoModule } from '@testing/transloco-testing.module';

describe('LeaderboardPageComponent', () => {
  let component: LeaderboardPageComponent;
  let fixture: ComponentFixture<LeaderboardPageComponent>;

  const mockContentGroupService = jasmine.createSpyObj('ContentGroupService', [
    'getLeaderboard',
  ]);
  mockContentGroupService.getLeaderboard.and.returnValue(of([]));

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LeaderboardPageComponent],
      imports: [getTranslocoModule()],
      providers: [
        {
          provide: ContentGroupService,
          useValue: mockContentGroupService,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LeaderboardPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
