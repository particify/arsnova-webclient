import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { GlobalStorageService, STORAGE_KEYS } from '../../../services/util/global-storage.service';
import { RoomStatsService } from '../../../services/http/room-stats.service';
import { LanguageService } from '../../../services/util/language.service';
import { TranslateService } from '@ngx-translate/core';
import { Features } from '../../../models/features.enum';

@Component({
  selector: 'app-presentation',
  templateUrl: './presentation.component.html',
  styleUrls: ['./presentation.component.scss']
})
export class PresentationComponent implements OnInit, OnDestroy {

  shortId: string;
  roomId: string;
  passwordProtected: boolean;
  lastGroup: string;
  featureString: string;
  groupChanged: EventEmitter<string> = new EventEmitter<string>();

  constructor(private route: ActivatedRoute,
              private router: Router,
              private location: Location,
              private globalStorageService: GlobalStorageService,
              private roomStatsService: RoomStatsService,
              protected langService: LanguageService,
              private translateService: TranslateService) {
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  ngOnInit(): void {
    document.body.style.background = 'var(--surface)';
    this.translateService.use(this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE));
    const params = this.route.snapshot.params;
    this.shortId = params['shortId'];
    this.lastGroup = params['seriesName'];
    this.route.data.subscribe(data => {
      this.featureString = data.feature;
      this.roomId = data.room.id;
      this.passwordProtected = data.room.passwordProtected;
      if (this.lastGroup === undefined) {
        this.lastGroup = this.globalStorageService.getItem(STORAGE_KEYS.LAST_GROUP);
        if (this.lastGroup === undefined) {
          this.roomStatsService.getStats(this.roomId, true).subscribe(stats => {
            if (stats.groupStats) {
              this.lastGroup = stats.groupStats[0].groupName;
              this.setGroupInSessionStorage(this.lastGroup);
            }
          });
        }
      }
      setTimeout(() => {
        document.getElementById('welcome-message').focus();
      }, 500);
    });
  }

  ngOnDestroy(): void {
    this.globalStorageService.removeItem(STORAGE_KEYS.LAST_INDEX);
  }

  updateFeature(feature: string) {
    this.featureString = feature;
    this.updateUrl();
  }

  updateUrl(group?: string) {
    const isGroup = this.featureString === Features.CONTENTS;
    if (group) {
      this.lastGroup = group;
      this.groupChanged.emit(group);
      this.globalStorageService.removeItem(STORAGE_KEYS.LAST_INDEX);
    }
    const urlList = ['present', this.shortId];
    if (this.featureString) {
      urlList.push(this.featureString);
      if (isGroup) {
        const groupName = group || this.lastGroup;
        urlList.push(groupName);
      }
    } else {
      document.getElementById('welcome-message').focus();
    }
    const urlTree = this.router.createUrlTree(urlList);
    this.location.replaceState(this.router.serializeUrl(urlTree));
  }

  setGroupInSessionStorage(group: string) {
    this.globalStorageService.setItem(STORAGE_KEYS.LAST_GROUP, group);
  }
}
