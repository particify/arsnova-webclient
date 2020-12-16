import { Injectable } from '@angular/core';
import { SwUpdate, UpdateAvailableEvent } from '@angular/service-worker';
import { TranslateService } from '@ngx-translate/core';
import { tap } from 'rxjs/operators';
import { UpdateInstalled } from '../../models/events/update-installed';
import { UpdateImportance, VersionInfo } from '../../models/version-info';
import { DialogService } from './dialog.service';
import { EventService } from './event.service';
import { GlobalStorageService, STORAGE_KEYS } from './global-storage.service';
import { AdvancedSnackBarTypes, NotificationService } from './notification.service';

interface LocalVersionInfo {
  installed: string;
  latest: string;
  hash: string;
}

@Injectable()
export class UpdateService {
  constructor(
      private update: SwUpdate,
      private globalStorageService: GlobalStorageService,
      private eventService: EventService,
      private dialogService: DialogService,
      private notificationService: NotificationService,
      private translationService: TranslateService,
      private window: Window) {
  }

  public handleUpdate(versionInfos: VersionInfo[] = []) {
    this.handleUpdateCompleted();
    const version = this.globalStorageService.getItem(STORAGE_KEYS.VERSION);
    const latestVersion = this.determineLatestVersion(versionInfos);
    const relevantVersions = this.determineRelevantVersions(versionInfos);
    const importance = this.determineUpdateImportance(versionInfos);
    console.log(`Version info - local version info, latest version info, relevant versions, update importance:`,
        version, latestVersion, relevantVersions, importance);

    const updateReady$ = this.update.available.pipe(tap(event => {
      this.handleUpdateReady(event, latestVersion, importance);
    }));

    switch (importance) {
      case UpdateImportance.OPTIONAL: {
        /* Handle the update silently */
        updateReady$.subscribe();
        return;
      }
      case UpdateImportance.MANDATORY: {
        /* Show the update dialog immediately */
        const dialogRef = this.dialogService.openUpdateInfoDialog(
            false, relevantVersions, updateReady$);
        dialogRef.afterClosed().subscribe(() => this.handleUpdateConfirmed());
        break;
      }
      default: {
        /* Show the update dialog when the update is ready */
        updateReady$.subscribe(() => {
          const dialogRef = this.dialogService.openUpdateInfoDialog(
              false, relevantVersions);
          dialogRef.afterClosed().subscribe(() => this.handleUpdateConfirmed());
        });
        break;
      }
    }
  }

  private handleUpdateReady(event: UpdateAvailableEvent, latestVersion: VersionInfo, importance: UpdateImportance) {
    const previousLocalVersion = this.globalStorageService.getItem(STORAGE_KEYS.VERSION) as LocalVersionInfo;
    const localVersion: LocalVersionInfo = {
      installed: latestVersion.id,
      latest: latestVersion.id,
      hash: event.available.hash
    };
    this.globalStorageService.setItem(STORAGE_KEYS.VERSION, localVersion);
    this.globalStorageService.setItem(STORAGE_KEYS.UPDATED, true);
    const updateEvent = new UpdateInstalled(
        localVersion.installed,
        localVersion.hash,
        previousLocalVersion.installed,
        previousLocalVersion.hash,
        importance);
    this.eventService.broadcast(updateEvent);
  }

  public handleUpdateConfirmed() {
    this.window.location.reload();
  }

  private handleUpdateCompleted() {
    if (this.globalStorageService.getItem(STORAGE_KEYS.UPDATED)) {
      this.globalStorageService.removeItem(STORAGE_KEYS.UPDATED);
      this.translationService.get('home-page.update-successful').subscribe(msg => {
        this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
      });
    }
  }

  private determineLatestVersion(versionInfos: VersionInfo[]) {
    return versionInfos.reduce((acc, cur) => {
      return cur.id > acc?.id ? cur : acc;
    }, null);
  }

  private determineRelevantVersions(versionInfos: VersionInfo[]) {
    const version = this.globalStorageService.getItem(STORAGE_KEYS.VERSION) as LocalVersionInfo;
    const installed = version?.installed ?? null;
    return versionInfos.filter(vi => vi.id > installed);
  }

  private determineUpdateImportance(versionInfos: VersionInfo[]) {
    const version = this.globalStorageService.getItem(STORAGE_KEYS.VERSION) as LocalVersionInfo;
    if (!version || versionInfos.length === 0) {
      /* The local version is unknown. The app is loaded for the first time or the localStorage item was removed.
       * - or -
       * There are no version infos available. */
      return UpdateImportance.RECOMMENDED;
    }
    const latest = version?.latest ?? null;
    const relevantVersions = this.determineRelevantVersions(versionInfos);
    if (relevantVersions.length === versionInfos.length) {
      /* The client has not been updated for some time and older, mandatory
       * versions might have been purged from the server-side list. */
      return UpdateImportance.MANDATORY;
    }
    /* Reduce importance of versions to RECOMMENDED if the client already about
     * their existence. This is the case if the app is reloaded after the local
     * info about the latest version has been updated locally. This is done as
     * a precaution so the forced update dialog can be bypassed if something
     * went wrong. */
    relevantVersions.forEach(v => {
      if (v.importance === UpdateImportance.MANDATORY && v.id <= latest) {
        v.importance = UpdateImportance.RECOMMENDED;
      }
    });
    const importance = [UpdateImportance.OPTIONAL, UpdateImportance.RECOMMENDED, UpdateImportance.MANDATORY];
    return relevantVersions.reduce((acc, cur) => {
      return importance.indexOf(cur.importance) > importance.indexOf(acc) ? cur.importance : acc;
    }, UpdateImportance.OPTIONAL);
  }
}
