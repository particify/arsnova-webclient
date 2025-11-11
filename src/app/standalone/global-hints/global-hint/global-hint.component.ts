import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { GlobalHint } from '@app/standalone/global-hints/global-hint';
import { GlobalHintsService } from '@app/standalone/global-hints/global-hints.service';
import { CoreModule } from '@app/core/core.module';

@Component({
  selector: 'app-global-hint',
  templateUrl: './global-hint.component.html',
  styleUrls: ['./global-hint.component.scss'],
  imports: [CoreModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalHintComponent {
  hint = input.required<GlobalHint>();
  private hintsService = inject(GlobalHintsService);

  doAction() {
    const action = this.hint().action;
    if (action) {
      action();
    }
  }

  dismiss() {
    this.hintsService.removeHint(this.hint().id);
  }
}
