import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-content-step-info',
  imports: [CoreModule, TranslocoModule],
  templateUrl: './content-step-info.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './content-step-info.component.scss',
})
export class ContentStepInfoComponent {
  @Input({ required: true }) current!: number;
  @Input({ required: true }) totalCount!: number;
}
