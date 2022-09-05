import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ParticipantContentCarouselPageComponent } from './participant-content-carousel-page.component';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  JsonTranslationLoader,
  MockNotificationService,
  ActivatedRouteStub,
  MockGlobalStorageService,
  MockRouter,
  MockEventService,
  MockAnnounceService
} from '@arsnova/testing/test-helpers';
import { of } from 'rxjs';
import { GlobalStorageService } from '@arsnova/app/services/util/global-storage.service';
import { ContentAnswerService } from '@arsnova/app/services/http/content-answer.service';
import { EventService } from '@arsnova/app/services/util/event.service';
import { ContentService } from '@arsnova/app/services/http/content.service';
import { ContentGroupService } from '@arsnova/app/services/http/content-group.service';
import { AnnounceService } from '@arsnova/app/services/util/announce.service';
import { MockLocationStrategy } from '@angular/common/testing';
import { AuthenticationService } from '@arsnova/app/services/http/authentication.service';
import { Room } from '@arsnova/app/models/room';
import { A11yIntroPipe } from '@arsnova/app/pipes/a11y-intro.pipe';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ParticipantContentCarouselPageComponent', () => {
  let component: ParticipantContentCarouselPageComponent;
  let fixture: ComponentFixture<ParticipantContentCarouselPageComponent>;

  const mockContentAnswerService = jasmine.createSpyObj(['getAnswersByUserIdContentIds']);

  const mockContentService = jasmine.createSpyObj(['getContentsByIds', 'getSupportedContents', '']);

  const mockContentGroupService = jasmine.createSpyObj(['getByRoomIdAndName', 'getById', 'filterPublishedIds']);
  mockContentGroupService.getByRoomIdAndName.and.returnValue(of({}));
  mockContentGroupService.filterPublishedIds.and.returnValue([]);

  const mockAuthenticationService = jasmine.createSpyObj(['getCurrentAuthentication']);


  const data = {
    room: new Room()
  }
  const snapshot = new ActivatedRouteSnapshot();
  const params = {
    shortId: '12345678',
    seriesName: 'Quiz'
  }

  snapshot.params = of([params]);

  const activatedRouteStub = new ActivatedRouteStub(null, data, snapshot);

  let translateService: TranslateService;
  const a11yIntroPipe = new A11yIntroPipe(translateService);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ 
        ParticipantContentCarouselPageComponent,
        A11yIntroPipe
      ],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader
          },
          isolate: true
        })
      ],
      providers: [
        {
          provide: ContentService,
          useValue: mockContentService
        },
        {
          provide: ContentGroupService,
          useValue: mockContentGroupService
        },
        {
          provide: AnnounceService,
          useClass: MockAnnounceService
        },
        {
          provide: Location,
          useClass: MockLocationStrategy
        },
        {
          provide: ContentAnswerService,
          useValue: mockContentAnswerService
        },
        {
          provide: AuthenticationService,
          useValue: mockAuthenticationService
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService
        },
        {
          provide: Router,
          useClass: MockRouter
        },
        {
          provide: EventService,
          useClass: MockEventService
        },
        {
          provide: A11yIntroPipe,
          useValue: a11yIntroPipe
        }
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParticipantContentCarouselPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
