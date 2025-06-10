import { UpdateService } from './update.service';
import { Observable, Subject } from 'rxjs';
import {
  ServiceWorkerModule,
  SwUpdate,
  VersionReadyEvent,
} from '@angular/service-worker';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import { TranslocoService } from '@jsverse/transloco';
import { UpdateImportance, VersionInfo } from '@app/core/models/version-info';
import { Injectable } from '@angular/core';
import { configureTestModule } from '@testing/test.setup';

class MockDialogService {
  public openUpdateInfoDialog = jasmine
    .createSpy('OpenUpdateInfoDialogSpy')
    .and.returnValue({
      afterClosed: () => new Subject(),
    });
}

@Injectable()
class MockSwUpdate extends SwUpdate {
  private versionUpdatesSubject = new Subject<VersionReadyEvent>();

  public versionUpdates: Observable<VersionReadyEvent> =
    this.versionUpdatesSubject.asObservable();
}

describe('UpdateService', () => {
  let service: UpdateService;
  let translateService: TranslocoService;
  let dialogService: DialogService;
  const globalStorageService = jasmine.createSpyObj('GlobalStorageService', [
    'setItem',
    'getItem',
    'removeItem',
  ]);

  const window = jasmine.createSpyObj('Window', ['reload']);

  beforeEach(() => {
    const testBed = configureTestModule(
      [ServiceWorkerModule.register('ngsw-worker.js', { enabled: false })],
      [
        UpdateService,
        {
          provide: SwUpdate,
          useClass: MockSwUpdate,
        },
        {
          provide: GlobalStorageService,
          useValue: globalStorageService,
        },
        {
          provide: DialogService,
          useClass: MockDialogService,
        },
        {
          provide: Window,
          useValue: window,
        },
        {
          provide: TranslocoService,
          useValue: translateService,
        },
      ]
    );
    service = testBed.inject(UpdateService);
    translateService = testBed.inject(TranslocoService);
    dialogService = testBed.inject(DialogService);
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
          en: ['a change entry'],
        },
      },
      {
        id: '100000',
        commitHash: '0000000000000000000000000000000000000000',
        importance: UpdateImportance.RECOMMENDED,
        changes: {
          en: ['a change entry'],
        },
      },
    ];
    const expectedRelevantVersions: VersionInfo[] = [
      {
        id: '100001',
        commitHash: '1111111111111111111111111111111111111111',
        importance: UpdateImportance.MANDATORY,
        changes: {
          en: ['a change entry'],
        },
      },
    ];
    service.handleUpdate(versions);
    expect(service.importance).toBe(UpdateImportance.MANDATORY);
    expect(dialogService.openUpdateInfoDialog).toHaveBeenCalledWith(
      false,
      expectedRelevantVersions,
      jasmine.any(Observable)
    );
  });

  it('should open UpdateInfoDialog if one of the versions not installed is of type "MANDATORY"', () => {
    const versions: VersionInfo[] = [
      {
        id: '100002',
        commitHash: '2222222222222222222222222222222222222222',
        importance: UpdateImportance.OPTIONAL,
        changes: {
          en: ['a change entry'],
        },
      },
      {
        id: '100001',
        commitHash: '1111111111111111111111111111111111111111',
        importance: UpdateImportance.MANDATORY,
        changes: {
          en: ['a change entry'],
        },
      },
    ];
    service.handleUpdate(versions);
    expect(service.importance).toBe(UpdateImportance.MANDATORY);
    expect(dialogService.openUpdateInfoDialog).toHaveBeenCalledWith(
      false,
      versions,
      jasmine.any(Observable)
    );
  });

  it(
    'should open UpdateInfoDialog if the version between "OPTIONAL" and "RECOMMENDED" of the versions not installed is of type' +
      '"MANDATORY"',
    () => {
      const versions: VersionInfo[] = [
        {
          id: '100003',
          commitHash: '2222222222222222222222222222222222222222',
          importance: UpdateImportance.OPTIONAL,
          changes: {
            en: ['a change entry'],
          },
        },
        {
          id: '100002',
          commitHash: '1111111111111111111111111111111111111111',
          importance: UpdateImportance.MANDATORY,
          changes: {
            en: ['a change entry'],
          },
        },
        {
          id: '100001',
          commitHash: '0000000000000000000000000000000000000000',
          importance: UpdateImportance.RECOMMENDED,
          changes: {
            en: ['a change entry'],
          },
        },
      ];
      const expectedRelevantVersions: VersionInfo[] = [
        {
          id: '100003',
          commitHash: '2222222222222222222222222222222222222222',
          importance: UpdateImportance.OPTIONAL,
          changes: {
            en: ['a change entry'],
          },
        },
        {
          id: '100002',
          commitHash: '1111111111111111111111111111111111111111',
          importance: UpdateImportance.MANDATORY,
          changes: {
            en: ['a change entry'],
          },
        },
      ];
      service.handleUpdate(versions);
      expect(service.importance).toBe(UpdateImportance.MANDATORY);
      expect(dialogService.openUpdateInfoDialog).toHaveBeenCalledWith(
        false,
        expectedRelevantVersions,
        jasmine.any(Observable)
      );
    }
  );

  it('should subscribe to update event and open UpdateInfoDialog if latest version is of type "RECOMMENDED"', () => {
    const versions: VersionInfo[] = [
      {
        id: '100001',
        commitHash: '1111111111111111111111111111111111111111',
        importance: UpdateImportance.RECOMMENDED,
        changes: {
          en: ['a change entry'],
        },
      },
      {
        id: '100000',
        commitHash: '0000000000000000000000000000000000000000',
        importance: UpdateImportance.OPTIONAL,
        changes: {
          en: ['a change entry'],
        },
      },
    ];
    service.handleUpdate(versions);
    expect(service.importance).toBe(UpdateImportance.RECOMMENDED);
  });

  it(
    'should subscribe to update event and open UpdateInfoDialog if one of the versions not installed is of' +
      'type "RECOMMENDED"',
    () => {
      const versions: VersionInfo[] = [
        {
          id: '100002',
          commitHash: '2222222222222222222222222222222222222222',
          importance: UpdateImportance.OPTIONAL,
          changes: {
            en: ['a change entry'],
          },
        },
        {
          id: '100001',
          commitHash: '1111111111111111111111111111111111111111',
          importance: UpdateImportance.RECOMMENDED,
          changes: {
            en: ['a change entry'],
          },
        },
        {
          id: '100000',
          commitHash: '0000000000000000000000000000000000000000',
          importance: UpdateImportance.OPTIONAL,
          changes: {
            en: ['a change entry'],
          },
        },
      ];
      service.handleUpdate(versions);
      expect(service.importance).toBe(UpdateImportance.RECOMMENDED);
    }
  );

  it('should subscribe to update event silently if latest version is of type "OPTIONAL"', () => {
    const versions: VersionInfo[] = [
      {
        id: '100001',
        commitHash: '1111111111111111111111111111111111111111',
        importance: UpdateImportance.OPTIONAL,
        changes: {
          en: ['a change entry'],
        },
      },
      {
        id: '100000',
        commitHash: '0000000000000000000000000000000000000000',
        importance: UpdateImportance.RECOMMENDED,
        changes: {
          en: ['a change entry'],
        },
      },
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
          en: ['a change entry'],
        },
      },
      {
        id: '100001',
        commitHash: '1111111111111111111111111111111111111111',
        importance: UpdateImportance.OPTIONAL,
        changes: {
          en: ['a change entry'],
        },
      },
      {
        id: '100000',
        commitHash: '0000000000000000000000000000000000000000',
        importance: UpdateImportance.RECOMMENDED,
        changes: {
          en: ['a change entry'],
        },
      },
    ];
    service.handleUpdate(versions);
    expect(service.importance).toBe(UpdateImportance.OPTIONAL);
    expect(dialogService.openUpdateInfoDialog).not.toHaveBeenCalled();
  });
});
