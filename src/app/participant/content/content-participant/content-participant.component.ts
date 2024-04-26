import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ContentType } from '@app/core/models/content-type.enum';
import { Answer } from '@app/core/models/answer';
import { Content } from '@app/core/models/content';
import { ContentChoice } from '@app/core/models/content-choice';
import { TextAnswer } from '@app/core/models/text-answer';
import { ChoiceAnswer } from '@app/core/models/choice-answer';
import { MarkdownFeatureset } from '@app/core/services/http/formatting.service';
import { MultipleTextsAnswer } from '@app/core/models/multiple-texts-answer';
import { HotkeyAction } from '@app/core/directives/hotkey.directive';
import { PrioritizationAnswer } from '@app/core/models/prioritization-answer';
import { ContentPrioritization } from '@app/core/models/content-prioritization';
import { ContentFlashcard } from '@app/core/models/content-flashcard';
import { ContentScale } from '@app/core/models/content-scale';
import { ContentWordcloud } from '@app/core/models/content-wordcloud';
import { FormComponent } from '@app/standalone/form/form.component';
import { FormService } from '@app/core/services/util/form.service';
import { ContentNumeric } from '@app/core/models/content-numeric';
import { NumericAnswer } from '@app/core/models/numeric-answer';
import { EventService } from '@app/core/services/util/event.service';
import { EntityChangeNotification } from '@app/core/models/events/entity-change-notification';
import { takeUntil } from 'rxjs';
import { ContentService } from '@app/core/services/http/content.service';
import { TranslocoService } from '@ngneat/transloco';
import { NotificationService } from '@app/core/services/util/notification.service';
import { RoomUserAlias } from '@app/core/models/room-user-alias';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

interface ContentActionTab {
  route: string;
  label: string;
  hotkey: string;
  icon: string;
}

