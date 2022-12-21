import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-create-answer-option',
  templateUrl: './create-answer-option.component.html',
  styleUrls: ['./create-answer-option.component.scss'],
})
export class CreateAnswerOptionComponent implements OnInit {
  @Input() resetEvent: EventEmitter<boolean>;
  @Output() answerCreated: EventEmitter<string> = new EventEmitter<string>();
  newAnswer = '';

  ngOnInit(): void {
    this.resetEvent.subscribe(() => {
      this.newAnswer = '';
    });
  }

  createAnswer() {
    this.answerCreated.emit(this.newAnswer);
  }
}
