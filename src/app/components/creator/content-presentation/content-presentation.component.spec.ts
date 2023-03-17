import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContentPresentationComponent } from './content-presentation.component';
import { ContentService } from '@arsnova/app/services/http/content.service';
import { EventService } from '@arsnova/app/services/util/event.service';
import { RoomService } from '@arsnova/app/services/http/room.service';
import { ContentGroupService } from '@arsnova/app/services/http/content-group.service';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
} from '@angular/router';
import { DialogService } from '@arsnova/app/services/util/dialog.service';
import { GlobalStorageService } from '@arsnova/app/services/util/global-storage.service';
import { LanguageService } from '@arsnova/app/services/util/language.service';
import {
  ActivatedRouteStub,
  JsonTranslationLoader,
  MockEventService,
  MockLangService,
  MockRouter,
} from '@arsnova/testing/test-helpers';
import { Location } from '@angular/common';
import { MockLocationStrategy } from '@angular/common/testing';
import { HotkeyService } from '@arsnova/app/services/util/hotkey.service';
import { NO_ERRORS_SCHEMA, Injectable } from '@angular/core';
import { Room } from '@arsnova/app/models/room';
import { of } from 'rxjs';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ContentGroup } from '@arsnova/app/models/content-group';
import { Content } from '@arsnova/app/models/content';
import { ContentType } from '@arsnova/app/models/content-type.enum';
import { ContentState } from '@arsnova/app/models/content-state';
import { PresentationService } from '@arsnova/app/services/util/presentation.service';
import { UserService } from '@arsnova/app/services/http/user.service';
import { AuthProvider } from '@arsnova/app/models/auth-provider';
import { ClientAuthentication } from '@arsnova/app/models/client-authentication';
import { STORAGE_KEYS } from '@arsnova/app/services/util/global-storage.service';
import { UserSettings } from '@arsnova/app/models/user-settings';
import { StepperComponent } from '../../shared/stepper/stepper.component';
import { RemoteService } from '@arsnova/app/services/util/remote.service';
import { ContentPublishService } from '@arsnova/app/services/util/content-publish.service';
import { PublishContentComponent } from '../_dialogs/publish-content/publish-content.component';
import { ContentPublishActionType } from '@arsnova/app/models/content-publish-action.enum';

@Injectable()
class MockContentService {
  getContentsByIds() {
    return of([
      new Content(
        '1234',
        '0',
        '1',
        'subject',
        'body',
        [],
        ContentType.CHOICE,
        {},
        new ContentState(1, new Date(), true)
      ),
    ]);
  }

  getSupportedContents() {
    return [];
  }
}

@Injectable()
class MockRoomService {}

@Injectable()
class MockContentGroupService {
  getByRoomIdAndName() {
    return of(new ContentGroup('1234', '0', 'roomId', 'name', [], true));
  }
  patchContentGroup(group) {
    return of(group);
  }
}

@Injectable()
class MockHotykeyService {}

