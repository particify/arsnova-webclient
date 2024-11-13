import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ParticipantContentCarouselPageComponent } from './participant-content-carousel-page.component';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
} from '@angular/router';
import { NotificationService } from '@app/core/services/util/notification.service';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import {
  MockNotificationService,
  ActivatedRouteStub,
  MockRouter,
  MockEventService,
  MockAnnounceService,
  MockFeatureFlagService,
} from '@testing/test-helpers';
import { of } from 'rxjs';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { EventService } from '@app/core/services/util/event.service';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { SpyLocation } from '@angular/common/testing';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { A11yIntroPipe } from '@app/core/pipes/a11y-intro.pipe';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UserSettings } from '@app/core/models/user-settings';
import { UserService } from '@app/core/services/http/user.service';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { AuthProvider } from '@app/core/models/auth-provider';
import { RoutingService } from '@app/core/services/util/routing.service';
import { ContentCarouselService } from '@app/core/services/util/content-carousel.service';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { FocusModeService } from '@app/participant/_services/focus-mode.service';
import { RoomUserAliasService } from '@app/core/services/http/room-user-alias.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';
import { ContentGroup } from '@app/core/models/content-group';
import { Room } from '@app/core/models/room';

describe('ParticipantContentCarouselPageComponent', () => {
  let component: ParticipantContentCarouselPageComponent;
  let fixture: ComponentFixture<ParticipantContentCarouselPageComponent>;

  const mockContentAnswerService = jasmine.createSpyObj([
    'getAnswersByUserIdContentIds',
  ]);

  const mockContentService = jasmine.createSpyObj([
    'getContentsByIds',
    'getSupportedContents',
    '',
  ]);

  const mockContentGroupService = jasmine.createSpyObj([
    'getById',
    'filterPublishedIds',
    'getAttributions',
    'getChangesStreamForEntity',
  ]);
  mockContentGroupService.filterPublishedIds.and.returnValue([]);
  mockContentGroupService.getAttributions.and.returnValue(of([]));
  mockContentGroupService.getChangesStreamForEntity.and.returnValue(of({}));

  const mockAuthenticationService = jasmine.createSpyObj([
    'getCurrentAuthentication',
    'getAuthenticationChanges',
  ]);
  mockAuthenticationService.getAuthenticationChanges.and.returnValue(of({}));

  const mockUserService = jasmine.createSpyObj('UserService', [
    'getCurrentUsersSettings',
  ]);
  mockUserService.getCurrentUsersSettings.and.returnValue(
    of(new UserSettings())
  );

  const mockGlobalStorageService = jasmine.createSpyObj(
    'GlobalStorageService',
    ['getItem']
  );
  mockGlobalStorageService.getItem
    .withArgs(STORAGE_KEYS.LANGUAGE)
    .and.returnValue('de');
  mockGlobalStorageService.getItem
    .withArgs(STORAGE_KEYS.USER)
    .and.returnValue(
      new ClientAuthentication('1234', 'a@b.cd', AuthProvider.ARSNOVA, 'token')
    );

  const mockRoutingService = jasmine.createSpyObj('RoutingService', [
    'getRouteChanges',
  ]);

  const snapshot = new ActivatedRouteSnapshot();
  const params = {
    shortId: '12345678',
    seriesName: 'Quiz',
  };

  snapshot.params = of([params]);
  snapshot.data = {};

  const activatedRouteStub = new ActivatedRouteStub(
    undefined,
    undefined,
    snapshot
  );
  const route = {
    params: params,
  };
  mockRoutingService.getRouteChanges.and.returnValue(of(route));

  const mockFocusModeService = jasmine.createSpyObj([
    'getFocusModeEnabled',
    'getContentState',
  ]);
  mockFocusModeService.getFocusModeEnabled.and.returnValue(of(true));
  mockFocusModeService.getContentState.and.returnValue(of({}));

  const mockContentCarouselService = jasmine.createSpyObj([
    'setLastContentAnswered',
  ]);

  const mockRoomUserAliasService = jasmine.createSpyObj(
    'RoomUserAliasService',
    ['generateAlias', 'getCurrentAlias']
  );
  mockRoomUserAliasService.generateAlias.and.returnValue(
    of({ id: 'id', alias: 'alias', seed: 'seed' })
  );
  mockRoomUserAliasService.getCurrentAlias.and.returnValue(
    of({ id: 'id', alias: 'alias', seed: 'seed' })
  );

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [A11yIntroPipe],
      imports: [
        getTranslocoModule(),
        ParticipantContentCarouselPageComponent,
        HttpClientTestingModule,
      ],
      providers: [
        {
          provide: ContentService,
          useValue: mockContentService,
        },
        {
          provide: ContentGroupService,
          useValue: mockContentGroupService,
        },
        {
          provide: AnnounceService,
          useClass: MockAnnounceService,
        },
        {
          provide: Location,
          useClass: SpyLocation,
        },
        {
          provide: ContentAnswerService,
          useValue: mockContentAnswerService,
        },
        {
          provide: AuthenticationService,
          useValue: mockAuthenticationService,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
        },
        {
          provide: GlobalStorageService,
          useValue: mockGlobalStorageService,
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: EventService,
          useClass: MockEventService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: RoutingService,
          useValue: mockRoutingService,
        },
        {
          provide: FocusModeService,
          useValue: mockFocusModeService,
        },
        {
          provide: ContentCarouselService,
          useValue: mockContentCarouselService,
        },
        {
          provide: ContentPublishService,
          useClass: ContentPublishService,
        },
        {
          provide: RoomUserAliasService,
          useValue: mockRoomUserAliasService,
        },
        {
          provide: FeatureFlagService,
          useClass: MockFeatureFlagService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParticipantContentCarouselPageComponent);
    component = fixture.componentInstance;
    component.contentGroup = new ContentGroup();
    component.room = new Room();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
