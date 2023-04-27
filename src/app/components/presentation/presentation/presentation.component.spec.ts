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
  MockLangService,
} from '@arsnova/testing/test-helpers';
import { of } from 'rxjs';
import { GlobalStorageService } from '@arsnova/app/services/util/global-storage.service';
import { SpyLocation } from '@angular/common/testing';
import { Room } from '@arsnova/app/models/room';
import { RoomStatsService } from '@arsnova/app/services/http/room-stats.service';
import { LanguageService } from '@arsnova/app/services/util/language.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PresentationService } from '@arsnova/app/services/util/presentation.service';

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
    },
  };

  Object.defineProperty(snapshot, 'firstChild', { value: firstChild });

  const room = new Room();
  room.settings = {};
  const data = {
    room: room,
  };
  const activatedRouteStub = new ActivatedRouteStub(null, data, snapshot);

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
          provide: LanguageService,
          useClass: MockLangService,
        },
        {
          provide: PresentationService,
          useValue: mockPresentationService,
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