@Component({
  selector: 'app-content-participant',
  templateUrl: './content-participant.component.html',
  styleUrls: ['./content-participant.component.scss'],
})
export class ContentParticipantComponent
  extends FormComponent
  implements OnInit, OnChanges
{
  @Input({ required: true }) content!: Content;
  @Input({ required: true }) contentGroupContentIds!: string[];
  @Input() answer?: Answer;
  @Input() lastContent = false;
  @Input() active = false;
  @Input({ required: true }) index!: number;
  @Input() statsPublished = false;
  @Input() correctOptionsPublished = false;
  @Input() attribution?: string;
  @Input() quizMode = false;
  @Input() alias?: RoomUserAlias;
  @Output() answerChanged = new EventEmitter<Answer>();
  @Output() next = new EventEmitter<void>();
  @Output() answerReset = new EventEmitter<string>();

  sendEvent = new EventEmitter<string>();
  isLoading = true;
  ContentType: typeof ContentType = ContentType;
  hasAbstained = false;
  answersString = '';
  extensionData: any;
  alreadySent = false;
  isMultiple = false;
  flashcardMarkdownFeatures = MarkdownFeatureset.EXTENDED;
  HotkeyAction = HotkeyAction;
  a11yMsg?: string;

  // TODO: non-null assertion operator is used here temporaly. We need to make this component generic with a future refactoring.
  choiceContent!: ContentChoice;
  prioritizationContent!: ContentPrioritization;
  flashcardContent!: ContentFlashcard;
  scaleContent!: ContentScale;
  wordloudContent!: ContentWordcloud;
  numericContent!: ContentNumeric;

  choiceAnswer!: ChoiceAnswer;
  prioritizationAnswer!: PrioritizationAnswer;
  wordcloudAnswer!: MultipleTextsAnswer;
  textAnswer!: TextAnswer;
  numericAnswer!: NumericAnswer;

  selectedRoute = '';
  endDate?: Date;
  answeringLocked = false;

  tabs: ContentActionTab[] = [
    {
      route: '',
      label: 'participant.answer.answering',
      hotkey: '1',
      icon: 'edit',
    },
    {
      route: 'results',
      label: 'participant.answer.results',
      hotkey: '2',
      icon: 'insert_chart',
    },
    {
      route: 'leaderboard',
      label: 'content.leaderboard',
      hotkey: '3',
      icon: 'emoji_events',
    },
  ];

  constructor(
    protected formService: FormService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private eventService: EventService,
    private contentService: ContentService,
    private translateService: TranslocoService,
    private notificationService: NotificationService
  ) {
    super(formService);
  }

  ngOnInit(): void {
    if (this.active) {
      this.selectedRoute = this.route.snapshot.params['action'] || '';
    }
    this.setExtensionData(this.content.roomId, this.content.id);
    if (this.answer) {
      this.alreadySent = true;
      this.checkIfAbstention(this.answer);
      this.initAnswerData();
    }
    this.initContentData();
    this.isMultiple = (this.content as ContentChoice).multiple;
    this.a11yMsg = this.getA11yMessage();
    if (this.quizMode) {
      if (this.content.state.answeringEndTime) {
        const now = new Date();
        if (
          now.getTime() >
          new Date(this.content.state.answeringEndTime).getTime()
        ) {
          this.answeringLocked = true;
        } else {
          this.startCountdown(this.content.state.answeringEndTime);
        }
      }
    }
    this.isLoading = false;
    this.eventService
      .on<EntityChangeNotification>('EntityChangeNotification')
      .pipe(takeUntil(this.destroyed$))
      .subscribe((notification) => {
        if (notification.payload.id === this.content.id) {
          this.reloadContent();
        }
      });
  }

  reloadContent() {
    this.isLoading = true;
    this.contentService
      .getContent(this.content.roomId, this.content.id, false)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((content) => {
        const newState = content.state;
        if (this.content.state.round !== newState.round) {
          this.content.state = newState;
          this.answerReset.emit(content.id);
          const msg = this.translateService.translate(
            content.state.round === 1
              ? 'participant.content.answers-reset'
              : 'participant.content.new-round-started'
          );
          this.notificationService.show(msg);
        } else if (
          !this.content.state.answeringEndTime &&
          newState.answeringEndTime
        ) {
          this.startCountdown(newState.answeringEndTime);
        }
        this.content.state = newState;
        this.showTab('');
        this.isLoading = false;
      });
  }

  private startCountdown(endDate: Date): void {
    if (this.active) {
      this.endDate = new Date(endDate);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.active &&
      changes.active.previousValue !== undefined &&
      changes.active.currentValue &&
      !changes.active.previousValue
    ) {
      this.updateTab(this.selectedRoute);
    }
  }

  initAnswerData() {
    if (
      [ContentType.CHOICE, ContentType.BINARY, ContentType.SORT].includes(
        this.content.format
      )
    ) {
      this.initChoiceAnswerData();
    } else if (this.content.format === ContentType.WORDCLOUD) {
      this.initWordcloudAnswerData();
    } else if (this.content.format === ContentType.TEXT) {
      this.textAnswer = this.answer as TextAnswer;
      this.answersString = (this.answer as TextAnswer).body || '';
    } else if (this.content.format === ContentType.PRIORITIZATION) {
      this.prioritizationAnswer = this.answer as PrioritizationAnswer;
    } else if (this.content.format === ContentType.SCALE) {
      this.choiceAnswer = this.answer as ChoiceAnswer;
    } else if (this.content.format === ContentType.NUMERIC) {
      this.numericAnswer = this.answer as NumericAnswer;
    }
  }

  initChoiceAnswerData() {
    this.choiceAnswer = this.answer as ChoiceAnswer;
    for (const option of (this.answer as ChoiceAnswer).selectedChoiceIndexes ??
      []) {
      this.answersString = this.answersString.concat(
        (this.content as ContentChoice).options[option].label + ','
      );
    }
  }

  initWordcloudAnswerData() {
    this.wordcloudAnswer = this.answer as MultipleTextsAnswer;
    for (const text of (this.answer as MultipleTextsAnswer).texts ?? []) {
      this.answersString = this.answersString.concat(text + ',');
    }
  }

  initContentData() {
    if (
      [ContentType.CHOICE, ContentType.BINARY, ContentType.SORT].includes(
        this.content.format
      )
    ) {
      this.choiceContent = this.content as ContentChoice;
    } else if (this.content.format === ContentType.WORDCLOUD) {
      this.wordloudContent = this.content as ContentWordcloud;
    } else if (this.content.format === ContentType.PRIORITIZATION) {
      this.prioritizationContent = this.content as ContentPrioritization;
    } else if (this.content.format === ContentType.SCALE) {
      this.scaleContent = this.content as ContentScale;
    } else if (this.content.format === ContentType.FLASHCARD) {
      this.flashcardContent = this.content as ContentFlashcard;
    } else if (this.content.format === ContentType.NUMERIC) {
      this.numericContent = this.content as ContentNumeric;
    }
  }

  setExtensionData(roomId: string, refId: string) {
    this.extensionData = {
      roomId: roomId,
      refType: 'content',
      refId: refId,
      detailedView: false,
    };
  }

  checkIfAbstention(answer: Answer) {
    if (answer.format === ContentType.TEXT) {
      this.hasAbstained = !(answer as TextAnswer).body;
    } else if (answer.format === ContentType.WORDCLOUD) {
      this.hasAbstained = !((answer as MultipleTextsAnswer).texts?.length > 0);
    } else if (answer.format === ContentType.PRIORITIZATION) {
      this.hasAbstained = !(answer as PrioritizationAnswer).assignedPoints;
    } else if (answer.format === ContentType.NUMERIC) {
      this.hasAbstained = !(answer as NumericAnswer).selectedNumber;
    } else {
      this.hasAbstained = !(answer as ChoiceAnswer).selectedChoiceIndexes;
    }
  }

  submitAnswerEvent($event: MouseEvent, type: string) {
    $event.preventDefault();
    this.sendEvent.emit(type);
  }

  forwardAnswerMessage($event: Answer) {
    this.answerChanged.emit($event);
    setTimeout(() => {
      this.answer = $event;
      this.enableForm();
      this.initAnswerData();
      this.checkIfAbstention($event);
      this.alreadySent = true;
    }, 100);
  }

  showTab(route: string): boolean {
    switch (route) {
      case '':
        return (
          this.statsPublished ||
          this.content.format === ContentType.FLASHCARD ||
          this.quizMode
        );
      case 'results':
        return (
          this.statsPublished ||
          this.content.format === ContentType.FLASHCARD ||
          this.quizMode
        );
      case 'leaderboard':
        return this.quizMode && this.content.format !== ContentType.FLASHCARD;
      default:
        return false;
    }
  }

  updateTab(route: string): void {
    this.selectedRoute = route;
    const urlList = [
      'p',
      this.route.snapshot.params['shortId'],
      'series',
      this.route.snapshot.params['seriesName'],
      this.index + 1,
    ];
    if (this.selectedRoute) {
      urlList.push(this.selectedRoute);
    }
    const urlTree = this.router.createUrlTree(urlList);
    this.location.replaceState(this.router.serializeUrl(urlTree));
  }

  getA11yMessage(): string {
    let msg = 'participant.answer.a11y-';
    if (this.alreadySent) {
      msg += 'already-answered';
    } else {
      msg += 'current-';
      let format: string;
      if (this.content.format !== ContentType.CHOICE) {
        format = this.content.format.toLowerCase();
      } else {
        format = (this.content as ContentChoice).multiple
          ? 'multiple'
          : 'single';
      }
      msg += format;
    }
    return msg;
  }

  showWaitingArea(): boolean {
    return (
      !this.isLoading &&
      !this.answer &&
      !!this.content.duration &&
      !this.endDate &&
      !this.content.state.answeringEndTime
    );
  }

  getIndexInContentGroup(): number {
    return this.contentGroupContentIds.indexOf(this.content.id);
  }
}
