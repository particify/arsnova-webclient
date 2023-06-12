import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Content } from '@app/core/models/content';
import { ContentType } from '@app/core/models/content-type.enum';
import { ContentChoice } from '@app/core/models/content-choice';
import { MarkdownFeatureset } from '@app/core/services/http/formatting.service';
import { AnswerOption } from '@app/core/models/answer-option';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { ContentScale } from '@app/core/models/content-scale';
import { LikertScaleService } from '@app/core/services/util/likert-scale.service';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, Observable } from 'rxjs';
import { SelectableAnswer } from '@app/core/models/selectable-answer';
import { ContentWordcloud } from '@app/core/models/content-wordcloud';
import { AnswerWithPoints } from '@app/core/models/answer-with-points';
import { ContentFlashcard } from '@app/core/models/content-flashcard';
import { ContentPrioritization } from '@app/core/models/content-prioritization';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
})
export class PreviewComponent implements OnInit {
  @Input() content: Content;
  @Input() isEditMode: boolean;
  @Output() flipEvent = new EventEmitter<boolean>();

  body: string;
  answerOptions: AnswerOption[];
  answerOptionsWithPoints: AnswerWithPoints[] = [];
  selectableAnswers: SelectableAnswer[] = [];
  multipleAnswers: boolean;
  isLoading = true;
  markdownFeatureset: MarkdownFeatureset;
  attachmentData: any;
  words: string[];
  additionalText: string;
  assignablePoints: number;

  constructor(
    private answerService: ContentAnswerService,
    private likertScaleService: LikertScaleService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    const format = this.content.format;
    if (
      [
        ContentType.CHOICE,
        ContentType.BINARY,
        ContentType.SORT,
        ContentType.PRIORITIZATION,
      ].indexOf(format) > -1
    ) {
      const options = (this.content as ContentChoice).options;
      this.answerOptions =
        format === ContentType.SORT
          ? this.answerService.shuffleAnswerOptions(options)
          : options;
      this.multipleAnswers = (this.content as ContentChoice).multiple;
      if (format === ContentType.PRIORITIZATION) {
        options.forEach((option) => {
          this.answerOptionsWithPoints.push(new AnswerWithPoints(option, 0));
        });
        this.assignablePoints = (
          this.content as ContentPrioritization
        ).assignablePoints;
      }
    } else if (format === ContentType.SCALE) {
      const scaleContent = this.content as ContentScale;
      const optionLabels$ = this.likertScaleService
        .getOptionLabels(scaleContent.optionTemplate, scaleContent.optionCount)
        .map((l) => <Observable<string>>this.translateService.get(l));
      forkJoin(optionLabels$).subscribe(
        (labels) =>
          (this.answerOptions = labels.map((l) => ({
            label: l,
            renderedLabel: l,
          })))
      );
    } else if (format === ContentType.WORDCLOUD) {
      this.words = new Array<string>(
        (this.content as ContentWordcloud).maxAnswers
      ).fill('');
    } else if (format === ContentType.FLASHCARD) {
      this.additionalText = (this.content as ContentFlashcard).additionalText;
    }
    if (this.answerOptions) {
      this.answerOptions.map((o) =>
        this.selectableAnswers.push(new SelectableAnswer(o, false))
      );
    }
    this.markdownFeatureset =
      [ContentType.SLIDE, ContentType.FLASHCARD].indexOf(format) > -1
        ? MarkdownFeatureset.EXTENDED
        : MarkdownFeatureset.SIMPLE;
    this.prepareAttachmentData();
  }

  emitFlipEvent(submit: boolean) {
    this.flipEvent.emit(submit);
  }

  renderingFinished() {
    this.isLoading = false;
  }

  prepareAttachmentData() {
    this.attachmentData = {
      refType: 'content',
      detailedView: false,
      useTempAttachments: true,
    };
  }
}
