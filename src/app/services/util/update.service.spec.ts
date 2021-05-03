import { TestBed } from '@angular/core/testing';
import { UpdateService } from './update.service';
import { Observable, Subject } from 'rxjs';
import { ServiceWorkerModule, SwUpdate, UpdateAvailableEvent } from '@angular/service-worker';
import { GlobalStorageService } from '@arsnova/app/services/util/global-storage.service';
import { EventService } from '@arsnova/app/services/util/event.service';
import { DialogService } from '@arsnova/app/services/util/dialog.service';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { UpdateImportance, VersionInfo } from '@arsnova/app/models/version-info';
import { Injectable } from '@angular/core';
import { UpdateInstalled } from '@arsnova/app/models/events/update-installed';
import { environment } from '@arsnova/environments/environment';
import { MockEventService } from '@arsnova/testing/test-helpers';

class MockDialogService {
  public openUpdateInfoDialog = jasmine.createSpy('OpenUpdateInfoDialogSpy').and.returnValue({
    afterClosed: () => new Subject()
  });
}

@Injectable()
class MockSwUpdate extends SwUpdate {
  private availableSubject = new Subject<UpdateAvailableEvent>();

  public available: Observable<UpdateAvailableEvent> = this.availableSubject.asObservable();
}

describe('UpdateService', () => {
  let service: UpdateService;
  let translateService: TranslateService;
  let dialogService: DialogService;
  let eventService: EventService;
  const globalStorageService = jasmine.createSpyObj('GlobalStorageService', ['setItem', 'getItem', 'removeItem']);
  const notificationService = jasmine.createSpyObj('NotificationService', ['showAdvanced']);
  const window = jasmine.createSpyObj('Window', ['reload']);

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: false })
      ],
      providers: [
        UpdateService,
        {
          provide: SwUpdate,
          useClass: MockSwUpdate
        },
        {
          provide: GlobalStorageService,
          useValue: globalStorageService
        },
        {
          provide: DialogService,
          useClass: MockDialogService
        },
        {
          provide: NotificationService,
          useValue: notificationService
        },
        {
          provide: Window,
          useValue: window
        },
        {
          provide: TranslateService,
          useValue: translateService
        },
        {
          provide: EventService,
          useClass: MockEventService
        }
      ]
    });
    service = TestBed.inject(UpdateService);
    translateService = TestBed.inject(TranslateService);
    dialogService = TestBed.inject(DialogService);
    eventService = TestBed.inject(EventService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open UpdateInfoDialog if latest version is of type "MANDATORY"', () => {
    const versions: VersionInfo[] = [
      {
        id: '100001',
        commitHash: '1111111111111111111111111111111111111111',
        importance: UpdateImportance.MANDATORY,
        changes: {
          en: [
            'a change entry'
          ]
        }
      },
      {
        id: '100000',
        commitHash: '0000000000000000000000000000000000000000',
        importance: UpdateImportance.RECOMMENDED,
        changes: {
          en: [
            'a change entry'
          ]
        }
      }
    ];
    const expectedRelevantVersions: VersionInfo[] = [
      {
        id: '100001',
        commitHash: '1111111111111111111111111111111111111111',
        importance: UpdateImportance.MANDATORY,
        changes: {
          en: [
            'a change entry'
          ]
        }
      }
    ];
    service.handleUpdate(versions);
    const updateEvent = new UpdateInstalled(
      '100001',
      '1111111111111111111111111111111111111111',
      '1111111111111111111111111111111111111111',
      environment.version.commitHash,
      UpdateImportance.MANDATORY,
      1);
    expect(service.importance).toBe(UpdateImportance.MANDATORY);
    expect(dialogService.openUpdateInfoDialog).toHaveBeenCalledWith(false, expectedRelevantVersions, jasmine.any(Observable));
  });

  it('should open UpdateInfoDialog if one of the versions not installed is of type "MANDATORY"', () => {
    const versions: VersionInfo[] = [
      {
        id: '100002',
        commitHash: '2222222222222222222222222222222222222222',
        importance: UpdateImportance.OPTIONAL,
        changes: {
          en: [
            'a change entry'
          ]
        }
      },
      {
        id: '100001',
        commitHash: '1111111111111111111111111111111111111111',
        importance: UpdateImportance.MANDATORY,
        changes: {
          en: [
            'a change entry'
          ]
        }
      }
    ];
    service.handleUpdate(versions);
    expect(service.importance).toBe(UpdateImportance.MANDATORY);
    expect(dialogService.openUpdateInfoDialog).toHaveBeenCalledWith(false, versions, jasmine.any(Observable));
  });

  it('should open UpdateInfoDialog if the version between "OPTIONAL" and "RECOMMENDED" of the versions not installed is of type' +
    '"MANDATORY"', () => {
    const versions: VersionInfo[] = [
      {
        id: '100003',
        commitHash: '2222222222222222222222222222222222222222',
        importance: UpdateImportance.OPTIONAL,
        changes: {
          en: [
            'a change entry'
          ]
        }
      },
      {
        id: '100002',
        commitHash: '1111111111111111111111111111111111111111',
        importance: UpdateImportance.MANDATORY,
        changes: {
          en: [
            'a change entry'
          ]
        }
      },
      {
        id: '100001',
        commitHash: '0000000000000000000000000000000000000000',
        importance: UpdateImportance.RECOMMENDED,
        changes: {
          en: [
            'a change entry'
          ]
        }
      }
    ];
    const expectedRelevantVersions: VersionInfo[] = [
      {
        id: '100003',
        commitHash: '2222222222222222222222222222222222222222',
        importance: UpdateImportance.OPTIONAL,
        changes: {
          en: [
            'a change entry'
          ]
        }
      },
      {
        id: '100002',
        commitHash: '1111111111111111111111111111111111111111',
        importance: UpdateImportance.MANDATORY,
        changes: {
          en: [
            'a change entry'
          ]
        }
      }
    ];
    service.handleUpdate(versions);
    expect(service.importance).toBe(UpdateImportance.MANDATORY);
    expect(dialogService.openUpdateInfoDialog).toHaveBeenCalledWith(false, expectedRelevantVersions, jasmine.any(Observable));
  });

  it('should subscribe to update event and open UpdateInfoDialog if latest version is of type "RECOMMENDED"', () => {
    const versions: VersionInfo[] = [
      {
        id: '100001',
        commitHash: '1111111111111111111111111111111111111111',
        importance: UpdateImportance.RECOMMENDED,
        changes: {
          en: [
            'a change entry'
          ]
        }
      },
      {
        id: '100000',
        commitHash: '0000000000000000000000000000000000000000',
        importance: UpdateImportance.OPTIONAL,
        changes: {
          en: [
            'a change entry'
          ]
        }
      }
    ];
    service.handleUpdate(versions);
    expect(service.importance).toBe(UpdateImportance.RECOMMENDED);
  });

  it('should subscribe to update event and open UpdateInfoDialog if one of the versions not installed is of' +
    'type "RECOMMENDED"', () => {
    const versions: VersionInfo[] = [
      {
        id: '100002',
        commitHash: '2222222222222222222222222222222222222222',
        importance: UpdateImportance.OPTIONAL,
        changes: {
          en: [
            'a change entry'
          ]
        }
      },
      {
        id: '100001',
        commitHash: '1111111111111111111111111111111111111111',
        importance: UpdateImportance.RECOMMENDED,
        changes: {
          en: [
            'a change entry'
          ]
        }
      },
      {
        id: '100000',
        commitHash: '0000000000000000000000000000000000000000',
        importance: UpdateImportance.OPTIONAL,
        changes: {
          en: [
            'a change entry'
          ]
        }
      }
    ];
    service.handleUpdate(versions);
    expect(service.importance).toBe(UpdateImportance.RECOMMENDED);
  });

  it('should subscribe to update event silently if latest version is of type "OPTIONAL"', () => {
    const versions: VersionInfo[] = [
      {
        id: '100001',
        commitHash: '1111111111111111111111111111111111111111',
        importance: UpdateImportance.OPTIONAL,
        changes: {
          en: [
            'a change entry'
          ]
        }
      },
      {
        id: '100000',
        commitHash: '0000000000000000000000000000000000000000',
        importance: UpdateImportance.RECOMMENDED,
        changes: {
          en: [
            'a change entry'
          ]
        }
      }
    ];
    service.handleUpdate(versions);
    expect(service.importance).toBe(UpdateImportance.OPTIONAL);
    expect(dialogService.openUpdateInfoDialog).not.toHaveBeenCalled();
  });

  it('should subscribe to update event silently if latest versions are of type "OPTIONAL"', () => {
    const versions: VersionInfo[] = [
      {
        id: '100002',
        commitHash: '2222222222222222222222222222222222222222',
        importance: UpdateImportance.OPTIONAL,
        changes: {
          en: [
            'a change entry'
          ]
        }
      },
      {
        id: '100001',
        commitHash: '1111111111111111111111111111111111111111',
        importance: UpdateImportance.OPTIONAL,
        changes: {
          en: [
            'a change entry'
          ]
        }
      },
      {
        id: '100000',
        commitHash: '0000000000000000000000000000000000000000',
        importance: UpdateImportance.RECOMMENDED,
        changes: {
          en: [
            'a change entry'
          ]
        }
      }
    ];
    service.handleUpdate(versions);
    expect(service.importance).toBe(UpdateImportance.OPTIONAL);
    expect(dialogService.openUpdateInfoDialog).not.toHaveBeenCalled();
  });
});

