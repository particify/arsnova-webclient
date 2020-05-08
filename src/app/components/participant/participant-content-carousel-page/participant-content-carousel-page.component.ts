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
import { GlobalStorageService, LocalStorageKey, MemoryStorageKey } from '../../../services/util/global-storage.service';
import { AnnounceService } from '../../../services/util/announce.service';

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
    private globalStorageService: GlobalStorageService
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
    this.translateService.use(this.globalStorageService.getLocalStorageItem(LocalStorageKey.LANGUAGE));
    this.route.params.subscribe(params => {
      this.contentGroupName = params['contentGroup'];
      this.shortId = params['shortId'];
      this.roomService.getGroupByRoomIdAndName('~' + this.shortId, this.contentGroupName).subscribe(contentGroup => {
        this.contentGroup = contentGroup;
        this.contentService.getContentsByIds(this.contentGroup.contentIds).subscribe(contents => {
          for (const content of contents) {
            if (content.state.visible) {
              this.contents.push(content);
            }
          }
          this.checkIfLastContentExists();
          this.isLoading = false;
        });
      });
    });
  }

  announce(key: string) {
    this.announceService.announce(key);
  }

  checkIfLastContentExists() {
    const lastContentId = this.globalStorageService.getMemoryItem(MemoryStorageKey.LAST_CONTENT);
    if (lastContentId) {
      this.started = this.status.LAST_CONTENT;
      this.globalStorageService.deleteMemoryStorageItem(MemoryStorageKey.LAST_CONTENT);
      const contentIndex = this.contents.map(function (content) { return content.id; } ).indexOf(lastContentId);
      setTimeout(() => {
        this.initStepper(contentIndex);
      }, 100);
    } else {
      this.started = this.status.PRE_START;
    }
  }

  initStepper(index: number) {
    this.stepper.onClick(index);
    if (index > 2) {
      const diff = index < (this.contents.length - 3) ? 2 : 5 - ((this.contents.length - 1) - index);
      this.stepper.headerPos = index - diff;
      this.stepper.moveHeaderRight();
    }
  }

  allStatusChecked(): boolean {
    return this.alreadySent.size === this.contents.length;
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
