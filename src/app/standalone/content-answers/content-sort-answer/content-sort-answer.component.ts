import { DragDropModule } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { AnswerOption } from '@app/core/models/answer-option';
import { DragDropBaseComponent } from '@app/shared/drag-drop-base/drag-drop-base.component';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
@Component({
  selector: 'app-content-sort-answer',
  standalone: true,
  imports: [CoreModule, DragDropModule, RenderedTextComponent],
  templateUrl: './content-sort-answer.component.html',
  styleUrls: ['./content-sort-answer.component.scss'],
})
export class ContentSortAnswerComponent
  extends DragDropBaseComponent
  implements OnInit
{
  @Input() answerOptions: AnswerOption[];
  @Input() disabled: boolean;
  @Input() dynamicRendering: boolean;

  constructor() {
    super();
  }
  ngOnInit(): void {
    this.dragDroplist = this.answerOptions;
  }
}
