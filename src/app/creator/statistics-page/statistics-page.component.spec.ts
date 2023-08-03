import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { StatisticsPageComponent } from './statistics-page.component';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
} from '@angular/router';
import {
  MockRouter,
  ActivatedRouteStub,
  JsonTranslationLoader,
} from '@testing/test-helpers';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
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

  const data = {
    room: new Room(),
  };
  const snapshot = new ActivatedRouteSnapshot();
  snapshot.params = {
    seriesName: 'Quiz',
  };
  const activatedRouteStub = new ActivatedRouteStub(null, data, snapshot);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [StatisticsPageComponent, A11yIntroPipe],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader,
          },
          isolate: true,
        }),
      ],
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
