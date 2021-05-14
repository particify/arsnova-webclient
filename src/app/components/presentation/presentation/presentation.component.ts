import { Component, EventEmitter, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { GlobalStorageService, STORAGE_KEYS } from '../../../services/util/global-storage.service';
import { RoomService } from '../../../services/http/room.service';
import { LanguageService } from '../../../services/util/language.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-presentation',
  templateUrl: './presentation.component.html',
  styleUrls: ['./presentation.component.scss']
})
export class PresentationComponent implements OnInit {

  shortId: string;
  roomId: string;
  lastGroup: string;
  featureString: string;
  groupChanged: EventEmitter<string> = new EventEmitter<string>();

  constructor(private route: ActivatedRoute,
              private router: Router,
              private location: Location,
              private globalStorageService: GlobalStorageService,
              private roomService: RoomService,
              private langService: LanguageService,
              private translateService: TranslateService) {
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  ngOnInit(): void {
    document.body.style.background = 'var(--surface)';
    this.translateService.use(this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE));
    this.route.params.subscribe(params => {
      this.shortId = params['shortId'];
      this.lastGroup = params['contentGroup'];
      this.route.data.subscribe(data => {
        this.featureString = data.feature;
        this.roomId = data.room.id;
        if (this.lastGroup === undefined) {
          this.lastGroup = this.globalStorageService.getItem(STORAGE_KEYS.LAST_GROUP);
          if (this.lastGroup === undefined) {
            this.roomService.getStats(this.roomId).subscribe(stats => {
              if (stats.groupStats) {
                this.lastGroup = stats.groupStats[0].groupName;
                this.setGroupInSessionStorage(this.lastGroup);
              }
            });
          }
        }
      })
    });
  }
  updateFeature(feature: string) {
    this.featureString = feature;
    this.updateUrl();
  }

  updateUrl(group?: string) {
    const isGroup = this.featureString === 'group';
    let feature =  isGroup ? group || this.lastGroup : this.featureString;
    if (group) {
      this.lastGroup = group;
      this.groupChanged.emit(group);
    }
    const urlList = ['presentation', this.shortId, feature];
    if (!feature) {
      urlList.pop();
    }
    const urlTree = this.router.createUrlTree(urlList);
    this.location.replaceState(this.router.serializeUrl(urlTree));
  }

  setGroupInSessionStorage(group: string) {
    this.globalStorageService.setItem(STORAGE_KEYS.LAST_GROUP, group);
  }
}
