import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Content } from '../../../../models/content';
import { ContentType } from '../../../../models/content-type.enum';
import { ContentChoice } from '../../../../models/content-choice';
import { FormattingService, MarkdownFeatureset } from '../../../../services/http/formatting.service';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit {

  @Input() content: Content;
  @Output() flipEvent = new EventEmitter<boolean>();

  body: string;
  answerLabels: string[];
  multipleAnswers: boolean;
  isLoading = true;
  markdownFeatureset: MarkdownFeatureset;
  attachmentData: any;

  constructor(private formattingService: FormattingService) { }

  ngOnInit(): void {
    const format = this.content.format;
    if (format === ContentType.CHOICE || format === ContentType.SCALE || format === ContentType.BINARY) {
      this.answerLabels = (this.content as ContentChoice).options.map(option => {
        return option.label;
      });
      this.multipleAnswers = (this.content as ContentChoice).multiple;
    }
    this.markdownFeatureset = format === ContentType.SLIDE ? MarkdownFeatureset.EXTENDED : MarkdownFeatureset.SIMPLE;
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
      'refType': 'content',
      'detailedView': false,
      'useTempAttachments': true
    };
  }

}
