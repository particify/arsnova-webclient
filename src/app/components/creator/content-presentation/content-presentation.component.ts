import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContentService } from '../../../services/http/content.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { Content } from '../../../models/content';
import { GlobalStorageService, STORAGE_KEYS } from '../../../services/util/global-storage.service';
import { RoomService } from '../../../services/http/room.service';
import { StepperComponent } from '../../shared/stepper/stepper.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-content-presentation',
  templateUrl: './content-presentation.component.html',
  styleUrls: ['./content-presentation.component.scss']
})
export class ContentPresentationComponent implements OnInit {

  @ViewChild(StepperComponent) stepper: StepperComponent;

  contents: Content[];
  isLoading = true;
  entryIndex = 0;
  contentIndex = 0;
  shortId: number;
  contentGroupName: string;
  currentStep = 0;

  constructor(
    protected route: ActivatedRoute,
    private roomService: RoomService,
    private contentService: ContentService,
    private translateService: TranslateService,
    protected langService: LanguageService,
    private globalStorageService: GlobalStorageService,
    private location: Location
  ) {
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  ngOnInit() {
    window.scroll(0, 0);
    this.translateService.use(this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE));
    this.route.params.subscribe(params => {
      this.entryIndex = params['contentIndex'] - 1;
    });
    this.route.data.subscribe(data => {
      const room = data.room;
      this.shortId = room.shortId;
      this.route.params.subscribe(params => {
        this.contentGroupName = params['contentGroup'];
        this.globalStorageService.setItem(STORAGE_KEYS.LAST_GROUP, this.contentGroupName);
        this.roomService.getGroupByRoomIdAndName(room.id, this.contentGroupName).subscribe(group => {
          this.contentService.getContentsByIds(group.roomId, group.contentIds).subscribe(contents => {
            this.contents = this.contentService.getSupportedContents(contents);
            this.isLoading = false;
            if (this.entryIndex) {
              this.contentIndex = this.entryIndex;
              this.currentStep = this.contentIndex;
              setTimeout(() => {
                this.stepper.init(this.contentIndex, this.contents.length);
              }, 100);
            }
            setTimeout(() => {
              document.getElementById('message-button').focus();
            }, 700);
          });
        });
      });
    });
  }

  updateURL(index: number) {
    this.currentStep = index;
    this.location.replaceState(`creator/room/${this.shortId}/group/${this.contentGroupName}/statistics/${index + 1}`);
    if (this.contentIndex !== this.entryIndex) {
      this.contentIndex = null;
    }
  }
}
