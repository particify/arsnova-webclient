import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-create-answer-option',
  templateUrl: './create-answer-option.component.html',
  styleUrls: ['./create-answer-option.component.scss'],
})
export class CreateAnswerOptionComponent implements OnInit {
  @ViewChild('answerInput') answerInput: ElementRef;
  @Input() resetEvent: EventEmitter<boolean>;
  @Input() disabled: boolean;
  @Output() answerCreated: EventEmitter<string> = new EventEmitter<string>();
  newAnswer = '';

  ngOnInit(): void {
    this.resetEvent.subscribe(() => {
      this.newAnswer = '';
      this.answerInput.nativeElement.focus();
    });
  }

  createAnswer() {
    this.answerCreated.emit(this.newAnswer);
  }
}
