import {
  Component,
  ChangeDetectionStrategy,
  input,
  model,
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
  answer = model<string>('');
  /** Unset leaves the field neutral, for formats that are not scored. */
  correct = input<boolean | undefined>(undefined);
  disabled = input(false);
  lengthLimit = input(1000);
  minRows = input(3);
}
