import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  inject,
  ChangeDetectionStrategy,
  afterNextRender,
} from '@angular/core';
import { MatMenu } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { CoreModule } from '@app/core/core.module';
import { ContentService } from '@app/core/services/http/content.service';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { Content, ContentType } from '@gql/generated/graphql';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-content-presentation-menu',
  imports: [CoreModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './content-presentation-menu.component.html',
})
export class ContentPresentationMenuComponent {
  private contentService = inject(ContentService);
  private presentationService = inject(PresentationService);

  @ViewChild('moreMenu') moreMenu!: MatMenu;

  @Input({ required: true }) content!: Content;
  @Input({ required: true }) groupName!: string;
  @Input({ required: true }) shortId!: string;
  @Input({ required: true }) contentIndex!: number;
  @Input() editingEnabled = true;
  @Input() settingsEnabled = true;
  @Output() menuLoaded = new EventEmitter<void>();

  destroyed$ = new Subject<void>();

  multipleRounds = false;
  contentRounds = new Map<string, number>();
  rounds = ['1', '2', '1 & 2'];
  ContentType: typeof ContentType = ContentType;

  rotateWordcloudItems?: boolean;
  isLive = false;
  isFinished = true;

  constructor() {
    this.presentationService
      .getWordcloudVisualizationChanged()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((rotateWordcloudItems) => {
        this.rotateWordcloudItems = rotateWordcloudItems;
      });
    afterNextRender(() => {
      this.menuLoaded.emit();
    });
  }

  hasFormatAnswer(format: ContentType): boolean {
    return ![ContentType.Slide, ContentType.Flashcard].includes(format);
  }

  hasFormatRounds(format: ContentType): boolean {
    return this.contentService.hasFormatRounds(format);
  }

  hasFormatCloudVisualization(): boolean {
    return this.content.formatData.format === ContentType.Wordcloud;
  }

  editContent() {
    if (!this.content || !this.groupName) {
      return;
    }
    this.contentService.goToEdit(this.content.id, this.shortId, this.groupName);
  }

  deleteContentAnswers() {
    // TODO: Delete content answers
  }

  changeRound() {
    // TODO: Change round
  }

  afterRoundStarted(content: Content) {
    this.content = content;
    this.multipleRounds = true;
  }

  startNewRound() {
    // TODO: Start new round
  }

  changeWordcloudVisualization() {
    this.rotateWordcloudItems = !this.rotateWordcloudItems;
    this.presentationService.updateWordcloudVisualization(
      this.rotateWordcloudItems
    );
  }
}
