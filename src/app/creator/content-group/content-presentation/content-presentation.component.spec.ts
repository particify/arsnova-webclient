import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContentPresentationComponent } from './content-presentation.component';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
} from '@angular/router';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { ActivatedRouteStub, MockRouter } from '@testing/test-helpers';
import { Location } from '@angular/common';
import { SpyLocation } from '@angular/common/testing';
import { NO_ERRORS_SCHEMA, Injectable } from '@angular/core';
import { Room } from '@app/core/models/room';
import { of } from 'rxjs';
import { ContentGroup } from '@app/core/models/content-group';
import { Content } from '@app/core/models/content';
import { ContentType } from '@app/core/models/content-type.enum';
import { UserService } from '@app/core/services/http/user.service';
import { AuthProvider } from '@app/core/models/auth-provider';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { UserSettings } from '@app/core/models/user-settings';
import { StepperComponent } from '@app/standalone/stepper/stepper.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';

@Injectable()
class MockContentService {
  getContentsByIds() {
    return of([
      new Content('1', 'subject', 'body', [], ContentType.CHOICE, {}),
    ]);
  }

  getSupportedContents(): Content[] {
    return [];
  }
}

@Injectable()
class MockContentGroupService {
  getByRoomIdAndName() {
    return of(new ContentGroup('roomId', 'name', [], true));
  }
  patchContentGroup(group: ContentGroup) {
    return of(group);
  }
}

describe('ContentPresentationComponent', () => {
  let component: ContentPresentationComponent;
  let fixture: ComponentFixture<ContentPresentationComponent>;

  const snapshot = new ActivatedRouteSnapshot();
  snapshot.data = {
    isPresentation: false,
    room: new Room('1234', 'shortId', 'abbreviation', 'name', 'description'),
  };

  snapshot.params = of([{ seriesName: 'SERIES' }]);

  const activatedRouteStub = new ActivatedRouteStub(
    undefined,
    undefined,
    snapshot
  );

  const mockUserService = jasmine.createSpyObj('UserService', [
    'getUserSettingsByLoginId',
  ]);
  mockUserService.getUserSettingsByLoginId.and.returnValue(
    of(new UserSettings())
  );

  const mockGlobalStorageService = jasmine.createSpyObj(
    'GlobalStorageService',
    ['getItem']
  );
  mockGlobalStorageService.getItem
    .withArgs(STORAGE_KEYS.USER)
    .and.returnValue(
      new ClientAuthentication('1234', 'a@b.cd', AuthProvider.ARSNOVA, 'token')
    );

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentPresentationComponent],
      imports: [getTranslocoModule(), StepperComponent],
      providers: [
        {
          provide: ContentService,
          useClass: MockContentService,
        },
        {
          provide: ContentGroupService,
          useClass: MockContentGroupService,
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
          provide: Location,
          useClass: SpyLocation,
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentPresentationComponent);
    component = fixture.componentInstance;
    component.contentGroup = new ContentGroup();
    component.contentGroup.contentIds = ['0', '1', '2', '3', '4', '5', '6'];
    setTimeout(() => {
      fixture.detectChanges();
    }, 100);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
