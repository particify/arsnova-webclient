import { Component, Input } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-count',
  imports: [FlexLayoutModule, TranslocoPipe],
  templateUrl: './count.component.html',
  styleUrl: './count.component.scss',
})
export class CountComponent {
  @Input({ required: true }) count!: number;
  @Input({ required: true }) label!: string;
}
