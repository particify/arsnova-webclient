import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PresentationComponent } from './presentation.component';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
} from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {
  JsonTranslationLoader,
  ActivatedRouteStub,
  MockGlobalStorageService,
  MockRouter,
  MockNotificationService,
} from '@testing/test-helpers';
import { of } from 'rxjs';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { SpyLocation } from '@angular/common/testing';
import { Room } from '@app/core/models/room';
import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { NotificationService } from '@app/core/services/util/notification.service';

describe('PresentationComponent', () => {
  let component: PresentationComponent;
  let fixture: ComponentFixture<PresentationComponent>;

  const mockRoomStatsService = jasmine.createSpyObj(['getStats']);
  mockRoomStatsService.getStats.and.returnValue(of({}));

  const mockPresentationService = jasmine.createSpyObj(['updateCurrentGroup']);

  const snapshot = new ActivatedRouteSnapshot();
  snapshot.params = {
    shortId: '12345678',
    seriesName: 'Quiz',
  };
  const firstChild = {
    firstChild: {
      url: [
        {
          path: 'path',
        },
      ],
      params: {},
    },
  };

  Object.defineProperty(snapshot, 'firstChild', { value: firstChild });

  const room = new Room();
  room.settings = {};
  const data = {
    room: room,
  };
  const activatedRouteStub = new ActivatedRouteStub(null, data, snapshot);
  const focusModeService = jasmine.createSpyObj('FocusModeService', ['init']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PresentationComponent],
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
          provide: Location,
          useClass: SpyLocation,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: PresentationService,
          useValue: mockPresentationService,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PresentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
