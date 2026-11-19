import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CoreModule } from '@app/core/core.module';

@Component({
  selector: 'app-content-text-answer',
  imports: [CoreModule],
  templateUrl: './content-text-answer.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./content-text-answer.component.scss'],
})
export class ContentTextAnswerComponent {
  @Output() inputEvent: EventEmitter<string> = new EventEmitter();
  @Input() disabled = false;
  @Input() givenAnswer?: string;
  @Input() correct?: boolean;
  @Input() minRows = 3;
  @Input() lengthLimit = 1000;
}
