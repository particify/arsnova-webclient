import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { StatisticsPageComponent } from './statistics-page.component';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
} from '@angular/router';
import { MockRouter, ActivatedRouteStub } from '@testing/test-helpers';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { Room } from '@app/core/models/room';
import { of } from 'rxjs';
import { RoomStats } from '@app/core/models/room-stats';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { A11yIntroPipe } from '@app/core/pipes/a11y-intro.pipe';

describe('StatisticsPageComponent', () => {
  let component: StatisticsPageComponent;
  let fixture: ComponentFixture<StatisticsPageComponent>;

  const mockRoomStatsService = jasmine.createSpyObj(['getStats']);
  const stats = new RoomStats([], 0, 0, 0, 0);
  mockRoomStatsService.getStats.and.returnValue(of(stats));

  const mockContentGroupService = jasmine.createSpyObj(['getById']);
  mockContentGroupService.getById.and.returnValue(of({}));

  const room = new Room();
  room.id = 'roomId';

  const snapshot = new ActivatedRouteSnapshot();
  snapshot.params = {
    seriesName: 'Quiz',
  };
  snapshot.data = {
    room: room,
  };
  const activatedRouteStub = new ActivatedRouteStub(
    undefined,
    undefined,
    snapshot
  );

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [StatisticsPageComponent, A11yIntroPipe],
      imports: [getTranslocoModule()],
      providers: [
        {
          provide: RoomStatsService,
          useValue: mockRoomStatsService,
        },
        {
          provide: ContentGroupService,
          useValue: mockContentGroupService,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatisticsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
