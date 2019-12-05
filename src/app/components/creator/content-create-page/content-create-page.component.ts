import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { RoomService } from '../../../services/http/room.service';
import { ActivatedRoute } from '@angular/router';
import { ContentGroup } from '../../../models/content-group';
import { RoomStats } from '../../../models/room-stats';

@Component({
  selector: 'app-content-create-page',
  templateUrl: './content-create-page.component.html',
  styleUrls: ['./content-create-page.component.scss']
})
export class ContentCreatePageComponent implements OnInit {

  roomStats: RoomStats;
  contentGroups: ContentGroup[] = [];
  lastCollection: string;

  constructor(private translateService: TranslateService,
              protected langService: LanguageService,
              protected roomService: RoomService,
              protected route: ActivatedRoute) {
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  ngOnInit() {
    this.translateService.use(sessionStorage.getItem('currentLang'));
    this.route.params.subscribe(params => {
      this.getGroups(params['shortId']);
    });
  }

  getGroups(id: string): void {
    this.contentGroups = JSON.parse(sessionStorage.getItem('emptyGroups'));
    this.roomService.getRoomByShortId(id).subscribe(room => {
      this.roomService.getStats(room.id).subscribe(roomStats => {
        this.roomStats = roomStats;
        if (roomStats.groupStats) {
          for (const groupStats of roomStats.groupStats) {
            this.roomService.getGroupByRoomIdAndName(room.id, groupStats.groupName).subscribe(group => {
              this.contentGroups.push(group);
            });
          }
        }
      });
    });
    this.lastCollection = sessionStorage.getItem('collection');
  }
}
