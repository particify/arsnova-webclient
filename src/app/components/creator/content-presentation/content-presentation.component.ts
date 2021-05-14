import { Component, EventEmitter, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentService } from '../../../services/http/content.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { Content } from '../../../models/content';
import { GlobalStorageService, STORAGE_KEYS } from '../../../services/util/global-storage.service';
import { RoomService } from '../../../services/http/room.service';
import { StepperComponent } from '../../shared/stepper/stepper.component';
import { Location } from '@angular/common';
import { ContentGroupService } from '../../../services/http/content-group.service';
import { InfoBarItem } from '../../shared/bars/info-bar/info-bar.component';

@Component({
  selector: 'app-content-presentation',
  templateUrl: './content-presentation.component.html',
  styleUrls: ['./content-presentation.component.scss']
})
export class ContentPresentationComponent implements OnInit {

  @Input() isPresentation = false;
  @Input() groupChanged: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild(StepperComponent) stepper: StepperComponent;

  contents: Content[];
  isLoading = true;
  entryIndex = 0;
  contentIndex = 0;
  shortId: number;
  roomId: string;
  contentGroupName: string;
  currentStep = 0;
  infoBarItems: InfoBarItem[] = [];
  routeChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    protected route: ActivatedRoute,
    private roomService: RoomService,
    private contentService: ContentService,
    private contentGroupService: ContentGroupService,
    private translateService: TranslateService,
    protected langService: LanguageService,
    private globalStorageService: GlobalStorageService,
    private location: Location,
    private router: Router
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
      this.roomId = data.room.id;
      this.shortId = data.room.shortId;
      this.route.params.subscribe(params => {
        this.contentGroupName = params['contentGroup'] || this.globalStorageService.getItem(STORAGE_KEYS.LAST_GROUP);
        this.globalStorageService.setItem(STORAGE_KEYS.LAST_GROUP, this.contentGroupName);
        this.initGroup();
      });
    });
    if (this.isPresentation) {
      this.groupChanged.subscribe(group => {
        this.contentGroupName = group;
        this.initGroup()
      })
    }
  }

  initScale() {
    if (this.isPresentation) {
      const scale = Math.min(innerWidth, 2100)  / 960;
      document.getElementById('stepper-container').style.transform = `scale(${scale})`;
      document.getElementById('stepper-container').style.left = `calc(50vw - calc(300px * ${scale})`;
      document.getElementById('stepper-container').style.top = `calc(4vw - calc(1em * ${scale}))`;
    }
  }

  initGroup() {
    this.contentGroupService.getByRoomIdAndName(this.roomId, this.contentGroupName).subscribe(group => {
      this.contentService.getContentsByIds(group.roomId, group.contentIds, true).subscribe(contents => {
        this.contents = this.contentService.getSupportedContents(contents);
        this.isLoading = false;
        this.initScale();
        if (this.entryIndex) {
          this.contentIndex = this.entryIndex;
          this.currentStep = this.contentIndex;
          setTimeout(() => {
            this.stepper.init(this.contentIndex, this.contents.length);
          }, 100);
        }
        setTimeout(() => {
          document.getElementById('presentation-message').focus();
        }, 700);
      });
    });
  }

  updateURL(index: number) {
    this.currentStep = index;
    let urlTree;
    if (this.isPresentation) {
      urlTree = this.router.createUrlTree(['presentation', this.shortId, this.contentGroupName, index + 1]);
    } else {
      urlTree = this.router.createUrlTree(['creator/room', this.shortId, 'group', this.contentGroupName, 'statistics', index + 1]);
    }
    this.location.replaceState(this.router.serializeUrl(urlTree));
    if (index !== this.entryIndex) {
      this.contentIndex = null;
    }
    this.routeChanged.emit(true);
    setTimeout(() => {
      document.getElementById('message-button').focus();
    }, 300);
  }

  updateCounter($event, isActive) {
    if (isActive) {
      if (this.infoBarItems.length > 0) {
        this.infoBarItems[0].count = $event;
      } else {
        this.infoBarItems.push(new InfoBarItem('content-counter', 'people', $event));
      }
    }
  }
}
