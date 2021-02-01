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
  const globalStorageService = jasmine.createSpyObj('GlobalStorageService', ['setItem', 'getItem', 'removeItem']);
  const eventService = jasmine.createSpyObj('EventService', ['broadcast']);
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
          provide: EventService,
          useValue: eventService
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
        }
      ]
    });
    service = TestBed.inject(UpdateService);
    translateService = TestBed.inject(TranslateService);
    dialogService = TestBed.inject(DialogService);
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
    expect(service.importance).toBe(UpdateImportance.MANDATORY);
    expect(dialogService.openUpdateInfoDialog).toHaveBeenCalledWith(false, expectedRelevantVersions, service.updateReady$);
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
    expect(dialogService.openUpdateInfoDialog).toHaveBeenCalledWith(false, versions, service.updateReady$);
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
    expect(dialogService.openUpdateInfoDialog).toHaveBeenCalledWith(false, expectedRelevantVersions, service.updateReady$);
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

