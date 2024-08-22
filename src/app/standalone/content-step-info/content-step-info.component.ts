import { Component, Input } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-content-step-info',
  standalone: true,
  imports: [CoreModule, TranslocoModule],
  templateUrl: './content-step-info.component.html',
  styleUrl: './content-step-info.component.scss',
})
export class ContentStepInfoComponent {
  @Input({ required: true }) current!: number;
  @Input({ required: true }) totalCount!: number;
}
