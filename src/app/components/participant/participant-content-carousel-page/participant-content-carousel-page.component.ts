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
import { ContentAnswerService } from '../../../services/http/content-answer.service';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { Answer } from '../../../models/answer';
import { RoutingService } from '../../../services/util/routing.service';
import { AdvancedSnackBarTypes, NotificationService } from '../../../services/util/notification.service';
import { ContentGroupService } from '../../../services/http/content-group.service';

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
  answers: Answer[] = [];
  currentStep = 0;

  constructor(
    private contentService: ContentService,
    protected translateService: TranslateService,
    protected roomService: RoomService,
    private contentgroupService: ContentGroupService,
    protected route: ActivatedRoute,
    private announceService: AnnounceService,
    private globalStorageService: GlobalStorageService,
    private location: Location,
    private answerService: ContentAnswerService,
    private authenticationService: AuthenticationService,
    private routingService: RoutingService,
    private notificationService: NotificationService
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
      let userId;
      this.authenticationService.getCurrentAuthentication()
        .subscribe(auth => userId = auth.userId);
      this.contentgroupService.getByRoomIdAndName('~' + this.shortId, this.contentGroupName).subscribe(contentGroup => {
        this.contentGroup = contentGroup;
        this.contentService.getContentsByIds(this.contentGroup.roomId, this.contentGroup.contentIds).subscribe(contents => {
          this.contents = this.contentService.getSupportedContents(contents); // TODO: Removed filter for testing
          this.answerService.getAnswersByUserIdContentIds(contentGroup.roomId, userId, this.contents.map(c => c.id)).subscribe(answers => {
            let answersAdded = 0;
            for (const [index, content] of this.contents.entries()) {
              if (answersAdded < answers.length) {
                for (const answer of answers) {
                  if (content.id === answer.contentId) {
                    this.answers[index] = answer;
                    answersAdded++;
                  }
                }
              }
              this.alreadySent.set(index, !!this.answers[index]);
            }
            this.isLoading = false;
            this.checkIfLastContentExists(lastContentIndex);
            this.getFirstUnansweredContent();
          });
        });
      },
        error => {
        this.isLoading = false;
        const msg = this.translateService.instant('answer.group-not-available');
        this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
        });
    });
  }

  announce(key: string) {
    this.announceService.announce(key);
  }

  checkIfLastContentExists(contentIndex: number) {
    if (contentIndex >= 0) {
      this.initStepper(contentIndex);
    } else {
      this.started = this.status.PRE_START;
    }
  }

  initStepper(index: number) {
    setTimeout(() => {
      this.currentStep = index;
      this.stepper.init(index, this.contents.length);
    }, 200);
    this.started = this.status.NORMAL;
  }

  updateURL(index: number) {
    this.currentStep = index;
    this.location.replaceState(`participant/room/${this.shortId}/group/${this.contentGroup.name}/${index + 1}`);
  }

  getFirstUnansweredContent() {
    if (this.started === this.status.PRE_START) {
      for (let i = 0; i < this.alreadySent.size; i++) {
        if (this.alreadySent.get(i) === false) {
          this.initStepper(i);
          break;
        }
      }
    }
  }

  nextContent(finish?: boolean) {
    if (!finish) {
      this.stepper.next();
    } else {
      this.stepper.headerPos = 0;
      this.stepper.onClick(0);
    }
  }

  receiveSentStatus(answer: Answer, index: number) {
    this.alreadySent.set(index, !!answer);
    this.answers[this.contents.map(c => c.id).indexOf(answer.contentId)] = answer;
    if (this.started === this.status.NORMAL) {
      if (index < this.contents.length - 1) {
        let wait = 400;
        if (this.contents[index].state.answersPublished) {
          wait += 600;
        }
        setTimeout(() => {
          this.nextContent();
          setTimeout(() => {
            document.getElementById('step').focus();
          }, 200);
        }, wait);
      } else {
        this.announce('answer.a11y-last-content');
      }
    }
  }
}
