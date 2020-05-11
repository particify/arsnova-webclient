import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContentService } from '../../../services/http/content.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { Content } from '../../../models/content';
import { GlobalStorageService, LocalStorageKey, MemoryStorageKey } from '../../../services/util/global-storage.service';
import { RoomService } from '../../../services/http/room.service';

@Component({
  selector: 'app-statistic',
  templateUrl: './statistic.component.html',
  styleUrls: ['./statistic.component.scss']
})
export class StatisticComponent implements OnInit {


  contents: Content[];
  isLoading = true;

  constructor(
    protected route: ActivatedRoute,
    private roomService: RoomService,
    private contentService: ContentService,
    private translateService: TranslateService,
    protected langService: LanguageService,
    private globalStorageService: GlobalStorageService
  ) {
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  ngOnInit() {
    window.scroll(0, 0);
    this.translateService.use(this.globalStorageService.getLocalStorageItem(LocalStorageKey.LANGUAGE));
    this.route.data.subscribe(data => {
      const room = data.room;
      this.route.params.subscribe(params => {
        const collectionName = params['contentGroup'];
        this.globalStorageService.setMemoryItem(MemoryStorageKey.LAST_GROUP, collectionName);
        this.roomService.getGroupByRoomIdAndName(room.id, collectionName).subscribe(group => {
          this.contentService.getContentsByIds(group.contentIds).subscribe(contents => {
            this.contents = contents;
            this.isLoading = false;
            setTimeout(() => {
              document.getElementById('message-button').focus();
            }, 700);
          });
        });
      });
    });
  }
}
