import { AfterContentInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ContentType } from '../../../models/content-type.enum';
import { ContentService } from '../../../services/http/content.service';
import { Content } from '../../../models/content';
import { ContentGroup } from '../../../models/content-group';
import { TranslateService } from '@ngx-translate/core';
import { StepperComponent } from '../../shared/stepper/stepper.component';
import { ActivatedRoute } from '@angular/router';
import { RoomService } from '../../../services/http/room.service';
import { KeyboardUtils } from '../../../utils/keyboard';
import { KeyboardKey } from '../../../utils/keyboard/keys';
import { GlobalStorageService, STORAGE_KEYS } from '../../../services/util/global-storage.service';
import { AnnounceService } from '../../../services/util/announce.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-participant-content-carousel-page',
  templateUrl: './participant-content-carousel-page.component.html',
  styleUrls: ['./participant-content-carousel-page.component.scss']
})
export class ParticipantContentCarouselPageComponent implements OnInit, AfterContentInit {

  @ViewChild(StepperComponent) stepper: StepperComponent;

  ContentType: typeof ContentType = ContentType;

  contents: Content[] = [];
  contentGroup: ContentGroup;
  contentGroupName: string;
  shortId: string;
  isLoading = true;
  alreadySent = new Map<number, boolean>();
  status = {
    LAST_CONTENT: 'LAST_CONTENT',
    FIRST_UNANSWERED: 'FIRST_UNANSWERED',
    NORMAL: 'NORMAL',
    PRE_START: 'PRE_START'
  };
  started: string;

  constructor(
    private contentService: ContentService,
    protected translateService: TranslateService,
    protected roomService: RoomService,
    protected route: ActivatedRoute,
    private announceService: AnnounceService,
    private globalStorageService: GlobalStorageService,
    private location: Location
  ) {
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit1) === true) {
      document.getElementById('step').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Escape) === true) {
      this.announce('answer.a11y-shortcuts');
    }
  }

  ngAfterContentInit() {
    setTimeout(() => {
      document.getElementById('live-announcer-button').focus();
    }, 700);
  }


  ngOnInit() {
    this.translateService.use(this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE));
    let lastContentIndex: number;
    this.route.params.subscribe(params => {
      this.contentGroupName = params['contentGroup'];
      this.shortId = params['shortId'];
      lastContentIndex = params['contentIndex'] - 1;
      this.roomService.getGroupByRoomIdAndName('~' + this.shortId, this.contentGroupName).subscribe(contentGroup => {
        this.contentGroup = contentGroup;
        this.contentService.getContentsByIds(this.contentGroup.contentIds).subscribe(contents => {
          for (const content of contents) {
            if (content.state.visible) {
              this.contents.push(content);
            }
          }
          this.checkIfLastContentExists(lastContentIndex);
          this.isLoading = false;
        });
      });
    });
  }

  announce(key: string) {
    this.announceService.announce(key);
  }

  checkIfLastContentExists(contentIndex: number) {
    if (contentIndex) {
      this.started = this.status.LAST_CONTENT;
      setTimeout(() => {
        this.initStepper(contentIndex);
      }, 100);
    } else {
      this.started = this.status.PRE_START;
    }
  }

  initStepper(index: number) {
    this.stepper.init(index, this.contents.length);
  }

  allStatusChecked(): boolean {
    return this.alreadySent.size === this.contents.length;
  }

  updateURL(index: number) {
    this.location.replaceState(`participant/room/${this.shortId}/group/${this.contentGroup.name}/${index + 1}`);
  }

  receiveSentStatus($event, index: number) {
    this.alreadySent.set(index, $event);
    if (this.started === this.status.PRE_START) {
      if (this.allStatusChecked()) {
        for (let i = 0; i < this.alreadySent.size; i++) {
          if (this.alreadySent.get(i) === false) {
            this.initStepper(i);
            this.started = this.status.NORMAL;
            break;
          }
        }
      }
    } else if (this.started === this.status.NORMAL) {
      if (index < this.contents.length - 1) {
        let wait = 200;
        if (this.contents[index].state.responsesVisible) {
          wait += 600;
        }
        setTimeout(() => {
          this.stepper.next();
          setTimeout(() => {
            document.getElementById('step').focus();
          }, 200);
        }, wait);
      } else {
        this.announce('answer.a11y-last-content');
      }
    } else {
      if (this.allStatusChecked()) {
        this.started = this.status.NORMAL;
      }
    }
  }
}
