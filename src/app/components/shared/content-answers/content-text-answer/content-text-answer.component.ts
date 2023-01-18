import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-content-text-answer',
  templateUrl: './content-text-answer.component.html',
  styleUrls: ['./content-text-answer.component.scss'],
})
export class ContentTextAnswerComponent {
  @Output() inputEvent: EventEmitter<string> = new EventEmitter();
}
