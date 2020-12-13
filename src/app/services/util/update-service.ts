import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { TranslateService } from '@ngx-translate/core';
import { UpdateImportance, VersionInfo } from '../../models/version-info';
import { DialogService } from './dialog.service';
import { GlobalStorageService, STORAGE_KEYS } from './global-storage.service';
import { AdvancedSnackBarTypes, NotificationService } from './notification.service';

@Injectable()
export class UpdateService {
  constructor(
      private update: SwUpdate,
      private globalStorageService: GlobalStorageService,
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
    console.log(`Version info - current version, latest version, relevant versions, update importance:`,
        version, latestVersion, relevantVersions, importance);

    switch (importance) {
      case UpdateImportance.OPTIONAL: {
        /* Handle the update silently */
        this.update.available.subscribe(() => {
          this.handleUpdateReady(latestVersion);
        });
        return;
      }
      case UpdateImportance.MANDATORY: {
        /* Set the new version early just in case so the dialog is not shown
         * again forever after reloads if something goes wrong. */
        this.handleUpdateReady(latestVersion);
        /* Show the update dialog immediately */
        const dialogRef = this.dialogService.openUpdateInfoDialog(
            false, relevantVersions, this.update.available);
        dialogRef.afterClosed().subscribe(() => this.handleUpdateReady(latestVersion, true));
        break;
      }
      default: {
        /* Show the update dialog when the update is ready */
        this.update.available.subscribe(() => {
          const dialogRef = this.dialogService.openUpdateInfoDialog(
              false, relevantVersions);
          dialogRef.afterClosed().subscribe(() => this.handleUpdateReady(latestVersion, true));
        });
        break;
      }
    }
  }

  private handleUpdateReady(latestVersion: VersionInfo, activate?: boolean) {
    this.globalStorageService.setItem(STORAGE_KEYS.VERSION, latestVersion.id);
    if (activate) {
      this.globalStorageService.setItem(STORAGE_KEYS.UPDATED, true);
      this.window.location.reload();
    }
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
    const version = this.globalStorageService.getItem(STORAGE_KEYS.VERSION);
    return versionInfos.filter(vi => vi.id > version);
  }

  private determineUpdateImportance(versionInfos: VersionInfo[]) {
    const version = this.globalStorageService.getItem(STORAGE_KEYS.VERSION);
    if (!version || versionInfos.length === 0) {
      /* The local version is unknown. The app is loaded for the first time or the localStorage item was removed.
       * - or -
       * There are no version infos available. */
      return UpdateImportance.RECOMMENDED;
    }
    const relevantVersions = this.determineRelevantVersions(versionInfos);
    if (relevantVersions.length === versionInfos.length) {
      /* The client has not been updated for some time and older, mandatory
       * versions might have been purged from the server-side list. */
      return UpdateImportance.MANDATORY;
    }
    const importance = [UpdateImportance.OPTIONAL, UpdateImportance.RECOMMENDED, UpdateImportance.MANDATORY];
    return relevantVersions.reduce((acc, cur) => {
      return importance.indexOf(cur.importance) > importance.indexOf(acc) ? cur.importance : acc;
    }, UpdateImportance.OPTIONAL);
  }
}
