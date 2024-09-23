import { Component, Input } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-menu-item-details',
  standalone: true,
  imports: [FlexLayoutModule, TranslocoPipe],
  templateUrl: './menu-item-details.component.html',
  styleUrl: './menu-item-details.component.scss',
})
export class MenuItemDetailsComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) description!: string;
}
