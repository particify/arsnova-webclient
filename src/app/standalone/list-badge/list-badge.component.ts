import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';

@Component({
  imports: [FlexModule],
  selector: 'app-list-badge',
  templateUrl: './list-badge.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./list-badge.component.scss'],
})
export class ListBadgeComponent {
  @Input({ required: true }) count!: number;
}
