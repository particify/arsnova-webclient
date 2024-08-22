import { Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { TranslocoService } from '@jsverse/transloco';
import { filter, take, tap } from 'rxjs/operators';
import { UpdateInstalled } from '@app/core/models/events/update-installed';
import { UpdateImportance, VersionInfo } from '@app/core/models/version-info';
import { DialogService } from './dialog.service';
import { EventService } from './event.service';
import { GlobalStorageService, STORAGE_KEYS } from './global-storage.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from './notification.service';
import { environment } from '@environments/environment';

@Injectable()
export class UpdateService {
  constructor(
    private update: SwUpdate,
    private globalStorageService: GlobalStorageService,
    private eventService: EventService,
    private dialogService: DialogService,
    private notificationService: NotificationService,
    private translationService: TranslocoService,
    private window: Window
  ) {
    console.log(
      'Version:',
      environment.version.commitHash,
      environment.version.commitDate
    );
  }

  importance = UpdateImportance.OPTIONAL;

  public handleUpdate(versionInfos: VersionInfo[] = []) {
    const currentVersion = this.selectVersionByHash(
      versionInfos,
      environment.version.commitHash
    );
    this.handleUpdateCompleted(currentVersion);
    const latestVersion = this.determineLatestVersion(versionInfos);
    const relevantVersions = this.determineRelevantVersions(
      versionInfos,
      currentVersion
    );
    this.importance = this.determineUpdateImportance(
      versionInfos,
      currentVersion
    );
    if (relevantVersions.length > 0) {
      console.log(
        'Update announced:',
        latestVersion.commitHash,
        latestVersion.importance
      );
      console.log(
        'Skipped updates:',
        relevantVersions.length - 1,
        this.importance
      );
      this.globalStorageService.setItem(
        STORAGE_KEYS.LATEST_ANNOUNCED_VERSION,
        latestVersion.commitHash
      );
    } else {
      console.log('No updates announced.');
    }

    const updateReady$ = this.update.versionUpdates.pipe(
      filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'),
      tap(() =>
        this.handleUpdateReady(currentVersion, latestVersion, this.importance)
      )
    );

    switch (this.importance) {
      case UpdateImportance.OPTIONAL: {
        /* Handle the update silently */
        updateReady$.subscribe();
        return;
      }
      case UpdateImportance.MANDATORY: {
        /* Show the update dialog immediately */
        const dialogRef = this.dialogService.openUpdateInfoDialog(
          false,
          relevantVersions,
          updateReady$
        );
        dialogRef.afterClosed().subscribe(() => this.handleUpdateConfirmed());
        break;
      }
      default: {
        /* Show the update dialog when the update is ready */
        updateReady$.subscribe(() => {
          const dialogRef = this.dialogService.openUpdateInfoDialog(
            false,
            relevantVersions
          );
          dialogRef.afterClosed().subscribe(() => this.handleUpdateConfirmed());
        });
        break;
      }
    }
  }

  private handleUpdateReady(
    currentVersion: VersionInfo | undefined,
    latestVersion: VersionInfo,
    importance: UpdateImportance
  ) {
    const loadTime = window.performance?.now();
    this.globalStorageService.setItem(STORAGE_KEYS.UPDATED, true);
    const updateEvent = new UpdateInstalled(
      latestVersion?.id ?? '',
      latestVersion?.commitHash ?? '',
      currentVersion?.id ?? '',
      environment.version.commitHash,
      importance,
      loadTime
    );
    this.eventService.broadcast(updateEvent.type, updateEvent.payload);
  }

  public handleUpdateConfirmed() {
    this.window.location.reload();
  }

  private handleUpdateCompleted(version?: VersionInfo) {
    if (this.globalStorageService.getItem(STORAGE_KEYS.UPDATED)) {
      this.globalStorageService.removeItem(STORAGE_KEYS.UPDATED);
      this.translationService
        .selectTranslate('home-page.update-successful')
        .pipe(take(1))
        .subscribe((msg) => {
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.SUCCESS
          );
        });
      const updateEvent = new UpdateInstalled(
        version?.id ?? '',
        environment.version.commitHash,
        '',
        '',
        UpdateImportance.OPTIONAL,
        0
      );
      this.eventService.broadcast(updateEvent.type, updateEvent.payload);
    }
  }

  private selectVersionByHash(versionInfos: VersionInfo[], hash: string) {
    return versionInfos.find((vi) => vi.commitHash === hash);
  }

  private determineLatestVersion(versionInfos: VersionInfo[]) {
    return versionInfos.reduce((acc, cur) => {
      return cur.id > acc.id ? cur : acc;
    }, versionInfos[0]);
  }

  private determineRelevantVersions(
    versionInfos: VersionInfo[],
    currentVersion?: VersionInfo
  ) {
    return versionInfos.filter((vi) => vi.id > (currentVersion?.id ?? 0));
  }

  private determineUpdateImportance(
    versionInfos: VersionInfo[],
    currentVersion?: VersionInfo
  ) {
    if (versionInfos.length === 0) {
      /* There are no version infos available. */
      return UpdateImportance.RECOMMENDED;
    }
    const latestAnnouncedVersionHash = this.globalStorageService.getItem(
      STORAGE_KEYS.LATEST_ANNOUNCED_VERSION
    );
    const latestAnnouncedVersionId =
      this.selectVersionByHash(versionInfos, latestAnnouncedVersionHash)?.id ??
      0;
    const latestVersion = this.determineLatestVersion(versionInfos);
    const relevantVersions = this.determineRelevantVersions(
      versionInfos,
      currentVersion
    );
    if (
      relevantVersions.length === versionInfos.length &&
      latestVersion?.commitHash !== latestAnnouncedVersionHash
    ) {
      /* The client has not been updated for some time and older, mandatory
       * versions might have been purged from the server-side list. */
      return UpdateImportance.MANDATORY;
    }
    /* Reduce importance of versions to RECOMMENDED if the client already about
     * their existence. This is the case if the app is reloaded after the local
     * info about the latest version has been updated locally. This is done as
     * a precaution so the forced update dialog can be bypassed if something
     * went wrong.
     * Then return the highest importance in from the list. */
    const importance = [
      UpdateImportance.OPTIONAL,
      UpdateImportance.RECOMMENDED,
      UpdateImportance.MANDATORY,
    ];
    return relevantVersions
      .map((v) =>
        v.importance === UpdateImportance.MANDATORY &&
        v.id <= latestAnnouncedVersionId
          ? UpdateImportance.RECOMMENDED
          : v.importance
      )
      .reduce((acc, cur) => {
        return importance.indexOf(cur) > importance.indexOf(acc) ? cur : acc;
      }, UpdateImportance.OPTIONAL);
  }
}