describe('ContentPresentationComponent', () => {
  let component: ContentPresentationComponent;
  let fixture: ComponentFixture<ContentPresentationComponent>;

  const data = {
    room: new Room('1234', 'shortId', 'abbreviation', 'name', 'description'),
  };

  const snapshot = new ActivatedRouteSnapshot();
  snapshot.data = {
    isPresentation: false,
  };

  snapshot.params = of([{ seriesName: 'SERIES' }]);

  const activatedRouteStub = new ActivatedRouteStub(null, data, snapshot);

  const mockPresentationService = jasmine.createSpyObj(['getScale']);

  const mockUserService = jasmine.createSpyObj('UserService', [
    'getUserSettingsByLoginId',
  ]);
  mockUserService.getUserSettingsByLoginId.and.returnValue(
    of(new UserSettings())
  );

  const mockGlobalStorageService = jasmine.createSpyObj(
    'GlobalStorageService',
    ['getItem', 'setItem']
  );
  mockGlobalStorageService.getItem
    .withArgs(STORAGE_KEYS.LANGUAGE)
    .and.returnValue('de');
  mockGlobalStorageService.getItem
    .withArgs(STORAGE_KEYS.LAST_INDEX)
    .and.returnValue(null);
  mockGlobalStorageService.getItem
    .withArgs(STORAGE_KEYS.LAST_GROUP)
    .and.returnValue('series');
  mockGlobalStorageService.getItem
    .withArgs(STORAGE_KEYS.USER)
    .and.returnValue(
      new ClientAuthentication('1234', 'a@b.cd', AuthProvider.ARSNOVA, 'token')
    );

  const mockRemoteService = jasmine.createSpyObj(['getContentState']);

  const dialogService = jasmine.createSpyObj('DialogService', ['openDialog']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentPresentationComponent, StepperComponent],
      providers: [
        {
          provide: ContentService,
          useClass: MockContentService,
        },
        {
          provide: EventService,
          useClass: MockEventService,
        },
        {
          provide: RoomService,
          useClass: MockRoomService,
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
          provide: DialogService,
          useValue: dialogService,
        },
        {
          provide: GlobalStorageService,
          useValue: mockGlobalStorageService,
        },
        {
          provide: LanguageService,
          useClass: MockLangService,
        },
        {
          provide: Location,
          useClass: MockLocationStrategy,
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: HotkeyService,
          useClass: MockHotykeyService,
        },
        {
          provide: PresentationService,
          useValue: mockPresentationService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: RemoteService,
          useValue: mockRemoteService,
        },
        {
          provide: ContentPublishService,
          useClass: ContentPublishService,
        },
      ],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader,
          },
          isolate: true,
        }),
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

  it('should lock content when updating published state if content is published', () => {
    const lockContentSpy = spyOn(component, 'lockContent');
    component.currentStep = 0;
    component.contentGroup.firstPublishedIndex = 0;
    component.contentGroup.lastPublishedIndex = 0;
    component.updatePublishedState();
    expect(lockContentSpy).toHaveBeenCalled();
  });

  it('should publish content when updating published state if content is locked', () => {
    const publishContentSpy = spyOn(component, 'publishContent');
    component.currentStep = 1;
    component.contentGroup.firstPublishedIndex = 0;
    component.contentGroup.lastPublishedIndex = 0;
    component.updatePublishedState();
    expect(publishContentSpy).toHaveBeenCalled();
  });

  // Publish

  it('should publish current content only when updating published state and no contents are published', () => {
    const updateContentGroupSpy = spyOn(component, 'updateContentGroup');
    component.currentStep = 1;
    component.contentGroup.firstPublishedIndex = -1;
    component.updatePublishedState();
    expect(updateContentGroupSpy).toHaveBeenCalledWith(1, 1);
  });

  it('should increase published range to current when updating published state and current content is directly after range', () => {
    const updateContentGroupSpy = spyOn(component, 'updateContentGroup');
    component.currentStep = 1;
    component.contentGroup.firstPublishedIndex = 0;
    component.contentGroup.lastPublishedIndex = 0;
    component.updatePublishedState();
    expect(updateContentGroupSpy).toHaveBeenCalledWith(0, 1);
  });

  it('should increase published range from current when updating published state and current content is directly before range', () => {
    const updateContentGroupSpy = spyOn(component, 'updateContentGroup');
    component.currentStep = 1;
    component.contentGroup.firstPublishedIndex = 2;
    component.contentGroup.lastPublishedIndex = 4;
    component.updatePublishedState();
    expect(updateContentGroupSpy).toHaveBeenCalledWith(1, 4);
  });

  it('should increase published range from current when updating published state and current content is before range', () => {
    const updateContentGroupSpy = spyOn(component, 'updateContentGroup');
    component.currentStep = 0;
    component.contentGroup.firstPublishedIndex = 2;
    component.contentGroup.lastPublishedIndex = 4;
    component.updatePublishedState();
    expect(updateContentGroupSpy).toHaveBeenCalledWith(0, 4);
  });

  it('should ask for new range options when updating published state and current content is not directly after range', () => {
    component.currentStep = 6;
    component.contentGroup.firstPublishedIndex = 2;
    component.contentGroup.lastPublishedIndex = 4;
    dialogService.openDialog.and.returnValue({
      afterClosed: () => of(undefined),
    });
    component.updatePublishedState();
    expect(dialogService.openDialog).toHaveBeenCalledWith(
      PublishContentComponent,
      {
        data: 'publish',
      }
    );
  });

  it('should publish current content only when updating published state, current content is not directly after range and option in dialog is selected', () => {
    const updateContentGroupSpy = spyOn(component, 'updateContentGroup');
    component.currentStep = 6;
    component.contentGroup.firstPublishedIndex = 2;
    component.contentGroup.lastPublishedIndex = 4;
    dialogService.openDialog.and.returnValue({
      afterClosed: () => of(ContentPublishActionType.SINGLE),
    });
    component.updatePublishedState();
    expect(updateContentGroupSpy).toHaveBeenCalledWith(6, 6);
  });

  it('should publish contents up to current when updating published state and current content is not directly after range and option in dialog is selected', () => {
    const updateContentGroupSpy = spyOn(component, 'updateContentGroup');
    component.currentStep = 6;
    component.contentGroup.firstPublishedIndex = 2;
    component.contentGroup.lastPublishedIndex = 4;
    dialogService.openDialog.and.returnValue({
      afterClosed: () => of(ContentPublishActionType.UP_TO_HERE),
    });
    component.updatePublishedState();
    expect(updateContentGroupSpy).toHaveBeenCalledWith(2, 6);
  });

  // Lock

  it('should lock contents up to current when updating published state, current content is in middle of initial publishing and option is selected in dialog', () => {
    const updateContentGroupSpy = spyOn(component, 'updateContentGroup');
    component.currentStep = 3;
    component.contentGroup.firstPublishedIndex = 0;
    component.contentGroup.lastPublishedIndex = -1;
    dialogService.openDialog.and.returnValue({
      afterClosed: () => of(ContentPublishActionType.UP_TO_HERE),
    });
    component.updatePublishedState();
    expect(updateContentGroupSpy).toHaveBeenCalledWith(4, 6);
  });

  it('should lock contents from current when updating published state, current content is in middle of initial publishing and option is selected in dialog', () => {
    const updateContentGroupSpy = spyOn(component, 'updateContentGroup');
    component.currentStep = 3;
    component.contentGroup.firstPublishedIndex = 0;
    component.contentGroup.lastPublishedIndex = -1;
    dialogService.openDialog.and.returnValue({
      afterClosed: () => of(ContentPublishActionType.FROM_HERE),
    });
    component.updatePublishedState();
    expect(updateContentGroupSpy).toHaveBeenCalledWith(0, 2);
  });

  it('should lock all contents when updating published state and current content is the only published', () => {
    const updateContentGroupSpy = spyOn(component, 'updateContentGroup');
    component.currentStep = 0;
    component.contentGroup.firstPublishedIndex = 0;
    component.contentGroup.lastPublishedIndex = 0;
    component.updatePublishedState();
    expect(updateContentGroupSpy).toHaveBeenCalledWith(-1, -1);
  });

  it('should reduce published range to previous when updating published state and current content is last of published range', () => {
    const updateContentGroupSpy = spyOn(component, 'updateContentGroup');
    component.currentStep = 3;
    component.contentGroup.firstPublishedIndex = 0;
    component.contentGroup.lastPublishedIndex = 3;
    component.updatePublishedState();
    expect(updateContentGroupSpy).toHaveBeenCalledWith(0, 2);
  });

  it('should reduce published range to next when updating published state and current content is first of published range', () => {
    const updateContentGroupSpy = spyOn(component, 'updateContentGroup');
    component.currentStep = 0;
    component.contentGroup.firstPublishedIndex = 0;
    component.contentGroup.lastPublishedIndex = 3;
    component.updatePublishedState();
    expect(updateContentGroupSpy).toHaveBeenCalledWith(1, 3);
  });

  it('should ask for new range options with dialog when updating published state and current content is in middle of published range', () => {
    component.currentStep = 2;
    component.contentGroup.firstPublishedIndex = 0;
    component.contentGroup.lastPublishedIndex = 3;
    dialogService.openDialog.and.returnValue({
      afterClosed: () => of(undefined),
    });
    component.updatePublishedState();
    expect(dialogService.openDialog).toHaveBeenCalledWith(
      PublishContentComponent,
      {
        data: 'lock',
      }
    );
  });

  it('should lock contents up to current when updating published state, current content is in middle of all initially published contents and option is selected in dialog', () => {
    const updateContentGroupSpy = spyOn(component, 'updateContentGroup');
    component.currentStep = 2;
    component.contentGroup.firstPublishedIndex = 0;
    component.contentGroup.lastPublishedIndex = -1;
    dialogService.openDialog.and.returnValue({
      afterClosed: () => of(ContentPublishActionType.UP_TO_HERE),
    });
    component.updatePublishedState();
    expect(updateContentGroupSpy).toHaveBeenCalledWith(3, 6);
  });

  it('should lock contents up to last when updating published state, current content is in middle of published range and option is selected in dialog', () => {
    const updateContentGroupSpy = spyOn(component, 'updateContentGroup');
    component.currentStep = 2;
    component.contentGroup.firstPublishedIndex = 0;
    component.contentGroup.lastPublishedIndex = 3;
    dialogService.openDialog.and.returnValue({
      afterClosed: () => of(ContentPublishActionType.UP_TO_HERE),
    });
    component.updatePublishedState();
    expect(updateContentGroupSpy).toHaveBeenCalledWith(3, 3);
  });

  it('should lock contents from current when updating published state, current content is in middle of published range and option is selected in dialog', () => {
    const updateContentGroupSpy = spyOn(component, 'updateContentGroup');
    component.currentStep = 2;
    component.contentGroup.firstPublishedIndex = 0;
    component.contentGroup.lastPublishedIndex = 3;
    dialogService.openDialog.and.returnValue({
      afterClosed: () => of(ContentPublishActionType.FROM_HERE),
    });
    component.updatePublishedState();
    expect(updateContentGroupSpy).toHaveBeenCalledWith(0, 1);
  });
});
