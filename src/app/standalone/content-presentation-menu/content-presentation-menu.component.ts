import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatMenu } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { CoreModule } from '@app/core/core.module';
import { Content } from '@app/core/models/content';
import { PublishingMode } from '@app/core/models/content-group';
import { ContentType } from '@app/core/models/content-type.enum';
import { RoundState } from '@app/core/models/events/round-state';
import { ContentService } from '@app/core/services/http/content.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { Subject, of, takeUntil } from 'rxjs';

@Component({
  selector: 'app-content-presentation-menu',
  imports: [CoreModule, RouterLink],
  templateUrl: './content-presentation-menu.component.html',
})
export class ContentPresentationMenuComponent
  implements AfterViewInit, OnChanges, OnDestroy, OnInit
{
  @ViewChild('moreMenu') moreMenu!: MatMenu;

  @Input({ required: true }) content!: Content;
  @Input({ required: true }) groupName!: string;
  @Input({ required: true }) shortId!: string;
  @Input({ required: true }) contentIndex!: number;
  @Input() editingEnabled = true;
  @Input() settingsEnabled = true;
  @Input() publishingMode?: PublishingMode;
  @Output() menuLoaded = new EventEmitter<void>();

  destroyed$ = new Subject<void>();

  multipleRounds = false;
  contentRounds = new Map<string, number>();
  rounds = ['1', '2', '1 & 2'];
  ContentType: typeof ContentType = ContentType;

  rotateWordcloudItems?: boolean;
  isLive = false;
  isFinished = true;

  constructor(
    private contentService: ContentService,
    private dialogService: DialogService,
    private presentationService: PresentationService
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.menuLoaded.emit();
    });
  }

  ngOnChanges() {
    this.isLive = this.publishingMode === PublishingMode.LIVE;
  }

  ngOnInit(): void {
    this.checkIfFinished();
    this.contentService
      .getAnswersDeleted()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((contentId) => {
        if (contentId === this.content?.id) {
          this.content.state.round = 1;
          this.changeRound(0);
          this.multipleRounds = false;
        }
      });
    this.contentService
      .getRoundStarted()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((content) => {
        this.afterRoundStarted(content);
      });
    this.presentationService
      .getMultipleRoundState()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (multipleRounds) => (this.multipleRounds = multipleRounds || false)
      );
    this.presentationService.getContentState().subscribe((state) => {
      if (state?.content) {
        this.content = state.content;
        this.contentRounds.set(this.content.id, this.content.state.round - 1);
      }
    });
    this.presentationService
      .getWordcloudVisualizationChanged()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((rotateWordcloudItems) => {
        this.rotateWordcloudItems = rotateWordcloudItems;
      });
    this.presentationService.getCountdownChanged().subscribe((content) => {
      this.content = content;
      this.checkIfFinished();
    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private checkIfFinished() {
    const endTime = this.content.state.answeringEndTime;
    this.isFinished = !!endTime && new Date() > new Date(endTime);
  }

  hasFormatAnswer(format: ContentType): boolean {
    return ![ContentType.SLIDE, ContentType.FLASHCARD].includes(format);
  }

  hasFormatRounds(format: ContentType): boolean {
    return this.contentService.hasFormatRounds(format);
  }

  hasFormatCloudVisualization(): boolean {
    return this.content.format === ContentType.WORDCLOUD;
  }

  editContent() {
    if (!this.content || !this.groupName) {
      return;
    }
    this.contentService.goToEdit(this.content.id, this.shortId, this.groupName);
  }

  deleteContentAnswers() {
    if (this.content) {
      this.dialogService.openDeleteDialog(
        'content-answers',
        'creator.dialog.really-delete-answers',
        undefined,
        undefined,
        () =>
          this.content
            ? this.contentService.deleteAnswersOfContent(
                this.content.id,
                this.content.roomId
              )
            : of()
      );
    }
  }

  changeRound(round: number) {
    this.contentRounds.set(this.content.id, round);
    const roundState = new RoundState(this.contentIndex, round);
    this.presentationService.updateRoundState(roundState);
  }

  afterRoundStarted(content: Content) {
    this.content = content;
    this.changeRound(this.content.state.round - 1);
    this.multipleRounds = true;
  }

  startNewRound() {
    if (!this.content) {
      return;
    }
    this.contentService.startNewRound(this.content);
  }

  changeWordcloudVisualization() {
    this.rotateWordcloudItems = !this.rotateWordcloudItems;
    this.presentationService.updateWordcloudVisualization(
      this.rotateWordcloudItems
    );
  }
}
