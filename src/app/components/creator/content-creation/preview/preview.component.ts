import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Content } from '../../../../models/content';
import { ContentType } from '../../../../models/content-type.enum';
import { ContentChoice } from '../../../../models/content-choice';
import { MarkdownFeatureset } from '../../../../services/http/formatting.service';
import { AnswerOption } from '../../../../models/answer-option';
import { ContentAnswerService } from '../../../../services/http/content-answer.service';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit {

  @Input() content: Content;
  @Input() isEditMode: boolean;
  @Output() flipEvent = new EventEmitter<boolean>();

  body: string;
  answerOptions: AnswerOption[];
  multipleAnswers: boolean;
  isLoading = true;
  markdownFeatureset: MarkdownFeatureset;
  attachmentData: any;

  constructor(private answerService: ContentAnswerService) { }

  ngOnInit(): void {
    const format = this.content.format;
    if ([ContentType.CHOICE, ContentType.SCALE, ContentType.BINARY, ContentType.SORT].indexOf(format) > -1) {
      const options = (this.content as ContentChoice).options;
      this.answerOptions = format === ContentType.SORT ? this.answerService.shuffleAnswerOptions(options) : options;
      this.multipleAnswers = (this.content as ContentChoice).multiple;
    }
    this.markdownFeatureset = [ContentType.SLIDE, ContentType.FLASHCARD].indexOf(format) > -1 ? MarkdownFeatureset.EXTENDED
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
      useTempAttachments: true
    };
  }
}
