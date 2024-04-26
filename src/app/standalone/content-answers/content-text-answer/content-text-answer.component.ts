import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CoreModule } from '@app/core/core.module';

@Component({
  selector: 'app-content-text-answer',
  standalone: true,
  imports: [CoreModule],
  templateUrl: './content-text-answer.component.html',
  styleUrls: ['./content-text-answer.component.scss'],
})
export class ContentTextAnswerComponent {
  @Output() inputEvent: EventEmitter<string> = new EventEmitter();
  @Input() disabled = false;
}
