import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Content } from '../../../../models/content';
import { ContentType } from '../../../../models/content-type.enum';
import { ContentChoice } from '../../../../models/content-choice';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit {

  @Input() content: Content;
  @Output() flipEvent = new EventEmitter<boolean>();

  answerLabels: string[];
  multipleAnswers: boolean;

  constructor() { }

  ngOnInit(): void {
    const format = this.content.format;
    if (format === ContentType.CHOICE || format === ContentType.SCALE || format === ContentType.BINARY) {
      this.answerLabels = (this.content as ContentChoice).options.map(option => {
        return option.label;
      });
      this.multipleAnswers = (this.content as ContentChoice).multiple;
    }
  }

  emitFlipEvent(submit: boolean) {
    this.flipEvent.emit(submit);
  }

}
