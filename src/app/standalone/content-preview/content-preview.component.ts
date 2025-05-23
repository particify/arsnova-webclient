import { Component, Input, OnInit, inject } from '@angular/core';
import { Content } from '@app/core/models/content';
import { ContentType } from '@app/core/models/content-type.enum';
import { ContentChoice } from '@app/core/models/content-choice';
import { AnswerOption } from '@app/core/models/answer-option';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { ContentScale } from '@app/core/models/content-scale';
import { LikertScaleService } from '@app/core/services/util/likert-scale.service';
import { TranslocoService, provideTranslocoScope } from '@jsverse/transloco';
import { SelectableAnswer } from '@app/core/models/selectable-answer';
import { ContentWordcloud } from '@app/core/models/content-wordcloud';
import { AnswerWithPoints } from '@app/core/models/answer-with-points';
import { ContentFlashcard } from '@app/core/models/content-flashcard';
import { ContentPrioritization } from '@app/core/models/content-prioritization';
import { CoreModule } from '@app/core/core.module';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { ExtensionPointModule } from '@projects/extension-point/src/public-api';
import { ContentChoiceAnswerComponent } from '@app/standalone/content-answers/content-choice-answer/content-choice-answer.component';
import { ContentPrioritizationAnswerComponent } from '@app/standalone/content-answers/content-prioritization-answer/content-prioritization-answer.component';
import { ContentSortAnswerComponent } from '@app/standalone/content-answers/content-sort-answer/content-sort-answer.component';
import { ContentTextAnswerComponent } from '@app/standalone/content-answers/content-text-answer/content-text-answer.component';
import { ContentWordcloudAnswerComponent } from '@app/standalone/content-answers/content-wordcloud-answer/content-wordcloud-answer.component';
import { ContentNumericAnswerComponent } from '@app/standalone/content-answers/content-numeric-answer/content-numeric-answer.component';
import { ContentNumeric } from '@app/core/models/content-numeric';
import { LanguageContextDirective } from '@app/core/directives/language-context.directive';
import { LanguageDirectionPipe } from '@app/core/pipes/language-direction.pipe';

@Component({
  selector: 'app-content-preview',
  imports: [
    CoreModule,
    RenderedTextComponent,
    ExtensionPointModule,
    ContentChoiceAnswerComponent,
    ContentPrioritizationAnswerComponent,
    ContentSortAnswerComponent,
    ContentTextAnswerComponent,
    ContentWordcloudAnswerComponent,
    ContentNumericAnswerComponent,
    LanguageContextDirective,
    LanguageDirectionPipe,
  ],
  providers: [provideTranslocoScope('creator')],
  templateUrl: './content-preview.component.html',
  styleUrls: ['./content-preview.component.scss'],
})
export class ContentPreviewComponent implements OnInit {
  private answerService = inject(ContentAnswerService);
  private likertScaleService = inject(LikertScaleService);
  private translateService = inject(TranslocoService);

  @Input({ required: true }) content!: Content;
  @Input() renderAnswersDynamically = true;
  @Input() showTitle = true;
  @Input() language?: string;

  answerOptions: AnswerOption[] = [];
  answerOptionsWithPoints: AnswerWithPoints[] = [];
  selectableAnswers: SelectableAnswer[] = [];
  multipleAnswers = false;
  attachmentData: any;
  words: string[] = [];
  additionalText?: string;
  assignablePoints?: number;
  numericContent?: ContentNumeric;

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
      const optionLabels = this.likertScaleService.getOptionLabels(
        scaleContent.optionTemplate,
        scaleContent.optionCount
      );
      if (optionLabels) {
        this.answerOptions = optionLabels.map((l) => ({
          label: l,
          renderedLabel: l,
        }));
        this.setSelectableAnswers();
      }
      return;
    } else if (format === ContentType.WORDCLOUD) {
      this.words = new Array<string>(
        (this.content as ContentWordcloud).maxAnswers
      ).fill('');
    } else if (format === ContentType.FLASHCARD) {
      this.additionalText = (this.content as ContentFlashcard).additionalText;
    } else if (format === ContentType.NUMERIC) {
      this.numericContent = this.content as ContentNumeric;
    }
    this.setSelectableAnswers();
    this.prepareAttachmentData();
  }

  setSelectableAnswers(): void {
    if (this.answerOptions) {
      this.answerOptions.map((o) => {
        this.selectableAnswers.push(new SelectableAnswer(o, false));
      });
    }
  }

  prepareAttachmentData() {
    this.attachmentData = {
      refType: 'content',
      detailedView: false,
      useTempAttachments: true,
    };
  }
}
