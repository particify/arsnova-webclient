import { AfterContentInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ContentType } from '../../../models/content-type.enum';
import { ContentService } from '../../../services/http/content.service';
import { Content } from '../../../models/content';
import { ContentGroup } from '../../../models/content-group';
import { TranslateService } from '@ngx-translate/core';
import { StepperComponent } from '../stepper/stepper.component';
import { ActivatedRoute } from '@angular/router';
import { RoomService } from '../../../services/http/room.service';
import { KeyboardUtils } from '../../../utils/keyboard';
import { KeyboardKey } from '../../../utils/keyboard/keys';
import { GlobalStorageService, LocalStorageKey } from '../../../services/util/global-storage.service';
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
  startIndex = 0;
  started = false;

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
          this.isLoading = false;
        });
      });
    });
  }

  announce(key: string) {
    this.announceService.announce(key);
  }

  receiveSentStatus($event, index: number) {
    this.alreadySent.set(index, $event);
    if (!this.started) {
      if (this.alreadySent.size === this.contents.length) {
        for (let i = 0; i < this.alreadySent.size; i++) {
          if (this.alreadySent.get(i) === false) {
            this.startIndex = i;
            this.stepper.onClick(this.startIndex);
            if (this.startIndex > 2) {
              const diff = this.startIndex < (this.contents.length - 3) ? 2 : 5 - ((this.contents.length - 1) - this.startIndex);
              this.stepper.headerPos = this.startIndex - diff;
              this.stepper.moveHeaderRight();
            }
            this.started = true;
            break;
          }
        }
      }
    } else {
      if (index < this.contents.length - 1) {
        setTimeout(() => {
          this.stepper.next();
          setTimeout(() => {
            document.getElementById('step').focus();
          }, 200);
        }, 500);
      } else {
        this.announce('answer.a11y-last-content');
      }
    }
  }
}
